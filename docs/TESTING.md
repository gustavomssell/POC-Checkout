# Estratégia de QA

193 testes, 11 arquivos, zero dependência de backend. A pirâmide aqui é achatada de propósito: a lógica mora nas stores e nos renderers, então o foco está em testes unitários de comportamento e de componente. Fluxos de mouse complexos (drag-and-drop longo) eu valido no navegador com Chrome DevTools MCP.

## O que cada arquivo cobre

| Arquivo | Qtd | Alvo |
|---------|-----|------|
| `allComponents.test.tsx` | 118 | Todos os 20 tipos: criação na store, render no builder (com defaults e com `props: {}`), render no preview, painel de propriedades |
| `propertyPanels.test.tsx` | 14 | Controles novos (estrelas, segmented, stepper, toggle, validação de URL) + modais de propriedade |
| `componentZones.test.ts` | 11 | Zonas above/below/sidebar e células de grid na store |
| `utils.test.ts` | 8 | `cn`, `generateId`, `formatCurrency` |
| `flowStore.test.ts` | 7 | CRUD de templates e nós, limpeza de arestas órfãs |
| `flowNodes.test.tsx` | 15 | Render, handles e seleção dos 7 nós |
| `CheckoutComponentRenderer.test.tsx` | 5 | Casos base do renderer |
| `checkoutStore.test.ts` | 6 | CRUD de templates e componentes |
| `router.test.tsx` | 4 | 404, redirect `/`, ids inválidos |
| `themeVars.test.tsx` | 3 | Provider expõe as vars; form e sidebar consomem |
| `systemTheme.test.tsx` | 2 | Chrome do editor responde a claro/escuro |

## Convenções

- **Store zerada por teste** (`beforeEach` com `setState`): Zustand é singleton; sem reset, um teste contamina o outro.
- **Mocks de ambiente**: jsdom não tem `matchMedia` (stub com `vi.stubGlobal`), necessário para o `ThemeProvider`.
- **Teste de robustez**: todo tipo de componente renderiza com `props: {}` sem quebrar. Componente que quebra sem props é bug, não cenário inválido.
- **Queries acessíveis**: `getByRole`/`getByText` em vez de seletores CSS. Se o teste precisa de classe, algo está inacessível de verdade.
- **Sem testes de snapshot de markup**: quebram por qualquer refator visual e não provam comportamento.

## Como rodar

```bash
npm test                 # suite completa
npm run test:watch       # watch
npx vitest run flowStore # um arquivo
npm run test:coverage    # cobertura
```

## Validação no navegador (manual, com MCP)

O que automação jsdom não pega, eu cubro dirigindo o Chrome:
- drop de linha acima/abaixo/lateral do checkout
- componente aninhado em célula de grid e extração de volta
- reorder por teclado (Space + setas, anúncio do live-region)
- edição de propriedade refletindo no canvas e no preview
- preview desktop + mobile (frame 375px) com screenshots
- persistência após reload, deep-links e 404
- console limpo (zero erros/warnings como critério de aceite)

## Lacunas conhecidas

- **Conexão de arestas por arrasto** no flow: handles de 12px não têm uid acessível para a ferramenta de drag, e eventos sintéticos não iniciam o gesto do React Flow. O caminho `onConnect → save` usa o mesmo `setEdges` já coberto; o gesto em si precisa de teste manual ou Playwright/Cypress.
- **`input[type=color]`**: o navegador ignora digitação programática (só o picker nativo altera). Valido via store + reload, nunca via `fill`.
- **E2E automatizado**: não há Playwright/Cypress ainda. É o próximo passo natural (ver `docs/POC.md`).
