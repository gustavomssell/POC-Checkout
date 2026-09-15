import { Position, type NodeProps } from '@xyflow/react'
import { Webhook } from 'lucide-react'
import { FlowNodeShell } from './flow-node-shell'
import { cn } from '@/lib/utils'

const METHOD_BADGE: Record<string, string> = {
  GET: 'method-badge method-get',
  POST: 'method-badge method-post',
  PUT: 'method-badge method-put',
  PATCH: 'method-badge method-patch',
  DELETE: 'method-badge method-delete',
}

export function WebhookNode({ data, selected }: NodeProps) {
  const d = data as { label: string; method?: string; url?: string }
  const method = d.method || 'POST'
  const short = (d.url || '').replace(/^https?:\/\//, '').split(/[/?]/)[0].slice(0, 24)
  return (
    <FlowNodeShell
      color="#6366f1"
      icon={Webhook}
      label={d.label}
      caption={
        <span className="inline-flex items-center gap-1.5 max-w-full">
          <span className={cn(METHOD_BADGE[method] ?? 'method-badge method-post')}>{method}</span>
          <span className="truncate">{short || 'url…'}</span>
        </span>
      }
      selected={selected}
      handles={[
        { type: 'target', position: Position.Top },
        { type: 'source', position: Position.Bottom },
      ]}
    />
  )
}
