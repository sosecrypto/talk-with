# Talk With Legends - Project Guidelines

## Overview

RAG-based AI persona chatbot platform. Collects interviews, social media, and news data from famous figures (Elon Musk, Steve Jobs, Warren Buffett, etc.) and provides a conversational experience with those personas.

### Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Anthropic Claude API (chat), OpenAI Embeddings (text-embedding-3-small), Cohere Rerank (rerank-v3.5)
- **DB**: Supabase PostgreSQL + pgvector (vector search)
- **ORM**: Prisma 5
- **Auth**: NextAuth.js (Google, GitHub OAuth)
- **State**: Zustand
- **Data Pipeline**: n8n + Apify (web scraping)

## Project Structure

```
talk-with/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth
│   │   │   ├── chat/                # SSE streaming chat
│   │   │   ├── conversations/       # Conversation CRUD
│   │   │   ├── personas/            # Persona list/detail
│   │   │   ├── rag/search/          # Hybrid search (vector + keyword)
│   │   │   └── upload/              # Supabase file upload
│   │   ├── chat/                    # Chat page
│   │   └── login/                   # Login page
│   ├── components/
│   │   ├── chat/        # ChatInput, ChatMessage, ChatWindow, ConversationList
│   │   ├── layout/      # AuthProvider, Layout
│   │   └── persona/     # PersonaSelector
│   ├── hooks/           # Custom hooks
│   ├── lib/
│   │   ├── anthropic.ts          # Claude client
│   │   ├── openai.ts             # OpenAI embeddings client
│   │   ├── cohere.ts             # Cohere rerank client
│   │   ├── reranker.ts           # Rerank utility (rerankChunks)
│   │   ├── prompt-generator.ts   # Persona system prompt generation (core)
│   │   ├── auth.ts               # NextAuth config
│   │   ├── prisma.ts             # Prisma singleton
│   │   └── supabase.ts           # Supabase admin client
│   ├── types/           # Type definitions
│   └── middleware.ts    # NextAuth middleware
├── prisma/
│   ├── schema.prisma    # DB schema v2.0.0
│   ├── seed.ts          # 18 persona seed data
│   └── migrations/      # Migration history
├── n8n/
│   ├── docker-compose.yml  # n8n container
│   └── workflows/          # Data collection workflows
└── docs/                   # Planning docs
```

## RAG Pipeline (Hybrid Search + Reranking)

```
1. User query → OpenAI embedding (1536 dim) + tsvector tokenization
2. hybrid_search_chunks RPC → Vector similarity + Keyword FTS (over-fetch: topK×3)
3. RRF (Reciprocal Rank Fusion) → Combined ranking (k=60, keyword_weight=0.3)
4. Cohere Rerank (rerank-v3.5) → Precision re-ranking → Top-K selection
5. Related chunks + persona characteristics → system prompt composition
6. Claude API → First-person persona response (SSE streaming)
```

## Data Collection Pipeline (n8n)

| Workflow | Interval | Description |
|---|---|---|
| YouTube Collector | 6h | Transcripts + metadata |
| Blog Collectors | varies | Vitalik, Gates Notes, etc. |
| Twitter Collector | 12h | Apify-based tweet collection |
| News Collector | daily | News/interview aggregation |
| Document Processor | 15min | Text cleaning, chunking |
| Embedding Generator | 30min | OpenAI vector generation |
| Characteristic Extractor | 4h | Claude-based trait extraction |

## Commands

```bash
npm run dev           # Dev server (port 3000)
npm run build         # Production build
npm run lint          # ESLint
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to DB
npm run db:seed       # Seed persona data
npm run db:studio     # Prisma Studio GUI
```

## Environment Variables

```env
# DB (Supabase PostgreSQL)
DATABASE_URL=
DIRECT_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server only, never expose to client

# AI
ANTHROPIC_API_KEY=               # Claude (chat)
OPENAI_API_KEY=                  # Embeddings only
COHERE_API_KEY=                  # Reranking (rerank-v3.5)

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=
```

## Key DB Models

- **Persona**: 18+ personas (slug, name, characteristics, stats)
- **Characteristic**: Persona traits (opinions, speech style, quotes) + confidence score (only use >= 0.6)
- **Chunk**: Text chunks + pgvector embeddings (1536 dim)
- **Conversation/Message**: Chat history + token tracking
- **Source/Document**: Data sources (30+ types) + processing status pipeline

## Project Notes

- `prompt-generator.ts` is the core of persona prompts — combines traits, RAG context, and speech patterns
- Dev mode auto-creates test user
- pgvector extension required (provided by default in Supabase)
- Path alias: `@/*` → `src/*`
