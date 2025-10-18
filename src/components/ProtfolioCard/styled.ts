import styled from '@emotion/styled';

import { hoverUnderline, MOBILE_MEDIA_QUERY } from '@/src/styles/themeStyle';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.color.gray10};
  width: 381px;
  height: 317px;

  @media ${MOBILE_MEDIA_QUERY} {
    border-radius: 20px;
    width: 300px;
    height: 250px;
  }

  @media screen and (max-width: 310px) {
    border-radius: 15px;
    width: 270px;
    height: 210px;
  }
`;

export const Image = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: center;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  border-radius: 24px 24px 0 0;
  width: 100%;
  height: 216px;

  @media ${MOBILE_MEDIA_QUERY} {
    height: 188.74px;
  }
`;

export const Title = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;
`;

export const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;

  @media ${MOBILE_MEDIA_QUERY} {
    padding: 20px 17px 15px 12px;
  }
`;

export const Description = styled.div`
  margin-top: 5px;
`;

export const ProjectLinkList = styled.div`
  display: flex;
  margin-left: auto;
  gap: 10px;
  margin-top: 5px;
`;

export const ProjectLink = styled.a`
  font-size: 12px;
  ${({ theme }) => hoverUnderline(theme)};
`;

export const TechList = styled.div`
  display: flex;
  gap: 5px;
`;

export const Tech = styled.div<{ tech: string }>`
  display: flex;
  align-items: center;
  font-size: 10px;
  padding: 3.5px 5px;
  border-radius: 5px;
  margin-top: -10px;
  color: ${({ theme }) => theme.color.white100};
  background-color: ${({ theme, tech }) => {
    switch (tech) {
      case 'Javascript':
        return '#f0db4f';
      case 'Typescript':
        return '#2f74c0';
      case 'React':
        return '#53d4f7';
      case 'Vue':
        return '#42b883';
      case 'Flutter':
        return '#02569B';
      case 'Dart':
        return '#0175C2';
      case 'Node.js':
        return '#339933';
      case 'Spring Boot':
        return '#6DB33F';
      case 'Laravel':
        return '#FF2D20';
      case 'MySQL':
        return '#4479A1';
      case 'MSSQL':
        return '#CC2927';
      default:
        return theme.color.black40;
    }
  }};
`;
