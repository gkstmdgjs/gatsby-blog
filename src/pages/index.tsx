import { graphql, HeadProps } from 'gatsby';
import React from 'react';

import EmojiPostColumn from '../components/EmojiPostColumn';
import Layout from '../components/Layout';
import Profile from '../components/Profile';
import Seo from '../components/Seo';
import PostClass from '../models/post';
import { AllMarkdownRemark, SiteMetadata } from '../type';

type HomeData = {
  site: { siteMetadata: SiteMetadata };
  allMarkdownRemark: AllMarkdownRemark;
};

type HomeProps = {
  data: HomeData;
  location: Location;
};

const Home: React.FC<HomeProps> = ({ location, data }) => {
  const posts = data.allMarkdownRemark.edges.map(({ node }) => new PostClass(node));
  const { author, featured } = data.site.siteMetadata;

  const recentPosts = posts.slice(0, 3);

  const featuredPosts = featured.map(({ title, category }) => {
    const filteredPosts = posts.filter((post) => post.categories.find((c) => c === category));
    return { title, posts: filteredPosts };
  });

  return (
    <Layout location={location}>
      <Profile author={author} />
      <EmojiPostColumn title='Recent Posts' posts={recentPosts} fill={false} />
      {featuredPosts.map(({ title, posts }, i) => (
        <EmojiPostColumn key={i} title={title} posts={posts} />
      ))}
    </Layout>
  );
};

export default Home;

export const Head = ({ data }: HeadProps<HomeData>) => (
  <Seo title={data.site.siteMetadata.author.nickname} />
);

export const pageQuery = graphql`
  query {
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      edges {
        node {
          id
          excerpt(pruneLength: 500, truncate: true)
          frontmatter {
            categories
            title
            emoji
            date(formatString: "YYYY.MM.DD")
          }
          fields {
            slug
          }
        }
      }
    }

    site {
      siteMetadata {
        siteUrl
        language
        featured {
          title
          category
        }
        author {
          name
          nickname
          profileImage
          job
          email
          github
        }
      }
    }
  }
`;
