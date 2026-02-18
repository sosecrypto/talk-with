import { useState, useCallback } from 'react'

type ExportFormat = 'json' | 'markdown'

export function useExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportConversation = useCallback(async (conversationId: string, format: ExportFormat) => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}/export?format=${format}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const disposition = response.headers.get('Content-Disposition')
      const filenameMatch = disposition?.match(/filename="(.+?)"/)
      const filename = filenameMatch?.[1] || `export.${format}`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }, [])

  return { isExporting, exportConversation }
}
