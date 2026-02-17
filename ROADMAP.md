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
- [ ] 하이브리드 검색 (키워드 + 벡터)
- [ ] 검색 결과 재순위화 (Re-ranking)

### 2.4 페르소나 관리
- [x] 페르소나 목록/상세 API
- [x] 페르소나 선택 UI (프로필 카드)
- [x] 대화 시작 시 페르소나 선택
- [ ] 관리자 대시보드 (CRUD, 수집 상태 모니터링)

---

## Phase 3: UI/UX 고도화 (진행 중)

### 3.1 UI 개선
- [x] 다크모드 지원 (클래스 기반 `.dark`)
- [x] 마크다운 렌더링 (AI 응답, react-markdown)
- [x] Agentation 도구 추가
- [x] API 최적화 (pagination, Cache-Control)
- [x] proxy.ts 인증 전환 (Next.js 16 호환)

### 3.2 코드 품질
- [x] ESLint 설정 및 전체 lint 클린
- [x] Vitest + Testing Library 테스트 인프라 (114개 케이스, 91%+ 커버리지)

### 3.3 미완료
- [ ] 반응형 모바일 UI 최적화
- [ ] 사용자 설정 페이지
- [ ] 대화 내보내기 기능

---

## Phase 4: 고급 기능 (예정)

### 4.1 멀티모달 지원
- [ ] 이미지 분석 (Claude Vision)
- [ ] 음성 입력/출력
- [ ] 비디오 컨텐츠 분석

### 4.2 고급 분석
- [ ] 대화 분석 대시보드
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
GET    /api/personas              # 페르소나 목록
GET    /api/personas/:slug        # 페르소나 상세
POST   /api/chat                  # SSE 스트리밍 채팅
GET    /api/conversations         # 대화 목록 (pagination)
POST   /api/conversations         # 대화 생성
DELETE /api/conversations/:id     # 대화 삭제
POST   /api/rag/search            # 벡터 유사도 검색
POST   /api/upload                # 파일 업로드
```

---

## 우선순위 및 일정

| 단계 | 기능 | 우선순위 | 상태 |
|------|------|----------|------|
| 2.3 | 하이브리드 검색 | 중간 | 예정 |
| 2.3 | 검색 결과 재순위화 | 낮음 | 예정 |
| 2.4 | 관리자 대시보드 | 중간 | 예정 |
| 3.3 | 반응형 모바일 UI | 중간 | 예정 |
| 3.3 | 사용자 설정 페이지 | 낮음 | 예정 |
| 4.1 | 멀티모달 지원 | 중간 | 예정 |
| 4.2 | 대화 분석 | 낮음 | 예정 |
| 4.3 | 기업용 기능 | 낮음 | 예정 |
