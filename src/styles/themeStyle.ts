import { css, Theme } from '@emotion/react';

export const contentMaxWidth = '750px';

export const MOBILE_MEDIA_QUERY = `screen and (max-width: 768px)`;

export const lightTheme: Theme = {
  color: {
    black100: '#0F1010',
    black60: '#2C2D2E',
    black40: '#3C3D40',
    gray80: '#808388',
    gray60: '#989BA0',
    gray40: '#C0C5C9',
    gray20: '#EEEFF1',
    gray10: '#F7F8FA',
    white100: '#FFFFFF',

    codeBg: '#F6F8FA',
    codeBorder: '#D0D7DE',
    codeInlineBg: '#EFF1F3',
    codeInlineText: '#D7263D',

    tableBorder: '#D0D7DE',
    tableEvenRowBg: '#F6F8FA',
    tableHoverBg: '#EFF1F3',

    blockquoteBorder: '#D0D7DE',
    blockquoteText: '#57606A',

    hrColor: '#D8DEE4',
    anchorColor: '#57606A',

    kbdBg: '#F6F8FA',
    kbdBorder: '#D0D7DE',
    kbdText: '#24292F',

    syntaxComment: '#6E7781',
    syntaxKeyword: '#CF222E',
    syntaxString: '#0A3069',
    syntaxNumber: '#0550AE',
    syntaxFunction: '#8250DF',
    syntaxVariable: '#953800',
    syntaxConstant: '#0550AE',
    syntaxTag: '#116329',
    syntaxAttrName: '#0550AE',
    syntaxPunctuation: '#24292F',
    syntaxOperator: '#CF222E',
    syntaxSelection: '#FFEA7F',
    syntaxHighlightLineBg: '#FFF8C5',
  },
};
export const darkTheme: Theme = {
  color: {
    black100: '#e6e6e6',
    black60: '#F7F8FA',
    black40: '#EEEFF1',
    gray80: '#b9bbc5',
    gray60: '#8e8f97',
    gray40: '#626368',
    gray20: '#3C3D40',
    gray10: '#2C2D2E',
    white100: '#232326',

    codeBg: '#282C34',
    codeBorder: '#3E4451',
    codeInlineBg: '#2F343C',
    codeInlineText: '#E06C75',

    tableBorder: '#3E4451',
    tableEvenRowBg: '#2C313A',
    tableHoverBg: '#323842',

    blockquoteBorder: '#3E4451',
    blockquoteText: '#9DA5B4',

    hrColor: '#3E4451',
    anchorColor: '#9DA5B4',

    kbdBg: '#282C34',
    kbdBorder: '#3E4451',
    kbdText: '#ABB2BF',

    syntaxComment: '#5C6370',
    syntaxKeyword: '#C678DD',
    syntaxString: '#98C379',
    syntaxNumber: '#D19A66',
    syntaxFunction: '#61AFEF',
    syntaxVariable: '#E06C75',
    syntaxConstant: '#D19A66',
    syntaxTag: '#E06C75',
    syntaxAttrName: '#D19A66',
    syntaxPunctuation: '#ABB2BF',
    syntaxOperator: '#56B6C2',
    syntaxSelection: '#3E4451',
    syntaxHighlightLineBg: '#2C313A',
  },
};

export const hoverUnderline = (theme: Theme) => css`
  display: inline-block;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    transform: scaleX(0);
    width: 100%;
    height: 1px;
    bottom: -1px;
    left: 0;
    background-color: ${theme.color.black100};
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  }

  &:hover:after {
    transform: scaleX(1);
    transform-origin: bottom left;
    @media ${MOBILE_MEDIA_QUERY} {
      transform: scaleX(0);
    }
  }
`;
