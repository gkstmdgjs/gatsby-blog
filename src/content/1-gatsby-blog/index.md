---
emoji: 🛠️
title: '내 손으로 만든 Gatsby 블로그'
date: '2025-01-13'
categories: featured-Make Frontend
---

<h1 align="center">
  🎯 개발자라면 블로그 하나쯤은...
</h1>

개발자로서 커리어를 쌓아가면서 문득 이런 생각이 들었습니다. **"내가 배운 것을 정리할 공간이 필요하다"**.

개발 지식은 끊임없이 업데이트되고, 새로운 기술이 계속해서 등장합니다. 이런 변화의 흐름 속에서 자신만의 기록을 남기는 것은 단순한 메모 이상의 가치가 있다고 생각하며 개발자로서 기술 블로그는 단순한 기록의 공간을 넘어 나를 표현하는 **디지털 명함**이라고 생각합니다. 내 생각과 경험, 문제 해결 능력을 세상에 보여줄 수 있는 공간이니까요.

그리고 개발자라면 본인이 직접 만든 블로그 하나 쯤은 있어야 멋이 좀 난다고 생각 했습니다.

그러던 중 [Danmin](https://www.jeong-min.com)님께서 만드신 오픈 소스 블로그 템플릿을 발견하였고 이 템플릿을 베이스로 커스터마이징하여 내 블로그를 만들어 보기로 결심 했습니다.

&nbsp;

## 🌟 왜 Gatsby를 선택했나?

정말 다양하고 이쁘게 잘 만들어진 블로그 플랫폼은 정말 많습니다. Medium, Velog, Tistory, WordPress 등 선택지가 많았지만, 결국 **Gatsby**를 선택하여 블로그를 만들기로 했고 선택한 이유는 다음과 같습니다.

&nbsp;

### 💻 React 기반의 프레임워크

- React 개발자로서 익숙한 환경에서 블로그를 개발할 수 있다는 점이 매력적이었습니다
- 컴포넌트 기반 개발로 UI를 모듈화하고 재사용할 수 있습니다
- JSX를 활용한 마크업과 로직의 결합이 직관적입니다

&nbsp;

예를 들어, 다음과 같이 React 컴포넌트를 만들 수 있습니다:

```jsx
// src/components/Bio.jsx
import React from 'react';
import { StaticImage } from 'gatsby-plugin-image';

const Bio = () => {
  return (
    <div className="bio-container">
      <StaticImage
        className="bio-avatar"
        src="../images/profile.jpg"
        width={50}
        height={50}
        quality={95}
        alt="프로필 이미지"
      />
      <p>
        <strong>개발자의 디지털 명함</strong>
        <br />
        배움과 경험을 기록하는 공간입니다.
      </p>
    </div>
  );
};

export default Bio;
```

&nbsp;

### ⚡ 빠른 성능과 정적 사이트 생성

- Gatsby는 빌드 시점에 정적 페이지를 생성하여 로딩 속도가 매우 빠릅니다
- 사용자 경험 측면에서 빠른 페이지 전환과 로딩은 큰 장점입니다
- 정적 사이트이기 때문에 보안에도 강점이 있습니다

&nbsp;

Gatsby의 성능 최적화 기능 중 하나인 이미지 처리 예시:

```jsx
// gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
  ],
};
```

&nbsp;

### 🔌 풍부한 플러그인 생태계

- SEO, 이미지 최적화, 마크다운 변환 등 다양한 기능을 플러그인으로 쉽게 추가할 수 있습니다
- GraphQL을 통한 데이터 쿼리로 효율적인 데이터 관리가 가능합니다
- 커뮤니티가 활발하여 문제 해결이 용이합니다

&nbsp;

GraphQL을 사용한 데이터 쿼리 예시:

```jsx
// src/pages/index.js
import React from "react"
import { graphql } from "gatsby"

export default function Home({ data }) {
  return (
    <div>
      <h1>{data.site.siteMetadata.title}</h1>
      <div>
        {data.allMarkdownRemark.edges.map(({ node }) => (
          <article key={node.id}>
            <h2>{node.frontmatter.title}</h2>
            <p>{node.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "YYYY년 MM월 DD일")
          }
          excerpt
        }
      }
    }
  }
`
```

&nbsp;

## ✨ 내 Gatsby 블로그의 주요 기능

- 📱 **반응형 디자인**: 모바일부터 데스크톱까지 모든 기기에서 최적화된 경험을 제공합니다
- 🌓 **다크 모드 지원**: 토글 시 0.3초 동안 부드러운 색상 전환 + 본문/코드/표 색상까지 한 번에 변경됩니다
- 💅 **코드 하이라이팅 지원**: PrismJS + CSS 변수로 다크/라이트 모드 syntax 색상까지 동적으로 바뀝니다
- 📑 **스마트한 목차(TOC)**: 자동 생성 + 현재 섹션 하이라이트 + TOC 가 길면 자체 스크롤 + 활성 항목을 시야 안으로 자동 스크롤
- 💬 **댓글 기능**: Utterances 의 GitHub 이슈 기반 댓글, 테마 변경 시 위젯 재로딩 없이 `postMessage` 로 갱신
- 🤖 **SEO 최적화**: Gatsby v5 의 `Head` API 로 메타 태그를 관리합니다
- 📚 **Posts**: 글을 카테고리별로 보여주는 Posts 페이지
- 😎 **Portfolio**: 프로젝트를 보여줄 수 있는 Portfolio 페이지

&nbsp;

### 📱 반응형 디자인
모바일에서도 완벽하게 동작하는 반응형 레이아웃을 구현했습니다.

```css
/* src/styles/global.css */
:root {
  --primary-color: #5183f5;
  --font-size-base: 18px;
}

@media (max-width: 768px) {
  :root {
    --font-size-base: 16px;
  }
  
  .container {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  :root {
    --font-size-base: 14px;
  }
  
  .sidebar {
    display: none;
  }
}
```

&nbsp;

### 🌓 다크 모드
개발자들의 눈 건강을 위한 필수 기능! 단순 토글이 아니라 **부드러운 색상 전환과 코드 하이라이팅까지 한 번에 바뀌는 통합 테마 시스템** 을 구현했어요.

토글 버튼은 `gatsby-emotion-dark-mode` 의 `ThemeManagerContext` 를 그대로 활용합니다.

```typescript
// ThemeToggle 컴포넌트
const ThemeToggle: React.FC = () => {
  const theme = useContext(ThemeManagerContext);

  return (
    <S.Wrapper onClick={() => theme.toggleDark()} isDark={theme.isDark}>
      {theme.isDark ? <MdWbSunny /> : <BsMoonFill />}
    </S.Wrapper>
  );
};
```

색상은 `themeStyle.ts` 의 `lightTheme`/`darkTheme` 두 객체에 **같은 키를 한 쌍으로 정의** 하고, styled 안에서는 `theme.color.<key>` 로만 접근합니다. 인라인 hex 사용을 막아 모드 추가/색 변경이 한 곳에서 끝나도록 했어요!

```typescript
// src/styles/themeStyle.ts
export const lightTheme: Theme = {
  color: {
    black100: '#0F1010',
    gray10: '#F7F8FA',
    codeBg: '#F6F8FA',
    syntaxKeyword: '#CF222E',
    /* ... */
  },
};
export const darkTheme: Theme = {
  color: {
    black100: '#e6e6e6',
    gray10: '#2C2D2E',
    codeBg: '#282C34',
    syntaxKeyword: '#C678DD',
    /* ... */
  },
};
```

토글 시 색상이 **뚝뚝 끊기지 않도록** GlobalStyle 에 전역 transition 을 걸어뒀습니다. background-color / color / border-color / fill / stroke 만 transition 대상으로 잡아 hover 같은 다른 transition 과 충돌하지 않게 했어요!

```typescript
// src/styles/GlobalStyle.tsx
const style = (theme: Theme) => css`
  *,
  *::before,
  *::after {
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      border-color 0.3s ease,
      fill 0.3s ease,
      stroke 0.3s ease;
  }
`;
```

&nbsp;

### 💅 코드 하이라이팅
PrismJS를 활용하여 다양한 언어의 코드를 아름답게 표시합니다!

```typescript
// gatsby-config.ts
{
  resolve: `gatsby-transformer-remark`,
  options: {
    plugins: [
      {
        resolve: `gatsby-remark-prismjs`,
        options: {
          classPrefix: 'language-',
          showLineNumbers: false,
        },
      },
    ],
  },
}
```

PrismJS 의 기본 색상을 그대로 쓰지 않고, **테마 객체의 `syntax*` 색상을 CSS 변수로 노출** 해서 다크/라이트 모드 토글 시 syntax 색상까지 함께 바뀌도록 했어요!

```typescript
// src/styles/GlobalStyle.tsx
const style = (theme: Theme) => css`
  :root {
    --syntax-keyword: ${theme.color.syntaxKeyword};
    --syntax-string: ${theme.color.syntaxString};
    --syntax-function: ${theme.color.syntaxFunction};
    /* ... */
  }
`;
```

```scss
// src/styles/_markdown-style.scss — PrismJS 토큰을 CSS 변수로 덮어쓰기
.token.keyword { color: var(--syntax-keyword); }
.token.string  { color: var(--syntax-string); }
```

JavaScript, Spring Boot, Java 등 다양한 언어를 지원하며, 모드 전환 시 syntax 색상까지 부드럽게 따라옵니다:

```javascript
// JavaScript 코드가 이렇게 예쁘게 표시됩니다!
const greeting = (name) => {
  console.log(`안녕하세요, ${name}님! 🙌`);
  return `환영합니다!`;
};

// 함수 호출
greeting('개발자');
```

```java
// Spring Boot 코드도 어노테이션과 함께 깔끔하게!
@RestController
@RequestMapping("/api/blog")
public class BlogController {
    
    @Autowired
    private BlogService blogService;
    
    @GetMapping("/posts")
    public ResponseEntity<List<BlogPost>> getAllPosts() {
        List<BlogPost> posts = blogService.getAllPosts();
        return ResponseEntity.ok(posts);
    }
    
    @PostMapping("/posts")
    public ResponseEntity<BlogPost> createPost(@RequestBody BlogPost post) {
        BlogPost createdPost = blogService.createPost(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }
    
    @GetMapping("/posts/{id}")
    public ResponseEntity<BlogPost> getPost(@PathVariable Long id) {
        BlogPost post = blogService.getPostById(id);
        return ResponseEntity.ok(post);
    }
}

```

&nbsp;

### 📑 자동 목차 생성 (ToC)
긴 글도 쉽게 탐색할 수 있도록 목차를 자동 생성합니다. 단순 생성에 그치지 않고 **현재 섹션 하이라이트**, **TOC 가 길어지면 자체 스크롤**, **활성 항목이 시야 밖이면 자동으로 시야 안으로 끌어오기**, **커스텀 스크롤바 thumb** 까지 함께 구현했어요. 🎨

목차는 `gatsby-remark-table-of-contents` 가 본문에 `.table-of-contents` 컨테이너로 끼워 넣고, 활성 감지/자동 스크롤은 Post 템플릿의 useEffect 에서 처리합니다.

```typescript
// src/templates/Post/index.tsx — 활성 헤더 추적
const scrollEvent = () => {
  const overTheTop: Element[] = [];
  headers.forEach((h) => {
    if (h.getBoundingClientRect().top - 100 < 0) overTheTop.push(h);
  });

  const curHeaderText = overTheTop.pop()?.textContent;
  if (curHeaderText === prevHeaderText) return;
  prevHeaderText = curHeaderText;

  const tocContainer = document.querySelector<HTMLElement>('.table-of-contents');
  tocContainer?.querySelectorAll('a').forEach((a) => {
    a.className = a.textContent === curHeaderText
      ? (theme.isDark ? 'activated-dark' : 'activated-light')
      : '';
  });

  // 활성 링크가 TOC viewport 밖이면 안쪽으로 끌어오기
  const activeLink = tocContainer?.querySelector<HTMLElement>(
    '.activated-dark, .activated-light',
  );
  if (!tocContainer || !activeLink) return;

  const containerRect = tocContainer.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  const padding = 20;

  if (linkRect.top < containerRect.top) {
    tocContainer.scrollTo({
      top: tocContainer.scrollTop + (linkRect.top - containerRect.top) - padding,
      behavior: 'smooth',
    });
  } else if (linkRect.bottom > containerRect.bottom) {
    tocContainer.scrollTo({
      top: tocContainer.scrollTop + (linkRect.bottom - containerRect.bottom) + padding,
      behavior: 'smooth',
    });
  }
};
```

TOC 자체에는 `max-height` 와 `overflow-y: auto` 를 걸어 길이가 viewport 를 넘어가면 내부 스크롤이 생기게 합니다. 다만 네이티브 스크롤바는 transition 이 안 먹어서, **JS 로 그린 `.toc-thumb`** 을 띄워 hover 시 fade-in 되도록 했어요!

```scss
// src/styles/_markdown-style.scss
.markdown .table-of-contents {
  position: fixed;
  top: 105px;
  right: 100px;
  width: 240px;
  max-height: calc(100vh - 210px);
  overflow-y: auto;

  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }

  .toc-thumb {
    position: absolute;
    right: 0;
    width: 6px;
    background: var(--blockquote-border);
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  &:hover .toc-thumb { opacity: 1; }
}

@media (max-width: 1500px) { .markdown .table-of-contents { right: 50px; } }
@media (max-width: 1400px) { .markdown .table-of-contents { display: none; } }
```

```typescript
// thumb 위치/높이 계산 — TOC 스크롤 이벤트에 맞춰 갱신
const updateThumb = () => {
  const { scrollHeight, clientHeight, scrollTop } = tocContainerRef;
  if (scrollHeight <= clientHeight + 1) {
    thumb.style.display = 'none';
    return;
  }
  const max = scrollHeight - clientHeight;
  const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * clientHeight);
  const thumbTop = (scrollTop / max) * (clientHeight - thumbHeight);
  thumb.style.height = `${thumbHeight}px`;
  thumb.style.top = `${scrollTop + thumbTop}px`;
};
```

&nbsp;

### 💬 Utterances 댓글 시스템
GitHub Issues 를 활용한 댓글 기능이지만, 단순 통합 그 이상으로 **다크/라이트 전환 시 race condition 을 막는 가드** 까지 함께 설계했어요. Utterances 의 `client.js` 는 자기 자신(`<script>`) 옆에 iframe 을 박는 방식이라, **테마 변경마다 script 를 떼었다 붙이면 inflight 중인 client.js 가 부모 잃은 `<script>` 를 만지면서 `insertAdjacentHTML` 에러가 터지는** 함정이 있거든요.

그래서 useEffect 를 **두 개로 분리** 했습니다!

```typescript
const Utterances: React.FC<UtterancesProps> = ({ repo, path }) => {
  const rootElm = useRef<HTMLDivElement>(null);
  const theme = useContext(ThemeManagerContext);
  const initialThemeRef = useRef(theme.isDark);

  // script 마운트 — theme 은 의존성에서 제외
  useEffect(() => {
    const node = rootElm.current;
    if (!node) return;

    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.setAttribute('repo', repo);
    script.setAttribute('theme', initialThemeRef.current ? 'photon-dark' : 'github-light');
    script.setAttribute('issue-term', 'pathname');
    node.appendChild(script);

    return () => {
      while (node.firstChild) node.removeChild(node.firstChild);
    };
  }, [repo, path]);

  // 테마 변경 시 iframe 에 postMessage — 위젯 재로딩 없이 색만 갱신
  useEffect(() => {
    const iframe = rootElm.current?.querySelector<HTMLIFrameElement>('iframe.utterances-frame');
    iframe?.contentWindow?.postMessage(
      { type: 'set-theme', theme: theme.isDark ? 'photon-dark' : 'github-light' },
      'https://utteranc.es',
    );
  }, [theme.isDark]);

  return <S.Wrapper ref={rootElm} />;
};
```

핵심은 **테마 변경에서는 위젯 자체를 재로딩하지 않고 iframe 에 `postMessage` 만 던지는 것** 입니다. utterances 공식 권장 방식이기도 하고, race 의 가장 흔한 트리거를 통째로 제거해줘요. ✨

&nbsp;

### 🛠️ Portfolio 기술 스택 시각화
프로젝트에서 사용한 기술들을 한눈에 파악할 수 있도록 **아이콘과 색상**으로 표시하는 기능을 구현했습니다!

```typescript
// src/components/PortfolioCard/index.tsx
const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const iconStyle = { fontSize: '15px', marginRight: '3px' };
  
  const getTechIcon = (tech: string) => {
    switch (tech) {
      case 'Javascript':
        return <BiLogoJavascript style={iconStyle} />;
      case 'Typescript':
        return <BiLogoTypescript style={iconStyle} />;
      case 'React':
        return <FaReact style={iconStyle} />;
      case 'Vue':
        return <FaVuejs style={iconStyle} />;
      case 'Spring Boot':
        return <SiSpringboot style={iconStyle} />;
      case 'MySQL':
        return <SiMysql style={iconStyle} />;
      // ... 더 많은 기술 스택
    }
  };

  return (
    <S.TechList>
      {project.techStack.map((tech, index) => (
        <S.Tech tech={tech} key={index}>
          {getTechIcon(tech)}
          {tech}
        </S.Tech>
      ))}
    </S.TechList>
  );
};
```

각 기술 스택별 고유한 색상 적용:

```typescript
// src/components/PortfolioCard/styled.ts
export const Tech = styled.div<{ tech: string }>`
  display: flex;
  align-items: center;
  font-size: 10px;
  padding: 3.5px 5px;
  border-radius: 5px;
  color: ${({ theme }) => theme.color.white100};
  background-color: ${({ theme, tech }) => {
    switch (tech) {
      case 'Javascript':
        return '#f0db4f';  // JavaScript 공식 노란색
      case 'Typescript':
        return '#2f74c0';  // TypeScript 파란색
      case 'React':
        return '#53d4f7';  // React 하늘색
      case 'Vue':
        return '#42b883';  // Vue 초록색
      case 'Spring Boot':
        return '#6DB33F';  // Spring 연두색
      case 'MySQL':
        return '#4479A1';  // MySQL 파란색
      // ... 각 기술별 고유 색상
    }
  }};
`;
```

프로젝트 데이터 구조:
```typescript
// gatsby-data.ts
export const projects: Project[] = [
  {
    title: '개발자 블로그',
    description: 'Gatsby로 만든 기술 블로그',
    techStack: ['Typescript', 'React', 'Gatsby'],
    thumbnailUrl: '/images/blog-thumbnail.png',
    links: {
      github: 'https://github.com/username/blog',
      demo: 'https://myblog.com'
    }
  },
  {
    title: 'Todo 애플리케이션',
    description: 'Spring Boot와 React로 만든 Todo 앱',
    techStack: ['Javascript', 'React', 'Spring Boot', 'MySQL'],
    // ...
  }
];
```

이렇게 구현하면:
- 🎨 **각 기술마다 고유한 색상과 아이콘**
- 👀 **한눈에 프로젝트 기술 스택 파악 가능**
- 🔧 **새로운 기술 추가가 쉬움**
- 💅 **깔끔하고 직관적인 UI**

&nbsp;

### 🤖 SEO 최적화
검색 엔진 노출을 위해 메타 태그, sitemap, robots.txt 를 자동 생성합니다. **Gatsby v5 부터는 `react-helmet` 대신 페이지에서 `Head` 컴포넌트를 export 하는 방식** 으로 바뀌어, 이 블로그도 그 패턴을 따르고 있어요!

```typescript
// src/components/Seo/index.tsx
import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

type SeoProps = {
  title?: string;
  description?: string;
};

const Seo: React.FC<SeoProps> = ({ title, description }) => {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata { title description siteUrl }
      }
    }
  `);

  const meta = site.siteMetadata;
  const seoTitle = title ?? meta.title;
  const seoDescription = description ?? meta.description;

  return (
    <>
      <title>{seoTitle}</title>
      <meta name='description' content={seoDescription} />
      <meta property='og:title' content={seoTitle} />
      <meta property='og:description' content={seoDescription} />
      <meta property='og:url' content={meta.siteUrl} />
      <meta property='og:type' content='article' />
      <meta name='twitter:card' content='summary_large_image' />
    </>
  );
};

export default Seo;
```

페이지/템플릿에서는 `Head` 를 export 하기만 하면 끝입니다!

```typescript
// src/templates/Post/index.tsx
export const Head = ({ data }: HeadProps<PostTemplateData>) => {
  const curPost = new PostClass(data.cur);
  return <Seo title={`Honey | ${curPost?.title}`} description={curPost?.excerpt} />;
};
```

&nbsp;

## 📌 마무리

티스토리, 벨로그, 미디엄... 모두 좋은 플랫폼이지만, 결국 **Gatsby**를 사용하여 블로그를 만들게 되니 좀 멋있어진 것 같아 뿌듯 합니다!

이 블로그를 만들면서 정말 많은 것을 배웠습니다. GraphQL 쿼리를 작성하며 데이터 관리의 새로운 방법을 익혔고, 무엇보다 **내가 직접 만든 공간**이라는 자부심이 가장 큰 수확이었죠.

코드 한 줄 한 줄에 내 취향과 철학이 담긴 이 공간에서, 앞으로도 꾸준히 배우고 성장하는 모습을 기록해 나가겠습니다! 새로운 기술을 배우면 바로 적용하여 글도 작성하고 프로젝트에서 마주친 문제들과 해결 과정을 공유하며 더 나은 개발자로 성장할 것입니다.

블로그는 단순한 기록 공간이 아니라 **개발자로서의 여정을 보여주는 디지털 명함**이라고 생각합니다. 이곳을 통해 더 많은 개발자들과 소통하고, 함께 성장할 수 있기를 기대합니다!! 🚀

```toc
``` 