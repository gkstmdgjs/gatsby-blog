import styled from '@emotion/styled';

import { MOBILE_MEDIA_QUERY } from '@/src/styles/themeStyle';

export const Wrapper = styled.div<{ isDark: boolean }>`
  .theme-icon {
    color: ${({ theme }) => theme.color.black40};
    width: 25px;
    height: 25px;
    cursor: pointer;
  }

  @media ${MOBILE_MEDIA_QUERY} {
    .theme-icon {
      width: 20px;
      height: 20px;
    }
  }

  @media screen and (max-width: 345px) {
    .theme-icon {
      width: 17px;
      height: 17px;
    }
  }
`;
