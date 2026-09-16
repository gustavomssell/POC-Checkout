# UI/UX

Referência: o construtor de checkout da Cakto. O objetivo nunca foi copiar pixel por pixel, e sim roubar os padrões que funcionam: paleta à direita, formulário fixo no centro, feedback imediato para cada gesto.

## Princípios aplicados

**Fixo vs. arrastável, separados visualmente.** Produto, dados, pagamento e resumo sempre existem — o usuário não monta o checkout do zero, ele decora em volta. A paleta tem divisor entre os dois grupos para deixar isso óbvio.

**Toda ação tem resposta visível.** Hover mostra a barra verde (mover, configurar, duplicar, excluir). Seleção pinta a borda de verde. Drop zones acendem ao arrastar por cima. Save dispara toast. Nada acontece em silêncio.

**Propriedades em modal, não no painel.** Antes, selecionar um componente trocava a paleta pelo editor — o usuário perdia o contexto de arrasto. Agora a paleta fica fixa e as propriedades abrem num dialog central (fecha no X, no ESC ou clicando fora). Mesmo padrão nos nós do flow.

**Controles adequados ao dado.** Estrelas clicáveis para avaliação em vez de número digitado. Pílulas para método HTTP e formas de pagamento em vez de texto livre. Stepper com botões para parcelas, tempo e espaçamento. Switch para booleanos. URL de vídeo com validação ao vivo ("URL válida" vs. aviso). Cada controle elimina uma classe de erro de digitação.

## Temas (dois níveis)

- **Tema do sistema** (claro/escuro/sistema, no header): cobre todo o app via classe no `<html>` e tokens do Tailwind. O editor mantém a cara Cakto escura no dark e abre em tokens claros no light.
- **Tema do checkout** (aba Configurações, por template): cores de texto, fundo do formulário, botões e fonte, aplicados via variáveis CSS (`--theme-*`) no formulário fixo, sidebar e card. O preview interno da aba mostra o efeito antes de aplicar.

## Responsivo

- Preview com frame de 375px empilha o layout (formulário em cima, sidebar embaixo).
- O formulário fixo recebe `compact` no mobile: CPF acima do celular, campos do cartão e botões Apple/Google Pay um por linha.
- Grids do preview colapsam para 1 coluna abaixo de 640px via container queries (media query não funciona ali — o viewport continua desktop, só o frame estreita).
- Linhas vazias não renderizam no preview: visão do cliente não mostra placeholder de editor.

## Acessibilidade

- Drag-and-drop completo por teclado: paleta (Space + setas em passos de 25px), canvas (Space + setas entre posições), com coordenadas separadas por tipo de item. Os anúncios para leitor de tela são os padrão do dnd-kit (em inglês) — não há live-region customizada em português.
- Labels reais em todos os inputs, `aria-pressed` nos toggles, `aria-label` nos steppers, título acessível nos modais.
- Foco visível e alvos de 32px+ nos controles densos.

## Estados

- Zonas vazias mostram placeholder tracejado com instrução ("Arraste uma linha aqui...").
- Painéis sem seleção orientam o próximo passo em vez de ficarem em branco.
- Toast de erro quando não há o que salvar, em vez de silêncio.
