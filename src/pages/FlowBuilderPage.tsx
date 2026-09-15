import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { FlowBuilder } from '@/components/flow-builder'
import { useCheckoutStore } from '@/stores/checkoutStore'

/** Rota `/checkouts/:checkoutId/flow` — fluxo do checkout. */
export function FlowBuilderPage() {
  const { checkoutId } = useParams<{ checkoutId: string }>()
  const navigate = useNavigate()
  const loadTemplate = useCheckoutStore((s) => s.loadTemplate)
  const template = useCheckoutStore((s) =>
    checkoutId ? s.templates.find((t) => t.id === checkoutId) : undefined,
  )

  useEffect(() => {
    if (template) {
      loadTemplate(template.id)
    }
  }, [template, loadTemplate])

  if (!checkoutId || !template) {
    return <Navigate to="/checkouts" replace />
  }

  return <FlowBuilder onBack={() => navigate(`/checkouts/${template.id}`)} />
}
