'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'

interface AdminSource {
  id: string
  name: string
  type: string
  status: string
  lastFetchedAt: string | null
  totalDocuments: number
  totalFetches: number
  successFetches: number
  failedFetches: number
  consecutiveFailures: number
  lastError: string | null
  persona: { name: string; slug: string }
}

export default function AdminDataPage() {
  const [sources, setSources] = useState<AdminSource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/sources')
      .then(res => res.json())
      .then(setSources)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const columns = [
    { key: 'persona', header: 'Persona', render: (s: AdminSource) => s.persona.name },
    { key: 'name', header: 'Source' },
    { key: 'type', header: 'Type', render: (s: AdminSource) => s.type.replace(/_/g, ' ') },
    { key: 'status', header: 'Status', render: (s: AdminSource) => <StatusBadge status={s.status} /> },
    { key: 'totalDocuments', header: 'Docs' },
    { key: 'lastFetchedAt', header: 'Last Fetch', render: (s: AdminSource) =>
      s.lastFetchedAt ? new Date(s.lastFetchedAt).toLocaleString() : '-'
    },
    { key: 'failures', header: 'Failures', render: (s: AdminSource) => (
      <span className={s.consecutiveFailures > 0 ? 'text-red-500' : ''}>
        {s.failedFetches} ({s.consecutiveFailures} consecutive)
      </span>
    )},
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Data Sources</h1>
      <DataTable data={sources} columns={columns} isLoading={isLoading} />
    </div>
  )
}
