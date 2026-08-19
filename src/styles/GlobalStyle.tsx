import { css, Global, Theme } from '@emotion/react';
import React from 'react';

import { MOBILE_MEDIA_QUERY } from './themeStyle';

const style = (theme: Theme) => css`
  :root {
    --text-strong: ${theme.color.black100};

    --code-bg: ${theme.color.codeBg};
    --code-border: ${theme.color.codeBorder};
    --code-inline-bg: ${theme.color.codeInlineBg};
    --code-inline-text: ${theme.color.codeInlineText};

    --table-border: ${theme.color.tableBorder};
    --table-even-row-bg: ${theme.color.tableEvenRowBg};
    --table-hover-bg: ${theme.color.tableHoverBg};

    --blockquote-border: ${theme.color.blockquoteBorder};
    --blockquote-text: ${theme.color.blockquoteText};

    --hr-color: ${theme.color.hrColor};
    --anchor-color: ${theme.color.anchorColor};

    --kbd-bg: ${theme.color.kbdBg};
    --kbd-border: ${theme.color.kbdBorder};
    --kbd-text: ${theme.color.kbdText};

    --syntax-comment: ${theme.color.syntaxComment};
    --syntax-keyword: ${theme.color.syntaxKeyword};
    --syntax-string: ${theme.color.syntaxString};
    --syntax-number: ${theme.color.syntaxNumber};
    --syntax-function: ${theme.color.syntaxFunction};
    --syntax-variable: ${theme.color.syntaxVariable};
    --syntax-constant: ${theme.color.syntaxConstant};
    --syntax-tag: ${theme.color.syntaxTag};
    --syntax-attr-name: ${theme.color.syntaxAttrName};
    --syntax-punctuation: ${theme.color.syntaxPunctuation};
    --syntax-operator: ${theme.color.syntaxOperator};
    --syntax-selection: ${theme.color.syntaxSelection};
    --syntax-highlight-line-bg: ${theme.color.syntaxHighlightLineBg};
  }

  * {
    box-sizing: border-box;
    appearance: none;
  }

  /* 다크/라이트 모드 색상 전환 */
  *,
  *::before,
  *::after {
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      border-color 0.3s ease,
      fill 0.3s ease,
      stroke 0.3s ease;
  }

  html {
    font-family: 'GmarketSansMedium';
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    font-size: 14px;
    color: ${theme.color.black100};
    background-color: ${theme.color.gray10};

    a {
      color: ${theme.color.black100};
      text-decoration: none;
    }
  }

  body {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  ::-webkit-scrollbar {
    display: none;
  }

  .pc-only {
    display: block;
    @media ${MOBILE_MEDIA_QUERY} {
      display: none;
    }
  }

  .markdown {
    font-family: 'Noto Sans KR', sans-serif;
  }

  .scroll-locked {
    overflow: hidden;
  }
`;

const GlobalStyle: React.FC = () => <Global styles={style} />;

export default GlobalStyle;
