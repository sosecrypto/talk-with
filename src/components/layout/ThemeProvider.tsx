'use client'

import { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') return getSystemTheme()
  return theme
}

const STORAGE_KEY = 'twl-theme'

// External store for theme (avoids setState-in-effect lint issues)
let currentTheme: Theme = 'system'
let listeners: Array<() => void> = []

function getSnapshot(): Theme {
  return currentTheme
}

function getServerSnapshot(): Theme {
  return 'system'
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter(l => l !== listener)
  }
}

function setStoreTheme(theme: Theme) {
  currentTheme = theme
  listeners.forEach(l => l())
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const resolved = resolveTheme(theme)

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const initial = stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'system'
    if (initial !== currentTheme) {
      setStoreTheme(initial)
    }
    document.documentElement.classList.toggle('dark', resolveTheme(initial) === 'dark')
  }, [])

  // Apply dark class whenever resolved theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [resolved])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (currentTheme === 'system') {
        // Re-trigger by updating store (same value but listeners fire)
        setStoreTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme)
    setStoreTheme(newTheme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
