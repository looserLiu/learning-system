import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.ts'
import { useAuthStore } from '../stores/authStore.ts'
import { Heatmap } from '../components/domain/Heatmap.ts'
import { Flame, Clock, BookOpen, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Dashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => (await api.get('/progress/stats')).data,
  })

  const { data: heatmap } = useQuery({
    queryKey: ['heatmap'],
    queryFn: async () => (await api.get('/progress/heatmap')).data,
  })

  const { data: knowledge } = useQuery({
    queryKey: ['knowledge-list'],
    queryFn: async () => (await api.get('/knowledge?limit=5')).data,
  })

  const overview = stats?.overview || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          欢迎回来，{user?.displayName || '学习者'}！
        </h1>
        <p className="text-gray-500 mt-1">继续您的学习之旅</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="总学习时长"
          value={`${overview.totalHours || 0} 小时`}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="学习次数"
          value={`${overview.totalSessions || 0} 次`}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="连续天数"
          value={`${overview.currentStreak || 0} 天`}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="今日待复习"
          value={`${overview.dueToday || 0} 项`}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">学习热力图</h2>
        {heatmap && <Heatmap data={heatmap} />}
      </div>

      {/* Due Items & Recent Knowledge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Today */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">今日待复习</h2>
            <Link
              to="/knowledge"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              查看全部
            </Link>
          </div>
          {stats?.dueItems?.length > 0 ? (
            <div className="space-y-3">
              {stats.dueItems.slice(0, 5).map((item: any) => (
                <Link
                  key={item.id}
                  to={`/knowledge/${item.knowledgeId}/study`}
                  className="block p-3 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition"
                >
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    间隔 {item.intervalDays} 天 · 重复 {item.repsCount} 次
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">今天没有需要复习的内容</p>
          )}
        </div>

        {/* Recent Knowledge */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">最近知识</h2>
            <Link
              to="/knowledge"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              查看全部
            </Link>
          </div>
          {knowledge?.items?.length > 0 ? (
            <div className="space-y-3">
              {knowledge.items.map((item: any) => (
                <Link
                  key={item.id}
                  to={`/knowledge/${item.id}`}
                  className="block p-3 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition"
                >
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-500">{item.difficulty}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">还没有知识条目，去创建第一个吧</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex p-2.5 rounded-lg ${color}`}>{icon}</div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
