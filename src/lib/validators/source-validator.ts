export const SOURCE_TYPES = [
  'YOUTUBE_VIDEO',
  'YOUTUBE_CHANNEL',
  'YOUTUBE_PLAYLIST',
  'TWITTER_PROFILE',
  'TWITTER_SEARCH',
  'BLOG',
  'BLOG_RSS',
  'NEWS_SEARCH',
  'SHAREHOLDER_LETTER',
  'SEC_FILING',
  'BOOK',
  'PODCAST_EPISODE',
  'PODCAST_SHOW',
  'EARNINGS_CALL',
  'CONFERENCE_TALK',
  'REDDIT_AMA',
  'REDDIT_COMMENT',
  'LINKEDIN_PROFILE',
  'LINKEDIN_POST',
  'FACEBOOK_POST',
  'MEDIUM_ARTICLE',
  'SUBSTACK_POST',
  'HACKER_NEWS',
  'QUORA_ANSWER',
  'ACADEMIC_PAPER',
  'PATENT',
  'COURT_DOCUMENT',
  'CONGRESSIONAL_TESTIMONY',
  'INTERVIEW_TRANSCRIPT',
  'SPEECH_TRANSCRIPT',
  'DOCUMENTARY',
  'CUSTOM',
] as const

export const SOURCE_STATUSES = [
  'PENDING',
  'ACTIVE',
  'PAUSED',
  'FAILED',
  'EXHAUSTED',
  'ARCHIVED',
] as const

export function validateSourceType(type: string): boolean {
  return (SOURCE_TYPES as readonly string[]).includes(type)
}

export function validateSourceStatus(status: string): boolean {
  return (SOURCE_STATUSES as readonly string[]).includes(status)
}

export function validateCreateSource(input: Record<string, unknown>): string | null {
  if (!input.personaId) {
    return 'personaId is required'
  }

  if (!input.type) {
    return 'type is required'
  }

  if (!input.name || (typeof input.name === 'string' && input.name.trim() === '')) {
    return 'name is required'
  }

  if (!validateSourceType(input.type as string)) {
    return `Invalid source type: ${input.type}`
  }

  return null
}
