'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useSettings } from '@/hooks/useSettings'
import { useTheme } from '@/components/layout/ThemeProvider'

interface Persona {
  slug: string
  name: string
  imageUrl: string | null
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { settings, isLoading, updateSettings, updateProfile, deleteAllConversations } = useSettings()
  const { setTheme } = useTheme()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [profileName, setProfileName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/personas')
      .then(res => res.json())
      .then(data => setPersonas(data.personas || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (session?.user?.name) {
      setProfileName(session.user.name)
    }
  }, [session])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    try {
      await updateSettings({ theme })
      setTheme(theme)
      showMessage('success', 'Theme updated')
    } catch {
      showMessage('error', 'Failed to update theme')
    }
  }

  const handleDefaultPersonaChange = async (slug: string | null) => {
    try {
      await updateSettings({ defaultPersona: slug })
      showMessage('success', 'Default persona updated')
    } catch {
      showMessage('error', 'Failed to update default persona')
    }
  }

  const handleProfileSave = async () => {
    if (!profileName.trim()) return
    setIsSaving(true)
    try {
      await updateProfile({ name: profileName.trim() })
      showMessage('success', 'Profile updated')
    } catch {
      showMessage('error', 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAll = async () => {
    try {
      const count = await deleteAllConversations()
      showMessage('success', `${count} conversations deleted`)
      setShowDeleteConfirm(false)
    } catch {
      showMessage('error', 'Failed to delete conversations')
    }
  }

  if (isLoading) {
    return <div className="text-gray-500 text-center py-12">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Theme Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h2>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map(theme => (
            <button
              key={theme}
              onClick={() => handleThemeChange(theme)}
              className={`p-4 rounded-lg border-2 text-center transition-colors ${
                settings.theme === theme
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">
                {theme === 'light' ? '\u2600\uFE0F' : theme === 'dark' ? '\uD83C\uDF19' : '\uD83D\uDCBB'}
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{theme}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile</h2>
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                {session?.user?.name?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label htmlFor="profileName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                id="profileName"
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
            </div>
            <button
              onClick={handleProfileSave}
              disabled={isSaving || !profileName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </section>

      {/* Default Persona Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Default Persona</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Choose a default persona for new conversations.
        </p>
        <select
          value={settings.defaultPersona || ''}
          onChange={e => handleDefaultPersonaChange(e.target.value || null)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">None (show persona grid)</option>
          {personas.map(p => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      </section>

      {/* Data Management Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Delete all conversations</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
            </div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Delete All
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  Confirm Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
