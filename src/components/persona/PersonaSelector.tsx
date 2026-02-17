'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Persona } from '@/hooks/usePersonas'

interface PersonaSelectorProps {
  personas: Persona[]
  selectedPersona: Persona | null
  onSelect: (persona: Persona | null) => void
  isLoading?: boolean
}

export function PersonaSelector({
  personas,
  selectedPersona,
  onSelect,
  isLoading,
}: PersonaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPersonas = personas.filter(
    (persona) =>
      persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.nameKo?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (persona: Persona | null) => {
    onSelect(persona)
    setIsOpen(false)
    setSearchQuery('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full" />
        <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all min-w-[160px] max-w-[220px] ${
          selectedPersona
            ? 'bg-gradient-to-r text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        style={
          selectedPersona?.accentColor
            ? { backgroundColor: selectedPersona.accentColor }
            : undefined
        }
      >
        {selectedPersona ? (
          <>
            {selectedPersona.imageUrl ? (
              <Image
                src={selectedPersona.imageUrl}
                alt={selectedPersona.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border-2 border-white/30 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {selectedPersona.name[0]}
              </div>
            )}
            <span className="font-medium truncate">{selectedPersona.name}</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-gray-500 dark:text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <span className="text-gray-600 dark:text-gray-300">Select Legend</span>
          </>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown Panel */}
          <div className="absolute top-full left-0 mt-2 w-64 max-h-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Search legends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Options */}
            <div className="max-h-72 overflow-y-auto">
              {/* Default Option */}
              <button
                onClick={() => handleSelect(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !selectedPersona ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900 dark:text-white">General Assistant</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Chat without a specific persona
                  </p>
                </div>
              </button>

              {/* Persona Options */}
              {filteredPersonas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => handleSelect(persona)}
                  className={`relative w-full overflow-hidden transition-all ${
                    selectedPersona?.id === persona.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* Background Image */}
                  {persona.imageUrl ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${persona.imageUrl})` }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: persona.accentColor || '#6B7280' }}
                    />
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

                  {/* Content */}
                  <div className="relative flex items-center gap-3 px-4 py-4">
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-white drop-shadow-sm">
                        {persona.name}
                      </p>
                      {persona.nameKo && (
                        <p className="text-white/70 text-xs">
                          {persona.nameKo}
                        </p>
                      )}
                    </div>
                    {persona.totalDocuments > 0 && (
                      <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full">
                        {persona.totalDocuments}
                      </span>
                    )}
                  </div>
                </button>
              ))}

              {filteredPersonas.length === 0 && searchQuery && (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No legends found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
