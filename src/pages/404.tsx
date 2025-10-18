import * as React from 'react';

import Layout from '../components/Layout';
import NotFound from '../components/NotFound';
import Seo from '../components/Seo';

type NotFoundPageProps = {
  location: Location;
};

const NotFoundPage: React.FC<NotFoundPageProps> = ({ location }) => {
  return (
    <Layout location={location}>
      <NotFound />
    </Layout>
  );
};

export const Head = () => <Seo title='404: Not Found' />;

export default NotFoundPage;
