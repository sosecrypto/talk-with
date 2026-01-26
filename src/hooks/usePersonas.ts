'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Persona {
  id: string
  slug: string
  name: string
  nameKo: string | null
  imageUrl: string | null
  bioShort: string | null
  color: string | null
  accentColor: string | null
  totalDocuments: number
  totalConversations: number
}

interface UsePersonasResult {
  personas: Persona[]
  isLoading: boolean
  error: string | null
  selectedPersona: Persona | null
  selectPersona: (persona: Persona | null) => void
  fetchPersonas: () => Promise<void>
}

export function usePersonas(): UsePersonasResult {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)

  const fetchPersonas = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/personas')
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch personas')
      }

      setPersonas(data.personas)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPersonas()
  }, [fetchPersonas])

  const selectPersona = useCallback((persona: Persona | null) => {
    setSelectedPersona(persona)
  }, [])

  return {
    personas,
    isLoading,
    error,
    selectedPersona,
    selectPersona,
    fetchPersonas,
  }
}
