'use client'

import { Message } from '@/types/chat'
import { Persona } from '@/hooks/usePersonas'

interface ChatMessageProps {
  message: Message
  persona?: Persona | null
}

export function ChatMessage({ message, persona }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {/* Assistant Avatar */}
      {!isUser && persona && (
        <div className="flex-shrink-0 mr-3">
          {persona.imageUrl ? (
            <img
              src={persona.imageUrl}
              alt={persona.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: persona.accentColor || '#6B7280' }}
            >
              {persona.name[0]}
            </div>
          )}
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white'
            : persona
            ? 'text-gray-900 dark:text-gray-100'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
        style={
          !isUser && persona
            ? { backgroundColor: `${persona.accentColor}15` || '#F3F4F6' }
            : undefined
        }
      >
        {!isUser && persona && (
          <div className="text-xs font-medium mb-1" style={{ color: persona.accentColor || '#6B7280' }}>
            {persona.name}
          </div>
        )}
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="text-sm opacity-80">
                {attachment.type === 'image' ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-w-xs rounded-lg"
                  />
                ) : (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {attachment.name}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
