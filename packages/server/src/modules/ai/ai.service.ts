import { eq, and, desc } from 'drizzle-orm'
import { db } from '@lms/db'
import { aiConversations, knowledgeItems } from '@lms/db'
import { getWorkingProvider } from './providers/index.ts'
import { ChatMessage } from './providers/types.ts'
import { explainCodePrompt, generateQuizPrompt, recommendTopicPrompt, chatPrompt } from './prompts.ts'
import { ErrorCode, AppError } from '@lms/shared'
import logger from '../../logger.ts'

type AiAction = 'explain_code' | 'generate_quiz' | 'recommend_topic' | 'chat'

export async function explainCode(userId: string, code: string, language?: string) {
  const provider = await getWorkingProvider()
  const messages = explainCodePrompt(code, language)

  let fullResponse = ''
  let totalTokens = 0

  for await (const chunk of provider.chat(messages)) {
    fullResponse += chunk.content
    if (chunk.usage) {
      totalTokens += chunk.usage.completionTokens
    }
  }

  await logUsage(userId, provider.getModelInfo().id, 'explain_code', totalTokens)
  return { response: fullResponse, tokens: totalTokens }
}

export async function generateQuiz(userId: string, knowledgeId: string, difficulty?: string) {
  const [item] = await db.select().from(knowledgeItems).where(eq(knowledgeItems.id, knowledgeId))
  if (!item) throw new AppError(ErrorCode.NOT_FOUND, '知识条目不存在')

  const provider = await getWorkingProvider()
  const messages = generateQuizPrompt(item.content, difficulty)

  let fullResponse = ''
  let totalTokens = 0

  for await (const chunk of provider.chat(messages)) {
    fullResponse += chunk.content
    if (chunk.usage) totalTokens += chunk.usage.completionTokens
  }

  // Try to parse as JSON, fallback to raw text
  let quiz
  try {
    const match = fullResponse.match(/\{[\s\S]*\}/)
    quiz = match ? JSON.parse(match[0]) : { raw: fullResponse }
  } catch {
    quiz = { raw: fullResponse }
  }

  await logUsage(userId, provider.getModelInfo().id, 'generate_quiz', totalTokens)
  return { quiz, tokens: totalTokens }
}

export async function recommendTopics(userId: string) {
  // Get user's recent knowledge history
  const recentItems = await db.select({ title: knowledgeItems.title })
    .from(knowledgeItems)
    .where(eq(knowledgeItems.userId, userId))
    .orderBy(desc(knowledgeItems.createdAt))
    .limit(10)

  const history = recentItems.map(k => k.title)
  const provider = await getWorkingProvider()
  const messages = recommendTopicPrompt(history, [])

  let fullResponse = ''
  let totalTokens = 0

  for await (const chunk of provider.chat(messages)) {
    fullResponse += chunk.content
    if (chunk.usage) totalTokens += chunk.usage.completionTokens
  }

  await logUsage(userId, provider.getModelInfo().id, 'recommend_topic', totalTokens)
  return { recommendations: fullResponse, tokens: totalTokens }
}

export async function aiChat(userId: string, message: string, knowledgeId?: string, conversationId?: string) {
  const provider = await getWorkingProvider()

  // Build conversation messages
  let messages = chatPrompt()
  let existingMessages: ChatMessage[] = []

  // Load previous conversation if exists
  if (conversationId) {
    const [conv] = await db.select().from(aiConversations).where(
      and(eq(aiConversations.id, conversationId), eq(aiConversations.userId, userId))
    )
    if (conv) {
      existingMessages = (conv.messages as ChatMessage[]) || []
      if (conv.knowledgeId) {
        const [kItem] = await db.select().from(knowledgeItems).where(eq(knowledgeItems.id, conv.knowledgeId))
        if (kItem) {
          messages = chatPrompt(kItem.title + '\\n' + kItem.content.slice(0, 500))
        }
      }
    }
  }

  // Inject existing messages and new user message
  const allMessages = [...messages, ...existingMessages, { role: 'user' as const, content: message }]

  let fullResponse = ''
  let totalTokens = 0

  for await (const chunk of provider.chat(allMessages)) {
    fullResponse += chunk.content
    if (chunk.usage) totalTokens += chunk.usage.completionTokens
  }

  // Save/update conversation
  const updatedMessages = [...allMessages, { role: 'assistant' as const, content: fullResponse }]
  
  let convId = conversationId
  if (convId) {
    await db.update(aiConversations).set({
      messages: updatedMessages,
      totalTokens: totalTokens,
      updatedAt: new Date(),
    }).where(eq(aiConversations.id, convId))
  } else {
    const [newConv] = await db.insert(aiConversations).values({
      userId,
      knowledgeId: knowledgeId || null,
      model: provider.getModelInfo().id,
      messages: updatedMessages,
      totalTokens,
    }).returning()
    convId = newConv.id
  }

  await logUsage(userId, provider.getModelInfo().id, 'chat', totalTokens)
  return { response: fullResponse, conversationId: convId, tokens: totalTokens }
}

async function logUsage(userId: string, model: string, action: string, tokens: number) {
  logger.info({ userId, model, action, tokens }, 'AI usage')
}
