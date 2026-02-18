-- ============================================================================
-- Talk With Legends - Hybrid Search Setup (Keyword + Vector)
-- ============================================================================
-- Run this script in Supabase SQL Editor after pgvector-setup.sql
--
-- Adds Full-Text Search (tsvector) to chunks table and creates
-- hybrid_search_chunks() RPC that combines vector similarity with
-- keyword matching using Reciprocal Rank Fusion (RRF).
-- ============================================================================

-- 1. Add tsvector column for full-text search
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'chunks' AND column_name = 'content_tsv'
    ) THEN
        ALTER TABLE chunks ADD COLUMN content_tsv tsvector;
    END IF;
END $$;

-- 2. Create GIN index for fast full-text search
DROP INDEX IF EXISTS chunks_content_tsv_idx;
CREATE INDEX chunks_content_tsv_idx ON chunks USING gin(content_tsv);

-- 3. Backfill existing data ('simple' dictionary: safe for mixed language content)
UPDATE chunks SET content_tsv = to_tsvector('simple', coalesce(content, ''))
WHERE content_tsv IS NULL;

-- 4. Create trigger to auto-update tsvector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION chunks_content_tsv_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.content_tsv := to_tsvector('simple', coalesce(NEW.content, ''));
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chunks_content_tsv_update ON chunks;
CREATE TRIGGER chunks_content_tsv_update
    BEFORE INSERT OR UPDATE OF content ON chunks
    FOR EACH ROW
    EXECUTE FUNCTION chunks_content_tsv_trigger();

-- 5. Create hybrid_search_chunks() RPC function
-- Combines vector similarity search with keyword full-text search
-- using Reciprocal Rank Fusion (RRF) for score combination.
--
-- RRF formula: score = (1-w)/(k + rank_vector) + w/(k + rank_keyword)
-- - k=60 (standard RRF constant, reduces impact of high-ranking outliers)
-- - w=keyword_weight (default 0.3, controls keyword vs vector balance)
-- - When no keyword results exist, falls back to vector-only ranking
CREATE OR REPLACE FUNCTION hybrid_search_chunks(
    query_embedding vector(1536),
    query_text text,
    persona_slug text,
    match_count int DEFAULT 10,
    vector_threshold float DEFAULT 0.3,
    keyword_weight float DEFAULT 0.3,
    rrf_k int DEFAULT 60
)
RETURNS TABLE (
    id text,
    content text,
    document_title text,
    similarity float,
    keyword_rank int,
    combined_score float,
    metadata jsonb
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH vector_results AS (
        SELECT
            c.id,
            c.content,
            d.title AS document_title,
            (1 - (c.embedding <=> query_embedding))::float AS similarity,
            c.metadata,
            ROW_NUMBER() OVER (ORDER BY c.embedding <=> query_embedding) AS rank_v
        FROM chunks c
        JOIN documents d ON c.document_id = d.id
        JOIN personas p ON d.persona_id = p.id
        WHERE p.slug = persona_slug
            AND c.embedding IS NOT NULL
            AND (1 - (c.embedding <=> query_embedding)) > vector_threshold
        ORDER BY c.embedding <=> query_embedding
        LIMIT match_count * 2
    ),
    keyword_results AS (
        SELECT
            c.id,
            ROW_NUMBER() OVER (ORDER BY ts_rank_cd(c.content_tsv, plainto_tsquery('simple', query_text)) DESC) AS rank_k
        FROM chunks c
        JOIN documents d ON c.document_id = d.id
        JOIN personas p ON d.persona_id = p.id
        WHERE p.slug = persona_slug
            AND c.content_tsv @@ plainto_tsquery('simple', query_text)
        LIMIT match_count * 2
    ),
    fused AS (
        SELECT
            v.id,
            v.content,
            v.document_title,
            v.similarity,
            k.rank_k::int AS keyword_rank,
            (
                (1.0 - keyword_weight) / (rrf_k + v.rank_v)
                + keyword_weight / (rrf_k + COALESCE(k.rank_k, match_count * 2 + 1))
            )::float AS combined_score,
            v.metadata
        FROM vector_results v
        LEFT JOIN keyword_results k ON v.id = k.id
    )
    SELECT
        f.id,
        f.content,
        f.document_title,
        f.similarity,
        f.keyword_rank,
        f.combined_score,
        f.metadata
    FROM fused f
    ORDER BY f.combined_score DESC
    LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION hybrid_search_chunks IS
    'Hybrid search combining vector similarity and keyword full-text search using RRF (Reciprocal Rank Fusion)';

-- ============================================================================
-- Verification Queries (run to verify setup)
-- ============================================================================

-- Check tsvector column exists
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'chunks' AND column_name = 'content_tsv';

-- Check GIN index exists
-- SELECT indexname FROM pg_indexes WHERE indexname = 'chunks_content_tsv_idx';

-- Check function exists
-- SELECT proname FROM pg_proc WHERE proname = 'hybrid_search_chunks';

-- Test hybrid search (replace with actual embedding)
-- SELECT * FROM hybrid_search_chunks(
--     '[0.1, 0.2, ...]'::vector(1536),
--     'Tesla Starship',
--     'elon-musk',
--     5
-- );
