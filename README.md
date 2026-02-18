# Talk With Legends

AI 페르소나 챗봇 플랫폼 - 유명인의 관점과 생각으로 대화하는 AI 시스템

## 개요

Talk With Legends는 유명 인물(기업가, 투자자, 기술 리더 등)의 인터뷰, SNS, 뉴스, 책 등을 수집하고 벡터화하여, 해당 인물의 관점에서 답변하는 RAG 기반 AI 챗봇 시스템입니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| AI | Anthropic Claude API (Chat), OpenAI (Embeddings), Cohere (Reranking) |
| Database | Supabase PostgreSQL + pgvector |
| ORM | Prisma |
| Authentication | NextAuth.js (Google, GitHub OAuth) |
| Data Pipeline | n8n (Self-Hosted) + Apify |
| State Management | Zustand |
| Charts | Recharts |

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

### Phase 2 (완료) - 페르소나 시스템
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
- [x] 페르소나 선택 UI

### Phase 3 (완료) - UI/UX 고도화
- [x] 다크모드 지원 (클래스 기반 `.dark`)
- [x] Agentation 도구 추가
- [x] 마크다운 렌더링 (AI 응답)

### Phase 4 (완료) - 기능 확장
- [x] 반응형 모바일 UI (사이드바 overlay, dvh, 그리드 반응형)
- [x] 멀티모달 이미지 분석 (Claude Vision, 드래그앤드롭 첨부)
- [x] 대화 내보내기 (JSON, Markdown)
- [x] 관리자 대시보드 (통계, 페르소나 CRUD, 사용자 관리, 데이터 모니터링, 분석)

### Phase 5 (완료) - 사용자 설정 & 고급 분석
- [x] 사용자 설정 페이지 (`/settings`)
  - 테마 전환 (Light/Dark/System)
  - 프로필 편집 (이름)
  - 기본 페르소나 설정
  - 전체 대화 삭제
- [x] ThemeProvider (localStorage + system preference 동기화)
- [x] 고급 분석 대시보드 (Recharts)
  - Overview: KPI 카드 + 일별 트렌드 + Top Users
  - Personas: 페르소나별 대화 수 바차트
  - Tokens: 입출력 토큰 분포 파이차트
  - Feedback: 피드백 유형 분포 + thumbsUp 비율
  - 기간 필터 (7d/30d/90d)

자세한 로드맵은 [ROADMAP.md](./ROADMAP.md)를 참조하세요.

### 관련 문서
- [CLAUDE.md](./CLAUDE.md) - 프로젝트 가이드라인

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
- `COHERE_API_KEY` - Cohere API 키 (Reranking용)
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
# n8n 컨테이너 시작
npm run n8n:start

# 워크플로우 JSON 유효성 검증
npm run n8n:import:dry-run

# 워크플로우 import
npm run n8n:import

# import + 자동 활성화
npm run n8n:import:activate
```

크레덴셜 설정은 [n8n/README.md](./n8n/README.md)를 참고하세요.

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

### RAG 검색 (하이브리드 + Reranking)
```
POST /api/rag/search
{
  "query": "What do you think about AI?",
  "personaSlug": "elon-musk",
  "topK": 5,
  "useHybrid": true,        // default: true (false시 vector-only)
  "useRerank": true,         // default: true (Cohere rerank-v3.5)
  "keywordWeight": 0.3      // 키워드 가중치 (0~1, default: 0.3)
}
```

### 채팅
```
POST /api/chat
{
  "message": "Your question here",
  "personaSlug": "elon-musk",  // optional
  "conversationId": "...",     // optional
  "attachments": [             // optional (멀티모달)
    { "url": "https://...", "type": "image", "name": "photo.jpg" }
  ]
}
```

### 대화 내보내기
```
GET /api/conversations/:id/export?format=json|markdown
```

### 사용자 설정
```
GET   /api/settings                    # 설정 조회
PATCH /api/settings                    # 설정 업데이트 (theme, defaultPersona, language)
PATCH /api/settings/profile            # 프로필 업데이트 (name, image)
DELETE /api/settings/conversations     # 전체 대화 삭제
```

### 관리자 (role=admin 필요)
```
GET    /api/admin/stats                # 전체 통계
GET    /api/admin/personas             # 페르소나 목록 (DRAFT 포함)
POST   /api/admin/personas             # 페르소나 생성
PATCH  /api/admin/personas/:slug       # 페르소나 수정
DELETE /api/admin/personas/:slug       # 페르소나 비활성화
GET    /api/admin/users?page=1&limit=20 # 사용자 목록
PATCH  /api/admin/users/:id            # 사용자 role 변경
GET    /api/admin/sources              # 데이터 소스 현황
POST   /api/admin/sources              # 소스 생성
PATCH  /api/admin/sources/:id          # 소스 수정
DELETE /api/admin/sources/:id          # 소스 삭제 (soft delete → ARCHIVED)
POST   /api/admin/sources/:id/trigger  # 수동 수집 트리거
GET    /api/admin/pipeline             # 파이프라인 상태 (documents, chunks, sources, fetchLogs)
GET    /api/admin/analytics?period=30d  # 고급 분석 (personaStats, dailyConversations, tokenStats, feedbackStats, topUsers)
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
│   ├── components/
│   │   ├── chat/             # 채팅 UI 컴포넌트
│   │   ├── dev/              # 개발 도구 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   └── persona/          # 페르소나 선택 컴포넌트
│   ├── hooks/                # 커스텀 훅
│   ├── lib/
│   │   ├── anthropic.ts      # Claude 클라이언트
│   │   ├── openai.ts         # OpenAI 클라이언트 (임베딩)
│   │   ├── cohere.ts         # Cohere 클라이언트 (Reranking)
│   │   ├── reranker.ts       # Rerank 유틸리티
│   │   ├── prompt-generator.ts # 페르소나 프롬프트 생성
│   │   └── ...
│   └── types/                # TypeScript 타입
├── public/
│   └── logos/                # 페르소나 인물 사진
├── prisma/
│   ├── schema.prisma         # DB 스키마 (v2.0.0)
│   ├── seed.ts               # 시드 데이터
│   └── migrations/           # SQL 마이그레이션
├── scripts/                  # 유틸리티 스크립트
├── n8n/
│   ├── docker-compose.yml    # n8n Self-Hosted 컨테이너
│   ├── workflows/            # n8n 워크플로우
│   └── README.md             # n8n Self-Hosted 설정 가이드
└── docs/                     # 기획 & 설계 문서
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
│                 RAG PIPELINE (Hybrid Search + Reranking)          │
│  Query → Embed + Tokenize → Vector + Keyword → RRF Fusion       │
│  → Cohere Rerank (rerank-v3.5) → Context → Claude → Response    │
└─────────────────────────────────────────────────────────────┘
```

## 테스트

Vitest + Testing Library 기반 테스트 인프라 구축 완료.

```bash
npm test              # 전체 테스트 실행
npm run test:watch    # 워치 모드
npm run test:coverage # 커버리지 리포트
```

| 항목 | 수치 |
|------|------|
| 테스트 케이스 | 236개 |
| Statements | 91%+ |
| Branches | 82%+ |
| Functions | 97%+ |
| Lines | 91%+ |

테스트 구조:
- **Server** (Node 환경): API Route, lib 유틸리티
- **Client** (jsdom 환경): React hooks, 컴포넌트

## 라이선스

MIT License
