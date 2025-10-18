import { graphql, useStaticQuery } from 'gatsby';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Helmet } from 'react-helmet';

type SeoProps = {
  description?: string;
  title: string;
  children?: React.ReactNode;
};

const Seo: React.FC<SeoProps> = ({ description, title }) => {
  const { site } = useStaticQuery(
    graphql`
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
    `,
  );

  const metaDescription = description || site.siteMetadata.author.nickname;

  return (
    <Helmet
      htmlAttributes={{ lang: 'ko' }}
      title={title}
      defaultTitle={site.siteMetadata.title}
      meta={[
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:site_title`,
          content: site.siteMetadata.title,
        },
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: 'og:author',
          content: site.siteMetadata.author.name,
        },
        {
          property: 'og:image',
          content: site.siteMetadata.siteImage,
        },
        {
          property: `og:type`,
          content: `website`,
        },
      ]}
    />
  );
};

Seo.defaultProps = {
  description: ``,
};

Seo.propTypes = {
  description: PropTypes.string as React.Validator<string>,
  title: PropTypes.string.isRequired,
};

export default Seo;
