# n8n Setup for Talk With Legends

## Quick Start

```bash
cd n8n
docker-compose up -d
```

**접속:** http://localhost:5678
- Username: `admin`
- Password: `***REDACTED***`

## 필요한 Credentials 설정

n8n 접속 후 **Settings → Credentials**에서 추가:

### 1. Supabase (PostgreSQL)
- **Name:** `Supabase PostgreSQL`
- **Type:** Postgres
- **Host:** `db.xxx.supabase.co`
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** `[your-password]`
- **Port:** `5432`
- **SSL:** Enable

### 2. Apify
- **Name:** `Apify API`
- **Type:** HTTP Header Auth
- **Header Name:** `Authorization`
- **Header Value:** `Bearer [your-apify-token]`

### 3. OpenAI (Embeddings)
- **Name:** `OpenAI`
- **Type:** OpenAI API
- **API Key:** `sk-...`

### 4. Anthropic (Claude)
- **Name:** `Anthropic`
- **Type:** HTTP Header Auth
- **Header Name:** `x-api-key`
- **Header Value:** `sk-ant-...`

## Workflows 구조

```
workflows/
├── 01-youtube-collector.json       # YouTube 트랜스크립트 수집 (6시간마다)
├── 02-blog-collector.json          # 블로그 수집 (범용)
├── 02b-vitalik-collector.json      # Vitalik Buterin 블로그
├── 02c-gates-collector.json        # Gates Notes 블로그
├── 02d-altman-collector.json       # Sam Altman 블로그
├── 03-twitter-collector.json       # Twitter/X 수집 (12시간마다)
├── 04-news-collector.json          # 뉴스/인터뷰 수집 (매일)
├── 05-document-processor.json      # 문서 처리 & 청킹 (15분마다)
├── 06-embedding-generator.json     # 벡터 임베딩 생성 (30분마다)
├── 07-characteristic-extractor.json # 특성 추출 - Claude (4시간마다)
└── 08-backfill-scheduler.json      # 백필 스케줄러 (예정)
```

## Commands

```bash
# 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f n8n

# 중지
docker-compose down

# 재시작
docker-compose restart

# 데이터 포함 완전 삭제
docker-compose down -v
```

## Apify Actors 필요 목록

| Actor | 용도 | 월 비용 (예상) |
|-------|------|--------------|
| `apify/youtube-scraper` | YouTube 메타데이터 | ~$5 |
| `bernardo/youtube-transcript-scraper` | 트랜스크립트 | ~$10 |
| `apify/twitter-scraper` | Twitter/X | ~$20 |
| `apify/web-scraper` | 블로그/뉴스 | ~$10 |

## 문제 해결

### Port 충돌
```bash
# 다른 포트 사용
docker-compose down
# docker-compose.yml에서 포트 변경: "5679:5678"
docker-compose up -d
```

### 권한 문제 (Linux)
```bash
sudo chown -R 1000:1000 ./workflows
```
