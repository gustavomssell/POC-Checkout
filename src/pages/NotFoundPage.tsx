import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

/** Rota `*` — página não encontrada. */
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <p className="text-6xl font-bold text-muted-foreground">404</p>
        <h1 className="text-2xl font-bold text-foreground">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          O endereço acessado não existe ou foi movido.
        </p>
        <Button render={<Link to="/checkouts" />}>Voltar para checkouts</Button>
      </div>
    </div>
  )
}
