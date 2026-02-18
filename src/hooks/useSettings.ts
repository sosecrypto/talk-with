import { useState, useEffect, useCallback } from 'react'

interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  defaultPersona: string | null
  language: string
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  defaultPersona: null,
  language: 'ko',
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch settings')
        return res.json()
      })
      .then(data => setSettings(data))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!res.ok) throw new Error('Failed to update settings')

    const data = await res.json()
    setSettings(data)
    return data
  }, [])

  const updateProfile = useCallback(async (updates: { name?: string; image?: string }) => {
    const res = await fetch('/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!res.ok) throw new Error('Failed to update profile')
    return res.json()
  }, [])

  const deleteAllConversations = useCallback(async () => {
    const res = await fetch('/api/settings/conversations', { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete conversations')
    const data = await res.json()
    return data.deletedCount as number
  }, [])

  return {
    settings,
    isLoading,
    updateSettings,
    updateProfile,
    deleteAllConversations,
  }
}
