'use client'

import { useState } from 'react'
import type { MessageFeedback } from '@/types/chat'

const FEEDBACK_TYPES = [
  { value: 'accuracy', label: 'Accuracy', description: 'Factual correctness' },
  { value: 'style', label: 'Style', description: 'Writing style & tone' },
  { value: 'helpfulness', label: 'Helpfulness', description: 'How useful was this' },
  { value: 'other', label: 'Other', description: 'Other feedback' },
] as const

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: MessageFeedback) => void
  initialThumbsUp: boolean
}

export function FeedbackModal({ isOpen, onClose, onSubmit, initialThumbsUp }: FeedbackModalProps) {
  const [feedbackType, setFeedbackType] = useState<MessageFeedback['feedbackType']>()
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(0)

  if (!isOpen) return null

  const handleSubmit = () => {
    onSubmit({
      thumbsUp: initialThumbsUp,
      feedbackType: feedbackType || undefined,
      comment: comment.trim() || undefined,
      rating: rating > 0 ? rating : undefined,
    })
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Detailed Feedback
        </h3>

        {/* Feedback Type */}
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Category</p>
          <div className="grid grid-cols-2 gap-2">
            {FEEDBACK_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => setFeedbackType(type.value)}
                className={`p-2 rounded-lg border text-sm text-left transition-colors ${
                  feedbackType === type.value
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <span className="font-medium">{type.label}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-colors"
              >
                <svg
                  className={`w-6 h-6 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Comment</p>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Any additional thoughts..."
            className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            maxLength={500}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  )
}
