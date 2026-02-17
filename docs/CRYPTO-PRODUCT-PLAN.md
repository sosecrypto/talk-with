# Talk With Protocol - Web3 AI Communication Platform

## Product Ideation & Business Plan

---

## 1. 한 줄 요약

**크립토 프로젝트와 커뮤니티 간의 소통을 AI로 자동화하는 B2B2C 플랫폼**

프로젝트의 공식 정보(백서, 블로그, AMA, SNS, 도큐먼트)를 학습한 AI가 커뮤니티의 질문에 24/7 실시간으로 답변하고, 축적된 질문 데이터를 프로젝트에 인사이트로 제공한다.

---

## 2. Problem Statement

### 크립토 프로젝트가 겪는 문제

| 문제 | 현재 상태 | 비용 |
|------|-----------|------|
| **반복 질문 폭주** | Discord/Telegram에 같은 질문이 하루 수백 건 | 커뮤니티 매니저 3-5명 상시 필요 |
| **시차/언어 장벽** | 글로벌 커뮤니티 → 24/7 대응 불가 | 다국어 인력 채용 비용 |
| **정보 분산** | 백서, 블로그, Twitter, Discord가 각각 존재 | 유저가 정보를 못 찾음 |
| **커뮤니케이션 지연** | CEO/Founder AMA는 월 1회 정도 | 질문이 쌓이고 유저 이탈 |
| **커뮤니티 인사이트 부재** | 유저가 뭘 궁금해하는지 파악 불가 | 제품 방향성 미스매치 |

### 유저가 겪는 문제

- 프로젝트에 대해 궁금한 점이 있어도 **답을 얻기까지 시간이 오래 걸림**
- Discord에서 질문해도 **모더레이터의 주관적 답변**을 받음
- 백서를 읽어야 하는데 **50-100페이지를 다 읽을 수 없음**
- **영어가 아닌 유저**는 정보 접근이 더 어려움
- CEO/Founder에게 직접 물어보고 싶지만 **접점이 없음**

---

## 3. Solution: Talk With Protocol

### Core Concept

```
┌─────────────────────────────────────────────────────┐
│                 TALK WITH PROTOCOL                   │
│                                                     │
│   "프로젝트의 모든 공식 정보를 학습한 AI와 대화"      │
│                                                     │
│   유저 ←→ AI Persona ←→ 프로젝트 공식 정보(RAG)     │
│                    ↓                                │
│            질문 데이터 축적                           │
│                    ↓                                │
│         프로젝트에 인사이트 대시보드 제공              │
└─────────────────────────────────────────────────────┘
```

### 기존 Talk With Legends와의 차이

| | Talk With Legends | Talk With Protocol |
|---|---|---|
| **대상** | 유명인 (엔터테인먼트) | 크립토 프로젝트 (B2B) |
| **정보 소스** | YouTube, Twitter, 인터뷰 | 백서, Docs, Blog, AMA, Governance |
| **정확성** | "그 사람답게" (엔터) | "공식 정보 기반" (정확성 필수) |
| **수익 모델** | 구독 | SaaS + 토큰 게이팅 |
| **데이터 가치** | 없음 | 질문 데이터 → 프로젝트 인사이트 |
| **인증** | OAuth | Privy (지갑 + 토큰 게이팅) |

---

## 4. Feature Set

### Phase 1: Core Chat (MVP)

#### 4.1 Project Persona Chat

프로젝트별 AI 페르소나와 대화

- **공식 정보 기반 RAG**: 백서, 문서, 블로그, 공지사항 학습
- **CEO/Founder 페르소나**: 해당 인물의 인터뷰, AMA, Twitter 학습
- **실시간 스트리밍**: Claude API 기반 실시간 응답
- **다국어 지원**: 질문 언어로 자동 응답 (AI 네이티브 글로벌)
- **출처 표시**: 모든 답변에 근거 문서 링크 제공

```
[유저] Uniswap v4의 hook이 뭐야?

[Uniswap AI] Hook은 v4에서 도입된 플러그인 시스템입니다.
각 풀의 라이프사이클(swap, add/remove liquidity) 단계에
커스텀 로직을 삽입할 수 있게 해줍니다...

📎 출처: Uniswap v4 Whitepaper (Section 3.2), Hayden Adams AMA (2024.03)
```

#### 4.2 Privy 지갑 인증

- **기본 접근**: 지갑 연결만으로 사용 가능
- **토큰 게이팅**: 프로젝트 토큰 홀더에게 프리미엄 기능 제공
- **NFT 게이팅**: 특정 NFT 보유자 전용 채널
- **Embedded Wallet**: Web2 유저도 이메일로 즉시 사용 가능 (Privy)

#### 4.3 대화 히스토리

- 지갑 기반 대화 기록 저장
- 프로젝트별 대화 분리
- 대화 내보내기 (Markdown)

---

### Phase 2: AMA System

#### 4.4 AI-Powered AMA

기존 AMA의 한계를 AI로 해결

**기존 AMA 문제점:**
- 시간 제한 (1-2시간)
- 질문 수 제한 (20-30개)
- 답변 못 받는 유저 다수
- 끝나면 다시 질문 불가

**Talk With Protocol AMA:**

```
┌─────────────────────────────────────────────────────┐
│                   AMA 2.0 Flow                       │
│                                                     │
│  [Phase A] Pre-AMA (AI 자동 응답)                    │
│  - 유저가 미리 질문 등록                              │
│  - AI가 기존 정보 기반으로 즉시 예비 답변              │
│  - 인기 질문 투표 (토큰 가중치 적용 가능)              │
│                                                     │
│  [Phase B] Live AMA (CEO 직접 답변)                  │
│  - 투표 상위 질문 CEO가 직접 답변                     │
│  - CEO 답변이 실시간으로 AI 지식에 추가               │
│  - AI가 후속 질문 자동 처리                           │
│                                                     │
│  [Phase C] Post-AMA (AI 상시 응답)                   │
│  - CEO 답변 포함한 AI 계속 작동                       │
│  - 새 질문도 AI가 AMA 내용 기반으로 답변              │
│  - "영구 AMA" 효과                                   │
└─────────────────────────────────────────────────────┘
```

#### 4.5 질문 투표 시스템

- 토큰 홀더만 질문 등록 가능 (스팸 방지)
- 토큰 수량 기반 가중 투표 (또는 1인 1표 선택 가능)
- 상위 질문은 AMA에서 우선 답변
- 질문 카테고리: Tokenomics, Roadmap, Technical, Partnership, Governance

---

### Phase 3: Data Intelligence

#### 4.6 프로젝트 대시보드 (B2B)

프로젝트 팀에게 제공하는 인사이트

```
┌─────────────────────────────────────────────────────┐
│            PROJECT INSIGHTS DASHBOARD                │
│                                                     │
│  📊 이번 주 질문 트렌드                               │
│  ┌───────────────────────────────────────────┐       │
│  │ 1. Tokenomics (32%) ████████████          │       │
│  │ 2. Roadmap    (28%) ██████████            │       │
│  │ 3. Technical  (20%) ███████               │       │
│  │ 4. Security   (12%) ████                  │       │
│  │ 5. Partnership (8%) ███                   │       │
│  └───────────────────────────────────────────┘       │
│                                                     │
│  🔥 Hot Questions (답변 불가 / 정보 부족)              │
│  - "v2 마이그레이션 일정?" (87회 질문)                 │
│  - "토큰 언락 스케줄 변경?" (64회 질문)                │
│  - "L2 확장 계획?" (51회 질문)                         │
│                                                     │
│  🌍 지역별 활동                                       │
│  - 한국 35%, 미국 25%, 일본 15%, 유럽 12%             │
│                                                     │
│  😊 감성 분석                                         │
│  - Positive 62% | Neutral 28% | Negative 10%         │
│                                                     │
│  📈 주간 리포트 자동 생성 → Slack/Email 전송            │
└─────────────────────────────────────────────────────┘
```

#### 4.7 미답변 질문 알림

- AI가 답변하지 못한 질문 → 프로젝트에 알림
- 프로젝트가 답변 입력 → AI 지식베이스에 자동 추가
- **피드백 루프**: 질문 → 미답변 감지 → 프로젝트 답변 → AI 학습 → 다음엔 자동 답변

#### 4.8 커뮤니티 헬스 스코어

- 질문 빈도, 감성, 반복률 기반 커뮤니티 건강도 측정
- 경고 알림: 부정적 질문 급증, 질문량 급감 등

---

### Phase 4: Platform Expansion

#### 4.9 프로젝트 간 비교 (유저 기능)

```
[유저] Uniswap이랑 Sushiswap의 수수료 구조 차이 알려줘

[Talk With Protocol] 두 프로젝트의 공식 문서 기반으로 비교해드립니다:

| | Uniswap v3 | Sushiswap |
|---|---|---|
| Swap Fee | 0.01-1% (풀별) | 0.3% (고정) |
| Protocol Fee | 최대 1/N | ... |

📎 출처: Uniswap Docs, Sushiswap Docs
```

#### 4.10 Governance Helper

- 거버넌스 제안서 요약
- 투표 전 AI 브리핑 ("이 제안이 통과되면 어떤 영향이?")
- 과거 유사 제안과 결과 비교

#### 4.11 Widget / Embed SDK

```html
<!-- 프로젝트 웹사이트에 삽입 -->
<script src="https://talkwith.xyz/widget.js"
  data-project="uniswap"
  data-theme="dark"
  data-token-gate="UNI:100">
</script>
```

- 프로젝트 공식 웹사이트에 챗 위젯으로 삽입
- Discord/Telegram 봇 연동
- API 제공 (프로젝트가 자체 UI 구축 가능)

---

## 5. 데이터 소스 (크립토 특화)

### Talk With Legends와의 소스 비교

| Talk With Legends | Talk With Protocol |
|---|---|
| YouTube 인터뷰 | **Whitepaper / Litepaper** |
| Twitter 트윗 | **Governance Proposals (Snapshot/Tally)** |
| 블로그 포스트 | **Project Blog / Mirror** |
| 팟캐스트 | **AMA Transcripts (Discord/Twitter Space)** |
| 실적 발표 | **Token Economics Docs** |
| 뉴스 기사 | **Audit Reports** |
| - | **GitHub Changelogs** |
| - | **Official Documentation** |
| - | **On-chain Data (Treasury, TVL)** |

### 수집 파이프라인

```
┌─────────────────────────────────────────────────────┐
│              DATA COLLECTION (n8n)                    │
│                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ Whitepaper │  │ Governance │  │ Blog/Mirror│    │
│  │ PDF Parser │  │ Snapshot   │  │ RSS/Apify  │    │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │
│        │               │               │           │
│  ┌─────┴──────┐  ┌─────┴──────┐  ┌─────┴──────┐    │
│  │ Docs Site  │  │ Twitter/X  │  │ Discord    │    │
│  │ Scraper    │  │ Apify      │  │ AMA Log    │    │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │
│        │               │               │           │
│  ┌─────┴──────┐  ┌─────┴──────┐  ┌─────┴──────┐    │
│  │ Audit      │  │ GitHub     │  │ On-chain   │    │
│  │ Reports    │  │ Releases   │  │ Dune/API   │    │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │
│        └───────────────┴────┬───────────┘           │
│                             ▼                       │
│     ┌──────────────────────────────────────┐        │
│     │ Cleaner → Chunker → Embedder → Store │        │
│     └──────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

---

## 6. 기술 아키텍처

### 기존 코드베이스 재활용률: ~70%

| 컴포넌트 | 재활용 | 변경 사항 |
|----------|--------|-----------|
| Prisma Schema | 80% | Persona → Project/CEO 모델 추가, 토큰 게이팅 필드 |
| RAG Pipeline | 95% | 동일 (pgvector + HNSW) |
| Chat API | 90% | 프롬프트 수정 (정확성 > 페르소나) |
| n8n Workflows | 60% | 크립토 소스 추가 (Snapshot, Mirror, Docs) |
| Frontend | 50% | 크립토 UI/UX, AMA 기능, 대시보드 |
| Auth | 0% | NextAuth → **Privy** 전환 |

### 새로 추가할 스택

| 기술 | 용도 |
|------|------|
| **Privy** | 지갑 인증 + 토큰 게이팅 + Embedded Wallet |
| **Viem/Wagmi** | 온체인 데이터 조회 (토큰 잔고, NFT 보유 확인) |
| **Snapshot API** | 거버넌스 제안 수집 |
| **Dune Analytics API** | 온체인 메트릭 (TVL, 거래량) |
| **PostHog** | 유저 행동 분석 + 대시보드 |

### 데이터 모델 확장

```prisma
// 프로젝트 (= Persona 대체)
model Project {
  id              String   @id @default(cuid())
  slug            String   @unique  // "uniswap", "aave"
  name            String
  description     String
  category        String   // DeFi, L1, L2, NFT, Gaming, Infra
  chains          String[] // ["ethereum", "polygon", "arbitrum"]
  tokenSymbol     String?  // "UNI"
  tokenAddress    String?  // 0x1f9840...
  tokenChainId    Int?     // 1 (Ethereum)

  // 토큰 게이팅 설정
  gateType        GateType @default(NONE)   // NONE, TOKEN, NFT
  gateMinAmount   String?  // "100" (토큰 최소 보유량)
  gateNftAddress  String?  // NFT 컨트랙트

  // 관계
  ceo             CEO?
  documents       Document[]
  conversations   Conversation[]
  amas            AMA[]
  insights        ProjectInsight[]
}

// CEO/Founder 페르소나
model CEO {
  id              String   @id @default(cuid())
  projectId       String   @unique
  name            String
  title           String   // "CEO & Founder"
  speakingStyle   Json     // 말투, 특성

  project         Project  @relation(fields: [projectId])
}

// AMA 세션
model AMA {
  id              String    @id @default(cuid())
  projectId       String
  title           String
  status          AMAStatus // UPCOMING, PRE_QUESTIONS, LIVE, COMPLETED
  scheduledAt     DateTime
  startedAt       DateTime?
  endedAt         DateTime?

  questions       AMAQuestion[]
  project         Project   @relation(fields: [projectId])
}

// AMA 질문
model AMAQuestion {
  id              String   @id @default(cuid())
  amaId           String
  walletAddress   String
  question        String
  aiAnswer        String?  // AI 예비 답변
  officialAnswer  String?  // CEO 직접 답변
  voteCount       Int      @default(0)
  category        String   // tokenomics, roadmap, technical

  ama             AMA      @relation(fields: [amaId])
  votes           AMAVote[]
}

// 프로젝트 인사이트
model ProjectInsight {
  id              String   @id @default(cuid())
  projectId       String
  period          String   // "2026-W07"
  topQuestions    Json     // [{question, count, category}]
  unanswered      Json     // [{question, count}]
  sentiment       Json     // {positive, neutral, negative}
  regionStats     Json     // {KR: 35, US: 25, ...}
  totalQuestions  Int

  project         Project  @relation(fields: [projectId])
}
```

---

## 7. 비즈니스 모델

### 수익 구조

```
┌─────────────────────────────────────────────────────┐
│                 REVENUE STREAMS                      │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │ 1. B2B SaaS (프로젝트 구독)              │        │
│  │    - Starter: $500/mo (AI 챗봇만)        │        │
│  │    - Pro:   $2,000/mo (+ AMA + 인사이트) │        │
│  │    - Enterprise: Custom                  │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │ 2. Widget/API License                    │        │
│  │    - 프로젝트 웹사이트 삽입형: $300/mo    │        │
│  │    - API 호출량 기반 과금                  │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │ 3. AMA Premium                           │        │
│  │    - AMA 1회 개최: $1,000                 │        │
│  │    - 월간 AMA 패키지: $3,000/mo           │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │ 4. Data Insights Report                  │        │
│  │    - 월간 커뮤니티 리포트: Pro 포함        │        │
│  │    - 심층 분석 리포트: $2,000/회           │        │
│  └─────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

### 타겟 고객

| Tier | 대상 | 예시 | 기대 ARPU |
|------|------|------|-----------|
| **Tier 1** | Top 50 DeFi/L1/L2 | Uniswap, Aave, Arbitrum, Optimism | $3,000-5,000/mo |
| **Tier 2** | Mid-cap Projects | GMX, Pendle, EigenLayer | $1,000-2,000/mo |
| **Tier 3** | Emerging Projects | 신규 런칭 프로젝트 | $500/mo |
| **Tier 4** | DAO/Community | MakerDAO, Lido DAO | $2,000/mo |

### 시장 규모 추정

- 활성 크립토 프로젝트: ~2,000개 (CoinGecko Top 2000)
- 잠재 고객: ~500개 (커뮤니티 매니징이 필요한 규모)
- 초기 목표: 50개 프로젝트 확보
- **TAM**: 500 x $2,000/mo = $12M ARR
- **SAM** (Year 1): 50 x $1,500/mo = $900K ARR

---

## 8. 경쟁 우위 & Moat

### vs 기존 솔루션

| | Discord Bot | Intercom | Talk With Protocol |
|---|---|---|---|
| 크립토 특화 | X | X | O |
| RAG (공식 문서 학습) | X | 일부 | O (핵심) |
| 토큰 게이팅 | X | X | O (Privy) |
| AMA 시스템 | X | X | O |
| 커뮤니티 인사이트 | X | 일부 | O (AI 분석) |
| CEO 페르소나 | X | X | O |
| 다국어 자동 | X | 번역 필요 | O (AI 네이티브) |
| 위젯 삽입 | O | O | O |

### Moat (장기 경쟁력)

1. **데이터 네트워크 효과**: 질문이 쌓일수록 AI가 똑똑해짐 → 유저 경험 향상 → 더 많은 질문
2. **프로젝트 Lock-in**: 축적된 데이터 + 커스텀 설정 → 이탈 비용 높음
3. **크립토 도메인 특화**: 일반 챗봇이 하기 어려운 크립토 용어/개념 이해
4. **Cross-project 데이터**: 여러 프로젝트 데이터 → 비교 분석 → 유저에게 유니크한 가치

---

## 9. Go-to-Market 전략

### Phase 1: 초기 진입 (Month 1-3)

```
1. 무료로 Top 10 프로젝트 페르소나 구축 (Uniswap, Aave, Arbitrum...)
2. 크립토 Twitter/Farcaster에서 데모 바이럴
3. "Vitalik에게 물어보세요" 같은 hook으로 유저 유입
4. 유저 트래픽 데이터를 가지고 프로젝트에 B2B 영업
```

### Phase 2: 프로젝트 온보딩 (Month 4-6)

```
1. 프로젝트가 직접 문서 업로드 → 1시간 내 AI 챗봇 생성
2. Self-serve 온보딩 (Stripe 결제)
3. 프로젝트 웹사이트 위젯 배포
4. AMA 기능 베타 런칭
```

### Phase 3: 스케일 (Month 7-12)

```
1. 100개 프로젝트 온보딩
2. 인사이트 대시보드 고도화
3. Discord/Telegram 봇 연동
4. 자체 토큰 발행 검토 (프로토콜 거버넌스)
```

---

## 10. MVP 개발 범위

### 기존 코드베이스에서 바로 시작 가능

| 작업 | 예상 기간 | 난이도 |
|------|-----------|--------|
| Persona → Project 모델 전환 | 1주 | 낮음 |
| NextAuth → Privy 전환 | 1주 | 중간 |
| 크립토 프로젝트 시드 데이터 (10개) | 3일 | 낮음 |
| 백서/Docs 수집 n8n 워크플로우 | 1주 | 중간 |
| 프롬프트 튜닝 (정확성 중심) | 3일 | 중간 |
| 토큰 게이팅 로직 | 3일 | 중간 |
| UI 크립토 테마 적용 | 1주 | 낮음 |
| **MVP 총 기간** | **~5주** | |

### MVP에서 제외 (Phase 2+)

- AMA 시스템
- 프로젝트 대시보드
- Widget SDK
- Cross-project 비교
- 자체 토큰

---

## 11. 핵심 차별점 정리

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   1. AI-Native Global Communication                 │
│      → 언어 장벽 없이 전 세계 커뮤니티 즉시 소통      │
│                                                     │
│   2. Data Flywheel                                  │
│      → 질문이 쌓일수록 프로젝트와 AI 모두 발전        │
│                                                     │
│   3. 24/7 Always-On AMA                             │
│      → 일회성 이벤트가 아닌 상시 소통 채널             │
│                                                     │
│   4. Project Intelligence                            │
│      → 커뮤니티가 뭘 원하는지 데이터로 파악             │
│                                                     │
│   5. Token-Gated Premium                            │
│      → 토큰 유틸리티 + 스팸 방지 동시 해결             │
│                                                     │
│   6. Zero Communication Cost                        │
│      → 프로젝트는 정보만 넣으면 AI가 알아서 소통       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 12. 리스크 & 대응

| 리스크 | 확률 | 대응 |
|--------|------|------|
| AI 환각 (잘못된 정보 전달) | 높음 | 출처 필수 표시, confidence threshold 엄격화, 모르면 "확인 필요" 응답 |
| 프로젝트 온보딩 저조 | 중간 | 무료 Tier로 시작, 트래픽 먼저 확보 후 B2B |
| 규제 이슈 (투자 조언으로 오인) | 중간 | 면책 문구 필수, 가격/투자 관련 질문 필터링 |
| 데이터 수집 법적 이슈 | 낮음 | 공개 정보만 수집, 프로젝트 동의 후 진행 |
| 경쟁사 진입 | 중간 | 데이터 네트워크 효과로 선점, 빠른 실행 |

---

*Talk With Protocol - Where Communities Meet AI-Powered Transparency*
