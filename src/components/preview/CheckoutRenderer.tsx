import type { CheckoutComponent, BackgroundConfig, ThemeConfig } from '@/types/checkout'
import { formatCurrency } from '@/lib/utils'
import { Shield, Lock, RefreshCw, Sparkles, Package, CreditCard, Receipt, Check, ChevronDown, Star, Clock, Users, Plus } from 'lucide-react'
import { BackgroundRenderer } from '@/components/checkout-builder/BackgroundRenderer'
import { ThemeProvider } from '@/components/checkout-builder/ThemeProvider'
import { FixedCheckoutForm } from '@/components/checkout-builder/FixedCheckoutForm'
import { SecurePurchaseSidebar } from '@/components/checkout-builder/SecurePurchaseSidebar'

interface CheckoutRendererProps {
  components: CheckoutComponent[]
  background?: BackgroundConfig
  theme?: ThemeConfig
  productName?: string
  mode?: 'desktop' | 'mobile'
}

// Os mesmos tipos fixos filtrados no Canvas: sempre renderizados pelo FixedCheckoutForm
const FIXED_TYPES: CheckoutComponent['type'][] = [
  'product-card',
  'form-field',
  'payment-methods',
  'order-summary',
]

export function CheckoutRenderer({ components, background, theme, productName, mode = 'desktop' }: CheckoutRendererProps) {
  const sortByOrder = (a: CheckoutComponent, b: CheckoutComponent) => a.order - b.order
  const userComponents = (components || []).filter((c) => !FIXED_TYPES.includes(c.type))
  const aboveComponents = userComponents
    .filter((c) => c.placement === 'above')
    .sort(sortByOrder)
  const belowComponents = userComponents
    .filter((c) => (c.placement ?? 'below') === 'below')
    .sort(sortByOrder)
  const sidebarComponents = userComponents
    .filter((c) => c.placement === 'sidebar')
    .sort(sortByOrder)

  // Mesmos dados do Canvas: nome do template + padrões (componentes fixos
  // legados são ignorados, igual ao builder)
  const resolvedProductName = productName || 'Produto Exemplo'
  const resolvedProductPrice = 197
  const resolvedOriginalPrice = 297

  const hasCustomBackground = !!(
    background &&
    !(background.type === 'color' && (!background.color || background.color === '#0f172a'))
  )
  const isMobile = mode === 'mobile'

  return (
    <ThemeProvider theme={theme}>
      <BackgroundRenderer background={background}>
        <div className={`${hasCustomBackground ? '' : 'bg-[#0b0e0e]'} ${isMobile ? 'p-3' : 'p-4 md:p-6'}`}>
          <div className={isMobile ? 'flex flex-col gap-4' : 'grid grid-cols-6 gap-4 max-w-6xl mx-auto'}>
            {/* Form Area */}
            <div className={isMobile ? 'w-full' : 'col-span-4'}>
              <div className="bg-[var(--theme-form-background)] rounded-2xl overflow-hidden">
                <div className="p-5 w-full flex flex-col gap-3">
                  {aboveComponents.map((component) => (
                    <PlacedComponent key={component.id} component={component} />
                  ))}

                  {/* Conteúdo padrão: sempre visível, igual ao builder */}
                  <FixedCheckoutForm
                    productName={resolvedProductName}
                    productPrice={resolvedProductPrice}
                    productOriginalPrice={resolvedOriginalPrice}
                    installmentPrice={resolvedProductPrice / 12}
                    installments={12}
                    compact={isMobile}
                  />

                  {belowComponents.length > 0 && (
                    <>
                      <div className="w-full border-t border-dashed border-gray-200 my-4" />
                      {belowComponents.map((component) => (
                        <PlacedComponent key={component.id} component={component} />
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className={isMobile ? 'w-full' : 'col-span-2'}>
              <div className="flex flex-col gap-3">
                <SecurePurchaseSidebar
                  productName={resolvedProductName}
                  productPrice={resolvedProductPrice}
                />
                {sidebarComponents.map((component) => (
                  <PlacedComponent key={component.id} component={component} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </BackgroundRenderer>
    </ThemeProvider>
  )
}

/** Aplica a largura configurada (faixa estreita centralizada ou total). */
function PlacedComponent({ component }: { component: CheckoutComponent }) {
  if (component.fullWidth === false) {
    return (
      <div className="max-w-md mx-auto">
        <ComponentRenderer component={component} />
      </div>
    )
  }
  return <ComponentRenderer component={component} />
}

function ComponentRenderer({ component }: { component: CheckoutComponent }) {
  const { type, props } = component

  switch (type) {
    case 'header':
      return <HeaderPreview {...props} />
    case 'product-card':
      return <ProductCardPreview {...props} />
    case 'form-field':
      return <FormFieldPreview {...props} />
    case 'payment-methods':
      return <PaymentMethodsPreview {...props} />
    case 'order-summary':
      return <OrderSummaryPreview {...props} />
    case 'upsell':
      return <UpsellPreview {...props} />
    case 'guarantees':
      return <GuaranteesPreview {...props} />
    case 'footer':
      return <FooterPreview {...props} />
    case 'grid-1':
    case 'grid-2':
    case 'grid-3':
    case 'grid-4':
      return <GridPreview component={component} />
    case 'testimonial':
      return <TestimonialPreview {...props} />
    case 'countdown':
      return <CountdownPreview {...props} />
    case 'benefits':
      return <BenefitsPreview {...props} />
    case 'faq':
      return <FAQPreview {...props} />
    case 'video':
      return <VideoPreview {...props} />
    case 'social-proof':
      return <SocialProofPreview {...props} />
    case 'coupon':
      return <CouponPreview {...props} />
    case 'bump-offer':
      return <BumpOfferPreview {...props} />
    default:
      return null
  }
}

function HeaderPreview(props: Record<string, unknown>) {
  const logoUrl = props.logoUrl as string
  const breadcrumbs = props.breadcrumbs as string[]

  return (
    <div className="bg-card border-b sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs?.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-muted-foreground">/</span>}
                <span className={i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCardPreview(props: Record<string, unknown>) {
  const name = props.name as string
  const price = props.price as number
  const originalPrice = props.originalPrice as number | undefined
  const description = props.description as string
  const imageUrl = props.imageUrl as string

  return (
    <div className="bg-card p-4 border-b">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Package className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">{name || 'Produto'}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
            <div className="flex items-center gap-3 mt-3">
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(originalPrice)}
                </span>
              )}
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(price || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormFieldPreview(props: Record<string, unknown>) {
  const fields = props.fields as Array<{
    id: string
    label: string
    type: string
    required: boolean
  }>

  return (
    <div className="bg-card p-4 border-b">
      <div className="max-w-3xl mx-auto space-y-4">
        <h3 className="font-semibold text-foreground">Dados Pessoais</h3>
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
          {fields?.map((field) => (
            <div
              key={field.id}
              className={field.id === 'email' || field.id === 'phone' ? '@sm:col-span-2' : ''}
            >
              <label className="text-sm font-medium text-muted-foreground block mb-1">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
              <input
                type={field.type === 'email' ? 'email' : 'text'}
                placeholder={
                  field.type === 'email' ? 'email@exemplo.com' :
                  field.type === 'cpf' ? '000.000.000-00' :
                  field.type === 'phone' ? '(00) 00000-0000' :
                  `Digite seu ${field.label.toLowerCase()}`
                }
                className="w-full h-10 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PaymentMethodsPreview(props: Record<string, unknown>) {
  const methods = props.methods as string[]
  const installments = props.installments as number

  return (
    <div className="bg-card p-4 border-b">
      <div className="max-w-3xl mx-auto space-y-4">
        <h3 className="font-semibold text-foreground">Forma de Pagamento</h3>
        <div className="space-y-3">
          {methods?.includes('credit-card') && (
            <label className="flex items-center gap-4 p-4 border-2 border-primary rounded-xl bg-primary/5 cursor-pointer">
              <input type="radio" name="payment" defaultChecked className="w-4 h-4 text-primary" />
              <CreditCard className="w-6 h-6 text-primary" />
              <div className="flex-1">
                <p className="font-semibold">Cartão de Crédito</p>
                <p className="text-sm text-muted-foreground">até {installments}x sem juros</p>
              </div>
            </label>
          )}
          {methods?.includes('pix') && (
            <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer hover:border-primary/50">
              <input type="radio" name="payment" className="w-4 h-4 text-primary" />
              <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">PIX</p>
                <p className="text-sm text-green-600">5% de desconto</p>
              </div>
            </label>
          )}
          {methods?.includes('boleto') && (
            <label className="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer hover:border-primary/50">
              <input type="radio" name="payment" className="w-4 h-4 text-primary" />
              <Receipt className="w-6 h-6 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-semibold">Boleto</p>
                <p className="text-sm text-green-600">5% de desconto</p>
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  )
}

function OrderSummaryPreview(props: Record<string, unknown>) {
  const showDiscount = props.showDiscount as boolean
  const discountLabel = props.discountLabel as string
  const discountValue = props.discountValue as number

  return (
    <div className="bg-card p-4 border-b">
      <div className="max-w-3xl mx-auto space-y-4">
        <h3 className="font-semibold text-foreground">Resumo do Pedido</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Produto</span>
            <span>{formatCurrency(197)}</span>
          </div>
          {showDiscount && discountValue > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{discountLabel || 'Desconto'}</span>
              <span>-{formatCurrency(discountValue)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Frete</span>
            <span className="text-green-600 font-medium">Grátis</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>{formatCurrency(197 - (discountValue || 0))}</span>
            </div>
          </div>
        </div>
        <button className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors">
          Finalizar Compra
        </button>
      </div>
    </div>
  )
}

function UpsellPreview(props: Record<string, unknown>) {
  const title = props.title as string
  const description = props.description as string
  const price = props.price as number
  const originalPrice = props.originalPrice as number | undefined
  const buttonText = props.buttonText as string

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 border-b border-dashed border-primary/30">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-primary uppercase tracking-wide">OFERTA ESPECIAL</span>
        </div>
        <h3 className="font-semibold text-lg">{title || 'Upsell'}</h3>
        <p className="text-muted-foreground mt-1">{description || 'Descrição do upsell'}</p>
        <div className="flex items-center gap-3 mt-4">
          {originalPrice && (
            <span className="text-muted-foreground line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(price || 0)}
          </span>
        </div>
        <button className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold mt-4 hover:bg-primary/90 transition-colors">
          {buttonText || 'Adicionar'}
        </button>
      </div>
    </div>
  )
}

function GuaranteesPreview(props: Record<string, unknown>) {
  const items = props.items as Array<{ icon: string; text: string }>

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Shield,
    Lock,
    RefreshCw,
  }

  return (
    <div className="bg-muted/30 p-4 border-b">
      <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-4 @sm:gap-8">
        {items?.map((item, i) => {
          const IconComp = iconMap[item.icon] || Shield
          return (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconComp className="w-5 h-5" />
              <span>{item.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FooterPreview(props: Record<string, unknown>) {
  const companyName = props.companyName as string
  const cnpj = props.cnpj as string
  const address = props.address as string

  return (
    <div className="bg-muted/20 p-4 text-center text-sm text-muted-foreground space-y-1">
      <p className="font-medium">{companyName || 'Empresa'}</p>
      <p>CNPJ: {cnpj || '00.000.000/0001-00'}</p>
      <p>{address || 'Endereço'}</p>
    </div>
  )
}

function GridPreview({ component }: { component: CheckoutComponent }) {
  // Linha sem nenhum item não aparece na visão do cliente
  if (!component.children?.some(Boolean)) return null

  const columns = component.gridColumns ?? 2
  const gridColsAtXs: Record<number, string> = {
    1: '@sm:grid-cols-1',
    2: '@sm:grid-cols-2',
    3: '@sm:grid-cols-3',
    4: '@sm:grid-cols-4',
  }

  return (
    <div className="bg-card p-4 border-b">
      <div className="max-w-3xl mx-auto">
        <div className={`grid grid-cols-1 ${gridColsAtXs[columns] ?? '@sm:grid-cols-2'} gap-4`}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="min-w-0">
              {component.children?.[i] ? (
                <ComponentRenderer component={component.children[i]} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TestimonialPreview(props: Record<string, unknown>) {
  const name = props.name as string
  const role = props.role as string
  const text = props.text as string
  const rating = props.rating as number

  return (
    <div className="bg-card p-4 border-b">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < (rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
          ))}
        </div>
        <p className="text-sm italic text-muted-foreground mb-4">"{text || 'Depoimento do cliente'}"</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">{name?.charAt(0) || 'C'}</span>
          </div>
          <div>
            <p className="font-medium text-sm">{name || 'Cliente'}</p>
            <p className="text-xs text-muted-foreground">{role || 'Cliente'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CountdownPreview(props: Record<string, unknown>) {
  const title = props.title as string
  const minutes = props.minutes as number
  const seconds = props.seconds as number
  const urgencyText = props.urgencyText as string

  return (
    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-4 border-b">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-red-500" />
          <span className="font-medium">{title || 'Oferta termina em:'}</span>
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="bg-red-500 text-white px-3 py-2 rounded-lg font-mono text-xl font-bold min-w-[60px]">
            {String(minutes || 14).padStart(2, '0')}
          </div>
          <span className="text-2xl font-bold">:</span>
          <div className="bg-red-500 text-white px-3 py-2 rounded-lg font-mono text-xl font-bold min-w-[60px]">
            {String(seconds || 59).padStart(2, '0')}
          </div>
        </div>
        {urgencyText && (
          <p className="text-sm font-medium text-red-600">{urgencyText}</p>
        )}
      </div>
    </div>
  )
}

function BenefitsPreview(props: Record<string, unknown>) {
  const title = props.title as string
  const items = props.items as Array<{ icon: string; text: string }>

  return (
    <div className="bg-card p-4 border-b">
      <div className="max-w-3xl mx-auto">
        <h3 className="font-semibold mb-4 text-foreground">{title || 'O que você vai receber:'}</h3>
        <ul className="space-y-3">
          {items?.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function FAQPreview(props: Record<string, unknown>) {
  const title = props.title as string
  const items = props.items as Array<{ question: string; answer: string }>

  return (
    <div className="bg-card p-4 border-b">
      <div className="max-w-3xl mx-auto">
        <h3 className="font-semibold mb-4 text-foreground">{title || 'Dúvidas Frequentes'}</h3>
        <div className="space-y-3">
          {items?.map((item, i) => (
            <div key={i} className="border rounded-lg">
              <div className="flex items-center justify-between p-3">
                <span className="font-medium text-sm">{item.question}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="px-3 pb-3 text-sm text-muted-foreground">
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VideoPreview(props: Record<string, unknown>) {
  const title = props.title as string
  const url = props.url as string

  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  const embedUrl = getYouTubeEmbedUrl(url)

  return (
    <div className="bg-card p-4 border-b">
      <div className="max-w-3xl mx-auto">
        {title && <h3 className="font-semibold mb-3 text-foreground">{title}</h3>}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || 'Vídeo'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary text-xl">▶</span>
                </div>
                <p className="text-sm text-muted-foreground">Adicione um vídeo do YouTube</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SocialProofPreview(props: Record<string, unknown>) {
  const recentPurchases = props.recentPurchases as number
  const timeRange = props.timeRange as string
  const message = props.message as string

  return (
    <div className="bg-primary/5 p-4 border-b">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <p className="text-sm">
            <span className="font-bold text-primary">{recentPurchases || 47}</span> {message || 'pessoas já compraram nas'} <span className="font-medium">{timeRange || 'últimas 24 horas'}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function CouponPreview(props: Record<string, unknown>) {
  const label = props.label as string
  const placeholder = props.placeholder as string
  const buttonText = props.buttonText as string

  return (
    <div className="bg-card p-4 border-b">
      <div className="max-w-3xl mx-auto">
        <label className="text-sm font-medium block mb-2 text-foreground">
          {label || 'Possui cupom de desconto?'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={placeholder || 'Digite seu cupom'}
            className="flex-1 h-10 px-3 border rounded-lg text-sm"
            readOnly
          />
          <button className="h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
            {buttonText || 'Aplicar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function BumpOfferPreview(props: Record<string, unknown>) {
  const title = props.title as string
  const description = props.description as string
  const price = props.price as number
  const originalPrice = props.originalPrice as number
  const buttonText = props.buttonText as string

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 border-b border-dashed border-primary/30">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
              <Plus className="w-3 h-3 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{title || 'Adicione o Pack Completo!'}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {description || 'Acesso a todos os bônus por apenas'}{' '}
              <span className="font-bold text-primary">{formatCurrency(price || 67)}</span>
              {originalPrice && (
                <span className="text-muted-foreground line-through ml-2">{formatCurrency(originalPrice)}</span>
              )}
            </p>
            <button className="mt-3 h-8 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
              {buttonText || 'Sim, quero!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
