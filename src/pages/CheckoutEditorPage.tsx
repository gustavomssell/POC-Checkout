import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CheckoutEditor } from '@/components/checkout-builder'
import { useCheckoutStore } from '@/stores/checkoutStore'

/** Rota `/checkouts/:checkoutId` — editor do checkout. */
export function CheckoutEditorPage() {
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

  return <CheckoutEditor onBack={() => navigate('/checkouts')} />
}
