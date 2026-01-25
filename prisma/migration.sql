-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('YOUTUBE_VIDEO', 'YOUTUBE_CHANNEL', 'YOUTUBE_PLAYLIST', 'TWITTER_PROFILE', 'TWITTER_SEARCH', 'BLOG', 'BLOG_RSS', 'NEWS_SEARCH', 'SHAREHOLDER_LETTER', 'SEC_FILING', 'BOOK', 'PODCAST_EPISODE', 'PODCAST_SHOW', 'EARNINGS_CALL', 'CONFERENCE_TALK', 'REDDIT_AMA', 'REDDIT_COMMENT', 'LINKEDIN_PROFILE', 'LINKEDIN_POST', 'FACEBOOK_POST', 'MEDIUM_ARTICLE', 'SUBSTACK_POST', 'HACKER_NEWS', 'QUORA_ANSWER', 'ACADEMIC_PAPER', 'PATENT', 'COURT_DOCUMENT', 'CONGRESSIONAL_TESTIMONY', 'INTERVIEW_TRANSCRIPT', 'SPEECH_TRANSCRIPT', 'DOCUMENTARY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'FAILED', 'EXHAUSTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING_FETCH', 'FETCHING', 'FETCH_FAILED', 'PENDING_PROCESSING', 'PROCESSING', 'PROCESSED', 'PENDING_EMBEDDING', 'EMBEDDING', 'READY', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChunkType" AS ENUM ('PARAGRAPH', 'QUOTE', 'QA_PAIR', 'DIALOGUE', 'BULLET_POINTS', 'CODE', 'HEADER', 'SUMMARY');

-- CreateEnum
CREATE TYPE "CharacteristicCategory" AS ENUM ('OPINION', 'BELIEF', 'STYLE', 'CATCHPHRASE', 'ANECDOTE', 'FACT', 'PREDICTION', 'ADVICE', 'PRINCIPLE', 'HUMOR');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'KO', 'JA', 'ZH', 'ES', 'FR', 'DE', 'OTHER');

-- CreateEnum
CREATE TYPE "PersonaVisibility" AS ENUM ('DRAFT', 'INTERNAL', 'BETA', 'PUBLIC', 'ARCHIVED');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "personas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ko" TEXT,
    "name_local" TEXT,
    "title" TEXT,
    "bio" TEXT,
    "bio_short" VARCHAR(280),
    "image_url" TEXT,
    "sketch_url" TEXT,
    "thumbnail_url" TEXT,
    "color" TEXT,
    "accent_color" TEXT,
    "birth_date" TIMESTAMP(3),
    "nationality" TEXT,
    "occupation" TEXT[],
    "companies" TEXT[],
    "industries" TEXT[],
    "twitter_handle" TEXT,
    "linkedin_url" TEXT,
    "wikipedia_url" TEXT,
    "official_website" TEXT,
    "speaking_style" JSONB,
    "key_phrases" TEXT[],
    "values" TEXT[],
    "expertise" TEXT[],
    "controversies" TEXT[],
    "system_prompt_base" TEXT,
    "system_prompt_version" INTEGER NOT NULL DEFAULT 0,
    "system_prompt_updated_at" TIMESTAMP(3),
    "visibility" "PersonaVisibility" NOT NULL DEFAULT 'DRAFT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "total_documents" INTEGER NOT NULL DEFAULT 0,
    "total_chunks" INTEGER NOT NULL DEFAULT 0,
    "total_words" INTEGER NOT NULL DEFAULT 0,
    "total_conversations" INTEGER NOT NULL DEFAULT 0,
    "avg_rating" DOUBLE PRECISION,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persona_aliases" (
    "id" TEXT NOT NULL,
    "persona_id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'EN',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persona_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persona_topics" (
    "id" TEXT NOT NULL,
    "persona_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "sentiment" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "document_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persona_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "persona_id" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "config" JSONB,
    "credential_ref" TEXT,
    "status" "SourceStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_backfill_complete" BOOLEAN NOT NULL DEFAULT false,
    "fetch_frequency" TEXT,
    "fetch_cron_expr" TEXT,
    "last_fetched_at" TIMESTAMP(3),
    "next_fetch_at" TIMESTAMP(3),
    "max_items_per_fetch" INTEGER,
    "total_items_limit" INTEGER,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "total_fetches" INTEGER NOT NULL DEFAULT 0,
    "success_fetches" INTEGER NOT NULL DEFAULT 0,
    "failed_fetches" INTEGER NOT NULL DEFAULT 0,
    "total_documents" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "last_error_at" TIMESTAMP(3),
    "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fetch_logs" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "items_found" INTEGER NOT NULL DEFAULT 0,
    "items_new" INTEGER NOT NULL DEFAULT 0,
    "items_updated" INTEGER NOT NULL DEFAULT 0,
    "items_skipped" INTEGER NOT NULL DEFAULT 0,
    "items_failed" INTEGER NOT NULL DEFAULT 0,
    "duration_ms" INTEGER,
    "bytes_processed" INTEGER,
    "error_message" TEXT,
    "error_stack" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fetch_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "persona_id" TEXT NOT NULL,
    "source_id" TEXT,
    "external_id" TEXT,
    "external_url" TEXT,
    "title" TEXT,
    "raw_content" TEXT NOT NULL,
    "clean_content" TEXT,
    "summary" TEXT,
    "author" TEXT,
    "author_role" TEXT,
    "published_at" TIMESTAMP(3),
    "language" "Language" NOT NULL DEFAULT 'EN',
    "word_count" INTEGER,
    "char_count" INTEGER,
    "sentence_count" INTEGER,
    "reading_time_min" INTEGER,
    "duration_seconds" INTEGER,
    "has_transcript" BOOLEAN NOT NULL DEFAULT false,
    "transcript_source" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING_FETCH',
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "embedded_chunks" INTEGER NOT NULL DEFAULT 0,
    "extracted_chars" INTEGER NOT NULL DEFAULT 0,
    "quality_score" DOUBLE PRECISION,
    "relevance_score" DOUBLE PRECISION,
    "last_error" TEXT,
    "last_error_at" TIMESTAMP(3),
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "source_metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "processed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chunks" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "content_hash" VARCHAR(64) NOT NULL,
    "index" INTEGER NOT NULL,
    "start_char" INTEGER,
    "end_char" INTEGER,
    "type" "ChunkType" NOT NULL DEFAULT 'PARAGRAPH',
    "word_count" INTEGER,
    "prev_chunk_id" TEXT,
    "next_chunk_id" TEXT,
    "embedding" vector(1536),
    "embedding_model" VARCHAR(50),
    "embedded_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persona_characteristics" (
    "id" TEXT NOT NULL,
    "persona_id" TEXT NOT NULL,
    "category" "CharacteristicCategory" NOT NULL,
    "topic" TEXT,
    "content" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "example_quote" TEXT,
    "source_document_ids" TEXT[],
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persona_characteristics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_characteristics" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "category" "CharacteristicCategory" NOT NULL,
    "topic" TEXT,
    "content" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "quote" TEXT,
    "quote_start" INTEGER,
    "quote_end" INTEGER,
    "extracted_by" TEXT,
    "extracted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_characteristics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "persona_id" TEXT,
    "title" TEXT,
    "prompt_version" INTEGER,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "retrieved_chunk_ids" TEXT[],
    "retrieval_scores" DOUBLE PRECISION[],
    "model" VARCHAR(50),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT,
    "mime_type" TEXT,
    "size_bytes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_feedbacks" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER,
    "thumbs_up" BOOLEAN,
    "feedback_type" TEXT,
    "comment" TEXT,
    "message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_queue" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "target_type" TEXT,
    "target_id" TEXT,
    "input" JSONB,
    "output" JSONB,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "scheduled_for" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "user_id" TEXT,
    "user_email" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "personas_slug_key" ON "personas"("slug");

-- CreateIndex
CREATE INDEX "personas_slug_idx" ON "personas"("slug");

-- CreateIndex
CREATE INDEX "personas_visibility_is_active_idx" ON "personas"("visibility", "is_active");

-- CreateIndex
CREATE INDEX "personas_priority_idx" ON "personas"("priority");

-- CreateIndex
CREATE INDEX "persona_aliases_alias_idx" ON "persona_aliases"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "persona_aliases_persona_id_alias_key" ON "persona_aliases"("persona_id", "alias");

-- CreateIndex
CREATE INDEX "persona_topics_persona_id_idx" ON "persona_topics"("persona_id");

-- CreateIndex
CREATE INDEX "persona_topics_topic_idx" ON "persona_topics"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "persona_topics_persona_id_topic_key" ON "persona_topics"("persona_id", "topic");

-- CreateIndex
CREATE INDEX "sources_persona_id_status_idx" ON "sources"("persona_id", "status");

-- CreateIndex
CREATE INDEX "sources_type_status_idx" ON "sources"("type", "status");

-- CreateIndex
CREATE INDEX "sources_next_fetch_at_idx" ON "sources"("next_fetch_at");

-- CreateIndex
CREATE INDEX "sources_status_priority_idx" ON "sources"("status", "priority");

-- CreateIndex
CREATE INDEX "fetch_logs_source_id_created_at_idx" ON "fetch_logs"("source_id", "created_at");

-- CreateIndex
CREATE INDEX "fetch_logs_status_created_at_idx" ON "fetch_logs"("status", "created_at");

-- CreateIndex
CREATE INDEX "documents_persona_id_status_idx" ON "documents"("persona_id", "status");

-- CreateIndex
CREATE INDEX "documents_source_id_status_idx" ON "documents"("source_id", "status");

-- CreateIndex
CREATE INDEX "documents_status_created_at_idx" ON "documents"("status", "created_at");

-- CreateIndex
CREATE INDEX "documents_published_at_idx" ON "documents"("published_at");

-- CreateIndex
CREATE INDEX "documents_external_id_idx" ON "documents"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "documents_source_id_external_id_key" ON "documents"("source_id", "external_id");

-- CreateIndex
CREATE INDEX "chunks_document_id_index_idx" ON "chunks"("document_id", "index");

-- CreateIndex
CREATE INDEX "chunks_type_idx" ON "chunks"("type");

-- CreateIndex
CREATE INDEX "chunks_embedded_at_idx" ON "chunks"("embedded_at");

-- CreateIndex
CREATE UNIQUE INDEX "chunks_document_id_content_hash_key" ON "chunks"("document_id", "content_hash");

-- CreateIndex
CREATE INDEX "persona_characteristics_persona_id_category_idx" ON "persona_characteristics"("persona_id", "category");

-- CreateIndex
CREATE INDEX "persona_characteristics_persona_id_confidence_idx" ON "persona_characteristics"("persona_id", "confidence");

-- CreateIndex
CREATE INDEX "persona_characteristics_topic_idx" ON "persona_characteristics"("topic");

-- CreateIndex
CREATE INDEX "document_characteristics_document_id_category_idx" ON "document_characteristics"("document_id", "category");

-- CreateIndex
CREATE INDEX "conversations_user_id_created_at_idx" ON "conversations"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "conversations_persona_id_created_at_idx" ON "conversations"("persona_id", "created_at");

-- CreateIndex
CREATE INDEX "conversations_user_id_persona_id_idx" ON "conversations"("user_id", "persona_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "message_attachments_message_id_idx" ON "message_attachments"("message_id");

-- CreateIndex
CREATE INDEX "conversation_feedbacks_conversation_id_idx" ON "conversation_feedbacks"("conversation_id");

-- CreateIndex
CREATE INDEX "conversation_feedbacks_user_id_idx" ON "conversation_feedbacks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "job_queue_status_priority_idx" ON "job_queue"("status", "priority");

-- CreateIndex
CREATE INDEX "job_queue_type_status_idx" ON "job_queue"("type", "status");

-- CreateIndex
CREATE INDEX "job_queue_scheduled_for_idx" ON "job_queue"("scheduled_for");

-- CreateIndex
CREATE INDEX "job_queue_target_type_target_id_idx" ON "job_queue"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_aliases" ADD CONSTRAINT "persona_aliases_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_topics" ADD CONSTRAINT "persona_topics_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fetch_logs" ADD CONSTRAINT "fetch_logs_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_characteristics" ADD CONSTRAINT "persona_characteristics_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_characteristics" ADD CONSTRAINT "document_characteristics_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_feedbacks" ADD CONSTRAINT "conversation_feedbacks_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_feedbacks" ADD CONSTRAINT "conversation_feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

