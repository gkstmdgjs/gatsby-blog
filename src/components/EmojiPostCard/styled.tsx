import styled from '@emotion/styled';
import { Link } from 'gatsby';

import { contentMaxWidth, MOBILE_MEDIA_QUERY } from '@/src/styles/themeStyle';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
  width: 100%;

  @media screen and (max-width: 345px) {
    margin-bottom: 5px;
  }
`;

export const PostCard = styled(Link)`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  cursor: pointer;
  gap: 15px;
  padding-right: 15px;
  max-width: ${contentMaxWidth};

  &:hover {
    background-color: ${({ theme }) => theme.color.gray10};
    @media ${MOBILE_MEDIA_QUERY} {
      background-color: transparent;
    }
  }

  @media ${MOBILE_MEDIA_QUERY} {
    min-height: 50px;
    &:active {
      background-color: ${({ theme }) => theme.color.gray10};
    }
  }
`;

export const Emoji = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  border-radius: 50%;
  width: 60px;
  min-width: 60px;
  height: 60px;
  padding-top: 5px;
  box-sizing: border-box;
  background-color: ${({ theme }) => theme.color.gray10};

  @media ${MOBILE_MEDIA_QUERY} {
    font-size: 30px;
    width: 50px;
    min-width: 50px;
    height: 50px;
  }

  @media screen and (max-width: 345px) {
    font-size: 27px;
    width: 45px;
    min-width: 45px;
    height: 45px;
  }
`;

export const Title = styled.div`
  font-size: 18px;
  word-break: break-all;
  line-height: 120%;

  @media ${MOBILE_MEDIA_QUERY} {
    display: -webkit-box;
    font-size: 15px;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-word;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 120%;
  }

  @media screen and (max-width: 345px) {
    font-size: 13.5px;
  }
`;

export const Date = styled.div`
  font-size: 13px;
  font-family: GmarketSansLight;
  margin-top: 3px;
  color: ${({ theme }) => theme.color.gray60};

  @media ${MOBILE_MEDIA_QUERY} {
    font-size: 10px;
    margin-left: auto;
  }
  @media screen and (max-width: 345px) {
    font-size: 9.5px;
  }
`;
