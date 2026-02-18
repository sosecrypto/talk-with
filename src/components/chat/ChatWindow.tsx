'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Message } from '@/types/chat'
import { Persona } from '@/hooks/usePersonas'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

interface ImagePreview {
  file: File
  previewUrl: string
}

interface ChatWindowProps {
  messages: Message[]
  isStreaming: boolean
  onSendMessage: (content: string, attachments?: ImagePreview[]) => void
  selectedPersona?: Persona | null
  personas?: Persona[]
  onSelectPersona?: (persona: Persona) => void
}

export function ChatWindow({
  messages,
  isStreaming,
  onSendMessage,
  selectedPersona,
  personas = [],
  onSelectPersona,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Persona Background Image */}
      {selectedPersona?.imageUrl && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-contain bg-center bg-no-repeat opacity-[0.04] dark:opacity-[0.06]"
            style={{ backgroundImage: `url(${selectedPersona.imageUrl})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${selectedPersona.accentColor}05 0%, transparent 50%)`,
            }}
          />
        </div>
      )}

      {/* Messages Container */}
      <div className="relative flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-200/30 to-pink-200/30 dark:from-violet-900/20 dark:to-pink-900/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-200/30 to-blue-200/30 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Hero Section */}
            <div className="relative z-10 text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-pink-500/10 dark:from-violet-500/20 dark:to-pink-500/20 border border-violet-200/50 dark:border-violet-700/50 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-pink-600 dark:from-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
                  AI-Powered Conversations
                </span>
              </div>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-violet-800 to-slate-900 dark:from-white dark:via-violet-300 dark:to-white bg-clip-text text-transparent mb-4 tracking-tight">
                Talk With Legends
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {selectedPersona
                  ? `Experience authentic conversations with ${selectedPersona.name}`
                  : 'Connect with visionary minds and legendary figures'}
              </p>
            </div>

            {/* Selected Persona Card */}
            {selectedPersona && (
              <div className="relative z-10 mb-10 w-full max-w-lg">
                <div
                  className="relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl"
                  style={{
                    background: `linear-gradient(135deg, ${selectedPersona.accentColor}15, ${selectedPersona.accentColor}05)`,
                    border: `1px solid ${selectedPersona.accentColor}30`,
                  }}
                >
                  {/* Glow Effect */}
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-50"
                    style={{ backgroundColor: selectedPersona.accentColor ?? undefined }}
                  />

                  <div className="relative flex items-center gap-6">
                    {selectedPersona.imageUrl ? (
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-2xl blur-xl opacity-60"
                          style={{ backgroundColor: selectedPersona.accentColor ?? undefined }}
                        />
                        <Image
                          src={selectedPersona.imageUrl}
                          alt={selectedPersona.name}
                          width={96}
                          height={96}
                          className="relative w-24 h-24 rounded-2xl object-cover ring-4 ring-white/50 dark:ring-white/20"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-2xl"
                        style={{ backgroundColor: selectedPersona.accentColor ?? undefined }}
                      >
                        {selectedPersona.name[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3
                        className="text-2xl font-bold mb-1"
                        style={{ color: selectedPersona.accentColor ?? undefined }}
                      >
                        {selectedPersona.name}
                      </h3>
                      {selectedPersona.nameKo && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                          {selectedPersona.nameKo}
                        </p>
                      )}
                      {selectedPersona.totalDocuments > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-white/10 text-xs font-medium text-slate-600 dark:text-slate-300">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {selectedPersona.totalDocuments} sources indexed
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedPersona.bioShort && (
                    <p className="relative mt-6 text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedPersona.bioShort}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Persona Grid */}
            {!selectedPersona && personas.length > 0 && (
              <div className="relative z-10 w-full max-w-5xl px-2 sm:px-4">
                <h3 className="text-center text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-8">
                  Choose a Legend
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {personas.slice(0, 8).map((persona, idx) => (
                    <button
                      key={persona.id}
                      onClick={() => onSelectPersona?.(persona)}
                      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50"
                      style={{
                        animationDelay: `${idx * 100}ms`,
                      }}
                    >
                      {/* Hover Glow */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                        style={{ background: `radial-gradient(circle at center, ${persona.accentColor}20, transparent)` }}
                      />

                      <div className="relative flex flex-col items-center">
                        {persona.imageUrl ? (
                          <div className="relative mb-4">
                            <div
                              className="absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                              style={{ backgroundColor: persona.accentColor ?? undefined }}
                            />
                            <Image
                              src={persona.imageUrl}
                              alt={persona.name}
                              width={80}
                              height={80}
                              className="relative w-20 h-20 rounded-xl object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                            style={{ backgroundColor: persona.accentColor ?? undefined }}
                          >
                            {persona.name[0]}
                          </div>
                        )}
                        <h4 className="font-semibold text-slate-800 dark:text-white text-center transition-colors duration-300">
                          {persona.name}
                        </h4>
                        {persona.nameKo && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{persona.nameKo}</p>
                        )}

                        {/* Hover Arrow */}
                        <div
                          className="mt-3 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                          style={{ color: persona.accentColor ?? undefined }}
                        >
                          <span>Start Chat</span>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!selectedPersona && personas.length === 0 && (
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                  <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <p className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Ready to Chat</p>
                <p className="text-slate-500 dark:text-slate-400">Select a persona to begin your conversation</p>
              </div>
            )}

            {/* Quick Prompts */}
            {selectedPersona && (
              <div className="relative z-10 w-full max-w-2xl px-4 mt-8">
                <p className="text-center text-sm font-medium text-slate-400 dark:text-slate-500 mb-4">
                  Suggested Questions
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    `What's your vision for the future of technology?`,
                    `What's the most important lesson you've learned?`,
                    `How do you approach solving complex problems?`,
                    `What advice would you give to aspiring leaders?`,
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(prompt)}
                      className="group relative overflow-hidden text-left p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/30 dark:hover:shadow-slate-900/30"
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: `linear-gradient(135deg, ${selectedPersona.accentColor}08, transparent)` }}
                      />
                      <p className="relative text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-white transition-colors duration-300">
                        {prompt}
                      </p>
                      <div className="relative mt-2 flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ color: selectedPersona.accentColor ?? undefined }}>
                        <span>Ask this</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
            {messages.map((message, idx) => (
              <ChatMessage
                key={message.id}
                message={message}
                persona={selectedPersona}
                isLast={idx === messages.length - 1}
              />
            ))}

            {/* Streaming Indicator */}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex items-start gap-4 mb-6">
                {selectedPersona && (
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg"
                    style={{ backgroundColor: selectedPersona.accentColor ?? undefined }}
                  >
                    {selectedPersona.imageUrl ? (
                      <Image src={selectedPersona.imageUrl} alt="" width={40} height={40} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      selectedPersona.name[0]
                    )}
                  </div>
                )}
                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSend={onSendMessage} disabled={isStreaming} persona={selectedPersona} />
    </div>
  )
}
