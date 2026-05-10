import styled from '@emotion/styled';
import { graphql, HeadProps } from 'gatsby';
import React from 'react';

import Layout from '../components/Layout';
import ProtfolioCard from '../components/ProtfolioCard';
import Seo from '../components/Seo';
import { MOBILE_MEDIA_QUERY } from '../styles/themeStyle';
import { SiteMetadata } from '../type';

type PortfolioData = {
  site: { siteMetadata: SiteMetadata };
};

type portfolioProps = {
  data: PortfolioData;
  location: Location;
};

const portfolio: React.FC<portfolioProps> = ({ location, data }) => {
  const metaData = data.site.siteMetadata;
  const {
    portfolio: { projects },
  } = metaData;

  return (
    <Layout location={location}>
      <Title>SeungHoney Creation</Title>
      <ProjectCardsWrapper>
        {projects.map((project, index) => (
          <ProtfolioCard key={index} project={project} />
        ))}
      </ProjectCardsWrapper>
    </Layout>
  );
};

export default portfolio;

export const Head = ({ data }: HeadProps<PortfolioData>) => (
  <Seo title={`${data.site.siteMetadata.author.nickname} | Portfolio`} />
);

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        author {
          nickname
        }
        portfolio {
          projects {
            title
            description
            techStack
            thumbnailUrl
            links {
              github
              demo
              googlePlay
              appStore
            }
          }
        }
      }
    }
  }
`;

const Title = styled.div`
  font-size: 20px;
  margin-top: 50px;
  font-weight: 800;
`;

const ProjectCardsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 29px;
  margin-top: 60px;
  row-gap: 64px;
  @media ${MOBILE_MEDIA_QUERY} {
    display: flex;
    flex-direction: column;
    gap: 26px;
    margin-top: 26px;
  }
`;
