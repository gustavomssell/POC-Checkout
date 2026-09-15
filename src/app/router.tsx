import { Navigate, createBrowserRouter, type RouteObject } from 'react-router-dom'
import {
  CheckoutEditorPage,
  DashboardPage,
  FlowBuilderPage,
  NotFoundPage,
} from '@/pages'
import { RouteErrorBoundary } from './RouteErrorBoundary'

export const routes: RouteObject[] = [
  { path: '/', element: <Navigate to="/checkouts" replace /> },
  {
    path: '/checkouts',
    element: <DashboardPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/checkouts/:checkoutId',
    element: <CheckoutEditorPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/checkouts/:checkoutId/flow',
    element: <FlowBuilderPage />,
    errorElement: <RouteErrorBoundary />,
  },
  { path: '*', element: <NotFoundPage /> },
]

/** Cria o router da aplicação (instância única em App). */
export function createAppRouter() {
  return createBrowserRouter(routes)
}
