import { IoIosMail, IoLogoGithub } from 'react-icons/io';

import Image from '@/src/components/Image';
import { Author } from '@/src/type';

import * as S from './styled';

type ProfileProps = {
  author: Author;
};

const Profile: React.FC<ProfileProps> = ({ author }) => {
  return (
    <S.Wrapper>
      <S.IntroWrapper>
        <S.Image>
          <Image alt='profile' src={author.profileImage} />
        </S.Image>
        <S.Flex>
          <div>
            <S.Job>{author.job}</S.Job>
            <S.Name>{author.name}</S.Name>
          </div>
          <S.Icons>
            <S.Link href={author.github} target='_blank'>
              <IoLogoGithub />
            </S.Link>
            <S.Link href={`mailto:${author.email}`}>
              <IoIosMail />
            </S.Link>
          </S.Icons>
        </S.Flex>
      </S.IntroWrapper>
    </S.Wrapper>
  );
};

export default Profile;
