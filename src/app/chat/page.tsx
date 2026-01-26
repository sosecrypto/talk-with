'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ConversationList } from '@/components/chat/ConversationList'
import { PersonaSelector } from '@/components/persona/PersonaSelector'
import { useChat } from '@/hooks/useChat'
import { useConversations } from '@/hooks/useConversations'
import { usePersonas, Persona } from '@/hooks/usePersonas'

export default function ChatPage() {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const {
    personas,
    isLoading: personasLoading,
    selectedPersona,
    selectPersona,
  } = usePersonas()

  const {
    messages,
    isStreaming,
    conversationId,
    title,
    sendMessage,
    loadConversation,
    resetChat,
    setActivePersona,
  } = useChat()

  const {
    conversations,
    fetchConversation,
    deleteConversation,
    updateConversation,
  } = useConversations()

  // Sync persona selection with chat hook
  useEffect(() => {
    setActivePersona(selectedPersona?.slug || null)
  }, [selectedPersona, setActivePersona])

  useEffect(() => {
    if (title && conversationId) {
      updateConversation(conversationId, { title })
    }
  }, [title, conversationId, updateConversation])

  const handleSelectConversation = async (conversation: { id: string }) => {
    const fullConversation = await fetchConversation(conversation.id)
    if (fullConversation) {
      loadConversation(fullConversation)
    }
  }

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id)
    if (conversationId === id) {
      resetChat()
    }
  }

  const handleSelectPersona = (persona: Persona | null) => {
    selectPersona(persona)
    // Reset chat when changing persona
    if (messages.length > 0) {
      resetChat()
    }
  }

  const handleSelectPersonaFromGrid = (persona: Persona) => {
    selectPersona(persona)
  }

  const handleSendMessage = (content: string) => {
    sendMessage(content, selectedPersona?.slug)
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } transition-all duration-300 overflow-hidden border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Talk With Legends</h1>
        </div>

        {/* Persona Selector in Sidebar */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <PersonaSelector
            personas={personas}
            selectedPersona={selectedPersona}
            onSelect={handleSelectPersona}
            isLoading={personasLoading}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            currentConversationId={conversationId}
            onSelect={handleSelectConversation}
            onNewChat={resetChat}
            onDelete={handleDeleteConversation}
          />
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {session?.user?.name?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Sign out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          {/* Title with Persona Badge */}
          <div className="flex-1 flex items-center gap-3">
            {selectedPersona && (
              <div
                className="flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm"
                style={{ backgroundColor: selectedPersona.accentColor || '#3B82F6' }}
              >
                {selectedPersona.imageUrl ? (
                  <img
                    src={selectedPersona.imageUrl}
                    alt={selectedPersona.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {selectedPersona.name[0]}
                  </span>
                )}
                <span>{selectedPersona.name}</span>
              </div>
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title || (selectedPersona ? `Chat with ${selectedPersona.name}` : 'New Chat')}
            </h2>
          </div>

          {/* Clear Persona Button */}
          {selectedPersona && (
            <button
              onClick={() => handleSelectPersona(null)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              title="Clear persona"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={handleSendMessage}
            selectedPersona={selectedPersona}
            personas={personas}
            onSelectPersona={handleSelectPersonaFromGrid}
          />
        </div>
      </div>
    </div>
  )
}
