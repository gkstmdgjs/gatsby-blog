import styled from '@emotion/styled';

import { MOBILE_MEDIA_QUERY } from '@/src/styles/themeStyle';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 20px;
`;

export const Title = styled.div<{ fill: 'true' | 'false' }>`
  font-size: 20px;
  width: fit-content;
  margin-bottom: 25px;
  padding: 10px;
  background-color: ${({ theme, fill }) => (fill === 'true' ? theme.color.black40 : theme.color.white100)};
  color: ${({ theme, fill }) => (fill === 'true' ? theme.color.white100 : theme.color.black40)};
  border: 1px solid ${({ theme, fill }) => (fill === 'true' ? theme.color.white100 : theme.color.black40)};

  @media ${MOBILE_MEDIA_QUERY} {
    font-size: 17px;
    padding: 8px 10px;
  }
  @media screen and (max-width: 345px) {
    font-size: 15px;
    padding: 6px 8px;
  }
`;
