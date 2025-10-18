---
emoji: 🛠️
title: '내 손으로 만든 Gatsby 블로그'
date: '2025-01-13'
categories: featured-Make
---

<h1 align="center">
  🎯 개발자라면 블로그 하나쯤은...
</h1>

개발자로서 커리어를 쌓아가면서 문득 이런 생각이 들었습니다. **"내가 배운 것을 정리할 공간이 필요하다"**.

개발 지식은 끊임없이 업데이트되고, 새로운 기술이 계속해서 등장합니다. 이런 변화의 흐름 속에서 자신만의 기록을 남기는 것은 단순한 메모 이상의 가치가 있다고 생각하며 개발자로서 기술 블로그는 단순한 기록의 공간을 넘어 나를 표현하는 **디지털 명함**이라고 생각합니다. 내 생각과 경험, 문제 해결 능력을 세상에 보여줄 수 있는 공간이니까요.

그리고 개발자라면 본인이 직접 만든 블로그 하나 쯤은 있어야 멋이 좀 난다고 생각 했습니다.

그러던 중 <a href="https://www.jeong-min.com">Danmin</a>님께서 만드신 오픈 소스 블로그 템플릿을 발견하였고 이 템플릿을 베이스로 커스터마이징하여 내 블로그를 만들어 보기로 결심 했습니다.

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
- 🌓 **다크 모드 지원**: 눈의 피로를 줄이고 배터리를 절약할 수 있습니다
- 💅 **코드 하이라이팅 지원**: 코드 블록을 멋지게 보여줍니다
- 📑 **스마트한 목차(TOC) 자동 생성**: 긴 글도 쉽게 탐색할 수 있습니다
- 💬 **댓글 기능**: Utterances를 통해 GitHub 이슈 기반 댓글 시스템을 구현했습니다
- 🤖 **SEO 최적화**: 검색 엔진에 잘 노출되도록 메타데이터를 관리합니다
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
개발자들의 눈 건강을 위한 필수 기능!

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

&nbsp;

### 💅 코드 하이라이팅
PrismJS를 활용하여 다양한 언어의 코드를 아름답게 표시할 수 있습니다!

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
          inlineCodeMarker: null,
          aliases: {},
          showLineNumbers: false,
          noInlineHighlight: false,
          languageExtensions: [
            {
              language: 'superscript',
              extend: 'javascript',
              definition: {
                superscript_types: /(SuperType)/,
              },
            },
          ],
        },
      },
    ],
  },
}
```

JavaScript, Spring Boot, Java 등 다양한 언어를 지원하며, 다크 모드와 연동되어 테마에 맞는 하이라이팅을 제공합니다:

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
긴 글도 쉽게 탐색할 수 있도록 목차를 자동으로 생성하고, **현재 읽고 있는 섹션을 하이라이트**해주는 기능을 구현했으며 
구현된 목차는 **현재 읽고 있는 섹션을 실시간으로 하이라이트**해주며, 
🖱️ **클릭하면 해당 섹션으로 부드럽게 스크롤**됩니다. 또한 📱 **반응형 디자인으로 모바일에서는 숨김 처리**되어 화면을 효율적으로 활용하고,
 🎨 **h2, h3, h4 계층 구조에 따른 들여쓰기**로 가독성을 높였습니다!

```typescript
// 스크롤 이벤트로 현재 위치 감지
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveId(entry.target.id);
      }
    });
  },
  { rootMargin: '-20% 0% -70% 0%' }
);

// 목차 렌더링
{headings.map(({ id, text, level }) => (
  <TOCItem
    level={level}
    active={activeId === id}
    onClick={() => scrollToElement(id)}
  >
    {text}
  </TOCItem>
))}
```

&nbsp;

### 💬 Utterances 댓글 시스템
GitHub Issues를 활용한 댓글 기능으로 개발자스러운 소통이 가능합니다.

```typescript
const Utterances: React.FC<UtterancesProps> = ({ repo, path }) => {
  const theme = useContext(ThemeManagerContext);
  
  useEffect(() => {
    const utterancesConfig = {
      src: 'https://utteranc.es/client.js',
      repo,
      theme: theme.isDark ? 'photon-dark' : 'github-light',
      'issue-term': 'pathname',
      async: true,
    };
    // ... 설정 적용
  }, [theme.isDark]);
};
```

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
검색 엔진에 잘 노출되도록 메타 태그와 sitemap, robots.txt를 자동 생성합니다.

```jsx
// src/components/SEO.jsx
import React from "react"
import { Helmet } from "react-helmet"
import { useStaticQuery, graphql } from "gatsby"

const SEO = ({ title, description, image, article }) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            defaultTitle: title
            defaultDescription: description
            siteUrl
            defaultImage: image
          }
        }
      }
    `
  )

  const {
    defaultTitle,
    defaultDescription,
    siteUrl,
    defaultImage,
  } = site.siteMetadata

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image || defaultImage}`,
    url: `${siteUrl}`,
  }

  return (
    <Helmet title={seo.title}>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      {seo.url && <meta property="og:url" content={seo.url} />}
      {article && <meta property="og:type" content="article" />}
      {seo.title && <meta property="og:title" content={seo.title} />}
      {seo.description && <meta property="og:description" content={seo.description} />}
      {seo.image && <meta property="og:image" content={seo.image} />}
      <meta name="twitter:card" content="summary_large_image" />
      {seo.title && <meta name="twitter:title" content={seo.title} />}
      {seo.description && <meta name="twitter:description" content={seo.description} />}
      {seo.image && <meta name="twitter:image" content={seo.image} />}
    </Helmet>
  )
}

export default SEO
```

&nbsp;

## 📌 마무리

티스토리, 벨로그, 미디엄... 모두 좋은 플랫폼이지만, 결국 **Gatsby**를 사용하여 블로그를 만들게 되니 좀 멋있어진 것 같아 뿌듯 합니다.

이 블로그를 만들면서 정말 많은 것을 배웠습니다. GraphQL 쿼리를 작성하며 데이터 관리의 새로운 방법을 익혔고, 무엇보다 **내가 직접 만든 공간**이라는 자부심이 가장 큰 수확이었죠.

코드 한 줄 한 줄에 내 취향과 철학이 담긴 이 공간에서, 앞으로도 꾸준히 배우고 성장하는 모습을 기록해 나가겠습니다. 새로운 기술을 배우면 바로 적용하여 글도 작성하고 프로젝트에서 마주친 문제들과 해결 과정을 공유하며 더 나은 개발자로 성장할 것입니다.

블로그는 단순한 기록 공간이 아니라 **개발자로서의 여정을 보여주는 디지털 명함**이라고 생각합니다. 이곳을 통해 더 많은 개발자들과 소통하고, 함께 성장할 수 있기를 기대합니다!! 🚀

```toc
``` 