'use client'

import { useState, useRef, KeyboardEvent, ChangeEvent, DragEvent } from 'react'
import Image from 'next/image'
import { Persona } from '@/hooks/usePersonas'

interface ImagePreview {
  file: File
  previewUrl: string
}

interface ChatInputProps {
  onSend: (message: string, attachments?: ImagePreview[]) => void
  disabled?: boolean
  placeholder?: string
  persona?: Persona | null
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder,
  persona,
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [images, setImages] = useState<ImagePreview[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultPlaceholder = persona
    ? `Ask ${persona.name} anything...`
    : 'Start typing your message...'

  const handleSend = () => {
    if ((message.trim() || images.length > 0) && !disabled) {
      onSend(message.trim(), images.length > 0 ? images : undefined)
      setMessage('')
      setImages([])
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    addImageFiles(Array.from(files))
    e.target.value = ''
  }

  const addImageFiles = (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    const newPreviews = imageFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setImages(prev => [...prev, ...newPreviews].slice(0, 4))
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const removed = prev[index]
      URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    addImageFiles(files)
  }

  const accentColor = persona?.accentColor || '#8B5CF6'

  return (
    <div
      className="relative border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-t from-slate-50 via-white to-transparent dark:from-slate-900 dark:via-slate-900 dark:to-transparent"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 bg-violet-500/10 border-2 border-dashed border-violet-400 rounded-lg flex items-center justify-center">
          <p className="text-violet-600 dark:text-violet-400 font-medium">Drop images here</p>
        </div>
      )}

      {/* Decorative top line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-32 opacity-50"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex gap-2 mb-2 px-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <Image
                  src={img.previewUrl}
                  alt={img.file.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-bl-lg text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className={`relative flex items-end gap-3 p-2 rounded-2xl transition-all duration-300 ${
            isFocused
              ? 'bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 ring-2'
              : 'bg-slate-100/80 dark:bg-slate-800/80'
          }`}
          style={{
            '--tw-ring-color': isFocused ? `${accentColor}50` : 'transparent',
          } as React.CSSProperties}
        >
          {/* Persona indicator */}
          {persona && (
            <div
              className="absolute -top-3 left-4 px-2 py-0.5 rounded-full text-xs font-medium text-white shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              Chatting with {persona.name}
            </div>
          )}

          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
            title="Attach image"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            data-testid="file-input"
          />

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder || defaultPlaceholder}
            disabled={disabled}
            rows={1}
            enterKeyHint="send"
            data-testid="chat-textarea"
            className="flex-1 resize-none bg-transparent px-2 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none disabled:opacity-50 text-[15px] leading-relaxed"
          />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={disabled || (!message.trim() && images.length === 0)}
              data-testid="chat-send-button"
              className="flex-shrink-0 p-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              style={{
                backgroundColor: (message.trim() || images.length > 0) ? accentColor : '#94A3B8',
                boxShadow: (message.trim() || images.length > 0) ? `0 10px 30px -10px ${accentColor}80` : 'none',
              }}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${message.trim() ? 'translate-x-0.5' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Helper text */}
        <div className="hidden sm:flex items-center justify-between mt-2 px-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">Shift + Enter</kbd> for new line
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Powered by Claude AI
          </p>
        </div>
      </div>
    </div>
  )
}
