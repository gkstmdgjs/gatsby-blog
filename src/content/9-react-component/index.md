---
emoji: 🧩
title: 'React Component 직접 만들기'
date: '2025-10-19'
categories: Dev React Frontend
---

[라우터를 직접 만들어볼 때](/8-react-router) 한 가지 찝찝한 부분이 있었어요. 바로 화면을 그릴 때 `innerHTML`에 문자열을 통째로 박아넣었다는 점이죠. 😅

```typescript
root.innerHTML = route.component(params); // 이 한 줄이 너무 단순하다
```

진짜 React는 이렇게 안 하잖아요? **컴포넌트라는 단위**가 있고, **JSX**라는 신기한 문법이 있고, 한 부분만 바뀌어도 그 부분만 다시 그리는 **Virtual DOM**이라는 게 있죠. 🤔

> "JSX는 도대체 어떻게 자바스크립트가 되는 거야?"  
> "Virtual DOM은 또 뭐고, 왜 그게 빠른 거지?"  
> "함수 컴포넌트는 그냥 함수인데, 어떻게 컴포넌트가 되는 걸까?"

검색하면 *"Virtual DOM 트리를 비교해서 효율적으로 갱신해요"* 같은 답이 돌아오는데, 매번 그렇듯 한 줄짜리 답으로는 머릿속에 그림이 안 그려지더라고요. 🥶

그래서 또 결심했죠. **"useState도 만들었고 Router도 만들었는데, 이번엔 컴포넌트 차례지!"** 💪

&nbsp;

## 📌 React Component의 정체

React를 처음 배우면 컴포넌트가 뭔가 거대한 시스템처럼 느껴지는데, 정작 본질을 파헤쳐보면 정말 단순한 세 가지 단계로 나뉘어요!

- 📝 **JSX** → `createElement` 호출의 syntactic sugar
- 🌳 **Virtual DOM** → 평범한 자바스크립트 객체 트리
- 🎨 **Reconciliation** → 두 트리를 비교해서 바뀐 부분만 DOM에 반영

이 셋만 차례로 만들면 컴포넌트 시스템이 완성됩니다! 🎯

&nbsp;

## 🧠 JSX의 정체 — 사실 그냥 함수 호출이다

처음에 가장 헷갈렸던 건 **JSX**였어요. HTML 같은데 자바스크립트 안에 들어가 있는 게 도대체 무슨 마법인가 싶었거든요.

근데 알고 보니, JSX는 **Babel이 평범한 함수 호출로 바꿔주는** 그저 문법 사탕이었어요. ✨

```jsx
// 이렇게 쓴 JSX는
const element = <h1 className="title">안녕!</h1>;

// 결국 이렇게 변환된다
const element = React.createElement('h1', { className: 'title' }, '안녕!');
```

`createElement` 함수가 돌려주는 건 **그냥 평범한 자바스크립트 객체**입니다.

```typescript
// 결과적으로 이런 객체가 만들어진다
{
  type: 'h1',
  props: { className: 'title', children: '안녕!' }
}
```

이걸 알게 됐을 때 살짝 허탈했어요. *"뭐야, JSX 마법이라더니 그냥 함수였잖아!"* 😅

&nbsp;

## 🛠️ 1차 구현 — createElement 만들기

직접 만들어보면 더 명확해져요!

```typescript
// mini-react.ts
type VNode =
  | string
  | {
      type: string | Function;
      props: Record<string, any>;
      children: VNode[];
    };

export function createElement(
  type: string | Function,
  props: Record<string, any> | null,
  ...children: VNode[]
): VNode {
  return {
    type,
    props: props || {},
    children: children.flat(), // 중첩 배열 평탄화
  };
}
```

이 함수 하나만 있으면 JSX를 흉내 낼 수 있어요. tsconfig에 `jsxFactory: "createElement"`를 박아두면 진짜 JSX도 쓸 수 있고요!

```typescript
// 사용 예시
const vnode = createElement('div', { id: 'app' },
  createElement('h1', null, '🏠 홈'),
  createElement('p', null, '안녕하세요!'),
);
```

결과로 만들어지는 건 이런 객체 트리예요. 👇

```text
{
  type: 'div',
  props: { id: 'app' },
  children: [
    { type: 'h1', props: {}, children: ['🏠 홈'] },
    { type: 'p', props: {}, children: ['안녕하세요!'] },
  ]
}
```

이게 바로 우리가 그렇게 들어왔던 **Virtual DOM**이에요. 별 거 아니죠? 🤯

&nbsp;

## 🎨 두 번째 단계 — vnode를 실제 DOM으로 그리기

객체 트리를 진짜 DOM으로 변환하는 함수가 필요합니다. 재귀로 돌면서 `document.createElement`를 호출하면 끝이에요!

```typescript
export function render(vnode: VNode, container: HTMLElement) {
  // 텍스트 노드 처리
  if (typeof vnode === 'string') {
    container.appendChild(document.createTextNode(vnode));
    return;
  }

  // 함수 컴포넌트는 호출해서 풀어낸다 (뒤에서 다룸)
  if (typeof vnode.type === 'function') {
    const result = vnode.type({ ...vnode.props, children: vnode.children });
    render(result, container);
    return;
  }

  // 일반 DOM 엘리먼트
  const el = document.createElement(vnode.type);

  // props 적용
  for (const [key, value] of Object.entries(vnode.props)) {
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, String(value));
    }
  }

  // children 재귀 처리
  vnode.children.forEach((child) => render(child, el));

  container.appendChild(el);
}
```

이제 `vnode`를 `render`에 넘기면 진짜 화면에 그려져요! 🎉

```typescript
const root = document.getElementById('root')!;
render(vnode, root);
```

잠깐 들떴어요. *"오, 이거 진짜 React 같은데?"* 😎

근데 다음 단계에서 또 한 방에 깨집니다.

&nbsp;

## 😱 첫 번째 시련: 매번 통째로 다시 그리는 비효율

상태가 바뀔 때마다 root 안의 DOM을 통째로 지우고 다시 그리면 어떻게 될까요?

```typescript
function render(vnode: VNode) {
  root.innerHTML = ''; // 통째로 지우기
  mount(vnode, root);  // 다시 그리기
}
```

당장 동작은 하는데, 문제가 한둘이 아니에요. 😱

- 🐌 **느려요.** 작은 부분 하나만 바뀌어도 전체 트리를 다시 만듭니다.
- 🎯 **input의 포커스가 사라집니다.** 사용자가 글자를 치는 도중에 포커스가 날아가요.
- 🎬 **CSS 트랜지션이 끊어집니다.** 노드가 재생성되니까요.

> "그럼 어떻게 바뀐 부분만 골라서 갱신하지?"  
> "이전 상태와 비교해야 하나?"

여기서 React의 가장 유명한 기법인 **Reconciliation(diffing)** 이 등장합니다! 🪄

&nbsp;

## 🪜 해법 — 두 vnode 트리 비교하기

이전 vnode 트리와 새 vnode 트리를 비교해서, **달라진 부분만 DOM에 반영**하면 돼요. 가장 단순한 diffing은 이런 규칙이에요.

- 🔄 **타입이 다르면** → 노드를 새로 만든다
- 🎨 **타입이 같으면** → props만 갱신하고 children을 재귀적으로 비교
- ➕ **새 children이 더 많으면** → 추가 노드를 만든다
- ➖ **이전 children이 더 많으면** → 남은 노드를 제거한다

이 규칙을 그대로 코드로 옮겨봤어요!

```typescript
export function diff(
  parent: HTMLElement,
  oldVNode: VNode | null,
  newVNode: VNode | null,
  index = 0,
) {
  const existing = parent.childNodes[index];

  // 1) 새 노드가 없으면 → 제거
  if (!newVNode) {
    if (existing) parent.removeChild(existing);
    return;
  }

  // 2) 기존 노드가 없으면 → 생성
  if (!oldVNode) {
    parent.appendChild(createDOM(newVNode));
    return;
  }

  // 3) 타입이 다르면 → 통째로 교체
  if (typeof oldVNode !== typeof newVNode || getType(oldVNode) !== getType(newVNode)) {
    parent.replaceChild(createDOM(newVNode), existing);
    return;
  }

  // 4) 텍스트 노드는 내용만 갱신
  if (typeof newVNode === 'string') {
    if (oldVNode !== newVNode) existing.textContent = newVNode;
    return;
  }

  // 5) 같은 타입의 엘리먼트 → props 갱신 + children 재귀
  updateProps(existing as HTMLElement, oldVNode.props, newVNode.props);

  const maxLen = Math.max(oldVNode.children.length, newVNode.children.length);
  for (let i = 0; i < maxLen; i++) {
    diff(
      existing as HTMLElement,
      oldVNode.children[i] || null,
      newVNode.children[i] || null,
      i,
    );
  }
}
```

복잡해 보이지만 결국 **"타입 비교 → props 갱신 → children 재귀"** 패턴이 반복될 뿐이에요! 🎯

이렇게 하면 input의 포커스도 살아있고, CSS 트랜지션도 끊기지 않아요. ✨

&nbsp;

## 🎯 두 번째 시련: 함수 컴포넌트 처리

진짜 React 같으려면 **함수 컴포넌트**도 지원해야겠죠?

```jsx
function Counter({ initial }) {
  return <h1>{initial}</h1>;
}

// 이렇게 쓰고 싶다
<Counter initial={0} />
```

JSX가 `createElement`로 바뀌면 함수 컴포넌트의 결과는 이런 객체가 돼요.

```typescript
{
  type: Counter,    // 함수 그 자체!
  props: { initial: 0 },
  children: [],
}
```

`type`이 문자열이 아니라 **함수**일 때, 그 함수를 호출해서 진짜 vnode를 풀어내면 됩니다.

```typescript
function resolve(vnode: VNode): VNode {
  if (typeof vnode === 'string') return vnode;
  if (typeof vnode.type === 'function') {
    const result = vnode.type({ ...vnode.props, children: vnode.children });
    return resolve(result); // 컴포넌트 안의 컴포넌트도 풀어준다
  }
  return vnode;
}
```

이제 함수 컴포넌트도 자유롭게 쓸 수 있어요! 🎉

&nbsp;

## 🔗 useState와 연결하기

[직접 만들어본 useState](/7-react-usestate)와 합치면 **진짜로 React 같은 모양**이 나옵니다!

```typescript
import { createElement, render, useState } from './mini-react';

function Counter() {
  const [count, setCount] = useState(0);

  return createElement('div', null,
    createElement('h1', null, `카운트: ${count}`),
    createElement('button', { onClick: () => setCount(count + 1) }, '+1'),
  );
}

render(createElement(Counter, null), document.getElementById('root')!);
```

버튼을 누르면 `setCount`가 리렌더를 트리거하고, diff가 돌면서 `<h1>` 안의 텍스트만 정확히 갱신돼요. 다른 DOM은 그대로 유지됩니다! ✨

이 순간 머릿속에서 React 라이브러리의 큰 그림이 한 번에 그려졌어요. 🤯

&nbsp;

## 🤔 진짜 React는 어떻게 다른가요?

당연하지만 우리가 만든 이 구현은 **진짜 React가 아니에요!** 🙅

- 🧬 **Fiber 아키텍처를 써요.** React 16부터는 트리를 한 번에 비교하지 않고, 작업 단위로 쪼개서 중간에 양보(yield)하면서 돌아갑니다. 이게 Concurrent 모드의 기반이에요.
- 🔑 **`key` prop으로 리스트를 효율적으로 비교해요.** 우리 구현은 인덱스로만 비교해서, 리스트 중간에 항목을 끼워넣으면 모든 노드가 다시 만들어집니다.
- 🪟 **이벤트 시스템도 자체적이에요.** React는 `addEventListener`를 일일이 달지 않고, root에 한 번만 달고 위임하는 SyntheticEvent를 씁니다.
- ⚡ **배칭과 우선순위가 정교해요.** 여러 setState를 묶어서 한 렌더로 처리하고, 우선순위가 높은 업데이트를 먼저 처리합니다.
- 💾 **메모이제이션이 잘 되어 있어요.** `useMemo`, `useCallback`, `React.memo`로 불필요한 재계산을 막아줍니다.

근데 이번에도 신기한 건, 이 디테일을 다 빼고 봐도 핵심은 **"vnode 트리를 비교해서 바뀐 부분만 DOM에 반영한다"** 는 한 줄이라는 거예요. 🎯

~~참고로 Virtual DOM이 항상 빠른 건 아니라고 해요. 단순한 동작에선 직접 DOM을 조작하는 게 더 빠른 경우도 많대요. Svelte 같은 라이브러리는 아예 컴파일 타임에 DOM 조작 코드를 만들어버려서 Virtual DOM을 안 씁니다.~~

&nbsp;

## 🎬 마무리

만들고 나니 두 가지가 진하게 남았어요!

✅ **"JSX는 마법이 아니라 함수 호출이었다!"**  
HTML처럼 보이는 그 신기한 문법이 결국 `createElement`라는 함수 한 번 호출이었다는 사실이, 처음엔 좀 허무했어요. 근데 동시에 *"이렇게 단순한 발상으로 React 같은 거대한 라이브러리를 만들어냈다고?"* 라는 감탄이 들기도 했습니다. 🤯

✅ **"diffing은 결국 트리 재귀였다!"**  
Virtual DOM이라는 개념이 너무 거창하게 들렸는데, 알고 보니 **그냥 두 객체 트리를 재귀로 비교하는 알고리즘**이더라고요. 트리 알고리즘 한 번 짜본 사람이라면 누구나 이해할 수 있는 수준이에요. 💡

&nbsp;

JSX, Virtual DOM, Reconciliation처럼 거창하게 들리던 단어들이 결국 **함수 호출, 객체 트리, 트리 재귀**로 풀리는 걸 손으로 확인하고 나니, 그동안 라이브러리 뒤에 숨어있던 React가 한층 평범하게 느껴졌어요. 라이브러리를 *"마법"* 으로 두지 않고 직접 분해해보길 정말 잘했다는 생각이 듭니다. 🚀✨

```toc
```
