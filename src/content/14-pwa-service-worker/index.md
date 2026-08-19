---
emoji: 📱
title: 'PWA 오프라인 만들기'
date: '2026-04-19'
categories: Dev Frontend
---

[Web Worker](/13-web-worker)를 다뤄봤다면, 이번엔 그 사촌 격인 **Service Worker** 차례입니다! 🛡️

처음 PWA(Progressive Web App)라는 단어를 들었을 때, 솔직히 별 감흥이 없었어요. *"웹사이트를 앱처럼 만든다고? 그게 뭐 대단한 거야?"* 정도였죠. 😅

그러다가 어느 날 자주 가는 사이트를 비행기 안에서 열어봤는데, 인터넷이 끊겼는데도 페이지가 멀쩡히 떠있는 거예요. 캐시된 데이터까지 볼 수 있었고요. 🤯

> "어? 와이파이 끊겼는데 어떻게 동작하지?"  
> "이게 PWA라는 건가?"  
> "근데 이거 어떻게 만드는 거지?"

그렇게 시작된 게 이번 글의 주제예요!

&nbsp;

## 📌 PWA의 3대 요소

PWA를 만들려면 **세 가지 조건**이 갖춰져야 해요!

- 📄 **Web App Manifest** — 앱 이름, 아이콘, 시작 URL 등을 정의한 JSON 파일
- 🔒 **HTTPS** — 보안 연결이 필수예요. localhost는 예외로 허용됩니다.
- 🛡️ **Service Worker** — 진짜 마법을 부리는 주인공!

이 셋만 갖추면 브라우저가 *"어, 이거 PWA네?"* 라고 인식하고 **"홈 화면에 추가"** 버튼을 알아서 띄워줘요. ✨

&nbsp;

## 🛠️ 1단계 — Manifest 만들기

가장 단순한 작업부터 시작!

```json
// public/manifest.json
{
  "name": "Honey's Blog",
  "short_name": "Honey",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#5183f5",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

HTML에 연결만 해주면 돼요!

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#5183f5" />
```

이것만으로도 브라우저가 *"이 사이트 앱처럼 설치할 수 있어요!"* 라는 안내를 띄우기 시작합니다. 🎉

&nbsp;

## 🛡️ 2단계 — Service Worker 등록하기

Service Worker는 **브라우저 안에서 돌아가는 프록시 서버**라고 생각하면 가장 이해가 빨라요.

웹사이트가 보내는 모든 fetch 요청을 가로채서, *"이건 캐시에서 줄게"* 또는 *"이건 네트워크로 갔다 올게"* 를 결정할 수 있어요. 🪄

먼저 등록부터 해봅시다!

```typescript
// main.ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('SW 등록 성공:', reg.scope);
    } catch (e) {
      console.error('SW 등록 실패:', e);
    }
  });
}
```

`'serviceWorker' in navigator` 체크는 구형 브라우저 대응이에요. 안 지원하면 그냥 패스. 👍

&nbsp;

## 🔄 Service Worker의 라이프사이클

처음 SW를 만들면서 가장 헷갈렸던 게 **라이프사이클**이었어요. 평범한 스크립트와 달리 단계가 명확하게 나뉘어 있거든요.

- 📥 **install** — 처음 등록될 때 한 번만 실행. 보통 정적 자원을 캐시에 미리 넣어둡니다.
- ✅ **activate** — install이 끝나면 호출. 옛 캐시를 정리하기 좋은 타이밍이에요.
- 🌐 **fetch** — 페이지가 네트워크 요청을 보낼 때마다 호출. **여기서 진짜 마법이 일어납니다!**

세 단계를 한 파일에 묶어보면 이런 모양이에요!

```typescript
// sw.js
const CACHE_NAME = 'honey-blog-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/main.css',
  '/main.js',
  '/icons/icon-192.png',
];

// 1) 설치 단계: 정적 자원 미리 캐시
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// 2) 활성화 단계: 옛 캐시 청소
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
});

// 3) fetch 가로채기
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
```

이렇게 30줄 정도만 짜둬도 **오프라인 대응이 되는 PWA**가 만들어져요. 🎉

비행기 모드를 켜고 새로고침을 해도 페이지가 그대로 뜨는 걸 처음 봤을 때, *"아니 이게 진짜 되네?"* 싶었어요. 🤯

&nbsp;

## 🎯 캐싱 전략 — 상황에 맞게 골라쓰기

위 코드는 가장 단순한 **Cache First** 전략이에요. 캐시에 있으면 캐시에서 주고, 없으면 네트워크에서 받는 방식이죠.

근데 모든 자원에 같은 전략을 쓰면 안 돼요. 자원마다 특성이 다르거든요!

### 1) 🏃 Cache First — 정적 자원에 적합

```typescript
async function cacheFirst(req: Request) {
  const cached = await caches.match(req);
  if (cached) return cached;

  const fresh = await fetch(req);
  const cache = await caches.open(CACHE_NAME);
  cache.put(req, fresh.clone());
  return fresh;
}
```

이미지, CSS, JS처럼 **잘 안 바뀌는 자원**에 좋아요. 한 번 캐시되면 네트워크를 거의 안 거치니까 빠릅니다. ⚡

### 2) 🌐 Network First — API 응답에 적합

```typescript
async function networkFirst(req: Request) {
  try {
    const fresh = await fetch(req);
    const cache = await caches.open(CACHE_NAME);
    cache.put(req, fresh.clone());
    return fresh;
  } catch {
    // 네트워크 실패 시에만 캐시
    const cached = await caches.match(req);
    if (cached) return cached;
    throw new Error('No cache available');
  }
}
```

API 응답처럼 **항상 최신이 중요한 자원**에 좋아요. 네트워크가 살아있을 땐 무조건 최신, 끊겼을 때만 캐시로 폴백합니다. 🎯

### 3) ⚡ Stale While Revalidate — 균형잡힌 선택

```typescript
async function staleWhileRevalidate(req: Request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);

  // 캐시는 즉시 반환하고
  const networkPromise = fetch(req).then((fresh) => {
    cache.put(req, fresh.clone());
    return fresh;
  });

  // 백그라운드에서 캐시를 갱신
  return cached || networkPromise;
}
```

**즉시 응답 + 백그라운드 갱신** 조합이에요. 사용자는 바로 화면을 보고, 다음 방문 때는 최신 데이터를 보게 됩니다. 가장 자주 쓰는 패턴이에요! ✨

### 사용 예시

```typescript
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(e.request));
  } else if (url.pathname.startsWith('/images/')) {
    e.respondWith(cacheFirst(e.request));
  } else {
    e.respondWith(staleWhileRevalidate(e.request));
  }
});
```

이렇게 자원의 종류에 따라 전략을 다르게 가져가면 사용자 경험이 확 좋아져요! 🎨

&nbsp;

## 😱 첫 번째 시련: 캐시가 갱신이 안 된다

배포를 해도 사용자에게는 **옛 버전이 계속 보이는 현상**이 발생했어요. 😱

```text
❌ 새 코드 배포 했는데 새로고침을 해도 옛날 화면이 떠요
❌ DevTools에서 강제 새로고침을 해야만 새 버전이 보여요
❌ 사용자한테 "캐시 비워주세요"라고 안내해야 한다고요???
```

이게 바로 SW의 가장 유명한 함정이에요. 🥶

원인은 단순해요. SW가 fetch를 가로채서 캐시를 돌려주니까, **새 코드도 옛 캐시로 응답**하는 거죠. SW 자신도 캐시되니까 갱신이 안 일어나요.

> "그럼 어떻게 새 버전을 강제로 적용시키지?"

해결책은 두 가지예요!

&nbsp;

## 🪜 해법 — 캐시 버저닝 + skipWaiting

### 1) 🏷️ 캐시 이름에 버전을 박는다

배포할 때마다 캐시 이름을 바꿔서, 새 SW가 옛 캐시를 통째로 무시하도록 하는 방식이에요.

```typescript
// 빌드 시점에 버전을 주입하면 가장 좋다
const CACHE_NAME = 'honey-blog-v3'; // 배포할 때마다 v4, v5...
```

### 2) ⚡ skipWaiting + clients.claim

새 SW가 등록되면, 보통은 모든 탭이 닫혔다가 다시 열려야 활성화돼요. 이걸 즉시 활성화시키는 두 메서드가 있어요.

```typescript
self.addEventListener('install', (e) => {
  self.skipWaiting(); // 즉시 활성화 단계로
  // ...
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim()); // 열려있는 모든 탭에 즉시 적용
  // ...
});
```

이 두 가지만 잘 처리해주면 *"캐시 비워주세요"* 같은 부끄러운 안내를 안 해도 됩니다! 😎

&nbsp;

## 🔔 보너스 — Push 알림과 백그라운드 동기화

Service Worker는 사실 캐싱만 하는 게 아니에요. 정말 강력한 기능이 두 개 더 있어요!

### 📢 Push 알림

```typescript
self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {};
  const title = data.title || '🐝 알림이 왔어요!';
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge.png',
  };

  e.waitUntil(self.registration.showNotification(title, options));
});
```

브라우저가 닫혀 있어도 푸시 알림을 받을 수 있어요. 진짜 네이티브 앱 같은 경험이죠! 🚀

### 🔄 Background Sync

네트워크가 끊겼을 때 보낸 요청을, 연결이 복구되면 **자동으로 재전송**해주는 기능이에요.

```typescript
// 메인 스레드
const reg = await navigator.serviceWorker.ready;
await reg.sync.register('post-comment');

// SW
self.addEventListener('sync', (e) => {
  if (e.tag === 'post-comment') {
    e.waitUntil(retryPostComments());
  }
});
```

지하철에서 댓글을 썼는데 네트워크가 끊겨도, 지상으로 나오는 순간 자동으로 등록되는 식이에요. 진짜 마법 같죠? 🪄

&nbsp;

## 🐛 디버깅 팁

처음 SW를 만들 때 정말 많이 헤맸어요. 디버깅이 평범한 JS와 좀 다르거든요. 도움이 됐던 팁을 남겨봅니다!

- 🔍 **Chrome DevTools → Application → Service Workers** 탭에서 등록 상태 확인 가능
- ✅ **"Update on reload"** 체크박스를 켜두면 새로고침할 때마다 SW가 갱신돼요. 개발 중엔 필수!
- 🗑️ **"Unregister"** 버튼으로 SW를 강제 제거할 수 있어요. 꼬였을 때 한 번 눌러보세요.
- 📡 **Network 탭에서 "Offline"** 모드를 켜고 테스트하면 진짜 비행기 모드 흉내가 가능합니다.
- 📝 **콘솔 로그가 따로 떠요.** SW의 `console.log`는 별도 컨텍스트에 출력되니까 놓치지 마세요.

&nbsp;

## 🤔 진짜 PWA는 어떻게 만드는 거야?

직접 SW를 손으로 짜보는 건 학습용으론 정말 좋은데, 실무에선 보통 **Workbox** 같은 라이브러리를 써요.

```typescript
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({ cacheName: 'api-cache' })
);
```

위에서 손으로 만든 캐싱 전략을 한두 줄로 끝낼 수 있어요. ✨

근데 Workbox를 쓰더라도 **내부 동작을 알고 쓰는 것**과 **그냥 매뉴얼대로 쓰는 것**은 천지차이라고 생각해요. 손으로 한 번 만들어보면 라이브러리의 옵션 하나하나가 의미 있게 다가옵니다. 💡

~~참고로 Vite에는 `vite-plugin-pwa`라는 플러그인이 있어서, 설정 몇 줄만 추가하면 Workbox + manifest까지 자동으로 만들어줘요. 이 글도 결국 그 플러그인을 더 잘 쓰기 위한 학습 노트입니다. 😅~~

&nbsp;

## 🎬 마무리

PWA를 직접 만들고 나니 두 가지가 진하게 남았어요!

✅ **"웹과 앱의 경계가 정말 흐려졌다!"**  
오프라인 동작, 푸시 알림, 백그라운드 동기화... 예전엔 네이티브 앱만 할 수 있던 일들을 이제 웹도 거의 다 할 수 있어요. 설치도 안 받고 즉시 쓸 수 있는 웹의 장점은 그대로 가져가면서요! 🎯

✅ **"Service Worker는 만능 프록시다!"**  
브라우저와 서버 사이에 내가 직접 만든 코드를 끼워넣을 수 있다는 게 정말 강력해요. 캐싱뿐만 아니라 인증 토큰 자동 갱신, A/B 테스트, 로깅... 응용할 곳이 정말 많을 것 같아요. 💪

&nbsp;

오프라인 동작에 푸시 알림, 백그라운드 동기화까지... *"웹은 새로고침하면 끝"* 이라는 인식이 한참 옛날 얘기였구나 싶었어요. 다음에 새 프로젝트를 시작할 때 `manifest.json` 한 장과 `sw.js` 30줄만 추가하면 사용자 경험이 한층 단단해진다는 사실이, 든든한 무기로 남았습니다! 🚀✨

```toc
```
