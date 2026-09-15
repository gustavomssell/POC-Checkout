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
