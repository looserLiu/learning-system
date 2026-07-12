import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Trophy, Lock, Star } from 'lucide-react'

export function Achievements() {
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => (await api.get('/achievements')).data,
  })

  if (isLoading) return <div className="text-center py-12 text-gray-500">加载中...</div>

  const unlocked = achievements?.filter((a: any) => a.unlocked) || []
  const locked = achievements?.filter((a: any) => !a.unlocked) || []
  const totalPoints = unlocked.reduce((sum: number, a: any) => sum + (a.points || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">成就</h1>
        <p className="text-gray-500 mt-1">你的学习里程碑</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{unlocked.length}</p>
          <p className="text-xs text-gray-500">已解锁</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{locked.length}</p>
          <p className="text-xs text-gray-500">未解锁</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <Star className="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
          <p className="text-xs text-gray-500">总积分</p>
        </div>
      </div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">已解锁</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unlocked.map((a: any) => (
              <div key={a.id} className="bg-white rounded-xl border border-yellow-200 p-4 flex items-center gap-3">
                <span className="text-2xl">{a.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.description}</p>
                </div>
                <span className="text-sm font-medium text-yellow-600">+{a.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">未解锁</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {locked.map((a: any) => (
              <div key={a.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-3 opacity-70">
                <span className="text-2xl grayscale">{a.icon || '🔒'}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-700">{a.name}</p>
                  <p className="text-xs text-gray-500">{a.description}</p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-400 rounded-full" style={{ width: `${a.progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-400">{a.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
