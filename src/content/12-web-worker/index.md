---
emoji: 🧵
title: 'Web Worker 활용하기'
date: '2026-01-11'
categories: Dev Frontend
---

회사에서 큰 데이터를 다루는 프로젝트를 진행하던 중, 이런 일이 있었어요. 😱

10만 건짜리 CSV 파일을 파싱하는 기능을 만들었는데, 사용자가 파일을 업로드하는 순간 **화면이 5초 동안 얼어붙는** 거예요. 클릭도 안 먹고, 스크롤도 안 되고, 심지어 로딩 스피너조차 안 돌아갔습니다. 🥶

> "JS는 싱글 스레드라더니 진짜네..."  
> "근데 그러면 무거운 계산은 도대체 어디서 돌리지?"  
> "비동기로 처리하면 되는 거 아니야? Promise는?"

비동기로 감싸봐도 결국 같은 스레드에서 도는 거라 문제는 그대로였어요. 😅

그러다가 발견한 게 **Web Worker** 였습니다!

자바스크립트가 싱글 스레드라는 건 알고 있었지만, 브라우저가 **백그라운드에서 진짜로 별도의 스레드**를 굴려준다는 사실은 의외였어요. 🤯

이 글은 Web Worker를 처음 써보고 정리한 후기예요!

&nbsp;

## 📌 Web Worker가 뭐길래?

Web Worker는 **브라우저가 메인 스레드와 별도로 돌려주는 백그라운드 스레드**예요.

- 🧵 **메인 스레드와 완전히 분리되어 동작합니다.** UI를 멈추지 않아요!
- 📨 **메시지로만 데이터를 주고받습니다.** 직접 변수를 공유할 수는 없어요.
- 🚪 **DOM에 접근할 수 없습니다.** 워커는 화면을 직접 그릴 수 없어요. 계산만 합니다.

이 세 가지 약속을 받아들이면 엄청 강력한 도구가 됩니다! 🎯

&nbsp;

## 🥶 일단 메인 스레드를 멈춰보자

Web Worker가 왜 필요한지 직접 느껴보려면, 메인 스레드가 멈추는 모습을 한 번 봐야 해요.

```typescript
// main.ts
function heavyTask() {
  let result = 0;
  for (let i = 0; i < 1_000_000_000; i++) {
    result += i;
  }
  return result;
}

document.getElementById('start')!.onclick = () => {
  console.time('계산');
  const result = heavyTask();
  console.timeEnd('계산');
  console.log(result);
};
```

버튼을 누르고 다른 버튼을 클릭하거나 스크롤해보면... 화면이 **5초 동안 완전히 얼어붙어요.** 😱

브라우저 탭의 로딩 인디케이터조차 안 돌아갑니다. 사용자 입장에선 *"이거 죽은 거 아니야?"* 라고 생각할 만한 수준이에요.

> "이 정도로 멈춘다고? 비동기 안 쓰니까 그렇지!"

라고 생각하실 수도 있는데, 사실 비동기로 감싸도 결과는 똑같아요.

```typescript
// Promise로 감싸도 결국 같은 스레드에서 돈다
async function heavyTaskAsync() {
  return new Promise((resolve) => {
    let result = 0;
    for (let i = 0; i < 1_000_000_000; i++) {
      result += i;
    }
    resolve(result);
  });
}
```

`Promise`는 **싱글 스레드 안에서 작업의 순서**를 다루는 도구지, 다른 스레드를 만드는 도구가 아니거든요. 이 사실을 처음 깨달았을 때 좀 충격이었어요. 🤯

&nbsp;

## 🛠️ Web Worker 사용해보기

워커 파일을 따로 만들어서, 메인 스레드와 메시지로만 소통하는 구조예요!

### 1) 워커 스크립트 만들기

```typescript
// heavy.worker.ts
self.onmessage = (e: MessageEvent) => {
  const { count } = e.data;

  let result = 0;
  for (let i = 0; i < count; i++) {
    result += i;
  }

  self.postMessage({ result });
};
```

워커 안에서는 `self`로 자기 자신을 참조해요. 메인 스레드가 보낸 메시지는 `onmessage`로 받고, 결과는 `postMessage`로 돌려보냅니다. 📨

### 2) 메인 스레드에서 워커 호출

```typescript
// main.ts
const worker = new Worker(new URL('./heavy.worker.ts', import.meta.url), {
  type: 'module',
});

document.getElementById('start')!.onclick = () => {
  console.time('계산');
  worker.postMessage({ count: 1_000_000_000 });
};

worker.onmessage = (e) => {
  console.timeEnd('계산');
  console.log('결과:', e.data.result);
};
```

이제 버튼을 눌러보면... **화면이 안 멈춰요!** ✨

5초 동안 계산이 백그라운드에서 도는데도 스크롤도 잘 되고, 다른 버튼도 잘 눌립니다. 진짜 마법 같았어요. 🪄

&nbsp;

## 🤔 세 가지 종류의 Worker

이때까지 알게 된 건데, Worker는 사실 세 종류가 있어요!

### 🧵 Dedicated Worker

방금 만든 게 이거예요. **하나의 메인 페이지에 종속**된 워커로, 가장 흔하게 쓰여요.

### 🌐 Shared Worker

여러 탭이나 윈도우가 **공유**해서 쓸 수 있는 워커예요. 같은 사이트의 여러 탭에서 한 워커를 쓰고 싶을 때 사용해요.

### 🛡️ Service Worker

PWA의 핵심 워커예요. 네트워크 요청을 가로채고 캐싱하는 등 **프록시 역할**을 합니다. 오프라인 대응이나 푸시 알림처럼 진짜 *"앱 같은 동작"* 을 만들 때 빛을 발하는 도구예요.

처음엔 셋의 차이가 헷갈렸는데, 직접 써보니 *"아 이건 영역이 완전히 다르구나"* 싶더라고요. 😎

&nbsp;

## 😱 첫 번째 시련: 큰 데이터 전송이 느리다

Web Worker가 만능은 아니에요. 바로 **데이터 전송 비용** 때문이죠.

`postMessage`로 데이터를 보낼 때, 기본적으로 **structured clone** 알고리즘으로 깊은 복사를 합니다. 작은 객체는 괜찮은데, 100MB짜리 ArrayBuffer 같은 걸 보내면...

```typescript
// 100MB 데이터 전송
const huge = new Uint8Array(100 * 1024 * 1024);
worker.postMessage({ data: huge }); // 여기서 복사하느라 멈춘다!
```

복사하느라 메인 스레드가 또 멈춰버려요. 😱 *"워커 쓰는 의미가 없잖아!"*

&nbsp;

## 🪜 해법 — Transferable Objects

해결책은 **소유권 이전**이에요. 복사하지 말고, 데이터의 주인을 메인에서 워커로 **그냥 넘겨버리는** 거죠. 🎯

```typescript
const huge = new Uint8Array(100 * 1024 * 1024);

// 두 번째 인자에 전송할 객체의 buffer를 넣는다
worker.postMessage({ data: huge }, [huge.buffer]);

// 이제 메인 스레드의 huge는 비어있다 (소유권이 워커로 넘어감)
console.log(huge.length); // 0
```

이렇게 하면 데이터를 복사하지 않고, **메모리 주소만 바꾸는** 식으로 빠르게 넘어갑니다. 100MB도 거의 0ms에 전송돼요! ✨

다만 Transferable이 가능한 객체 타입은 몇 가지로 정해져 있어요.

- 📦 `ArrayBuffer`, `MessagePort`
- 🖼️ `ImageBitmap`, `OffscreenCanvas`
- 📁 `ReadableStream`, `WritableStream`

일반 객체나 배열은 안 됩니다. 그래서 큰 데이터를 다룰 땐 보통 `ArrayBuffer`로 변환해서 보내는 패턴을 자주 써요. 💡

&nbsp;

## 🎯 실전 예제 — CSV 파서를 워커로 옮기기

처음에 얘기한 그 5초 멈춤 사건을 Web Worker로 해결해본 사례예요!

```typescript
// csv.worker.ts
self.onmessage = (e: MessageEvent<{ text: string }>) => {
  const { text } = e.data;

  const lines = text.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(',');
    return Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
  });

  self.postMessage({ rows });
};
```

```typescript
// main.ts
const worker = new Worker(new URL('./csv.worker.ts', import.meta.url), {
  type: 'module',
});

input.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files![0];
  const text = await file.text();

  showSpinner();
  worker.postMessage({ text });
});

worker.onmessage = (e) => {
  hideSpinner();
  renderTable(e.data.rows);
};
```

전과 후의 차이가 정말 극적이었어요!

| 항목 | 메인 스레드 | Web Worker |
|------|------------|------------|
| 파싱 시간 | 5초 | 5초 (동일) |
| UI 멈춤 | **5초 동안 얼어붙음** 🥶 | **0초 (멀쩡!)** ✨ |
| 스피너 표시 | 안 보임 | 정상 표시 |

같은 시간이 걸려도 사용자 경험은 천지차이였습니다. 5초 동안 스피너가 잘 돌아가는 것만으로도 *"앱이 살아있구나"* 라고 느껴지니까요. 😊

&nbsp;

## 🤔 Worker가 만능은 아니다

직접 써보니 Web Worker도 한계가 있더라고요!

- 🚪 **DOM에 접근 불가능** — 워커 안에서는 `document`나 `window`를 못 써요. UI 업데이트는 메인 스레드로 메시지를 보내서 처리해야 합니다.
- 📦 **번들러 설정이 필요해요** — Vite, Webpack 등 번들러마다 워커 import 방식이 조금씩 달라서 처음엔 헤맸어요.
- 💾 **메모리를 두 배로 먹을 수 있어요** — 작은 작업까지 워커로 옮기면 오히려 오버헤드가 더 커집니다. 정말 무거운 작업에만 써야 해요.
- 🐛 **디버깅이 살짝 불편해요** — 워커는 별도 스레드라 브라우저 DevTools에서 따로 봐야 합니다.

> "그럼 언제 워커를 써야 하지?"

저는 이렇게 기준을 잡았어요. **"메인 스레드를 100ms 이상 멈추는 작업이 있다면 워커 후보"** 입니다. 사용자가 멈춤을 인지하기 시작하는 게 보통 100ms 정도라고 해요. 🎯

~~참고로 Chrome은 메인 스레드가 50ms 이상 멈추면 Long Task로 분류해서 Performance 패널에 빨갛게 표시해줍니다. 한 번 켜놓고 자기 앱을 둘러보면 *"이게 이렇게 오래 걸렸다고??"* 싶은 부분이 꽤 있을 거예요.~~

&nbsp;

## 🎬 마무리

Web Worker를 써보고 나니 두 가지가 진하게 남았어요!

✅ **"브라우저는 생각보다 강력한 도구를 갖고 있었다!"**  
"JS는 싱글 스레드"라는 명제만 머리에 박혀있었는데, 브라우저는 처음부터 멀티스레딩 도구를 제공하고 있었더라고요. 그동안 메인 스레드만 박박 긁어쓰고 있었던 게 살짝 부끄러워졌습니다. 😅

✅ **"성능 최적화는 결국 사용자 경험이다!"**  
같은 5초가 걸려도 화면이 멈춘 5초와 스피너가 도는 5초는 완전히 다른 경험이에요. 시간을 줄이는 것만큼이나, **사용자가 멈춤을 인지하지 않게 만드는 것**도 중요한 최적화라는 걸 배웠습니다. 💡

&nbsp;

*"메인 스레드만 박박 긁어쓰는"* 시절에서 벗어나, *"무거운 건 백그라운드로, 메인은 UI에 집중"* 이라는 새로운 무기를 손에 쥔 느낌이에요. 다음에 100ms 이상 멈추는 코드를 마주치면 망설임 없이 워커로 옮길 수 있을 것 같습니다. 🚀✨

```toc
```
