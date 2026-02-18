import { CohereClient } from 'cohere-ai'

let cohereClient: CohereClient | null = null

export function getCohereClient(): CohereClient {
  if (cohereClient) return cohereClient

  const token = process.env.COHERE_API_KEY

  if (!token) {
    throw new Error('COHERE_API_KEY environment variable not configured')
  }

  cohereClient = new CohereClient({ token })
  return cohereClient
}
