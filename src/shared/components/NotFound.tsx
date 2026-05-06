import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="page-container page-pad">
      <section className="dashboard-card">
        <h1>404</h1>
        <p>Page not found.</p>
        <Link className="auth-button auth-link-button" to="/">
          Back to home
        </Link>
      </section>
    </main>
  )
}
