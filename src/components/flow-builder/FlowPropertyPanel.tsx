import { X, Tag, Mail, GitBranch, Webhook, Link2, Play, ShoppingCart, Sparkles, CheckCircle, Clock, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { Field, Section, Segmented, ToggleRow, NumberStepper, ItemCard, AddButton } from '@/components/ui/property-controls'
import { FLOW_NODE_TYPES } from '@/lib/constants'
import { FLOW_NODE_ICONS } from './nodes'
import type { FlowNodeType } from '@/types/flow'
import type { Node } from '@xyflow/react'

interface FlowPropertyPanelProps {
  selectedNode: Node | null
  onUpdateNode: (id: string, data: Record<string, unknown>) => void
  onClose: () => void
}

type FlowData = Record<string, unknown>

/* --------------------------------- helpers -------------------------------- */

function str(data: FlowData, key: string): string {
  const v = data[key]
  return typeof v === 'string' ? v : ''
}

function num(data: FlowData, key: string, fallback: number): number {
  const v = data[key]
  return typeof v === 'number' && !Number.isNaN(v) ? v : fallback
}

function bool(data: FlowData, key: string, fallback: boolean): boolean {
  const v = data[key]
  return typeof v === 'boolean' ? v : fallback
}

interface KeyValuePair {
  key: string
  value: string
}

function pairs(data: FlowData, key: string): KeyValuePair[] {
  const v = data[key]
  if (!Array.isArray(v)) return []
  return v.filter(
    (item): item is KeyValuePair =>
      typeof item === 'object' && item !== null && 'key' in item && 'value' in item,
  )
}

/* ------------------------------- NativeSelect ----------------------------- */

interface NativeSelectProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  ariaLabel?: string
}

/** Select nativo estilizado (evita acoplamento com o Base UI no POC). */
function NativeSelect({ value, onChange, options, ariaLabel }: NativeSelectProps) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

/* ------------------------------- KeyValueList ----------------------------- */

interface KeyValueListProps {
  items: KeyValuePair[]
  onChange: (items: KeyValuePair[]) => void
  addLabel: string
  itemTitle: string
}

function KeyValueList({ items, onChange, addLabel, itemTitle }: KeyValueListProps) {
  const update = (index: number, patch: Partial<KeyValuePair>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <ItemCard
          key={index}
          title={`${itemTitle} ${index + 1}`}
          onRemove={() => onChange(items.filter((_, i) => i !== index))}
        >
          <Input
            aria-label="Chave"
            placeholder="chave"
            value={item.key}
            onChange={(e) => update(index, { key: e.target.value })}
            className="h-8 text-xs font-mono"
          />
          <Input
            aria-label="Valor"
            placeholder="valor (aceita {{variavel}})"
            value={item.value}
            onChange={(e) => update(index, { value: e.target.value })}
            className="h-8 text-xs font-mono"
          />
        </ItemCard>
      ))}
      <AddButton label={addLabel} onClick={() => onChange([...items, { key: '', value: '' }])} />
    </div>
  )
}

/* ------------------------------ per-node data ----------------------------- */

const START_TRIGGERS = [
  { value: 'checkout_created', label: 'Pedido criado' },
  { value: 'checkout_opened', label: 'Checkout aberto' },
  { value: 'payment_approved', label: 'Pagamento aprovado' },
  { value: 'manual', label: 'Manual / teste' },
]

const CONDITION_FIELDS = [
  { value: 'pagamento_aprovado', label: 'pagamento_aprovado' },
  { value: 'valor_total', label: 'valor_total' },
  { value: 'comprou_upsell', label: 'comprou_upsell' },
  { value: 'meio_pagamento', label: 'meio_pagamento' },
  { value: 'tentativas_pagamento', label: 'tentativas_pagamento' },
  { value: 'custom', label: 'Campo personalizado…' },
]

const CONDITION_OPERATORS = [
  { value: '==', label: 'é igual (==)' },
  { value: '!=', label: 'é diferente (!=)' },
  { value: '>', label: 'maior que (>)' },
  { value: '<', label: 'menor que (<)' },
  { value: 'contains', label: 'contém' },
  { value: 'exists', label: 'existe' },
]

const WEBHOOK_METHODS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DEL' },
] as const

type WebhookMethod = (typeof WEBHOOK_METHODS)[number]['value']

const BODY_METHODS: WebhookMethod[] = ['POST', 'PUT', 'PATCH']
const QUERY_METHODS: WebhookMethod[] = ['GET', 'DELETE']

/* ---------------------------- per-node sections --------------------------- */

interface NodeSectionProps {
  nodeId: string
  data: FlowData
  onUpdateNode: FlowPropertyPanelProps['onUpdateNode']
}

function StartProperties({ nodeId, data, onUpdateNode }: NodeSectionProps) {
  return (
    <Section icon={Play} title="Gatilho" hint="Evento que coloca o contato neste fluxo.">
      <Field label="Dispara quando">
        <NativeSelect
          ariaLabel="Evento de disparo"
          value={str(data, 'trigger') || 'checkout_created'}
          onChange={(trigger) => onUpdateNode(nodeId, { trigger })}
          options={START_TRIGGERS}
        />
      </Field>
    </Section>
  )
}

function CheckoutProperties({ nodeId, data, onUpdateNode }: NodeSectionProps) {
  const successAction = (str(data, 'successAction') || 'continue') as 'continue' | 'redirect'

  return (
    <>
      <Section icon={ShoppingCart} title="Etapa" hint="Qual página de checkout esta etapa representa.">
        <Field label="Identificador do checkout" hint="Ex: checkout-principal. Vazio usa o atual.">
          <Input
            placeholder="checkout-principal"
            value={str(data, 'checkoutId')}
            onChange={(e) => onUpdateNode(nodeId, { checkoutId: e.target.value })}
          />
        </Field>
      </Section>
      <Section icon={Link2} title="Destino" hint="Para onde levar após esta etapa.">
        <Field label="Ação ao concluir">
          <Segmented<'continue' | 'redirect'>
            ariaLabel="Ação ao concluir"
            value={successAction}
            onChange={(value) => onUpdateNode(nodeId, { successAction: value })}
            options={[
              { value: 'continue', label: 'Seguir fluxo' },
              { value: 'redirect', label: 'Redirecionar' },
            ]}
          />
        </Field>
        <Field label="URL de redirecionamento" hint="Obrigatória quando a ação é redirecionar.">
          <Input
            placeholder="https://checkout.exemplo.com"
            value={str(data, 'redirectUrl')}
            onChange={(e) => onUpdateNode(nodeId, { redirectUrl: e.target.value })}
          />
        </Field>
      </Section>
    </>
  )
}

function UpsellProperties({ nodeId, data, onUpdateNode }: NodeSectionProps) {
  return (
    <>
      <Section icon={Sparkles} title="Oferta" hint="Exibida logo após a compra principal.">
        <Field label="Nome do produto">
          <Input
            value={str(data, 'productName')}
            onChange={(e) => onUpdateNode(nodeId, { productName: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Preço (R$)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={String(num(data, 'price', 97))}
              onChange={(e) => onUpdateNode(nodeId, { price: parseFloat(e.target.value) || 0 })}
            />
          </Field>
          <Field label="De (R$)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={String(num(data, 'originalPrice', 197))}
              onChange={(e) => onUpdateNode(nodeId, { originalPrice: parseFloat(e.target.value) || 0 })}
            />
          </Field>
        </div>
      </Section>
      <Section icon={Tag} title="Botões" hint="Aceitar segue o fluxo; recusar usa a saída de recusa.">
        <Field label="Texto do botão de aceite">
          <Input
            value={str(data, 'acceptText')}
            onChange={(e) => onUpdateNode(nodeId, { acceptText: e.target.value })}
          />
        </Field>
        <Field label="Texto do botão de recusa">
          <Input
            value={str(data, 'declineText')}
            onChange={(e) => onUpdateNode(nodeId, { declineText: e.target.value })}
          />
        </Field>
        <ToggleRow
          label="Permitir pular"
          hint="Mostra a opção de recusar sem penalidade."
          checked={bool(data, 'allowSkip', true)}
          onChange={(allowSkip) => onUpdateNode(nodeId, { allowSkip })}
        />
      </Section>
    </>
  )
}

function ThankYouProperties({ nodeId, data, onUpdateNode }: NodeSectionProps) {
  return (
    <>
      <Section icon={CheckCircle} title="Confirmação" hint="Última etapa visível para o comprador.">
        <Field label="Título">
          <Input
            value={str(data, 'headline')}
            onChange={(e) => onUpdateNode(nodeId, { headline: e.target.value })}
          />
        </Field>
        <Field label="Mensagem">
          <textarea
            value={str(data, 'message')}
            onChange={(e) => onUpdateNode(nodeId, { message: e.target.value })}
            className="w-full min-h-[70px] px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm resize-none"
          />
        </Field>
        <ToggleRow
          label="Mostrar resumo do pedido"
          hint="Exibe itens, totais e meio de pagamento."
          checked={bool(data, 'showSummary', true)}
          onChange={(showSummary) => onUpdateNode(nodeId, { showSummary })}
        />
      </Section>
      <Section icon={Tag} title="Próximos passos" hint="Opcional: cupom e redirecionamento.">
        <Field label="Cupom para próxima compra" hint="Vazio oculta o cupom.">
          <Input
            placeholder="VOLTE10"
            value={str(data, 'couponCode')}
            onChange={(e) => onUpdateNode(nodeId, { couponCode: e.target.value })}
          />
        </Field>
        <Field label="URL de redirecionamento" hint="Vazio encerra o fluxo aqui.">
          <Input
            placeholder="https://loja.exemplo.com"
            value={str(data, 'redirectUrl')}
            onChange={(e) => onUpdateNode(nodeId, { redirectUrl: e.target.value })}
          />
        </Field>
      </Section>
    </>
  )
}

function EmailProperties({ nodeId, data, onUpdateNode }: NodeSectionProps) {
  const toMode = (str(data, 'toMode') || 'customer') as 'customer' | 'fixed'

  return (
    <Section icon={Mail} title="Envio" hint="Disparado quando o fluxo chega aqui. Use {{nome}} e {{pedido}} no assunto.">
      <Field label="Destinatário">
        <Segmented<'customer' | 'fixed'>
          ariaLabel="Destinatário"
          value={toMode}
          onChange={(value) => onUpdateNode(nodeId, { toMode: value })}
          options={[
            { value: 'customer', label: 'Cliente' },
            { value: 'fixed', label: 'Fixo' },
          ]}
        />
      </Field>
      {toMode === 'fixed' && (
        <Field label="E-mail fixo" hint="Usado em vez do e-mail do comprador.">
          <Input
            type="email"
            placeholder="time@exemplo.com"
            value={str(data, 'toEmail')}
            onChange={(e) => onUpdateNode(nodeId, { toEmail: e.target.value })}
          />
        </Field>
      )}
      <Field label="Remetente (nome)" hint="Vazio usa o nome da loja.">
        <Input
          placeholder="Minha Loja"
          value={str(data, 'fromName')}
          onChange={(e) => onUpdateNode(nodeId, { fromName: e.target.value })}
        />
      </Field>
      <Field label="Assunto">
        <Input
          placeholder="Ex: Obrigado pela compra!"
          value={str(data, 'subject')}
          onChange={(e) => onUpdateNode(nodeId, { subject: e.target.value })}
        />
      </Field>
      <Field label="Template" hint="Identificador do modelo no provedor de e-mail.">
        <Input
          placeholder="Ex: confirmation-email"
          value={str(data, 'template')}
          onChange={(e) => onUpdateNode(nodeId, { template: e.target.value })}
        />
      </Field>
      <Field label="Atraso no envio">
        <NumberStepper
          ariaLabel="Atraso em minutos"
          min={0}
          max={1440}
          step={5}
          value={num(data, 'delayMinutes', 0)}
          onChange={(delayMinutes) => onUpdateNode(nodeId, { delayMinutes })}
        />
      </Field>
    </Section>
  )
}

function ConditionProperties({ nodeId, data, onUpdateNode }: NodeSectionProps) {
  const mode = (str(data, 'mode') || 'simple') as 'simple' | 'advanced'
  const field = str(data, 'field') || 'pagamento_aprovado'
  const operator = str(data, 'operator') || '=='
  const value = str(data, 'value') ?? ''
  const isCustomField = !CONDITION_FIELDS.some((f) => f.value === field)

  const updateSimple = (patch: Partial<{ field: string; operator: string; value: string }>) => {
    const next = { field, operator, value, ...patch }
    onUpdateNode(nodeId, {
      ...next,
      condition: next.operator === 'exists' ? `${next.field} exists` : `${next.field} ${next.operator} ${next.value}`,
    })
  }

  return (
    <Section
      icon={GitBranch}
      title="Condição"
      hint="Expressão avaliada na hora. Use saída verde (sim) e vermelha (não)."
    >
      <Field label="Modo">
        <Segmented<'simple' | 'advanced'>
          ariaLabel="Modo da condição"
          value={mode}
          onChange={(value) => onUpdateNode(nodeId, { mode: value })}
          options={[
            { value: 'simple', label: 'Simples' },
            { value: 'advanced', label: 'Avançada' },
          ]}
        />
      </Field>

      {mode === 'simple' ? (
        <>
          <Field label="Campo">
            <NativeSelect
              ariaLabel="Campo da condição"
              value={isCustomField ? 'custom' : field}
              onChange={(v) => updateSimple({ field: v === 'custom' ? '' : v })}
              options={CONDITION_FIELDS}
            />
          </Field>
          {isCustomField && (
            <Field label="Nome do campo" hint="Ex: cliente_vip, plano, origem.">
              <Input
                placeholder="Ex: cliente_vip"
                value={field}
                onChange={(e) => updateSimple({ field: e.target.value })}
              />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Operador">
              <NativeSelect
                ariaLabel="Operador da condição"
                value={operator}
                onChange={(v) => updateSimple({ operator: v })}
                options={CONDITION_OPERATORS}
              />
            </Field>
            <Field label="Valor" hint={operator === 'exists' ? 'Ignorado neste operador.' : 'Ex: true, 100, pix.'}>
              <Input
                placeholder="Ex: true"
                value={value}
                onChange={(e) => updateSimple({ value: e.target.value })}
              />
            </Field>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono break-all">
            {operator === 'exists' ? `${field || 'campo'} exists` : `${field || 'campo'} ${operator} ${value || '…'}`}
          </p>
        </>
      ) : (
        <Field label="Expressão" hint="Ex: comprou_upsell == true, valor_total > 100.">
          <Input
            placeholder="Ex: pagamento_aprovado == true"
            value={str(data, 'condition')}
            onChange={(e) => onUpdateNode(nodeId, { condition: e.target.value })}
          />
        </Field>
      )}
    </Section>
  )
}

function WebhookProperties({ nodeId, data, onUpdateNode }: NodeSectionProps) {
  const method = ((str(data, 'method') || 'POST') as WebhookMethod)
  const url = str(data, 'url')
  const body = str(data, 'body')
  const showBody = BODY_METHODS.includes(method)
  const showQuery = QUERY_METHODS.includes(method)

  let bodyError: string | null = null
  if (showBody && body.trim() !== '') {
    try {
      JSON.parse(body)
    } catch {
      bodyError = 'JSON inválido — confira aspas e vírgulas.'
    }
  }

  return (
    <>
      <Section icon={Webhook} title="Webhook" hint="Chamada HTTP quando o fluxo chega aqui.">
        <Field label="URL" hint="Precisa começar com https://">
          <Input
            placeholder="https://api.exemplo.com/webhook"
            value={url}
            onChange={(e) => onUpdateNode(nodeId, { url: e.target.value })}
          />
        </Field>
        {url !== '' && !url.startsWith('https://') && (
          <p className="text-[11px] leading-snug text-amber-600">
            A URL precisa começar com https:// para o envio funcionar.
          </p>
        )}
        <Field label="Método">
          <Segmented<WebhookMethod>
            ariaLabel="Método HTTP"
            value={method}
            onChange={(value) => onUpdateNode(nodeId, { method: value })}
            options={[...WEBHOOK_METHODS]}
          />
        </Field>
        {!showBody && (
          <p className="text-[11px] leading-snug text-muted-foreground">
            {method} não envia corpo — use query params abaixo para filtrar ou identificar o recurso.
          </p>
        )}
      </Section>

      {showQuery && (
        <Section icon={Link2} title="Query params" hint="Vão na URL (?chave=valor). Aceita {{variaveis}}.">
          <KeyValueList
            items={pairs(data, 'queryParams')}
            onChange={(queryParams) => onUpdateNode(nodeId, { queryParams })}
            addLabel="Adicionar param"
            itemTitle="Param"
          />
        </Section>
      )}

      {showBody && (
        <Section icon={SlidersHorizontal} title="Corpo (JSON)" hint="Enviado no corpo da requisição. Aceita {{order.id}}, {{customer.email}}.">
          <Field label="Payload">
            <textarea
              aria-label="Corpo JSON"
              value={body}
              onChange={(e) => onUpdateNode(nodeId, { body: e.target.value })}
              spellCheck={false}
              className="w-full min-h-[110px] px-3 py-2 border border-input rounded-md bg-background text-foreground text-xs font-mono resize-y"
              placeholder={'{\n  "orderId": "{{order.id}}"\n}'}
            />
          </Field>
          {bodyError && (
            <p className="text-[11px] leading-snug text-destructive">{bodyError}</p>
          )}
        </Section>
      )}

      <Section icon={Tag} title="Headers" hint="Enviados em toda chamada (ex: Authorization).">
        <KeyValueList
          items={pairs(data, 'headers')}
          onChange={(headers) => onUpdateNode(nodeId, { headers })}
          addLabel="Adicionar header"
          itemTitle="Header"
        />
      </Section>
    </>
  )
}

/* --------------------------------- header --------------------------------- */

function FlowPropertiesHeader({ selectedNode, onClose }: { selectedNode: Exclude<FlowPropertyPanelProps['selectedNode'], null>; onClose: () => void }) {
  const nodeConfig = FLOW_NODE_TYPES.find((t) => t.type === selectedNode.type)
  const color = nodeConfig?.color || '#94a3b8'
  const Icon = FLOW_NODE_ICONS[selectedNode.type as FlowNodeType]

  return (
    <div className="p-4 border-b border-border flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon ? (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}1f` }}
          >
            <Icon className="w-4 h-4" style={{ color }} strokeWidth={2.25} />
          </div>
        ) : (
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">{nodeConfig?.name || 'Nó'}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {nodeConfig?.description || ''}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-muted shrink-0"
        title="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

function FlowPropertiesSections({ selectedNode, onUpdateNode }: { selectedNode: Exclude<FlowPropertyPanelProps['selectedNode'], null>; onUpdateNode: FlowPropertyPanelProps['onUpdateNode'] }) {
  const data = (selectedNode.data ?? {}) as FlowData

  return (
    <>
      <Section icon={Tag} title="Geral">
        <Field label="Nome do nó" hint="Como ele aparece no canvas.">
          <Input
            value={(selectedNode.data.label as string) || ''}
            onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
          />
        </Field>
      </Section>

      {selectedNode.type === 'start' && (
        <StartProperties nodeId={selectedNode.id} data={data} onUpdateNode={onUpdateNode} />
      )}

      {selectedNode.type === 'checkout' && (
        <CheckoutProperties nodeId={selectedNode.id} data={data} onUpdateNode={onUpdateNode} />
      )}

      {selectedNode.type === 'upsell' && (
        <UpsellProperties nodeId={selectedNode.id} data={data} onUpdateNode={onUpdateNode} />
      )}

      {selectedNode.type === 'thank-you' && (
        <ThankYouProperties nodeId={selectedNode.id} data={data} onUpdateNode={onUpdateNode} />
      )}

      {selectedNode.type === 'email' && (
        <>
          <EmailProperties nodeId={selectedNode.id} data={data} onUpdateNode={onUpdateNode} />
          <Section icon={Clock} title="Variáveis" hint="Disponíveis no assunto e no template.">
            <p className="text-[11px] leading-relaxed text-muted-foreground font-mono break-all">
              {'{{customer.name}} {{customer.email}} {{order.id}} {{order.total}}'}
            </p>
          </Section>
        </>
      )}

      {selectedNode.type === 'condition' && (
        <ConditionProperties nodeId={selectedNode.id} data={data} onUpdateNode={onUpdateNode} />
      )}

      {selectedNode.type === 'webhook' && (
        <WebhookProperties nodeId={selectedNode.id} data={data} onUpdateNode={onUpdateNode} />
      )}

      <div className="pt-1">
        <p className="text-[11px] text-muted-foreground font-mono break-all">
          ID: {selectedNode.id}
        </p>
      </div>
    </>
  )
}

export function FlowPropertyPanel({ selectedNode, onUpdateNode, onClose }: FlowPropertyPanelProps) {
  if (!selectedNode) {
    return (
      <div className="w-72 border-l border-border bg-sidebar flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold">Propriedades</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Selecione um nó para editar
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Clique em um nó no fluxo para ver suas propriedades
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-72 border-l border-border bg-sidebar flex flex-col h-full">
      <FlowPropertiesHeader selectedNode={selectedNode} onClose={onClose} />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          <FlowPropertiesSections selectedNode={selectedNode} onUpdateNode={onUpdateNode} />
        </div>
      </ScrollArea>
    </div>
  )
}

/** Modal de propriedades do nó (usado pelo builder em vez do painel lateral). */
export function FlowPropertiesDialog({ selectedNode, onUpdateNode, onClose }: FlowPropertyPanelProps) {
  const open = !!selectedNode
  const nodeConfig = selectedNode
    ? FLOW_NODE_TYPES.find((t) => t.type === selectedNode.type)
    : undefined

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          {selectedNode && (
            <>
              <DialogPrimitive.Title className="sr-only">
                {nodeConfig?.name ?? 'Propriedades do nó'}
              </DialogPrimitive.Title>
              <FlowPropertiesHeader selectedNode={selectedNode} onClose={onClose} />
              <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="p-4 space-y-5">
                  <FlowPropertiesSections selectedNode={selectedNode} onUpdateNode={onUpdateNode} />
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
