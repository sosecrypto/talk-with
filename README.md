# Talk With Legends

AI 페르소나 챗봇 플랫폼 - 유명인의 관점과 생각으로 대화하는 AI 시스템

## 개요

Talk With Legends는 유명 인물(기업가, 투자자, 기술 리더 등)의 인터뷰, SNS, 뉴스, 책 등을 수집하고 벡터화하여, 해당 인물의 관점에서 답변하는 RAG 기반 AI 챗봇 시스템입니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| AI | Anthropic Claude API (Chat), OpenAI (Embeddings) |
| Database | Supabase PostgreSQL + pgvector |
| ORM | Prisma |
| Authentication | NextAuth.js (Google, GitHub OAuth) |
| Data Pipeline | n8n + Apify |
| State Management | Zustand |

## 지원 페르소나

- Elon Musk, Steve Jobs, Warren Buffett
- Sam Altman, Vitalik Buterin, Bill Gates
- Jeff Bezos, Jensen Huang, Mark Zuckerberg
- Donald Trump, 이재용, Larry Page, Sergey Brin

## 핵심 기능

### Phase 1 (완료)
- [x] 사용자 인증 (Google/GitHub OAuth)
- [x] 실시간 스트리밍 채팅
- [x] 대화 기록 저장 및 관리
- [x] 파일 업로드 (이미지/문서)

### Phase 2 (진행 중) - 페르소나 시스템
- [x] 데이터베이스 스키마 확장 (v2.0.0)
- [x] n8n 데이터 수집 워크플로우
  - YouTube 트랜스크립트 수집
  - Twitter/X 트윗 수집
  - 블로그 포스트 수집
  - 뉴스/인터뷰 수집
- [x] 문서 처리 & 청킹 파이프라인
- [x] 임베딩 생성 파이프라인
- [x] 특성 추출 (Claude API)
- [x] RAG 검색 API
- [x] 페르소나 API
- [ ] 페르소나 선택 UI

자세한 로드맵은 [ROADMAP.md](./ROADMAP.md)를 참조하세요.

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사하여 `.env.local` 생성:

```bash
cp .env.example .env.local
```

필요한 환경변수:
- `DATABASE_URL` - Supabase PostgreSQL 연결 문자열
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 서비스 롤 키
- `ANTHROPIC_API_KEY` - Claude API 키
- `OPENAI_API_KEY` - OpenAI API 키 (임베딩용)
- `NEXTAUTH_SECRET` - NextAuth 시크릿
- OAuth 제공자 키 (Google, GitHub)

### 3. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 스키마 푸시
npm run db:push

# 시드 데이터 삽입
npm run db:seed
```

### 4. pgvector 설정

Supabase SQL Editor에서 실행:

```bash
# pgvector-setup.sql 실행
prisma/migrations/pgvector-setup.sql

# RLS 정책 설정 (선택)
prisma/migrations/rls-policies.sql
```

### 5. n8n 설정 (데이터 수집)

```bash
cd n8n
docker-compose up -d
```

자세한 설정은 [n8n/README.md](./n8n/README.md)를 참조하세요.

### 6. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

## API 엔드포인트

### 페르소나
```
GET  /api/personas           # 페르소나 목록
GET  /api/personas/:slug     # 페르소나 상세
```

### RAG 검색
```
POST /api/rag/search
{
  "query": "What do you think about AI?",
  "personaSlug": "elon-musk",
  "topK": 5
}
```

### 채팅
```
POST /api/chat
{
  "message": "Your question here",
  "personaSlug": "elon-musk",  // optional
  "conversationId": "..."      // optional
}
```

## 프로젝트 구조

```
talk-with/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/         # 채팅 API (RAG 통합)
│   │   │   ├── personas/     # 페르소나 API
│   │   │   ├── rag/          # RAG 검색 API
│   │   │   └── ...
│   │   ├── chat/             # 채팅 페이지
│   │   └── login/            # 로그인 페이지
│   ├── components/           # UI 컴포넌트
│   ├── hooks/                # 커스텀 훅
│   ├── lib/
│   │   ├── anthropic.ts      # Claude 클라이언트
│   │   ├── openai.ts         # OpenAI 클라이언트 (임베딩)
│   │   ├── prompt-generator.ts # 페르소나 프롬프트 생성
│   │   └── ...
│   └── types/                # TypeScript 타입
├── prisma/
│   ├── schema.prisma         # DB 스키마 (v2.0.0)
│   ├── seed.ts               # 시드 데이터
│   └── migrations/           # SQL 마이그레이션
├── n8n/
│   ├── workflows/            # n8n 워크플로우
│   └── docker-compose.yml
└── docs/                     # 문서
```

## 데이터 파이프라인 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION (n8n)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ YouTube  │ │ Twitter  │ │   Blog   │ │   News   │       │
│  │ Apify    │ │ Apify    │ │ Apify    │ │ Apify    │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│       └────────────┴──────┬─────┴────────────┘             │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Document Processor → Chunker → Embedding Generator │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               STORAGE (Supabase + pgvector)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Personas │ │Documents │ │ Chunks   │ │Character-│       │
│  │          │ │          │ │+Vectors  │ │ istics   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└───────────────────────────┬─────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     RAG PIPELINE                             │
│  Query → Embed → Vector Search → Context → Claude → Response│
└─────────────────────────────────────────────────────────────┘
```

## 라이선스

MIT License
