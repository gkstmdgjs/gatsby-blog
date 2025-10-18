import React from 'react';

import Image from '@/src/components/Image';

import * as S from './styled';

const NotFound: React.FC = () => {
  return (
    <S.Wrapper>
      <S.Content>
        <S.H1>404!</S.H1>
        <S.H4>요청하신 페이지를 찾을 수 없어요</S.H4>
        <S.Reason>
          요청하신 주소의 페이지는 변경 혹은 삭제되어 요청된 페이지를 찾을 수 없습니다.
        </S.Reason>
        <S.Button to='/'>뒤로가기</S.Button>
      </S.Content>
      <S.Image>
        <Image alt='not-found' src='not-found.png' />
      </S.Image>
    </S.Wrapper>
  );
};

export default NotFound;
