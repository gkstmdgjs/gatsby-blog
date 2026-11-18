import styled from '@emotion/styled';

import { contentMaxWidth, MOBILE_MEDIA_QUERY } from '@/src/styles/themeStyle';

export const CategoryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 30px;
`;

export const CategoryTitle = styled.div`
  width: fit-content;
  margin-bottom: 15px;
  font-size: 30px;
  text-align: center;

  @media ${MOBILE_MEDIA_QUERY} {
    font-size: 25px;
  }
`;

export const CategorySubtitle = styled.div`
  padding-bottom: 10px;
  font-size: 20px;
  text-align: center;
  font-family: GmarketSansLight;
`;

export const TabWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: flex-start;
  top: 0px;
  width: 100%;
`;

export const Tabs = styled.div`
  display: flex;
  /* 카테고리가 한 줄을 넘으면 줄바꿈하지 않고 가로 스크롤한다 (2026-11-18 honey 결정).
     justify-content: center를 overflow와 함께 쓰면 넘친 왼쪽 탭이 잘려 스크롤로도 닿지 않는다(2026-10 All 사라짐).
     그래서 정렬은 flex-start로 두고, 양 끝 탭의 margin auto로 '넘치지 않을 때만' 가운데 정렬한다. */
  flex-wrap: nowrap;
  justify-content: flex-start;
  width: 100%;
  max-width: ${contentMaxWidth} + 40px;
  margin-bottom: 12px;
  gap: 24px;
  overflow-x: auto;
  overflow-y: hidden;
  & > :first-of-type {
    margin-left: auto;
  }
  & > :last-of-type {
    margin-right: auto;
  }
  padding: 0 15px;
`;

export const Tab = styled.div<{ isSelected: 'true' | 'false' }>`
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 17px;
  cursor: pointer;
  line-height: 50px;
  color: ${({ isSelected, theme }) =>
    isSelected === 'true' ? theme.color.black100 : theme.color.gray60};
`;

export const PostCardsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;
