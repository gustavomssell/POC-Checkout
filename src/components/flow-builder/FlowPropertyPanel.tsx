import { X, Tag, Mail, GitBranch, Webhook, Link2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { Field, Section, Segmented } from '@/components/ui/property-controls'
import { FLOW_NODE_TYPES } from '@/lib/constants'
import type { Node } from '@xyflow/react'

interface FlowPropertyPanelProps {
  selectedNode: Node | null
  onUpdateNode: (id: string, data: Record<string, unknown>) => void
  onClose: () => void
}

const WEBHOOK_METHODS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DEL' },
] as const

type WebhookMethod = (typeof WEBHOOK_METHODS)[number]['value']

function FlowPropertiesHeader({ selectedNode, onClose }: { selectedNode: Exclude<FlowPropertyPanelProps['selectedNode'], null>; onClose: () => void }) {
  const nodeConfig = FLOW_NODE_TYPES.find((t) => t.type === selectedNode.type)

  return (
    <div className="p-4 border-b flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: nodeConfig?.color || '#94a3b8' }}
        />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{nodeConfig?.name || 'Nó'}</h2>
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

      {selectedNode.type === 'email' && (
        <Section icon={Mail} title="Envio" hint="Disparado quando o fluxo chega aqui.">
          <Field label="Assunto">
            <Input
              placeholder="Ex: Obrigado pela compra!"
              value={(selectedNode.data.subject as string) || ''}
              onChange={(e) => onUpdateNode(selectedNode.id, { subject: e.target.value })}
            />
          </Field>
          <Field label="Template" hint="Identificador do modelo no provedor de e-mail.">
            <Input
              placeholder="Ex: confirmation-email"
              value={(selectedNode.data.template as string) || ''}
              onChange={(e) => onUpdateNode(selectedNode.id, { template: e.target.value })}
            />
          </Field>
        </Section>
      )}

      {selectedNode.type === 'condition' && (
        <Section
          icon={GitBranch}
          title="Condição"
          hint="Expressão avaliada na hora. Use saída verde (sim) e vermelha (não)."
        >
          <Field label="Expressão" hint="Ex: comprou_upsell == true, valor_total > 100.">
            <Input
              placeholder="Ex: pagamento_aprovado == true"
              value={(selectedNode.data.condition as string) || ''}
              onChange={(e) => onUpdateNode(selectedNode.id, { condition: e.target.value })}
            />
          </Field>
        </Section>
      )}

      {selectedNode.type === 'webhook' && (
        <Section icon={Webhook} title="Webhook" hint="Chamada HTTP quando o fluxo chega aqui.">
          <Field label="URL" hint="Precisa começar com https://">
            <Input
              placeholder="https://api.exemplo.com/webhook"
              value={(selectedNode.data.url as string) || ''}
              onChange={(e) => onUpdateNode(selectedNode.id, { url: e.target.value })}
            />
          </Field>
          <Field label="Método">
            <Segmented<WebhookMethod>
              ariaLabel="Método HTTP"
              value={((selectedNode.data.method as string) || 'POST') as WebhookMethod}
              onChange={(method) => onUpdateNode(selectedNode.id, { method })}
              options={[...WEBHOOK_METHODS]}
            />
          </Field>
        </Section>
      )}

      {selectedNode.type === 'checkout' && (
        <Section icon={Link2} title="Destino" hint="Para onde levar após esta etapa.">
          <Field label="URL de redirecionamento" hint="Vazio mantém o fluxo interno.">
            <Input
              placeholder="https://checkout.exemplo.com"
              value={(selectedNode.data.redirectUrl as string) || ''}
              onChange={(e) => onUpdateNode(selectedNode.id, { redirectUrl: e.target.value })}
            />
          </Field>
        </Section>
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
      <div className="w-72 border-l bg-sidebar flex flex-col hidden lg:flex">
        <div className="p-4 border-b">
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
    <div className="w-72 border-l bg-sidebar flex flex-col h-full">
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
        <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-card shadow-xl outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
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
