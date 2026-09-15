export { StartNode } from './StartNode'
export { CheckoutNode } from './CheckoutNode'
export { UpsellNode } from './UpsellNode'
export { ThankYouNode } from './ThankYouNode'
export { EmailNode } from './EmailNode'
export { ConditionNode } from './ConditionNode'
export { WebhookNode } from './WebhookNode'

import type { NodeTypes } from '@xyflow/react'
import { StartNode } from './StartNode'
import { CheckoutNode } from './CheckoutNode'
import { UpsellNode } from './UpsellNode'
import { ThankYouNode } from './ThankYouNode'
import { EmailNode } from './EmailNode'
import { ConditionNode } from './ConditionNode'
import { WebhookNode } from './WebhookNode'

export const nodeTypes: NodeTypes = {
  start: StartNode,
  checkout: CheckoutNode,
  upsell: UpsellNode,
  'thank-you': ThankYouNode,
  email: EmailNode,
  condition: ConditionNode,
  webhook: WebhookNode,
}
