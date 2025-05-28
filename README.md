# Seunghoney Blog

[![Gatsby](https://img.shields.io/badge/Gatsby-663399?style=flat-square&logo=gatsby&logoColor=white)](https://www.gatsbyjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Emotion](https://img.shields.io/badge/Emotion-DB7093?style=flat-square&logo=emotion&logoColor=white)](https://emotion.sh/)

> 🌐 **URL**: [blog.seunghoney.com](https://blog.seunghoney.com/)  

## 📖 프로젝트 소개

Gatsby와 TypeScript로 구축된 개인 기술 블로그입니다. 개발 경험과 지식을 공유하는 공간입니다.

## 🛠️ 기술 스택

### Frontend
- **Framework**: Gatsby v4
- **Language**: TypeScript
- **UI Library**: React v18
- **Styling**: Emotion, Sass
- **Icons**: React Icons

### 개발 도구
- **Linter**: ESLint
- **Formatter**: Prettier
- **Build Tool**: Gatsby CLI

## 📁 프로젝트 구조

```
gatsby-blog/
├── 📁 src/
│   ├── 📁 components/       # 🧩 재사용 가능한 React 컴포넌트
│   │   ├── AboutTitle/      # 소개 페이지 타이틀
│   │   ├── EmojiPostCard/   # 이모지 포스트 카드
│   │   ├── Footer/          # 푸터 컴포넌트
│   │   ├── Header/          # 헤더 네비게이션
│   │   ├── Layout/          # 레이아웃 컴포넌트
│   │   ├── PostCard/        # 블로그 포스트 카드
│   │   ├── Profile/         # 프로필 컴포넌트
│   │   ├── ThemeToggle/     # 다크모드 토글
│   │   └── ...
│   ├── 📁 content/          # 📝 블로그 포스트 마크다운
│   │   ├── 1-gatsby-blog/
│   │   ├── 2-js-react/
│   │   └── 3-js-react/
│   ├── 📁 images/           # 🖼️ 이미지 에셋
│   ├── 📁 models/           # 🗂️ 데이터 모델
│   ├── 📁 pages/            # 📄 페이지 컴포넌트
│   │   ├── index.tsx        # 홈페이지
│   │   ├── about.tsx        # 소개 페이지
│   │   ├── portfolio.tsx    # 포트폴리오 페이지
│   │   └── 404.tsx          # 404 에러 페이지
│   ├── 📁 styles/           # 🎨 스타일 파일
│   ├── 📁 templates/        # 📋 페이지 템플릿
│   │   ├── Post/            # 포스트 상세 페이지
│   │   └── PostList/        # 포스트 목록 페이지
│   └── type.ts              # 📘 TypeScript 타입 정의
├── 📄 gatsby-config.ts      # ⚙️ Gatsby 설정
├── 📄 gatsby-node.ts        # 🔧 빌드 시 페이지 생성 로직
├── 📄 package.json          # 📦 의존성 관리
└── 📄 README.md             # 📖 프로젝트 문서
```

## 🚀 주요 기능

- ✨ **다크모드 지원**: 사용자 선호에 따른 테마 전환
- 📱 **반응형 디자인**: 모든 디바이스에서 최적화된 경험
- 🔍 **SEO 최적화**: 검색 엔진 최적화
- 💬 **댓글 기능**: Utterances를 통한 GitHub 기반 댓글
- 📊 **Google Analytics**: 방문자 분석
- 🎯 **RSS 피드**: 구독자를 위한 RSS 지원
- 🖼️ **이미지 최적화**: gatsby-image를 통한 빠른 로딩
- 🎨 **코드 하이라이팅**: Prism.js를 통한 문법 강조

## 🏃‍♂️ 시작하기

```bash
# 의존성 설치
yarn

# 개발 서버 실행 (포트: 7474)
yarn start

# 프로덕션 빌드
yarn build

# 프로덕션 서버 실행
yarn serve

# 캐시 정리
yarn clean
```

## 👨‍💻 개발자 정보

- **이름**: 한승헌
- **닉네임**: Honey
- **직업**: Full Stack Developer
- **이메일**: sh725473@gmail.com
- **GitHub**: [gkstmdgjs](https://github.com/gkstmdgjs)