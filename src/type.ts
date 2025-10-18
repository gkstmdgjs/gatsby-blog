import '@emotion/react';

export type SiteMetadata = {
  title: string;
  author: Author;
  siteUrl: string;
  siteImage: string;
  language: string;
  featured: { title: string; category: string }[];
  timestamps: Timestamp[];
  comments: {
    utterances: {
      repo: string;
    };
  };
  portfolio: {
    projects: Project[];
  };
};

export type Timestamp = {
  category: string;
  date: string;
  kr: string;
  en: string;
  info: string;
  link: string;
};

export type Project = {
  title: string;
  description: string;
  techStack: string[];
  thumbnailUrl: string;
  links: {
    post: string;
    github: string;
    googlePlay: string;
    appStore: string;
    demo: string;
  };
};

export type Author = {
  name: string;
  nickname: string;
  profileImage: string;
  job: string;
  email: string;
  github: string;
};

export type Post = {
  id: string;
  excerpt: string;
  html: string;
  frontmatter: Frontmatter;
  fields: Fields;
  categories: string[];
};

export type AllMarkdownRemark = {
  edges: { node: MarkdownRemark; next: { fields: Fields }; previous: { fields: Fields } }[];
};

export type MarkdownRemark = {
  id: string;
  frontmatter: Frontmatter;
  fields: Fields;
  excerpt: string;
  html: string;
};

export type Frontmatter = {
  title: string;
  author: string;
  date: string;
  emoji: string;
  categories: string;
};

export type Fields = {
  slug: string;
};

declare module '@emotion/react' {
  export interface Theme {
    color: {
      black100: string;
      black60: string;
      black40: string;
      gray80: string;
      gray60: string;
      gray40: string;
      gray20: string;
      gray10: string;
      white100: string;
    };
  }
}
