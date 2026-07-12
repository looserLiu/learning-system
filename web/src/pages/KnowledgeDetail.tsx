import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { AiChat } from '../components/domain/AiChat'
import { AiActions } from '../components/domain/AiActions'
import { Play, ArrowLeft, Tag } from 'lucide-react'
import { formatDate } from '../lib/format'

export function KnowledgeDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: item, isLoading } = useQuery({
    queryKey: ['knowledge', id],
    queryFn: async () => (await api.get(`/knowledge/${id}`)).data,
    enabled: !!id,
  })

  if (isLoading) return <div className="text-center py-12 text-gray-500">加载中...</div>
  if (!item) return <div className="text-center py-12 text-gray-500">知识条目不存在</div>

  return (
    <div className="space-y-6">
      <Link to="/knowledge" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="w-4 h-4" /> 返回知识库
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <article className="bg-white rounded-xl border border-gray-200 p-8">
            <header className="mb-6 pb-6 border-b border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  item.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                  item.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {item.difficulty === 'beginner' ? '入门' : item.difficulty === 'intermediate' ? '进阶' : '高级'}
                </span>
                <span>{item.type === 'article' ? '文章' : item.type === 'code' ? '代码' : item.type}</span>
                {item.estimatedMinutes && <span>预计 {item.estimatedMinutes} 分钟</span>}
                <span>更新于 {formatDate(item.updatedAt)}</span>
              </div>
              {item.tags?.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {item.tags.map((tag: string) => (
                    <span key={tag} className="text-sm text-primary-600">#{tag}</span>
                  ))}
                </div>
              )}
            </header>

            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
              {item.content}
            </div>
          </article>

          {/* Study button */}
          <Link
            to={`/knowledge/${id}/study`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            开始学习
          </Link>
        </div>

        {/* AI sidebar */}
        <div className="space-y-4">
          <AiActions knowledgeId={item.id} content={item.type === 'code' ? item.content : undefined} />
          <AiChat knowledgeId={item.id} knowledgeTitle={item.title} />
        </div>
      </div>
    </div>
  )
}
