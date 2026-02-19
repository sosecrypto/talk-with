'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ConversationList } from '@/components/chat/ConversationList'
import { PersonaSelector } from '@/components/persona/PersonaSelector'
import { useChat } from '@/hooks/useChat'
import { useConversations } from '@/hooks/useConversations'
import { usePersonas, Persona } from '@/hooks/usePersonas'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useExport } from '@/hooks/useExport'
import { useSettings } from '@/hooks/useSettings'
import Link from 'next/link'

export default function ChatPage() {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMediaQuery('(max-width: 767px)')
  const { isExporting, exportConversation } = useExport()
  const { settings: userSettings } = useSettings()
  const [showExportMenu, setShowExportMenu] = useState(false)

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

  // Auto-select default persona from user settings
  useEffect(() => {
    if (
      userSettings.defaultPersona &&
      !selectedPersona &&
      personas.length > 0 &&
      messages.length === 0
    ) {
      const defaultP = personas.find(p => p.slug === userSettings.defaultPersona)
      if (defaultP) selectPersona(defaultP)
    }
  }, [userSettings.defaultPersona, personas, selectedPersona, selectPersona, messages.length])

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

  const handleSendMessage = (content: string, attachments?: Array<{ file: File; previewUrl: string }>) => {
    sendMessage(content, selectedPersona?.slug, attachments)
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="flex h-dvh bg-white dark:bg-gray-900">
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden`
        } border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col`}
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
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={40}
                height={40}
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
            <Link
              href="/settings"
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
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
                  <Image
                    src={selectedPersona.imageUrl}
                    alt={selectedPersona.name}
                    width={20}
                    height={20}
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

          {/* Export Button */}
          {conversationId && messages.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-50"
                title="Export conversation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1">
                    <button
                      onClick={() => { exportConversation(conversationId, 'json'); setShowExportMenu(false) }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => { exportConversation(conversationId, 'markdown'); setShowExportMenu(false) }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Markdown
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

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
            conversationId={conversationId ?? undefined}
          />
        </div>
      </div>
    </div>
  )
}
