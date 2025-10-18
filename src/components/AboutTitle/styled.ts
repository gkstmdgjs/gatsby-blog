import styled from '@emotion/styled';

import { MOBILE_MEDIA_QUERY } from '@/src/styles/themeStyle';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  width: 100%;
  h2 {
    font-size: 30px;
    font-family: GmarketSansMedium;
    padding-bottom: 5px;

    @media ${MOBILE_MEDIA_QUERY} {
      font-size: 20px;
    }
  }
`;
