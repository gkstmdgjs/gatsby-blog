import React from 'react';

import ThemeToggle from '../ThemeToggle';
import * as S from './styled';

type HeaderProps = {
  location: Location;
};

const Header: React.FC<HeaderProps> = ({ location }) => {
  const { pathname } = location;

  return (
    <S.Wrapper>
      <S.Header>
        <div className='logo'>
          <S.MenuLink to='/' isselected='false'>
            H
          </S.MenuLink>
        </div>
        <S.Menu>
          <S.MenuLink to='/posts' isselected={pathname.includes('/posts').toString()}>
            posts
          </S.MenuLink>
          <S.MenuLink to='/about' isselected={(pathname === '/about').toString()}>
            about
          </S.MenuLink>
          <S.MenuLink to='/portfolio' isselected={(pathname === '/portfolio').toString()}>
            portfolio
          </S.MenuLink>
          <ThemeToggle />
        </S.Menu>
      </S.Header>
    </S.Wrapper>
  );
};

export default Header;
