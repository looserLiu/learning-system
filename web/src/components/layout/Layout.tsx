import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { BookOpen, LayoutDashboard, Library, BarChart3, LogOut, Menu } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/knowledge', icon: Library, label: '知识库' },
  { to: '/stats', icon: BarChart3, label: '统计' },
]

export function Layout() {
  const { user, clearAuth } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-0 -ml-64'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden lg:w-64 lg:ml-0`}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-primary-600">
            <BookOpen className="w-6 h-6" />
            <span className="font-bold text-lg">学习系统</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
              {user?.displayName?.[0] || user?.email?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-6">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
