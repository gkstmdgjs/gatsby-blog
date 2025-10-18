import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

import { MOBILE_MEDIA_QUERY } from '@/src/styles/themeStyle';

const blinkingCursor = keyframes`
  0% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`;

export const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  margin: 70px 0;
  padding-bottom: 35px;
  font-family: GmarketSansLight;
  border-bottom: 1px solid ${({ theme }) => theme.color.gray20};

  .react-rotating-text-cursor {
    animation: ${blinkingCursor} 0.8s cubic-bezier(0.68, 0.01, 0.01, 0.99) 0s infinite;
  }

  @media ${MOBILE_MEDIA_QUERY} {
    padding: 1 10px;
    margin-top: 50px;
    margin-bottom: 60px;
  }

  @media screen and (max-width: 500px) {
    padding-bottom: 25px;
    margin-top: 35px;
    margin-bottom: 45px;
  }

  @media screen and (max-width: 400px) {
    padding-bottom: 15px;
    margin-top: 20px;
    margin-bottom: 30px;
  }

  @media screen and (max-width: 345px) {
    margin-top: 10px;
    margin-bottom: 25px;
  }
`;

export const IntroWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 40px;
  line-height: 1.2;

  strong {
    display: inline-block;
    font-family: GmarketSansMedium;
    .react-rotating-text-cursor {
      font-size: 40px;
      font-family: GmarketSansLight;

      @media ${MOBILE_MEDIA_QUERY} {
        font-size: 27px;
      }
    }
  }

  .react-rotating-text-cursor {
    animation: ${blinkingCursor} 0.8s cubic-bezier(0.68, 0.01, 0.01, 0.99) 0s infinite;
  }
`;

export const Image = styled.div`
  margin-right: 20px;
  overflow: hidden;
  border-radius: 12px;
  width: 100%;

  @media ${MOBILE_MEDIA_QUERY} {
    margin-right: 10px;
    width: 100%;
  }
`;

export const Flex = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  flex: auto 0 0;
  width: 70%;

  @media ${MOBILE_MEDIA_QUERY} {
    width: 60%;
  }
`;

export const Job = styled.p`
  font-size: 30px;
  font-weight: bold;
  opacity: 0.7;

  @media screen and (max-width: 600px) {
    font-size: 25px;
  }

  @media screen and (max-width: 500px) {
    font-size: 20px;
  }

  @media screen and (max-width: 400px) {
    font-size: 17px;
  }

  @media screen and (max-width: 345px) {
    font-size: 14px;
  }
`;

export const Name = styled.p`
  font-weight: bold;

  @media screen and (max-width: 600px) {
    font-size: 33px;
  }

  @media screen and (max-width: 500px) {
    font-size: 27px;
  }

  @media screen and (max-width: 400px) {
    font-size: 23px;
  }

  @media screen and (max-width: 345px) {
    font-size: 18px;
  }
`;

export const Icons = styled.p`
  display: flex;
  gap: 10px;

  @media screen and (max-width: 600px) {
    font-size: 35px;
  }

  @media screen and (max-width: 450px) {
    font-size: 30px;
    gap: 5px;
  }

  @media screen and (max-width: 400px) {
    font-size: 28px;
  }

  @media screen and (max-width: 345px) {
    font-size: 24px;
  }
`;

export const Link = styled.a`
  &:hover {
    cursor: pointer;
  }
`;
