import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import 'nprogress/nprogress.css'
import './index.css'
import { App } from './App'
import { AuthProvider } from './features/auth/context/AuthContext'
import { StoreProvider } from './store/StoreContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <AuthProvider>
          <Toaster position="bottom-right" />
          <App />
        </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
