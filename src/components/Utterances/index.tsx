import { ThemeManagerContext } from 'gatsby-emotion-dark-mode';
import React, { useContext, useEffect, useRef } from 'react';

import * as S from './styled';

const SRC = 'https://utteranc.es/client.js';
const ORIGIN = 'https://utteranc.es';
const BRANCH = 'main';

type UtterancesProps = {
  repo: string;
  path: string;
};

const getUtterancesTheme = (isDark: boolean) => (isDark ? 'photon-dark' : 'github-light');

const Utterances: React.FC<UtterancesProps> = ({ repo, path }) => {
  const rootElm = useRef<HTMLDivElement>(null);
  const theme = useContext(ThemeManagerContext);
  const initialThemeRef = useRef(theme.isDark);

  // script 마운트
  useEffect(() => {
    const node = rootElm.current;
    if (!node) return;

    const script = document.createElement('script');
    script.src = SRC;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('repo', repo);
    script.setAttribute('branch', BRANCH);
    script.setAttribute('theme', getUtterancesTheme(initialThemeRef.current));
    script.setAttribute('label', 'comment');
    script.setAttribute('issue-term', 'pathname');

    node.appendChild(script);

    return () => {
      while (node.firstChild) node.removeChild(node.firstChild);
    };
  }, [repo, path]);

  // 테마 변경 시 iframe 에 postMessage
  useEffect(() => {
    const node = rootElm.current;
    if (!node) return;

    const sendTheme = () => {
      const iframe = node.querySelector<HTMLIFrameElement>('iframe.utterances-frame');
      iframe?.contentWindow?.postMessage(
        { type: 'set-theme', theme: getUtterancesTheme(theme.isDark) },
        ORIGIN,
      );
    };

    if (node.querySelector('iframe.utterances-frame')) {
      sendTheme();
      return;
    }

    // iframe 준비 후 postMessage
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== ORIGIN) return;
      sendTheme();
      window.removeEventListener('message', onMessage);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [theme.isDark]);

  return <S.Wrapper className='utterances' ref={rootElm} />;
};

export default Utterances;
