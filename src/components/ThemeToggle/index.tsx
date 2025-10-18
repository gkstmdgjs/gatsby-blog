import { ThemeManagerContext } from 'gatsby-emotion-dark-mode';
import { useContext } from 'react';
import { BsMoonFill } from 'react-icons/bs';
import { MdWbSunny } from 'react-icons/md';

import * as S from './styled';

const ThemeToggle: React.FC = () => {
  const theme = useContext(ThemeManagerContext);

  return (
    <S.Wrapper onClick={() => theme.toggleDark()} isDark={theme.isDark}>
      {theme.isDark ? <MdWbSunny className='theme-icon' /> : <BsMoonFill className='theme-icon' />}
    </S.Wrapper>
  );
};

export default ThemeToggle;
