import { useState } from 'react'
import { api } from '../../lib/api'
import { FileText, HelpCircle, Lightbulb, Loader2, Sparkles } from 'lucide-react'

interface Props {
  knowledgeId?: string
  content?: string
}

export function AiActions({ knowledgeId, content }: Props) {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExplainCode = async () => {
    if (!content) return
    setActiveAction('explain')
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/ai/explain', { code: content })
      setResult(res.data.response)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '解释失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQuiz = async () => {
    if (!knowledgeId) return
    setActiveAction('quiz')
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/ai/quiz', { knowledgeId })
      setResult(res.data.quiz)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '生成题目失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRecommend = async () => {
    setActiveAction('recommend')
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/ai/recommend')
      setResult(res.data.recommendations)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '获取推荐失败')
    } finally {
      setLoading(false)
    }
  }

  const actions = [
    { id: 'explain', label: '代码解释', icon: FileText, handler: handleExplainCode, needsCode: true },
    { id: 'quiz', label: '生成测验', icon: HelpCircle, handler: handleGenerateQuiz, needsKnowledge: true },
    { id: 'recommend', label: '学习推荐', icon: Lightbulb, handler: handleRecommend, needsCode: false },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary-500" />
        <span className="font-medium text-sm text-gray-900">AI 工具</span>
      </div>

      <div className="space-y-2">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={action.handler}
            disabled={
              loading ||
              (action.needsCode && !content) ||
              (action.needsKnowledge && !knowledgeId)
            }
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <action.icon className="w-4 h-4" />
            {action.label}
            {loading && activeAction === action.id && (
              <Loader2 className="w-3 h-3 ml-auto animate-spin" />
            )}
          </button>
        ))}
      </div>

      {/* Result */}
      {(result || error) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {error && <p className="text-red-500 text-xs">{error}</p>}
          {result && !error && (
            <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
