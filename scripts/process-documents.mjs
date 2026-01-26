/**
 * 문서 처리 스크립트
 * - PENDING_PROCESSING 상태의 문서를 청킹 및 임베딩 처리
 */

import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'
import crypto from 'crypto'

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// 청킹 설정
const CHUNK_SIZE = 1000  // 단어 수
const CHUNK_OVERLAP = 100  // 오버랩 단어 수
const BATCH_SIZE = 5  // 한 번에 처리할 문서 수

/**
 * 텍스트를 청크로 분할
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const words = text.split(/\s+/)
  const chunks = []

  let i = 0
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim().length > 0) {
      chunks.push({
        content: chunk,
        startIndex: i,
        wordCount: Math.min(chunkSize, words.length - i)
      })
    }
    i += chunkSize - overlap

    // 마지막 청크가 너무 작으면 스킵
    if (i < words.length && words.length - i < overlap) break
  }

  return chunks
}

/**
 * SHA-256 해시 생성
 */
function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * OpenAI 임베딩 생성
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Embedding error:', error.message)
    return null
  }
}

/**
 * 단일 문서 처리
 */
async function processDocument(document) {
  console.log(`\n📄 Processing: ${document.title || document.id}`)

  try {
    // 문서 상태 업데이트: PROCESSING
    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'PROCESSING' }
    })

    const content = document.cleanContent || document.rawContent
    if (!content || content.trim().length === 0) {
      console.log('  ⚠️ No content to process')
      await prisma.document.update({
        where: { id: document.id },
        data: { status: 'FAILED', lastError: 'No content' }
      })
      return { processed: 0, embedded: 0 }
    }

    // 청킹
    const chunks = chunkText(content)
    console.log(`  📦 Created ${chunks.length} chunks`)

    let processedCount = 0
    let embeddedCount = 0

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const contentHash = hashContent(chunk.content)

      // 중복 체크
      const existing = await prisma.chunk.findFirst({
        where: { documentId: document.id, contentHash }
      })

      if (existing) {
        console.log(`  ⏭️ Chunk ${i + 1} already exists`)
        continue
      }

      // 임베딩 생성
      const embedding = await generateEmbedding(chunk.content)

      if (!embedding) {
        console.log(`  ❌ Failed to embed chunk ${i + 1}`)
        continue
      }

      // 청크 저장 (임베딩 포함)
      await prisma.$executeRaw`
        INSERT INTO chunks (id, document_id, content, content_hash, "index", word_count, type, embedding, embedding_model, embedded_at, created_at)
        VALUES (
          ${crypto.randomUUID()},
          ${document.id},
          ${chunk.content},
          ${contentHash},
          ${i},
          ${chunk.wordCount},
          'PARAGRAPH',
          ${embedding}::vector,
          'text-embedding-3-small',
          NOW(),
          NOW()
        )
      `

      processedCount++
      embeddedCount++
      console.log(`  ✅ Chunk ${i + 1}/${chunks.length} processed`)

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // 문서 상태 업데이트: READY
    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: 'READY',
        chunkCount: chunks.length,
        embeddedChunks: embeddedCount,
        processedAt: new Date()
      }
    })

    // 페르소나 통계 업데이트
    await updatePersonaStats(document.personaId)

    console.log(`  ✅ Document processed: ${processedCount} chunks, ${embeddedCount} embedded`)
    return { processed: processedCount, embedded: embeddedCount }

  } catch (error) {
    console.error(`  ❌ Error:`, error.message)
    await prisma.document.update({
      where: { id: document.id },
      data: { status: 'FAILED', lastError: error.message }
    })
    return { processed: 0, embedded: 0 }
  }
}

/**
 * 페르소나 통계 업데이트
 */
async function updatePersonaStats(personaId) {
  const stats = await prisma.document.aggregate({
    where: { personaId, status: 'READY' },
    _count: { id: true }
  })

  const chunkStats = await prisma.chunk.count({
    where: { document: { personaId } }
  })

  await prisma.persona.update({
    where: { id: personaId },
    data: {
      totalDocuments: stats._count.id,
      totalChunks: chunkStats
    }
  })
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🚀 Starting document processing...\n')

  // PENDING_PROCESSING 문서 조회
  const documents = await prisma.document.findMany({
    where: { status: 'PENDING_PROCESSING' },
    include: { persona: { select: { name: true } } },
    take: BATCH_SIZE,
    orderBy: { createdAt: 'asc' }
  })

  console.log(`📊 Found ${documents.length} documents to process\n`)

  if (documents.length === 0) {
    console.log('✅ No documents to process')
    return
  }

  let totalProcessed = 0
  let totalEmbedded = 0

  for (const doc of documents) {
    console.log(`\n👤 Persona: ${doc.persona.name}`)
    const result = await processDocument(doc)
    totalProcessed += result.processed
    totalEmbedded += result.embedded
  }

  console.log('\n' + '='.repeat(50))
  console.log('✅ Processing complete!')
  console.log(`📊 Total: ${totalProcessed} chunks, ${totalEmbedded} embedded`)
  console.log('='.repeat(50))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
