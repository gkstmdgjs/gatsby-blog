---
emoji: 🔄
title: 'Redux 직접 만들기'
date: '2025-11-23'
categories: Dev React Frontend
---

[컴포넌트 시스템](/9-react-component)까지 만들어보니 이제 진짜 React를 흉내 낸다는 느낌이 들기 시작했어요. 그런데 React를 실무에서 써본 사람이라면 누구나 한 번쯤 마주치는 그 지옥이 있죠. 🥶

```jsx
<App>
  <Layout user={user} setUser={setUser}>
    <Header user={user}>
      <UserMenu user={user} setUser={setUser}>
        <ProfileBadge user={user} />
      </UserMenu>
    </Header>
  </Layout>
</App>
```

네, 그 유명한 **props drilling 지옥**입니다. 😱

> "user를 다섯 단계나 내려보냈는데 이게 맞나?"  
> "Context로 묶어볼까... 근데 그러면 모든 자식이 다시 렌더되잖아?"  
> "Redux를 써야겠지? 근데 Redux는 또 왜 그렇게 복잡한 거야?"

처음 Redux를 봤을 때 느낀 첫인상은 **"왜 이렇게 추상화가 많아?"** 였어요. 액션, 리듀서, 스토어, 디스패치, 미들웨어... 용어만 봐도 머리가 아팠습니다. 🤯

근데 그동안 직접 만들어보면서 한 가지 진리를 깨달았어요. **"라이브러리는 직접 만들어보면 더 쉬워진다."** 💪

&nbsp;

## 📌 Redux의 본질을 한 줄로

복잡해 보이지만 Redux의 핵심은 정말 단순해요!

> **"하나의 객체에 모든 상태를 모아두고, 그 객체를 바꾸는 방법을 함수로만 정해놓는다."**

이게 전부예요. 진짜로요. 🎯 거기에 다음 세 가지 약속만 더해지면 Redux가 됩니다.

- 📦 **Store** — 상태를 담아두는 단 하나의 그릇
- 📨 **Action** — 무슨 일이 일어났는지 설명하는 평범한 객체
- 🛠️ **Reducer** — 이전 상태와 액션을 받아 새 상태를 돌려주는 순수 함수

이 세 가지만 만들면 Redux 흉내가 끝나요!

&nbsp;

## 🛠️ 1차 구현 — createStore 만들기

가장 작은 Redux를 만들어볼게요!

```typescript
// mini-redux.ts
type Action = { type: string; [key: string]: any };
type Reducer<S> = (state: S, action: Action) => S;
type Listener = () => void;

export function createStore<S>(reducer: Reducer<S>, initial: S) {
  let state = initial;
  const listeners: Listener[] = [];

  const getState = () => state;

  const dispatch = (action: Action) => {
    state = reducer(state, action); // 새 상태로 교체
    listeners.forEach((l) => l());  // 변경 알림
  };

  const subscribe = (listener: Listener) => {
    listeners.push(listener);
    return () => {
      const i = listeners.indexOf(listener);
      if (i >= 0) listeners.splice(i, 1);
    };
  };

  return { getState, dispatch, subscribe };
}
```

진짜로 이게 끝이에요. 30줄도 안 돼요. 😅

사용해봅시다!

```typescript
type CounterState = { count: number };

const counterReducer: Reducer<CounterState> = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    default:
      return state;
  }
};

const store = createStore(counterReducer, { count: 0 });

store.subscribe(() => console.log('상태:', store.getState()));

store.dispatch({ type: 'INCREMENT' }); // 상태: { count: 1 }
store.dispatch({ type: 'INCREMENT' }); // 상태: { count: 2 }
store.dispatch({ type: 'RESET' });     // 상태: { count: 0 }
```

🎉 잘 동작해요!

이 시점에 살짝 들떴어요. *"어, 진짜 Redux가 30줄짜리 라이브러리였다고?"* 🤯

근데 또 다음 단계에서 한 방에 깨졌습니다.

&nbsp;

## 😱 첫 번째 시련: reducer 하나로는 너무 거대해진다

실제 앱이 커지면 상태가 한두 개로 끝나지 않잖아요? 사용자 정보, 장바구니, UI 상태, 알림... 이걸 다 한 reducer에 박아넣으면?

```typescript
function rootReducer(state, action) {
  switch (action.type) {
    case 'USER_LOGIN': /* ... */
    case 'USER_LOGOUT': /* ... */
    case 'CART_ADD': /* ... */
    case 'CART_REMOVE': /* ... */
    case 'UI_OPEN_MODAL': /* ... */
    case 'UI_CLOSE_MODAL': /* ... */
    case 'NOTIFICATION_PUSH': /* ... */
    // ... 100개쯤 더
  }
}
```

…네, 손대고 싶지 않은 코드가 됐어요. 😱

도메인별로 reducer를 나누고 싶은데, 어떻게 합칠 수 있을까요?

> "그럼 각 도메인 reducer가 자기 영역의 상태만 보면 되지 않나?"  
> "그걸 합쳐주는 함수를 만들면 되지 않을까?"

이걸 해결하는 게 바로 Redux의 `combineReducers`예요!

&nbsp;

## 🪜 해법 — combineReducers로 도메인 분리

각 reducer가 **자기 영역의 상태**만 받고, 새 객체를 반환하도록 묶어주는 함수예요.

```typescript
type ReducerMap = Record<string, Reducer<any>>;

export function combineReducers(reducers: ReducerMap): Reducer<any> {
  return (state = {}, action) => {
    const next: Record<string, any> = {};
    let changed = false;

    for (const [key, reducer] of Object.entries(reducers)) {
      const prev = state[key];
      const curr = reducer(prev, action);
      next[key] = curr;
      if (prev !== curr) changed = true;
    }

    return changed ? next : state; // 안 바뀌었으면 같은 참조 반환
  };
}
```

핵심 포인트만 짚으면!

- 🎯 **각 reducer는 자기 키의 상태만 본다** — `userReducer`는 `state.user`만, `cartReducer`는 `state.cart`만 보면 됩니다.
- ⚡ **참조 동일성 최적화** — 아무것도 안 바뀌었으면 새 객체를 만들지 않고 이전 상태를 그대로 반환해요. 이게 React-Redux의 `useSelector`가 빠른 이유 중 하나예요.

사용은 이렇게!

```typescript
const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  ui: uiReducer,
});

const store = createStore(rootReducer, {
  user: { name: null },
  cart: { items: [] },
  ui: { modalOpen: false },
});
```

이제 `store.getState()`를 부르면 도메인별로 잘 정리된 상태 객체가 돌아와요. ✨

&nbsp;

## 🎯 두 번째 시련: 비동기 로직과 로깅은 어디에 두지?

Reducer는 **순수 함수**여야 한다는 약속이 있죠. 그러면 API 호출 같은 비동기 작업은 어디서 해야 할까요? 🤔

또 다른 문제도 있어요. 디버깅할 때 어떤 액션이 dispatch 됐는지 로그를 찍고 싶은데, 모든 액션 호출부에 일일이 `console.log`를 넣을 순 없잖아요?

> "dispatch를 가로채서 그 사이에 뭔가 끼워넣을 수 있다면 어떨까?"

이 발상이 바로 **미들웨어**예요! 🪄

&nbsp;

## 🛡️ 미들웨어 만들기

미들웨어는 `dispatch`를 감싸는 함수예요. 액션이 reducer에 도달하기 **전에** 가로채서 뭔가를 할 수 있게 해줍니다.

```typescript
type Middleware = (store: any) => (next: (action: Action) => any) => (action: any) => any;

export function applyMiddleware(...middlewares: Middleware[]) {
  return (createStoreFn: typeof createStore) =>
    <S,>(reducer: Reducer<S>, initial: S) => {
      const store = createStoreFn(reducer, initial);

      // 미들웨어 체인을 만든다
      let dispatch = store.dispatch;
      const chain = middlewares.map((mw) => mw({
        getState: store.getState,
        dispatch: (action: Action) => dispatch(action),
      }));

      // 오른쪽부터 감싸나간다
      dispatch = chain.reduceRight((next, mw) => mw(next), store.dispatch);

      return { ...store, dispatch };
    };
}
```

미들웨어 두 개를 직접 만들어볼게요!

### 📝 logger 미들웨어

```typescript
const logger: Middleware = (store) => (next) => (action) => {
  console.group(action.type);
  console.log('이전:', store.getState());
  console.log('액션:', action);
  const result = next(action); // reducer로 통과시킨다
  console.log('이후:', store.getState());
  console.groupEnd();
  return result;
};
```

dispatch할 때마다 콘솔에 보기 좋게 그룹으로 묶여 출력돼요! 🎯

### ⚡ thunk 미들웨어 (비동기 처리)

함수를 dispatch할 수 있게 해주는 미들웨어예요!

```typescript
const thunk: Middleware = (store) => (next) => (action) => {
  // 액션이 함수면 그냥 호출해버린다
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  }
  return next(action); // 평범한 객체면 그냥 통과
};
```

이렇게 쓸 수 있어요!

```typescript
const fetchUser = (id: number) => async (dispatch, getState) => {
  dispatch({ type: 'USER_LOADING' });
  try {
    const user = await fetch(`/api/users/${id}`).then((r) => r.json());
    dispatch({ type: 'USER_LOADED', user });
  } catch (e) {
    dispatch({ type: 'USER_ERROR', error: e });
  }
};

store.dispatch(fetchUser(123)); // 함수를 dispatch!
```

처음 thunk를 봤을 땐 *"함수를 dispatch한다고??"* 했는데, 미들웨어를 직접 만들어보고 나니 진짜 단순한 트릭이라는 게 보였어요. 😎

&nbsp;

## 🎨 React에 연결해보기

[직접 만들어본 useState](/7-react-usestate)와 합치면 React-Redux 흉내까지 낼 수 있어요!

```typescript
import { useState, useEffect } from './mini-react';

export function useSelector<S, T>(store: any, selector: (state: S) => T): T {
  const [value, setValue] = useState(selector(store.getState()));

  useEffect(() => {
    return store.subscribe(() => {
      const next = selector(store.getState());
      setValue(next);
    });
  }, []);

  return value;
}
```

`useSelector`는 store가 변경될 때마다 컴포넌트를 다시 렌더링해주는 훅이에요!

```typescript
function CartBadge() {
  const itemCount = useSelector(store, (s) => s.cart.items.length);
  return createElement('span', null, `🛒 ${itemCount}`);
}
```

진짜 React-Redux는 여기에 컨텍스트랑 최적화가 더해진 형태일 뿐, 본질은 똑같아요! ✨

&nbsp;

## 🤔 진짜 Redux는 어떻게 다른가요?

당연하지만 우리가 만든 100줄짜리 mini-redux는 **진짜 Redux가 아니에요!** 🙅

- 🧊 **불변성을 강제하지 않아요.** 진짜 Redux는 reducer 안에서 상태를 직접 수정하면 안 된다는 약속이 있는데, 우리 구현은 검증을 안 해요. Redux Toolkit의 `createSlice`는 Immer를 써서 mutable처럼 보이는 코드도 안전하게 처리해줍니다.
- 🛠️ **Redux Toolkit이 사실상 표준이에요.** 요즘은 `createStore` 직접 쓰는 일이 거의 없어요. `configureStore`, `createSlice`, `createAsyncThunk`로 boilerplate가 확 줄었습니다.
- 🔍 **Redux DevTools 지원이 정교해요.** 시간 여행, 액션 재생 등 디버깅 도구가 막강해요. 우리 구현은 그냥 `console.log`만 찍죠.
- 🪟 **Zustand, Jotai 같은 대안도 많아요.** 요즘은 더 가벼운 상태 관리 라이브러리들이 인기예요. 사실 Redux가 무겁다는 비판을 많이 받았거든요.

근데 이번에도 신기한 건, 디테일을 다 빼고 봐도 핵심은 **"단일 객체 + 순수 함수로 상태 변경"** 한 줄이에요. 🎯

~~참고로 Redux의 영감이 된 건 Elm 언어의 아키텍처라고 합니다. 함수형 프로그래밍의 아이디어를 자바스크립트에 가져온 거였어요.~~

&nbsp;

## 🎬 마무리

다 만들고 나서 든 가장 큰 깨달음은 두 가지였어요.

✅ **"라이브러리도 결국 평범한 자바스크립트다!"**  
Redux는 거대한 시스템 같았는데, 핵심만 추리면 결국 **단일 객체 + 순수 함수 + 구독자 패턴** 정도더라고요. 자바스크립트 기본기를 잘 다지면 어떤 라이브러리든 결국 이해할 수 있다는 자신감이 생겼어요. 💪

✅ **"직접 만들어보면 잘 쓰게 된다!"**  
그동안 막연하게 외워서 쓰던 액션·리듀서·미들웨어가 *"아, 그래서 그런 거였구나!"* 로 바뀌는 순간이 정말 많았어요. 직접 만든 라이브러리는 100줄짜리에 불과하지만, 그 안에 들어있는 아이디어들은 진짜 Redux 코드를 읽을 때 든든한 지도가 되어줍니다! 🗺️

```toc
```
