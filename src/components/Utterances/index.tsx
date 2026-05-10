import { ThemeManagerContext } from 'gatsby-emotion-dark-mode';
import React, { useContext, useEffect, useRef } from 'react';

import * as S from './styled';

const SRC = 'https://utteranc.es/client.js';
const BRANCH = 'main';

type UtterancesProps = {
  repo: string;
  path: string;
};

const Utterances: React.FC<UtterancesProps> = ({ repo, path }) => {
  const rootElm = useRef<HTMLDivElement>(null);
  const theme = useContext(ThemeManagerContext);

  useEffect(() => {
    const node = rootElm.current;
    if (!node) return;

    // Utterances client.js 는 자기 자신(<script>) 옆에 iframe 을 주입한다.
    // 재실행 시 정리 없이 새 script 만 append 하면 이전 script 가 부모를 잃어 insertAdjacentHTML 에서 "no parent" 에러가 난다.
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }

    const script = document.createElement('script');
    script.src = SRC;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('repo', repo);
    script.setAttribute('branch', BRANCH);
    script.setAttribute('theme', theme.isDark ? 'photon-dark' : 'github-light');
    script.setAttribute('label', 'comment');
    script.setAttribute('issue-term', 'pathname');

    node.appendChild(script);
  }, [repo, path, theme.isDark]);

  return <S.Wrapper className='utterances' ref={rootElm} />;
};

export default Utterances;
