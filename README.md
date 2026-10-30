# POC Checkout Builder

Builder visual de páginas de checkout estilo Cakto/Kiwify, com editor drag-and-drop de componentes e construtor de fluxos pós-compra. Sem backend: tudo roda no navegador com persistência local.

Quem vende infoproduto troca faturamento na página de checkout. As plataformas engessam o layout; mudar ordem, oferta ou prova social exige pedir para o dev ou aceitar o padrão. Esta POC prova que dá para entregar um editor onde o próprio vendedor monta a página arrastando blocos, configura cada peça num modal e desenha o funil (checkout → upsell → obrigado → e-mail) num canvas visual.

---

## Prova visual

<div align="center">
  <img src="src/assets/hero.png" alt="Checkout Builder — editor drag-and-drop com paleta à direita e canvas central" width="100%" max-width="960" />
  <p><b>Editor de checkout:</strong> paleta à direita, formulário fixo no centro, drop zones à esquerda e abaixo.</p>
</div>

---

## O que faz

| Área | O que entrega |
|------|---------------|
| **Checkout builder** | 20 componentes arrastáveis, formulário de pagamento fixo (produto, dados, métodos, cartão, resumo), 3 zonas de drop (acima, abaixo e lateral), linhas de 1 a 4 colunas com componentes aninhados |
| **Flow builder** | Canvas com 7 tipos de nó, conexões deletáveis, minimap, painel de propriedades por tipo, drag da paleta para o canvas |
| **Preview fiel** | Espelha o builder (form fixo + zonas + sidebar) em desktop e mobile (frame 375px) |
| **Dois níveis de tema** | Tema do sistema (claro/escuro/sistema, cobre todo o app) e tema do checkout (cores, fonte e botões por template) |
| **Rotas reais** | `/checkouts`, `/checkouts/:id`, `/checkouts/:id/flow`, 404, deep-link com reload |
| **247 testes automatizados** | Vitest + Testing Library |

---

## Stack

| Tecnologia | Versão | Papel |
|------------|--------|-------|
| React | 19 | UI |
| TypeScript | 6 | Tipagem estática |
| Vite | 8 | Build e dev server |
| Tailwind CSS | 4 | Estilo utility-first |
| shadcn/ui (base-nova) | latest | Primitivos acessíveis |
| @dnd-kit | 6 / 10 | Drag-and-drop do canvas |
| @xyflow/react | 12 | Canvas do flow |
| Zustand + persist | 5 | Estado com localStorage |
| React Router | 7 | Rotas (`createBrowserRouter`) |
| Lucide | latest | Ícones |
| Vitest | 5 | Testes |

---

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + build de produção
npm run preview    # serve o build
npm test           # suite completa (247 testes)
npm run test:watch # modo watch
```

---

## Como funciona

```
Dashboard (/checkouts)
  ├─ Editar  → /checkouts/:id      (CheckoutEditorPage)
  └─ Flow    → /checkouts/:id/flow (FlowBuilderPage)
```

- **Rotas** (`src/app/router.tsx`): id inválido volta para a lista; rota inexistente cai no 404; reload e deep-link funcionam.
- **Contexto compartilhado**: as páginas carregam o template do checkout pelo id da URL, então editor e flow sempre falam do mesmo checkout. O flow guarda seus próprios nós/arestas na `flowStore`, separados dos componentes.
- **Preview**: renderiza as zonas do builder + formulário fixo + sidebar na ordem certa, em desktop e mobile — mesma composição do canvas, sem chrome de edição.
- **Persistência** (Zustand `persist`, sem backend): `checkout-storage`, `flow-storage` e `theme` no localStorage.

---

## Estrutura

```
src/
├── app/                  # router, providers, error boundary
├── pages/                # DashboardPage, CheckoutEditorPage, FlowBuilderPage, NotFoundPage
├── components/
│   ├── checkout-builder/ # editor, canvas, paleta, formulário fixo, sidebar
│   ├── flow-builder/     # editor, paleta de nós, nós customizados
│   ├── preview/          # renderer + device frame
│   ├── dashboard/        # lista de checkouts
│   └── ui/               # shadcn + controles de propriedade
├── stores/               # checkoutStore, flowStore (persist)
├── types/                # checkout, flow
├── lib/                  # constants (catálogos), utils
└── test/                 # 14 arquivos de teste (+ setup)
```

---

## Documentação

- [`docs/POC.md`](docs/POC.md) — o que a POC prova, como o checkout e o flow funcionam e se interligam
- [`docs/TESTING.md`](docs/TESTING.md) — estratégia de QA, cobertura e como rodar
- [`docs/UI_UX.md`](docs/UI_UX.md) — decisões de interface, temas e acessibilidade

---

## Limites honestos (fora do escopo da POC)

Sem backend real (pagamento, e-mail e webhook não executam — o flow desenha, não roda), sem autenticação e sem E2E automatizado. Próximos passos: API de persistência, motor de execução do flow e suíte Playwright/Cypress.

---

## Referências

- [shadcn/ui](https://ui.shadcn.com) · [@dnd-kit](https://dndkit.com) · [React Flow](https://reactflow.dev) · [Tailwind CSS](https://tailwindcss.com) · [Zustand](https://github.com/pmndrs/zustand) · [Vitest](https://vitest.dev)

---

## Licença

MIT