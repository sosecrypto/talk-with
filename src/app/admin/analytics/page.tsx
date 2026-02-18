'use client'

import { useEffect, useState } from 'react'

interface PersonaStat {
  personaId: string
  name: string
  slug: string
  conversationCount: number
  avgRating: number | null
}

export default function AdminAnalyticsPage() {
  const [personaStats, setPersonaStats] = useState<PersonaStat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => setPersonaStats(data.personaStats || []))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <div className="text-gray-500">Loading analytics...</div>

  const maxConversations = Math.max(...personaStats.map(p => p.conversationCount), 1)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Conversations by Persona</h2>
        <div className="space-y-3">
          {personaStats.map(stat => (
            <div key={stat.personaId} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{stat.name}</div>
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full flex items-center justify-end px-2"
                    style={{ width: `${(stat.conversationCount / maxConversations) * 100}%`, minWidth: '2rem' }}
                  >
                    <span className="text-xs text-white font-medium">{stat.conversationCount}</span>
                  </div>
                </div>
              </div>
              <div className="w-16 text-right text-sm text-gray-500">
                {stat.avgRating ? `${stat.avgRating.toFixed(1)}` : '-'}
              </div>
            </div>
          ))}
          {personaStats.length === 0 && (
            <p className="text-gray-500 text-center py-4">No conversation data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
