import { graphql } from 'gatsby';
import { ThemeManagerContext } from 'gatsby-emotion-dark-mode';
import React, { useContext, useEffect } from 'react';

import Layout from '@/src/components/Layout';
import PostHeader from '@/src/components/PostHeader';
import PostNavigator from '@/src/components/PostNavigator';
import Seo from '@/src/components/Seo';
import Utterances from '@/src/components/Utterances';
import PostClass from '@/src/models/post';
import { Post, SiteMetadata } from '@/src/type';

import * as S from './styled';

type PostTemplateProps = {
  location: Location;
  data: {
    categories: string[];
    prev: Post;
    next: Post;
    cur: Post;
    site: { siteMetadata: SiteMetadata };
    markdownRemark: Post;
  };
};

const PostTemplate: React.FC<PostTemplateProps> = ({ location, data }) => {
  const curPost = new PostClass(data.cur);
  const prevPost = data.prev && new PostClass(data.prev);
  const nextPost = data.next && new PostClass(data.next);
  const utterancesRepo = data.site.siteMetadata.comments.utterances.repo;
  const theme = useContext(ThemeManagerContext);

  useEffect(() => {
    const postSection = document.querySelector('.markdown');
    if (!postSection) return;

    const headers = postSection.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (!headers) return;

    const scrollEvent = () => {
      const overTheTop: Element[] = [];
      headers.forEach((h) => {
        if (h.getBoundingClientRect().top - 100 < 0) {
          overTheTop.push(h);
        }
      });

      const curHeaderText = overTheTop.pop()?.textContent;
      const aTags = document.querySelector('.table-of-contents')?.querySelectorAll('a');

      aTags?.forEach((a) => {
        a.className = '';
        if (a.textContent === curHeaderText) {
          a.className = theme.isDark ? 'activated-dark' : 'activated-light';
        }
      });
    };
    scrollEvent();

    document.addEventListener('scroll', scrollEvent);
    return () => { document.removeEventListener('scroll', scrollEvent); };
  }, [theme.isDark]);

  return (
    <Layout location={location}>
      <Seo title={`Honey | ${curPost?.title}`} description={curPost?.excerpt} />
      <PostHeader post={curPost} />
      <S.PostContent>
        <div className='markdown' dangerouslySetInnerHTML={{ __html: curPost.html }} />
      </S.PostContent>
      <PostNavigator prevPost={prevPost} nextPost={nextPost} />
      <Utterances repo={utterancesRepo} path={curPost.slug} />
    </Layout>
  );
};

export default PostTemplate;

export const pageQuery = graphql`
  query ($slug: String, $nextSlug: String, $prevSlug: String) {
    cur: markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      excerpt(pruneLength: 500, truncate: true)
      frontmatter {
        date(formatString: "YYYY.MM.DD")
        title
        categories
        emoji
      }
      fields {
        slug
      }
    }

    next: markdownRemark(fields: { slug: { eq: $nextSlug } }) {
      id
      html
      frontmatter {
        date(formatString: "YYYY.MM.DD")
        title
        categories
        emoji
      }
      fields {
        slug
      }
    }

    prev: markdownRemark(fields: { slug: { eq: $prevSlug } }) {
      id
      html
      frontmatter {
        date(formatString: "YYYY.MM.DD")
        title
        categories
        emoji
      }
      fields {
        slug
      }
    }

    site {
      siteMetadata {
        comments {
          utterances {
            repo
          }
        }
      }
    }
  }
`;
