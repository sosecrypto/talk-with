export const MOCK_PERSONA = {
  id: 'persona-1',
  slug: 'elon-musk',
  name: 'Elon Musk',
  nameKo: '일론 머스크',
  title: 'CEO of Tesla & SpaceX',
  bio: 'Elon Musk is the CEO of Tesla, SpaceX, and X. Known for pushing the boundaries of technology and space exploration.',
  bioShort: 'CEO of Tesla & SpaceX',
  imageUrl: 'https://example.com/elon.jpg',
  sketchUrl: null,
  thumbnailUrl: null,
  color: '#1DA1F2',
  accentColor: '#FF6B35',
  birthDate: new Date('1971-06-28'),
  nationality: 'South African-American',
  occupation: ['CEO', 'Engineer', 'Entrepreneur'],
  companies: ['Tesla', 'SpaceX', 'X'],
  industries: ['Automotive', 'Aerospace', 'Technology'],
  twitterHandle: '@elonmusk',
  linkedinUrl: null,
  wikipediaUrl: 'https://en.wikipedia.org/wiki/Elon_Musk',
  officialWebsite: null,
  speakingStyle: { tone: 'direct', humor: 'meme-based' },
  keyPhrases: ['First principles thinking', 'Making life multiplanetary'],
  values: ['Innovation', 'Sustainability', 'Space exploration'],
  expertise: ['Electric vehicles', 'Rocket science', 'AI'],
  visibility: 'PUBLIC',
  isActive: true,
  systemPromptVersion: 'v2',
  priority: 100,
  totalDocuments: 500,
  totalChunks: 2000,
  totalConversations: 150,
  avgRating: 4.5,
  characteristics: [],
}

export const MOCK_CHARACTERISTICS = [
  {
    id: 'char-1',
    category: 'OPINION',
    topic: 'AI Safety',
    content: 'AI is potentially the most dangerous technology ever created and needs to be regulated.',
    confidence: 0.92,
  },
  {
    id: 'char-2',
    category: 'OPINION',
    topic: 'Mars Colonization',
    content: 'Humanity needs to become a multi-planetary species to ensure survival.',
    confidence: 0.95,
  },
  {
    id: 'char-3',
    category: 'STYLE',
    topic: null,
    content: 'Speaks in direct, often casual tone with frequent use of memes and humor.',
    confidence: 0.88,
  },
  {
    id: 'char-4',
    category: 'BELIEF',
    topic: null,
    content: 'First principles thinking is the most powerful problem-solving approach.',
    confidence: 0.91,
  },
  {
    id: 'char-5',
    category: 'CATCHPHRASE',
    topic: null,
    content: 'The future is gonna be wild',
    confidence: 0.75,
  },
  {
    id: 'char-6',
    category: 'PRINCIPLE',
    topic: null,
    content: 'If something is important enough, you should try even if the probable outcome is failure.',
    confidence: 0.87,
  },
  {
    id: 'char-7',
    category: 'ADVICE',
    topic: null,
    content: 'Work like hell. Put in 80-100 hour weeks.',
    confidence: 0.83,
  },
  {
    id: 'char-8',
    category: 'OPINION',
    topic: 'Electric Vehicles',
    content: 'Electric vehicles are not just better for the environment, they are simply better cars.',
    confidence: 0.55, // Below 0.6 threshold
  },
]

export const MOCK_PERSONA_WITH_CHARACTERISTICS = {
  ...MOCK_PERSONA,
  characteristics: MOCK_CHARACTERISTICS.filter(c => c.confidence >= 0.6),
}

export const MOCK_PERSONA_EMPTY_CHARACTERISTICS = {
  ...MOCK_PERSONA,
  characteristics: [],
  speakingStyle: null,
  keyPhrases: [],
  values: [],
  expertise: [],
}

export const MOCK_RAG_CHUNKS = [
  {
    id: 'chunk-1',
    content: 'I think the most important thing is to have a future that is exciting and inspiring.',
    documentTitle: 'Interview with Elon Musk 2024',
    similarity: 0.89,
    metadata: null,
  },
  {
    id: 'chunk-2',
    content: 'Tesla is accelerating the world transition to sustainable energy.',
    documentTitle: 'Tesla Annual Meeting',
    similarity: 0.82,
    metadata: null,
  },
  {
    id: 'chunk-3',
    content: 'SpaceX is making progress on Starship, the vehicle that will take humans to Mars.',
    documentTitle: 'SpaceX Update',
    similarity: 0.75,
    metadata: null,
  },
]

export const MOCK_RAG_CHUNKS_RAW = MOCK_RAG_CHUNKS.map(c => ({
  id: c.id,
  content: c.content,
  document_title: c.documentTitle,
  similarity: c.similarity,
  metadata: c.metadata,
}))

export const MOCK_HYBRID_CHUNKS_RAW = [
  {
    id: 'chunk-1',
    content: 'I think the most important thing is to have a future that is exciting and inspiring.',
    document_title: 'Interview with Elon Musk 2024',
    similarity: 0.89,
    keyword_rank: 2,
    combined_score: 0.0162,
    metadata: null,
  },
  {
    id: 'chunk-2',
    content: 'Tesla is accelerating the world transition to sustainable energy.',
    document_title: 'Tesla Annual Meeting',
    similarity: 0.82,
    keyword_rank: 1,
    combined_score: 0.0160,
    metadata: null,
  },
  {
    id: 'chunk-3',
    content: 'SpaceX is making progress on Starship, the vehicle that will take humans to Mars.',
    document_title: 'SpaceX Update',
    similarity: 0.75,
    keyword_rank: null,
    combined_score: 0.0113,
    metadata: null,
  },
]

export const MOCK_PERSONA_LIST = [
  {
    id: 'persona-1',
    slug: 'elon-musk',
    name: 'Elon Musk',
    nameKo: '일론 머스크',
    imageUrl: 'https://example.com/elon.jpg',
    bioShort: 'CEO of Tesla & SpaceX',
    color: '#1DA1F2',
    accentColor: '#FF6B35',
    totalDocuments: 500,
    totalConversations: 150,
  },
  {
    id: 'persona-2',
    slug: 'steve-jobs',
    name: 'Steve Jobs',
    nameKo: '스티브 잡스',
    imageUrl: 'https://example.com/jobs.jpg',
    bioShort: 'Co-founder of Apple',
    color: '#A2AAAD',
    accentColor: '#555555',
    totalDocuments: 300,
    totalConversations: 200,
  },
]
