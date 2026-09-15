import { type Node, type Edge } from '@xyflow/react'

export type FlowNodeType =
  | 'start'
  | 'checkout'
  | 'upsell'
  | 'thank-you'
  | 'email'
  | 'condition'
  | 'webhook'

export interface FlowNodeData extends Record<string, unknown> {
  label: string
  type: FlowNodeType
  config?: Record<string, unknown>
  // start
  trigger?: string
  // checkout
  checkoutId?: string
  redirectUrl?: string
  successAction?: 'continue' | 'redirect'
  // upsell
  productName?: string
  price?: number
  originalPrice?: number
  acceptText?: string
  declineText?: string
  allowSkip?: boolean
  // thank-you
  headline?: string
  message?: string
  showSummary?: boolean
  couponCode?: string
  // email
  toMode?: 'customer' | 'fixed'
  toEmail?: string
  fromName?: string
  subject?: string
  template?: string
  delayMinutes?: number
  // condition (híbrido: simples estruturado + expressão avançada)
  mode?: 'simple' | 'advanced'
  field?: string
  operator?: string
  value?: string
  condition?: string
  // webhook (básico: URL + método + headers + query/body por CRUD)
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Array<{ key: string; value: string }>
  queryParams?: Array<{ key: string; value: string }>
  body?: string
}

export type FlowNode = Node<FlowNodeData>

export type FlowEdge = Edge

export interface FlowTemplate {
  id: string
  name: string
  description: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  createdAt: string
  updatedAt: string
}

export interface FlowNodeConfig {
  type: FlowNodeType
  name: string
  description: string
  icon: string
  color: string
}
