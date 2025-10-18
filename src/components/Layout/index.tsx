import '@/src/styles/style.scss';

import { ThemeProvider } from '@emotion/react';
import { ThemeManagerContext } from 'gatsby-emotion-dark-mode';
import { useContext } from 'react';

import GlobalStyle from '@/src/styles/GlobalStyle';
import { darkTheme, lightTheme } from '@/src/styles/themeStyle';

import Footer from '../Footer';
import Header from '../Header';
import * as S from './styled';

type LayoutProps = {
  location: Location;
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ location, children }) => {
  const theme = useContext(ThemeManagerContext);

  return (
    <ThemeProvider theme={theme.isDark ? darkTheme : lightTheme}>
      <GlobalStyle />
      <div>
        <S.ContentWrapper>
          {location && <Header location={location} />}
          <S.Content>{children}</S.Content>
        </S.ContentWrapper>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Layout;
