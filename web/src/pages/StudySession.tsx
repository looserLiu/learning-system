import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useStudyStore } from '../stores/studyStore'
import { toast } from 'sonner'
import { Pause, Play, Square, Clock } from 'lucide-react'
import { formatDuration } from '../lib/format'

export function StudySession() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const { sessionId, elapsed, isRunning, start, pause, resume, end, tick } = useStudyStore()

  const { data: knowledge } = useQuery({
    queryKey: ['knowledge', id],
    queryFn: async () => (await api.get(`/knowledge/${id}`)).data,
    enabled: !!id,
  })

  const startMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/progress/sessions', { knowledgeId: id, type: 'learn' })
      return res.data
    },
    onSuccess: (data) => {
      start(data.knowledgeId, data.id)
    },
  })

  const endMutation = useMutation({
    mutationFn: async () => {
      return api.put(`/progress/sessions/${sessionId}/end`, { sessionId, rating, progressPercent: 100 })
    },
    onSuccess: () => {
      toast.success('学习完成！下次复习已安排')
      end()
      navigate('/knowledge')
    },
  })

  useEffect(() => {
    if (!sessionId && id) {
      startMutation.mutate()
    }
  }, [id])

  useEffect(() => {
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const ratings = [
    { value: 0, label: '完全忘了', color: 'bg-red-100 text-red-700 border-red-300' },
    { value: 1, label: '困难', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { value: 3, label: '一般', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: 4, label: '容易', color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 5, label: '完美', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  ]

  if (!knowledge) return <div className="text-center py-12 text-gray-500">加载中...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">{knowledge.title}</h1>
        <p className="text-sm text-gray-500 mb-8">专注学习，间隔重复助您牢牢记住</p>

        {/* Timer */}
        <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-primary-50 border-4 border-primary-200 mb-8">
          <div>
            <Clock className="w-6 h-6 text-primary-400 mx-auto mb-2" />
            <span className="text-3xl font-mono font-bold text-primary-700">
              {formatDuration(elapsed)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {isRunning ? (
            <button
              onClick={pause}
              className="p-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-full transition"
            >
              <Pause className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={resume}
              className="p-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-full transition"
            >
              <Play className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={() => {
              if (rating === 0) {
                toast.error('请评价本次学习效果')
                return
              }
              endMutation.mutate()
            }}
            disabled={endMutation.isPending}
            className="p-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition"
          >
            <Square className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Rating */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          学习完成后，评价您对这部分内容的掌握程度
        </h3>
        <div className="flex flex-wrap gap-2">
          {ratings.map((r) => (
            <button
              key={r.value}
              onClick={() => setRating(r.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                rating === r.value ? r.color + ' ring-2 ring-offset-1' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
