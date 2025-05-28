---
emoji: ⚛️
title: "바닐라 JS로 React Router 만들기"
date: "2025-01-23"
description: "TypeScript로 React Router의 핵심 기능을 직접 구현해보며 라우팅의 원리를 이해해봅시다!"
categories: Dev React 
---

# 🚀 바닐라 JS로 React Router 만들기

안녕하세요! 오늘은 React Router의 핵심 기능을 바닐라 JavaScript(TypeScript)로 직접 구현해보면서 SPA 라우팅의 원리를 깊이 이해해보겠습니다. 🎯

## 📌 React Router가 뭐길래?

React Router는 React 애플리케이션에서 클라이언트 사이드 라우팅을 구현하는 라이브러리입니다. 우리가 일반적으로 웹사이트를 탐색할 때, 링크를 클릭하면 브라우저는 서버에 새로운 페이지를 요청하고 전체 페이지를 다시 로드합니다. 하지만 SPA(Single Page Application)에서는 이런 방식이 비효율적입니다.

React Router의 가장 큰 특징은 **URL 기반 라우팅**입니다. URL 경로에 따라 다른 컴포넌트를 렌더링하여 마치 여러 페이지가 있는 것처럼 보이게 만들어줍니다. 또한 **History API를 활용**하여 브라우저의 뒤로가기/앞으로가기 버튼이 자연스럽게 작동하도록 지원합니다.

**동적 라우팅** 기능도 매우 강력합니다. 예를 들어 `/user/:id` 같은 패턴을 정의하면, `/user/123`이나 `/user/456` 같은 URL에서 자동으로 파라미터를 추출할 수 있습니다. 이런 기능들이 모여 **페이지 새로고침 없이 화면을 전환**하는 매끄러운 사용자 경험을 제공합니다.

## 🛠️ 우리가 만들 라우터의 기능

이번 프로젝트에서는 React Router의 핵심 기능들을 직접 구현해볼 예정입니다. 먼저 **경로 매칭 시스템**을 구현하여 URL과 컴포넌트를 연결하는 방법을 이해해보겠습니다. 이 시스템은 현재 URL을 분석하고 등록된 라우트 중에서 일치하는 것을 찾아 해당 컴포넌트를 렌더링합니다.

다음으로 **History API를 활용한 네비게이션**을 구현합니다. 이를 통해 브라우저의 주소창을 업데이트하고, 뒤로가기/앞으로가기 기능을 지원할 수 있습니다. History API는 HTML5에서 도입된 기능으로, JavaScript로 브라우저의 세션 히스토리를 조작할 수 있게 해줍니다.

**동적 파라미터 처리**는 현대적인 웹 애플리케이션에서 필수적인 기능입니다. 사용자 프로필 페이지나 상품 상세 페이지처럼 URL에 포함된 정보를 기반으로 다른 콘텐츠를 보여줘야 하는 경우가 많기 때문입니다. 우리의 라우터도 이런 동적 파라미터를 추출하고 컴포넌트에 전달하는 기능을 갖추게 됩니다.

마지막으로 **404 페이지 처리**도 중요합니다. 사용자가 존재하지 않는 경로로 접근했을 때 적절한 에러 페이지를 보여주는 것은 좋은 사용자 경험의 일부입니다.

## 💻 TypeScript로 구현하기

### 라우터 타입 정의

TypeScript를 사용하면 코드의 안정성과 가독성을 크게 향상시킬 수 있습니다. 먼저 라우터에서 사용할 주요 타입들을 정의해보겠습니다:

```typescript
// types.ts
export interface Route {
  path: string;
  component: () => string | HTMLElement;
  exact?: boolean;
}

export interface RouterParams {
  [key: string]: string;
}

export interface RouterContext {
  params: RouterParams;
  query: URLSearchParams;
  path: string;
}
```

`Route` 인터페이스는 각 라우트의 구조를 정의합니다. `path`는 URL 경로 패턴이고, `component`는 해당 경로에서 렌더링할 컴포넌트입니다. `exact` 옵션은 정확한 경로 매칭을 원할 때 사용합니다. 예를 들어 `/` 경로에 `exact: true`를 설정하면 `/about` 같은 경로와 매칭되지 않습니다.

`RouterParams`는 동적 파라미터를 저장하는 객체입니다. URL에서 추출한 파라미터들이 키-값 쌍으로 저장됩니다. `RouterContext`는 현재 라우팅 상태의 전체 정보를 담고 있으며, 컴포넌트에서 이 정보를 활용할 수 있습니다.

### Router 클래스 구현

이제 핵심 라우터 클래스를 구현해보겠습니다. 이 클래스는 라우트 관리, URL 변경 감지, 컴포넌트 렌더링 등 라우터의 모든 기능을 담당합니다:

```typescript
// router.ts
class VanillaRouter {
  private routes: Route[] = [];
  private currentRoute: Route | null = null;
  private rootElement: HTMLElement;
  private notFoundComponent: (() => string | HTMLElement) | null = null;

  constructor(rootSelector: string) {
    const root = document.querySelector(rootSelector);
    if (!root) {
      throw new Error(`Root element not found: ${rootSelector}`);
    }
    this.rootElement = root as HTMLElement;
    this.init();
  }

  private init(): void {
    // popstate 이벤트 리스너 추가 (뒤로가기/앞으로가기)
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });

    // 모든 링크 클릭 이벤트 가로채기
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href) this.navigate(href);
      }
    });
  }

  // 라우트 추가
  addRoute(route: Route): void {
    this.routes.push(route);
  }

  // 404 컴포넌트 설정
  setNotFound(component: () => string | HTMLElement): void {
    this.notFoundComponent = component;
  }

  // 네비게이션
  navigate(path: string): void {
    window.history.pushState(null, '', path);
    this.handleRouteChange();
  }

  // 경로 매칭 함수 🎯
  private matchRoute(path: string): { route: Route | null; params: RouterParams } {
    for (const route of this.routes) {
      const { match, params } = this.matchPath(path, route.path, route.exact);
      if (match) {
        return { route, params };
      }
    }
    return { route: null, params: {} };
  }

  // 경로 패턴 매칭 알고리즘
  private matchPath(
    pathname: string,
    pattern: string,
    exact: boolean = false
  ): { match: boolean; params: RouterParams } {
    const params: RouterParams = {};
    
    // 동적 파라미터를 정규식으로 변환
    const regexPattern = pattern
      .split('/')
      .map((segment) => {
        if (segment.startsWith(':')) {
          const paramName = segment.slice(1);
          return '([^/]+)';
        }
        return segment;
      })
      .join('/');

    const regex = new RegExp(`^${regexPattern}${exact ? '$' : '(/|$)'}`);
    const match = pathname.match(regex);

    if (!match) return { match: false, params };

    // 파라미터 추출
    const paramNames = pattern.match(/:([^/]+)/g) || [];
    paramNames.forEach((param, index) => {
      const paramName = param.slice(1);
      params[paramName] = match[index + 1];
    });

    return { match: true, params };
  }

  // 라우트 변경 처리
  private handleRouteChange(): void {
    const path = window.location.pathname;
    const query = new URLSearchParams(window.location.search);
    const { route, params } = this.matchRoute(path);

    if (route) {
      this.currentRoute = route;
      const context: RouterContext = { params, query, path };
      this.render(route.component(), context);
    } else if (this.notFoundComponent) {
      this.render(this.notFoundComponent(), { params: {}, query, path });
    } else {
      this.render('<h1>404 - Page Not Found 😢</h1>', { params: {}, query, path });
    }
  }

  // 컴포넌트 렌더링
  private render(content: string | HTMLElement, context: RouterContext): void {
    // context를 window 객체에 저장 (컴포넌트에서 접근 가능)
    (window as any).__routerContext = context;
    
    if (typeof content === 'string') {
      this.rootElement.innerHTML = content;
    } else {
      this.rootElement.innerHTML = '';
      this.rootElement.appendChild(content);
    }
  }

  // 라우터 시작
  start(): void {
    this.handleRouteChange();
  }
}

export default VanillaRouter;
```

### 핵심 메서드 상세 설명

**`init()` 메서드**는 라우터의 초기 설정을 담당합니다. 여기서 중요한 부분은 `popstate` 이벤트 리스너입니다. 사용자가 브라우저의 뒤로가기나 앞으로가기 버튼을 클릭했을 때 발생하는 이 이벤트를 감지하여 적절한 컴포넌트를 렌더링합니다. 또한 모든 링크 클릭을 가로채서 페이지 새로고침 없이 네비게이션이 일어나도록 합니다.

**`matchPath()` 메서드**는 라우터의 핵심 로직입니다. URL 패턴을 정규식으로 변환하여 현재 경로와 비교합니다. 예를 들어 `/posts/:id` 패턴은 `/posts/([^/]+)` 정규식으로 변환되어 `/posts/123` 같은 URL과 매칭됩니다. 이 과정에서 동적 파라미터도 추출합니다.

**`handleRouteChange()` 메서드**는 URL이 변경될 때마다 호출됩니다. 현재 URL을 분석하고, 등록된 라우트 중에서 매칭되는 것을 찾아 해당 컴포넌트를 렌더링합니다. 매칭되는 라우트가 없으면 404 페이지를 보여줍니다.

### 사용 예시 - 간단한 블로그 앱 🎨

이제 우리가 만든 라우터를 실제로 사용해보겠습니다. 간단한 블로그 애플리케이션을 만들어 라우터의 기능을 테스트해보겠습니다:

```typescript
// app.ts
import VanillaRouter from './router';

// 컴포넌트 정의
const HomePage = () => `
  <div class="home">
    <h1>🏠 홈페이지</h1>
    <p>바닐라 JS로 만든 라우터 데모입니다. 아래 링크들을 클릭해보세요!</p>
    <nav>
      <a href="/about">소개</a>
      <a href="/posts">포스트 목록</a>
      <a href="/posts/123">포스트 상세 (ID: 123)</a>
      <a href="/posts/456">포스트 상세 (ID: 456)</a>
    </nav>
  </div>
`;

const AboutPage = () => `
  <div class="about">
    <h1>📖 소개 페이지</h1>
    <p>이 프로젝트는 React Router의 핵심 기능을 바닐라 JavaScript로 구현한 것입니다.</p>
    <p>History API를 활용하여 SPA 라우팅을 구현했으며, 동적 파라미터도 지원합니다.</p>
    <h2>주요 기능</h2>
    <ul>
      <li>URL 기반 라우팅</li>
      <li>동적 파라미터 지원</li>
      <li>브라우저 히스토리 관리</li>
      <li>404 페이지 처리</li>
    </ul>
    <a href="/">홈으로</a>
  </div>
`;

const PostListPage = () => `
  <div class="posts">
    <h1>📝 포스트 목록</h1>
    <p>아래 포스트들을 클릭하면 동적 라우팅이 작동하는 것을 확인할 수 있습니다.</p>
    <ul class="post-list">
      <li>
        <a href="/posts/1">
          <h3>첫 번째 포스트</h3>
          <p>React Router의 기본 개념에 대해 알아봅니다.</p>
        </a>
      </li>
      <li>
        <a href="/posts/2">
          <h3>두 번째 포스트</h3>
          <p>History API의 활용법을 자세히 살펴봅니다.</p>
        </a>
      </li>
      <li>
        <a href="/posts/3">
          <h3>세 번째 포스트</h3>
          <p>동적 라우팅 구현 방법을 설명합니다.</p>
        </a>
      </li>
    </ul>
    <a href="/">홈으로</a>
  </div>
`;

const PostDetailPage = () => {
  // 라우터 컨텍스트에서 파라미터 가져오기
  const context = (window as any).__routerContext;
  const postId = context?.params?.id || 'unknown';
  
  // 실제 애플리케이션에서는 postId로 데이터를 가져올 수 있습니다
  const postData = {
    '1': { title: '첫 번째 포스트', content: 'React Router의 기본 개념...' },
    '2': { title: '두 번째 포스트', content: 'History API의 활용법...' },
    '3': { title: '세 번째 포스트', content: '동적 라우팅 구현 방법...' }
  }[postId] || { title: '포스트를 찾을 수 없습니다', content: '' };
  
  return `
    <div class="post-detail">
      <h1>📄 ${postData.title}</h1>
      <p class="post-meta">포스트 ID: ${postId}</p>
      <div class="post-content">
        <p>${postData.content}</p>
        <p>이 페이지는 동적 라우팅을 통해 렌더링되었습니다. URL의 ID 부분을 변경해보세요!</p>
      </div>
      <nav class="post-nav">
        <a href="/posts">← 목록으로</a>
        <a href="/">홈으로</a>
      </nav>
    </div>
  `;
};

const NotFoundPage = () => `
  <div class="not-found">
    <h1>404 😱</h1>
    <p>요청하신 페이지를 찾을 수 없습니다!</p>
    <p>URL을 확인하시거나 아래 링크를 이용해주세요.</p>
    <a href="/" class="home-link">🏠 홈으로 돌아가기</a>
  </div>
`;

// 라우터 초기화 및 설정
const router = new VanillaRouter('#app');

// 라우트 등록
router.addRoute({ path: '/', component: HomePage, exact: true });
router.addRoute({ path: '/about', component: AboutPage });
router.addRoute({ path: '/posts', component: PostListPage, exact: true });
router.addRoute({ path: '/posts/:id', component: PostDetailPage });
router.setNotFound(NotFoundPage);

// 라우터 시작 🚀
router.start();

// 개발자 도구에서 라우터 인스턴스에 접근할 수 있도록 전역에 노출
(window as any).router = router;
```

### HTML 파일과 스타일링

라우터가 작동하는 환경을 완성하기 위해 HTML 파일과 기본적인 스타일을 추가해보겠습니다:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>바닐라 라우터 데모</title>
  <style>
    /* CSS 변수를 활용한 테마 설정 */
    :root {
      --primary-color: #0066cc;
      --secondary-color: #6c757d;
      --background-color: #f8f9fa;
      --text-color: #212529;
      --border-color: #dee2e6;
      --hover-color: #0056b3;
    }

    /* 다크 모드 지원 */
    @media (prefers-color-scheme: dark) {
      :root {
        --background-color: #212529;
        --text-color: #f8f9fa;
        --border-color: #495057;
      }
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: var(--background-color);
      color: var(--text-color);
      line-height: 1.6;
    }
    
    h1, h2, h3 {
      margin-top: 0;
    }
    
    nav {
      margin: 20px 0;
    }
    
    nav a, a {
      color: var(--primary-color);
      text-decoration: none;
      margin-right: 15px;
      transition: color 0.2s ease;
    }
    
    nav a:hover, a:hover {
      color: var(--hover-color);
      text-decoration: underline;
    }
    
    .post-list {
      list-style: none;
      padding: 0;
    }
    
    .post-list li {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .post-list li:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .post-list a {
      display: block;
      color: inherit;
    }
    
    .post-list h3 {
      color: var(--primary-color);
      margin-bottom: 5px;
    }
    
    .post-list p {
      margin: 0;
      color: var(--secondary-color);
    }
    
    .post-meta {
      color: var(--secondary-color);
      font-size: 0.9em;
      margin-bottom: 20px;
    }
    
    .post-nav {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }
    
    .not-found {
      text-align: center;
      padding: 50px 0;
    }
    
    .not-found h1 {
      font-size: 4em;
      margin-bottom: 10px;
    }
    
    .home-link {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: var(--primary-color);
      color: white;
      border-radius: 5px;
      transition: background-color 0.2s ease;
    }
    
    .home-link:hover {
      background-color: var(--hover-color);
      text-decoration: none;
    }
    
    /* 애니메이션 효과 */
    #app > * {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script src="./dist/app.js"></script>
</body>
</html>
```

## 🎯 추가 기능 구현하기

### 중첩 라우트 (Nested Routes)

실제 애플리케이션에서는 라우트가 중첩되는 경우가 많습니다. 예를 들어 사용자 대시보드 안에 프로필, 설정, 알림 등의 하위 페이지가 있을 수 있습니다. 이런 구조를 지원하기 위해 중첩 라우트 기능을 추가해보겠습니다:

```typescript
// 중첩 라우트를 위한 타입 확장
interface NestedRoute extends Route {
  children?: Route[];
}

class EnhancedRouter extends VanillaRouter {
  private nestedRoutes: NestedRoute[] = [];
  
  // 중첩 라우트 추가 메서드
  addNestedRoute(route: NestedRoute): void {
    this.nestedRoutes.push(route);
  }
  
  // 중첩 라우트 매칭 로직
  private matchNestedRoute(
    path: string, 
    routes: NestedRoute[], 
    parentPath: string = ''
  ): {
    route: Route | null;
    params: RouterParams;
  } {
    for (const route of routes) {
      const fullPath = parentPath + route.path;
      const { match, params } = this.matchPath(path, fullPath, route.exact);
      
      if (match && !route.children) {
        return { route, params };
      }
      
      if (match && route.children) {
        const childMatch = this.matchNestedRoute(path, route.children, fullPath);
        if (childMatch.route) {
          return childMatch;
        }
      }
    }
    
    return { route: null, params: {} };
  }
}

// 사용 예시
const router = new EnhancedRouter('#app');

router.addNestedRoute({
  path: '/dashboard',
  component: DashboardLayout,
  children: [
    { path: '/profile', component: ProfilePage },
    { path: '/settings', component: SettingsPage },
    { path: '/notifications', component: NotificationsPage }
  ]
});
```

### 라우트 가드 (Route Guards)

때로는 특정 라우트에 접근하기 전에 권한을 확인하거나 특정 조건을 검사해야 할 때가 있습니다. 라우트 가드 기능을 추가하면 이런 요구사항을 쉽게 처리할 수 있습니다:

```typescript
interface RouteGuard {
  canActivate: (context: RouterContext) => boolean | Promise<boolean>;
}

interface GuardedRoute extends Route {
  guard?: RouteGuard;
}

// 인증 가드 예시
const authGuard: RouteGuard = {
  canActivate: (context) => {
    const isLoggedIn = localStorage.getItem('token') !== null;
    if (!isLoggedIn) {
      console.log('접근 권한이 없습니다. 로그인 페이지로 이동합니다.');
      return false;
    }
    return true;
  }
};

// 역할 기반 가드 예시
const roleGuard = (requiredRole: string): RouteGuard => ({
  canActivate: async (context) => {
    try {
      const userRole = await fetchUserRole(); // 비동기로 사용자 역할 확인
      return userRole === requiredRole;
    } catch (error) {
      console.error('역할 확인 중 오류 발생:', error);
      return false;
    }
  }
});

// 가드가 적용된 라우트 예시
router.addRoute({
  path: '/admin',
  component: AdminPanel,
  guard: roleGuard('admin')
});

router.addRoute({
  path: '/profile',
  component: ProfilePage,
  guard: authGuard
});
```

### 라우트 전환 애니메이션

사용자 경험을 향상시키기 위해 라우트 전환 시 애니메이션을 추가할 수 있습니다. CSS 트랜지션과 JavaScript를 조합하여 부드러운 전환 효과를 구현해보겠습니다:

```typescript
class AnimatedRouter extends VanillaRouter {
  private transitionDuration: number = 300; // 밀리초
  
  protected async render(
    content: string | HTMLElement, 
    context: RouterContext
  ): Promise<void> {
    // 페이드 아웃 애니메이션
    this.rootElement.style.opacity = '0';
    this.rootElement.style.transform = 'translateX(-20px)';
    
    await this.delay(this.transitionDuration);
    
    // 콘텐츠 업데이트
    super.render(content, context);
    
    // 페이드 인 애니메이션
    requestAnimationFrame(() => {
      this.rootElement.style.opacity = '1';
      this.rootElement.style.transform = 'translateX(0)';
    });
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## 📊 성능 최적화 팁

### 라우트 캐싱

자주 방문하는 페이지의 경우, 렌더링 결과를 캐싱하여 성능을 향상시킬 수 있습니다. 메모리 사용량과 성능 사이의 균형을 고려하여 적절한 캐싱 전략을 구현해야 합니다:

```typescript
class CachedRouter extends VanillaRouter {
  private cache: Map<string, { content: string | HTMLElement; timestamp: number }> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5분
  
  protected render(content: string | HTMLElement, context: RouterContext): void {
    const cacheKey = context.path;
    const now = Date.now();
    
    // 캐시 확인
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      super.render(cached.content, context);
      return;
    }
    
    // 새로운 콘텐츠 렌더링 및 캐싱
    super.render(content, context);
    this.cache.set(cacheKey, { content, timestamp: now });
    
    // 오래된 캐시 정리
    this.cleanupCache();
  }
  
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
}
```

### 레이지 로딩

큰 애플리케이션에서는 모든 컴포넌트를 한 번에 로드하는 것이 비효율적일 수 있습니다. 레이지 로딩을 구현하여 필요한 시점에 컴포넌트를 로드하도록 최적화할 수 있습니다:

```typescript
interface LazyRoute extends Route {
  componentLoader: () => Promise<() => string | HTMLElement>;
}

class LazyRouter extends VanillaRouter {
  private componentCache: Map<string, () => string | HTMLElement> = new Map();
  
  async handleLazyRoute(route: LazyRoute, context: RouterContext): Promise<void> {
    let component = this.componentCache.get(route.path);
    
    if (!component) {
      // 로딩 표시
      this.render('<div class="loading">로딩 중...</div>', context);
      
      try {
        // 컴포넌트 동적 로드
        component = await route.componentLoader();
        this.componentCache.set(route.path, component);
      } catch (error) {
        console.error('컴포넌트 로드 실패:', error);
        this.render('<div class="error">페이지를 로드할 수 없습니다.</div>', context);
        return;
      }
    }
    
    // 로드된 컴포넌트 렌더링
    this.render(component(), context);
  }
}

// 사용 예시
router.addLazyRoute({
  path: '/heavy-page',
  componentLoader: () => import('./components/HeavyPage').then(m => m.default)
});
```

### 프리페칭 (Prefetching)

사용자가 링크 위에 마우스를 올렸을 때 미리 해당 페이지의 데이터를 로드하면 클릭했을 때 즉시 표시할 수 있습니다:

```typescript
class PrefetchRouter extends LazyRouter {
  private prefetchCache: Set<string> = new Set();
  
  protected init(): void {
    super.init();
    
    // 링크 호버 시 프리페칭
    document.addEventListener('mouseover', async (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && href.startsWith('/') && !this.prefetchCache.has(href)) {
          await this.prefetchRoute(href);
          this.prefetchCache.add(href);
        }
      }
    });
  }
  
  private async prefetchRoute(path: string): Promise<void> {
    const { route } = this.matchRoute(path);
    if (route && 'componentLoader' in route) {
      try {
        const component = await (route as LazyRoute).componentLoader();
        this.componentCache.set(route.path, component);
      } catch (error) {
        console.error('프리페칭 실패:', error);
      }
    }
  }
}
```

## 🎬 마무리

오늘은 바닐라 JavaScript(TypeScript)로 React Router의 핵심 기능을 직접 구현해보았습니다. 이 과정을 통해 SPA 라우팅의 내부 동작 원리를 깊이 이해할 수 있었습니다.

**History API의 동작 원리**를 이해하면서 브라우저가 어떻게 URL을 관리하고, JavaScript가 이를 어떻게 조작할 수 있는지 배웠습니다. `pushState`와 `popstate` 이벤트를 활용하여 페이지 새로고침 없이도 URL을 변경하고 히스토리를 관리하는 방법을 익혔습니다.

**경로 매칭 알고리즘**을 직접 구현하면서 문자열 패턴을 정규식으로 변환하고, 동적 파라미터를 추출하는 과정을 자세히 살펴보았습니다. 이는 많은 웹 프레임워크에서 사용하는 핵심 기술입니다.

**SPA 라우팅의 핵심 개념**들 - URL 기반 컴포넌트 렌더링, 동적 파라미터 처리, 404 페이지 관리 등을 실제로 구현해보면서 이론과 실무의 간극을 좁힐 수 있었습니다.

실제 프로젝트에서는 React Router, Vue Router, Angular Router 같은 검증된 라이브러리를 사용하는 것이 좋습니다. 이들은 우리가 구현한 기능 외에도 서버 사이드 렌더링, 코드 스플리팅, 트랜지션 효과, 스크롤 복원 등 다양한 고급 기능을 제공합니다.

하지만 이렇게 직접 구현해보는 경험은 매우 가치 있습니다. 라이브러리의 내부 동작을 이해하면 문제를 해결하거나 최적화할 때 더 나은 결정을 내릴 수 있습니다. 또한 프레임워크에 의존하지 않고도 필요한 기능을 구현할 수 있는 능력을 기를 수 있습니다.

Happy Coding! 🚀✨

```toc
``` 