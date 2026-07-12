import { AIProvider } from './types.ts'
import { OllamaProvider } from './ollama.ts'
import { OpenAIProvider } from './openai.ts'
import config from '../../../config.js'
import logger from '../../../logger.js'

let primaryProvider: AIProvider | null = null
let fallbackProvider: AIProvider | null = null

export function getPrimaryProvider(): AIProvider {
  if (!primaryProvider) {
    if (config.aiProvider === 'openai' && config.openaiApiKey) {
      primaryProvider = new OpenAIProvider()
    } else {
      primaryProvider = new OllamaProvider()
    }
  }
  return primaryProvider
}

export function getFallbackProvider(): AIProvider {
  if (!fallbackProvider) {
    // If primary is ollama, try OpenAI as fallback. If primary is OpenAI, use Ollama
    if (config.aiProvider === 'ollama' && config.openaiApiKey) {
      fallbackProvider = new OpenAIProvider()
    } else {
      fallbackProvider = new OllamaProvider()
    }
  }
  return fallbackProvider
}

export async function getWorkingProvider(): Promise<AIProvider> {
  const primary = getPrimaryProvider()
  if (await primary.healthcheck()) {
    return primary
  }

  logger.warn({ primary: config.aiProvider }, 'Primary AI provider unhealthy, trying fallback')
  const fallback = getFallbackProvider()
  if (await fallback.healthcheck()) {
    return fallback
  }

  throw new Error('No AI provider available')
}
