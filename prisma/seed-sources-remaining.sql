-- ============================================================================
-- Additional Sources for Remaining Personas
-- ============================================================================

DO $$
DECLARE
  persona_record RECORD;
BEGIN
  -- Steve Jobs sources
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'steve-jobs' LOOP
    INSERT INTO sources (id, persona_id, type, name, url, config, status, priority, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'YOUTUBE_VIDEO', 'Stanford Commencement Speech', 'https://www.youtube.com/watch?v=UF8uR6Z6KLc', '{"videoId": "UF8uR6Z6KLc"}', 'PENDING', 1, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'YOUTUBE_PLAYLIST', 'Apple Keynotes Archive', NULL, '{"searchTerms": ["Steve Jobs keynote", "Steve Jobs Apple"]}', 'PENDING', 2, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'BOOK', 'Steve Jobs Biography', NULL, '{"title": "Steve Jobs", "author": "Walter Isaacson", "isbn": "978-1451648539"}', 'PENDING', 3, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'INTERVIEW_TRANSCRIPT', 'All Things D Interviews', NULL, '{"events": ["D1", "D2", "D3", "D5", "D8"]}', 'PENDING', 4, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'CONFERENCE_TALK', 'Apple Events', NULL, '{"conferences": ["WWDC", "Macworld", "Apple Special Event"]}', 'PENDING', 5, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Donald Trump sources
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'donald-trump' LOOP
    INSERT INTO sources (id, persona_id, type, name, url, config, status, priority, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'BOOK', 'The Art of the Deal', NULL, '{"title": "Trump: The Art of the Deal", "author": "Donald Trump, Tony Schwartz", "isbn": "978-0399594496"}', 'PENDING', 1, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'YOUTUBE_PLAYLIST', 'Speeches and Rallies', NULL, '{"searchTerms": ["Donald Trump speech", "Trump rally", "Trump interview"]}', 'PENDING', 2, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'NEWS_SEARCH', 'Trump News', NULL, '{"queries": ["Donald Trump statement", "Trump says"], "sources": ["Reuters", "AP News"]}', 'PENDING', 3, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'INTERVIEW_TRANSCRIPT', 'Major Interviews', NULL, '{"networks": ["Fox News", "NBC", "ABC"]}', 'PENDING', 4, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Lee Jae-yong sources
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'lee-jae-yong' LOOP
    INSERT INTO sources (id, persona_id, type, name, url, config, status, priority, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'NEWS_SEARCH', 'Samsung/Lee News (EN)', NULL, '{"queries": ["Lee Jae-yong Samsung", "Jay Y Lee Samsung"], "sources": ["Reuters", "Bloomberg", "WSJ"]}', 'PENDING', 1, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'NEWS_SEARCH', 'Samsung/Lee News (KO)', NULL, '{"queries": ["이재용 삼성", "이재용 회장"], "sources": ["조선일보", "한국경제", "매일경제"]}', 'PENDING', 2, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'EARNINGS_CALL', 'Samsung Electronics Earnings', NULL, '{"ticker": "005930.KS", "company": "Samsung Electronics"}', 'PENDING', 3, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'CONFERENCE_TALK', 'Samsung Events', NULL, '{"conferences": ["Samsung Unpacked", "CES Samsung"]}', 'PENDING', 4, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Jeff Bezos sources
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'jeff-bezos' LOOP
    INSERT INTO sources (id, persona_id, type, name, url, config, status, priority, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'SHAREHOLDER_LETTER', 'Amazon Shareholder Letters', 'https://ir.aboutamazon.com/annual-reports-proxies-and-shareholder-letters/default.aspx', '{"company": "Amazon", "yearsBack": 25}', 'PENDING', 1, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'YOUTUBE_PLAYLIST', 'Bezos Interviews', NULL, '{"searchTerms": ["Jeff Bezos interview", "Jeff Bezos speech", "Bezos leadership"]}', 'PENDING', 2, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'PODCAST_SHOW', 'Lex Fridman Interview', NULL, '{"showName": "Lex Fridman Podcast", "guestFilter": "Jeff Bezos"}', 'PENDING', 3, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'BOOK', 'Invent and Wander', NULL, '{"title": "Invent and Wander: The Collected Writings of Jeff Bezos", "author": "Jeff Bezos"}', 'PENDING', 4, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'CONFERENCE_TALK', 'AWS re:Invent', NULL, '{"conferences": ["AWS re:Invent", "Code Conference"]}', 'PENDING', 5, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Larry Page sources
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'larry-page' LOOP
    INSERT INTO sources (id, persona_id, type, name, url, config, status, priority, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'YOUTUBE_PLAYLIST', 'Larry Page Interviews', NULL, '{"searchTerms": ["Larry Page interview", "Larry Page Google", "Larry Page speech"]}', 'PENDING', 1, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'INTERVIEW_TRANSCRIPT', 'University Speeches', NULL, '{"events": ["University of Michigan 2009 Commencement"]}', 'PENDING', 2, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'CONFERENCE_TALK', 'Google I/O & TED', NULL, '{"conferences": ["Google I/O", "TED"]}', 'PENDING', 3, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'BOOK', 'Google Story', NULL, '{"title": "The Google Story", "author": "David Vise"}', 'PENDING', 4, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Sergey Brin sources
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'sergey-brin' LOOP
    INSERT INTO sources (id, persona_id, type, name, url, config, status, priority, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'YOUTUBE_PLAYLIST', 'Sergey Brin Interviews', NULL, '{"searchTerms": ["Sergey Brin interview", "Sergey Brin Google"]}', 'PENDING', 1, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'CONFERENCE_TALK', 'Google Events & TED', NULL, '{"conferences": ["Google I/O", "TED", "Web 2.0 Summit"]}', 'PENDING', 2, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'ACADEMIC_PAPER', 'PageRank Paper', NULL, '{"title": "The Anatomy of a Large-Scale Hypertextual Web Search Engine", "authors": ["Sergey Brin", "Larry Page"]}', 'PENDING', 3, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

END $$;

-- ============================================================================
-- Additional Topics for all personas
-- ============================================================================

DO $$
DECLARE
  persona_record RECORD;
BEGIN
  -- Steve Jobs topics
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'steve-jobs' LOOP
    INSERT INTO persona_topics (id, persona_id, topic, confidence, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'Apple', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'iPhone', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Design', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Innovation', 0.9, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Leadership', 0.85, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Pixar', 0.8, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Donald Trump topics
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'donald-trump' LOOP
    INSERT INTO persona_topics (id, persona_id, topic, confidence, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'Politics', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Real Estate', 0.9, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Business', 0.9, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Negotiation', 0.85, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Media', 0.85, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Lee Jae-yong topics
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'lee-jae-yong' LOOP
    INSERT INTO persona_topics (id, persona_id, topic, confidence, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'Samsung', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Semiconductors', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Korea', 0.9, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Electronics', 0.9, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Display', 0.85, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Jeff Bezos topics
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'jeff-bezos' LOOP
    INSERT INTO persona_topics (id, persona_id, topic, confidence, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'Amazon', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'AWS', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'E-commerce', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Blue Origin', 0.85, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Space', 0.8, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Leadership', 0.85, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Larry Page topics
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'larry-page' LOOP
    INSERT INTO persona_topics (id, persona_id, topic, confidence, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'Google', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Alphabet', 0.9, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Search', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'AI', 0.85, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Moonshots', 0.85, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Sergey Brin topics
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'sergey-brin' LOOP
    INSERT INTO persona_topics (id, persona_id, topic, confidence, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'Google', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Alphabet', 0.9, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'X', 0.85, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Innovation', 0.85, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Moonshots', 0.85, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Vitalik Buterin topics
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'vitalik-buterin' LOOP
    INSERT INTO persona_topics (id, persona_id, topic, confidence, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'Ethereum', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Blockchain', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Crypto', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'DeFi', 0.85, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Web3', 0.85, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Jensen Huang topics
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'jensen-huang' LOOP
    INSERT INTO persona_topics (id, persona_id, topic, confidence, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'NVIDIA', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'AI', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'GPUs', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'CUDA', 0.9, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Gaming', 0.8, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Bill Gates topics
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'bill-gates' LOOP
    INSERT INTO persona_topics (id, persona_id, topic, confidence, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'Microsoft', 0.9, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Philanthropy', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Global Health', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Climate Change', 0.9, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Books', 0.8, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Mark Zuckerberg topics
  FOR persona_record IN SELECT id FROM personas WHERE slug = 'mark-zuckerberg' LOOP
    INSERT INTO persona_topics (id, persona_id, topic, confidence, created_at, updated_at)
    VALUES
      (gen_random_uuid(), persona_record.id, 'Meta', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Facebook', 0.95, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Metaverse', 0.9, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'VR', 0.85, NOW(), NOW()),
      (gen_random_uuid(), persona_record.id, 'Social Media', 0.95, NOW(), NOW())
    ON CONFLICT DO NOTHING;
  END LOOP;

END $$;

-- ============================================================================
-- Verification
-- ============================================================================

-- Check sources per persona (should all have 3+ sources now)
SELECT p.name, p.slug, COUNT(s.id) as source_count
FROM personas p
LEFT JOIN sources s ON p.id = s.persona_id
GROUP BY p.id, p.name, p.slug
ORDER BY p.priority;

-- Check topics per persona
SELECT p.name, COUNT(t.id) as topic_count
FROM personas p
LEFT JOIN persona_topics t ON p.id = t.persona_id
GROUP BY p.id, p.name
ORDER BY p.priority;

-- Total counts
SELECT
  (SELECT COUNT(*) FROM personas) as personas,
  (SELECT COUNT(*) FROM sources) as sources,
  (SELECT COUNT(*) FROM persona_topics) as topics,
  (SELECT COUNT(*) FROM persona_aliases) as aliases;
