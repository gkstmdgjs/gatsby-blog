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
      title: 'Skill',
      category: 'featured-기술',
    },
    {
      title: 'React',
      category: 'featured-React',
    },
    {
      title: 'Spring',
      category: 'featured-Spring',
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
        title: 'HS Solution',
        description: 'HS 솔루션',
        techStack: ['Vue', 'Node.js', 'MySQL'],
        thumbnailUrl: 'HS-solution.png',
        links: {
          github: 'https://github.com/gkstmdgjs',
          demo: 'https://noligo.co.kr/',
          googlePlay: '',
          appStore: '',
        },
      },
      {
        title: 'Event Noligo',
        description: '이벤트 노리고',
        techStack: ['Flutter', 'Dart', 'MSSQL'],
        thumbnailUrl: 'event-noligo.png',
        links: {
          github: 'https://github.com/gkstmdgjs',
          demo: 'https://noligo.co.kr/EvnetNoligo',
          googlePlay: '',
          appStore: '',
        },
      },
    ],
  },
};
