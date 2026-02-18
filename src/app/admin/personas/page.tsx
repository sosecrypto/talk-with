'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'

interface AdminPersona {
  id: string
  slug: string
  name: string
  nameKo: string | null
  visibility: string
  isActive: boolean
  totalDocuments: number
  totalChunks: number
  totalConversations: number
  avgRating: number | null
}

export default function AdminPersonasPage() {
  const [personas, setPersonas] = useState<AdminPersona[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/personas')
      .then(res => res.json())
      .then(setPersonas)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  const columns = [
    { key: 'name', header: 'Name', render: (p: AdminPersona) => (
      <Link href={`/admin/personas/${p.slug}`} className="font-medium text-blue-600 hover:underline">
        {p.name} {p.nameKo && <span className="text-gray-400 text-xs">({p.nameKo})</span>}
      </Link>
    )},
    { key: 'visibility', header: 'Status', render: (p: AdminPersona) => (
      <div className="flex gap-1">
        <StatusBadge status={p.visibility} />
        {!p.isActive && <StatusBadge status="ARCHIVED" />}
      </div>
    )},
    { key: 'totalDocuments', header: 'Docs' },
    { key: 'totalChunks', header: 'Chunks' },
    { key: 'totalConversations', header: 'Chats' },
    { key: 'avgRating', header: 'Rating', render: (p: AdminPersona) => p.avgRating?.toFixed(1) || '-' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personas</h1>
      </div>
      <DataTable data={personas} columns={columns} isLoading={isLoading} />
    </div>
  )
}
