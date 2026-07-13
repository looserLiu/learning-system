import { AIProvider, ChatMessage, ChatOptions, ChatChunk, ModelInfo } from './types.js'
import config from '../../../config.js'

// Dynamic import to avoid dependency when not using OpenAI
let OpenAIClass: any = null

async function getOpenAI() {
  if (!OpenAIClass) {
    const mod = await import('openai')
    OpenAIClass = mod.default
  }
  return OpenAIClass
}

export class OpenAIProvider implements AIProvider {
  private client: any = null
  private model: string

  constructor() {
    this.model = config.openaiModel
  }

  private async getClient() {
    if (!this.client) {
      const OpenAI = await getOpenAI()
      this.client = new OpenAI({ apiKey: config.openaiApiKey })
    }
    return this.client
  }

  async *chat(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<ChatChunk> {
    const client = await this.getClient()
    const stream = await client.chat.completions.create({
      model: this.model,
      messages: messages.map(m => ({ role: m.role as any, content: m.content })),
      stream: true,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? ''
      const finishReason = chunk.choices[0]?.finish_reason
      yield {
        content,
        finishReason: finishReason || undefined,
      }
    }
  }

  async complete(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    let result = ''
    for await (const chunk of this.chat(messages, options)) {
      result += chunk.content
    }
    return result
  }

  countTokens(text: string): number {
    // Rough estimate
    return Math.ceil(text.length / 4)
  }

  getModelInfo(): ModelInfo {
    return {
      id: this.model,
      name: this.model,
      contextWindow: 128000,
      provider: 'openai',
    }
  }

  async healthcheck(): Promise<boolean> {
    try {
      const client = await this.getClient()
      await client.models.list()
      return true
    } catch {
      return false
    }
  }
}
