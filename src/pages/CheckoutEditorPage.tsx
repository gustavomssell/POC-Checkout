import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { CheckoutEditor } from '@/components/checkout-builder'
import { useCheckoutStore } from '@/stores/checkoutStore'

/** Rota `/checkouts/:checkoutId` — editor do checkout. */
export function CheckoutEditorPage() {
  const { checkoutId } = useParams<{ checkoutId: string }>()
  const navigate = useNavigate()
  const loadTemplate = useCheckoutStore((s) => s.loadTemplate)
  const templateExists = useCheckoutStore((s) =>
    checkoutId ? s.templates.some((t) => t.id === checkoutId) : false,
  )
  const currentTemplateId = useCheckoutStore((s) => s.currentTemplate?.id)

  // Carrega só ao trocar de checkout. Depender do objeto `template` inteiro
  // recarregava (e limpava `selectedComponentId`, fechando o modal de
  // propriedades) a cada edição, pois `updateComponent` gera um novo objeto.
  useEffect(() => {
    if (checkoutId && currentTemplateId !== checkoutId) {
      loadTemplate(checkoutId)
    }
  }, [checkoutId, currentTemplateId, loadTemplate])

  if (!checkoutId || !templateExists) {
    return <Navigate to="/checkouts" replace />
  }

  return <CheckoutEditor onBack={() => navigate('/checkouts')} />
}
