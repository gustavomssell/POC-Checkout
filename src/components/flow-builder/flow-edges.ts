import type { Edge } from '@xyflow/react'
import { DeletableEdge } from './DeletableEdge'

/** Tipos de aresta do canvas (deletable = tesoura no hover para cortar). */
export const flowEdgeTypes = { deletable: DeletableEdge }

/** Remove a aresta pelo id (pura, testável). */
export function removeEdgeById<E extends Edge>(edges: E[], id: string): E[] {
  return edges.filter((edge) => edge.id !== id)
}
