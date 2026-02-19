'use client'

import { useState, useCallback } from 'react'

interface FeedbackPayload {
  thumbsUp: boolean
  feedbackType?: string
  comment?: string
  rating?: number
}

interface FeedbackState {
  thumbsUp: boolean
}

export function useFeedback(conversationId: string | undefined) {
  const [feedbackMap, setFeedbackMap] = useState<Record<string, FeedbackState>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitFeedback = useCallback(async (messageId: string, payload: FeedbackPayload) => {
    if (!conversationId || feedbackMap[messageId]) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, ...payload }),
      })

      if (response.ok) {
        setFeedbackMap(prev => ({
          ...prev,
          [messageId]: { thumbsUp: payload.thumbsUp },
        }))
      }
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false)
    }
  }, [conversationId, feedbackMap])

  return { feedbackMap, isSubmitting, submitFeedback }
}
