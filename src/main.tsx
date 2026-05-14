import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import 'nprogress/nprogress.css'
import './index.css'
import { App } from './App'
import { AuthProvider } from './features/auth/context/AuthContext'
import { StoreProvider } from './store/StoreContext'
import { TooltipProvider } from './shared/ui/tooltip'
import { Toaster } from './shared/ui/sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StoreProvider>
          <TooltipProvider>
            <AuthProvider>
              <Toaster position="bottom-right" />
              <App />
            </AuthProvider>
          </TooltipProvider>
        </StoreProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' />
    </QueryClientProvider>
  </StrictMode>,
)
