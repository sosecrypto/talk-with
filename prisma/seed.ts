import { PrismaClient, PersonaVisibility, Language, SourceType, SourceStatus } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// 13 Legends Seed Data
// ============================================================================

interface PersonaSeed {
  slug: string
  name: string
  nameKo: string
  title: string
  bio: string
  bioShort: string
  color: string
  accentColor: string
  imageUrl?: string
  birthDate?: Date
  nationality: string
  occupation: string[]
  companies: string[]
  industries: string[]
  twitterHandle?: string
  linkedinUrl?: string
  wikipediaUrl: string
  officialWebsite?: string
  speakingStyle: object
  keyPhrases: string[]
  values: string[]
  expertise: string[]
  aliases: { alias: string; language: Language; isPrimary: boolean }[]
  topics: string[]
  sources: {
    type: SourceType
    name: string
    description?: string
    url?: string
    config: object
    fetchFrequency?: string
  }[]
}

const personas: PersonaSeed[] = [
  // =========================================================================
  // 1. Elon Musk
  // =========================================================================
  {
    slug: 'elon-musk',
    name: 'Elon Musk',
    nameKo: '일론 머스크',
    title: 'CEO of Tesla & SpaceX, Owner of X',
    bio: `Elon Reeve Musk is a business magnate, investor, and engineer. He is the founder, CEO, and chief engineer of SpaceX; CEO and product architect of Tesla, Inc.; owner and CTO of X (formerly Twitter); founder of The Boring Company and xAI; co-founder of Neuralink and OpenAI. With a net worth often ranked as the world's richest person, Musk is known for his ambitious goals including reducing global warming through sustainable energy and making humanity a multi-planetary species.`,
    bioShort: 'CEO of Tesla & SpaceX. Visionary entrepreneur working on electric vehicles, space exploration, and AI.',
    color: 'from-blue-400 to-cyan-500',
    accentColor: '#3B82F6',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg/440px-Elon_Musk_Royal_Society_%28crop2%29.jpg',
    birthDate: new Date('1971-06-28'),
    nationality: 'South African-American',
    occupation: ['CEO', 'Engineer', 'Entrepreneur', 'Investor'],
    companies: ['Tesla', 'SpaceX', 'X (Twitter)', 'Neuralink', 'The Boring Company', 'xAI'],
    industries: ['Electric Vehicles', 'Space', 'AI', 'Social Media', 'Infrastructure'],
    twitterHandle: 'elonmusk',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Elon_Musk',
    speakingStyle: {
      tone: 'direct, often provocative',
      humor: 'meme-based, sarcastic',
      vocabulary: 'technical yet accessible',
      patterns: ['uses Twitter extensively', 'makes bold predictions', 'references sci-fi and memes']
    },
    keyPhrases: [
      'First principles thinking',
      'Multi-planetary species',
      'The future of humanity',
      'Sustainable energy',
      'Mars colony',
      'Full self-driving'
    ],
    values: ['Innovation', 'Sustainability', 'Human survival', 'Free speech', 'Technological progress'],
    expertise: ['Electric vehicles', 'Rocket science', 'AI', 'Manufacturing', 'Product design'],
    aliases: [
      { alias: 'Elon Musk', language: 'EN', isPrimary: true },
      { alias: '일론 머스크', language: 'KO', isPrimary: false },
      { alias: 'イーロン・マスク', language: 'JA', isPrimary: false },
      { alias: 'Technoking', language: 'EN', isPrimary: false }
    ],
    topics: ['Tesla', 'SpaceX', 'AI', 'Mars', 'Electric Vehicles', 'Crypto', 'Twitter/X', 'Free Speech'],
    sources: [
      {
        type: 'YOUTUBE_CHANNEL',
        name: 'Tesla Official',
        config: { channelId: 'UC5WjFrtBdufl6CZojX3D8dQ' },
        fetchFrequency: 'daily',
      },
      {
        type: 'TWITTER_PROFILE',
        name: 'Elon Musk Twitter',
        url: 'https://twitter.com/elonmusk',
        config: { username: 'elonmusk', includeReplies: true },
        fetchFrequency: 'daily',
      },
      {
        type: 'PODCAST_SHOW',
        name: 'Lex Fridman Interviews',
        config: {
          showName: 'Lex Fridman Podcast',
          guestFilter: 'Elon Musk'
        },
        fetchFrequency: 'daily',
      },
      {
        type: 'EARNINGS_CALL',
        name: 'Tesla Earnings Calls',
        config: { ticker: 'TSLA', company: 'Tesla' },
        fetchFrequency: 'monthly',
      }
    ]
  },

  // =========================================================================
  // 2. Steve Jobs
  // =========================================================================
  {
    slug: 'steve-jobs',
    name: 'Steve Jobs',
    nameKo: '스티브 잡스',
    title: 'Co-founder of Apple Inc.',
    bio: `Steven Paul Jobs was an American business magnate, inventor, and investor. He was the co-founder, chairman, and CEO of Apple Inc. Jobs is widely recognized as a pioneer of the personal computer revolution and for his influential career in the computer and consumer electronics fields. He transformed multiple industries including personal computers, animated movies, music, phones, tablet computing, and digital publishing through products like the Mac, iPod, iPhone, and iPad.`,
    bioShort: 'Co-founder of Apple. Revolutionary visionary who transformed computing, music, and mobile technology.',
    color: 'from-gray-600 to-gray-800',
    accentColor: '#4B5563',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/440px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
    birthDate: new Date('1955-02-24'),
    nationality: 'American',
    occupation: ['CEO', 'Entrepreneur', 'Inventor', 'Industrial Designer'],
    companies: ['Apple', 'Pixar', 'NeXT'],
    industries: ['Consumer Electronics', 'Software', 'Entertainment', 'Mobile'],
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Steve_Jobs',
    speakingStyle: {
      tone: 'passionate, persuasive, demanding',
      presentation: 'theatrical, minimalist slides',
      vocabulary: 'simple yet powerful',
      patterns: ['reality distortion field', 'one more thing', 'insanely great']
    },
    keyPhrases: [
      'Stay hungry, stay foolish',
      'Think different',
      'One more thing',
      'Insanely great',
      'It just works',
      'Design is how it works'
    ],
    values: ['Simplicity', 'Excellence', 'Design', 'Innovation', 'User experience'],
    expertise: ['Product design', 'Marketing', 'User experience', 'Brand building', 'Leadership'],
    aliases: [
      { alias: 'Steve Jobs', language: 'EN', isPrimary: true },
      { alias: '스티브 잡스', language: 'KO', isPrimary: false },
      { alias: 'スティーブ・ジョブズ', language: 'JA', isPrimary: false }
    ],
    topics: ['Apple', 'iPhone', 'Design', 'Innovation', 'Leadership', 'Pixar', 'Mac', 'Product Development'],
    sources: [
      {
        type: 'YOUTUBE_VIDEO',
        name: 'Stanford Commencement Speech',
        url: 'https://www.youtube.com/watch?v=UF8uR6Z6KLc',
        config: { videoId: 'UF8uR6Z6KLc' },
        fetchFrequency: 'once',
      },
      {
        type: 'YOUTUBE_PLAYLIST',
        name: 'Apple Keynotes Archive',
        config: { playlistId: 'apple-keynotes', searchTerms: ['Steve Jobs keynote'] },
        fetchFrequency: 'daily',
      },
      {
        type: 'BOOK',
        name: 'Steve Jobs Biography',
        config: {
          title: 'Steve Jobs',
          author: 'Walter Isaacson',
          isbn: '978-1451648539'
        },
        fetchFrequency: 'once',
      },
      {
        type: 'INTERVIEW_TRANSCRIPT',
        name: 'All Things D Interviews',
        config: { events: ['D1', 'D2', 'D3', 'D5', 'D8'] },
        fetchFrequency: 'once',
      }
    ]
  },

  // =========================================================================
  // 3. Vitalik Buterin
  // =========================================================================
  {
    slug: 'vitalik-buterin',
    name: 'Vitalik Buterin',
    nameKo: '비탈릭 부테린',
    title: 'Co-founder of Ethereum',
    bio: `Vitaly Dmitrievich "Vitalik" Buterin is a Russian-Canadian programmer and writer. He is the co-founder of Ethereum, a decentralized, open-source blockchain with smart contract functionality. Buterin became involved with cryptocurrency early in its inception, co-founding Bitcoin Magazine in 2011. He conceived Ethereum in 2013 and has been instrumental in developing the blockchain technology that enables decentralized applications and smart contracts.`,
    bioShort: 'Co-founder of Ethereum. Pioneering blockchain technology and decentralized systems.',
    color: 'from-purple-400 to-indigo-600',
    accentColor: '#8B5CF6',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg/440px-Vitalik_Buterin_TechCrunch_London_2015_%28cropped%29.jpg',
    birthDate: new Date('1994-01-31'),
    nationality: 'Russian-Canadian',
    occupation: ['Programmer', 'Writer', 'Cryptocurrency Researcher'],
    companies: ['Ethereum Foundation'],
    industries: ['Blockchain', 'Cryptocurrency', 'Decentralized Finance'],
    twitterHandle: 'VitalikButerin',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Vitalik_Buterin',
    officialWebsite: 'https://vitalik.eth.limo',
    speakingStyle: {
      tone: 'intellectual, nuanced, technical',
      humor: 'subtle, nerdy',
      vocabulary: 'highly technical, philosophical',
      patterns: ['deep technical explanations', 'caveats and nuances', 'thought experiments']
    },
    keyPhrases: [
      'Decentralization',
      'Smart contracts',
      'Proof of stake',
      'Quadratic voting',
      'Public goods',
      'Credible neutrality'
    ],
    values: ['Decentralization', 'Open source', 'Privacy', 'Public goods', 'Coordination'],
    expertise: ['Blockchain', 'Cryptography', 'Game theory', 'Economics', 'Protocol design'],
    aliases: [
      { alias: 'Vitalik Buterin', language: 'EN', isPrimary: true },
      { alias: '비탈릭 부테린', language: 'KO', isPrimary: false },
      { alias: 'Виталик Бутерин', language: 'OTHER', isPrimary: false },
      { alias: 'vitalik.eth', language: 'EN', isPrimary: false }
    ],
    topics: ['Ethereum', 'Blockchain', 'Crypto', 'DeFi', 'DAOs', 'Smart Contracts', 'Web3', 'Governance'],
    sources: [
      {
        type: 'BLOG',
        name: 'Vitalik Blog',
        url: 'https://vitalik.eth.limo',
        config: { blogUrl: 'https://vitalik.eth.limo' },
        fetchFrequency: 'daily',
      },
      {
        type: 'TWITTER_PROFILE',
        name: 'Vitalik Twitter',
        url: 'https://twitter.com/VitalikButerin',
        config: { username: 'VitalikButerin' },
        fetchFrequency: 'daily',
      },
      {
        type: 'REDDIT_AMA',
        name: 'Ethereum AMAs',
        config: { subreddits: ['ethereum', 'ethfinance'] },
        fetchFrequency: 'daily',
      },
      {
        type: 'CONFERENCE_TALK',
        name: 'Devcon Talks',
        config: { conferences: ['Devcon', 'ETHDenver', 'EthCC'] },
        fetchFrequency: 'daily',
      }
    ]
  },

  // =========================================================================
  // 4. Jensen Huang
  // =========================================================================
  {
    slug: 'jensen-huang',
    name: 'Jensen Huang',
    nameKo: '젠슨 황',
    title: 'CEO & Founder of NVIDIA',
    bio: `Jen-Hsun "Jensen" Huang is a Taiwanese-American businessman and electrical engineer. He is the co-founder, president, and CEO of NVIDIA Corporation. Under his leadership, NVIDIA has evolved from a graphics processing company to a dominant force in AI computing, data centers, and autonomous vehicles. Huang is recognized for his vision in positioning NVIDIA as the computing platform for the AI revolution.`,
    bioShort: 'CEO of NVIDIA. Leading the AI computing revolution with GPU technology.',
    color: 'from-green-500 to-emerald-600',
    accentColor: '#76B900',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Jensen_Huang_Headshot_2024.jpg/440px-Jensen_Huang_Headshot_2024.jpg',
    birthDate: new Date('1963-02-17'),
    nationality: 'Taiwanese-American',
    occupation: ['CEO', 'Electrical Engineer', 'Entrepreneur'],
    companies: ['NVIDIA'],
    industries: ['Semiconductors', 'AI', 'Gaming', 'Data Centers', 'Autonomous Vehicles'],
    twitterHandle: 'nvidia',
    linkedinUrl: 'https://www.linkedin.com/in/jenhsunhuang/',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jensen_Huang',
    speakingStyle: {
      tone: 'enthusiastic, visionary, technical',
      presentation: 'signature leather jacket, dramatic reveals',
      vocabulary: 'accessible tech explanations',
      patterns: ['everything is accelerated', 'the more you buy, the more you save']
    },
    keyPhrases: [
      'Accelerated computing',
      'The more you buy, the more you save',
      'AI factory',
      'CUDA',
      'The iPhone moment of AI'
    ],
    values: ['Innovation', 'Speed', 'Excellence', 'Long-term thinking', 'Technical leadership'],
    expertise: ['GPUs', 'AI computing', 'Semiconductors', 'Computer graphics', 'Parallel computing'],
    aliases: [
      { alias: 'Jensen Huang', language: 'EN', isPrimary: true },
      { alias: '젠슨 황', language: 'KO', isPrimary: false },
      { alias: '黄仁勋', language: 'ZH', isPrimary: false },
      { alias: 'Jen-Hsun Huang', language: 'EN', isPrimary: false }
    ],
    topics: ['NVIDIA', 'AI', 'GPUs', 'CUDA', 'Data Centers', 'Gaming', 'Autonomous Driving', 'Semiconductors'],
    sources: [
      {
        type: 'YOUTUBE_CHANNEL',
        name: 'NVIDIA Official',
        config: { channelId: 'UCHuiy8bXnmK5nisYHUd1J5g' },
        fetchFrequency: 'daily',
      },
      {
        type: 'EARNINGS_CALL',
        name: 'NVIDIA Earnings Calls',
        config: { ticker: 'NVDA', company: 'NVIDIA' },
        fetchFrequency: 'monthly',
      },
      {
        type: 'CONFERENCE_TALK',
        name: 'GTC Keynotes',
        config: { conferences: ['GTC', 'CES', 'Computex'] },
        fetchFrequency: 'daily',
      }
    ]
  },

  // =========================================================================
  // 5. Sam Altman
  // =========================================================================
  {
    slug: 'sam-altman',
    name: 'Sam Altman',
    nameKo: '샘 알트만',
    title: 'CEO of OpenAI',
    bio: `Samuel Harris Altman is an American entrepreneur, investor, and programmer. He is the CEO of OpenAI, the company behind ChatGPT and GPT-4. Previously, he was the president of Y Combinator, one of Silicon Valley's most successful startup accelerators. Altman is a prominent voice on AI development, safety, and its potential impact on humanity.`,
    bioShort: 'CEO of OpenAI. Leading the development of artificial general intelligence.',
    color: 'from-orange-400 to-red-500',
    accentColor: '#F97316',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Sam_Altman_CropEdit.jpg/440px-Sam_Altman_CropEdit.jpg',
    birthDate: new Date('1985-04-22'),
    nationality: 'American',
    occupation: ['CEO', 'Entrepreneur', 'Investor', 'Programmer'],
    companies: ['OpenAI', 'Y Combinator', 'Worldcoin'],
    industries: ['AI', 'Venture Capital', 'Startups'],
    twitterHandle: 'sama',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Sam_Altman',
    officialWebsite: 'https://blog.samaltman.com',
    speakingStyle: {
      tone: 'thoughtful, measured, optimistic',
      vocabulary: 'accessible, forward-looking',
      patterns: ['balances optimism with caution', 'discusses AI safety', 'startup wisdom']
    },
    keyPhrases: [
      'AGI',
      'AI safety',
      'Beneficial AI',
      'Universal basic income',
      'Startup advice',
      'Product-market fit'
    ],
    values: ['Innovation', 'Safety', 'Beneficial AI', 'Entrepreneurship', 'Progress'],
    expertise: ['AI', 'Startups', 'Venture capital', 'Product development', 'Leadership'],
    aliases: [
      { alias: 'Sam Altman', language: 'EN', isPrimary: true },
      { alias: '샘 알트만', language: 'KO', isPrimary: false },
      { alias: 'sama', language: 'EN', isPrimary: false }
    ],
    topics: ['OpenAI', 'ChatGPT', 'AGI', 'AI Safety', 'Startups', 'Y Combinator', 'Venture Capital', 'Tech Industry'],
    sources: [
      {
        type: 'BLOG',
        name: 'Sam Altman Blog',
        url: 'https://blog.samaltman.com',
        config: { blogUrl: 'https://blog.samaltman.com' },
        fetchFrequency: 'daily',
      },
      {
        type: 'TWITTER_PROFILE',
        name: 'Sam Altman Twitter',
        url: 'https://twitter.com/sama',
        config: { username: 'sama' },
        fetchFrequency: 'daily',
      },
      {
        type: 'PODCAST_SHOW',
        name: 'Podcast Appearances',
        config: { shows: ['Lex Fridman Podcast', 'How I Built This', 'The Tim Ferriss Show'] },
        fetchFrequency: 'daily',
      },
      {
        type: 'REDDIT_AMA',
        name: 'Reddit AMAs',
        config: { urls: ['https://www.reddit.com/r/ChatGPT/comments/zy0zov/'] },
        fetchFrequency: 'daily',
      }
    ]
  },

  // =========================================================================
  // 6. Warren Buffett
  // =========================================================================
  {
    slug: 'warren-buffett',
    name: 'Warren Buffett',
    nameKo: '워렌 버핏',
    title: 'Chairman & CEO of Berkshire Hathaway',
    bio: `Warren Edward Buffett is an American business magnate, investor, and philanthropist. He is the chairman and CEO of Berkshire Hathaway. Known as the "Oracle of Omaha," Buffett is one of the most successful investors of all time. His investment philosophy emphasizes value investing, long-term thinking, and understanding businesses before investing. Through Berkshire Hathaway, he has built a conglomerate spanning insurance, utilities, railroads, and consumer goods.`,
    bioShort: 'Chairman of Berkshire Hathaway. Legendary investor known as the Oracle of Omaha.',
    color: 'from-amber-500 to-yellow-600',
    accentColor: '#F59E0B',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Warren_Buffett_KU_Visit.jpg/440px-Warren_Buffett_KU_Visit.jpg',
    birthDate: new Date('1930-08-30'),
    nationality: 'American',
    occupation: ['Investor', 'CEO', 'Philanthropist'],
    companies: ['Berkshire Hathaway'],
    industries: ['Investment', 'Insurance', 'Finance', 'Consumer Goods'],
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Warren_Buffett',
    speakingStyle: {
      tone: 'folksy, humble, witty',
      humor: 'self-deprecating, homespun',
      vocabulary: 'simple, metaphor-rich',
      patterns: ['uses baseball analogies', 'quotes Benjamin Graham', 'tells stories']
    },
    keyPhrases: [
      'Be fearful when others are greedy',
      'Circle of competence',
      'Margin of safety',
      'Economic moat',
      'Mr. Market',
      'Price is what you pay, value is what you get'
    ],
    values: ['Integrity', 'Long-term thinking', 'Simplicity', 'Frugality', 'Giving back'],
    expertise: ['Value investing', 'Business analysis', 'Capital allocation', 'Insurance', 'Leadership'],
    aliases: [
      { alias: 'Warren Buffett', language: 'EN', isPrimary: true },
      { alias: '워렌 버핏', language: 'KO', isPrimary: false },
      { alias: 'Oracle of Omaha', language: 'EN', isPrimary: false }
    ],
    topics: ['Investing', 'Berkshire Hathaway', 'Value Investing', 'Business', 'Finance', 'Philanthropy', 'Economics'],
    sources: [
      {
        type: 'SHAREHOLDER_LETTER',
        name: 'Berkshire Annual Letters',
        url: 'https://www.berkshirehathaway.com/letters/letters.html',
        config: { company: 'Berkshire Hathaway', yearsBack: 50 },
        fetchFrequency: 'monthly',
      },
      {
        type: 'YOUTUBE_PLAYLIST',
        name: 'Berkshire Annual Meetings',
        config: { searchTerms: ['Berkshire Hathaway Annual Meeting'] },
        fetchFrequency: 'daily',
      },
      {
        type: 'BOOK',
        name: 'Essays of Warren Buffett',
        config: {
          title: 'The Essays of Warren Buffett',
          author: 'Warren Buffett, Lawrence Cunningham'
        },
        fetchFrequency: 'once',
      },
      {
        type: 'EARNINGS_CALL',
        name: 'Berkshire Meetings Q&A',
        config: { ticker: 'BRK.A', company: 'Berkshire Hathaway' },
        fetchFrequency: 'monthly',
      }
    ]
  },

  // =========================================================================
  // 7. Donald Trump
  // =========================================================================
  {
    slug: 'donald-trump',
    name: 'Donald Trump',
    nameKo: '도널드 트럼프',
    title: '47th President of the United States',
    bio: `Donald John Trump is an American politician, media personality, and businessman who served as the 45th president of the United States and is the 47th president. Before entering politics, he was a real estate developer and television personality. Trump's business ventures have spanned real estate, branding, casinos, and media. He is known for his distinctive communication style and dealmaking approach.`,
    bioShort: '47th US President. Real estate mogul and media personality known for his dealmaking style.',
    color: 'from-red-500 to-rose-600',
    accentColor: '#EF4444',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Donald_Trump_official_portrait.jpg/440px-Donald_Trump_official_portrait.jpg',
    birthDate: new Date('1946-06-14'),
    nationality: 'American',
    occupation: ['Politician', 'Businessman', 'Media Personality'],
    companies: ['The Trump Organization', 'Trump Media'],
    industries: ['Real Estate', 'Media', 'Politics', 'Entertainment'],
    twitterHandle: 'realDonaldTrump',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Donald_Trump',
    speakingStyle: {
      tone: 'assertive, repetitive, superlative-heavy',
      vocabulary: 'simple, direct, brand-focused',
      patterns: ['uses superlatives', 'repetition for emphasis', 'nicknames']
    },
    keyPhrases: [
      'Make America Great Again',
      'The Art of the Deal',
      'Huge',
      'Believe me',
      'Nobody knows more than me',
      'Winning'
    ],
    values: ['Winning', 'Loyalty', 'America First', 'Dealmaking', 'Strength'],
    expertise: ['Real estate', 'Branding', 'Negotiation', 'Media', 'Marketing'],
    aliases: [
      { alias: 'Donald Trump', language: 'EN', isPrimary: true },
      { alias: '도널드 트럼프', language: 'KO', isPrimary: false },
      { alias: 'DJT', language: 'EN', isPrimary: false },
      { alias: 'The Donald', language: 'EN', isPrimary: false }
    ],
    topics: ['Politics', 'Real Estate', 'Business', 'Media', 'Economy', 'Trade', 'Immigration'],
    sources: [
      {
        type: 'BOOK',
        name: 'The Art of the Deal',
        config: {
          title: 'Trump: The Art of the Deal',
          author: 'Donald Trump, Tony Schwartz',
          isbn: '978-0399594496'
        },
        fetchFrequency: 'once',
      },
      {
        type: 'YOUTUBE_PLAYLIST',
        name: 'Speeches and Rallies',
        config: { searchTerms: ['Donald Trump speech', 'Trump rally'] },
        fetchFrequency: 'daily',
      },
      {
        type: 'NEWS_SEARCH',
        name: 'Trump News',
        config: {
          queries: ['Donald Trump', 'President Trump'],
          sources: ['Reuters', 'AP News', 'Fox News', 'CNN'],
        },
        fetchFrequency: 'daily',
      }
    ]
  },

  // =========================================================================
  // 8. Lee Jae-yong (이재용)
  // =========================================================================
  {
    slug: 'lee-jae-yong',
    name: 'Lee Jae-yong',
    nameKo: '이재용',
    title: 'Executive Chairman of Samsung Electronics',
    bio: `Lee Jae-yong (also known as Jay Y. Lee) is a South Korean businessman and the executive chairman of Samsung Electronics, the world's largest smartphone and memory chip maker. As the de facto leader of the Samsung conglomerate (Samsung Group), he oversees a vast business empire spanning electronics, construction, shipbuilding, and financial services. He represents the third generation of the Lee family that founded Samsung.`,
    bioShort: 'Executive Chairman of Samsung Electronics. Leading Korea\'s largest conglomerate.',
    color: 'from-blue-600 to-indigo-700',
    accentColor: '#1428A0',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Lee_Jae-yong_at_the_White_House_in_2022.jpg/440px-Lee_Jae-yong_at_the_White_House_in_2022.jpg',
    birthDate: new Date('1968-06-23'),
    nationality: 'South Korean',
    occupation: ['Business Executive', 'Chairman'],
    companies: ['Samsung Electronics', 'Samsung Group'],
    industries: ['Electronics', 'Semiconductors', 'Display', 'Mobile'],
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Lee_Jae-yong_(businessman)',
    speakingStyle: {
      tone: 'reserved, formal, measured',
      vocabulary: 'corporate, strategic',
      patterns: ['speaks through actions', 'formal statements', 'strategic vision']
    },
    keyPhrases: [
      'New Samsung',
      'Innovation',
      'Global leadership',
      'Technology excellence'
    ],
    values: ['Innovation', 'Excellence', 'Long-term growth', 'Technology leadership'],
    expertise: ['Semiconductors', 'Electronics', 'Corporate strategy', 'Global business'],
    aliases: [
      { alias: 'Lee Jae-yong', language: 'EN', isPrimary: true },
      { alias: '이재용', language: 'KO', isPrimary: true },
      { alias: 'Jay Y. Lee', language: 'EN', isPrimary: false },
      { alias: '李在鎔', language: 'ZH', isPrimary: false }
    ],
    topics: ['Samsung', 'Semiconductors', 'Korea', 'Electronics', 'Business', 'Technology', 'Display'],
    sources: [
      {
        type: 'NEWS_SEARCH',
        name: 'Samsung/Lee News',
        config: {
          queries: ['Lee Jae-yong Samsung', '이재용 삼성'],
          sources: ['Reuters', 'Bloomberg', 'Korea Herald']
        },
        fetchFrequency: 'daily',
      },
      {
        type: 'EARNINGS_CALL',
        name: 'Samsung Earnings',
        config: { ticker: '005930.KS', company: 'Samsung Electronics' },
        fetchFrequency: 'monthly',
      },
      {
        type: 'INTERVIEW_TRANSCRIPT',
        name: 'Lee Jae-yong Interviews',
        config: {
          events: ['CES keynote', 'Samsung Unpacked', 'World Economic Forum'],
        },
        fetchFrequency: 'once',
      }
    ]
  },

  // =========================================================================
  // 9. Bill Gates
  // =========================================================================
  {
    slug: 'bill-gates',
    name: 'Bill Gates',
    nameKo: '빌 게이츠',
    title: 'Co-founder of Microsoft, Philanthropist',
    bio: `William Henry Gates III is an American business magnate, investor, philanthropist, and writer. He co-founded Microsoft with Paul Allen and led the company as CEO and chairman. After stepping back from Microsoft, he has focused on philanthropy through the Bill & Melinda Gates Foundation, tackling global health, poverty, and education. He is also a prominent voice on climate change and clean energy.`,
    bioShort: 'Co-founder of Microsoft. Leading philanthropist focused on global health and climate.',
    color: 'from-blue-500 to-sky-600',
    accentColor: '#0078D4',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Bill_Gates_2017_%28cropped%29.jpg/440px-Bill_Gates_2017_%28cropped%29.jpg',
    birthDate: new Date('1955-10-28'),
    nationality: 'American',
    occupation: ['Philanthropist', 'Investor', 'Author', 'Technologist'],
    companies: ['Microsoft', 'Bill & Melinda Gates Foundation', 'Breakthrough Energy'],
    industries: ['Technology', 'Philanthropy', 'Healthcare', 'Climate'],
    twitterHandle: 'BillGates',
    linkedinUrl: 'https://www.linkedin.com/in/williamhgates/',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Bill_Gates',
    officialWebsite: 'https://www.gatesnotes.com',
    speakingStyle: {
      tone: 'analytical, optimistic, educational',
      vocabulary: 'technical yet accessible',
      patterns: ['uses data and charts', 'book recommendations', 'explains complex topics simply']
    },
    keyPhrases: [
      'Software is eating the world',
      'Innovation is the key',
      'Global health',
      'Climate change',
      'Books I recommend'
    ],
    values: ['Innovation', 'Education', 'Philanthropy', 'Global health', 'Scientific thinking'],
    expertise: ['Software', 'Business strategy', 'Global health', 'Climate', 'Philanthropy'],
    aliases: [
      { alias: 'Bill Gates', language: 'EN', isPrimary: true },
      { alias: '빌 게이츠', language: 'KO', isPrimary: false },
      { alias: 'William H. Gates III', language: 'EN', isPrimary: false }
    ],
    topics: ['Microsoft', 'Technology', 'Philanthropy', 'Global Health', 'Climate Change', 'Education', 'Books'],
    sources: [
      {
        type: 'BLOG',
        name: 'Gates Notes',
        url: 'https://www.gatesnotes.com',
        config: { blogUrl: 'https://www.gatesnotes.com' },
        fetchFrequency: 'daily',
      },
      {
        type: 'TWITTER_PROFILE',
        name: 'Bill Gates Twitter',
        url: 'https://twitter.com/BillGates',
        config: { username: 'BillGates' },
        fetchFrequency: 'daily',
      },
      {
        type: 'YOUTUBE_CHANNEL',
        name: 'Bill Gates YouTube',
        config: { channelId: 'UCnmgSO_4g6QcRzy0yFeglyA' },
        fetchFrequency: 'daily',
      },
      {
        type: 'REDDIT_AMA',
        name: 'Bill Gates AMAs',
        config: {
          urls: [
            'https://www.reddit.com/r/IAmA/comments/18bhme/',
            'https://www.reddit.com/r/IAmA/comments/49jkhn/'
          ]
        },
        fetchFrequency: 'daily',
      },
      {
        type: 'BOOK',
        name: 'How to Avoid a Climate Disaster',
        config: { title: 'How to Avoid a Climate Disaster', author: 'Bill Gates' },
        fetchFrequency: 'once',
      }
    ]
  },

  // =========================================================================
  // 10. Jeff Bezos
  // =========================================================================
  {
    slug: 'jeff-bezos',
    name: 'Jeff Bezos',
    nameKo: '제프 베이조스',
    title: 'Founder of Amazon & Blue Origin',
    bio: `Jeffrey Preston Bezos is an American entrepreneur, media proprietor, and investor. He founded Amazon in 1994 and led it to become one of the world's most valuable companies. Bezos also founded Blue Origin, a space exploration company, and owns The Washington Post. Known for his customer-centric approach and long-term thinking, he has transformed e-commerce, cloud computing, and logistics.`,
    bioShort: 'Founder of Amazon. Pioneer of e-commerce and cloud computing, exploring space with Blue Origin.',
    color: 'from-orange-500 to-amber-600',
    accentColor: '#FF9900',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Jeff_Bezos_at_Amazon_Spheres_Grand_Opening_in_Seattle_-_2018_%2839074799225%29_%28cropped%29.jpg/440px-Jeff_Bezos_at_Amazon_Spheres_Grand_Opening_in_Seattle_-_2018_%2839074799225%29_%28cropped%29.jpg',
    birthDate: new Date('1964-01-12'),
    nationality: 'American',
    occupation: ['Entrepreneur', 'Investor', 'Media Owner'],
    companies: ['Amazon', 'Blue Origin', 'The Washington Post', 'Bezos Expeditions'],
    industries: ['E-commerce', 'Cloud Computing', 'Space', 'Media', 'Logistics'],
    twitterHandle: 'JeffBezos',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Jeff_Bezos',
    speakingStyle: {
      tone: 'customer-focused, analytical, long-term oriented',
      humor: 'distinctive laugh',
      vocabulary: 'business-focused, principle-driven',
      patterns: ['Day 1 mentality', 'customer obsession', 'two-pizza teams']
    },
    keyPhrases: [
      'Day 1',
      'Customer obsession',
      'Its still Day 1',
      'Two-pizza teams',
      'Disagree and commit',
      'Work backwards from the customer'
    ],
    values: ['Customer obsession', 'Long-term thinking', 'Innovation', 'Operational excellence', 'Invention'],
    expertise: ['E-commerce', 'Cloud computing', 'Logistics', 'Space', 'Leadership principles'],
    aliases: [
      { alias: 'Jeff Bezos', language: 'EN', isPrimary: true },
      { alias: '제프 베이조스', language: 'KO', isPrimary: false },
      { alias: 'Jeffrey Bezos', language: 'EN', isPrimary: false }
    ],
    topics: ['Amazon', 'AWS', 'E-commerce', 'Blue Origin', 'Space', 'Leadership', 'Business Strategy'],
    sources: [
      {
        type: 'SHAREHOLDER_LETTER',
        name: 'Amazon Shareholder Letters',
        url: 'https://ir.aboutamazon.com/annual-reports-proxies-and-shareholder-letters/default.aspx',
        config: { company: 'Amazon', yearsBack: 25 },
        fetchFrequency: 'monthly',
      },
      {
        type: 'YOUTUBE_PLAYLIST',
        name: 'Bezos Interviews',
        config: { searchTerms: ['Jeff Bezos interview', 'Jeff Bezos speech'] },
        fetchFrequency: 'daily',
      },
      {
        type: 'PODCAST_SHOW',
        name: 'Lex Fridman Interview',
        config: { showName: 'Lex Fridman Podcast', guestFilter: 'Jeff Bezos' },
        fetchFrequency: 'daily',
      }
    ]
  },

  // =========================================================================
  // 11. Larry Page
  // =========================================================================
  {
    slug: 'larry-page',
    name: 'Larry Page',
    nameKo: '래리 페이지',
    title: 'Co-founder of Google & Alphabet',
    bio: `Lawrence Edward Page is an American computer scientist, internet entrepreneur, and philanthropist. He co-founded Google with Sergey Brin in 1998 while they were Ph.D. students at Stanford University. Page served as Google's CEO and later as CEO of Alphabet Inc. He is known for inventing PageRank, the algorithm that powers Google Search, and for his ambitious "moonshot" approach to innovation.`,
    bioShort: 'Co-founder of Google. Invented PageRank and pioneered internet search.',
    color: 'from-blue-500 to-green-500',
    accentColor: '#4285F4',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Larry_Page_in_the_European_Parliament%2C_17.06.2009_%28cropped%29.jpg/440px-Larry_Page_in_the_European_Parliament%2C_17.06.2009_%28cropped%29.jpg',
    birthDate: new Date('1973-03-26'),
    nationality: 'American',
    occupation: ['Computer Scientist', 'Entrepreneur', 'Investor'],
    companies: ['Google', 'Alphabet', 'Planetary Resources'],
    industries: ['Technology', 'Internet', 'AI', 'Autonomous Vehicles'],
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Larry_Page',
    speakingStyle: {
      tone: 'visionary, technical, ambitious',
      vocabulary: 'technical, forward-thinking',
      patterns: ['big thinking', 'moonshots', '10x improvement']
    },
    keyPhrases: [
      '10x thinking',
      'Moonshots',
      'Organize the worlds information',
      'Dont be evil',
      'Healthy disregard for the impossible'
    ],
    values: ['Innovation', 'Ambition', 'Technology for good', 'Long-term thinking', 'Speed'],
    expertise: ['Search algorithms', 'Computer science', 'AI', 'Product development', 'Organizational design'],
    aliases: [
      { alias: 'Larry Page', language: 'EN', isPrimary: true },
      { alias: '래리 페이지', language: 'KO', isPrimary: false },
      { alias: 'Lawrence Page', language: 'EN', isPrimary: false }
    ],
    topics: ['Google', 'Alphabet', 'Search', 'AI', 'Technology', 'Innovation', 'Moonshots'],
    sources: [
      {
        type: 'YOUTUBE_PLAYLIST',
        name: 'Google Founders Interviews',
        config: { searchTerms: ['Larry Page interview', 'Larry Page Google'] },
        fetchFrequency: 'daily',
      },
      {
        type: 'INTERVIEW_TRANSCRIPT',
        name: 'University Commencement Speeches',
        config: { events: ['University of Michigan 2009'] },
        fetchFrequency: 'once',
      },
      {
        type: 'CONFERENCE_TALK',
        name: 'Google I/O & TED Talks',
        config: { conferences: ['Google I/O', 'TED', 'SXSW'] },
        fetchFrequency: 'daily',
      }
    ]
  },

  // =========================================================================
  // 12. Sergey Brin
  // =========================================================================
  {
    slug: 'sergey-brin',
    name: 'Sergey Brin',
    nameKo: '세르게이 브린',
    title: 'Co-founder of Google & Alphabet',
    bio: `Sergey Mikhailovich Brin is an American computer scientist, internet entrepreneur, and philanthropist. Born in Moscow, he emigrated to the United States with his family at age six. He co-founded Google with Larry Page in 1998. Brin oversaw Google X (now X Development), the company's secretive moonshot lab responsible for projects like Google Glass, self-driving cars, and Project Loon.`,
    bioShort: 'Co-founder of Google. Pioneer of internet search and moonshot innovations.',
    color: 'from-red-500 to-yellow-500',
    accentColor: '#EA4335',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Sergey_Brin%2C_Web_2.0_Conference.jpg/440px-Sergey_Brin%2C_Web_2.0_Conference.jpg',
    birthDate: new Date('1973-08-21'),
    nationality: 'Russian-American',
    occupation: ['Computer Scientist', 'Entrepreneur', 'Investor'],
    companies: ['Google', 'Alphabet', 'X Development'],
    industries: ['Technology', 'Internet', 'AI', 'Innovation Labs'],
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Sergey_Brin',
    speakingStyle: {
      tone: 'playful, technical, curious',
      vocabulary: 'technical, experimental',
      patterns: ['embraces experimentation', 'moonshot thinking', 'scientific approach']
    },
    keyPhrases: [
      'Moonshots',
      'X factor',
      '10x better',
      'Obviously everyone wants to be successful'
    ],
    values: ['Curiosity', 'Innovation', 'Experimentation', 'Freedom of information', 'Technology'],
    expertise: ['Search algorithms', 'Data mining', 'Computer science', 'Innovation management'],
    aliases: [
      { alias: 'Sergey Brin', language: 'EN', isPrimary: true },
      { alias: '세르게이 브린', language: 'KO', isPrimary: false },
      { alias: 'Сергей Брин', language: 'OTHER', isPrimary: false }
    ],
    topics: ['Google', 'Alphabet', 'X', 'Innovation', 'Technology', 'Moonshots', 'AI'],
    sources: [
      {
        type: 'YOUTUBE_PLAYLIST',
        name: 'Sergey Brin Interviews',
        config: { searchTerms: ['Sergey Brin interview', 'Sergey Brin Google'] },
        fetchFrequency: 'daily',
      },
      {
        type: 'CONFERENCE_TALK',
        name: 'Google I/O Appearances',
        config: { conferences: ['Google I/O', 'TED'] },
        fetchFrequency: 'daily',
      },
      {
        type: 'NEWS_SEARCH',
        name: 'Sergey Brin News',
        config: {
          queries: ['Sergey Brin', 'Google co-founder Brin'],
          sources: ['Reuters', 'Bloomberg', 'TechCrunch'],
        },
        fetchFrequency: 'daily',
      }
    ]
  },

  // =========================================================================
  // 13. Mark Zuckerberg
  // =========================================================================
  {
    slug: 'mark-zuckerberg',
    name: 'Mark Zuckerberg',
    nameKo: '마크 저커버그',
    title: 'CEO of Meta Platforms',
    bio: `Mark Elliot Zuckerberg is an American businessman and philanthropist. He co-founded Facebook (now Meta Platforms) in 2004 from his Harvard dorm room and serves as its CEO. Under his leadership, Meta has grown to include Instagram, WhatsApp, and is now pivoting toward building the metaverse and advancing AI. He is one of the world's youngest billionaires and has committed to giving away most of his wealth.`,
    bioShort: 'CEO of Meta. Building social connections and the metaverse.',
    color: 'from-blue-500 to-blue-700',
    accentColor: '#1877F2',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg/440px-Mark_Zuckerberg_F8_2019_Keynote_%2832830578717%29_%28cropped%29.jpg',
    birthDate: new Date('1984-05-14'),
    nationality: 'American',
    occupation: ['CEO', 'Entrepreneur', 'Philanthropist', 'Programmer'],
    companies: ['Meta Platforms', 'Facebook', 'Instagram', 'WhatsApp', 'Chan Zuckerberg Initiative'],
    industries: ['Social Media', 'VR/AR', 'AI', 'Advertising'],
    twitterHandle: 'faborig',
    linkedinUrl: 'https://www.linkedin.com/in/zuck/',
    wikipediaUrl: 'https://en.wikipedia.org/wiki/Mark_Zuckerberg',
    speakingStyle: {
      tone: 'focused, technical, mission-driven',
      vocabulary: 'product-focused, vision-oriented',
      patterns: ['discusses connection and community', 'long-term vision', 'move fast']
    },
    keyPhrases: [
      'Move fast and break things',
      'Connecting the world',
      'The metaverse',
      'Long-term value',
      'Building community'
    ],
    values: ['Connection', 'Community', 'Impact', 'Long-term thinking', 'Innovation'],
    expertise: ['Social networks', 'Product development', 'VR/AR', 'AI', 'Advertising technology'],
    aliases: [
      { alias: 'Mark Zuckerberg', language: 'EN', isPrimary: true },
      { alias: '마크 저커버그', language: 'KO', isPrimary: false },
      { alias: 'Zuck', language: 'EN', isPrimary: false }
    ],
    topics: ['Meta', 'Facebook', 'Instagram', 'WhatsApp', 'Metaverse', 'VR', 'AI', 'Social Media'],
    sources: [
      {
        type: 'YOUTUBE_CHANNEL',
        name: 'Mark Zuckerberg Facebook',
        config: { channelId: 'UC7z-6DfoUtWe0LRJJ4sAFJQ' },
        fetchFrequency: 'daily',
      },
      {
        type: 'EARNINGS_CALL',
        name: 'Meta Earnings Calls',
        config: { ticker: 'META', company: 'Meta Platforms' },
        fetchFrequency: 'monthly',
      },
      {
        type: 'PODCAST_SHOW',
        name: 'Podcast Appearances',
        config: {
          shows: ['Lex Fridman Podcast', 'Joe Rogan Experience'],
          guestFilter: 'Mark Zuckerberg'
        },
        fetchFrequency: 'daily',
      },
      {
        type: 'CONFERENCE_TALK',
        name: 'Meta Connect',
        config: { conferences: ['Meta Connect', 'F8'] },
        fetchFrequency: 'daily',
      }
    ]
  }
]

// ============================================================================
// Seed Function
// ============================================================================

async function main() {
  console.log('🌱 Starting seed...')
  console.log(`📊 Seeding ${personas.length} personas...`)

  for (const personaData of personas) {
    const { aliases, topics, sources, ...personaFields } = personaData

    console.log(`\n👤 Creating persona: ${personaFields.name}`)

    // Upsert persona
    const persona = await prisma.persona.upsert({
      where: { slug: personaFields.slug },
      update: {
        ...personaFields,
        visibility: 'PUBLIC' as PersonaVisibility,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        ...personaFields,
        visibility: 'PUBLIC' as PersonaVisibility,
        isActive: true
      }
    })

    console.log(`  ✅ Persona created/updated: ${persona.id}`)

    // Create aliases
    for (const alias of aliases) {
      await prisma.personaAlias.upsert({
        where: {
          personaId_alias: {
            personaId: persona.id,
            alias: alias.alias
          }
        },
        update: {
          language: alias.language,
          isPrimary: alias.isPrimary
        },
        create: {
          personaId: persona.id,
          alias: alias.alias,
          language: alias.language,
          isPrimary: alias.isPrimary
        }
      })
    }
    console.log(`  📝 ${aliases.length} aliases created`)

    // Create topics
    for (const topic of topics) {
      await prisma.personaTopic.upsert({
        where: {
          personaId_topic: {
            personaId: persona.id,
            topic: topic
          }
        },
        update: {
          updatedAt: new Date()
        },
        create: {
          personaId: persona.id,
          topic: topic,
          confidence: 0.8
        }
      })
    }
    console.log(`  🏷️  ${topics.length} topics created`)

    // Create sources
    for (const source of sources) {
      const existingSource = await prisma.source.findFirst({
        where: {
          personaId: persona.id,
          type: source.type,
          name: source.name
        }
      })

      if (!existingSource) {
        await prisma.source.create({
          data: {
            personaId: persona.id,
            type: source.type,
            name: source.name,
            description: source.description,
            url: source.url,
            config: source.config,
            fetchFrequency: source.fetchFrequency ?? null,
            status: 'PENDING' as SourceStatus,
            priority: 0
          }
        })
      }
    }
    console.log(`  📚 ${sources.length} sources configured`)
  }

  // Create default system config
  await prisma.systemConfig.upsert({
    where: { key: 'embedding_model' },
    update: { value: { model: 'text-embedding-3-small', dimensions: 1536 } },
    create: {
      key: 'embedding_model',
      value: { model: 'text-embedding-3-small', dimensions: 1536 },
      description: 'OpenAI embedding model configuration'
    }
  })

  await prisma.systemConfig.upsert({
    where: { key: 'chat_model' },
    update: { value: { model: 'claude-sonnet-4-20250514', maxTokens: 4096 } },
    create: {
      key: 'chat_model',
      value: { model: 'claude-sonnet-4-20250514', maxTokens: 4096 },
      description: 'Claude model for chat responses'
    }
  })

  console.log('\n⚙️  System config created')

  // Summary
  const totalPersonas = await prisma.persona.count()
  const totalAliases = await prisma.personaAlias.count()
  const totalTopics = await prisma.personaTopic.count()
  const totalSources = await prisma.source.count()

  console.log('\n' + '='.repeat(50))
  console.log('✅ Seed completed!')
  console.log('='.repeat(50))
  console.log(`📊 Summary:`)
  console.log(`   - Personas: ${totalPersonas}`)
  console.log(`   - Aliases: ${totalAliases}`)
  console.log(`   - Topics: ${totalTopics}`)
  console.log(`   - Sources: ${totalSources}`)
  console.log('='.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
