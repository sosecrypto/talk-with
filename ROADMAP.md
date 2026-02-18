# Talk With Legends - 개발 로드맵

## Phase 1: 기본 채팅 시스템 (완료)

### 1.1 프로젝트 초기화
- [x] Next.js 16 (App Router) + React 19 프로젝트 생성
- [x] TypeScript, Tailwind CSS 4 설정
- [x] Prisma + Supabase 연동

### 1.2 인증 시스템
- [x] NextAuth.js 설정
- [x] Google/GitHub OAuth
- [x] 세션 관리

### 1.3 채팅 기능
- [x] Claude API SSE 스트리밍 응답
- [x] 대화 기록 저장/불러오기
- [x] 실시간 UI 업데이트

### 1.4 파일 업로드
- [x] Supabase Storage 연동
- [x] 이미지/문서 업로드 API

---

## Phase 2: 페르소나 시스템 (완료)

### 2.1 데이터 수집 시스템

#### 데이터베이스 스키마 확장
- [x] DB 스키마 v2.0.0 설계 및 적용
- [x] Persona, Characteristic, Source, Document, Chunk 모델
- [x] pgvector 1536차원 벡터 지원
- [x] 18+ 페르소나 시드 데이터

#### 데이터 수집 (n8n + Apify)
- [x] YouTube 자막 수집기 (6시간 주기)
- [x] Twitter/X 트윗 수집기 (12시간 주기)
- [x] 블로그 포스트 수집기 (Vitalik, Gates Notes, Altman 등)
- [x] 뉴스/인터뷰 수집기 (일간)
- [x] 정기 수집 스케줄러 (n8n cron)

#### 데이터 전처리
- [x] 문서 처리 파이프라인 (15분 주기)
- [x] 텍스트 정제 및 청킹
- [x] 메타데이터 추출

### 2.2 벡터 임베딩 시스템
- [x] Supabase pgvector 설정
- [x] OpenAI text-embedding-3-small 연동
- [x] 임베딩 생성 파이프라인 (30분 주기)
- [x] match_chunks RPC 함수

### 2.3 RAG 파이프라인
- [x] 의미적 유사도 검색 (Top-K=5, threshold=0.3)
- [x] 페르소나 프롬프트 엔지니어링 (`prompt-generator.ts`)
- [x] 특성 추출 파이프라인 (Claude API, 4시간 주기)
- [x] RAG 검색 API (`/api/rag/search`)
- [x] 하이브리드 검색 (키워드 + 벡터, RRF)
- [x] 검색 결과 재순위화 (Cohere Rerank v3.5)

### 2.4 페르소나 관리
- [x] 페르소나 목록/상세 API
- [x] 페르소나 선택 UI (프로필 카드)
- [x] 대화 시작 시 페르소나 선택
- [x] 관리자 대시보드 (CRUD, 수집 상태 모니터링, 사용자 관리, 분석)

---

## Phase 3: UI/UX 고도화 (완료)

### 3.1 UI 개선
- [x] 다크모드 지원 (클래스 기반 `.dark`)
- [x] 마크다운 렌더링 (AI 응답, react-markdown)
- [x] Agentation 도구 추가
- [x] API 최적화 (pagination, Cache-Control)
- [x] proxy.ts 인증 전환 (Next.js 16 호환)

### 3.2 코드 품질
- [x] ESLint 설정 및 전체 lint 클린
- [x] Vitest + Testing Library 테스트 인프라 (114개 케이스, 91%+ 커버리지)

### 3.3 추가 기능
- [x] 반응형 모바일 UI 최적화 (사이드바 overlay, dvh, 그리드 반응형, enterkeyhint)
- [x] 사용자 설정 페이지 (테마, 프로필, 기본 페르소나, 대화 관리)
- [x] ThemeProvider (Light/Dark/System, localStorage + system preference 동기화)
- [x] 대화 내보내기 기능 (JSON, Markdown)

---

## Phase 4: 고급 기능 (진행 중)

### 4.1 멀티모달 지원
- [x] 이미지 분석 (Claude Vision, 드래그앤드롭 첨부)
- [ ] 음성 입력/출력
- [ ] 비디오 컨텐츠 분석

### 4.2 고급 분석
- [x] 대화 분석 대시보드 (Recharts, 4탭: Overview/Personas/Tokens/Feedback)
- [x] 기간 필터 (7d/30d/90d)
- [x] 일별 대화 수 트렌드 라인차트
- [x] 페르소나별 대화 수 바차트
- [x] 토큰 사용량 분석 (입출력 비율 파이차트)
- [x] 피드백 분석 (평점, thumbsUp 비율, 유형 분포)
- [x] Top Users 랭킹
- [ ] 감정 분석
- [ ] 주제 클러스터링
- [ ] 답변 품질 평가

### 4.3 기업용 기능
- [ ] 팀/조직 관리
- [ ] API 키 발급
- [ ] 사용량 분석
- [ ] 화이트라벨 지원

---

## 구현된 API 엔드포인트

```
# 페르소나
GET    /api/personas              # 페르소나 목록
GET    /api/personas/:slug        # 페르소나 상세

# 채팅
POST   /api/chat                  # SSE 스트리밍 채팅 (멀티모달 지원)

# 대화
GET    /api/conversations         # 대화 목록 (pagination)
POST   /api/conversations         # 대화 생성
DELETE /api/conversations/:id     # 대화 삭제
GET    /api/conversations/:id/export  # 대화 내보내기 (JSON/Markdown)

# RAG 검색
POST   /api/rag/search            # 하이브리드 검색 (벡터 + 키워드 + Reranking)

# 파일
POST   /api/upload                # 파일 업로드

# 관리자 (role=admin 필요)
GET    /api/admin/stats           # 전체 통계
GET    /api/admin/personas        # 페르소나 목록 (DRAFT 포함)
POST   /api/admin/personas        # 페르소나 생성
PATCH  /api/admin/personas/:slug  # 페르소나 수정
DELETE /api/admin/personas/:slug  # 페르소나 비활성화
GET    /api/admin/users           # 사용자 목록
PATCH  /api/admin/users/:id       # 사용자 role 변경
GET    /api/admin/sources         # 데이터 소스 현황
GET    /api/admin/analytics       # 고급 분석 (?period=7d|30d|90d)

# 사용자 설정
GET    /api/settings              # 설정 조회
PATCH  /api/settings              # 설정 업데이트
PATCH  /api/settings/profile      # 프로필 업데이트
DELETE /api/settings/conversations # 전체 대화 삭제
```

---

## 우선순위 및 일정

| 단계 | 기능 | 우선순위 | 상태 |
|------|------|----------|------|
| 2.3 | 하이브리드 검색 | 중간 | 완료 |
| 2.3 | 검색 결과 재순위화 | 낮음 | 완료 |
| 2.4 | 관리자 대시보드 | 중간 | 완료 |
| 3.3 | 반응형 모바일 UI | 중간 | 완료 |
| 3.3 | 대화 내보내기 | 중간 | 완료 |
| 4.1 | 멀티모달 (Claude Vision) | 중간 | 완료 |
| 3.3 | 사용자 설정 페이지 | 중간 | 완료 |
| 4.2 | 고급 분석 대시보드 | 중간 | 완료 |
| 4.1 | 음성 입력/출력 | 낮음 | 예정 |
| 4.3 | 기업용 기능 | 낮음 | 예정 |
