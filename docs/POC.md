# A POC

## O que ela prova

Que um vendedor monta sozinho uma página de checkout completa (estrutura + oferta + funil) sem escrever código, e que o resultado sai idêntico no desktop e no mobile. Três peças sustentam isso: o builder de checkout, o builder de flow e o preview que espelha os dois.

## Checkout builder

### Componentes fixos vs. arrastáveis

O checkout real sempre tem produto, dados do comprador, pagamento e resumo. Esses quatro vivem no `FixedCheckoutForm` — renderizado sempre, sem drag, sem delete. Todo o resto (20 tipos: header, upsell, depoimento, countdown, benefícios, FAQ, vídeo, prova social, cupom, bump offer, footer, garantias + linhas de 1–4 colunas) o usuário arrasta da paleta.

Modelo de dado (`types/checkout.ts`):

```ts
interface CheckoutComponent {
  id: string
  type: ComponentType       // 20 tipos
  props: Record<string, unknown>
  order: number             // ordem dentro da zona
  placement?: 'above' | 'below' | 'sidebar'
  children?: CheckoutComponent[]  // itens dentro das células do grid
  gridColumns?: 1 | 2 | 3 | 4
}
```

### Zonas e grids aninhados

O formulário fixo divide o canvas em três zonas (`canvas-top`, `canvas-bottom`, `canvas-sidebar`), cada uma com seu `SortableContext`. Mover itens dentro da zona reordena; soltar em outra zona move (`moveComponentToZone`). Linhas são componentes com `children`: cada célula é um `useDroppable` (`<parentId>-cell-<i>`), e dá para arrastar para dentro, entre células e de volta para fora — inclusive em grids aninhados, com `add`/`remove`/`duplicate` recursivos na store.

Durante o arrasto, o alvo atual acende: zonas e células com anel verde, itens com contorno tracejado e selo "Soltar aqui" (via `useDndContext`). O fantasma do item (`DragOverlay` com `dropAnimation={null}`) some no instante do drop, sem animação de retorno.

### Propriedades em modal

Clicar num componente abre `ComponentPropertiesDialog` (a paleta continua visível atrás). Cada tipo tem seções com controles adequados ao dado — ver `docs/UI_UX.md`.

## Flow builder

Canvas React Flow com 7 nós (`start`, `checkout`, `upsell`, `thank-you`, `email`, `condition`, `webhook`), cada um com componente visual próprio, cor e handles (condição tem saídas `yes`/`no`). Estado único no componente pai via `useNodesState`/`useEdgesState`, então salvar nunca perde conexão. Nós entram por arrasto da paleta (`screenToFlowPosition`); Delete remove nó + arestas órfãs. Sem template, o builder cria um com o trio padrão. Cada tipo tem campos próprios no painel (assunto do e-mail, método do webhook em pílulas, expressão da condição, redirect do checkout).

## Como se interligam

```
Dashboard (/checkouts)
  ├─ Editar  → /checkouts/:id      (CheckoutEditorPage)
  └─ Flow    → /checkouts/:id/flow (FlowBuilderPage)
```

- **Rotas** (`src/app/router.tsx`): id inválido volta para a lista; rota inexistente cai no 404; reload e deep-link funcionam.
- **Contexto compartilhado**: as páginas carregam o template do checkout pelo id da URL (`loadTemplate`), então editor e flow sempre falam do mesmo checkout. O flow guarda seus próprios nós/arestas na `flowStore`, separados dos componentes.
- **Preview** (`PreviewContainer`): renderiza as zonas do builder + formulário fixo + sidebar na ordem certa, em desktop e mobile. É a mesma composição do canvas, sem chrome de edição.
- **Persistência** (Zustand `persist`, sem backend): `checkout-storage`, `flow-storage` e `theme` (claro/escuro/sistema) no localStorage.
- **Temas**: o do sistema cobre o app; o do checkout (cores, fonte, botões por template) via variáveis `--theme-*` cobre formulário, sidebar e card.

## Limites honestos (fora do escopo da POC)

Sem backend real (pagamento, e-mail e webhook não executam — o flow desenha, não roda), sem autenticação e sem E2E automatizado. Próximos passos: API de persistência, motor de execução do flow e suíte Playwright/Cypress.
