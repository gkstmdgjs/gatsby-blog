import styled from '@emotion/styled';

import { contentMaxWidth, MOBILE_MEDIA_QUERY } from '@/src/styles/themeStyle';

export const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  word-break: keep-all;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  padding: 60px 15px;
  box-shadow: 0 0 30px rgb(0 0 0 / 0.1);
  background-color: ${({ theme }) => theme.color.white100};

  @media ${MOBILE_MEDIA_QUERY} {
    padding-bottom: 30px;
  }
`;

export const Content = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: 100%;
  max-width: ${contentMaxWidth};
`;
