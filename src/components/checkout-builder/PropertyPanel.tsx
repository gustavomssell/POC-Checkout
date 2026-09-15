import { X, Trash2, Copy, Check, MapPin, Type, Tag, ListChecks, CreditCard, Percent, ShieldCheck, Building2, Timer, MessageCircle, Video, Users, Ticket, Gift, LayoutGrid } from 'lucide-react'
import { useCheckoutStore } from '@/stores/checkoutStore'
import { CHECKOUT_COMPONENTS } from '@/lib/constants'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { Field, Section, ToggleRow, StarRating, NumberStepper, ItemCard, AddButton } from '@/components/ui/property-controls'
import type { CheckoutComponent, FieldConfig } from '@/types/checkout'

const PLACEMENT_LABELS: Record<string, string> = {
  above: 'Acima do checkout',
  sidebar: 'Na lateral',
}

interface PropertiesController {
  component: CheckoutComponent | undefined
  componentConfig: { name: string; description: string } | undefined
  placementLabel: string | null
  handleUpdateProp: (key: string, value: unknown) => void
  handleDelete: () => void
  handleDuplicate: () => void
  handleClose: () => void
}

function usePropertiesController(): PropertiesController {
  const { currentTemplate, selectedComponentId, updateComponent, selectComponent, removeComponent, duplicateComponent } = useCheckoutStore()

  const component = currentTemplate?.components.find((c) => c.id === selectedComponentId)
  const componentConfig = component
    ? CHECKOUT_COMPONENTS.find((c) => c.type === component.type)
    : undefined

  const handleUpdateProp = (key: string, value: unknown) => {
    if (!component) return
    updateComponent(component.id, {
      props: { ...component.props, [key]: value },
    })
  }

  const handleDelete = () => {
    if (!component) return
    removeComponent(component.id)
    selectComponent(null)
  }

  const handleDuplicate = () => {
    if (!component) return
    duplicateComponent(component.id)
  }

  const handleClose = () => {
    selectComponent(null)
  }

  return {
    component,
    componentConfig,
    placementLabel: component?.placement ? (PLACEMENT_LABELS[component.placement] ?? null) : null,
    handleUpdateProp,
    handleDelete,
    handleDuplicate,
    handleClose,
  }
}

function PropertiesHeader({ controller }: { controller: PropertiesController }) {
  const { component, componentConfig, placementLabel, handleDelete, handleDuplicate, handleClose } = controller
  if (!component || !componentConfig) return null

  return (
    <div className="p-4 border-b flex items-center justify-between gap-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-sm font-semibold text-foreground">{componentConfig.name}</h2>
          {placementLabel && (
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium whitespace-nowrap">
              <MapPin className="w-3 h-3" />
              {placementLabel}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {componentConfig.description}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleDuplicate}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Duplicar"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function PropertiesSections({ controller }: { controller: PropertiesController }) {
  const { component, handleUpdateProp } = controller
  if (!component) return null

  return (
    <>
      {component.type === 'header' && (
        <HeaderProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'product-card' && (
        <ProductCardProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'form-field' && (
        <FormFieldProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'payment-methods' && (
        <PaymentMethodsProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'order-summary' && (
        <OrderSummaryProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'upsell' && (
        <UpsellProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'guarantees' && (
        <GuaranteesProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'footer' && (
        <FooterProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type.startsWith('grid-') && (
        <GridProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'testimonial' && (
        <TestimonialProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'countdown' && (
        <CountdownProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'benefits' && (
        <BenefitsProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'faq' && (
        <FAQProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'video' && (
        <VideoProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'social-proof' && (
        <SocialProofProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'coupon' && (
        <CouponProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
      {component.type === 'bump-offer' && (
        <BumpOfferProperties props={component.props} onUpdate={handleUpdateProp} />
      )}
    </>
  )
}

export function PropertyPanel() {
  const controller = usePropertiesController()
  const { component } = controller

  if (!component) {
    return (
      <div className="w-80 border-l bg-card flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-sm font-semibold text-foreground">Propriedades</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Selecione um componente para editar
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Clique em um componente no canvas para ver suas propriedades
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 border-l bg-card flex flex-col h-full">
      <PropertiesHeader controller={controller} />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          <PropertiesSections controller={controller} />
        </div>
      </ScrollArea>
    </div>
  )
}

/** Modal de propriedades (usado pelo editor em vez do painel lateral). */
export function ComponentPropertiesDialog() {
  const controller = usePropertiesController()
  const { component, componentConfig, handleClose } = controller
  const open = !!component && !!componentConfig

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-card shadow-xl outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          {open && (
            <>
              <DialogPrimitive.Title className="sr-only">
                {componentConfig?.name ?? 'Propriedades'}
              </DialogPrimitive.Title>
              <PropertiesHeader controller={controller} />
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="p-4 space-y-5">
                  <PropertiesSections controller={controller} />
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
interface PropertiesProps {
  props: Record<string, unknown>
  onUpdate: (key: string, value: unknown) => void
}

function PriceFields({ props, onUpdate, originalLabel = 'Preço Original (R$)' }: PropertiesProps & { originalLabel?: string }) {
  return (
    <Section icon={Tag} title="Preço" hint="Valores exibidos no componente.">
      <Field label="Preço (R$)">
        <Input
          type="number"
          step="0.01"
          min="0"
          value={(props.price as number) ?? 0}
          onChange={(e) => onUpdate('price', parseFloat(e.target.value) || 0)}
        />
      </Field>
      <Field label={originalLabel} hint="Deixe vazio para ocultar o preço riscado.">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Opcional"
          value={(props.originalPrice as number) ?? ''}
          onChange={(e) => onUpdate('originalPrice', parseFloat(e.target.value) || undefined)}
        />
      </Field>
    </Section>
  )
}

function HeaderProperties({ props, onUpdate }: PropertiesProps) {
  return (
    <Section icon={Type} title="Conteúdo" hint="Cabeçalho exibido no topo do checkout.">
      <Field label="URL do Logo" hint="Deixe vazio para usar o monograma padrão.">
        <Input
          placeholder="https://exemplo.com/logo.png"
          value={(props.logoUrl as string) || ''}
          onChange={(e) => onUpdate('logoUrl', e.target.value)}
        />
      </Field>
    </Section>
  )
}

function ProductCardProperties({ props, onUpdate }: PropertiesProps) {
  return (
    <>
      <Section icon={Type} title="Conteúdo">
        <Field label="Nome do Produto">
          <Input
            value={(props.name as string) || ''}
            onChange={(e) => onUpdate('name', e.target.value)}
          />
        </Field>
        <Field label="Descrição">
          <Input
            value={(props.description as string) || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
          />
        </Field>
        <Field label="URL da Imagem" hint="Deixe vazio para mostrar o ícone padrão.">
          <Input
            placeholder="https://exemplo.com/produto.jpg"
            value={(props.imageUrl as string) || ''}
            onChange={(e) => onUpdate('imageUrl', e.target.value)}
          />
        </Field>
      </Section>
      <PriceFields props={props} onUpdate={onUpdate} />
    </>
  )
}

function FormFieldProperties({ props, onUpdate }: PropertiesProps) {
  const fields = (props.fields as FieldConfig[]) || []

  const handleFieldUpdate = (index: number, updates: Partial<FieldConfig>) => {
    const newFields = fields.map((f, i) =>
      i === index ? { ...f, ...updates } : f
    )
    onUpdate('fields', newFields)
  }

  return (
    <Section icon={ListChecks} title="Campos" hint="Ative a obrigatoriedade de cada campo.">
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 bg-background rounded-lg border space-y-2">
            <Input
              value={field.label}
              onChange={(e) => handleFieldUpdate(index, { label: e.target.value })}
              className="h-8 text-xs font-medium"
              aria-label="Rótulo do campo"
            />
            <ToggleRow
              label="Obrigatório"
              hint="O comprador precisa preencher para continuar."
              checked={field.required}
              onChange={(checked) => handleFieldUpdate(index, { required: checked })}
            />
          </div>
        ))}
      </div>
    </Section>
  )
}

const PAYMENT_METHODS = [
  { id: 'credit-card', label: 'Cartão' },
  { id: 'pix', label: 'PIX' },
  { id: 'boleto', label: 'Boleto' },
]

function PaymentMethodsProperties({ props, onUpdate }: PropertiesProps) {
  const methods = (props.methods as string[]) || []

  const toggleMethod = (method: string) => {
    const newMethods = methods.includes(method)
      ? methods.filter((m) => m !== method)
      : [...methods, method]
    onUpdate('methods', newMethods)
  }

  return (
    <>
      <Section icon={CreditCard} title="Métodos" hint="Toque para ativar ou desativar cada forma de pagamento.">
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_METHODS.map((method) => {
            const active = methods.includes(method.id)
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => toggleMethod(method.id)}
                aria-pressed={active}
                className={`relative flex flex-col items-center gap-1 p-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-muted-foreground hover:border-muted-foreground/40'
                }`}
              >
                {active && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  </span>
                )}
                {method.label}
              </button>
            )
          })}
        </div>
      </Section>
      <Section icon={Tag} title="Parcelamento" hint="Número máximo de parcelas sem juros.">
        <NumberStepper
          ariaLabel="Parcelas máximas"
          min={1}
          max={12}
          value={(props.installments as number) || 12}
          onChange={(v) => onUpdate('installments', v)}
        />
      </Section>
    </>
  )
}

function OrderSummaryProperties({ props, onUpdate }: PropertiesProps) {
  const showDiscount = (props.showDiscount as boolean) || false
  return (
    <Section icon={Percent} title="Desconto" hint="Exibe uma linha de desconto no resumo.">
      <ToggleRow
        label="Mostrar desconto"
        checked={showDiscount}
        onChange={(checked) => onUpdate('showDiscount', checked)}
      />
      {showDiscount && (
        <>
          <Field label="Rótulo do desconto">
            <Input
              placeholder="Ex: Cupom BEMVINDO"
              value={(props.discountLabel as string) || ''}
              onChange={(e) => onUpdate('discountLabel', e.target.value)}
            />
          </Field>
          <Field label="Valor do desconto (R$)">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={(props.discountValue as number) || 0}
              onChange={(e) => onUpdate('discountValue', parseFloat(e.target.value) || 0)}
            />
          </Field>
        </>
      )}
    </Section>
  )
}

function UpsellProperties({ props, onUpdate }: PropertiesProps) {
  return (
    <>
      <Section icon={Gift} title="Oferta">
        <Field label="Título">
          <Input
            value={(props.title as string) || ''}
            onChange={(e) => onUpdate('title', e.target.value)}
          />
        </Field>
        <Field label="Descrição">
          <Input
            value={(props.description as string) || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
          />
        </Field>
        <Field label="Texto do botão">
          <Input
            value={(props.buttonText as string) || ''}
            onChange={(e) => onUpdate('buttonText', e.target.value)}
          />
        </Field>
      </Section>
      <PriceFields props={props} onUpdate={onUpdate} />
    </>
  )
}

function GuaranteesProperties({ props, onUpdate }: PropertiesProps) {
  const items = (props.items as Array<{ icon: string; text: string }>) || []

  const handleItemUpdate = (index: number, updates: Partial<{ icon: string; text: string }>) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    )
    onUpdate('items', newItems)
  }

  const addItem = () => {
    onUpdate('items', [...items, { icon: 'Shield', text: 'Nova garantia' }])
  }

  const removeItem = (index: number) => {
    onUpdate('items', items.filter((_, i) => i !== index))
  }

  return (
    <Section icon={ShieldCheck} title="Itens" hint="Selos exibidos lado a lado.">
      <div className="space-y-2">
        {items.map((item, index) => (
          <ItemCard key={index} title="Garantia" onRemove={() => removeItem(index)}>
            <Input
              value={item.text}
              onChange={(e) => handleItemUpdate(index, { text: e.target.value })}
              className="h-8 text-xs"
              placeholder="Ex: Compra 100% segura"
            />
          </ItemCard>
        ))}
        <AddButton label="Adicionar garantia" onClick={addItem} />
      </div>
    </Section>
  )
}

function FooterProperties({ props, onUpdate }: PropertiesProps) {
  return (
    <Section icon={Building2} title="Empresa" hint="Dados exibidos no rodapé.">
      <Field label="Nome da empresa">
        <Input
          value={(props.companyName as string) || ''}
          onChange={(e) => onUpdate('companyName', e.target.value)}
        />
      </Field>
      <Field label="CNPJ">
        <Input
          placeholder="00.000.000/0001-00"
          value={(props.cnpj as string) || ''}
          onChange={(e) => onUpdate('cnpj', e.target.value)}
        />
      </Field>
      <Field label="Endereço">
        <Input
          value={(props.address as string) || ''}
          onChange={(e) => onUpdate('address', e.target.value)}
        />
      </Field>
    </Section>
  )
}

function GridProperties({ props, onUpdate }: PropertiesProps) {
  return (
    <Section
      icon={LayoutGrid}
      title="Espaçamento"
      hint="Distância entre as colunas. Arraste componentes da paleta para as células da linha."
    >
      <NumberStepper
        ariaLabel="Espaçamento entre colunas"
        min={0}
        max={64}
        step={4}
        value={(props.gap as number) ?? 16}
        onChange={(v) => onUpdate('gap', v)}
      />
    </Section>
  )
}

function TestimonialProperties({ props, onUpdate }: PropertiesProps) {
  return (
    <>
      <Section icon={Users} title="Autor">
        <Field label="Nome">
          <Input
            value={(props.name as string) || ''}
            onChange={(e) => onUpdate('name', e.target.value)}
          />
        </Field>
        <Field label="Cargo ou função">
          <Input
            value={(props.role as string) || ''}
            onChange={(e) => onUpdate('role', e.target.value)}
          />
        </Field>
        <Field label="URL do avatar" hint="Deixe vazio para usar a inicial do nome.">
          <Input
            placeholder="https://exemplo.com/foto.jpg"
            value={(props.avatar as string) || ''}
            onChange={(e) => onUpdate('avatar', e.target.value)}
          />
        </Field>
      </Section>
      <Section icon={MessageCircle} title="Texto">
        <Field label="Texto">
          <textarea
            value={(props.text as string) || ''}
            onChange={(e) => onUpdate('text', e.target.value)}
            className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background text-foreground text-sm resize-none"
          />
        </Field>
        <Field label="Avaliação">
          <StarRating
            value={(props.rating as number) || 5}
            onChange={(v) => onUpdate('rating', v)}
          />
        </Field>
      </Section>
    </>
  )
}

function CountdownProperties({ props, onUpdate }: PropertiesProps) {
  return (
    <>
      <Section icon={Timer} title="Duração" hint="Contagem regressiva exibida no componente.">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Minutos">
            <NumberStepper
              ariaLabel="Minutos"
              min={0}
              max={59}
              value={(props.minutes as number) ?? 14}
              onChange={(v) => onUpdate('minutes', v)}
            />
          </Field>
          <Field label="Segundos">
            <NumberStepper
              ariaLabel="Segundos"
              min={0}
              max={59}
              value={(props.seconds as number) ?? 59}
              onChange={(v) => onUpdate('seconds', v)}
            />
          </Field>
        </div>
      </Section>
      <Section icon={Type} title="Textos">
        <Field label="Título">
          <Input
            value={(props.title as string) || ''}
            onChange={(e) => onUpdate('title', e.target.value)}
          />
        </Field>
        <Field label="Texto de urgência" hint="Deixe vazio para ocultar.">
          <Input
            placeholder="Ex: Últimas unidades!"
            value={(props.urgencyText as string) || ''}
            onChange={(e) => onUpdate('urgencyText', e.target.value)}
          />
        </Field>
      </Section>
    </>
  )
}

function BenefitsProperties({ props, onUpdate }: PropertiesProps) {
  const items = (props.items as Array<{ icon: string; text: string }>) || []

  const handleItemUpdate = (index: number, updates: Partial<{ icon: string; text: string }>) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    )
    onUpdate('items', newItems)
  }

  const addItem = () => {
    onUpdate('items', [...items, { icon: 'Check', text: 'Novo benefício' }])
  }

  const removeItem = (index: number) => {
    onUpdate('items', items.filter((_, i) => i !== index))
  }

  return (
    <>
      <Section icon={Type} title="Cabeçalho">
        <Field label="Título da lista">
          <Input
            value={(props.title as string) || ''}
            onChange={(e) => onUpdate('title', e.target.value)}
          />
        </Field>
      </Section>
      <Section icon={ListChecks} title="Itens" hint="Exibidos com selo de verificado.">
        <div className="space-y-2">
          {items.map((item, index) => (
            <ItemCard key={index} title="Benefício" onRemove={() => removeItem(index)}>
              <Input
                value={item.text}
                onChange={(e) => handleItemUpdate(index, { text: e.target.value })}
                className="h-8 text-xs"
                placeholder="Ex: Acesso imediato"
              />
            </ItemCard>
          ))}
          <AddButton label="Adicionar benefício" onClick={addItem} />
        </div>
      </Section>
    </>
  )
}

function FAQProperties({ props, onUpdate }: PropertiesProps) {
  const items = (props.items as Array<{ question: string; answer: string }>) || []

  const handleItemUpdate = (index: number, updates: Partial<{ question: string; answer: string }>) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    )
    onUpdate('items', newItems)
  }

  const addItem = () => {
    onUpdate('items', [...items, { question: 'Nova pergunta?', answer: 'Resposta aqui...' }])
  }

  const removeItem = (index: number) => {
    onUpdate('items', items.filter((_, i) => i !== index))
  }

  return (
    <>
      <Section icon={Type} title="Cabeçalho">
        <Field label="Título da seção">
          <Input
            value={(props.title as string) || ''}
            onChange={(e) => onUpdate('title', e.target.value)}
          />
        </Field>
      </Section>
      <Section icon={MessageCircle} title="Perguntas" hint="Clique numa pergunta para expandir a resposta no checkout.">
        <div className="space-y-2">
          {items.map((item, index) => (
            <ItemCard key={index} title="Pergunta" onRemove={() => removeItem(index)}>
              <Input
                value={item.question}
                onChange={(e) => handleItemUpdate(index, { question: e.target.value })}
                className="h-8 text-xs font-medium"
                placeholder="Pergunta"
              />
              <textarea
                value={item.answer}
                onChange={(e) => handleItemUpdate(index, { answer: e.target.value })}
                className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background text-foreground text-xs resize-none"
                placeholder="Resposta"
              />
            </ItemCard>
          ))}
          <AddButton label="Adicionar pergunta" onClick={addItem} />
        </div>
      </Section>
    </>
  )
}

const YOUTUBE_PATTERN = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

function VideoProperties({ props, onUpdate }: PropertiesProps) {
  const url = (props.url as string) || ''
  const isValid = YOUTUBE_PATTERN.test(url)

  return (
    <Section icon={Video} title="Mídia" hint="Aceita links youtube.com/watch, /embed ou youtu.be.">
      <Field label="Título">
        <Input
          value={(props.title as string) || ''}
          onChange={(e) => onUpdate('title', e.target.value)}
        />
      </Field>
      <Field label="URL do vídeo">
        <Input
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChange={(e) => onUpdate('url', e.target.value)}
        />
      </Field>
      {url && (
        <p className={`text-[11px] font-medium ${isValid ? 'text-emerald-600' : 'text-amber-600'}`}>
          {isValid
            ? '✓ URL válida — o vídeo será incorporado.'
            : '⚠ Esse link não parece um vídeo do YouTube.'}
        </p>
      )}
    </Section>
  )
}

function SocialProofProperties({ props, onUpdate }: PropertiesProps) {
  return (
    <Section icon={Users} title="Prova social" hint="Contador de compras recentes para gerar urgência.">
      <Field label="Vendas recentes">
        <Input
          type="number"
          min="0"
          value={(props.recentPurchases as number) ?? 47}
          onChange={(e) => onUpdate('recentPurchases', parseInt(e.target.value) || 0)}
        />
      </Field>
      <Field label="Período" hint="Ex: últimas 24 horas, última semana.">
        <Input
          value={(props.timeRange as string) || ''}
          onChange={(e) => onUpdate('timeRange', e.target.value)}
        />
      </Field>
      <Field label="Mensagem">
        <Input
          value={(props.message as string) || ''}
          onChange={(e) => onUpdate('message', e.target.value)}
        />
      </Field>
    </Section>
  )
}

function CouponProperties({ props, onUpdate }: PropertiesProps) {
  return (
    <Section icon={Ticket} title="Textos" hint="Campo onde o comprador digita o código.">
      <Field label="Chamada">
        <Input
          value={(props.label as string) || ''}
          onChange={(e) => onUpdate('label', e.target.value)}
        />
      </Field>
      <Field label="Texto de exemplo dentro do campo">
        <Input
          value={(props.placeholder as string) || ''}
          onChange={(e) => onUpdate('placeholder', e.target.value)}
        />
      </Field>
      <Field label="Texto do botão">
        <Input
          value={(props.buttonText as string) || ''}
          onChange={(e) => onUpdate('buttonText', e.target.value)}
        />
      </Field>
    </Section>
  )
}

function BumpOfferProperties({ props, onUpdate }: PropertiesProps) {
  return (
    <>
      <Section icon={Gift} title="Oferta">
        <Field label="Título">
          <Input
            value={(props.title as string) || ''}
            onChange={(e) => onUpdate('title', e.target.value)}
          />
        </Field>
        <Field label="Descrição" hint="Texto ao lado da caixa de seleção.">
          <Input
            value={(props.description as string) || ''}
            onChange={(e) => onUpdate('description', e.target.value)}
          />
        </Field>
        <Field label="Texto do botão">
          <Input
            value={(props.buttonText as string) || ''}
            onChange={(e) => onUpdate('buttonText', e.target.value)}
          />
        </Field>
      </Section>
      <PriceFields props={props} onUpdate={onUpdate} />
    </>
  )
}
