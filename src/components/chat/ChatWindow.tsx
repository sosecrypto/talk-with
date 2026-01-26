'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/types/chat'
import { Persona } from '@/hooks/usePersonas'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'

interface ChatWindowProps {
  messages: Message[]
  isStreaming: boolean
  onSendMessage: (content: string) => void
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Talk With Legends
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {selectedPersona
                  ? `You're chatting with ${selectedPersona.name}`
                  : 'Select a legend to start a conversation'}
              </p>
            </div>

            {/* Selected Persona Card */}
            {selectedPersona && (
              <div
                className="mb-8 p-6 rounded-2xl text-white max-w-md w-full"
                style={{ backgroundColor: selectedPersona.accentColor || '#3B82F6' }}
              >
                <div className="flex items-center gap-4">
                  {selectedPersona.imageUrl ? (
                    <img
                      src={selectedPersona.imageUrl}
                      alt={selectedPersona.name}
                      className="w-16 h-16 rounded-full object-cover border-3 border-white/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                      {selectedPersona.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{selectedPersona.name}</h3>
                    {selectedPersona.nameKo && (
                      <p className="text-white/70">{selectedPersona.nameKo}</p>
                    )}
                  </div>
                </div>
                {selectedPersona.bioShort && (
                  <p className="mt-4 text-white/90 text-sm">{selectedPersona.bioShort}</p>
                )}
                {selectedPersona.totalDocuments > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-white/70 text-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    <span>{selectedPersona.totalDocuments} sources indexed</span>
                  </div>
                )}
              </div>
            )}

            {/* Persona Grid (when no persona selected) */}
            {!selectedPersona && personas.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl w-full px-4">
                {personas.slice(0, 8).map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => onSelectPersona?.(persona)}
                    className="group p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all text-left"
                  >
                    <div className="flex flex-col items-center text-center">
                      {persona.imageUrl ? (
                        <img
                          src={persona.imageUrl}
                          alt={persona.name}
                          className="w-16 h-16 rounded-full object-cover mb-3 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: persona.accentColor || '#6B7280' }}
                        >
                          {persona.name[0]}
                        </div>
                      )}
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {persona.name}
                      </h4>
                      {persona.nameKo && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{persona.nameKo}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Empty State (no personas) */}
            {!selectedPersona && personas.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm">Send a message to begin chatting</p>
              </div>
            )}

            {/* Suggestion prompts */}
            {selectedPersona && (
              <div className="mt-6 max-w-2xl w-full px-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
                  Try asking:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    `What's your view on the future of AI?`,
                    `What's the most important lesson you've learned?`,
                    `How do you approach difficult decisions?`,
                    `What advice would you give to young entrepreneurs?`,
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(prompt)}
                      className="p-3 text-left text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} persona={selectedPersona} />
            ))}
            {isStreaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={onSendMessage} disabled={isStreaming} persona={selectedPersona} />
    </div>
  )
}
