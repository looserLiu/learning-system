import { AIProvider, ChatMessage, ChatOptions, ChatChunk, ModelInfo } from './types.js'
import config from '../../../config.js'

export class OllamaProvider implements AIProvider {
  private baseUrl: string
  private model: string

  constructor() {
    this.baseUrl = config.ollamaBaseUrl.replace(/\/$/, '')
    this.model = config.ollamaModel
  }

  async *chat(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<ChatChunk> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 1000,
        },
      }),
      signal: options?.signal,
    })

    if (!res.ok) {
      throw new Error(`Ollama error: ${res.status} ${res.statusText}`)
    }

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value)
      const lines = text.split('\\n').filter(Boolean)

      for (const line of lines) {
        try {
          const json = JSON.parse(line)
          if (json.message?.content) {
            yield { content: json.message.content }
          }
          if (json.done) {
            yield {
              content: '',
              finishReason: 'stop',
              usage: {
                promptTokens: json.prompt_eval_count ?? 0,
                completionTokens: json.eval_count ?? 0,
              },
            }
          }
        } catch {
          // skip invalid JSON
        }
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
    // Rough estimate: ~4 chars per token for English, ~1.5 for Chinese
    return Math.ceil(text.length / 3)
  }

  getModelInfo(): ModelInfo {
    return {
      id: this.model,
      name: this.model,
      contextWindow: 8192,
      provider: 'ollama',
    }
  }

  async healthcheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })
      return res.ok
    } catch {
      return false
    }
  }
}
