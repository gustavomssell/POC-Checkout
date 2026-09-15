import type { CheckoutComponent, GridColumns } from '@/types/checkout'
import { formatCurrency } from '@/lib/utils'
import { Shield, Lock, RefreshCw, Sparkles, Columns2, Columns3, Columns4, Star, Clock, Check, ChevronDown, Play, Users, Tag, Plus, Trash2, Copy, Settings, GripVertical } from 'lucide-react'
import { CHECKOUT_COMPONENTS } from '@/lib/constants'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface DraggableNestedProps {
  component: CheckoutComponent
  parentId: string
  cellIndex: number
}

function DraggableNestedComponent({ component, parentId, cellIndex }: DraggableNestedProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `nested-${parentId}-${cellIndex}-${component.id}`,
    data: {
      type: 'nested-item',
      component,
      parentId,
      cellIndex,
    },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'opacity-50' : ''}`}
      {...listeners}
      {...attributes}
    >
      <CheckoutComponentRenderer component={component} />
    </div>
  )
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Lock,
  RefreshCw,
  Sparkles,
  Columns2,
  Columns3,
  Columns4,
  Star,
  Clock,
  Check,
  ChevronDown,
  Play,
  Users,
  Tag,
  Plus,
}

interface CheckoutComponentRendererProps {
  component: CheckoutComponent
  isSelected?: boolean
  onClick?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onSettings?: () => void
  onDropInGrid?: (gridId: string, column: number, component: CheckoutComponent) => void
}

export function CheckoutComponentRenderer({
  component,
  isSelected,
  onClick,
  onDelete,
  onDuplicate,
  onSettings,
}: CheckoutComponentRendererProps) {
  const { type, props } = component
  const componentConfig = CHECKOUT_COMPONENTS.find((c) => c.type === type)

  const wrapperClass = `
    relative group border-2 transition-all cursor-pointer
    ${isSelected 
      ? 'border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]' 
      : 'border-transparent hover:border-emerald-300'
    }
  `

  const ActionBar = () => (
    <>
      <div className={`
        absolute -top-3 right-2 flex items-center gap-1 z-10
        bg-emerald-600 rounded-md px-1 py-0.5 shadow-lg
        transition-opacity duration-150
        ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
      `}>
        <button
          className="p-1 hover:bg-emerald-700 rounded text-white transition-colors"
          title="Mover"
          onClick={(e) => { e.stopPropagation() }}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <button
          className="p-1 hover:bg-emerald-700 rounded text-white transition-colors"
          title="Configurações"
          onClick={(e) => { e.stopPropagation(); onSettings?.() }}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
        <button
          className="p-1 hover:bg-emerald-700 rounded text-white transition-colors"
          title="Duplicar"
          onClick={(e) => { e.stopPropagation(); onDuplicate?.() }}
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          className="p-1 hover:bg-red-500/80 rounded text-white transition-colors"
          title="Excluir"
          onClick={(e) => { e.stopPropagation(); onDelete?.() }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {componentConfig && (
        <div className={`
          absolute -bottom-5 left-2 z-10
          bg-gray-800/90 text-white text-[10px] font-medium px-2 py-0.5 rounded
          transition-opacity duration-150 whitespace-nowrap
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
          {componentConfig.name}
        </div>
      )}
    </>
  )

  switch (type) {
    case 'header':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <HeaderComponent {...props} />
        </div>
      )

    case 'product-card':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <ProductCardComponent {...props} />
        </div>
      )

    case 'form-field':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <FormFieldComponent {...props} />
        </div>
      )

    case 'payment-methods':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <PaymentMethodsComponent {...props} />
        </div>
      )

    case 'order-summary':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <OrderSummaryComponent {...props} />
        </div>
      )

    case 'upsell':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <UpsellComponent {...props} />
        </div>
      )

    case 'guarantees':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <GuaranteesComponent {...props} />
        </div>
      )

    case 'footer':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <FooterComponent {...props} />
        </div>
      )

    case 'grid-1':
    case 'grid-2':
    case 'grid-3':
    case 'grid-4':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <GridComponent
            parentId={component.id}
            columns={component.gridColumns || (type === 'grid-1' ? 1 : type === 'grid-2' ? 2 : type === 'grid-3' ? 3 : 4)}
            children={component.children}
            gap={props.gap as number}
          />
        </div>
      )

    case 'testimonial':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <TestimonialComponent {...props} />
        </div>
      )

    case 'countdown':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <CountdownComponent {...props} />
        </div>
      )

    case 'benefits':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <BenefitsComponent {...props} />
        </div>
      )

    case 'faq':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <FAQComponent {...props} />
        </div>
      )

    case 'video':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <VideoComponent {...props} />
        </div>
      )

    case 'social-proof':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <SocialProofComponent {...props} />
        </div>
      )

    case 'coupon':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <CouponComponent {...props} />
        </div>
      )

    case 'bump-offer':
      return (
        <div className={wrapperClass} onClick={onClick}>
          <ActionBar />
          <BumpOfferComponent {...props} />
        </div>
      )

    default:
      return null
  }
}

function DroppableCell({ id, index, children }: { id: string; index: number; children?: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[100px] border-2 border-dashed rounded-lg flex items-center justify-center transition-colors
        ${isOver 
          ? 'border-emerald-500 bg-emerald-500/10' 
          : 'border-muted-foreground/20 bg-muted/30'
        }
      `}
    >
      {children || (
        <div className="text-center text-muted-foreground text-sm p-4">
          <div className="w-8 h-8 mx-auto mb-2 rounded bg-muted flex items-center justify-center">
            <span className="text-xs font-medium">{index + 1}</span>
          </div>
          Arraste um componente aqui
        </div>
      )}
    </div>
  )
}

function GridComponent({ parentId, columns, children, gap = 16 }: { parentId: string; columns: GridColumns; children?: CheckoutComponent[]; gap?: number }) {
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <div className="bg-card p-4 border border-border rounded-lg">
      <div className={`grid ${gridColsClass[columns]} gap-4`} style={{ gap: `${gap}px` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <DroppableCell key={i} id={`${parentId}-cell-${i}`} index={i}>
            {children && children[i] ? (
              <DraggableNestedComponent
                component={children[i]}
                parentId={parentId}
                cellIndex={i}
              />
            ) : null}
          </DroppableCell>
        ))}
      </div>
    </div>
  )
}

function TestimonialComponent(props: Record<string, unknown>) {
  const name = props.name as string
  const role = props.role as string
  const text = props.text as string
  const rating = props.rating as number

  return (
    <div className="bg-card p-4 rounded-lg border">
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < (rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
      <p className="text-sm text-foreground italic mb-4">"{text || 'Depoimento do cliente'}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-primary">{name?.charAt(0) || 'C'}</span>
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{name || 'Cliente'}</p>
          <p className="text-xs text-muted-foreground">{role || 'Cliente'}</p>
        </div>
      </div>
    </div>
  )
}

function CountdownComponent(props: Record<string, unknown>) {
  const title = props.title as string
  const minutes = props.minutes as number
  const seconds = props.seconds as number
  const urgencyText = props.urgencyText as string

  return (
    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-red-500" />
          <span className="font-medium text-foreground">{title || 'Oferta termina em:'}</span>
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="bg-red-500 text-white px-3 py-2 rounded-lg font-mono text-xl font-bold min-w-[60px]">
            {String(minutes || 14).padStart(2, '0')}
          </div>
          <span className="text-2xl font-bold text-foreground">:</span>
          <div className="bg-red-500 text-white px-3 py-2 rounded-lg font-mono text-xl font-bold min-w-[60px]">
            {String(seconds || 59).padStart(2, '0')}
          </div>
        </div>
        {urgencyText && (
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{urgencyText}</p>
        )}
      </div>
    </div>
  )
}

function BenefitsComponent(props: Record<string, unknown>) {
  const title = props.title as string
  const items = props.items as Array<{ icon: string; text: string }>

  return (
    <div className="bg-card p-4 rounded-lg border">
      <h3 className="font-medium text-foreground mb-4">{title || 'O que você vai receber:'}</h3>
      <ul className="space-y-3">
        {items?.map((item, i) => {
          const IconComp = iconMap[item.icon] || Check
          return (
            <li key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <IconComp className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm text-foreground">{item.text}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function FAQComponent(props: Record<string, unknown>) {
  const title = props.title as string
  const items = props.items as Array<{ question: string; answer: string }>

  return (
    <div className="bg-card p-4 rounded-lg border">
      <h3 className="font-medium text-foreground mb-4">{title || 'Dúvidas Frequentes'}</h3>
      <div className="space-y-3">
        {items?.map((item, i) => (
          <div key={i} className="border rounded-lg">
            <div className="flex items-center justify-between p-3 cursor-pointer">
              <span className="font-medium text-foreground text-sm">{item.question}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="px-3 pb-3 text-sm text-muted-foreground">
              {item.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VideoComponent(props: Record<string, unknown>) {
  const title = props.title as string
  const url = props.url as string

  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : null
  }

  const embedUrl = getYouTubeEmbedUrl(url)

  return (
    <div className="bg-card p-4 rounded-lg border">
      {title && <h3 className="font-medium text-foreground mb-3">{title}</h3>}
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
              <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Adicione um vídeo do YouTube</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SocialProofComponent(props: Record<string, unknown>) {
  const recentPurchases = props.recentPurchases as number
  const timeRange = props.timeRange as string
  const message = props.message as string

  return (
    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
      <div className="flex items-center justify-center gap-3">
        <Users className="w-5 h-5 text-primary" />
        <div className="text-center">
          <p className="text-sm text-foreground">
            <span className="font-bold text-primary">{recentPurchases || 47}</span> {message || 'pessoas já compraram nas'} <span className="font-medium">{timeRange || 'últimas 24 horas'}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function CouponComponent(props: Record<string, unknown>) {
  const label = props.label as string
  const placeholder = props.placeholder as string
  const buttonText = props.buttonText as string

  return (
    <div className="bg-card p-4 rounded-lg border">
      <label className="text-sm font-medium text-foreground block mb-2">
        {label || 'Possui cupom de desconto?'}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={placeholder || 'Digite seu cupom'}
          className="flex-1 h-10 px-3 border rounded-lg bg-background text-foreground text-sm"
          readOnly
        />
        <button className="h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
          {buttonText || 'Aplicar'}
        </button>
      </div>
    </div>
  )
}

function BumpOfferComponent(props: Record<string, unknown>) {
  const title = props.title as string
  const description = props.description as string
  const price = props.price as number
  const originalPrice = props.originalPrice as number
  const buttonText = props.buttonText as string

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg border-2 border-dashed border-primary/30">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <div className="w-5 h-5 border-2 border-primary rounded flex items-center justify-center">
            <Plus className="w-3 h-3 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{title || 'Adicione o Pack Completo!'}</h3>
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
  )
}

function HeaderComponent(props: Record<string, unknown>) {
  const logoUrl = props.logoUrl as string
  const breadcrumbs = props.breadcrumbs as string[]

  return (
    <div className="bg-card border-b">
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

function ProductCardComponent(props: Record<string, unknown>) {
  const name = props.name as string
  const price = props.price as number
  const originalPrice = props.originalPrice as number | undefined
  const description = props.description as string
  const imageUrl = props.imageUrl as string

  return (
    <div className="bg-card p-4 rounded-lg border">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Package className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{name || 'Produto'}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
            <span className="text-lg font-semibold text-primary">
              {formatCurrency(price || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormFieldComponent(props: Record<string, unknown>) {
  const fields = props.fields as Array<{
    id: string
    label: string
    type: string
    required: boolean
  }>

  return (
    <div className="bg-card p-4 rounded-lg border space-y-4">
      <h3 className="font-medium text-foreground">Dados Pessoais</h3>
      <div className="grid grid-cols-2 gap-4">
        {fields?.map((field) => (
          <div
            key={field.id}
            className={field.id === 'email' || field.id === 'phone' ? 'col-span-2' : ''}
          >
            <label className="text-sm font-medium text-muted-foreground">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </label>
            <div className="mt-1 h-10 border rounded-md bg-background flex items-center px-3">
              <span className="text-sm text-muted-foreground">
                {field.type === 'email' ? 'email@exemplo.com' :
                 field.type === 'cpf' ? '000.000.000-00' :
                 field.type === 'phone' ? '(00) 00000-0000' :
                 `Digite seu ${field.label.toLowerCase()}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PaymentMethodsComponent(props: Record<string, unknown>) {
  const methods = props.methods as string[]
  const installments = props.installments as number

  return (
    <div className="bg-card p-4 rounded-lg border space-y-4">
      <h3 className="font-medium text-foreground">Forma de Pagamento</h3>
      <div className="space-y-2">
        {methods?.includes('credit-card') && (
          <div className="flex items-center gap-3 p-3 border-2 border-primary rounded-lg bg-primary/5">
            <CreditCardIcon className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Cartão de Crédito</p>
              <p className="text-sm text-muted-foreground">até {installments}x sem juros</p>
            </div>
          </div>
        )}
        {methods?.includes('pix') && (
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="w-5 h-5 bg-emerald-500 rounded-sm" />
            <div>
              <p className="font-medium text-foreground">PIX</p>
              <p className="text-sm text-muted-foreground">5% de desconto</p>
            </div>
          </div>
        )}
        {methods?.includes('boleto') && (
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <ReceiptIcon className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Boleto</p>
              <p className="text-sm text-muted-foreground">5% de desconto</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderSummaryComponent(props: Record<string, unknown>) {
  const showDiscount = props.showDiscount as boolean
  const discountLabel = props.discountLabel as string
  const discountValue = props.discountValue as number

  return (
    <div className="bg-card p-4 rounded-lg border space-y-3">
      <h3 className="font-medium text-foreground">Resumo do Pedido</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Produto</span>
          <span className="text-foreground">{formatCurrency(197)}</span>
        </div>
        {showDiscount && discountValue > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>{discountLabel || 'Desconto'}</span>
            <span>-{formatCurrency(discountValue)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Frete</span>
          <span className="text-emerald-600">Grátis</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-semibold text-lg">
            <span className="text-foreground">Total</span>
            <span className="text-foreground">{formatCurrency(197 - (discountValue || 0))}</span>
          </div>
        </div>
      </div>
      <button className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium mt-4">
        Finalizar Compra
      </button>
    </div>
  )
}

function UpsellComponent(props: Record<string, unknown>) {
  const title = props.title as string
  const description = props.description as string
  const price = props.price as number
  const originalPrice = props.originalPrice as number | undefined
  const buttonText = props.buttonText as string

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 border-2 border-dashed border-primary/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="text-sm font-semibold text-primary">OFERTA ESPECIAL</span>
      </div>
      <h3 className="font-medium text-foreground">{title || 'Upsell'}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description || 'Descrição do upsell'}</p>
      <div className="flex items-center gap-2 mt-3">
        {originalPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(originalPrice)}
          </span>
        )}
        <span className="text-lg font-semibold text-primary">
          {formatCurrency(price || 0)}
        </span>
      </div>
      <button className="w-full h-10 bg-primary text-primary-foreground rounded-lg font-medium mt-3">
        {buttonText || 'Adicionar'}
      </button>
    </div>
  )
}

function GuaranteesComponent(props: Record<string, unknown>) {
  const items = props.items as Array<{ icon: string; text: string }>

  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="flex justify-center gap-6">
        {items?.map((item, i) => {
          const IconComp = iconMap[item.icon] || Shield
          return (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconComp className="w-4 h-4" />
              <span>{item.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FooterComponent(props: Record<string, unknown>) {
  const companyName = props.companyName as string
  const cnpj = props.cnpj as string
  const address = props.address as string

  return (
    <div className="bg-muted/30 p-4 rounded-lg text-center text-sm text-muted-foreground space-y-1">
      <p className="font-medium text-foreground">{companyName || 'Empresa'}</p>
      <p>CNPJ: {cnpj || '00.000.000/0001-00'}</p>
      <p>{address || 'Endereço'}</p>
    </div>
  )
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M14 8h-4" />
      <path d="M16 12h-6" />
      <path d="M11 7H8" />
    </svg>
  )
}
