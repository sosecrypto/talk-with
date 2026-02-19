export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  conversationId: string
  attachments?: Attachment[]
  createdAt: Date
}

export interface Attachment {
  id: string
  url: string
  type: 'image' | 'document'
  name: string
  messageId: string
  createdAt: Date
}

export interface Conversation {
  id: string
  title: string | null
  userId: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatState {
  conversations: Conversation[]
  currentConversation: Conversation | null
  isLoading: boolean
  isStreaming: boolean
  error: string | null
}

export interface SendMessageParams {
  content: string
  conversationId?: string
  attachments?: File[]
}

export interface MessageFeedback {
  thumbsUp: boolean
  feedbackType?: 'accuracy' | 'style' | 'helpfulness' | 'other'
  comment?: string
  rating?: number
}
