import { ChatMessage } from './providers/types.js'

export function explainCodePrompt(code: string, language?: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `你是一位专业的编程导师，擅长用简洁易懂的方式解释代码。
- 先概括代码的整体功能
- 逐段解释关键逻辑
- 指出可能的问题或改进点
- 使用中文回答`,
    },
    {
      role: 'user',
      content: `${language ? `语言: ${language}
` : ''}请解释以下代码:
\`\`\`
${code}
\`\`\``,
    },
  ]
}

export function generateQuizPrompt(content: string, difficulty = 'intermediate'): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `你是一位出题专家，根据学习内容生成测验题。
- 生成 3 道选择题和 2 道简答题
- 难度: ${difficulty}
- 提供答案和简要解析
- 使用严格的 JSON 格式返回:
{
  "questions": [
    { "type": "multiple_choice", "question": "...", "options": ["A","B","C","D"], "answer": "A", "explanation": "..." },
    { "type": "short_answer", "question": "...", "answer": "..." }
  ]
}`,
    },
    {
      role: 'user',
      content: `基于以下内容生成测验:
${content.slice(0, 2000)}`,
    },
  ]
}

export function recommendTopicPrompt(learningHistory: string[], interests: string[]): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `你是一位学习规划导师，根据用户的学习历史和兴趣推荐下一步学习内容。
- 分析学习模式和知识缺口
- 推荐 3-5 个具体的学习主题
- 每个主题给出推荐理由和预估学习时间
- 使用中文回答`,
    },
    {
      role: 'user',
      content: `学习历史: ${learningHistory.join(', ') || '暂无'}
兴趣: ${interests.join(', ') || '未指定'}

推荐接下来应该学习什么？`,
    },
  ]
}

export function chatPrompt(knowledgeContext?: string): ChatMessage[] {
  const system = `你是一位 AI 学习助手，帮助用户理解和掌握知识。
- 回答简洁、准确、有针对性
- 鼓励用户思考，而不是直接给答案
- 使用中文回答`

  const messages: ChatMessage[] = [{ role: 'system', content: system }]
  
  if (knowledgeContext) {
    messages.push({
      role: 'user',
      content: `当前关联的知识条目:
${knowledgeContext}`,
    })
    messages.push({
      role: 'assistant',
      content: '我已了解关联知识，请问有什么问题？',
    })
  }

  return messages
}
