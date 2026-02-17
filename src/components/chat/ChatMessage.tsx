'use client'

import Image from 'next/image'
import { Message } from '@/types/chat'
import { Persona } from '@/hooks/usePersonas'

interface ChatMessageProps {
  message: Message
  persona?: Persona | null
  isLast?: boolean
}

export function ChatMessage({ message, persona }: ChatMessageProps) {
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
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap break-words m-0 leading-relaxed">
            {message.content}
          </p>
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
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
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
