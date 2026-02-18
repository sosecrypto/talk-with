'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/admin/StatusBadge'

interface PersonaDetail {
  id: string
  slug: string
  name: string
  nameKo: string | null
  visibility: string
  isActive: boolean
  bio: string | null
  bioShort: string | null
  totalDocuments: number
  totalChunks: number
  totalConversations: number
}

export default function AdminPersonaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [persona, setPersona] = useState<PersonaDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/personas')
      .then(res => res.json())
      .then((personas: PersonaDetail[]) => {
        const found = personas.find(p => p.slug === slug)
        setPersona(found || null)
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [slug])

  const handleSave = async (field: string, value: string) => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/personas/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (res.ok) {
        const updated = await res.json()
        setPersona(prev => prev ? { ...prev, ...updated } : null)
      }
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to deactivate this persona?')) return
    try {
      await fetch(`/api/admin/personas/${slug}`, { method: 'DELETE' })
      router.push('/admin/personas')
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  if (isLoading) return <div className="text-gray-500">Loading...</div>
  if (!persona) return <div className="text-red-500">Persona not found</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{persona.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={persona.visibility} />
            <span className="text-sm text-gray-500">/{persona.slug}</span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          Deactivate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">Documents</p>
          <p className="text-xl font-bold">{persona.totalDocuments}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">Chunks</p>
          <p className="text-xl font-bold">{persona.totalChunks}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500">Conversations</p>
          <p className="text-xl font-bold">{persona.totalConversations}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Edit Persona</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio Short</label>
            <input
              type="text"
              defaultValue={persona.bioShort || ''}
              onBlur={e => handleSave('bioShort', e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visibility</label>
            <select
              defaultValue={persona.visibility}
              onChange={e => handleSave('visibility', e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="DRAFT">Draft</option>
              <option value="INTERNAL">Internal</option>
              <option value="BETA">Beta</option>
              <option value="PUBLIC">Public</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
