# Talk With

AI 페르소나 챗봇 플랫폼 - 특정 인물의 관점과 생각으로 대화하는 AI 시스템

## 개요

Talk With는 특정 인물(공인, 전문가, 기업 등)의 인터뷰, SNS, 뉴스 등을 수집하고 벡터화하여, 해당 인물의 관점에서 답변하는 AI 챗봇 시스템입니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| AI | Anthropic Claude API |
| Database | Supabase PostgreSQL + pgvector |
| ORM | Prisma |
| Authentication | NextAuth.js (Google, GitHub OAuth) |
| State Management | Zustand |

## 핵심 기능

### Phase 1 (완료)
- [x] 사용자 인증 (Google/GitHub OAuth)
- [x] 실시간 스트리밍 채팅
- [x] 대화 기록 저장 및 관리
- [x] 파일 업로드 (이미지/문서)

### Phase 2 (예정) - 페르소나 시스템
- [ ] 데이터 수집기 (크롤러/스크래퍼)
- [ ] 벡터 임베딩 시스템 (pgvector)
- [ ] RAG 파이프라인
- [ ] 페르소나 관리 시스템

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

필요한 환경변수를 설정하세요.

### 3. 데이터베이스 설정

Supabase에서 프로젝트를 생성한 후:

```bash
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

## 프로젝트 구조

```
talk-with/
├── src/
│   ├── app/
│   │   ├── api/           # API 라우트
│   │   ├── chat/          # 채팅 페이지
│   │   └── login/         # 로그인 페이지
│   ├── components/        # UI 컴포넌트
│   ├── hooks/             # 커스텀 훅
│   ├── lib/               # 유틸리티 함수
│   └── types/             # TypeScript 타입
├── prisma/                # 데이터베이스 스키마
└── docs/                  # 문서
```

## 라이선스

MIT License
