-- ============================================================================
-- Talk With Legends - Row Level Security Policies
-- ============================================================================
-- Run this script in Supabase SQL Editor after pgvector-setup.sql
--
-- These policies ensure:
-- 1. Users can only access their own conversations
-- 2. Public personas are visible to all authenticated users
-- 3. Admin functions are restricted
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_characteristics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Users Table Policies
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id);

-- ============================================================================
-- Conversations Table Policies
-- ============================================================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
ON conversations FOR SELECT
USING (auth.uid()::text = user_id);

-- Users can create conversations
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
ON conversations FOR UPDATE
USING (auth.uid()::text = user_id);

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
ON conversations FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================================================
-- Messages Table Policies
-- ============================================================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()::text
    )
);

-- Users can create messages in their conversations
CREATE POLICY "Users can create messages"
ON messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()::text
    )
);

-- ============================================================================
-- Conversation Feedbacks Table Policies
-- ============================================================================

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
ON conversation_feedbacks FOR SELECT
USING (auth.uid()::text = user_id);

-- Users can create feedback for their conversations
CREATE POLICY "Users can create feedback"
ON conversation_feedbacks FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- ============================================================================
-- Personas Table Policies
-- ============================================================================

-- Anyone can view public/beta personas
CREATE POLICY "Anyone can view public personas"
ON personas FOR SELECT
USING (visibility IN ('PUBLIC', 'BETA') AND is_active = true);

-- Admins can manage all personas (requires admin role check)
-- CREATE POLICY "Admins can manage personas"
-- ON personas FOR ALL
-- USING (
--     EXISTS (
--         SELECT 1 FROM users u
--         WHERE u.id = auth.uid()::text
--         AND u.role = 'admin'
--     )
-- );

-- ============================================================================
-- Documents Table Policies
-- ============================================================================

-- Anyone can view documents of public personas
CREATE POLICY "Anyone can view public documents"
ON documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM personas p
        WHERE p.id = documents.persona_id
        AND p.visibility IN ('PUBLIC', 'BETA')
        AND p.is_active = true
    )
);

-- ============================================================================
-- Chunks Table Policies
-- ============================================================================

-- Anyone can view chunks of public personas' documents
CREATE POLICY "Anyone can view public chunks"
ON chunks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM documents d
        JOIN personas p ON d.persona_id = p.id
        WHERE d.id = chunks.document_id
        AND p.visibility IN ('PUBLIC', 'BETA')
        AND p.is_active = true
    )
);

-- ============================================================================
-- Persona Characteristics Table Policies
-- ============================================================================

-- Anyone can view characteristics of public personas
CREATE POLICY "Anyone can view public characteristics"
ON persona_characteristics FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM personas p
        WHERE p.id = persona_characteristics.persona_id
        AND p.visibility IN ('PUBLIC', 'BETA')
        AND p.is_active = true
    )
);

-- ============================================================================
-- Service Role Bypass
-- ============================================================================
-- Note: Service role key bypasses RLS automatically in Supabase
-- The n8n workflows use service role key for data ingestion

-- ============================================================================
-- Verification
-- ============================================================================

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- List all policies
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
