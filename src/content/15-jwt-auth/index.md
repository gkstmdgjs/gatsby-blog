---
emoji: 🔐
title: 'JWT 인증 직접 만들기'
date: '2026-05-10'
categories: Dev Backend Server
---

회사에서 JWT를 디버깅하다가 무심코 [jwt.io](https://jwt.io)에 토큰을 붙여넣었어요. 그런데 헤더, 페이로드, 시그니처가 **다 그대로 보이는 거예요.** 🤯

```text
Header:    { "alg": "HS256", "typ": "JWT" }
Payload:   { "sub": "1234", "name": "Honey", "role": "admin" }
Signature: 8XGY3...kQw   ← 이것만 검증 어쩌고
```

> "잠깐, 이거 그냥 디코드하면 다 보이는데?"  
> "비밀번호도 아니고 단순 base64인데 이게 어떻게 인증이 되지?"  
> "그러면 토큰을 훔친 사람은 그냥 admin 행세하면 되는 거 아니야?"

처음 JWT를 봤을 때부터 이 의문이 머릿속을 떠나지 않았어요. *"jsonwebtoken 라이브러리 쓰면 알아서 검증해주니까"* 라는 안일한 생각으로 5년을 살아온 거였죠. 😅

그래서 결심했습니다. **"한 번 직접 만들어보면 끝나는 일이잖아."** 💪

*"직접 만들면 라이브러리가 평범해진다"* 는 믿음을 백엔드로 끌고 와서, 그 첫 주제로 JWT를 골랐어요. 매일 쓰면서도 속을 들여다본 적은 없는 도구였거든요. 🚀

&nbsp;

## 📌 JWT의 정체 — 점 두 개로 나뉘는 세 부분

JWT(JSON Web Token)는 [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) 에 정의된 표준이에요. 점(`.`)으로 나뉜 세 덩어리로 구성됩니다.

```text
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.X9oxZ...
└── header ──┘.└── payload ──┘.└── signature ──┘
```

핵심을 한 줄로 정리하면!

> **"앞 두 부분은 누구나 본다. 마지막 시그니처가 '내가 발급한 토큰이 맞다'는 증명이다."**

암호화(encryption)가 아니라 **서명(signature)** 이라는 게 핵심이에요. 헷갈리는 이 둘의 차이부터 짚고 갑니다.

| 분류 | 목적 | 비유 |
|------|------|------|
| 🔒 **암호화** | 내용 숨기기 | 편지를 봉투에 넣어 봉인 |
| ✍️ **서명** | 내용 검증 | 편지에 도장을 찍어 *"내가 썼다"* 증명 |

JWT는 **서명**이에요. 그래서 내용은 보여도, 누가 만든 토큰인지는 검증할 수 있습니다. 🎯

&nbsp;

## 🛠️ 1차 구현 — Header / Payload 인코딩

가장 단순한 부분부터 시작! Base64URL이라는 변형 인코딩을 씁니다.

```typescript
// mini-jwt.ts
import { createHmac, timingSafeEqual } from 'node:crypto';

// Base64URL — 일반 Base64에서 +/= 를 -_ 로 바꾸고 = 패딩 제거
function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlDecode(input: string): Buffer {
  // 패딩 복원
  const padded = input + '='.repeat((4 - (input.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}
```

> 왜 Base64URL이냐고요? 일반 Base64의 `+`, `/`, `=` 가 URL에서 특수 문자로 취급돼요. JWT는 쿠키·헤더·URL에 들어가야 하니까 안전한 변형을 씁니다. 디테일이지만 이걸 모르면 *"왜 디코드가 안 되지?"* 같은 함정에 빠져요. 💡

&nbsp;

## ✍️ 2차 구현 — Signature와 sign 함수

```typescript
type Header = { alg: 'HS256'; typ: 'JWT' };
type Payload = Record<string, unknown>;

export function sign(payload: Payload, secret: string): string {
  const header: Header = { alg: 'HS256', typ: 'JWT' };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));

  // 핵심! "header.payload" 문자열에 HMAC-SHA256 서명
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = createHmac('sha256', secret)
    .update(signingInput)
    .digest();
  const signatureB64 = base64url(signature);

  return `${signingInput}.${signatureB64}`;
}
```

써보면!

```typescript
const token = sign({ sub: '1234', name: 'Honey' }, 'my-secret-key');
console.log(token);
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0...
```

20줄 안짝의 코드가 진짜 JWT를 만들어냈어요. 🎉

근데 이때 들떠서 *"이 정도면 jsonwebtoken 안 써도 되겠는데?"* 라는 자만이 들었습니다. 그 자만은 검증 함수를 만들면서 정확히 한 방에 깨졌어요. 😅

&nbsp;

## 🛡️ 3차 구현 — verify 함수 (그리고 첫 함정)

```typescript
// 🚨 일단 가장 단순한 verify (취약한 버전)
export function verify(token: string, secret: string): Payload | null {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  if (!headerB64 || !payloadB64 || !signatureB64) return null;

  // 다시 서명해보고 같은지 비교
  const expectedSig = createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest();
  const actualSig = base64urlDecode(signatureB64);

  if (expectedSig.toString('hex') !== actualSig.toString('hex')) {
    return null; // 시그니처 불일치
  }

  return JSON.parse(base64urlDecode(payloadB64).toString());
}
```

동작은 잘 합니다.

```typescript
const token = sign({ sub: '1234', name: 'Honey' }, 'secret');
verify(token, 'secret');           // → { sub: '1234', name: 'Honey' } ✅
verify(token, 'wrong-secret');     // → null ✅
verify(token + 'tampered', 'secret'); // → null ✅
```

근데 위 코드에 **시니어가 봤을 때 식은땀이 흐르는 보안 결함**이 두 군데 있어요. 찾으셨나요? 👀

&nbsp;

## 😱 함정 1 — Timing Attack (타이밍 공격)

```typescript
if (expectedSig.toString('hex') !== actualSig.toString('hex')) {
```

이 한 줄이 문제예요. 자바스크립트의 `!==` 비교는 **첫 글자가 다르면 즉시 false 반환**합니다. 정상 동작이지만 보안 관점에서는 재앙이에요.

공격자가 시그니처 첫 글자를 1글자씩 바꿔가며 보내면, **응답 시간의 미세한 차이**로 *"이 글자가 맞다/틀렸다"* 를 알아낼 수 있어요. 이걸 **Timing Attack** 이라고 합니다.

```text
공격자가 보내는 시그니처    응답 시간
─────────────────────────  ────────
"a..."                      0.001ms (즉시 false)
"b..."                      0.001ms
...
"X..."                      0.003ms ← "어, 첫 글자 맞췄나?"
"Xa..."                     0.003ms
"Xb..."                     0.005ms ← 또 맞춤
```

수십만 번 반복하면 시그니처 전체를 알아낼 수 있어요. 🚨

해법은 **상수 시간 비교(constant-time compare)** 입니다. 어떤 입력이 들어와도 **항상 같은 시간**이 걸리도록 비교하는 거예요.

```typescript
import { timingSafeEqual } from 'node:crypto';

// ✅ 길이가 다르면 일찍 false (이건 OK — 길이는 노출돼도 무방)
if (expectedSig.length !== actualSig.length) return null;

// ✅ 모든 바이트를 끝까지 비교 — 시간 일정
if (!timingSafeEqual(expectedSig, actualSig)) return null;
```

`timingSafeEqual`은 Node.js 표준 모듈에 있어요. 자바스크립트 비교 연산자를 쓰면 안 되는 영역입니다. 5년차 백엔드 개발자도 이 함수를 써본 사람은 의외로 적어요. 💡

&nbsp;

## 😱 함정 2 — 알고리즘 혼동 공격 (Algorithm Confusion)

이게 진짜 무서운 거예요. CVE까지 나온 적 있는 [실제 보안 취약점](https://datatracker.ietf.org/doc/html/rfc8725)입니다.

JWT 표준은 다양한 알고리즘을 지원해요. `HS256`(대칭키), `RS256`(비대칭키), 그리고 **`none`** (서명 없음).

```text
{ "alg": "none", "typ": "JWT" }
```

`alg: none`은 *"서명을 검증하지 마세요"* 라는 뜻이에요. **표준이 진짜로 이걸 허용합니다.** 처음 봤을 때 *"이게 표준이라고??"* 싶었어요. 🥶

문제는 위에서 만든 `verify` 함수가 **header의 `alg`를 검증하지 않는다는 것**이에요.

```typescript
// 공격자가 만든 토큰
{
  "alg": "none",       ← 서명 없음!
  "typ": "JWT"
}
{
  "sub": "admin",      ← 마음대로 변조
  "role": "superuser"
}
.                      ← 시그니처는 비어있음
```

엉성한 verify 구현은 *"알고리즘이 none이니까 시그니처 검증 안 해도 되겠다"* 라며 통과시켜요. 결국 **공격자가 admin으로 로그인합니다.** 😱

이걸 **알고리즘 혼동(algorithm confusion)** 또는 **None 공격**이라고 해요. 2015년에 jsonwebtoken 라이브러리에서 이 취약점이 발견됐고, [CVE-2015-9235](https://nvd.nist.gov/vuln/detail/CVE-2015-9235)로 등록됐습니다.

&nbsp;

## 🪜 해법 — 알고리즘 화이트리스트 + 완전한 verify

```typescript
type AllowedAlg = 'HS256';
const ALLOWED_ALGS: AllowedAlg[] = ['HS256'];

export function verify(token: string, secret: string): Payload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;

  // 1️⃣ 알고리즘 화이트리스트 검증 (none 공격 차단)
  let header: Header;
  try {
    header = JSON.parse(base64urlDecode(headerB64).toString());
  } catch {
    return null;
  }

  if (!ALLOWED_ALGS.includes(header.alg as AllowedAlg)) {
    return null;
  }

  // 2️⃣ 시그니처 재계산
  const expectedSig = createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest();
  const actualSig = base64urlDecode(signatureB64);

  // 3️⃣ 상수 시간 비교 (timing attack 차단)
  if (expectedSig.length !== actualSig.length) return null;
  if (!timingSafeEqual(expectedSig, actualSig)) return null;

  // 4️⃣ payload 파싱
  let payload: Payload;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64).toString());
  } catch {
    return null;
  }

  // 5️⃣ 만료 검증 (다음 단락에서)
  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
    return null;
  }

  return payload;
}
```

이제 진짜로 *"내가 발급한 토큰이 맞다 + 변조되지 않았다"* 가 보장됩니다. 🛡️

&nbsp;

## 🕐 만료(exp), 발급 시점(iat), 그리고 표준 클레임

JWT 표준은 **예약된 클레임 키**를 정의하고 있어요. 7년차 시니어라면 외워둬야 할 영역입니다.

| Claim | 의미 | 사용 |
|-------|------|------|
| `iss` | issuer | 발급한 주체 (예: `auth.myapp.com`) |
| `sub` | subject | 토큰의 주체 (보통 user id) |
| `aud` | audience | 토큰을 사용할 대상 |
| `exp` | expiration time | 만료 시간 (Unix timestamp, 초 단위) |
| `nbf` | not before | 이 시간 전엔 유효하지 않음 |
| `iat` | issued at | 발급 시간 |
| `jti` | JWT ID | 토큰 고유 ID (블랙리스트용) |

특히 **`exp`** 가 핵심이에요. 토큰을 영구히 발급하면 탈취당했을 때 무한히 악용됩니다.

```typescript
export function sign(
  payload: Payload,
  secret: string,
  expiresInSec = 60 * 60, // 기본 1시간
): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSec,
  };
  // ... 나머지 sign 로직
}
```

🚨 **함정**: `exp`는 **초 단위 Unix timestamp** 입니다. JavaScript의 `Date.now()`는 **밀리초**라 1000으로 나눠야 해요. 이걸 헷갈려서 *"왜 토큰이 1970년에 만료되지??"* 같은 버그를 5년차도 한 번씩 만나요. 😅

&nbsp;

## 🔄 Access Token vs Refresh Token — 짧게 짧게

5년차 시니어 면접에서 단골로 나오는 주제예요. 한 번 짚고 갑니다.

| 분류 | 만료 | 저장소 | 역할 |
|------|------|-------|------|
| **Access Token** | 짧게 (15분~1시간) | 메모리 또는 localStorage | API 요청마다 같이 보냄 |
| **Refresh Token** | 길게 (1주~1개월) | **HttpOnly 쿠키** | Access Token 재발급용으로만 |

핵심 발상: *"Access를 짧게 만들면 탈취 피해가 작다. 대신 자주 재발급하는 Refresh를 안전한 곳에 둔다."*

```typescript
// 로그인 시 둘 다 발급
const accessToken = sign({ sub: userId }, ACCESS_SECRET, 60 * 15);   // 15분
const refreshToken = sign({ sub: userId }, REFRESH_SECRET, 60 * 60 * 24 * 7); // 7일

res.cookie('refresh', refreshToken, {
  httpOnly: true,        // JS가 못 읽음 → XSS 방어
  secure: true,          // HTTPS만
  sameSite: 'strict',    // CSRF 방어
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
res.json({ accessToken });
```

> Refresh Token이 진짜 안전하려면 **DB에 저장해서 한 번 쓰고 폐기(rotation)** 하는 패턴까지 가야 해요. 이번 글의 범위를 넘는 주제라 여기선 짧게만 짚고 갑니다. 🙏

&nbsp;

## 🤔 진짜 jsonwebtoken 라이브러리는 어떻게 다른가?

당연하지만 우리가 만든 100줄짜리는 **진짜 라이브러리가 아니에요!** 🙅

- 🔑 **다양한 알고리즘 지원** — HS256/HS384/HS512(대칭), RS256/RS384/RS512(RSA), ES256/ES384/ES512(ECDSA), EdDSA. 비대칭키는 *"서버는 검증만, 발급은 다른 곳"* 같은 분리 시나리오에 유용.
- 📜 **JWK / JWKS 지원** — 공개키를 표준 JSON 형식으로 배포. OAuth/OIDC 연동 시 핵심.
- 🛡️ **Critical claims** — `crit` 헤더에 명시된 claim은 모르면 토큰 거부.
- 🧬 **JWE (JSON Web Encryption)** — 암호화 버전. JWT는 서명만, JWE는 내용까지 암호화.
- 🕒 **Clock skew tolerance** — 서버 시간이 약간 다를 때를 위해 ±몇 초 tolerance 허용.

근데 이번에도 신기한 건, 디테일을 다 빼고 보면 핵심은 **"Base64URL로 인코딩 + HMAC으로 서명 + 상수 시간 검증"** 한 줄이에요. 🎯

~~참고로 JWT가 *"세션보다 좋다"* 는 인식이 있는데, 사실 트레이드오프예요. JWT는 서버에서 강제 폐기하기 어렵고(Refresh Rotation 같은 추가 장치 필요), 페이로드가 커서 매 요청마다 대역폭을 먹어요. 마이크로서비스 아키텍처처럼 *"여러 서비스가 토큰만 보고 인증해야 하는"* 시나리오에선 JWT가 빛나지만, 단일 서버라면 그냥 세션이 더 단순할 때도 많아요. 그래서 *"Stateless가 무조건 우월하다"* 는 건 신화입니다.~~

&nbsp;

## 🎬 마무리

만들고 나서 두 가지가 진하게 남았어요!

✅ **"JWT는 암호가 아니라 도장이다."**  
페이로드를 누구나 디코드할 수 있다는 사실은 결함이 아니라 **설계**였어요. 핵심은 *"이 토큰을 누가 만들었는가"* 의 검증이지, 내용을 숨기는 게 아니거든요. 그래서 **민감 정보(비밀번호, 신용카드)는 절대 페이로드에 넣으면 안 됩니다.** 5년차도 가끔 이걸 까먹어요. 🤯

✅ **"보안 코드는 평범한 코드와 비교의 차원이 다르다."**  
`==` 대신 `timingSafeEqual`, `alg` 화이트리스트, `exp` 검증... 평범한 코드 리뷰에선 안 잡히는 결함들이 보안에선 치명적이에요. *"라이브러리를 믿고 쓰자"* 가 이래서 정답일 때가 많구나, 라는 걸 직접 만들어보고 나서야 깨달았습니다. 🛡️

&nbsp;

`jsonwebtoken` 한 줄 뒤에 숨어있던 **Base64URL · HMAC · timing-safe compare**라는 세 가지 도구를 손으로 만져보고 나니, 매일 쓰던 토큰이 한층 평범해 보였어요. 다음에 인증 코드를 리뷰할 때 *"이 비교는 상수 시간인가?"*, *"`alg` 화이트리스트가 있는가?"* 같은 질문을 자연스럽게 던질 수 있을 것 같습니다. 🚀✨

```toc
```
