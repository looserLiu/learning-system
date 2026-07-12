import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { KnowledgeList } from './pages/KnowledgeList'
import { KnowledgeDetail } from './pages/KnowledgeDetail'
import { StudySession } from './pages/StudySession'
import { Stats } from './pages/Stats'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="knowledge" element={<KnowledgeList />} />
        <Route path="knowledge/:id" element={<KnowledgeDetail />} />
        <Route path="knowledge/:id/study" element={<StudySession />} />
        <Route path="stats" element={<Stats />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
