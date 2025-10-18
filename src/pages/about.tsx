import { graphql } from 'gatsby';
import React from 'react';

import Layout from '../components/Layout';
import Profile from '../components/Profile';
import Seo from '../components/Seo';
import Timestamps from '../components/Timestamps';
import { SiteMetadata, Timestamp } from '../type';

type AboutProps = {
  data: {
    site: { siteMetadata: SiteMetadata };
  };
  location: Location;
};

const About: React.FC<AboutProps> = ({ location, data }) => {
  const metaData = data.site.siteMetadata;
  const { author, timestamps } = metaData;

  const stamps = timestamps.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.category]: [...(acc[cur.category] || []), cur],
    };
  }, {} as Record<string, Timestamp[]>);

  return (
    <Layout location={location}>
      <Seo title={`${author.nickname} | About`} />
      <Profile author={author} />
      {Object.keys(stamps).map((key) => (
        <Timestamps key={key} title={key} timestamps={stamps[key]} />
      ))}
    </Layout>
  );
};

export default About;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        language
        author {
          name
          nickname
          profileImage
          job
          email
          github
        }
        timestamps {
          category
          date
          en
          kr
          info
        }
      }
    }
  }
`;
