import PostClass from '@/src/models/post';

import EmojiPostCard from '../EmojiPostCard';
import * as S from './styled';

type EmojiPostColumnProps = {
  title: string;
  posts: PostClass[];
  fill?: boolean;
};

const EmojiPostColumn: React.FC<EmojiPostColumnProps> = ({ title, posts, fill = true }) => {
  return (
    <S.Wrapper>
      <S.Title fill={fill ? 'true' : 'false'}>{title}</S.Title>
      {posts.map((post, index) => (
        <EmojiPostCard key={index} post={post} />
      ))}
    </S.Wrapper>
  );
};

export default EmojiPostColumn;
