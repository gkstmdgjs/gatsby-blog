export default {
  title: `seunghoney`,
  siteUrl: `https://honey.com/`,
  siteImage: `/profile.png`,
  language: `ko`,
  comments: {
    utterances: {
      repo: `gkstmdgjs/gatsby-blog-utterances`,
    },
  },
  author: {
    name: `한승헌`,
    nickname: `Honey`,
    profileImage: `profile.png`,
    job: `Full Stack Developer`,
    email: `sh725473@gmail.com`,
    github: `https://github.com/gkstmdgjs`,
  },

  /**
   *  definition of emoji posts
   */
  featured: [
    {
      title: 'Make',
      category: 'featured-Make',
    },
  ],

  /**
   *  About Page
   */
  timestamps: [
    {
      category: 'Career',
      date: '2021.11.21 - NOW',
      en: 'HS Solutions',
      kr: 'HS 솔루션',
      info: 'Full Stack Developer',
    },
    {
      category: 'Career',
      date: '2023.05.15 - 2024.02.12',
      en: 'Casting',
      kr: '캐스팅 (외주)',
      info: 'App Developer',
    },
  ],

  /**
   *  portfolio Page
   */
  portfolio: {
    projects: [
      {
        title: 'Cat Run',
        description: '고양이 달리기 게임',
        techStack: ['Typescript', 'Spring Boot', 'MySQL'],
        thumbnailUrl: 'cat-run-logo.png',
        links: {
          github: 'https://github.com/gkstmdgjs/cat-run-front',
          demo: 'https://cat-run.seunghoney.com/',
          googlePlay: '',
          appStore: '',
        },
      }
    ],
  },
};
