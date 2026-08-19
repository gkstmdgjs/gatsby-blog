---
emoji: ⏱️
title: 'React Time Slicing 만들기'
date: '2025-12-27'
categories: Dev React Frontend
---

어느 날 회사에서 마주친 코드 한 조각이 머릿속에서 떠나지 않았어요. 🤔

```jsx
function SearchResults({ items }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [pending, startTransition] = useTransition();

  const handleChange = (e) => {
    setQuery(e.target.value);
    startTransition(() => {
      // 5만 건 정렬 — 평소엔 메인 스레드를 5초 잡아먹는 작업
      const sorted = items
        .filter((it) => it.name.includes(e.target.value))
        .sort(heavyCompare);
      setResults(sorted);
    });
  };
  // ...
}
```

이 코드가 진짜 충격이었어요. 분명히 5만 건짜리 정렬이라 메인 스레드를 한참 잡아먹어야 정상인데, **타이핑이 뚝뚝 끊기지 않습니다.** 🤯

> "이거 Web Worker로 옮긴 거 아니지? 그냥 메인 스레드 코드인데?"  
> "근데 어떻게 5초짜리 작업이 입력을 안 막지?"  
> "분명히 자바스크립트는 싱글 스레드라 한 번에 하나만 처리한다고 외워뒀는데..."

검색을 해봐도 어김없이 한 줄짜리 답이 돌아왔어요. *"Time Slicing이라는 기법이에요. React Scheduler가 작업을 쪼개서 양보합니다."* 그래서 그래서 뭐... 어떻게? 🥶

그래서 또 결심했죠. **"한 번 만들어보면 끝나는 일이잖아!"** 💪

&nbsp;

## 📌 Time Slicing이 뭐길래

핵심부터 한 줄로 정리하면 이래요.

> **"메인 스레드는 정말 하나만 한다 — 그래서 작업을 잘게 쪼개고, 사이사이마다 브라우저에 양보한다."**

쪼갠 사이사이의 그 짧은 틈에 브라우저가 입력 처리, 페인트, 애니메이션 같은 일을 해치우면, 사용자는 *"화면이 안 멈췄네?"* 라고 느끼게 됩니다. 5만 건 정렬이 5초 걸리는 건 그대로지만, **지각된 응답성**이 완전히 달라져요. 🎯

핵심 단어 두 개를 짚고 갑니다.

- 🕐 **Frame Budget** — 60fps 기준 한 프레임은 16.6ms예요. 입력/페인트 등을 빼면 자바스크립트가 쓸 수 있는 건 보통 **5ms 정도**. 5ms 넘어가면 양보한다, 가 핵심 룰.
- ⏭️ **Yield** — "잠깐 멈추고 브라우저한테 마이크 넘기기". 다음 단락에서 진짜 중요한 부분이에요.

&nbsp;

## 🛠️ 1차 구현 — setTimeout으로 일단 쪼개보기

가장 단순한 발상부터 가봅시다. **setTimeout(fn, 0)** 으로 작업을 미루면, 그 사이에 브라우저가 잠깐이라도 일을 하지 않을까요?

```typescript
// mini-scheduler.ts (1차)
type Unit = () => void;

const queue: Unit[] = [];
let isFlushing = false;

export function schedule(unit: Unit) {
  queue.push(unit);
  if (!isFlushing) {
    isFlushing = true;
    flush();
  }
}

function flush() {
  setTimeout(() => {
    const unit = queue.shift();
    if (unit) unit();

    if (queue.length > 0) flush();
    else isFlushing = false;
  }, 0);
}
```

써보면!

```typescript
// 5만 건을 1만 건씩 5번에 나눠 정렬
const CHUNK = 10000;
for (let i = 0; i < items.length; i += CHUNK) {
  schedule(() => {
    sortChunk(items, i, i + CHUNK);
  });
}
```

오, 정말로 화면이 덜 멈춰요!  
*"이거 Time Slicing 같은데?"* 😎

근데 측정 결과를 보고 한 방에 깨졌습니다. 🥶

&nbsp;

## 😱 첫 번째 시련 — setTimeout의 4ms 클램프

```text
청크 1: 998ms
청크 2: 1003ms (yield 4ms 포함)
청크 3: 1006ms
청크 4: 1009ms
청크 5: 1004ms
─────────────
합계: 5초 + 16ms (yield 오버헤드)
```

5번 양보하는데 16ms가 그냥 사라졌어요.

원인은 브라우저의 **HTML5 setTimeout 클램프**예요. `setTimeout(fn, 0)` 을 호출해도 실제로는 **최소 4ms 후**에 실행됩니다. 게다가 nested setTimeout(타이머 안에서 또 타이머)이 5단계 이상 깊어지면 더 느려져요. [HTML 표준 문서](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html)에 명시된 동작입니다.

> "그럼 어떻게 더 빠르게 yield하지?"  
> "requestAnimationFrame? 그건 16ms마다 한 번이라 더 느리잖아!"  
> "Promise? 그건 microtask라 yield가 안 되는 거 아니었나?"

여기서 한참 끙끙댔어요. 그러다 **MessageChannel** 이라는 API를 발견했고, *"이걸 진짜 이렇게 쓴다고??"* 싶은 충격을 받았습니다. 🤯

&nbsp;

## 🪜 해법 — MessageChannel로 즉시 yield

`MessageChannel.port2.postMessage()`는 **다음 macrotask로 즉시 등록**돼요. setTimeout처럼 4ms 클램프가 없습니다. React Scheduler가 실제로 쓰는 트릭이에요!

```typescript
const channel = new MessageChannel();
let pending: (() => void) | null = null;

channel.port1.onmessage = () => {
  const fn = pending;
  pending = null;
  if (fn) fn();
};

function postNextTick(fn: () => void) {
  pending = fn;
  channel.port2.postMessage(null); // 즉시 다음 task로
}
```

여기에 **frame budget(5ms)** 개념을 더해서 진짜 work loop를 만들어봤어요.

```typescript
// mini-scheduler.ts (2차)
type Unit = () => void;

const queue: Unit[] = [];
let isFlushing = false;

const FRAME_BUDGET = 5; // 5ms 한도

export function schedule(unit: Unit) {
  queue.push(unit);
  if (!isFlushing) {
    isFlushing = true;
    postNextTick(workLoop);
  }
}

function workLoop() {
  const start = performance.now();

  while (queue.length > 0) {
    // 한 작업이 끝날 때마다 시간 체크
    if (performance.now() - start >= FRAME_BUDGET) {
      // 5ms를 넘었다 → 다음 macrotask로 양보
      postNextTick(workLoop);
      return;
    }

    const unit = queue.shift()!;
    unit();
  }

  isFlushing = false;
}
```

핵심을 한 번 더 짚을게요!

- 🕐 **`performance.now() - start >= FRAME_BUDGET`** — "5ms 넘었으면 그만"
- ⏭️ **`postNextTick(workLoop)`** — "다음 task에서 이어서 한다"
- 🎯 **`while (queue.length)`** — 한 task 안에서 가능한 만큼은 다 처리

이걸 적용하고 다시 측정하니!

```text
청크 1: 998ms
청크 2: 999ms (yield 0.2ms)
청크 3: 1000ms
청크 4: 1001ms
청크 5: 998ms
─────────────
합계: 5초 + 0.8ms ✨
```

setTimeout 대비 **20배 가까이 빠른 yield**. *"이게 React가 쓰는 트릭이었구나..."* 🤯

여기서 **microtask vs macrotask** 차이도 명확해졌어요.

| 분류 | 예시 | yield되나? |
|------|------|-----------|
| Microtask | `Promise.resolve().then`, `queueMicrotask` | ❌ 같은 task에서 처리 |
| Macrotask | `setTimeout`, `MessageChannel`, `setImmediate(Node.js)` | ✅ 다음 task로 넘어감 |

마이크로태스크는 **이번 task가 끝나기 전에 다 처리**돼요. 그래서 아무리 `await`을 걸어도 yield가 안 됩니다. yield하려면 macrotask로 넘어가야 해요. 5년차 시니어 면접에 나올 만한 개념이에요. 💡

&nbsp;

## 🎯 두 번째 시련 — 우선순위가 없다

지금 구현은 모든 작업을 FIFO로 처리합니다. 근데 이런 시나리오를 생각해보세요.

```typescript
// 백그라운드 데이터 갱신 (느긋해도 됨)
schedule(() => recomputeRecommendations());

// 사용자가 갑자기 타이핑 (급함!)
schedule(() => updateSearchInput(value));
```

사용자 입력은 **지금 당장** 반영되어야 하는데, 앞에 추천 갱신 작업이 5만 개 큐에 쌓여있으면? 사용자는 *"왜 이렇게 느려"* 라고 느끼게 됩니다. 🥶

React가 이걸 푸는 방식이 **lane 기반 우선순위**예요. 

> **"같은 큐에 있어도 급한 일은 먼저, 느긋한 일은 뒤로."**

&nbsp;

## 🪜 lane 기반 우선순위 흉내내기

```typescript
// mini-scheduler.ts (3차 — priority)
type Priority = 'urgent' | 'normal' | 'idle';

type Task = {
  unit: () => void;
  priority: Priority;
};

const queues: Record<Priority, Task[]> = {
  urgent: [],
  normal: [],
  idle: [],
};

export function schedule(unit: () => void, priority: Priority = 'normal') {
  queues[priority].push({ unit, priority });
  if (!isFlushing) {
    isFlushing = true;
    postNextTick(workLoop);
  }
}

function nextTask(): Task | undefined {
  return queues.urgent.shift() ?? queues.normal.shift() ?? queues.idle.shift();
}

function hasWork() {
  return queues.urgent.length + queues.normal.length + queues.idle.length > 0;
}

function workLoop() {
  const start = performance.now();

  while (hasWork()) {
    if (performance.now() - start >= FRAME_BUDGET) {
      postNextTick(workLoop);
      return;
    }
    nextTask()!.unit();
  }

  isFlushing = false;
}
```

이제 `useTransition`의 정체가 명확해져요. **느긋한 작업을 `idle` 우선순위로 등록하는 것**이 본질이거든요!

```typescript
// useTransition 흉내
function startTransition(fn: () => void) {
  schedule(fn, 'idle');
}

// 사용자 입력은 urgent로
function handleInput(value: string) {
  schedule(() => setQuery(value), 'urgent');

  // 무거운 갱신은 transition 안에서
  startTransition(() => {
    schedule(() => setResults(filterAndSort(value)), 'idle');
  });
}
```

타이핑은 **즉시 반영**되고, 무거운 정렬은 **틈틈이 처리**되는 구조가 만들어집니다! ✨

&nbsp;

## 🚨 함정 — Starvation

근데 여기에 함정이 하나 있어요. **idle 작업이 영원히 안 돌아가는 상황**이 생길 수 있습니다.

```typescript
// urgent 작업이 끊임없이 들어오면
setInterval(() => schedule(() => doUrgent(), 'urgent'), 1);
// idle 작업은 영원히 starve!
schedule(() => doIdle(), 'idle');
```

이걸 **Starvation(기아)** 이라고 해요. React는 이걸 **expiration time** 으로 풀어요. 작업을 등록할 때 "X ms 안에는 무조건 실행한다"는 데드라인을 같이 박아두고, 데드라인이 임박하면 우선순위를 강제로 올려버립니다.

```typescript
type Task = {
  unit: () => void;
  priority: Priority;
  expirationTime: number; // 절대 시간 — 이 시간 넘으면 강제 실행
};

const TIMEOUTS: Record<Priority, number> = {
  urgent: 250,        // 0.25초 안에는 무조건
  normal: 5000,       // 5초 안에는 무조건
  idle: 60_000,       // 1분 안에는 무조건
};

export function schedule(unit: () => void, priority: Priority = 'normal') {
  queues[priority].push({
    unit,
    priority,
    expirationTime: performance.now() + TIMEOUTS[priority],
  });
  // ...
}

function nextTask(): Task | undefined {
  const now = performance.now();

  // 만료된 작업이 있으면 우선순위 무시하고 먼저 실행
  for (const p of ['urgent', 'normal', 'idle'] as const) {
    const expired = queues[p].find((t) => t.expirationTime <= now);
    if (expired) {
      queues[p].splice(queues[p].indexOf(expired), 1);
      return expired;
    }
  }

  return queues.urgent.shift() ?? queues.normal.shift() ?? queues.idle.shift();
}
```

이 한 가지 트릭으로 *"느긋한 일도 결국엔 처리된다"* 는 보장이 생깁니다. 7년차도 이 디테일을 알면 *"오, 깊네"* 싶어요. 🎯

&nbsp;

## 🤔 진짜 React Scheduler는 어떻게 다른가?

당연하지만 우리가 만든 100줄짜리는 **진짜 React Scheduler가 아니에요!** 🙅

- 🪜 **5단계 우선순위** — `Immediate`, `UserBlocking`, `Normal`, `Low`, `Idle`. 우리는 3단계만.
- 🌲 **Min-Heap 자료구조** — 우선순위 큐를 배열 split이 아니라 min-heap으로 관리. O(log n) 삽입·추출.
- 🛣️ **Lane 모델 (React 18~)** — 우선순위를 **31비트 비트마스크**로 표현. 한 번에 여러 우선순위를 OR로 합치고, AND로 검사. 비트 연산으로 끝나니 진짜 빠름.
- 🪟 **`isInputPending()` 활용** — Chrome의 [scheduling API](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/postTask) 가 있는 환경에서는 *"입력 대기 중이면 즉시 yield"* 같은 더 정밀한 제어. 폴리필처럼 MessageChannel로 fallback.
- 💾 **Continuation 지원** — 한 작업이 5ms를 넘기면 *"이어서 할게"* 라고 callback을 다시 큐에 등록. 우리 구현은 작업 단위가 항상 작다고 가정.

근데 이번에도 신기한 건, 디테일을 다 빼고 보면 핵심은 **"frame budget + macrotask yield + priority queue"** 라는 한 줄이에요. 🎯

~~참고로 React Scheduler는 [scheduler 패키지](https://github.com/facebook/react/tree/main/packages/scheduler)로 따로 분리돼 있어요. React 외의 라이브러리에서도 갖다 쓸 수 있게 설계됐는데, 정작 React 외에는 잘 안 쓰이고 있다고 합니다. ~~

&nbsp;

## 🧪 실제로 측정해봤어요

흔한 *"useTransition 좋아요"* 글 대신 직접 측정값으로 마무리할게요. 5만 건 정렬을 세 가지 방식으로 처리해봤습니다.

| 방식 | 정렬 시간 | 입력 반응성(INP) | 구현 복잡도 |
|------|----------|----------------|------------|
| 동기 처리 | 4,920ms | **5,100ms** 🥶 | 0줄 |
| setTimeout 쪼개기 | 4,936ms (+16ms) | 220ms | 30줄 |
| **MessageChannel + priority** | 4,921ms (+1ms) | **48ms** ✨ | 100줄 |

작업 시간 자체는 거의 같아요. 차이는 **사용자가 입력하고 화면에 반영되기까지 걸리는 시간**입니다. 5,100ms와 48ms는 천지차이죠. 🎯

[Chrome의 INP 가이드](https://web.dev/articles/inp)를 보면 *"좋은 INP는 200ms 이하"* 라고 권장해요. 동기 처리는 **25배** 더 느리고, 우리 mini-scheduler는 권장치의 **4배 빠릅니다.**

&nbsp;

## 🎬 마무리

만들고 나서 두 가지가 진하게 남았어요!

✅ **"메인 스레드는 하나만 한다 — 단, 잘 쪼개면 마법이 된다."**  
무거운 작업은 무조건 Web Worker로 옮겨야 한다고 생각했는데, 사실 **잘 쪼개기만 해도** 메인 스레드에서 충분히 돌릴 수 있다는 걸 깨달았어요. Worker가 답이 아닐 때, Time Slicing이 답일 수 있습니다. 두 도구의 적절한 조합이 진짜 시니어의 무기예요. 💪

✅ **"microtask는 양보가 아니다."**  
async/await을 쓰면 어떻게든 yield되는 줄 알았는데, microtask는 같은 task 안에서 처리되더라고요. 진짜 yield는 macrotask로 넘어가야 가능하다는 사실이, 그동안 *"왜 await을 썼는데도 화면이 멈추지?"* 의문에 대한 답이었어요. 🎯

&nbsp;

`useTransition` 한 줄 뒤에 숨어있던 **frame budget · macrotask yield · priority queue** 라는 세 가지 도구를 직접 손으로 만져보고 나니, 그동안 *"이상하게 안 멈추던 코드"* 의 비밀이 한 번에 풀렸어요. 측정값이 천지차이로 바뀌는 걸 직접 본 만큼, 이번 글의 통찰이 오래 남을 것 같습니다! 🚀✨

```toc
```
