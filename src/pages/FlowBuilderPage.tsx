import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { FlowBuilder } from '@/components/flow-builder'
import { useCheckoutStore } from '@/stores/checkoutStore'

/** Rota `/checkouts/:checkoutId/flow` — fluxo do checkout. */
export function FlowBuilderPage() {
  const { checkoutId } = useParams<{ checkoutId: string }>()
  const navigate = useNavigate()
  const loadTemplate = useCheckoutStore((s) => s.loadTemplate)
  const templateExists = useCheckoutStore((s) =>
    checkoutId ? s.templates.some((t) => t.id === checkoutId) : false,
  )
  const currentTemplateId = useCheckoutStore((s) => s.currentTemplate?.id)

  useEffect(() => {
    if (checkoutId && currentTemplateId !== checkoutId) {
      loadTemplate(checkoutId)
    }
  }, [checkoutId, currentTemplateId, loadTemplate])

  if (!checkoutId || !templateExists) {
    return <Navigate to="/checkouts" replace />
  }

  return <FlowBuilder onBack={() => navigate(`/checkouts/${checkoutId}`)} />
}
