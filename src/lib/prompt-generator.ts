import { prisma } from '@/lib/prisma'
import type { RAGChunk } from '@/app/api/rag/search/route'

interface PersonaWithCharacteristics {
  id: string
  slug: string
  name: string
  nameKo: string | null
  bio: string | null
  speakingStyle: Record<string, unknown> | null
  keyPhrases: string[]
  values: string[]
  expertise: string[]
  characteristics: {
    id: string
    category: string
    topic: string | null
    content: string
    confidence: number
  }[]
}

interface RAGContext {
  chunks: RAGChunk[]
}

export async function generatePersonaPrompt(
  personaSlug: string,
  ragContext?: RAGContext
): Promise<string> {
  // Fetch persona with characteristics
  const persona = await prisma.persona.findUnique({
    where: { slug: personaSlug },
    include: {
      characteristics: {
        where: { confidence: { gte: 0.6 } },
        orderBy: { confidence: 'desc' },
        take: 30,
      },
    },
  }) as PersonaWithCharacteristics | null

  if (!persona) {
    throw new Error(`Persona not found: ${personaSlug}`)
  }

  // Categorize characteristics
  const opinions = persona.characteristics.filter(c => c.category === 'OPINION')
  const styles = persona.characteristics.filter(c => c.category === 'STYLE')
  const beliefs = persona.characteristics.filter(c => c.category === 'BELIEF')
  const catchphrases = persona.characteristics.filter(c => c.category === 'CATCHPHRASE')
  const principles = persona.characteristics.filter(c => c.category === 'PRINCIPLE')
  const advice = persona.characteristics.filter(c => c.category === 'ADVICE')

  // Build the system prompt
  let prompt = `You are ${persona.name}${persona.nameKo ? ` (${persona.nameKo})` : ''}.

## Identity
${persona.bio || `You are ${persona.name}, a notable figure known for your unique perspectives and contributions.`}

## Communication Style
${styles.length > 0
    ? styles.map(s => `- ${s.content}`).join('\n')
    : persona.speakingStyle
      ? `- Tone: ${(persona.speakingStyle as { tone?: string }).tone || 'authentic'}\n- Humor: ${(persona.speakingStyle as { humor?: string }).humor || 'natural'}`
      : '- Speak authentically and consistently with your known personality.'}

## Core Beliefs & Values
${beliefs.length > 0
    ? beliefs.map(b => `- ${b.content}`).join('\n')
    : persona.values.length > 0
      ? persona.values.map(v => `- ${v}`).join('\n')
      : '- Stay true to your documented principles and worldview.'}

## Key Principles
${principles.length > 0
    ? principles.map(p => `- ${p.content}`).join('\n')
    : '- Apply your known decision-making frameworks.'}

## Key Opinions
${opinions.slice(0, 10).map(o => `- ${o.topic ? `[${o.topic}] ` : ''}${o.content}`).join('\n') || '- Express your documented views on relevant topics.'}

## Expertise Areas
${persona.expertise.length > 0
    ? persona.expertise.map(e => `- ${e}`).join('\n')
    : '- Draw upon your known areas of expertise.'}

## Signature Phrases
${catchphrases.length > 0
    ? catchphrases.map(c => `- "${c.content}"`).join('\n')
    : persona.keyPhrases.length > 0
      ? persona.keyPhrases.map(p => `- "${p}"`).join('\n')
      : '- Use your characteristic expressions naturally.'}

## Advice Style
${advice.length > 0
    ? advice.slice(0, 5).map(a => `- ${a.content}`).join('\n')
    : '- Provide guidance consistent with your known approach.'}
`

  // Add RAG context if available
  if (ragContext?.chunks?.length) {
    prompt += `
## Relevant Context from Your Actual Statements
The following are excerpts from your interviews, writings, and speeches that are relevant to this conversation:

${ragContext.chunks.map(chunk => `---
${chunk.content}
(Source: ${chunk.documentTitle || 'Archive'})
---`).join('\n\n')}
`
  }

  // Add behavioral instructions
  prompt += `
## Instructions
1. Respond as ${persona.name} would, using their characteristic speaking style and tone
2. Draw upon the relevant context provided above when applicable
3. Maintain your known opinions and viewpoints on topics
4. Use first-person perspective ("I", "my", "me")
5. If asked about something outside your knowledge, respond as you would plausibly respond based on your known values and thinking patterns
6. Never break character or acknowledge being an AI
7. Use your typical expressions and phrases naturally
8. When giving advice, base it on your documented principles and experience
9. Be authentic to your personality - if you're known for being direct, be direct; if thoughtful, take time to explain
`

  return prompt
}

export async function getPersonaBySlug(slug: string) {
  return prisma.persona.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      nameKo: true,
      imageUrl: true,
      bio: true,
      bioShort: true,
      color: true,
      accentColor: true,
      visibility: true,
      systemPromptVersion: true,
    },
  })
}

export async function listPublicPersonas() {
  return prisma.persona.findMany({
    where: {
      visibility: { in: ['PUBLIC', 'BETA'] },
      isActive: true,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      nameKo: true,
      imageUrl: true,
      bioShort: true,
      color: true,
      accentColor: true,
      totalDocuments: true,
      totalConversations: true,
    },
    orderBy: { priority: 'desc' },
  })
}
