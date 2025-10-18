import styled from '@emotion/styled';
import { Link } from 'gatsby';

import { MOBILE_MEDIA_QUERY } from '@/src/styles/themeStyle';

export const Wrapper = styled.div`
  align-items: center !important;
  justify-content: center !important;
  min-height: 80vh;
  display: flex;
`;

export const Content = styled.div`
  flex: 0 0 auto;
  width: 50%;

  @media ${MOBILE_MEDIA_QUERY} {
    width: 100%;
  }
`;

export const H1 = styled.div`
  font-size: 6rem;
  font-weight: bold;
  margin-bottom: 0.5rem;

  @media ${MOBILE_MEDIA_QUERY} {
    font-size: 5.5rem;
  }
`;

export const H4 = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;

  @media ${MOBILE_MEDIA_QUERY} {
    font-size: 1.5rem;
  }
`;

export const Reason = styled.div`
  margin-bottom: 3rem;

  @media ${MOBILE_MEDIA_QUERY} {
    margin-bottom: 3rem;
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }
`;

export const Button = styled(Link)`
  background-color: ${({ theme }) => theme.color.black40};
  color: ${({ theme }) => theme.color.white100};
  border-radius: 0.25rem;
  padding: 5px 7px;
`;

export const Image = styled.div`
  flex: 0 0 auto;
  width: 50%;
  padding-left: 20px;

  @media ${MOBILE_MEDIA_QUERY} {
    display: none;
  }
`;
