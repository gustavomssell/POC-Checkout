import { HelpCircle, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SecurePurchaseSidebarProps {
  productName?: string
  productPrice?: number
  sellerName?: string
  isSelected?: boolean
  onClick?: () => void
}

export function SecurePurchaseSidebar({
  productName = 'Nome do Produto',
  productPrice = 50,
  sellerName = 'vendedor',
  isSelected,
  onClick,
}: SecurePurchaseSidebarProps) {
  const wrapperClass = `
    relative border-2 transition-all duration-200 cursor-pointer hover:shadow-sm
    ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted/30'}
  `

  return (
    <div className={wrapperClass} onClick={onClick} style={{ fontFamily: 'var(--theme-font)' }}>
      {/* Green Header */}
      <div className="bg-[var(--theme-btn-selected-bg)] text-white p-5 text-center rounded-t-xl">
        <h3 className="font-bold text-lg tracking-tight">Compra segura</h3>
      </div>

      {/* Product Summary */}
      <div className="p-5 bg-[var(--theme-form-background)] border-b">
        <h4 className="font-semibold text-base mb-2 text-[var(--theme-primary-text)]">{productName}</h4>
        <div className="flex items-center gap-1 mb-1">
          <HelpCircle className="w-4 h-4 text-[var(--theme-icon-color)]" />
          <span className="text-sm text-[var(--theme-secondary-text)]">Precisa de ajuda?</span>
        </div>
        <a href="#" className="text-sm text-[var(--theme-active-text)] hover:underline transition-colors">
          Veja o contato do {sellerName}
        </a>
      </div>

      {/* Total */}
      <div className="p-5 bg-[var(--theme-form-background)] border-b">
        <p className="text-sm font-medium text-[var(--theme-secondary-text)] mb-1">Total</p>
        <p className="text-3xl font-bold text-[var(--theme-active-text)] tracking-tight">
          {formatCurrency(productPrice)}
        </p>
        <p className="text-sm text-[var(--theme-secondary-text)] mt-1">Renovação atual</p>
      </div>

      {/* Trust badges */}
      <div className="p-5 bg-[var(--theme-form-background)] text-center rounded-b-xl">
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <div className="w-8 h-8 bg-[var(--theme-btn-selected-bg)] rounded-xl flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base text-[var(--theme-primary-text)]">Compra protegida</span>
        </div>
        <p className="text-xs text-[var(--theme-secondary-text)] leading-relaxed">
          Este pagamento está sendo processado de forma segura para o {sellerName}.
          <br />
          Este site é protegido por verificação de segurança
          <br />
          <a href="#" className="text-[var(--theme-active-text)] hover:underline transition-colors">Política de privacidade</a> e{' '}
          <a href="#" className="text-[var(--theme-active-text)] hover:underline transition-colors font-medium">Termos de serviço</a>
        </p>
        <p className="text-xs text-[var(--theme-secondary-text)] mt-3">
          * Parcelamento com acréscimo
          <br />
          Ao continuar, você concorda com os{' '}
          <a href="#" className="text-[var(--theme-active-text)] hover:underline transition-colors font-medium">Termos de Compra</a>
        </p>
      </div>
    </div>
  )
}
