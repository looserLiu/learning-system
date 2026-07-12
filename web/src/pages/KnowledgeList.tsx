import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { toast } from 'sonner'
import { Plus, Search, Filter } from 'lucide-react'
import { KnowledgeForm } from '../components/domain/KnowledgeForm'

export function KnowledgeList() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedTag, setSelectedTag] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', { search, tag: selectedTag }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (selectedTag) params.set('tag', selectedTag)
      return (await api.get(`/knowledge?${params}`)).data
    },
  })

  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => (await api.get('/knowledge/tags')).data,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/knowledge/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] })
      toast.success('已删除')
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">知识库</h1>
          <p className="text-gray-500 mt-1">管理您的学习内容</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建知识
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索知识..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        {tags?.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            {tags.map((tag: any) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(selectedTag === tag.name ? '' : tag.name)}
                className={`px-3 py-1 text-xs rounded-full border transition ${
                  selectedTag === tag.name
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'border-gray-300 text-gray-600 hover:border-primary-300'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Knowledge List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : data?.items?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((item: any) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition group"
            >
              <Link to={`/knowledge/${item.id}`} className="block">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {item.content.slice(0, 100)}...
                </p>
              </Link>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                    {item.type}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {item.difficulty}
                  </span>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                >
                  删除
                </button>
              </div>
              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.map((tag: string) => (
                    <span key={tag} className="text-xs text-primary-600">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">暂无知识条目</div>
      )}

      {showForm && <KnowledgeForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
