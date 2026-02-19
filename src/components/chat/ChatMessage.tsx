'use client'

import { useState } from 'react'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Message, MessageFeedback } from '@/types/chat'
import { Persona } from '@/hooks/usePersonas'
import { FeedbackModal } from './FeedbackModal'

interface FeedbackState {
  thumbsUp: boolean
}

interface ChatMessageProps {
  message: Message
  persona?: Persona | null
  isLast?: boolean
  conversationId?: string
  feedbackState?: FeedbackState
  onFeedbackSubmit?: (messageId: string, feedback: MessageFeedback) => void
}

export function ChatMessage({ message, persona, conversationId, feedbackState, onFeedbackSubmit }: ChatMessageProps) {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [pendingThumbsUp, setPendingThumbsUp] = useState(true)
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      {/* Assistant Avatar */}
      {!isUser && persona && (
        <div className="flex-shrink-0 mr-4">
          <div className="relative">
            {/* Glow ring */}
            <div
              className="absolute -inset-1 rounded-xl blur-sm opacity-60"
              style={{ backgroundColor: persona.accentColor ?? undefined }}
            />
            {persona.imageUrl ? (
              <Image
                src={persona.imageUrl}
                alt={persona.name}
                width={40}
                height={40}
                className="relative w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-800"
              />
            ) : (
              <div
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold ring-2 ring-white dark:ring-slate-800"
                style={{ backgroundColor: persona.accentColor ?? undefined }}
              >
                {persona.name[0]}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`relative max-w-[75%] group ${
          isUser
            ? 'bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25'
            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700'
        } ${
          isUser ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-tl-md'
        } px-5 py-4`}
      >
        {/* Persona Name Tag */}
        {!isUser && persona && (
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-xs font-semibold"
              style={{ color: persona.accentColor ?? undefined }}
            >
              {persona.name}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              AI Response
            </span>
          </div>
        )}

        {/* Message Content */}
        <div className={`prose prose-sm max-w-none ${isUser ? '' : 'dark:prose-invert'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words m-0 leading-relaxed">
              {message.content}
            </p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="whitespace-pre-wrap break-words leading-relaxed my-2 first:mt-0 last:mb-0">
                    {children}
                  </p>
                ),
                code: ({ children, className }) => {
                  const isInline = !className
                  return isInline ? (
                    <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  ) : (
                    <code className={className}>{children}</code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-4 overflow-x-auto my-3">
                    {children}
                  </pre>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id}>
                {attachment.type === 'image' ? (
                  <Image
                    src={attachment.url}
                    alt={attachment.name}
                    width={320}
                    height={240}
                    className="max-w-xs rounded-xl shadow-md"
                    unoptimized
                  />
                ) : (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    {attachment.name}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message Actions (visible on hover) */}
        {!isUser && (
          <div className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
            {/* Copy button */}
            <button
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Copy"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            {/* ThumbsUp */}
            <button
              onClick={() => {
                if (!feedbackState && onFeedbackSubmit) {
                  onFeedbackSubmit(message.id, { thumbsUp: true })
                }
              }}
              disabled={!!feedbackState}
              className={`p-1.5 rounded-lg transition-colors ${
                feedbackState?.thumbsUp === true
                  ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                  : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              } disabled:cursor-default`}
              title="Helpful"
            >
              <svg className="w-4 h-4" fill={feedbackState?.thumbsUp === true ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
              </svg>
            </button>
            {/* ThumbsDown */}
            <button
              onClick={() => {
                if (!feedbackState && onFeedbackSubmit) {
                  onFeedbackSubmit(message.id, { thumbsUp: false })
                }
              }}
              disabled={!!feedbackState}
              className={`p-1.5 rounded-lg transition-colors ${
                feedbackState?.thumbsUp === false
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
                  : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              } disabled:cursor-default`}
              title="Not helpful"
            >
              <svg className="w-4 h-4" fill={feedbackState?.thumbsUp === false ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 15v3.586a1 1 0 01-.293.707l-.293.293A1 1 0 018 20H7a2 2 0 01-2-2v-5a2 2 0 012-2h3.28a2 2 0 011.94 1.515l1.45 5.8A2 2 0 0111.73 20H10zM7 2h3a2 2 0 012 2v5a2 2 0 01-2 2H7V2zm0 0H4a2 2 0 00-2 2v7a2 2 0 002 2h3V2z" />
              </svg>
            </button>
            {/* Detail Feedback */}
            {feedbackState && conversationId && (
              <button
                onClick={() => {
                  setPendingThumbsUp(feedbackState.thumbsUp)
                  setShowFeedbackModal(true)
                }}
                className="text-xs text-violet-500 hover:text-violet-600 ml-1 transition-colors"
              >
                Detail
              </button>
            )}
          </div>
        )}
        {showFeedbackModal && onFeedbackSubmit && (
          <FeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
            onSubmit={(feedback) => onFeedbackSubmit(message.id, feedback)}
            initialThumbsUp={pendingThumbsUp}
          />
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 ml-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/25">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
