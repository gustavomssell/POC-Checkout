import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/** Fallback de erro das rotas (errorElement). */
export function RouteErrorBoundary() {
  const error = useRouteError()

  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Algo inesperado aconteceu.'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-foreground">Ops! Algo deu errado</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button render={<Link to="/checkouts" />}>Voltar para checkouts</Button>
      </div>
    </div>
  )
}
