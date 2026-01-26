'use client'

import { useState, useCallback } from 'react'
import { Message, Conversation } from '@/types/chat'

interface UseChatOptions {
  onError?: (error: string) => void
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [title, setTitle] = useState<string | null>(null)
  const [personaSlug, setPersonaSlug] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string, currentPersonaSlug?: string | null) => {
      if (!content.trim() || isStreaming) return

      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        conversationId: conversationId || '',
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsStreaming(true)

      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        conversationId: conversationId || '',
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      try {
        // Use passed personaSlug or current state
        const activePersonaSlug = currentPersonaSlug !== undefined ? currentPersonaSlug : personaSlug

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            conversationId,
            personaSlug: activePersonaSlug,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader available')

        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.error) {
                  options.onError?.(data.error)
                  break
                }

                if (data.conversationId && !conversationId) {
                  setConversationId(data.conversationId)
                }

                if (data.personaSlug) {
                  setPersonaSlug(data.personaSlug)
                }

                if (data.title) {
                  setTitle(data.title)
                }

                if (data.text) {
                  setMessages((prev) => {
                    const updated = [...prev]
                    const lastMessage = updated[updated.length - 1]
                    if (lastMessage && lastMessage.role === 'assistant') {
                      updated[updated.length - 1] = {
                        ...lastMessage,
                        content: lastMessage.content + data.text,
                      }
                    }
                    return updated
                  })
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      } catch (error) {
        console.error('Chat error:', error)
        options.onError?.(error instanceof Error ? error.message : 'Unknown error')
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setIsStreaming(false)
      }
    },
    [conversationId, isStreaming, personaSlug, options]
  )

  const loadConversation = useCallback((conversation: Conversation) => {
    setConversationId(conversation.id)
    setTitle(conversation.title)
    setMessages(conversation.messages)
    // Load persona slug if available in conversation
    if ('personaSlug' in conversation) {
      setPersonaSlug((conversation as Conversation & { personaSlug?: string }).personaSlug || null)
    }
  }, [])

  const resetChat = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setTitle(null)
    // Don't reset personaSlug - keep the selected persona
  }, [])

  const setActivePersona = useCallback((slug: string | null) => {
    setPersonaSlug(slug)
  }, [])

  return {
    messages,
    isStreaming,
    conversationId,
    title,
    personaSlug,
    sendMessage,
    loadConversation,
    resetChat,
    setActivePersona,
  }
}
