import { useAuth } from '../hooks/useAuth'
import { useStore } from '../../../store/useStore'

export function DashboardPage() {
  const { logout } = useAuth()
  const {
    state: { saved },
  } = useStore()

  return (
    <main className="page-container page-pad">
      <section className="dashboard-card">
        <h1>Dashboard</h1>
        <p>Welcome back.</p>
        <p>{saved.length} saved listings</p>
        <button className="auth-button" type="button" onClick={logout}>
          Logout
        </button>
      </section>
    </main>
  )
}
