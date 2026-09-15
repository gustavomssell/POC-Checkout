import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Shield, CreditCard, Check, Barcode } from 'lucide-react'

interface FixedCheckoutFormProps {
  productName?: string
  productPrice?: number
  productOriginalPrice?: number
  installmentPrice?: number
  installments?: number
  /** Empilha os campos (mobile). Padrão: layout lado a lado. */
  compact?: boolean
}

export function FixedCheckoutForm({
  productName = 'Produto Exemplo',
  productPrice = 197,
  productOriginalPrice = 297,
  installmentPrice = 197,
  installments = 12,
  compact = false,
}: FixedCheckoutFormProps) {
  const [selectedPayment, setSelectedPayment] = useState('credit-card')

  return (
    <div className="space-y-6" style={{ fontFamily: 'var(--theme-font)' }}>
      {/* Product Info */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[var(--theme-primary-text)]">{productName}</h2>
        <p className="text-[var(--theme-active-text)] font-medium">
          {installments}x de {formatCurrency(installmentPrice || productPrice)}
        </p>
        {productOriginalPrice && productOriginalPrice > productPrice && (
          <p className="text-sm text-[var(--theme-secondary-text)]">
            ou {formatCurrency(productPrice)} à vista
          </p>
        )}
      </div>

      {/* Personal Data Section */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--theme-primary-text)]">
          <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-xs">👤</span>
          </span>
          Seus dados
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--theme-secondary-text)] block mb-1">Nome completo</label>
            <input
              type="text"
              placeholder="Nome do comprador"
              className="w-full h-12 px-4 border border-gray-200 rounded-lg text-[var(--theme-primary-text)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              readOnly
            />
          </div>

          <div>
            <label className="text-sm text-[var(--theme-secondary-text)] block mb-1">Email</label>
            <input
              type="email"
              placeholder="email@email.com"
              className="w-full h-12 px-4 border border-gray-200 rounded-lg text-[var(--theme-primary-text)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              readOnly
            />
          </div>

          <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="min-w-0">
              <label className="text-sm text-[var(--theme-secondary-text)] block mb-1">CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                className="w-full h-12 px-4 border border-gray-200 rounded-lg text-[var(--theme-primary-text)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div className="min-w-0">
              <label className="text-sm text-[var(--theme-secondary-text)] block mb-1">Celular</label>
              <div className="flex">
                <div className="h-12 px-3 border border-gray-200 rounded-l-lg flex items-center gap-2 bg-gray-50 flex-shrink-0">
                  <span className="text-sm">🇧🇷</span>
                  <span className="text-sm text-[var(--theme-secondary-text)]">+55</span>
                </div>
                <input
                  type="tel"
                  placeholder="(99) 99999-9999"
                  className="flex-1 min-w-0 h-12 px-4 border border-l-0 border-gray-200 rounded-r-lg text-[var(--theme-primary-text)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  readOnly
                />
              </div>
            </div>
          </div>

          <button className="text-sm text-[var(--theme-active-text)] hover:underline">
            Porque pedimos esse dado?
          </button>
        </div>
      </div>

      {/* Payment Section */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--theme-primary-text)]">
          <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-[var(--theme-icon-color)]" />
          </span>
          Pagamento
        </h3>

        <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {[
            { id: 'boleto', label: 'Boleto', icon: <Barcode className="w-6 h-6 text-gray-400" /> },
            { id: 'pix', label: 'PIX', icon: '💲' },
            { id: 'credit-card', label: 'Cartão de Crédito', icon: '💳' },
            { id: 'picpay', label: 'PicPay', icon: 'P' },
          ].map((method) => {
            const selected = selectedPayment === method.id
            return (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                  selected
                    ? 'border-[var(--theme-active-text)] bg-[var(--theme-btn-selected-bg)]'
                    : 'border-gray-200 hover:border-gray-300 bg-[var(--theme-btn-unselected-bg)]'
                }`}
              >
                <span className="text-2xl">{method.icon}</span>
                <span className={`text-xs text-center ${selected ? 'text-[var(--theme-btn-selected-text)]' : 'text-[var(--theme-btn-unselected-text)]'}`}>{method.label}</span>
              </button>
            )
          })}
        </div>

        <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {[
            { id: 'applepay', label: 'ApplePay', icon: '' },
            { id: 'googlepay', label: 'GooglePay', icon: 'G' },
          ].map((method) => {
            const selected = selectedPayment === method.id
            return (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                  selected
                    ? 'border-[var(--theme-active-text)] bg-[var(--theme-btn-selected-bg)]'
                    : 'border-gray-200 hover:border-gray-300 bg-[var(--theme-btn-unselected-bg)]'
                }`}
              >
                <span className="text-2xl">{method.icon}</span>
                <span className={`text-xs text-center ${selected ? 'text-[var(--theme-btn-selected-text)]' : 'text-[var(--theme-btn-unselected-text)]'}`}>{method.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Credit Card Form */}
      {selectedPayment === 'credit-card' && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--theme-secondary-text)] block mb-1">Número do cartão</label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              className="w-full h-12 px-4 border border-gray-200 rounded-lg text-[var(--theme-primary-text)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              readOnly
            />
          </div>

          <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <div className="min-w-0">
              <label className="text-sm text-[var(--theme-secondary-text)] block mb-1">Vencimento</label>
              <input
                type="text"
                placeholder="MM/AA"
                className="w-full h-12 px-4 border border-gray-200 rounded-lg text-[var(--theme-primary-text)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div>
              <label className="text-sm text-[var(--theme-secondary-text)] block mb-1">CVV</label>
              <input
                type="text"
                placeholder="000"
                className="w-full h-12 px-4 border border-gray-200 rounded-lg text-[var(--theme-primary-text)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                readOnly
              />
            </div>
            <div>
              <label className="text-sm text-[var(--theme-secondary-text)] block mb-1">Parcelas</label>
              <select className="w-full h-12 px-4 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white">
                <option>{installments}x de {formatCurrency(installmentPrice || productPrice)}</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--theme-secondary-text)]">
            <input type="checkbox" className="rounded border-gray-300" />
            Salvar dados para as próximas compras
          </label>

          <div className="flex items-center gap-2 text-sm text-[var(--theme-secondary-text)]">
            <Shield className="w-4 h-4 text-[var(--theme-icon-color)]" />
            <span>Os seus dados de pagamento são criptografados e processados de forma segura.</span>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-[var(--theme-background)] rounded-xl p-5 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--theme-primary-text)]">Resumo do pedido</h3>
        
        <div className="bg-[var(--theme-form-background)] rounded-lg p-4 border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="font-medium text-[var(--theme-primary-text)]">{productName}</span>
            <span className="font-medium text-[var(--theme-primary-text)]">{installments}x de {formatCurrency(installmentPrice || productPrice)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-[var(--theme-secondary-text)]">Total</span>
            <span className="text-xl font-bold text-[var(--theme-active-text)]">{formatCurrency(productPrice)}</span>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button className="w-full h-14 bg-[var(--theme-btn-selected-bg)] text-[var(--theme-btn-selected-text)] rounded-xl font-semibold text-lg transition-colors">
        Pagar com Cartão de Crédito
      </button>

      {/* Footer */}
      <div className="text-center space-y-3 pt-4">
        <p className="text-sm text-[var(--theme-secondary-text)]">
          Este pagamento está sendo processado de forma segura para o vendedor
        </p>
        <p className="text-sm text-[var(--theme-active-text)] flex items-center justify-center gap-1">
          <Check className="w-4 h-4" />
          Compra 100% segura
        </p>
        <p className="text-xs text-[var(--theme-secondary-text)]">
          Este site é protegido por verificação de segurança
          <br />
          <a href="#" className="text-[var(--theme-active-text)] hover:underline">Política de privacidade</a> e{' '}
          <a href="#" className="text-[var(--theme-active-text)] hover:underline font-medium">Termos de serviço</a>
        </p>
        <p className="text-xs text-[var(--theme-secondary-text)]">
          * Parcelamento com acréscimo
          <br />
          Ao continuar, você concorda com os{' '}
          <a href="#" className="text-[var(--theme-active-text)] hover:underline font-medium">Termos de Compra</a>
        </p>
      </div>
    </div>
  )
}
