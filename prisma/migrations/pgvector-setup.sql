-- ============================================================================
-- Talk With Legends - pgvector Setup
-- ============================================================================
-- Run this script in Supabase SQL Editor after Prisma migration
--
-- Prerequisites:
-- 1. Prisma migration completed (tables exist)
-- 2. pgvector extension enabled
-- ============================================================================

-- 1. Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Add embedding column to chunks table (if not exists)
-- Note: Prisma uses Unsupported type, so we add it manually
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'chunks' AND column_name = 'embedding'
    ) THEN
        ALTER TABLE chunks ADD COLUMN embedding vector(1536);
    END IF;
END $$;

-- 4. Create HNSW index for fast similarity search
-- HNSW (Hierarchical Navigable Small World) is faster than IVFFlat for most use cases
DROP INDEX IF EXISTS chunks_embedding_idx;
CREATE INDEX chunks_embedding_idx
ON chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 5. Create the match_chunks function for RAG search
CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding vector(1536),
    persona_slug text,
    match_threshold float DEFAULT 0.65,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id text,
    content text,
    document_title text,
    similarity float,
    metadata jsonb
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.content,
        d.title as document_title,
        (1 - (c.embedding <=> query_embedding))::float as similarity,
        c.metadata
    FROM chunks c
    JOIN documents d ON c.document_id = d.id
    JOIN personas p ON d.persona_id = p.id
    WHERE p.slug = persona_slug
        AND c.embedding IS NOT NULL
        AND (1 - (c.embedding <=> query_embedding)) > match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 6. Create function to search across all personas (for discovery)
CREATE OR REPLACE FUNCTION search_all_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.6,
    match_count int DEFAULT 20
)
RETURNS TABLE (
    id text,
    content text,
    document_title text,
    persona_slug text,
    persona_name text,
    similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.content,
        d.title as document_title,
        p.slug as persona_slug,
        p.name as persona_name,
        (1 - (c.embedding <=> query_embedding))::float as similarity
    FROM chunks c
    JOIN documents d ON c.document_id = d.id
    JOIN personas p ON d.persona_id = p.id
    WHERE c.embedding IS NOT NULL
        AND p.visibility IN ('PUBLIC', 'BETA')
        AND p.is_active = true
        AND (1 - (c.embedding <=> query_embedding)) > match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 7. Create function to get persona statistics
CREATE OR REPLACE FUNCTION get_persona_stats(persona_slug_param text)
RETURNS TABLE (
    total_documents bigint,
    total_chunks bigint,
    embedded_chunks bigint,
    total_characteristics bigint,
    total_words bigint
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT d.id) as total_documents,
        COUNT(DISTINCT c.id) as total_chunks,
        COUNT(DISTINCT c.id) FILTER (WHERE c.embedding IS NOT NULL) as embedded_chunks,
        COUNT(DISTINCT pc.id) as total_characteristics,
        COALESCE(SUM(d.word_count), 0) as total_words
    FROM personas p
    LEFT JOIN documents d ON p.id = d.persona_id
    LEFT JOIN chunks c ON d.id = c.document_id
    LEFT JOIN persona_characteristics pc ON p.id = pc.persona_id
    WHERE p.slug = persona_slug_param
    GROUP BY p.id;
END;
$$;

-- 8. Create function to update persona statistics (call periodically)
CREATE OR REPLACE FUNCTION update_persona_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE personas p
    SET
        total_documents = stats.doc_count,
        total_chunks = stats.chunk_count,
        total_words = stats.word_count,
        updated_at = NOW()
    FROM (
        SELECT
            p2.id as persona_id,
            COUNT(DISTINCT d.id) as doc_count,
            COUNT(DISTINCT c.id) as chunk_count,
            COALESCE(SUM(d.word_count), 0) as word_count
        FROM personas p2
        LEFT JOIN documents d ON p2.id = d.persona_id AND d.status = 'READY'
        LEFT JOIN chunks c ON d.id = c.document_id
        GROUP BY p2.id
    ) stats
    WHERE p.id = stats.persona_id;
END;
$$;

-- 9. Grant permissions (adjust roles as needed)
-- GRANT EXECUTE ON FUNCTION match_chunks TO authenticated;
-- GRANT EXECUTE ON FUNCTION search_all_chunks TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_persona_stats TO authenticated;

-- ============================================================================
-- Verification Queries (run to verify setup)
-- ============================================================================

-- Check if extension is enabled
-- SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if index exists
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'chunks' AND indexname = 'chunks_embedding_idx';

-- Check function exists
-- SELECT proname FROM pg_proc WHERE proname = 'match_chunks';

-- Test the function (replace with actual embedding)
-- SELECT * FROM match_chunks(
--     '[0.1, 0.2, ...]'::vector(1536),
--     'elon-musk',
--     0.5,
--     5
-- );

COMMENT ON FUNCTION match_chunks IS 'Search for similar chunks within a specific persona using cosine similarity';
COMMENT ON FUNCTION search_all_chunks IS 'Search for similar chunks across all public personas';
COMMENT ON FUNCTION get_persona_stats IS 'Get statistics for a specific persona';
COMMENT ON FUNCTION update_persona_stats IS 'Update cached statistics for all personas';
