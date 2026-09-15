import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ToastProvider } from '@/components/ui/toast'

interface AppProvidersProps {
  children: ReactNode
}

/** Provedores globais da aplicação (tema do sistema + toasts). */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  )
}
