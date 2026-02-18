'use client'

import { useEffect, useState } from 'react'
import { StatCard } from '@/components/admin/StatCard'

interface Stats {
  userCount: number
  conversationCount: number
  messageCount: number
  totalTokens: number
  sourceCount: number
  documentCount: number
  chunkCount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <div className="text-gray-500">Loading stats...</div>
  }

  if (!stats) {
    return <div className="text-red-500">Failed to load stats</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Users" value={stats.userCount} />
        <StatCard title="Conversations" value={stats.conversationCount} />
        <StatCard title="Messages" value={stats.messageCount} />
        <StatCard title="Total Tokens" value={stats.totalTokens} />
        <StatCard title="Sources" value={stats.sourceCount} />
        <StatCard title="Documents" value={stats.documentCount} />
        <StatCard title="Chunks" value={stats.chunkCount} />
      </div>
    </div>
  )
}
