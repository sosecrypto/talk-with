# Talk With - 개발 로드맵

## Phase 1: 기본 채팅 시스템 (완료)

### 1.1 프로젝트 초기화
- [x] Next.js 14 프로젝트 생성
- [x] TypeScript, Tailwind CSS 설정
- [x] Prisma + Supabase 연동

### 1.2 인증 시스템
- [x] NextAuth.js 설정
- [x] Google/GitHub OAuth
- [x] 세션 관리

### 1.3 채팅 기능
- [x] Claude API 스트리밍 응답
- [x] 대화 기록 저장/불러오기
- [x] 실시간 UI 업데이트

### 1.4 파일 업로드
- [x] Supabase Storage 연동
- [x] 이미지/문서 업로드 API

---

## Phase 2: 페르소나 시스템 (예정)

### 2.1 데이터 수집 시스템

#### 데이터베이스 스키마 확장
```prisma
model Persona {
  id          String   @id @default(cuid())
  name        String
  description String?
  imageUrl    String?
  isPublic    Boolean  @default(false)
  createdById String
  createdBy   User     @relation(fields: [createdById], references: [id])
  sources     Source[]
  documents   Document[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Source {
  id        String     @id @default(cuid())
  type      SourceType // YOUTUBE, TWITTER, NEWS, INTERVIEW, BLOG
  url       String
  personaId String
  persona   Persona    @relation(fields: [personaId], references: [id])
  documents Document[]
  lastFetched DateTime?
  isActive  Boolean    @default(true)
  createdAt DateTime   @default(now())
}

model Document {
  id         String   @id @default(cuid())
  content    String   @db.Text
  title      String?
  sourceId   String?
  source     Source?  @relation(fields: [sourceId], references: [id])
  personaId  String
  persona    Persona  @relation(fields: [personaId], references: [id])
  chunks     Chunk[]
  metadata   Json?
  publishedAt DateTime?
  createdAt  DateTime @default(now())
}

model Chunk {
  id         String   @id @default(cuid())
  content    String   @db.Text
  embedding  Float[]  @db.Vector(1536)
  documentId String
  document   Document @relation(fields: [documentId], references: [id])
  metadata   Json?
  createdAt  DateTime @default(now())

  @@index([embedding], type: Hnsw, ops: VectorCosineOps)
}

enum SourceType {
  YOUTUBE
  TWITTER
  NEWS
  INTERVIEW
  BLOG
  BOOK
  PODCAST
}
```

#### 크롤러/스크래퍼 구현
- [ ] YouTube 자막 수집기
- [ ] Twitter/X 트윗 수집기
- [ ] 뉴스 기사 수집기
- [ ] 인터뷰 텍스트 수집기
- [ ] 블로그 포스트 수집기
- [ ] 정기 수집 스케줄러 (Cron)

#### 데이터 전처리
- [ ] 텍스트 정제 (HTML 제거, 특수문자 처리)
- [ ] 언어 감지 및 번역 (필요시)
- [ ] 문장/단락 분할 (Chunking)
- [ ] 메타데이터 추출 (날짜, 출처, 주제 등)

### 2.2 벡터 임베딩 시스템

#### Supabase pgvector 설정
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create index for similarity search
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
```

#### 임베딩 파이프라인
- [ ] OpenAI text-embedding-3-small 연동
- [ ] 배치 임베딩 처리
- [ ] 증분 업데이트 지원
- [ ] 임베딩 캐싱

### 2.3 RAG (Retrieval-Augmented Generation) 파이프라인

#### 검색 시스템
- [ ] 의미적 유사도 검색 (Semantic Search)
- [ ] 하이브리드 검색 (키워드 + 벡터)
- [ ] 검색 결과 재순위화 (Re-ranking)
- [ ] 컨텍스트 윈도우 최적화

#### 프롬프트 엔지니어링
```typescript
const personaSystemPrompt = `
당신은 ${persona.name}입니다.

## 인물 정보
${persona.description}

## 말투와 스타일
- 해당 인물의 특징적인 어투 사용
- 자주 사용하는 표현과 비유 활용
- 가치관과 철학 반영

## 참고 자료
다음은 실제 발언/글에서 발췌한 내용입니다:
${relevantChunks.map(chunk => chunk.content).join('\n\n')}

## 지침
1. 위 참고 자료를 기반으로 답변하되, 자연스럽게 통합
2. 확실하지 않은 내용은 "아마도", "제 생각에는" 등으로 표현
3. 참고 자료에 없는 질문은 해당 인물의 가치관에 맞게 유추
4. 1인칭 시점으로 답변
`
```

### 2.4 페르소나 관리 시스템

#### 관리자 대시보드
- [ ] 페르소나 생성/수정/삭제
- [ ] 데이터 소스 관리
- [ ] 수집 상태 모니터링
- [ ] 임베딩 품질 분석

#### 페르소나 선택 UI
- [ ] 페르소나 목록/검색
- [ ] 페르소나 프로필 카드
- [ ] 대화 시작 시 페르소나 선택

---

## Phase 3: 고급 기능 (미래)

### 3.1 멀티모달 지원
- [ ] 이미지 분석 (Claude Vision)
- [ ] 음성 입력/출력
- [ ] 비디오 컨텐츠 분석

### 3.2 기업용 기능
- [ ] 팀/조직 관리
- [ ] API 키 발급
- [ ] 사용량 분석
- [ ] 화이트라벨 지원

### 3.3 고급 분석
- [ ] 대화 분석 대시보드
- [ ] 감정 분석
- [ ] 주제 클러스터링
- [ ] 답변 품질 평가

---

## 기술적 구현 세부사항

### 데이터 수집 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Data Collection                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ YouTube  │  │ Twitter  │  │   News   │  │  Custom  │ │
│  │ Scraper  │  │ Scraper  │  │ Scraper  │  │ Scraper  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │             │             │        │
│       └─────────────┴──────┬──────┴─────────────┘        │
│                            │                             │
│                    ┌───────▼───────┐                     │
│                    │  Preprocessor │                     │
│                    │  (Clean/Chunk)│                     │
│                    └───────┬───────┘                     │
│                            │                             │
│                    ┌───────▼───────┐                     │
│                    │   Embedding   │                     │
│                    │   Generator   │                     │
│                    └───────┬───────┘                     │
│                            │                             │
│                    ┌───────▼───────┐                     │
│                    │   pgvector    │                     │
│                    │   Storage     │                     │
│                    └───────────────┘                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### RAG 파이프라인 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                     RAG Pipeline                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User Query                                              │
│       │                                                  │
│       ▼                                                  │
│  ┌─────────────┐                                         │
│  │   Query     │                                         │
│  │  Embedding  │                                         │
│  └──────┬──────┘                                         │
│         │                                                │
│         ▼                                                │
│  ┌─────────────┐     ┌─────────────┐                     │
│  │  Semantic   │────▶│  Re-ranker  │                     │
│  │   Search    │     │  (Optional) │                     │
│  └─────────────┘     └──────┬──────┘                     │
│                             │                            │
│                             ▼                            │
│  ┌──────────────────────────────────────┐                │
│  │         Context Construction         │                │
│  │  ┌──────────┐  ┌──────────────────┐ │                │
│  │  │ Persona  │  │ Retrieved Chunks │ │                │
│  │  │  Prompt  │  │    (Top-K)       │ │                │
│  │  └──────────┘  └──────────────────┘ │                │
│  └──────────────────┬───────────────────┘                │
│                     │                                    │
│                     ▼                                    │
│  ┌─────────────────────────────────────┐                 │
│  │           Claude API                │                 │
│  │      (Streaming Response)           │                 │
│  └─────────────────────────────────────┘                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 예상 API 엔드포인트

```
POST   /api/personas                    # 페르소나 생성
GET    /api/personas                    # 페르소나 목록
GET    /api/personas/:id                # 페르소나 상세
PATCH  /api/personas/:id                # 페르소나 수정
DELETE /api/personas/:id                # 페르소나 삭제

POST   /api/personas/:id/sources        # 데이터 소스 추가
GET    /api/personas/:id/sources        # 데이터 소스 목록
DELETE /api/personas/:id/sources/:sid   # 데이터 소스 삭제

POST   /api/personas/:id/collect        # 수동 데이터 수집 트리거
GET    /api/personas/:id/documents      # 수집된 문서 목록
GET    /api/personas/:id/stats          # 페르소나 통계

POST   /api/chat                        # 채팅 (페르소나 ID 포함)
```

---

## 우선순위 및 일정

| 단계 | 기능 | 우선순위 | 상태 |
|------|------|----------|------|
| 2.1 | 데이터베이스 스키마 확장 | 높음 | 예정 |
| 2.1 | YouTube 자막 수집기 | 높음 | 예정 |
| 2.2 | pgvector 설정 | 높음 | 예정 |
| 2.2 | 임베딩 파이프라인 | 높음 | 예정 |
| 2.3 | RAG 검색 시스템 | 높음 | 예정 |
| 2.3 | 페르소나 프롬프트 | 높음 | 예정 |
| 2.4 | 페르소나 관리 UI | 중간 | 예정 |
| 2.1 | Twitter 수집기 | 중간 | 예정 |
| 2.1 | 뉴스 수집기 | 중간 | 예정 |
| 2.3 | 하이브리드 검색 | 낮음 | 예정 |
