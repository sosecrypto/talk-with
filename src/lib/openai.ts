import OpenAI from 'openai'

let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (openaiClient) return openaiClient

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable not configured')
  }

  openaiClient = new OpenAI({ apiKey })
  return openaiClient
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient()

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536,
  })

  return response.data[0].embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getOpenAIClient()

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
    dimensions: 1536,
  })

  return response.data.map(d => d.embedding)
}
