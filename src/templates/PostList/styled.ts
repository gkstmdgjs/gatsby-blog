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
  /* 카테고리가 늘어 한 줄을 넘으면 데스크톱은 다음 줄로 넘긴다.
     center + overflow 조합은 넘친 왼쪽 탭이 잘려 스크롤로도 닿지 않았다(2026-10 DB 탭 추가 때 All이 사라짐). */
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: ${contentMaxWidth} + 40px;
  margin-bottom: 12px;
  column-gap: 24px;
  overflow-y: hidden;
  @media ${MOBILE_MEDIA_QUERY} {
    /* 모바일은 기존처럼 한 줄 가로 스크롤 */
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: scroll;
  }
  padding: 0 15px;
`;

export const Tab = styled.div<{ isSelected: 'true' | 'false' }>`
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
