---
emoji: 🪝
title: 'React useState 직접 만들기'
date: '2025-08-10'
categories: Dev React Frontend
---

React를 처음 배웠을 때, 도무지 머리에 안 들어오는 코드가 하나 있었어요. 🤔

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

함수 컴포넌트는 매 렌더마다 처음부터 다시 실행된다고 했잖아요? 그러면 `useState(0)`도 매번 다시 호출될 텐데, 왜 두 번째 클릭에서 `0`이 아니라 `1`이 나오는 걸까요? 🤯

> "아니 매번 0으로 초기화될 텐데 왜 카운트가 올라가지?"  
> "setCount는 도대체 어디다가 값을 저장해두는 거야?"

검색을 해봐도 *"클로저로 상태를 보관한다"* 같은 한 줄짜리 답만 돌아왔어요. 그걸로 끝내자니 머릿속에 남는 게 하나도 없더라고요. 😅

그래서 결심했습니다. **"한 번 만들어보면 끝나는 일이잖아!"** 💪

&nbsp;

## 📌 useState가 뭐길래?

`useState`는 함수 컴포넌트에서 상태를 다루는 가장 기본적인 훅이에요. 호출하면 **현재 값**과 **그 값을 바꾸는 함수**를 배열로 돌려줍니다.

```jsx
const [value, setValue] = useState(initial);
```

문법은 한 줄인데, 이게 **함수 안에서** 동작한다는 게 항상 마음에 걸렸어요. 함수가 끝나면 안의 변수는 다 날아갈 텐데, `value`는 어떻게 살아남는 걸까요? 🤨

여기서부터 클로저 이야기가 시작됩니다.

&nbsp;

## 🧠 매번 호출돼도 값이 살아남는 이유

자바스크립트에서 함수 안의 코드가 **함수 바깥의 변수**를 참조하는 순간, 그 변수와 함수는 한 묶음이 됩니다. 함수가 다시 호출되든 안 되든, 변수는 사라지지 않아요. ✨

이걸 뒤집으면 답이 나오죠. **"매번 새로 실행되는 함수에서도 어디선가 값을 기억하게 만들 수 있다!"**

가장 단순한 형태로 옮겨보면 이렇게 됩니다.

```typescript
// 함수 바깥의 _state는 모듈이 살아있는 한 사라지지 않는다
let _state: any;

function useState<T>(initial: T): [T, (next: T) => void] {
  if (_state === undefined) _state = initial;

  const setState = (next: T) => {
    _state = next;
  };

  return [_state, setState];
}
```

핵심은 **`_state`가 함수 바깥에 있다는 것!** 이거 하나뿐이에요. 1초마다 호출되든 1만 번 호출되든 같은 변수를 다시 들여다보게 되는 거죠. 🎯

&nbsp;

## 🛠️ 1차 구현 — 일단 카운터 굴려보기

DOM은 잠깐 미뤄두고, 콘솔로만 굴려봤어요!

```typescript
// mini-react.ts
let _state: any;

export function useState<T>(initial: T): [T, (next: T) => void] {
  if (_state === undefined) _state = initial;

  const setState = (next: T) => {
    _state = next;
    render(); // 상태가 바뀌면 다시 그려줘야 한다
  };

  return [_state, setState];
}

function Counter() {
  const [count, setCount] = useState(0);
  console.log(`렌더링: count = ${count}`);

  setTimeout(() => setCount(count + 1), 1000);
}

function render() {
  Counter();
}

render();
```

```text
렌더링: count = 0
렌더링: count = 1
렌더링: count = 2
...
```

오, 잘 굴러가네요! 🎉

솔직히 이때 좀 들떴어요. *"이거 거의 React 같은데?"* 라는 자만이 머릿속을 스쳤거든요. 😎

근데 그 자만은 다음 단계에서 정확히 한 방에 깨졌습니다.

&nbsp;

## 😱 첫 번째 시련: useState 두 번 호출하기

실제 컴포넌트는 상태 한 개로 끝나는 경우가 거의 없죠. 이름이랑 나이를 동시에 관리해봤어요.

```typescript
function Profile() {
  const [name, setName] = useState('Honey');
  const [age, setAge] = useState(20);
  console.log(name, age);
}
```

기대값은 당연히 `Honey 20`이겠지만... 실제 출력은?

```text
20 20
```

😱😱😱

두 변수가 같은 값으로 덮였어요. 이유는 단순합니다. `_state`라는 칸이 **단 하나뿐**이니까, 두 번째 `useState(20)`이 첫 번째 값을 그냥 지워버린 거죠.

> "그럼 useState를 두 번 쓸 때마다 변수를 새로 만들어줘야 하나?"  
> "근데 함수가 자기 호출 시점을 어떻게 알지?"

여기서 머리를 한참 굴렸어요. 🥶

그리고 React가 이 문제를 어떻게 풀었는지 알게 됐을 때, 살짝 충격을 받았습니다. *"이걸 진짜 이렇게 풀었다고?"* 싶을 만큼 단순하면서도 영악한 방법이었거든요!

&nbsp;

## 🪜 React의 해법 — 호출 순서를 믿는다

React가 채택한 트릭은 한 줄로 요약돼요.

> "한 컴포넌트는 매번 같은 순서로 훅을 호출한다는 걸 믿고, **호출된 순서대로 슬롯을 부여한다.**"

말로만 들으면 위태로운데, 함수 컴포넌트가 훅을 조건문으로 감싸지 않는다는 규칙만 지켜진다면 의외로 잘 굴러갑니다. 🤯

배열과 인덱스로 옮겨봤어요!

```typescript
// mini-react.ts (개선판)
const states: any[] = [];
let cursor = 0;

export function useState<T>(initial: T): [T, (next: T) => void] {
  const index = cursor; // 이번 호출이 가져갈 슬롯 번호를 클로저에 박아둔다
  if (states[index] === undefined) {
    states[index] = initial;
  }

  const setState = (next: T) => {
    states[index] = next; // 자기 슬롯만 정확히 갱신
    render();
  };

  cursor += 1;
  return [states[index], setState];
}

export function render() {
  cursor = 0; // 렌더 시작 전에 커서를 처음으로 되돌린다
  Component();
}
```

진짜 중요한 두 줄을 한 번 더 짚어볼게요!

- `const index = cursor;` ← 이 한 줄이 **마법**이에요. 호출 시점의 `cursor` 값이 클로저에 박혀버리니까, 나중에 어떤 `setState`가 호출돼도 자기 슬롯을 정확히 찾아갑니다. 🎯
- `cursor = 0;` ← 매 렌더 시작 시 커서를 초기화해서, 같은 순서로 훅을 호출하면 같은 슬롯이 매핑되도록 보장해줘요.

여기까지 만들고 나서야 React 공식문서의 그 유명한 규칙이 비로소 와닿았어요!

> **"훅은 절대로 조건문이나 반복문 안에서 호출하지 마세요."**

훅 호출 순서가 한 번이라도 어긋나면, `index`가 한 칸씩 밀리면서 엉뚱한 슬롯을 가리키게 되거든요. 🚨

```jsx
// ❌ 호출 순서가 어긋나면 슬롯이 한 칸씩 밀린다
if (someCondition) {
  const [a] = useState(1); // 어떤 렌더에서는 호출되고
}                          // 어떤 렌더에서는 호출 안 되는 순간
const [b] = useState(2);   // b가 받아오는 슬롯이 매번 달라진다
```

> "아하! 이래서 `react-hooks/rules-of-hooks` ESLint 룰이 그렇게 깐깐했구나..." 😎

오랫동안 외우기만 했던 규칙이 한 줄짜리 클로저로 설명되는 게 너무 신기했습니다.

&nbsp;

## 🎨 DOM에 붙여서 진짜 컴포넌트처럼

콘솔만 찍던 카운터를 진짜 DOM에 그려봤어요!

```typescript
// app.ts
import { useState, render } from './mini-react';

const root = document.getElementById('root')!;

function Counter() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('안녕하세요!');

  root.innerHTML = `
    <div>
      <p>${message}</p>
      <p>카운트: ${count}</p>
      <button id="inc">+1</button>
      <button id="reset">리셋</button>
    </div>
  `;

  document.getElementById('inc')!.onclick = () => setCount(count + 1);
  document.getElementById('reset')!.onclick = () => {
    setCount(0);
    setMessage('다시 시작! 🔄');
  };
}

(window as any).Component = Counter;
render();
```

버튼을 눌러보면 두 상태가 진짜로 각자의 슬롯에서 따로따로 잘 살아 있어요! ✨ `count`는 `+1` 버튼에 따라 1씩 올라가고, `message`는 리셋 버튼을 눌러야만 바뀝니다.

여기서 한 가지 의문이 생기실 수 있어요.

> "근데 reset에서 setCount, setMessage를 연달아 부르잖아. 그러면 화면이 두 번 그려지는 건가?"

지금 우리 구현은 **네, 두 번 그려집니다!** 😅

실제 React는 이 두 호출을 묶어서 한 번만 그려주는데(이걸 **batching**이라고 해요), 그건 또 그 자체로 큰 주제라 이번 글에서는 다루지 않았어요.
실무에서 한 번씩 마주치는 *"왜 setState를 두 번 했는데 한 번만 렌더링되지?"* 같은 의문이 다 이 배칭 때문이었구나, 정도만 짚고 넘어가도 충분합니다! 👍

&nbsp;

## 🤔 그래서 진짜 React는 어떻게 다른가요?

당연한 얘기지만 우리가 만든 이 50줄짜리 mini-react는 **진짜 React가 아니에요!** 🙅

차이를 짧게 정리해보면:

- 🧩 **컴포넌트마다 슬롯이 따로 분리됩니다.** 우리는 전역 `states` 배열 하나를 다 같이 쓰지만, 진짜 React는 컴포넌트(정확히는 Fiber 노드)마다 훅 리스트를 따로 가져요. 그래서 `Counter`와 `Profile`을 동시에 렌더해도 슬롯이 안 섞입니다.
- 🔗 **배열 인덱스가 아니라 연결 리스트예요.** Fiber 안의 `memoizedState` 필드에 훅들이 `next` 포인터로 줄줄이 연결돼 있어요. 동작은 비슷한데 자료구조가 달라요.
- ⚡ **배칭과 우선순위가 있습니다.** `setState`를 여러 번 호출해도 한 렌더로 묶이고, Concurrent 모드에서는 우선순위가 높은 업데이트가 먼저 처리됩니다.
- 🧠 **얕은 비교로 불필요한 렌더를 막아줘요.** 이전 값과 같으면 아예 다시 그리지 않아요. 우리 구현은 무조건 다시 그렸죠. 😂

근데 신기한 건, 이 디테일을 다 빼고 봐도 핵심 아이디어는 **여전히 "호출 순서로 슬롯을 매핑한다"** 는 한 줄이라는 거예요. 이 한 줄을 손으로 만들어봤느냐 안 만들어봤느냐가, React가 마법으로 보이느냐 평범한 자바스크립트로 보이느냐를 가른다고 해도 과언이 아닐 것 같아요. 🪄

~~참고로 처음 훅 RFC가 공개됐을 때 *"이거 호출 순서에 의존하는 거 위험하지 않아?"* 라는 반응이 꽤 많았다고 합니다. 그 트레이드오프를 보완하려고 ESLint 룰까지 같이 만들어둔 거였대요.~~

&nbsp;

## 🎬 마무리

다 만들고 나니 두 가지가 머릿속에 진하게 남았어요.

✅ **"진짜 별 거 아니구나!"**  
훅이 뭔가 거대한 시스템처럼 느껴졌는데, 핵심만 추리면 결국 **모듈 스코프 변수 + 클로저 + 인덱스** 정도더라고요. 너무 단순해서, 그 위에 이런 거대한 생태계가 쌓였다는 게 더 신기하게 느껴졌어요. 🤯

✅ **"규칙에는 다 이유가 있다!"**  
"훅은 항상 같은 순서로 호출하라" 같은 규칙을 그동안은 그냥 외워서 지켰는데, 직접 만들어보고 나서야 그 규칙이 깨졌을 때 라이브러리가 어떻게 무너지는지 손으로 느껴졌습니다. 😎

&nbsp;

직접 만들어본 만큼 깊게 남고, 깊게 남은 만큼 더 잘 쓸 수 있다고 믿어요. 한 줄짜리 답으로 넘기지 않고 손으로 만들어보길 정말 잘했다는 생각이 듭니다. 🚀✨

```toc
```
