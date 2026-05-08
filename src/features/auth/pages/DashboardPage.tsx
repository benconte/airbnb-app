import { useAuth } from '../hooks/useAuth'
import { useStore } from '../../../store/useStore'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const { user, logout } = useAuth()
  const {
    state: { saved },
  } = useStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <main className="page-container page-pad">
      <section className="dashboard-card space-y-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-lg text-gray-700">Welcome back, <span className="font-semibold">{user?.name || 'Guest'}</span>!</p>
        <p className="text-gray-600">{saved.length} saved listings</p>
        <button className="h-10 px-4 rounded-xl bg-[#ff4a26] text-white font-semibold hover:opacity-90 transition-opacity" type="button" onClick={handleLogout}>
          Logout
        </button>
      </section>
    </main>
  )
}
