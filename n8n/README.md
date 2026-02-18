# n8n Self-Hosted Setup for Talk With Legends

## 개요

Talk With Legends의 데이터 수집 파이프라인은 **n8n Self-Hosted** (Hetzner 서버)를 사용합니다.
Docker Compose로 n8n을 실행하고, 워크플로우 JSON 파일을 import하여 사용합니다.

## Quick Start

```bash
# 1. n8n 컨테이너 시작
npm run n8n:start

# 2. n8n UI 접속 → 초기 계정 생성
# http://YOUR_SERVER_IP:5678

# 3. 환경변수 설정 (.env.local)
N8N_URL=http://YOUR_SERVER_IP:5678
N8N_API_KEY=your-api-key

# 4. 워크플로우 import
npm run n8n:import

# 5. (선택) import + 자동 활성화
npm run n8n:import:activate

# 6. (선택) JSON 유효성만 검증
npm run n8n:import:dry-run
```

## Docker Compose 명령어

```bash
npm run n8n:start   # 컨테이너 시작 (백그라운드)
npm run n8n:stop    # 컨테이너 중지
npm run n8n:logs    # 로그 확인 (실시간)
```

## Hetzner 서버 배포

```bash
# 1. 서버에서 이 저장소 클론
git clone <repo-url>
cd talk-with

# 2. n8n 환경변수 설정
cp n8n/.env.example n8n/.env
# n8n/.env 편집: N8N_WEBHOOK_URL=http://서버IP:5678

# 3. n8n 시작
docker compose -f n8n/docker-compose.yml up -d

# 4. 브라우저에서 http://서버IP:5678 접속 → 계정 생성
```

- **DB**: SQLite (n8n 기본값, Docker volume에 영속 저장)
- **접근**: `http://서버IP:5678` (도메인/SSL 불필요)
- **데이터**: `n8n_data` Docker volume에 저장

## API Key 생성

1. n8n UI 접속 (`http://서버IP:5678`)
2. Settings → API → Create API Key
3. `.env.local`에 `N8N_API_KEY` 설정

## 크레덴셜 설정

n8n UI 접속 후 **Settings → Credentials**에서 아래 4개를 추가하세요.
**이름(Name)은 워크플로우와 정확히 일치해야 합니다.**

### 1. Supabase PostgreSQL
- **Name:** `Supabase PostgreSQL`
- **Type:** Postgres
- **Host:** `db.xxx.supabase.co`
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** `[your-password]`
- **Port:** `5432`
- **SSL:** Enable

### 2. Apify API
- **Name:** `Apify API`
- **Type:** HTTP Header Auth
- **Header Name:** `Authorization`
- **Header Value:** `Bearer [your-apify-token]`

### 3. OpenAI API
- **Name:** `OpenAI API`
- **Type:** HTTP Header Auth
- **Header Name:** `Authorization`
- **Header Value:** `Bearer sk-...`

### 4. Anthropic API
- **Name:** `Anthropic API`
- **Type:** HTTP Header Auth
- **Header Name:** `x-api-key`
- **Header Value:** `sk-ant-...`

## Workflows 구조

```
workflows/
├── 01-youtube-collector.json        # YouTube 트랜스크립트 수집 (6시간마다)
├── 02-blog-collector.json           # 블로그 수집 (범용)
├── 02b-vitalik-collector.json       # Vitalik Buterin 블로그
├── 02c-gates-collector.json         # Gates Notes 블로그
├── 02d-altman-collector.json        # Sam Altman 블로그
├── 03-twitter-collector.json        # Twitter/X 수집 (12시간마다)
├── 04-news-collector.json           # 뉴스/인터뷰 수집 (매일)
├── 04b-vitalik-news-rss.json       # Vitalik 뉴스 RSS (6시간마다)
├── 05-document-processor.json       # 문서 처리 & 청킹 (15분마다)
├── 06-embedding-generator.json      # 벡터 임베딩 생성 (30분마다)
├── 07-characteristic-extractor.json # 특성 추출 - Claude (4시간마다)
└── 08-backfill-scheduler.json       # 백필 스케줄러 (예정)
```

## Apify Actors 필요 목록

| Actor | 용도 | 월 비용 (예상) |
|-------|------|--------------|
| `apify/youtube-scraper` | YouTube 메타데이터 | ~$5 |
| `bernardo/youtube-transcript-scraper` | 트랜스크립트 | ~$10 |
| `apify/twitter-scraper` | Twitter/X | ~$20 |
| `apify/web-scraper` | 블로그/뉴스 | ~$10 |

## 문제 해결

### 크레덴셜 ID 매칭 실패
워크플로우 JSON의 credential ID는 플레이스홀더(`SUPABASE_CREDENTIAL_ID` 등)입니다.
n8n에서 import 후 각 노드의 크레덴셜을 수동으로 연결하세요.

### 컨테이너가 시작되지 않을 때
```bash
# 로그 확인
npm run n8n:logs

# 컨테이너 재시작
npm run n8n:stop && npm run n8n:start
```

### 데이터 백업
```bash
# Docker volume 데이터는 n8n_data에 저장됨
docker volume inspect n8n_data
```
