# Talk With Legends - 데이터 파이프라인 구현 계획

> **Tier 1 + Tier 2 소스 포함** - YouTube, Twitter, 블로그, 주주서한, 책, 팟캐스트, Earnings Call, 컨퍼런스, Reddit AMA

## n8n + Apify + RAG 아키텍처

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              DATA COLLECTION LAYER                                 │
│                                                                                    │
│  ┌─────────── Tier 1 (핵심) ───────────┐  ┌─────────── Tier 2 (중요) ───────────┐│
│  │ ┌────────┐ ┌────────┐ ┌────────┐   │  │ ┌────────┐ ┌────────┐ ┌────────┐   ││
│  │ │YouTube │ │Twitter │ │ Blog   │   │  │ │Podcast │ │Earnings│ │ Reddit │   ││
│  │ │ Apify  │ │ Apify  │ │ Apify  │   │  │ │Whisper │ │ Calls  │ │  AMA   │   ││
│  │ └────────┘ └────────┘ └────────┘   │  │ └────────┘ └────────┘ └────────┘   ││
│  │ ┌────────┐ ┌────────┐ ┌────────┐   │  │ ┌────────┐                         ││
│  │ │ News   │ │Letters │ │ Books  │   │  │ │Confrnce│                         ││
│  │ │ Apify  │ │  PDF   │ │ Manual │   │  │ │ Talks  │                         ││
│  │ └────────┘ └────────┘ └────────┘   │  │ └────────┘                         ││
│  └────────────────────────────────────┘  └────────────────────────────────────┘│
│                                    │                                            │
│                              n8n Orchestrator                                   │
└────────────────────────────────────┼────────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROCESSING LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Text Cleaner │→ │   Chunker    │→ │  Embedder    │→ │ Char Extract │    │
│  │   (n8n)      │  │   (n8n)      │  │ (OpenAI API) │  │ (Claude API) │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STORAGE LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Supabase (PostgreSQL + pgvector)                  │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │    │
│  │  │ Personas │  │Documents │  │  Chunks  │  │ Characteristics  │    │    │
│  │  └──────────┘  └──────────┘  │ +vectors │  └──────────────────┘    │    │
│  │                              └──────────┘                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RAG & CHAT LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Query Embed  │→ │Vector Search │→ │Prompt Builder│→ │  Claude API  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: 인프라 설정

### 1.1 n8n 설치 (Self-hosted on Docker)

```yaml
# docker-compose.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${N8N_HOST}/
      - GENERIC_TIMEZONE=Asia/Seoul
    volumes:
      - n8n_data:/home/node/.n8n
      - ./local-files:/files

  postgres:
    image: postgres:15
    restart: always
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  n8n_data:
  postgres_data:
```

### 1.2 Apify 계정 설정

```
1. https://apify.com 가입
2. API Token 발급 (Settings → Integrations → API Token)
3. 필요한 Actors 추가:
   - YouTube Transcript Scraper
   - Twitter Scraper
   - Google News Scraper
   - Web Scraper (범용)
```

### 1.3 Supabase pgvector 활성화

```sql
-- Supabase SQL Editor에서 실행

-- 1. pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 테이블 생성 (Prisma 마이그레이션 후 추가)
-- chunks 테이블에 embedding 컬럼 추가
ALTER TABLE "Chunk" ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. HNSW 인덱스 생성 (빠른 유사도 검색)
CREATE INDEX IF NOT EXISTS chunk_embedding_idx
ON "Chunk"
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. 유사도 검색 함수
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(1536),
  persona_slug text,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id text,
  content text,
  document_title text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.content,
    d.title as document_title,
    1 - (c.embedding <=> query_embedding) as similarity
  FROM "Chunk" c
  JOIN "Document" d ON c."documentId" = d.id
  JOIN "Persona" p ON d."personaId" = p.id
  WHERE p.slug = persona_slug
    AND c.embedding IS NOT NULL
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## 전체 데이터 소스 (Tier 1 + Tier 2)

### SourceType Enum

```typescript
enum SourceType {
  // === Tier 1: 핵심 ===
  YOUTUBE_VIDEO           // 인터뷰, 키노트
  YOUTUBE_CHANNEL         // 채널 전체
  TWITTER_PROFILE         // 트위터 계정
  BLOG                    // 개인 블로그
  SHAREHOLDER_LETTER      // 주주서한
  BOOK                    // 책/자서전

  // === Tier 2: 중요 ===
  PODCAST                 // 팟캐스트 출연
  EARNINGS_CALL           // 실적 발표
  CONFERENCE_TALK         // 컨퍼런스 강연
  REDDIT_AMA              // Reddit AMA

  // === 기타 ===
  INTERVIEW_TRANSCRIPT    // 수동 업로드
  CUSTOM                  // 기타
}
```

### 인물별 데이터 소스 매핑

| 인물 | YouTube | Twitter | 블로그 | 주주서한 | 책 | 팟캐스트 | Earnings | Reddit |
|------|:-------:|:-------:|:------:|:-------:|:--:|:-------:|:--------:|:------:|
| **Elon Musk** | ✅ ~200 | ✅ ~50K | ❌ | ❌ | ❌ | ✅ Lex, Rogan | ✅ Tesla | ❌ |
| **Warren Buffett** | ✅ ~50 | ❌ | ❌ | ✅ 47년 | ✅ 5권 | ❌ | ✅ BRK | ❌ |
| **Steve Jobs** | ✅ ~100 | ❌ | ❌ | ❌ | ✅ 전기 | ❌ | ❌ | ❌ |
| **Sam Altman** | ✅ ~80 | ✅ ~10K | ✅ 150개 | ❌ | ❌ | ✅ 다수 | ❌ | ✅ |
| **Bill Gates** | ✅ ~100 | ✅ | ✅ 500개 | ❌ | ✅ 4권 | ❌ | ❌ | ✅ 6회 |
| **Jeff Bezos** | ✅ ~30 | ❌ | ❌ | ✅ 23년 | ❌ | ✅ Lex | ❌ | ❌ |
| **Vitalik Buterin** | ✅ ~80 | ✅ | ✅ 150개 | ❌ | ❌ | ✅ 다수 | ❌ | ✅ |
| **Jensen Huang** | ✅ ~50 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ NVDA | ❌ |
| **Mark Zuckerberg** | ✅ ~100 | ❌ | ✅ FB | ✅ Meta | ❌ | ✅ Lex | ✅ Meta | ❌ |
| **Donald Trump** | ✅ ~200 | ✅ Truth | ❌ | ❌ | ✅ 다수 | ✅ | ❌ | ✅ |
| **이재용** | ✅ ~20 | ❌ | ❌ | ✅ 삼성 | ❌ | ❌ | ✅ 삼성 | ❌ |
| **Larry Page** | ✅ ~20 | ❌ | ❌ | ✅ Alphabet | ❌ | ❌ | ✅ | ❌ |
| **Sergey Brin** | ✅ ~15 | ❌ | ❌ | ✅ Alphabet | ❌ | ❌ | ✅ | ❌ |

### 예상 데이터 볼륨

| 소스 유형 | 문서 수 | 단어 수 | 청크 수 |
|----------|--------|--------|--------|
| YouTube | ~1,000 | ~5M | ~50K |
| Twitter | ~100K tweets | ~2M | ~20K |
| 블로그 | ~1,500 | ~3M | ~30K |
| 팟캐스트 | ~200 | ~4M | ~40K |
| 주주서한 | ~200 | ~1M | ~10K |
| Earnings Calls | ~500 | ~2M | ~20K |
| 책 | ~30 | ~3M | ~30K |
| Reddit AMA | ~50 | ~200K | ~2K |
| **총합** | **~103K** | **~20M** | **~200K** |

---

## Phase 2: 데이터 수집 워크플로우

### 2.1 YouTube 트랜스크립트 수집 워크플로우

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Schedule   │ →  │ Get Persona │ →  │   Apify     │ →  │  Save to    │
│  (Daily)    │    │  Video IDs  │    │  YouTube    │    │  Supabase   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**n8n 워크플로우 JSON:**

```json
{
  "name": "YouTube Transcript Collector",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{ "field": "days", "daysInterval": 1 }]
        }
      }
    },
    {
      "name": "Get Personas with YouTube Sources",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT p.id, p.slug, p.name, s.id as source_id, s.config FROM \"Persona\" p JOIN \"Source\" s ON p.id = s.\"personaId\" WHERE s.type = 'YOUTUBE_VIDEO' AND s.status = 'ACTIVE' AND (s.\"nextFetchAt\" IS NULL OR s.\"nextFetchAt\" <= NOW())"
      }
    },
    {
      "name": "Loop Over Sources",
      "type": "n8n-nodes-base.splitInBatches",
      "parameters": {
        "batchSize": 1
      }
    },
    {
      "name": "Apify YouTube Transcript",
      "type": "n8n-nodes-base.apify",
      "parameters": {
        "actorId": "streamers~youtube-transcript-scraper",
        "input": {
          "videoUrls": "={{ $json.config.videoUrls }}",
          "language": "en"
        }
      }
    },
    {
      "name": "Transform Transcript",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const items = $input.all();\nconst results = [];\n\nfor (const item of items) {\n  const transcript = item.json;\n  \n  // 트랜스크립트 텍스트 합치기\n  const fullText = transcript.transcript\n    .map(t => t.text)\n    .join(' ');\n  \n  results.push({\n    json: {\n      title: transcript.title,\n      videoId: transcript.videoId,\n      url: `https://youtube.com/watch?v=${transcript.videoId}`,\n      content: fullText,\n      publishedAt: transcript.publishedAt,\n      duration: transcript.duration,\n      personaId: item.json.personaId,\n      sourceId: item.json.sourceId\n    }\n  });\n}\n\nreturn results;"
      }
    },
    {
      "name": "Save Document to Supabase",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "Document",
        "columns": "personaId,sourceId,title,rawContent,url,publishedAt,status",
        "additionalFields": {
          "personaId": "={{ $json.personaId }}",
          "sourceId": "={{ $json.sourceId }}",
          "title": "={{ $json.title }}",
          "rawContent": "={{ $json.content }}",
          "url": "={{ $json.url }}",
          "publishedAt": "={{ $json.publishedAt }}",
          "status": "PENDING_PROCESSING"
        }
      }
    },
    {
      "name": "Update Source lastFetchedAt",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "update",
        "table": "Source",
        "updateKey": "id",
        "columns": "lastFetchedAt,nextFetchAt",
        "additionalFields": {
          "lastFetchedAt": "={{ new Date().toISOString() }}",
          "nextFetchAt": "={{ new Date(Date.now() + 7*24*60*60*1000).toISOString() }}"
        }
      }
    }
  ]
}
```

### 2.2 Twitter/X 수집 워크플로우

```json
{
  "name": "Twitter Profile Collector",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": { "interval": [{ "field": "days", "daysInterval": 1 }] }
      }
    },
    {
      "name": "Get Twitter Sources",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT p.id as persona_id, p.slug, s.id as source_id, s.config->>'username' as username FROM \"Persona\" p JOIN \"Source\" s ON p.id = s.\"personaId\" WHERE s.type = 'TWITTER_PROFILE' AND s.status = 'ACTIVE'"
      }
    },
    {
      "name": "Apify Twitter Scraper",
      "type": "n8n-nodes-base.apify",
      "parameters": {
        "actorId": "apidojo~tweet-scraper",
        "input": {
          "handles": ["={{ $json.username }}"],
          "maxItems": 100,
          "includeReplies": false
        }
      }
    },
    {
      "name": "Combine Tweets into Document",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const tweets = $input.all();\n\n// 트윗들을 날짜순으로 정렬하고 합치기\nconst sortedTweets = tweets\n  .map(t => t.json)\n  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));\n\nconst content = sortedTweets\n  .map(t => `[${t.createdAt}] ${t.text}`)\n  .join('\\n\\n---\\n\\n');\n\nreturn [{\n  json: {\n    title: `Twitter Posts - ${$json.username} - ${new Date().toISOString().split('T')[0]}`,\n    content: content,\n    tweetCount: sortedTweets.length,\n    personaId: $json.persona_id,\n    sourceId: $json.source_id\n  }\n}];"
      }
    },
    {
      "name": "Save to Database",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "Document"
      }
    }
  ]
}
```

### 2.3 뉴스/인터뷰 수집 워크플로우

```json
{
  "name": "News & Interview Collector",
  "nodes": [
    {
      "name": "Schedule Weekly",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": { "interval": [{ "field": "weeks", "weeksInterval": 1 }] }
      }
    },
    {
      "name": "Get Personas",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT id, slug, name FROM \"Persona\" WHERE \"isActive\" = true"
      }
    },
    {
      "name": "Apify Google News Scraper",
      "type": "n8n-nodes-base.apify",
      "parameters": {
        "actorId": "lhotanok~google-news-scraper",
        "input": {
          "queries": ["={{ $json.name }} interview", "={{ $json.name }} speech"],
          "language": "en",
          "maxItems": 20
        }
      }
    },
    {
      "name": "Filter & Extract Content",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// 중복 제거 및 관련성 필터링\nconst articles = $input.all().map(i => i.json);\nconst seen = new Set();\nconst unique = [];\n\nfor (const article of articles) {\n  if (!seen.has(article.url)) {\n    seen.add(article.url);\n    unique.push(article);\n  }\n}\n\nreturn unique.map(a => ({ json: a }));"
      }
    },
    {
      "name": "Apify Web Scraper - Article Content",
      "type": "n8n-nodes-base.apify",
      "parameters": {
        "actorId": "apify~web-scraper",
        "input": {
          "startUrls": [{ "url": "={{ $json.url }}" }],
          "pageFunction": "async function pageFunction(context) { return { content: document.querySelector('article')?.innerText || document.body.innerText }; }"
        }
      }
    },
    {
      "name": "Save Articles",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "Document"
      }
    }
  ]
}
```

### 2.4 블로그 수집 워크플로우 (Tier 1)

```json
{
  "name": "Blog Collector",
  "nodes": [
    {
      "name": "Schedule Weekly",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": { "interval": [{ "field": "weeks", "weeksInterval": 1 }] }
      }
    },
    {
      "name": "Get Blog Sources",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT p.id as persona_id, p.slug, s.id as source_id, s.config->>'blogUrl' as blog_url, s.config->>'selectors' as selectors FROM \"Persona\" p JOIN \"Source\" s ON p.id = s.\"personaId\" WHERE s.type = 'BLOG' AND s.status = 'ACTIVE'"
      }
    },
    {
      "name": "Apify Web Scraper - Blog Posts",
      "type": "n8n-nodes-base.apify",
      "parameters": {
        "actorId": "apify/web-scraper",
        "input": {
          "startUrls": [{ "url": "={{ $json.blog_url }}" }],
          "linkSelector": "a[href*='/post'], a[href*='/article'], article a, .post-link",
          "maxRequestsPerCrawl": 500,
          "pageFunction": "async function pageFunction(context) {\n  const { $, request } = context;\n  const isArticle = $('article').length > 0 || $('.post-content').length > 0;\n  if (!isArticle) return null;\n  return {\n    url: request.url,\n    title: $('h1').first().text().trim(),\n    content: $('article, .post-content, .entry-content').text().trim(),\n    date: $('time').attr('datetime') || $('.date').text(),\n  };\n}"
        }
      }
    },
    {
      "name": "Filter New Posts",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// 이미 수집된 URL 필터링\nconst posts = $input.all().filter(p => p.json.content && p.json.content.length > 100);\nreturn posts;"
      }
    },
    {
      "name": "Save Blog Posts",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "Document",
        "columns": "personaId,sourceId,title,rawContent,url,publishedAt,status"
      }
    }
  ]
}
```

**블로그 URL 설정:**

| 인물 | 블로그 URL | 예상 게시물 |
|------|-----------|------------|
| Sam Altman | `blog.samaltman.com` | ~150 |
| Bill Gates | `gatesnotes.com` | ~500 |
| Vitalik Buterin | `vitalik.eth.limo` | ~150 |
| Paul Graham | `paulgraham.com/articles.html` | ~200 |

### 2.5 팟캐스트 수집 워크플로우 (Tier 2)

```
┌─────────────────────────────────────────────────────────────────┐
│  Podcast Collection Pipeline                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ YouTube/     │ →  │ Whisper API  │ →  │ Speaker      │      │
│  │ Spotify URL  │    │ Transcribe   │    │ Diarization  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

```json
{
  "name": "Podcast Collector",
  "nodes": [
    {
      "name": "Get Podcast Sources",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT p.id as persona_id, p.name, s.id as source_id, s.config FROM \"Persona\" p JOIN \"Source\" s ON p.id = s.\"personaId\" WHERE s.type = 'PODCAST' AND s.status = 'ACTIVE'"
      }
    },
    {
      "name": "Apify YouTube Transcript (for video podcasts)",
      "type": "n8n-nodes-base.apify",
      "parameters": {
        "actorId": "streamers~youtube-transcript-scraper",
        "input": {
          "videoUrls": "={{ $json.config.youtubeUrls }}",
          "language": "en"
        }
      }
    },
    {
      "name": "For Audio-Only: Download & Whisper",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.openai.com/v1/audio/transcriptions",
        "headers": {
          "Authorization": "Bearer {{ $credentials.openaiApi.apiKey }}"
        },
        "bodyContentType": "multipart-form-data",
        "body": {
          "model": "whisper-1",
          "file": "={{ $binary.audioFile }}",
          "response_format": "verbose_json",
          "timestamp_granularities": ["segment"]
        }
      }
    },
    {
      "name": "Format Transcript with Timestamps",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const transcript = $json;\nconst segments = transcript.segments || [];\n\n// 세그먼트를 텍스트로 변환\nconst content = segments.map(seg => {\n  const time = new Date(seg.start * 1000).toISOString().substr(11, 8);\n  return `[${time}] ${seg.text}`;\n}).join('\\n');\n\nreturn [{\n  json: {\n    title: $json.podcastTitle,\n    content: content,\n    duration: transcript.duration,\n    personaId: $json.persona_id,\n    sourceId: $json.source_id\n  }\n}];"
      }
    },
    {
      "name": "Save Podcast Document",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "Document"
      }
    }
  ]
}
```

**주요 팟캐스트 목록:**

| 팟캐스트 | 출연 인물 | 에피소드 수 |
|----------|----------|------------|
| **Lex Fridman Podcast** | Musk (2), Zuck, Altman, Bezos | ~10 |
| **Joe Rogan Experience** | Musk (3), Zuck | ~5 |
| **All-In Podcast** | Tech 리더들 | ~20 |
| **Tim Ferriss Show** | 다수 | ~15 |
| **How I Built This** | 창업자들 | ~10 |
| **Acquired** | 기업 역사 | ~5 |

### 2.6 Earnings Call 수집 워크플로우 (Tier 2)

```json
{
  "name": "Earnings Call Collector",
  "nodes": [
    {
      "name": "Schedule Quarterly",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": { "interval": [{ "field": "months", "monthsInterval": 3 }] }
      }
    },
    {
      "name": "Get CEO Personas with Earnings Sources",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT p.id, p.slug, p.name, s.config->>'ticker' as ticker, s.config->>'company' as company FROM \"Persona\" p JOIN \"Source\" s ON p.id = s.\"personaId\" WHERE s.type = 'EARNINGS_CALL' AND s.status = 'ACTIVE'"
      }
    },
    {
      "name": "Apify Seeking Alpha Scraper",
      "type": "n8n-nodes-base.apify",
      "parameters": {
        "actorId": "apify/web-scraper",
        "input": {
          "startUrls": [{
            "url": "https://seekingalpha.com/symbol/{{ $json.ticker }}/earnings/transcripts"
          }],
          "maxRequestsPerCrawl": 50,
          "pageFunction": "async function pageFunction(context) {\n  const { $, request } = context;\n  if (request.url.includes('/transcripts/')) {\n    return {\n      title: $('h1').text(),\n      content: $('.sa-art').text(),\n      date: $('time').attr('datetime'),\n      url: request.url\n    };\n  }\n  return null;\n}"
        }
      }
    },
    {
      "name": "Alternative: The Motley Fool",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://www.fool.com/earnings-call-transcripts/?ticker={{ $json.ticker }}"
      }
    },
    {
      "name": "Extract CEO Statements Only",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// CEO 발언만 추출\nconst transcript = $json.content;\nconst ceoName = $json.ceoName;\n\n// CEO 발언 패턴 매칭\nconst ceoPattern = new RegExp(`${ceoName}[:\\\\s-]+([^]+?)(?=\\\\n[A-Z][a-z]+ [A-Z]|$)`, 'gi');\nconst ceoStatements = [];\nlet match;\n\nwhile ((match = ceoPattern.exec(transcript)) !== null) {\n  ceoStatements.push(match[1].trim());\n}\n\nreturn [{\n  json: {\n    ...item.json,\n    ceoContent: ceoStatements.join('\\n\\n---\\n\\n'),\n    statementCount: ceoStatements.length\n  }\n}];"
      }
    },
    {
      "name": "Save Earnings Call",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "Document"
      }
    }
  ]
}
```

**Earnings Call 대상 기업:**

| 인물 | 회사 | Ticker | 분기별 |
|------|------|--------|-------|
| Elon Musk | Tesla | TSLA | ✅ |
| Jensen Huang | NVIDIA | NVDA | ✅ |
| Mark Zuckerberg | Meta | META | ✅ |
| Sundar Pichai | Alphabet | GOOGL | ✅ |
| Tim Cook | Apple | AAPL | ✅ |
| 이재용 | 삼성전자 | 005930.KS | ✅ |

### 2.7 Reddit AMA 수집 워크플로우 (Tier 2)

```json
{
  "name": "Reddit AMA Collector",
  "nodes": [
    {
      "name": "Manual Trigger (One-time Backfill)",
      "type": "n8n-nodes-base.manualTrigger"
    },
    {
      "name": "Define AMA URLs",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "amas": [
            {
              "persona": "bill-gates",
              "urls": [
                "https://www.reddit.com/r/IAmA/comments/18bhme/im_bill_gates/",
                "https://www.reddit.com/r/IAmA/comments/49jkhn/im_bill_gates/",
                "https://www.reddit.com/r/IAmA/comments/5whpqs/im_bill_gates/",
                "https://www.reddit.com/r/IAmA/comments/aunv58/im_bill_gates/",
                "https://www.reddit.com/r/IAmA/comments/ut7yj0/im_bill_gates/",
                "https://www.reddit.com/r/IAmA/comments/18jv42r/im_bill_gates/"
              ]
            },
            {
              "persona": "sam-altman",
              "urls": [
                "https://www.reddit.com/r/ChatGPT/comments/zy0zov/openai_ceo_sam_altman_answers/"
              ]
            },
            {
              "persona": "vitalik-buterin",
              "urls": [
                "https://www.reddit.com/r/ethereum/comments/ajc9ip/ama_we_are_the_eth_20_research_team/"
              ]
            }
          ]
        }
      }
    },
    {
      "name": "Apify Reddit Scraper",
      "type": "n8n-nodes-base.apify",
      "parameters": {
        "actorId": "trudax/reddit-scraper",
        "input": {
          "startUrls": "={{ $json.urls.map(u => ({ url: u })) }}",
          "maxItems": 500,
          "includeComments": true
        }
      }
    },
    {
      "name": "Extract Author Responses Only",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const post = $json;\nconst authorName = post.author; // OP (AMA 주최자)\n\n// OP의 답변만 필터링\nconst authorComments = post.comments\n  .filter(c => c.author === authorName)\n  .map(c => ({\n    question: c.parent_body || 'N/A',\n    answer: c.body,\n    score: c.score\n  }))\n  .sort((a, b) => b.score - a.score); // 인기순 정렬\n\n// Q&A 형식으로 구성\nconst content = authorComments.map(qa => \n  `**Q:** ${qa.question}\\n\\n**A:** ${qa.answer}\\n\\n---`\n).join('\\n\\n');\n\nreturn [{\n  json: {\n    title: `Reddit AMA: ${post.title}`,\n    content: content,\n    url: post.url,\n    date: post.created_utc,\n    qaCount: authorComments.length,\n    personaSlug: $json.personaSlug\n  }\n}];"
      }
    },
    {
      "name": "Save AMA Document",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "Document"
      }
    }
  ]
}
```

### 2.8 컨퍼런스 강연 수집 워크플로우 (Tier 2)

```json
{
  "name": "Conference Talk Collector",
  "nodes": [
    {
      "name": "Get Conference Sources",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT p.id, p.name, s.config->>'conferences' as conferences FROM \"Persona\" p JOIN \"Source\" s ON p.id = s.\"personaId\" WHERE s.type = 'CONFERENCE_TALK'"
      }
    },
    {
      "name": "Search YouTube for Conference Talks",
      "type": "n8n-nodes-base.apify",
      "parameters": {
        "actorId": "bernardo~youtube-channel-scraper",
        "input": {
          "searchKeywords": "={{ $json.name }} {{ $json.conference }} keynote OR speech OR talk",
          "maxResults": 50,
          "sortBy": "relevance"
        }
      }
    },
    {
      "name": "Get Transcripts",
      "type": "n8n-nodes-base.apify",
      "parameters": {
        "actorId": "streamers~youtube-transcript-scraper"
      }
    },
    {
      "name": "Save Conference Talks",
      "type": "n8n-nodes-base.postgres"
    }
  ]
}
```

**주요 컨퍼런스:**

| 컨퍼런스 | 관련 인물 |
|----------|----------|
| **TED / TEDx** | Gates, Bezos, Musk |
| **GTC (NVIDIA)** | Jensen Huang |
| **WWDC (Apple)** | (Steve Jobs 과거) |
| **F8 / Meta Connect** | Zuckerberg |
| **AWS re:Invent** | (Bezos 과거) |
| **Devcon (Ethereum)** | Vitalik |
| **Y Combinator Startup School** | Altman, PG |
| **All Things D / Code Conference** | Jobs, Musk, Gates |

---

## Phase 3: 텍스트 처리 파이프라인

### 3.1 문서 처리 워크플로우 (Webhook 트리거)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Webhook    │ →  │   Clean     │ →  │   Chunk     │ →  │  Embed &    │
│ (New Doc)   │    │   Text      │    │   Text      │    │  Extract    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**n8n 코드 노드 - 텍스트 정제:**

```javascript
// Text Cleaner Node
const text = $json.rawContent;

// HTML 태그 제거
let cleaned = text.replace(/<[^>]*>/g, '');

// HTML 엔티티 디코딩
cleaned = cleaned
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&nbsp;/g, ' ');

// URL 제거 (선택적)
cleaned = cleaned.replace(/https?:\/\/\S+/g, '[URL]');

// 과도한 공백 정리
cleaned = cleaned
  .replace(/\s+/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

return [{
  json: {
    ...item.json,
    cleanContent: cleaned,
    wordCount: cleaned.split(/\s+/).length
  }
}];
```

**n8n 코드 노드 - 청킹:**

```javascript
// Chunker Node
const text = $json.cleanContent;
const MAX_CHUNK_SIZE = 1500;  // characters
const MIN_CHUNK_SIZE = 200;
const OVERLAP_SIZE = 100;

const paragraphs = text.split(/\n\n+/);
const chunks = [];

let currentChunk = '';
let chunkIndex = 0;

for (const paragraph of paragraphs) {
  // 현재 청크 + 새 단락이 최대 크기를 초과하면
  if (currentChunk.length + paragraph.length > MAX_CHUNK_SIZE) {
    // 현재 청크가 최소 크기를 충족하면 저장
    if (currentChunk.length >= MIN_CHUNK_SIZE) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex,
        charCount: currentChunk.length
      });
      chunkIndex++;

      // 오버랩 적용
      const overlapText = currentChunk.slice(-OVERLAP_SIZE);
      currentChunk = overlapText + '\n\n' + paragraph;
    }
  } else {
    currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
  }
}

// 마지막 청크 저장
if (currentChunk.length >= MIN_CHUNK_SIZE) {
  chunks.push({
    content: currentChunk.trim(),
    index: chunkIndex,
    charCount: currentChunk.length
  });
}

return chunks.map(chunk => ({
  json: {
    documentId: $json.documentId,
    personaId: $json.personaId,
    ...chunk
  }
}));
```

### 3.2 임베딩 생성 워크플로우

```json
{
  "name": "Generate Embeddings",
  "nodes": [
    {
      "name": "Get Pending Chunks",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT c.id, c.content, c.\"documentId\" FROM \"Chunk\" c WHERE c.embedding IS NULL LIMIT 100"
      }
    },
    {
      "name": "Batch Chunks",
      "type": "n8n-nodes-base.splitInBatches",
      "parameters": {
        "batchSize": 20
      }
    },
    {
      "name": "OpenAI Embeddings API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.openai.com/v1/embeddings",
        "authentication": "genericCredentialType",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "model": "text-embedding-3-small",
          "input": "={{ $json.content }}",
          "dimensions": 1536
        }
      }
    },
    {
      "name": "Update Chunk with Embedding",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE \"Chunk\" SET embedding = $1::vector WHERE id = $2",
        "values": [
          "={{ JSON.stringify($json.data[0].embedding) }}",
          "={{ $json.chunkId }}"
        ]
      }
    }
  ]
}
```

### 3.3 특성 추출 워크플로우 (Claude API)

```json
{
  "name": "Extract Persona Characteristics",
  "nodes": [
    {
      "name": "Get Processed Documents",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT d.id, d.\"personaId\", d.\"cleanContent\", p.name as persona_name FROM \"Document\" d JOIN \"Persona\" p ON d.\"personaId\" = p.id WHERE d.status = 'PROCESSED' AND d.id NOT IN (SELECT DISTINCT \"documentId\" FROM \"PersonaCharacteristic\" WHERE \"documentId\" IS NOT NULL) LIMIT 10"
      }
    },
    {
      "name": "Claude API - Extract Characteristics",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://api.anthropic.com/v1/messages",
        "headers": {
          "x-api-key": "={{ $credentials.anthropicApi.apiKey }}",
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        "body": {
          "model": "claude-sonnet-4-20250514",
          "max_tokens": 4096,
          "system": "You are an expert at analyzing text to extract personality characteristics, opinions, speaking patterns, and notable quotes from specific individuals. Return only valid JSON.",
          "messages": [{
            "role": "user",
            "content": "Analyze the following text from/about {{ $json.persona_name }} and extract their characteristics:\n\n---\n{{ $json.cleanContent.substring(0, 8000) }}\n---\n\nReturn a JSON array with this structure:\n[{\n  \"category\": \"opinion|style|belief|catchphrase|anecdote\",\n  \"topic\": \"optional topic area\",\n  \"content\": \"the characteristic\",\n  \"confidence\": 0.8,\n  \"quote\": \"original quote if available\"\n}]"
          }]
        }
      }
    },
    {
      "name": "Parse and Save Characteristics",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const response = $json.content[0].text;\nlet characteristics = [];\n\ntry {\n  // JSON 배열 추출\n  const jsonMatch = response.match(/\\[[\\s\\S]*\\]/);\n  if (jsonMatch) {\n    characteristics = JSON.parse(jsonMatch[0]);\n  }\n} catch (e) {\n  console.error('Failed to parse:', e);\n}\n\nreturn characteristics.map(char => ({\n  json: {\n    personaId: $json.personaId,\n    documentId: $json.documentId,\n    category: char.category,\n    topic: char.topic,\n    content: char.content,\n    confidence: char.confidence || 0.5\n  }\n}));"
      }
    },
    {
      "name": "Insert Characteristics",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "PersonaCharacteristic"
      }
    }
  ]
}
```

---

## Phase 4: RAG 시스템 통합

### 4.1 Next.js API 라우트 - RAG 검색

```typescript
// src/app/api/rag/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI()

export async function POST(request: NextRequest) {
  try {
    const { query, personaSlug, topK = 5 } = await request.json()

    // 1. 쿼리 임베딩 생성
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      dimensions: 1536
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // 2. 벡터 유사도 검색
    const { data: chunks, error } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      persona_slug: personaSlug,
      match_threshold: 0.65,
      match_count: topK
    })

    if (error) throw error

    return NextResponse.json({
      success: true,
      chunks: chunks || [],
      query,
      personaSlug
    })

  } catch (error) {
    console.error('RAG search error:', error)
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}
```

### 4.2 시스템 프롬프트 생성

```typescript
// src/lib/prompt-generator.ts

import { prisma } from '@/lib/prisma'

interface RAGContext {
  chunks: Array<{
    content: string
    document_title: string
    similarity: number
  }>
}

export async function generatePersonaPrompt(
  personaSlug: string,
  ragContext?: RAGContext
): Promise<string> {
  // 1. 페르소나 기본 정보 조회
  const persona = await prisma.persona.findUnique({
    where: { slug: personaSlug },
    include: {
      characteristics: {
        where: { confidence: { gte: 0.6 } },
        orderBy: { confidence: 'desc' },
        take: 30
      }
    }
  })

  if (!persona) throw new Error('Persona not found')

  // 2. 특성 분류
  const opinions = persona.characteristics.filter(c => c.category === 'opinion')
  const styles = persona.characteristics.filter(c => c.category === 'style')
  const beliefs = persona.characteristics.filter(c => c.category === 'belief')
  const catchphrases = persona.characteristics.filter(c => c.category === 'catchphrase')

  // 3. 프롬프트 생성
  let prompt = `You are ${persona.name}${persona.nameKo ? ` (${persona.nameKo})` : ''}.

## Identity
${persona.bio || `You are ${persona.name}, a notable figure known for your unique perspectives and contributions.`}

## Communication Style
${styles.map(s => `- ${s.content}`).join('\n') || '- Speak authentically and consistently with your known personality.'}

## Core Beliefs & Values
${beliefs.map(b => `- ${b.content}`).join('\n') || '- Stay true to your documented principles and worldview.'}

## Key Opinions
${opinions.slice(0, 10).map(o => `- ${o.topic ? `[${o.topic}] ` : ''}${o.content}`).join('\n')}

## Signature Phrases
${catchphrases.map(c => `- "${c.content}"`).join('\n') || '- Use your characteristic expressions naturally.'}
`

  // 4. RAG 컨텍스트 추가
  if (ragContext?.chunks?.length) {
    prompt += `
## Relevant Context from Your Actual Statements
The following are excerpts from your interviews, writings, and speeches that are relevant to this conversation:

${ragContext.chunks.map(chunk => `---
${chunk.content}
(Source: ${chunk.document_title})
---`).join('\n\n')}
`
  }

  // 5. 행동 지침
  prompt += `
## Instructions
1. Respond as ${persona.name} would, using their characteristic speaking style
2. Draw upon the relevant context provided above when applicable
3. Maintain known opinions and viewpoints on topics
4. Use first-person perspective ("I", "my", "me")
5. If asked about something outside your knowledge, respond as you would plausibly respond based on your known values
6. Never break character or acknowledge being an AI
7. Use your typical expressions and phrases naturally
`

  return prompt
}
```

### 4.3 수정된 Chat API

```typescript
// src/app/api/chat/route.ts (수정)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { anthropic } from '@/lib/anthropic'
import { generatePersonaPrompt } from '@/lib/prompt-generator'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId, personaSlug } = await request.json()

    // ... 기존 대화 처리 로직 ...

    // RAG 검색 수행
    let ragContext = null
    if (personaSlug) {
      const ragResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/rag/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: message,
          personaSlug,
          topK: 5
        })
      })
      const ragData = await ragResponse.json()
      if (ragData.success) {
        ragContext = { chunks: ragData.chunks }
      }
    }

    // 동적 시스템 프롬프트 생성
    const systemPrompt = personaSlug
      ? await generatePersonaPrompt(personaSlug, ragContext)
      : 'You are a helpful assistant.'

    // Claude API 호출
    const messageStream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages,
    })

    // ... 스트리밍 응답 처리 ...

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Phase 5: 스케줄 및 모니터링

### 5.1 n8n 워크플로우 스케줄

| 워크플로우 | 주기 | 설명 |
|-----------|------|------|
| YouTube Collector | 매일 02:00 | 새 영상 트랜스크립트 수집 |
| Twitter Collector | 매일 06:00 | 최근 트윗 수집 |
| News Collector | 매주 월요일 03:00 | 뉴스/인터뷰 기사 수집 |
| Document Processor | 매 15분 | 대기 중인 문서 처리 |
| Embedding Generator | 매 30분 | 임베딩 없는 청크 처리 |
| Characteristic Extractor | 매일 04:00 | 특성 추출 (Claude API) |

### 5.2 모니터링 대시보드

```sql
-- 파이프라인 상태 조회 쿼리

-- 문서 상태별 카운트
SELECT status, COUNT(*)
FROM "Document"
GROUP BY status;

-- 임베딩 진행률
SELECT
  COUNT(*) FILTER (WHERE embedding IS NOT NULL) as embedded,
  COUNT(*) FILTER (WHERE embedding IS NULL) as pending,
  ROUND(COUNT(*) FILTER (WHERE embedding IS NOT NULL)::numeric / COUNT(*)::numeric * 100, 2) as progress_pct
FROM "Chunk";

-- 페르소나별 데이터 현황
SELECT
  p.name,
  COUNT(DISTINCT d.id) as documents,
  COUNT(DISTINCT c.id) as chunks,
  COUNT(DISTINCT pc.id) as characteristics
FROM "Persona" p
LEFT JOIN "Document" d ON p.id = d."personaId"
LEFT JOIN "Chunk" c ON d.id = c."documentId"
LEFT JOIN "PersonaCharacteristic" pc ON p.id = pc."personaId"
GROUP BY p.id, p.name
ORDER BY documents DESC;
```

---

## Phase 6: 구현 타임라인

### Week 0: Initial Backfill (과거 데이터 일괄 수집)
```
Day 1-2: YouTube 과거 영상 전체 수집 (~1,000개)
Day 3:   Twitter 과거 트윗 수집 (~100K 트윗)
Day 4:   블로그 전체 게시물 수집 (~1,500개)
Day 5:   주주서한 PDF 다운로드 & 파싱
Day 6:   팟캐스트 트랜스크립트 수집 (~200개)
Day 7:   처리 파이프라인 실행 (청킹, 임베딩)
```

### Sprint 1: 인프라 (1주)
- [ ] n8n Docker 설치 및 설정
- [ ] Apify 계정 설정 및 Actor 테스트
- [ ] Supabase pgvector 활성화
- [ ] Prisma 스키마 확장 및 마이그레이션
- [ ] OpenAI Whisper API 설정

### Sprint 2: Tier 1 수집 워크플로우 (1주)
- [ ] YouTube 트랜스크립트 수집
- [ ] Twitter 수집
- [ ] 블로그 수집
- [ ] 뉴스/인터뷰 수집
- [ ] 주주서한 PDF 파싱
- [ ] 수동 업로드 API (책)

### Sprint 3: Tier 2 수집 워크플로우 (1주)
- [ ] 팟캐스트 수집 (Whisper 연동)
- [ ] Earnings Call 트랜스크립트
- [ ] 컨퍼런스 강연
- [ ] Reddit AMA

### Sprint 4: 처리 파이프라인 (1주)
- [ ] 텍스트 정제 워크플로우
- [ ] 청킹 워크플로우
- [ ] 임베딩 생성 워크플로우
- [ ] 특성 추출 워크플로우

### Sprint 5: RAG 통합 (1주)
- [ ] 벡터 검색 API
- [ ] 시스템 프롬프트 생성기
- [ ] Chat API RAG 통합
- [ ] 테스트 및 최적화

### Sprint 6: 최적화 & 모니터링 (1주)
- [ ] 스케줄러 설정 (정기 업데이트)
- [ ] 에러 핸들링 & 알림
- [ ] 품질 모니터링 대시보드
- [ ] A/B 테스트 설정

---

## 비용 추정 (Tier 1 + Tier 2)

### 초기 Backfill 비용 (1회성)

| 항목 | 수량 | 비용 |
|------|------|------|
| Apify (YouTube, Twitter, Web) | ~5,000 runs | ~$30 |
| OpenAI Whisper (팟캐스트) | ~100시간 | ~$60 |
| OpenAI Embeddings | ~20M tokens | ~$2 |
| Claude (특성 추출) | ~2M tokens | ~$15 |
| **초기 총 비용** | | **~$110** |

### 월간 운영 비용

| 서비스 | 사용량 | 월 비용 |
|--------|--------|---------|
| VPS (n8n 호스팅) | 2GB RAM | $10-20 |
| Apify | 100 Actor runs/day | $49 |
| OpenAI Whisper | ~10시간/월 | ~$6 |
| OpenAI Embeddings | ~1M tokens/월 | ~$0.10 |
| Claude API | ~500K tokens/월 | ~$15 |
| Supabase Pro | 8GB + pgvector | $25 |
| **월간 총 비용** | | **~$100-120** |

---

## 전체 스케줄 요약

| 워크플로우 | 주기 | 대상 |
|-----------|------|------|
| YouTube Collector | 매일 02:00 | 새 영상 |
| Twitter Collector | 매일 06:00 | 새 트윗 |
| Blog Collector | 매주 월 03:00 | 새 게시물 |
| News Collector | 매주 월 04:00 | 새 기사 |
| Podcast Collector | 매주 수 02:00 | 새 에피소드 |
| Earnings Call | 분기별 | 실적 발표 후 |
| Document Processor | 매 15분 | 대기 문서 |
| Embedding Generator | 매 30분 | 임베딩 없는 청크 |
| Characteristic Extractor | 매일 05:00 | 처리된 문서 |
