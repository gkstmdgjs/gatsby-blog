import React from 'react';

import * as S from './styled';

const Footer: React.FC = () => {
  return (
    <S.Wrapper>
      <S.Footer>
        © {new Date().getFullYear()} Powered by <S.Link href='https://github.com/gkstmdgjs'>honey</S.Link>
      </S.Footer>
    </S.Wrapper>
  );
};

export default Footer;
