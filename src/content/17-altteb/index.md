---
emoji: 🪟
title: 'AltTab macOS 만들기'
date: '2026-09-19'
categories: Dev Swift
---

맥을 쓰다 보면 하루에도 수백 번 누르게 되는 키가 있습니다. 바로 **Command+Tab** 이죠. 저도 손가락이 먼저 기억할 만큼 자주 누르는데, 오래 쓰다 보니 은근히 아쉬운 구석이 하나 보이더라고요.

기본 `Command+Tab` 은 **앱 단위** 로 전환됩니다. 크롬 창을 세 개 띄워 놓고 VSCode도 두 개 열어 둔 채로 일하다 보면 이런 상황이 생겨요. Command+Tab으로 크롬까지는 한 번에 가는데, 정작 제가 보고 싶던 **그 크롬 창** 은 다른 창에 가려서 보이지 않는 겁니다. 그래서 크롬으로 넘어간 다음, 앱 안에서 또 창을 뒤적거리게 되죠.

앱까지는 한 번에 가는데 창은 왜 또 찾아야 할까, 그냥 열려 있는 창 **전부** 를 한 줄로 늘어놓으면 편하지 않을까 하는 생각이 들었습니다. 그래서 결심했어요. **창 하나하나를 넘기는 알트탭을 직접 만들어보자** 고요. 💪

이름은 **AltTeb** 으로 지었습니다. ⌥ Option을 누른 채 Tab을 치면 열린 창이 **전부** 늘어서고, 넘기는 동안 선택한 창을 원래 자리에 겹쳐 보여주는 macOS 앱이에요. Swift 6로 짰고, macOS 14 이상에서 동작합니다. 테스트는 102개까지 붙였어요.

&nbsp;

## 📌 "창 단위 전환"이 뭘까?

핵심 아이디어는 단순합니다. **같은 앱의 창 3개가 목록에도 3개로 나오는 것** 이에요.

기본 Command+Tab이 "앱 → 그 안의 창" 이라는 2단계라면, AltTeb은 "창" 이라는 1단계로 바로 넘어갑니다. 크롬 창 3개, VSCode 창 2개, 터미널 1개가 열려 있으면 목록에 6칸이 그대로 뜨는 거예요.

여기에 몇 가지 기능을 더 붙였습니다.

- 🖼️ **표시 방식 3가지** — 썸네일 격자 · 큰 앱 아이콘 · 아이콘＋제목 목록
- 🔀 **정렬 3가지** — 최근 사용순 · 최근 생성순 · 이름순
- ⌥ **전환 키 선택** — Option · Command · Control 중에 고르기
- 🖥️ **다중 모니터** — 마우스가 있는 화면 또는 활성 창이 있는 화면에 목록을 띄우기

말로 풀면 간단한데, 막상 만들려니 macOS가 순순히 내어주지 않는 것들이 꽤 있었습니다. 하나씩 어떻게 풀었는지 이야기해볼게요.

&nbsp;

## 🛠️ 구현 — macOS를 설득하는 네 가지 기술

### 🪝 1. 모디파이어를 "떼는 순간"을 잡기 — 이벤트 탭

알트탭류 인터랙션의 핵심은 **"Option을 누르고 있는 동안 목록이 떠 있고, 떼는 순간 확정된다"** 는 흐름입니다. 이걸 구현하려면 **모디파이어 키를 떼는 순간** 을 알아야 해요.

처음엔 Carbon의 `RegisterEventHotKey` 를 떠올렸는데, 이 API는 **키 조합이 눌린 시점만** 알려주더라고요. "떼는 순간" 을 잡지 못하니 알트탭 방식 자체가 성립하지 않았어요. 그래서 한 단계 더 내려가 `CGEventTap` 을 썼습니다. 키보드 이벤트 흐름 자체에 탭을 꽂아 가로채는 방식이에요.

```swift
// 마우스 눌림도 받는다. 스위처가 열려 있을 때 바깥을 클릭하면 취소해야 하는데,
// 오버레이 밖에서 일어나는 클릭은 패널이 알 방법이 없다.
let mask: CGEventMask =
    (1 << CGEventType.keyDown.rawValue)
    | (1 << CGEventType.keyUp.rawValue)
    | (1 << CGEventType.flagsChanged.rawValue)   // ✅ 모디파이어 변화 = 떼는 순간
    | (1 << CGEventType.leftMouseDown.rawValue)
    | (1 << CGEventType.rightMouseDown.rawValue)

guard let port = CGEvent.tapCreate(
    tap: .cgSessionEventTap,
    place: .headInsertEventTap,
    // 이벤트를 삼키려면 listenOnly가 아닌 defaultTap이어야 한다.
    options: .defaultTap,
    eventsOfInterest: mask,
    callback: eventTapCallback,
    userInfo: Unmanaged.passUnretained(self).toOpaque()
) else {
    Log.input.error("이벤트 탭 생성 실패 — 손접근성 권한을 확인하세요")
    return false
}
```

포인트는 두 가지예요. 하나는 `flagsChanged` 를 마스크에 넣은 것 — 이게 Option을 떼는 순간을 알려주는 이벤트거든요. 다른 하나는 `options: .defaultTap` 입니다. 이벤트를 **삼키려면**(consume) 반드시 `defaultTap` 이어야 해요. `listenOnly` 로는 엿듣기만 할 뿐 이벤트를 막지 못합니다.

이벤트를 삼켜야 하는 이유가 있어요. 스위처가 처리한 Tab이 그대로 흘러가면 **편집 중인 문서에 탭 문자가 쏙 들어가 버리거든요.** 그래서 스위처가 소비한 Tab은 원래 앱으로 전달하지 않고 삼키도록 했습니다.

```swift
enum Decision {
    case pass      // 이벤트를 원래 대상 앱으로 전달한다.
    case consume   // 이벤트를 삼킨다. 스위처가 처리한 Tab이 편집 중인 문서에 들어가면 안 된다.
}
```

여기서 하나 배운 게 있어요. 이벤트 탭은 **시스템이 알아서 꺼버리기도 한다** 는 점입니다. 탭이 너무 느리거나 사용자 입력이 몰리면 macOS가 조용히 탭을 비활성화해요. 이걸 되살리지 않으면 어느 순간 앱이 말없이 멈춘 것처럼 됩니다.

```swift
// 시스템은 탭이 너무 느리거나 사용자 입력이 몰리면 탭을 꺼버린다.
// 되살리지 않으면 어느 순간 조용히 동작을 멈춘다.
if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
    if let machPort {
        CGEvent.tapEnable(tap: machPort, enable: true)  // ✅ 즉시 재활성화
        Log.input.notice("이벤트 탭이 비활성화되어 재활성화함")
    }
    return .pass
}
```

이 `tapDisabledByTimeout` 처리를 빼먹으면 "잘 되다가 갑자기 안 돼요" 하는 버그가 됩니다. 재현이 잘 안 돼서 한참 헤맬 수 있는 함정이라, 처음부터 챙겨두는 게 좋아요.

&nbsp;

### 📸 2. 가려진 창까지 찍기 — 창 서버 스냅샷

목록에 썸네일을 띄우려면 각 창의 그림이 필요합니다. 요즘 macOS의 정석은 `ScreenCaptureKit` 이에요. 그런데 여기서 한 번 벽을 만났습니다.

`ScreenCaptureKit` 은 `SCShareableContent` **목록에 그 창이 올라와 있어야** 캡처할 수 있어요. 그런데 이 목록에 아예 나타나지 않는 앱들이 있더라고요. 카카오톡이나 Finder 같은 것들이요. 목록에 없으니 캡처 자체가 되지 않았습니다.

재밌는 건, 구식 API인 `CGWindowList` 는 같은 창을 **멀쩡히 알고 있다** 는 거예요. 그래서 목록을 거치지 않고 창 번호 하나로 WindowServer에 직접 그림을 요청하는 경로를 택했습니다. 다만 이건 공개 API가 아니라 비공개 심볼이라, `dlsym` 으로 직접 찾아서 씁니다.

```swift
private typealias CaptureWindowListFunction = @convention(c) (
    UInt32,
    UnsafeMutablePointer<CGWindowID>,
    UInt32,
    UInt32
) -> Unmanaged<CFArray>?

// 비공개 심볼이라 dlsym으로 찾는다. 사라지면 nil을 돌려주고 ScreenCaptureKit으로 되돌아간다.
private static let captureWindowList: CaptureWindowListFunction? = symbol("CGSHWCaptureWindowList")

static func image(of windowID: CGWindowID) -> CGImage? {
    guard let mainConnectionID, let captureWindowList else { return nil }
    var target = windowID
    let options = bestResolution | ignoreGlobalClipShape  // ✅ 가려진 부분까지
    guard let unmanaged = captureWindowList(mainConnectionID(), &target, 1, options) else {
        return nil
    }
    // 이름에 Create/Copy가 없지만 소유권을 넘겨 주는 함수다. 넘겨받지 않으면 샌다.
    let images = unmanaged.takeRetainedValue() as? [CGImage]
    return images?.first
}
```

옵션 두 개가 중요해요. `bestResolution` 은 화면 배율을 그대로 반영합니다 — 이걸 빼면 Retina에서 절반 해상도로 잡혀 썸네일이 흐릿하게 나와요. `ignoreGlobalClipShape` 는 **다른 창에 가려진 부분까지** 담아줍니다. 생각해보면 가려진 창을 보여주는 게 애초에 미리보기의 존재 이유잖아요. 안 가려진 창이라면 눈으로 이미 보이니까요. 🎯

비공개 심볼에 기대는 게 조금 마음에 걸리긴 해서, 안전장치를 하나 뒀어요. 심볼을 못 찾으면 `nil` 을 돌려주고 호출부는 조용히 `ScreenCaptureKit` 으로 되돌아갑니다. 언젠가 이 심볼이 사라지더라도 앱이 통째로 죽지는 않도록요.

&nbsp;

### 🎭 3. 실제 창은 건드리지 않는 오버레이

이 부분이 AltTeb에서 제가 제일 신경 쓴 곳이에요. 넘기는 동안 선택한 창을 **원래 자리에 그대로 겹쳐서** 보여줍니다. 그런데 여기엔 함정이 하나 있어요. 미리보기를 보여준다고 진짜 창을 앞으로 올려버리면 어떻게 될까요?

**최근 사용순(MRU)이 다 헝클어집니다.** 창 열 개를 쭉 훑고 지나가는 동안 열 개를 전부 앞으로 올렸다가, 결국 원래 창으로 돌아오면 순서가 뒤죽박죽이 되죠.

그래서 실제 창은 **절대 건드리지 않기로** 했어요. 그 창을 계속 다시 찍어서, 그림을 원래 자리에 겹쳐 그리는 별도의 오버레이 패널만 띄웁니다. 미리보기는 그냥 그림일 뿐이라, 쭉 훑고 지나가도 창 순서가 그대로 유지돼요.

```swift
/// 선택 중인 창의 미리보기를 맡는다.
///
/// 그 창을 계속 다시 찍어 원래 자리에 겹친다. 실제 창을 앞으로 올리지 않으므로 창 순서도
/// 최근 사용순도 헝클어지지 않는다.
@MainActor
final class WindowPreview {
    /// 선택 중인 창의 자리를 다시 맞추는 간격. 창이 움직이는 것을 따라가야 해서 촘촘하다.
    private static let followInterval = 50   // 50ms마다 위치 추적
    /// 그림이 이미 있을 때 몇 번에 한 번 다시 찍을지. 250ms마다이며, 한 장에 10~30ms 드는
    /// 캡처를 매번 하지는 않는 선이다.
    private static let capturesEvery = 5
```

한 가지 미묘한 튜닝이 있었어요. 캡처 한 장에 10~30ms가 듭니다. 그래서 **그림이 이미 있으면** 250ms마다 한 번씩만 다시 찍도록 했어요(살아 움직이는 것처럼 보이기엔 그 정도면 충분하거든요). 하지만 **아직 첫 그림이 없으면 매번 찍습니다.** 이 둘을 같은 값으로 뒀더니, 창이 뜬 뒤에도 그림이 250ms 늦게 나타나 버벅이더라고요. 첫 그림을 기다리는 시간과 움직임을 따라가는 주기는 별개로 다뤄야 한다는 걸 여기서 배웠습니다.

정렬은 순수 함수로 따로 뺐어요. 뷰나 레지스트리와 얽히지 않아서 단독으로 테스트하기 좋거든요.

```swift
static func sorted(
    _ windows: [WindowInfo],
    by order: WindowOrder,
    focusRank: (WindowInfo.Identity) -> Int,   // 작을수록 최근에 쓴 창 (MRU)
    creationRank: (WindowInfo.Identity) -> Int
) -> [WindowInfo] {
    windows.sorted { lhs, rhs in
        switch order {
        case .recentlyFocused: return focusRank(lhs.id) < focusRank(rhs.id)
        case .recentlyCreated: return creationRank(lhs.id) > creationRank(rhs.id)
        case .alphabetical:    return isAlphabeticallyBefore(lhs, rhs, focusRank: focusRank)
        }
    }
}
```

여기서도 원칙을 하나 세웠어요. **고른 기준 하나만** 적용한다는 것. 예를 들어 "최소화된 창은 뒤로 밀자" 같은 걸 슬쩍 끼워넣으면, 이름순을 골라도 같은 앱이 목록 여기저기 흩어져 정렬이 깨진 것처럼 보이더라고요. 최소화된 창을 숨기고 싶다면 정렬이 아니라 **필터** 로 거르는 게 맞았어요.

&nbsp;

## 🔐 권한과 코드 서명

기능은 얼추 돌아가는데, 사실 여기서부터가 진짜 고비였습니다. macOS의 **권한(TCC)** 과 **코드 서명** 이야기예요.

### 🔑 권한 두 개, 그리고 "언제 켜졌는지 모르는" 문제

AltTeb은 권한이 두 개 필요해요.

| 권한 | 쓰임 | 없으면 |
|:--|:--|:--|
| **손쉬운 사용** | 창 목록을 읽고 Option+Tab을 감지 | 아무것도 동작 안 함 |
| **화면 기록** | 썸네일 미리보기를 캡처 | 썸네일만 안 나옴 |

손쉬운 사용(Accessibility)은 없으면 앱 전체가 무의미해집니다. 다른 앱의 창을 열거하거나 활성화하는 게 전부 이 권한에 묶여 있거든요. 반면 화면 기록은 썸네일에만 필요해서, 아이콘·제목 목록만 쓸 거라면 없어도 괜찮아요. 그래서 화면 기록은 **실제로 썸네일이 필요할 때만** 게으르게 요청하도록 했습니다.

문제는 따로 있었어요. 사용자가 시스템 설정에서 권한을 **켜는 순간을 알려주는 API가 없다** 는 점이었어요. 그래서 조금 투박하지만 폴링으로 감지하기로 했습니다.

```swift
/// 사용자가 시스템 설정에서 권한을 켜는 시점을 알려주는 API가 없어 폴링으로 감지한다.
private static let accessibilityPollInterval: TimeInterval = 1.0
```

1초마다 `AXIsProcessTrusted()` 를 확인하다가, 권한이 들어온 게 보이면 그때 엔진을 켜는 방식이에요. 우아한 방법은 아니지만, 현실적으로는 이게 가장 확실하더라고요.

### 🖊️ 매번 리셋되는 권한 — ad-hoc 서명 이야기

여기서 제일 오래 헤맨 부분을 소개할게요. **"빌드할 때마다 권한이 초기화되는"** 현상이었어요.

분명 손쉬운 사용을 켰는데, 코드를 고치고 다시 빌드하면 또 꺼져 있는 거예요. 다시 켜면 또 꺼지고요. 원인은 뜻밖에도 **코드 서명** 에 있었습니다.

macOS의 TCC(권한 DB)는 앱을 **"코드 서명 + 번들 ID" 로 식별** 합니다. 그런데 서명 없이 빌드하면 `codesign --sign -`, 즉 **ad-hoc 서명** 이 붙는데, 이 값이 **빌드마다 달라져요.** TCC 입장에서는 매번 "처음 보는 앱" 이니 권한을 새로 물어보는 거였어요.

해법은 **고정된 자체 서명 인증서** 를 하나 만들어 두는 것이었어요. `make-cert.sh` 를 최초 1회만 돌리면 `AltTeb Dev` 라는 개발용 인증서를 만들어 키체인에 넣어줍니다.

```bash
# 개발용 self-signed 코드서명 인증서를 1회 생성한다.
#
# 왜 필요한가:
#   ad-hoc 서명은 빌드마다 서명이 달라지므로, 재빌드할 때마다
#   손접근성·화면 기록 권한이 초기화된다.
#   고정된 identity로 서명하면 권한이 재빌드를 넘어 유지된다.

openssl req -x509 -newkey rsa:2048 -nodes -days 7300 \
    -keyout "$WORK_DIR/key.pem" \
    -out    "$WORK_DIR/cert.pem" \
    -config "$WORK_DIR/openssl.cnf" 2>/dev/null
```

한 번 만들어두면 이후 빌드가 모두 같은 서명을 쓰니 권한이 유지돼요. 이걸 알아내기 전까지는 "왜 자꾸 권한이 풀리지..." 하면서 애먼 코드만 뒤졌었죠.

참고로 이 과정에서 OpenSSL 버전 문제도 하나 만났어요. `security(1)` 가 OpenSSL 3의 기본 PKCS#12 암호화(AES-256)를 못 읽어서, 일부러 구식인 3DES/SHA-1로 명시해야 했거든요. 이런 건 정말 겪어보지 않으면 모르는 것들이더라고요.

&nbsp;

## 🪜 배포는 "각자 빌드"로

서명 문제가 하나 더 있었어요. "그럼 완성한 `.app` 을 그냥 나눠주면 되지 않나?" 싶었는데, 그게 안 되더라고요.

자체 서명한 앱은 인터넷을 거치면 **Gatekeeper가 막습니다.** 내려받은 파일엔 `com.apple.quarantine` 속성이 붙고, 공증(notarize)되지 않은 앱은 실행이 거부되면서 *"손상되었기 때문에 열 수 없습니다"* 가 뜨거든요.

공증을 하려면 **Apple Developer Program(연 $99)** 이 필요해요. 개인 프로젝트에 매년 그 비용을 태우기는 조금 아까웠어요. 그래서 방향을 바꿨습니다. **소스만 올리고 각자 로컬에서 빌드하는 방식** 으로요.

```bash
git clone https://github.com/gkstmdgjs/gkstmdgjs-alt-tab.git
cd gkstmdgjs-alt-tab
./Scripts/make-cert.sh      # 최초 1회 — 자체 서명 인증서
./Scripts/install.sh        # 빌드 → 서명 → /Applications 설치 → 실행
```

클론해서 로컬에서 빌드한 앱에는 quarantine이 붙지 않아 그대로 잘 실행돼요. 배포 편의는 조금 잃었지만, 대신 $99를 아끼고 사용자도 소스를 직접 눈으로 확인할 수 있으니 나름 합리적인 타협이었다고 생각합니다.

그리고 하나 더, 창을 앞으로 세우는 일도 만만치 않았어요. macOS의 활성화 API들은 **성공을 반환하고도 정작 아무 일이 없는 경우가 흔하더라고요.** 비활성 앱의 `activate` 는 조용히 무시되고, 최소화된 창은 raise로 복원되지 않았어요. 그래서 반환값을 믿는 대신, **실제 화면 상태를 보고** "고른 창이 진짜 맨 앞에 왔는가" 로 판정하도록 바꿨습니다. 안 왔으면 다음 수단으로 내려가는 사다리(창 지목 → 손접근성 → 앱 열기) 구조로요.

```swift
static func ladder(for window: WindowInfo) -> [Step] {
    var steps: [Step] = []
    if window.windowID != nil { steps.append(.targetWindow) }   // 그 창 하나만
    if window.handle != nil   { steps.append(.accessibility) }  // 손접근성으로
    steps.append(.reopen)                                        // 최후엔 앱 열기
    return steps
}
```

"시도하고, 됐는지 확인하고, 안 됐으면 다음 수단으로." 이 단순한 원칙 하나로, 다섯 갈래로 갈렸던 복잡한 분기를 깔끔하게 정리할 수 있었어요.

&nbsp;

## 🤝 이미 있는 alt-tab류 앱과는 어떻게 다른가요?

솔직하게 짚고 갈게요. macOS에서 창 단위 전환이라고 하면 [alt-tab-macos](https://github.com/lwouis/alt-tab-macos)라는 훌륭한 오픈소스가 이미 있습니다. 저도 이걸 **참고 구현** 으로 삼았고, 많은 도움을 받았어요. 🙏

그래서 AltTeb이 "더 낫다" 고 말할 생각은 없어요. AltTeb은 어디까지나 **제 손에 맞는 걸 직접 만들어본 축약판** 이에요. 상용이나 성숙한 오픈소스가 다루는 수많은 엣지 케이스 — 스페이스(가상 데스크톱) 전환, 풀스크린 앱, 온갖 앱의 예외 동작 — 을 그들만큼 촘촘히 커버하지는 못합니다.

다만 직접 만들어보니 얻는 게 분명 있었어요.

- 🧩 왜 `CGEventTap` 을 써야 하는지, `RegisterEventHotKey` 로는 왜 안 되는지를 **손으로 확인** 했어요.
- 🖼️ `ScreenCaptureKit` 이 못 잡는 창이 있다는 것, 그리고 그 우회로가 존재한다는 것도 알게 됐고요.
- 🔐 TCC와 코드 서명이 어떻게 얽히는지, 왜 ad-hoc 서명이 권한을 리셋시키는지도 몸으로 배웠습니다.

직접 만들어보면 매일 쓰던 기능이 한층 평범해 보인다는 말이, 이번에도 맞았어요.

&nbsp;

## 🎬 마무리

AltTeb을 만들고 나서 두 가지가 진하게 남았습니다.

✅ **"OS가 안 알려주면, 상태를 직접 보고 판단하라."**  
권한이 언제 켜졌는지, 창이 진짜 앞으로 왔는지 — macOS는 이런 걸 곧이곧대로 알려주지 않았어요. 폴링으로 권한을 감시하고, 반환값 대신 화면 스냅샷으로 활성화를 판정한 게 결국 정답이었죠. **"성공을 반환했다" 와 "실제로 됐다" 는 다르다** 는 걸 이 앱을 만드는 내내 배웠어요.

✅ **"미리보기는 그림일 뿐, 실제를 건드리지 마라."**  
넘기는 동안 실제 창을 올렸다면 최근 사용순이 다 깨졌을 거예요. 진짜를 손대지 않고 그림만 겹쳐 보여준다는 원칙 하나가, 사용자가 마음 편히 창을 쭉 훑을 수 있게 해줬습니다. 눈에 보이는 편안함 뒤엔 "건드리지 않는다" 는 절제가 있었던 셈이죠.

`Command+Tab` 한 번 뒤에 숨어 있던 **이벤트 탭 · 창 서버 캡처 · TCC · 코드 서명** 이라는 도구들을 직접 손으로 만져보고 나니, 매일 누르던 그 키가 한층 다르게 보입니다. 무엇보다 매일 아쉬웠던 기능을 **내 손으로 만들어 매일 쓰고 있다** 는 게 가장 뿌듯했어요. 다음에 맥 앱을 하나 더 만든다면, 이번에 파고든 권한과 서명 이야기는 조금 덜 무섭겠죠! 🚀✨

```toc
```
