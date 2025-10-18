import styled from '@emotion/styled';
import { Link } from 'gatsby';

import { contentMaxWidth, hoverUnderline, MOBILE_MEDIA_QUERY } from '@/src/styles/themeStyle';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 60px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  background-color: ${({ theme }) => theme.color.white100};

  @media ${MOBILE_MEDIA_QUERY} {
    padding: 0 15px;
  }

  @media screen and (max-width: 345px) {
    height: 40px;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-family: GmarketSansBold;
  max-width: ${contentMaxWidth};

  .logo {
    display: flex;
    align-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    justify-content: center;
    font-weight: 800;
    font-family: Montserrat;
    background-color: ${({ theme }) => theme.color.black100};
    a {
      color: ${({ theme }) => theme.color.white100};
    }

    @media ${MOBILE_MEDIA_QUERY} {
      width: 27px;
      height: 27px;
    }
    @media screen and (max-width: 400px) {
      width: 24px;
      height: 24px;
    }

    @media screen and (max-width: 345px) {
      width: 20px;
      height: 20px;
    }
  }
`;

export const Menu = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;

  @media ${MOBILE_MEDIA_QUERY} {
    gap: 12px;
  }

  @media screen and (max-width: 400px) {
    gap: 10px;
  }

  @media screen and (max-width: 345px) {
    gap: 8px;
  }
`;

export const MenuLink = styled(Link)<{ isselected: string }>`
  font-size: 18px;
  ${({ theme }) => hoverUnderline(theme)};
  &:after {
    height: 2px;
    bottom: -2px;
    transform: ${({ isselected }) => (isselected === 'true' ? 'scaleX(1)' : 'scaleX(0)')};
  }

  &:hover:after {
    @media ${MOBILE_MEDIA_QUERY} {
      transform: ${({ isselected }) => (isselected === 'true' ? 'scaleX(1)' : 'scaleX(0)')};
    }
  }

  @media ${MOBILE_MEDIA_QUERY} {
    font-size: 16px;
  }

  @media screen and (max-width: 400px) {
    font-size: 14px;
  }

  @media screen and (max-width: 345px) {
    font-size: 12px;
  }
`;
