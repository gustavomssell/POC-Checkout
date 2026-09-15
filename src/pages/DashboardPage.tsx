import { useNavigate } from 'react-router-dom'
import { Dashboard } from '@/components/dashboard'

/** Rota `/checkouts` — lista de checkouts. */
export function DashboardPage() {
  const navigate = useNavigate()

  return (
    <Dashboard
      onOpenCheckout={(id) => navigate(`/checkouts/${id}`)}
      onOpenFlow={(id) => navigate(`/checkouts/${id}/flow`)}
    />
  )
}
