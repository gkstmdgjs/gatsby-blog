import { graphql, useStaticQuery } from 'gatsby';
import * as React from 'react';

type SeoProps = {
  description?: string;
  title: string;
  children?: React.ReactNode;
};

const Seo: React.FC<SeoProps> = ({ description, title, children }) => {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          siteImage
          author {
            name
            nickname
          }
        }
      }
    }
  `);

  const metaDescription = description || site.siteMetadata.author.nickname;
  const defaultTitle = site.siteMetadata.title;

  return (
    <>
      <html lang='ko' />
      <title>{title || defaultTitle}</title>
      <meta name='description' content={metaDescription} />
      <meta property='og:title' content={title} />
      <meta property='og:site_title' content={defaultTitle} />
      <meta property='og:description' content={metaDescription} />
      <meta property='og:author' content={site.siteMetadata.author.name} />
      <meta property='og:image' content={site.siteMetadata.siteImage} />
      <meta property='og:type' content='website' />
      {children}
    </>
  );
};

export default Seo;
