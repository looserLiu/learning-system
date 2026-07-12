import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Heatmap } from '../components/domain/Heatmap'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export function Stats() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => (await api.get('/progress/stats')).data,
  })

  const { data: heatmap } = useQuery({
    queryKey: ['heatmap'],
    queryFn: async () => (await api.get('/progress/heatmap')).data,
  })

  const overview = stats?.overview || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">学习统计</h1>
        <p className="text-gray-500 mt-1">查看您的学习进度和趋势</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="总学习时长" value={`${overview.totalHours || 0}h`} />
        <StatCard label="学习次数" value={`${overview.totalSessions || 0}`} />
        <StatCard label="连续天数" value={`${overview.currentStreak || 0} 天`} />
        <StatCard label="待复习" value={`${overview.dueToday || 0} 项`} />
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">学习热力图</h2>
        {heatmap && <Heatmap data={heatmap} />}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}
