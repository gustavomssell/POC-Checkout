import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  LayoutGrid,
  Package,
  FileText,
  CreditCard,
  Receipt,
  Sparkles,
  Shield,
  Type,
  Image,
  CheckCircle,
  Stamp,
  List,
  Timer,
  MessageCircle,
  Video,
  MapPin,
  Settings,
  MousePointerClick,
  Bell,
  MessageSquare,
} from 'lucide-react'
import { CHECKOUT_COMPONENTS } from '@/lib/constants'
import type { ComponentType } from '@/types/checkout'
import { ThemeSettings } from './ThemeSettings'
import { Switch } from '@/components/ui/switch'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutTop: LayoutGrid,
  Package,
  FileText,
  CreditCard,
  Receipt,
  Sparkles,
  Shield,
  LayoutBottom: LayoutGrid,
  Type,
  Image,
  CheckCircle,
  Stamp,
  List,
  Timer,
  MessageCircle,
  Video,
  MapPin,
  Settings,
  MousePointerClick,
  Bell,
  MessageSquare,
}

type PaletteTab = 'components' | 'lines' | 'settings'

interface DraggablePaletteItemProps {
  type: ComponentType
  name: string
  description: string
  icon: string
}

function DraggablePaletteItem({ type, name, icon }: DraggablePaletteItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      type: 'palette-item',
      componentType: type,
    },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined

  const IconComponent = iconMap[icon] || Package

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex flex-col items-center justify-center p-3 rounded-lg border border-muted-foreground/25 bg-card cursor-grab
        hover:border-primary/50 hover:bg-accent transition-colors aspect-square
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
      {...listeners}
      {...attributes}
    >
      <IconComponent className="w-6 h-6 text-muted-foreground mb-1" />
      <span className="text-xs font-medium text-center">{name}</span>
    </div>
  )
}

interface DraggableLineItemProps {
  type: ComponentType
  columns: number
  label: string
}

function DraggableLineItem({ type, columns, label }: DraggableLineItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      type: 'palette-item',
      componentType: type,
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
      className={`
        flex flex-col gap-2 p-3 rounded-lg border border-dashed border-muted-foreground/30 bg-card
        cursor-grab hover:border-primary/50 hover:bg-accent transition-colors
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
      {...listeners}
      {...attributes}
    >
      <span className="text-xs font-medium">{label}</span>
      <div className="flex gap-1">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-12 rounded border border-dashed border-muted-foreground/30 bg-background flex items-center justify-center min-w-0"
          >
            <span className="text-xs text-muted-foreground">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ExtraComponentProps {
  name: string
  icon: React.ComponentType<{ className?: string }>
  enabled: boolean
  onToggle: (checked: boolean) => void
}

function ExtraComponentItem({ name, icon: Icon, enabled, onToggle }: ExtraComponentProps) {
  return (
    <div className="flex items-center justify-between py-2 px-1">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">{name}</span>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  )
}

export function ComponentPalette() {
  const [activeTab, setActiveTab] = useState<PaletteTab>('components')
  const [extraComponents, setExtraComponents] = useState({
    exitPopup: false,
    notification: false,
    chat: false,
  })
  const basicComponents = CHECKOUT_COMPONENTS.filter((c) => !c.isGrid)

  const tabs: { id: PaletteTab; label: string }[] = [
    { id: 'components', label: 'Componentes' },
    { id: 'lines', label: 'Linhas' },
    { id: 'settings', label: 'Configurações' },
  ]

  return (
    <div className="flex-1 bg-sidebar dark:bg-[#0b0e0e] flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-3 text-xs font-medium transition-colors
              ${activeTab === tab.id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'components' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Componentes</p>
              <div className="grid grid-cols-2 gap-2">
                {basicComponents.map((component) => (
                  <DraggablePaletteItem
                    key={component.type}
                    type={component.type}
                    name={component.name}
                    description={component.description}
                    icon={component.icon}
                  />
                ))}
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Componentes Extras</p>
              <div className="space-y-1">
                <ExtraComponentItem
                  name="Exit Popup"
                  icon={MousePointerClick}
                  enabled={extraComponents.exitPopup}
                  onToggle={(checked) => setExtraComponents(prev => ({ ...prev, exitPopup: checked }))}
                />
                <ExtraComponentItem
                  name="Notificação"
                  icon={Bell}
                  enabled={extraComponents.notification}
                  onToggle={(checked) => setExtraComponents(prev => ({ ...prev, notification: checked }))}
                />
                <ExtraComponentItem
                  name="Chat"
                  icon={MessageSquare}
                  enabled={extraComponents.chat}
                  onToggle={(checked) => setExtraComponents(prev => ({ ...prev, chat: checked }))}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lines' && (
          <div className="flex flex-col gap-2">
            <DraggableLineItem type="grid-1" columns={1} label="Linha 1 coluna" />
            <DraggableLineItem type="grid-2" columns={2} label="Linha 2 colunas" />
            <DraggableLineItem type="grid-3" columns={3} label="Linha 3 colunas" />
            <DraggableLineItem type="grid-4" columns={4} label="Linha 4 colunas" />
          </div>
        )}

        {activeTab === 'settings' && <ThemeSettings />}
      </div>
    </div>
  )
}
