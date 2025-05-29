---
emoji: ⚛️
title: "바닐라 JS로 React 컴포넌트 만들기"
date: "2025-02-05"
description: "TypeScript로 React의 핵심 기능인 가상 DOM, JSX, 컴포넌트 시스템을 직접 구현해보며 React의 동작 원리를 이해해봅시다!"
categories: Dev React 
---

# 🚀 바닐라 JS로 React 컴포넌트 만들기

안녕하세요! 지난 시간에 React Router의 핵심 기능을 직접 구현해보면서 SPA 라우팅의 원리를 깊이 이해해보았는데요. 오늘은 한 걸음 더 나아가 React의 핵심인 컴포넌트 시스템을 바닐라 JavaScript(TypeScript)로 직접 구현해보겠습니다.

지난번 라우터를 만들면서 "React는 어떻게 컴포넌트를 렌더링하고 상태를 관리할까?"라는 궁금증이 생기지 않으셨나요? 오늘 우리는 React의 마법 같은 기능들의 베일을 벗겨보며 그 답을 찾아보겠습니다!

## 🤔 React가 특별한 이유

React는 단순한 UI 라이브러리를 넘어서 프론트엔드 개발의 패러다임을 바꿔놓았습니다. 그 핵심에는 몇 가지 혁신적인 개념들이 있습니다.

**가상 DOM (Virtual DOM)** 은 React의 가장 중요한 개념 중 하나입니다. 실제 DOM을 직접 조작하는 것은 비용이 많이 드는 작업입니다. React는 JavaScript 객체로 이루어진 가상의 DOM 트리를 메모리에 유지하고, 변경사항이 있을 때만 실제 DOM과 비교(Diffing)하여 최소한의 변경만 적용합니다.

**컴포넌트 기반 아키텍처** 를 통해 UI를 재사용 가능한 독립적인 조각으로 나눌 수 있습니다. 각 컴포넌트는 자신만의 상태(state)와 속성(props)을 가지며, 이를 조합하여 복잡한 UI를 구성할 수 있습니다.

**선언적 프로그래밍** 방식으로 "무엇을" 보여줄지만 선언하면, React가 "어떻게" 보여줄지를 알아서 처리합니다. 이는 명령형 프로그래밍보다 직관적이고 예측 가능한 코드를 작성할 수 있게 해줍니다.

## 🎯 우리가 구현할 기능들

오늘 우리가 만들어볼 미니 React에는 다음과 같은 핵심 기능들이 포함됩니다:

**가상 DOM 시스템** 을 구현하여 효율적인 DOM 업데이트를 처리합니다. JavaScript 객체로 DOM 구조를 표현하고, 이를 실제 DOM 요소로 변환하는 시스템을 만들어보겠습니다.

**JSX 변환** 기능을 구현합니다. JSX는 JavaScript에 XML과 유사한 문법을 추가한 것으로, HTML처럼 보이는 코드를 JavaScript 함수 호출로 변환합니다. 우리는 이 변환 과정을 직접 구현해보겠습니다.

**컴포넌트 시스템** 을 만들어 함수형 컴포넌트와 클래스 컴포넌트를 모두 지원하도록 하겠습니다. Props 전달, 상태 관리, 생명주기 메서드까지 구현해봅시다.

**Hooks 시스템** 도 간단하게 구현해보겠습니다. `useState`와 `useEffect`를 만들어 함수형 컴포넌트에서도 상태와 부수 효과를 다룰 수 있도록 하겠습니다.

## 💻 가상 DOM 구현하기

### 가상 DOM 노드 타입 정의

먼저 가상 DOM의 기본 구조를 TypeScript로 정의해보겠습니다:

```typescript
// types.ts
export interface VNode {
  type: string | ComponentType;
  props: Props;
  key: string | null;
}

export interface Props {
  children?: VNode | VNode[] | string | number | null;
  [key: string]: any;
}

export type ComponentType = (props: Props) => VNode | null;

export interface Component {
  render(): VNode | null;
  setState(newState: Partial<any>): void;
}
```

### createElement 함수 구현

React의 `React.createElement`에 해당하는 함수를 구현해보겠습니다. 이 함수는 JSX가 변환되어 호출되는 핵심 함수입니다:

```typescript
// createElement.ts
import { VNode, Props, ComponentType } from './types';

export function createElement(
  type: string | ComponentType,
  props: Props | null,
  ...children: any[]
): VNode {
  // children을 props에 포함시킵니다
  const normalizedProps: Props = props || {};
  
  // children 배열을 평탄화하고 정규화합니다
  const flatChildren = children
    .flat(Infinity)
    .filter(child => child !== null && child !== undefined && child !== false);
  
  if (flatChildren.length > 0) {
    normalizedProps.children = flatChildren.length === 1 
      ? flatChildren[0] 
      : flatChildren;
  }
  
  return {
    type,
    props: normalizedProps,
    key: normalizedProps.key || null
  };
}

// JSX를 사용하지 않고 직접 호출하는 예시
const element = createElement('div', { className: 'container' },
  createElement('h1', null, 'Hello World'),
  createElement('p', null, 'Welcome to Mini React!')
);
```

### 가상 DOM을 실제 DOM으로 변환하기

이제 가상 DOM 노드를 실제 DOM 요소로 변환하는 함수를 구현해보겠습니다:

```typescript
// render.ts
import { VNode, ComponentType } from './types';

export function render(vnode: VNode | string | number | null, container: HTMLElement): void {
  // 기존 내용을 제거합니다
  container.innerHTML = '';
  
  if (vnode === null || vnode === undefined) {
    return;
  }
  
  const element = createDOMElement(vnode);
  if (element) {
    container.appendChild(element);
  }
}

function createDOMElement(vnode: VNode | string | number): Node | null {
  // 텍스트 노드 처리
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(String(vnode));
  }
  
  // 컴포넌트 처리
  if (typeof vnode.type === 'function') {
    const componentVNode = vnode.type(vnode.props);
    return componentVNode ? createDOMElement(componentVNode) : null;
  }
  
  // HTML 요소 생성
  const element = document.createElement(vnode.type);
  
  // 속성 적용
  applyProps(element, vnode.props);
  
  // 자식 요소 추가
  const children = vnode.props.children;
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(child => {
        const childElement = createDOMElement(child);
        if (childElement) {
          element.appendChild(childElement);
        }
      });
    } else {
      const childElement = createDOMElement(children);
      if (childElement) {
        element.appendChild(childElement);
      }
    }
  }
  
  return element;
}

function applyProps(element: HTMLElement, props: Props): void {
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'children' || key === 'key') {
      return;
    }
    
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on')) {
      // 이벤트 핸들러 처리
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(key, value);
    }
  });
}
```

## 🎨 컴포넌트 시스템 구현하기

### 함수형 컴포넌트

함수형 컴포넌트는 가장 간단한 형태의 컴포넌트입니다. props를 받아서 가상 DOM을 반환하는 함수입니다:

```typescript
// components.ts
import { VNode, Props, ComponentType } from './types';
import { createElement } from './createElement';

// 함수형 컴포넌트 예시
export const Greeting: ComponentType = (props) => {
  return createElement('div', { className: 'greeting' },
    createElement('h2', null, `Hello, ${props.name}! 👋`),
    createElement('p', null, `You are ${props.age} years old.`)
  );
};

// 사용 예시
const app = createElement(Greeting, { name: 'Alice', age: 25 });
```

### 클래스 컴포넌트

클래스 컴포넌트는 상태와 생명주기 메서드를 가질 수 있는 더 강력한 컴포넌트입니다:

```typescript
// Component.ts
import { VNode, Props } from './types';
import { render } from './render';

export abstract class Component {
  props: Props;
  state: any;
  private container: HTMLElement | null = null;
  
  constructor(props: Props) {
    this.props = props;
    this.state = {};
  }
  
  setState(newState: Partial<any>): void {
    this.state = { ...this.state, ...newState };
    this.updateComponent();
  }
  
  private updateComponent(): void {
    if (this.container) {
      const vnode = this.render();
      if (vnode) {
        render(vnode, this.container);
      }
    }
  }
  
  mount(container: HTMLElement): void {
    this.container = container;
    this.componentWillMount?.();
    this.updateComponent();
    this.componentDidMount?.();
  }
  
  // 생명주기 메서드
  componentWillMount?(): void;
  componentDidMount?(): void;
  componentWillUpdate?(): void;
  componentDidUpdate?(): void;
  componentWillUnmount?(): void;
  
  abstract render(): VNode | null;
}

// 클래스 컴포넌트 예시
class Counter extends Component {
  state = { count: 0 };
  
  componentDidMount() {
    console.log('✨ Counter 컴포넌트가 마운트되었습니다!');
  }
  
  increment = () => {
    this.setState({ count: this.state.count + 1 });
  };
  
  decrement = () => {
    this.setState({ count: this.state.count - 1 });
  };
  
  render() {
    return createElement('div', { className: 'counter' },
      createElement('h2', null, `Count: ${this.state.count} 🔢`),
      createElement('div', { className: 'buttons' },
        createElement('button', { onClick: this.decrement }, '➖ Decrease'),
        createElement('button', { onClick: this.increment }, '➕ Increase')
      )
    );
  }
}
```

## 🪝 Hooks 구현하기

### useState Hook

함수형 컴포넌트에서 상태를 사용할 수 있게 해주는 `useState`를 구현해보겠습니다:

```typescript
// hooks.ts
let currentComponent: any = null;
let currentHookIndex = 0;
const hooks: any[] = [];

export function useState<T>(initialValue: T): [T, (newValue: T) => void] {
  const component = currentComponent;
  const hookIndex = currentHookIndex++;
  
  // 이미 저장된 상태가 있으면 사용
  if (hooks[hookIndex]) {
    return hooks[hookIndex];
  }
  
  // 새로운 상태 생성
  let state = initialValue;
  
  const setState = (newValue: T) => {
    state = newValue;
    hooks[hookIndex] = [state, setState];
    
    // 컴포넌트 리렌더링
    if (component && component.forceUpdate) {
      component.forceUpdate();
    }
  };
  
  hooks[hookIndex] = [state, setState];
  return [state, setState];
}

// useState를 사용하는 함수형 컴포넌트 예시
const TodoItem: ComponentType = ({ text, completed }) => {
  const [isCompleted, setIsCompleted] = useState(completed || false);
  
  const toggleComplete = () => {
    setIsCompleted(!isCompleted);
  };
  
  return createElement('div', { 
    className: `todo-item ${isCompleted ? 'completed' : ''}`,
    onClick: toggleComplete
  },
    createElement('span', { 
      style: { 
        textDecoration: isCompleted ? 'line-through' : 'none',
        color: isCompleted ? '#888' : '#333'
      }
    }, text),
    createElement('span', null, isCompleted ? ' ✅' : ' ⬜')
  );
};
```

### useEffect Hook

부수 효과를 다루는 `useEffect`도 구현해보겠습니다:

```typescript
// hooks.ts (계속)
export function useEffect(effect: () => void | (() => void), deps?: any[]): void {
  const hookIndex = currentHookIndex++;
  const prevDeps = hooks[hookIndex];
  
  // 의존성 배열 비교
  const hasChanged = prevDeps 
    ? deps?.some((dep, i) => dep !== prevDeps[i])
    : true;
  
  if (hasChanged) {
    // 이전 클린업 함수 실행
    if (hooks[hookIndex]?.cleanup) {
      hooks[hookIndex].cleanup();
    }
    
    // 새로운 effect 실행
    const cleanup = effect();
    hooks[hookIndex] = { deps, cleanup };
  }
}

// useEffect를 사용하는 컴포넌트 예시
const Timer: ComponentType = () => {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    console.log('⏰ 타이머 시작!');
    
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    // 클린업 함수 반환
    return () => {
      console.log('🛑 타이머 정리!');
      clearInterval(interval);
    };
  }, []); // 빈 의존성 배열 = 마운트 시 한 번만 실행
  
  return createElement('div', { className: 'timer' },
    createElement('h3', null, `⏱️ 경과 시간: ${seconds}초`)
  );
};
```

## 🔧 JSX 변환 구현하기

### JSX 트랜스파일러 (Transpiler)

실제 JSX를 JavaScript로 변환하는 것은 매우 복잡한 과정입니다. 정확히는 파싱(Parsing)과 변환(Transformation) 두 단계로 나뉩니다. 여기서는 간단한 변환 예시를 구현해보겠습니다:

```typescript
// jsx-transform.ts
export function transformJSX(jsxString: string): string {
  // 간단한 정규식 기반 변환 (실제로는 훨씬 복잡합니다)
  let transformed = jsxString;
  
  // 자체 닫힘 태그 변환: <Component /> -> createElement(Component, null)
  transformed = transformed.replace(
    /<(\w+)\s*\/>/g,
    'createElement($1, null)'
  );
  
  // 속성이 있는 자체 닫힘 태그: <Component prop="value" />
  transformed = transformed.replace(
    /<(\w+)\s+([^>]+)\/>/g,
    (match, tag, attrs) => {
      const props = parseAttributes(attrs);
      return `createElement(${tag}, ${props})`;
    }
  );
  
  // 일반 태그: <div>content</div>
  transformed = transformed.replace(
    /<(\w+)>([^<]+)<\/\1>/g,
    'createElement("$1", null, "$2")'
  );
  
  return transformed;
}

function parseAttributes(attrString: string): string {
  const attrs = attrString.match(/(\w+)="([^"]+)"/g) || [];
  const props = attrs.map(attr => {
    const [key, value] = attr.split('=');
    return `${key}: ${value}`;
  });
  
  return `{ ${props.join(', ')} }`;
}

// 사용 예시
const jsxCode = `<div className="container">Hello World</div>`;
const jsCode = transformJSX(jsxCode);
// 결과: createElement("div", { className: "container" }, "Hello World")
```

## 🎯 실제 사용 예시 - Todo 앱 만들기

이제 우리가 만든 미니 React를 사용해서 실제 Todo 앱을 만들어보겠습니다:

```typescript
// TodoApp.ts
import { Component, createElement } from './mini-react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoAppState {
  todos: Todo[];
  inputValue: string;
}

class TodoApp extends Component {
  state: TodoAppState = {
    todos: [],
    inputValue: ''
  };
  
  componentDidMount() {
    // 로컬 스토리지에서 todos 불러오기
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      this.setState({ todos: JSON.parse(savedTodos) });
    }
  }
  
  componentDidUpdate() {
    // todos를 로컬 스토리지에 저장
    localStorage.setItem('todos', JSON.stringify(this.state.todos));
  }
  
  handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.setState({ inputValue: target.value });
  };
  
  addTodo = () => {
    const { inputValue, todos } = this.state;
    
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue,
        completed: false
      };
      
      this.setState({
        todos: [...todos, newTodo],
        inputValue: ''
      });
    }
  };
  
  toggleTodo = (id: number) => {
    const { todos } = this.state;
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    
    this.setState({ todos: updatedTodos });
  };
  
  deleteTodo = (id: number) => {
    const { todos } = this.state;
    const filteredTodos = todos.filter(todo => todo.id !== id);
    this.setState({ todos: filteredTodos });
  };
  
  render() {
    const { todos, inputValue } = this.state;
    const completedCount = todos.filter(todo => todo.completed).length;
    
    return createElement('div', { className: 'todo-app' },
      createElement('h1', null, '📝 Todo App'),
      
      // 입력 영역
      createElement('div', { className: 'input-area' },
        createElement('input', {
          type: 'text',
          value: inputValue,
          onInput: this.handleInputChange,
          onKeyPress: (e: KeyboardEvent) => {
            if (e.key === 'Enter') this.addTodo();
          },
          placeholder: '할 일을 입력하세요...'
        }),
        createElement('button', { onClick: this.addTodo }, '➕ 추가')
      ),
      
      // 통계
      createElement('div', { className: 'stats' },
        createElement('span', null, `전체: ${todos.length} `),
        createElement('span', null, `완료: ${completedCount} `),
        createElement('span', null, `미완료: ${todos.length - completedCount}`)
      ),
      
      // Todo 목록
      createElement('ul', { className: 'todo-list' },
        ...todos.map(todo => 
          createElement('li', { 
            key: todo.id,
            className: todo.completed ? 'completed' : ''
          },
            createElement('span', {
              onClick: () => this.toggleTodo(todo.id),
              style: {
                textDecoration: todo.completed ? 'line-through' : 'none',
                cursor: 'pointer'
              }
            }, todo.text),
            createElement('button', {
              onClick: () => this.deleteTodo(todo.id),
              className: 'delete-btn'
            }, '🗑️')
          )
        )
      )
    );
  }
}

// 앱 실행
const app = new TodoApp({ });
app.mount(document.getElementById('root')!);
```

## 🚀 성능 최적화

### Virtual DOM Diffing 알고리즘

실제 React의 핵심인 Diffing 알고리즘을 간단하게 구현해보겠습니다:

```typescript
// diff.ts
interface DOMPatch {
  type: 'CREATE' | 'REMOVE' | 'REPLACE' | 'UPDATE';
  node?: VNode;
  props?: Props;
  index?: number;
}

export function diff(oldVNode: VNode | null, newVNode: VNode | null): DOMPatch[] {
  const patches: DOMPatch[] = [];
  
  // 새 노드 생성
  if (!oldVNode && newVNode) {
    patches.push({ type: 'CREATE', node: newVNode });
    return patches;
  }
  
  // 노드 제거
  if (oldVNode && !newVNode) {
    patches.push({ type: 'REMOVE' });
    return patches;
  }
  
  // 둘 다 null인 경우
  if (!oldVNode || !newVNode) {
    return patches;
  }
  
  // 타입이 다른 경우 교체
  if (oldVNode.type !== newVNode.type) {
    patches.push({ type: 'REPLACE', node: newVNode });
    return patches;
  }
  
  // 속성 비교
  const propsDiff = diffProps(oldVNode.props, newVNode.props);
  if (Object.keys(propsDiff).length > 0) {
    patches.push({ type: 'UPDATE', props: propsDiff });
  }
  
  // 자식 노드 비교 (간단한 버전)
  const oldChildren = Array.isArray(oldVNode.props.children) 
    ? oldVNode.props.children 
    : [oldVNode.props.children].filter(Boolean);
    
  const newChildren = Array.isArray(newVNode.props.children)
    ? newVNode.props.children
    : [newVNode.props.children].filter(Boolean);
  
  const maxLength = Math.max(oldChildren.length, newChildren.length);
  
  for (let i = 0; i < maxLength; i++) {
    const childPatches = diff(oldChildren[i], newChildren[i]);
    patches.push(...childPatches.map(patch => ({ ...patch, index: i })));
  }
  
  return patches;
}

function diffProps(oldProps: Props, newProps: Props): Props {
  const diff: Props = {};
  
  // 새로 추가되거나 변경된 속성
  Object.keys(newProps).forEach(key => {
    if (oldProps[key] !== newProps[key]) {
      diff[key] = newProps[key];
    }
  });
  
  // 제거된 속성
  Object.keys(oldProps).forEach(key => {
    if (!(key in newProps)) {
      diff[key] = undefined;
    }
  });
  
  return diff;
}
```

### 배치 업데이트 (Batch Updates)

React처럼 여러 상태 업데이트를 모아서 한 번에 처리하는 기능을 구현해보겠습니다:

```typescript
// batchUpdate.ts
class UpdateQueue {
  private updates: Array<() => void> = [];
  private isProcessing = false;
  
  enqueue(update: () => void): void {
    this.updates.push(update);
    
    if (!this.isProcessing) {
      this.processBatch();
    }
  }
  
  private processBatch(): void {
    this.isProcessing = true;
    
    // 다음 틱에 업데이트 처리
    Promise.resolve().then(() => {
      const currentUpdates = this.updates.splice(0);
      
      // 모든 업데이트를 한 번에 처리
      currentUpdates.forEach(update => update());
      
      this.isProcessing = false;
      
      // 새로운 업데이트가 있으면 다시 처리
      if (this.updates.length > 0) {
        this.processBatch();
      }
    });
  }
}

const updateQueue = new UpdateQueue();

// setState를 배치 업데이트로 개선
export function batchedSetState(component: Component, newState: any): void {
  updateQueue.enqueue(() => {
    component.state = { ...component.state, ...newState };
    component.forceUpdate();
  });
}
```

## 🎨 스타일링 시스템

### CSS-in-JS 구현

간단한 CSS-in-JS 시스템을 구현해보겠습니다:

```typescript
// styles.ts
let styleCounter = 0;
const styleSheet = document.createElement('style');
document.head.appendChild(styleSheet);

export function css(styles: Record<string, any>): string {
  const className = `styled-${styleCounter++}`;
  
  const cssText = Object.entries(styles)
    .map(([prop, value]) => {
      // camelCase를 kebab-case로 변환
      const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssProp}: ${value};`;
    })
    .join('\n  ');
  
  const rule = `.${className} {\n  ${cssText}\n}`;
  styleSheet.sheet?.insertRule(rule, styleSheet.sheet.cssRules.length);
  
  return className;
}

// styled 컴포넌트 팩토리
export function styled(tag: string) {
  return (styles: Record<string, any>) => {
    const className = css(styles);
    
    return (props: Props) => {
      return createElement(tag, { ...props, className }, props.children);
    };
  };
}

// 사용 예시
const StyledButton = styled('button')({
  backgroundColor: '#007bff',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'background-color 0.3s',
  
  ':hover': {
    backgroundColor: '#0056b3'
  }
});

const App = () => createElement('div', null,
  createElement(StyledButton, { onClick: () => alert('Clicked! 🎉') }, 
    'Click me! 💫'
  )
);
```

## 🧪 테스팅 유틸리티

### 간단한 테스트 프레임워크

우리의 미니 React를 테스트하기 위한 간단한 유틸리티를 만들어보겠습니다:

```typescript
// test-utils.ts
export function renderToString(vnode: VNode): string {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return String(vnode);
  }
  
  if (typeof vnode.type === 'function') {
    const componentVNode = vnode.type(vnode.props);
    return componentVNode ? renderToString(componentVNode) : '';
  }
  
  const { type, props } = vnode;
  const attributes = Object.entries(props)
    .filter(([key]) => key !== 'children')
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  
  const children = props.children
    ? (Array.isArray(props.children) ? props.children : [props.children])
        .map(child => renderToString(child))
        .join('')
    : '';
  
  return `<${type}${attributes ? ' ' + attributes : ''}>${children}</${type}>`;
}

// 테스트 헬퍼
export function test(description: string, fn: () => void): void {
  try {
    fn();
    console.log(`✅ ${description}`);
  } catch (error) {
    console.error(`❌ ${description}`);
    console.error(error);
  }
}

export function expect<T>(actual: T) {
  return {
    toBe(expected: T): void {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual(expected: T): void {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toContain(substring: string): void {
      if (typeof actual === 'string' && !actual.includes(substring)) {
        throw new Error(`Expected "${actual}" to contain "${substring}"`);
      }
    }
  };
}

// 테스트 예시
test('createElement should create valid VNode', () => {
  const vnode = createElement('div', { className: 'test' }, 'Hello');
  expect(vnode.type).toBe('div');
  expect(vnode.props.className).toBe('test');
  expect(vnode.props.children).toBe('Hello');
});

test('renderToString should render components correctly', () => {
  const Component = (props: Props) => 
    createElement(Component, { name: 'World' });
    
  const vnode = createElement(Component, { name: 'World' });
  const html = renderToString(vnode);
  
  expect(html).toContain('Hello World');
});
```

## 🎬 마무리

오늘은 바닐라 JavaScript(TypeScript)로 React의 핵심 기능들을 직접 구현해보았습니다. 이 과정을 통해 React의 내부 동작 원리를 깊이 이해할 수 있었습니다.

**가상 DOM의 동작 원리** 를 이해하면서 React가 어떻게 효율적으로 DOM을 업데이트하는지 알게 되었습니다. JavaScript 객체로 DOM을 표현하고, 변경사항을 비교하여 최소한의 실제 DOM 조작만 수행하는 방식은 정말 영리한 해결책입니다.

**컴포넌트 시스템** 을 구현하면서 React의 컴포넌트가 어떻게 props와 state를 관리하고, 생명주기를 가지는지 이해했습니다. 함수형 컴포넌트와 클래스 컴포넌트의 차이점과 각각의 장단점도 명확해졌습니다.

**Hooks 시스템** 의 구현을 통해 함수형 컴포넌트가 어떻게 상태와 부수 효과를 다룰 수 있는지 알게 되었습니다. 클로저와 배열을 활용한 Hooks의 구현은 정말 간단하면서도 강력합니다.

지난번에 React Router를 구현했을 때는 "URL이 변경될 때 어떻게 다른 컴포넌트를 보여줄까?"에 대한 답을 찾았다면, 오늘은 "그 컴포넌트들이 어떻게 만들어지고 동작하는가?"에 대한 근본적인 답을 찾았습니다. 라우터와 컴포넌트 시스템을 모두 직접 구현해보니, React가 얼마나 잘 설계된 라이브러리인지 새삼 느끼게 됩니다.

특히 인상 깊었던 점은 React의 모든 기능이 JavaScript의 기본 개념들 - 클로저, 객체, 함수 등을 영리하게 조합한 것이라는 사실입니다. 복잡해 보이는 가상 DOM도 결국은 JavaScript 객체이고, 신비로운 Hooks도 클로저와 배열을 활용한 것뿐입니다.

물론 실제 React는 우리가 구현한 것보다 훨씬 복잡하고 정교합니다. Fiber 아키텍처, Concurrent Mode, Server Components 등 수많은 최적화와 기능들이 포함되어 있습니다. 하지만 이렇게 기본 원리를 이해하고 나면, React를 사용할 때 더 깊이 있는 이해를 바탕으로 개발할 수 있습니다.

이제 우리는 React Router도 만들어보고, React 컴포넌트 시스템도 구현해보았습니다. 이 두 가지 경험을 통해 얻은 가장 큰 교훈은 **"마법은 없다"** 는 것입니다. 프레임워크나 라이브러리가 제공하는 편리한 기능들도 결국은 우리가 알고 있는 프로그래밍 기본기를 잘 활용한 것뿐입니다.

앞으로 React로 개발할 때, 단순히 사용법만 익히는 것이 아니라 "이건 어떻게 구현되어 있을까?"라는 호기심을 가지고 접근한다면, 더 나은 개발자가 될 수 있을 것입니다. 이제 여러분도 React의 마법사가 되었습니다! 🧙‍♂️✨

Happy Coding! 🚀💻

```toc
``` 