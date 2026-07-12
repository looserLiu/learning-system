export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

export interface ChatChunk {
  content: string
  finishReason?: 'stop' | 'length'
  usage?: { promptTokens: number; completionTokens: number }
}

export interface ModelInfo {
  id: string
  name: string
  contextWindow: number
  provider: string
}

export interface AIProvider {
  chat(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<ChatChunk>
  complete(messages: ChatMessage[], options?: ChatOptions): Promise<string>
  countTokens(text: string): number
  getModelInfo(): ModelInfo
  healthcheck(): Promise<boolean>
}
