import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore.ts'
import { Layout } from './components/layout/Layout.ts'
import { Login } from './pages/Login.ts'
import { Register } from './pages/Register.ts'
import { Dashboard } from './pages/Dashboard.ts'
import { KnowledgeList } from './pages/KnowledgeList.ts'
import { KnowledgeDetail } from './pages/KnowledgeDetail.ts'
import { StudySession } from './pages/StudySession.ts'
import { Stats } from './pages/Stats.ts'
import { Achievements } from './pages/Achievements.ts'

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
        <Route path="achievements" element={<Achievements />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
