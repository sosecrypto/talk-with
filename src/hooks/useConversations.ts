'use client'

import { useState, useEffect, useCallback } from 'react'
import { Conversation } from '@/types/chat'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/conversations')
      if (!response.ok) throw new Error('Failed to fetch conversations')
      const data = await response.json()
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchConversation = useCallback(async (id: string): Promise<Conversation | null> => {
    try {
      const response = await fetch(`/api/conversations/${id}`)
      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    }
  }, [])

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete conversation')
      setConversations((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  const addConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => [conversation, ...prev])
  }, [])

  const updateConversation = useCallback((id: string, updates: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    fetchConversation,
    deleteConversation,
    addConversation,
    updateConversation,
  }
}
