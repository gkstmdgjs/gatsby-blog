---
emoji: 🧭
title: 'React Router 직접 만들기'
date: '2025-09-14'
categories: Dev React Frontend
---

`useState`를 [직접 만들어본 글](/7-react-usestate)에 이어, 이번엔 **React Router** 차례입니다! 🚀

처음 React를 배웠을 때 가장 신기했던 게 두 가지였어요. 하나는 `useState`고, 다른 하나는 바로 **라우팅**이었습니다.

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/posts/:id" element={<Post />} />
  </Routes>
</BrowserRouter>
```

링크를 클릭하면 페이지가 안 새로고침되는데 URL은 바뀌어 있고, 화면도 다른 컴포넌트로 슉 바뀝니다. 🤯

> "분명히 페이지를 다시 안 받아왔는데 어떻게 URL이 바뀌지?"  
> "뒤로가기 버튼은 또 어떻게 처리하는 거야?"

검색해보니까 *"History API를 쓰는 거예요"* 라는 답이 돌아왔어요. 그런데 이번에도 한 줄짜리 답으로는 머릿속에 그림이 그려지지 않더라고요. 😅

그래서 또 결심했습니다. **"useState 만들었으니 Router도 못 만들 거 없잖아!"** 💪

&nbsp;

## 📌 Router가 하는 일을 다시 보자

라우터의 핵심은 결국 세 가지에요.

- 🔗 **URL이 바뀌면** → 그에 맞는 컴포넌트를 화면에 그린다
- 🖱️ **링크를 클릭하면** → 페이지 새로고침 없이 URL을 바꾼다
- ⬅️ **뒤로가기/앞으로가기**도 자연스럽게 동작한다

이 세 가지만 처리하면 라우터처럼 보이게 만들 수 있어요! 🎯

&nbsp;

## 🧠 핵심은 History API

브라우저는 URL과 페이지 이력을 다루는 API를 이미 가지고 있어요. 라우터는 마법을 부리는 게 아니라, **이 API를 잘 갖다 쓰는 것**뿐입니다. ✨

진짜 핵심은 두 개예요.

```js
history.pushState(null, '', '/posts/123'); // URL을 바꾸지만 새로고침은 안 함
window.addEventListener('popstate', () => { /* 뒤로가기/앞으로가기 감지 */ });
```

- `pushState`로 URL을 바꿔도 브라우저는 서버에 새 요청을 보내지 않아요. 주소창의 글자만 바뀌는 거죠.
- 그래서 URL이 바뀐 시점에 **우리가 직접** 화면을 다시 그려야 합니다.
- 뒤로가기/앞으로가기는 `popstate` 이벤트로 감지하면 돼요.

이걸 알고 나니 갑자기 라우팅이 너무 평범해 보이기 시작했어요. 🤯

&nbsp;

## 🛠️ 1차 구현 — 정적 경로 라우터

먼저 동적 파라미터(`:id` 같은 것) 없이, 정적인 경로만 매칭하는 라우터를 만들어봤어요!

```typescript
// mini-router.ts
type Route = {
  path: string;
  component: () => string;
};

const routes: Route[] = [];
const root = document.getElementById('root')!;

export function addRoute(path: string, component: () => string) {
  routes.push({ path, component });
}

export function navigate(path: string) {
  history.pushState(null, '', path); // URL만 바꾸고 새로고침은 막는다
  render();
}

function render() {
  const path = window.location.pathname;
  const route = routes.find((r) => r.path === path);

  root.innerHTML = route ? route.component() : '<h1>404</h1>';
}

// 뒤로가기/앞으로가기 처리
window.addEventListener('popstate', render);

export function start() {
  render();
}
```

사용법은 React Router랑 비슷하게 만들었어요!

```typescript
import { addRoute, navigate, start } from './mini-router';

addRoute('/', () => '<h1>🏠 홈</h1>');
addRoute('/about', () => '<h1>📖 소개</h1>');

start();

// 어디서든 navigate 호출하면 화면이 바뀐다
navigate('/about');
```

`navigate('/about')`을 부르면 URL이 바뀌고 화면도 같이 바뀝니다. 🎉

여기서도 살짝 들떴어요. *"어, 이거 거의 라우터 같은데?"* 🤔

근데 또 다음 단계에서 한 방에 깨지죠.

&nbsp;

## 😱 첫 번째 시련: `<a>` 태그를 클릭하니 새로고침이 발생한다

진짜 SPA처럼 쓰려면 `<a href="/about">소개</a>` 같은 링크를 클릭했을 때도 새로고침이 일어나면 안 되잖아요?

근데 위 라우터에 그냥 `<a>` 태그를 박아두면...

```html
<a href="/about">소개로 가기</a>
```

클릭하는 순간 **페이지 전체가 새로고침**됩니다. 😱

그도 그럴 게, `<a>` 태그의 기본 동작이 "서버에 새 요청 보내고 페이지 전체 다시 받기"니까요. 우리가 만든 `navigate` 함수는 호출조차 안 됩니다. 🥶

> "그럼 모든 링크를 직접 만들어야 하나?"  
> "React Router는 `<Link>`라는 자기들 컴포넌트를 쓰던데... 그걸 흉내내야 하나?"

방법은 두 가지예요.

1. **전용 `<Link>` 컴포넌트를 만든다** (React Router 방식)
2. **`<a>` 클릭 이벤트를 모두 가로채서 기본 동작을 막는다**

두 번째 방법이 훨씬 손이 덜 가니까, 그걸로 갔어요! 😎

&nbsp;

## 🪜 해법 — 링크 클릭을 통째로 가로채기

`document` 전체에 클릭 리스너를 하나만 달아두고, 클릭된 게 `<a>`면 기본 동작을 막은 다음 `navigate`를 부르도록 했어요.

```typescript
// mini-router.ts (개선판)
function init() {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a'); // 자식 요소 클릭도 잡아준다
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || !href.startsWith('/')) return; // 외부 링크는 그대로

    e.preventDefault(); // 새로고침 막기
    navigate(href);
  });

  window.addEventListener('popstate', render);
}
```

핵심 포인트만 짚으면!

- 🎯 **`closest('a')`** — `<a>` 안에 `<span>`이나 아이콘이 들어있어도 부모 `<a>`를 찾아줍니다.
- 🚪 **외부 링크는 패스** — `https://`로 시작하는 링크까지 가로채면 외부 사이트로 못 가니까요.
- 🛑 **`e.preventDefault()`** — 이게 없으면 새로고침을 못 막아요!

이제 평범하게 `<a href="/about">`이라고 써도 SPA처럼 동작합니다! ✨

&nbsp;

## 🎯 두 번째 시련: 동적 파라미터를 매칭해야 한다

`/posts/:id`처럼 URL의 일부분이 동적으로 바뀌는 경로는 어떻게 매칭할까요? 단순 문자열 비교로는 절대 안 되죠. 🤨

이 부분에서 한참 끙끙댔어요. URL 패턴을 정규식으로 변환하는 발상이 떠오르기까지 시간이 좀 걸렸거든요.

```typescript
// '/posts/:id' → /^\/posts\/([^/]+)$/
function matchPath(pattern: string, path: string) {
  const paramNames: string[] = [];
  const regexStr = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1)); // ':id' → 'id'
        return '([^/]+)'; // 슬래시를 제외한 한 칸
      }
      return segment;
    })
    .join('/');

  const regex = new RegExp(`^${regexStr}$`);
  const match = path.match(regex);

  if (!match) return null;

  // 정규식 캡처 그룹과 파라미터 이름을 매핑
  const params: Record<string, string> = {};
  paramNames.forEach((name, i) => {
    params[name] = match[i + 1];
  });

  return params;
}
```

테스트해보면!

```typescript
matchPath('/posts/:id', '/posts/123');
// → { id: '123' }

matchPath('/posts/:id/comments/:commentId', '/posts/123/comments/45');
// → { id: '123', commentId: '45' }

matchPath('/posts/:id', '/about');
// → null
```

🎉 잘 동작해요!

이제 `render` 함수를 살짝 고쳐서 매칭된 라우트의 `params`를 컴포넌트에 넘겨주도록 했습니다.

```typescript
type Route = {
  path: string;
  component: (params: Record<string, string>) => string;
};

function render() {
  const path = window.location.pathname;

  for (const route of routes) {
    const params = matchPath(route.path, path);
    if (params) {
      root.innerHTML = route.component(params);
      return;
    }
  }

  root.innerHTML = '<h1>404 — Page Not Found 😢</h1>';
}
```

사용 예시는 이렇게 깔끔해져요! 👇

```typescript
addRoute('/posts/:id', (params) => `<h1>📄 포스트 ${params.id}</h1>`);
```

&nbsp;

## 🎨 합쳐서 굴려보기

여기까지 만든 mini-router로 작은 블로그를 흉내 내봤어요!

```typescript
import { addRoute, start } from './mini-router';

addRoute('/', () => `
  <div>
    <h1>🏠 미니 블로그</h1>
    <a href="/posts/1">첫 번째 글</a>
    <a href="/posts/2">두 번째 글</a>
    <a href="/about">소개</a>
  </div>
`);

addRoute('/posts/:id', (params) => `
  <div>
    <h1>📄 포스트 ${params.id}</h1>
    <a href="/">← 홈으로</a>
  </div>
`);

addRoute('/about', () => `
  <div>
    <h1>📖 소개</h1>
    <a href="/">← 홈으로</a>
  </div>
`);

start();
```

링크를 클릭해도 새로고침이 안 일어나고, 뒤로가기 버튼도 자연스럽게 작동해요. URL의 `:id`도 잘 잡힙니다! ✨

&nbsp;

## 🤔 진짜 React Router는 어떻게 다를까?

당연하지만 우리가 만든 100줄짜리 mini-router는 **진짜 React Router가 아니에요!** 🙅 차이를 짧게 정리해보면:

- 🧩 **컴포넌트 기반이에요.** 우리는 문자열을 `innerHTML`에 박아넣지만, 진짜 React Router는 React 컴포넌트 트리를 갱신합니다. 그래서 컴포넌트의 상태가 보존되고, 부분적으로만 다시 렌더링돼요.
- 🔗 **`<Link>` 전용 컴포넌트를 제공해요.** 우리는 `<a>` 클릭을 통째로 가로챘는데, React Router는 `<Link>` 컴포넌트가 알아서 `e.preventDefault()` + `navigate`를 처리합니다.
- 🪜 **중첩 라우트를 지원해요.** `/dashboard` 안에 `/dashboard/profile`이 있는 식으로, 라우트 트리를 만들 수 있어요. 우리 구현은 평면 배열이라 중첩이 안 됩니다.
- 🛡️ **로더, 가드, 데이터 페칭** 같은 고급 기능이 잔뜩 있어요. v6.4부터는 데이터 라우팅까지 지원하죠.
- 🪟 **HashRouter도 있어요.** `pushState`가 안 되는 환경(예: GitHub Pages)에서 `#/posts/123`처럼 해시 기반으로 동작하는 변형이에요.

근데 이번에도 신기한 건, 디테일을 다 빼고 봤을 때 핵심 아이디어는 결국 **"History API + 패턴 매칭 + 클릭 가로채기"** 라는 한 줄로 요약된다는 거예요. 🎯

&nbsp;

## 🎬 마무리

만들고 나니 두 가지가 머릿속에 진하게 남았어요.

✅ **"브라우저 API가 이미 다 해주고 있었다!"**  
라우팅의 핵심은 라우터 라이브러리가 아니라 **브라우저의 History API**였어요. 라이브러리는 그 API를 사용하기 좋게 포장해준 것뿐이라는 사실이, 처음엔 좀 허무하면서도 한편으로는 시원하더라고요. 😅

✅ **"클릭 이벤트 위임의 강력함"**  
모든 `<a>` 태그에 일일이 리스너를 다는 게 아니라, `document` 하나에 리스너를 달고 `closest('a')`로 잡아내는 패턴이 정말 깔끔했어요. 이건 라우터 외에도 응용할 곳이 정말 많을 것 같아요. 💡

&nbsp;

라우터를 직접 만들어보고 나니, 그동안 라이브러리 뒤에 가려져 있던 **History API**와 **이벤트 위임**이라는 두 도구가 새삼 든든하게 느껴졌어요. 라이브러리는 결국 이 도구들을 사용하기 좋게 포장해줄 뿐이라는 사실을 한 번 손으로 확인해보길 잘했다는 생각이 듭니다! 🚀✨

```toc
```
