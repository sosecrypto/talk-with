import { Message } from '@/types/chat'

interface ExportOptions {
  personaName?: string
  messages: Message[]
  exportDate: string
}

export function exportToMarkdown({ personaName, messages, exportDate }: ExportOptions): string {
  const name = personaName || 'AI'
  const lines: string[] = []

  lines.push(`# Talk With Legends - ${name}`)
  lines.push(``)
  lines.push(`Date: ${exportDate}`)
  lines.push(`Messages: ${messages.length}`)
  lines.push(``)
  lines.push(`---`)
  lines.push(``)

  for (const msg of messages) {
    const sender = msg.role === 'user' ? 'You' : name
    lines.push(`**${sender}:**`)
    lines.push(``)

    // Attachments
    if (msg.attachments?.length) {
      for (const att of msg.attachments) {
        if (att.type === 'image') {
          lines.push(`![${att.name}](${att.url})`)
          lines.push(``)
        }
      }
    }

    lines.push(msg.content)
    lines.push(``)
    lines.push(`---`)
    lines.push(``)
  }

  return lines.join('\n')
}
