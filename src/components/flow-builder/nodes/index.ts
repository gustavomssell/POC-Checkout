export { StartNode } from './StartNode'
export { CheckoutNode } from './CheckoutNode'
export { UpsellNode } from './UpsellNode'
export { ThankYouNode } from './ThankYouNode'
export { EmailNode } from './EmailNode'
export { ConditionNode } from './ConditionNode'
export { WebhookNode } from './WebhookNode'

import type { NodeTypes } from '@xyflow/react'
import { Play, ShoppingCart, Sparkles, CheckCircle, Mail, GitBranch, Webhook, type LucideIcon } from 'lucide-react'
import { StartNode } from './StartNode'
import { CheckoutNode } from './CheckoutNode'
import { UpsellNode } from './UpsellNode'
import { ThankYouNode } from './ThankYouNode'
import { EmailNode } from './EmailNode'
import { ConditionNode } from './ConditionNode'
import { WebhookNode } from './WebhookNode'
import type { FlowNodeType } from '@/types/flow'

export const FLOW_NODE_ICONS: Record<FlowNodeType, LucideIcon> = {
  start: Play,
  checkout: ShoppingCart,
  upsell: Sparkles,
  'thank-you': CheckCircle,
  email: Mail,
  condition: GitBranch,
  webhook: Webhook,
}

export const nodeTypes: NodeTypes = {
  start: StartNode,
  checkout: CheckoutNode,
  upsell: UpsellNode,
  'thank-you': ThankYouNode,
  email: EmailNode,
  condition: ConditionNode,
  webhook: WebhookNode,
}
