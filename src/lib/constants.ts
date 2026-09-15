import type { ComponentConfig } from '@/types/checkout'
import type { FlowNodeConfig, FlowNode, FlowEdge } from '@/types/flow'

export const CHECKOUT_COMPONENTS: ComponentConfig[] = [
  {
    type: 'header',
    name: 'Header',
    description: 'Cabeçalho com logo e breadcrumbs',
    icon: 'LayoutTop',
    defaultProps: {
      logoUrl: '',
      breadcrumbs: ['Carrinho', 'Pagamento', 'Confirmação'],
    },
  },
  {
    type: 'product-card',
    name: 'Produto',
    description: 'Card com imagem, nome e preço do produto',
    icon: 'Package',
    defaultProps: {
      name: 'Produto Exemplo',
      price: 197.0,
      originalPrice: 297.0,
      description: 'Descrição do produto',
      imageUrl: '',
    },
  },
  {
    type: 'form-field',
    name: 'Formulário',
    description: 'Campos de dados pessoais e endereço',
    icon: 'FileText',
    defaultProps: {
      fields: [
        { id: 'name', label: 'Nome completo', type: 'text', required: true },
        { id: 'email', label: 'E-mail', type: 'email', required: true },
        { id: 'cpf', label: 'CPF', type: 'cpf', required: true },
        { id: 'phone', label: 'Telefone', type: 'phone', required: true },
      ],
    },
  },
  {
    type: 'payment-methods',
    name: 'Pagamento',
    description: 'Métodos de pagamento (Cartão, PIX, Boleto)',
    icon: 'CreditCard',
    defaultProps: {
      methods: ['credit-card', 'pix', 'boleto'],
      installments: 12,
    },
  },
  {
    type: 'order-summary',
    name: 'Resumo',
    description: 'Resumo do pedido com totais',
    icon: 'Receipt',
    defaultProps: {
      showDiscount: true,
      discountLabel: 'Desconto',
      discountValue: 0,
    },
  },
  {
    type: 'upsell',
    name: 'Upsell',
    description: 'Oferta adicional para aumentar o ticket médio',
    icon: 'Sparkles',
    defaultProps: {
      title: 'Oferta Especial',
      description: 'Adicione este produto ao seu pedido',
      price: 97.0,
      originalPrice: 197.0,
      buttonText: 'Adicionar ao Pedido',
    },
  },
  {
    type: 'guarantees',
    name: 'Garantias',
    description: 'Ícones de garantia e segurança',
    icon: 'Shield',
    defaultProps: {
      items: [
        { icon: 'Shield', text: 'Compra Segura' },
        { icon: 'Lock', text: 'Dados Protegidos' },
        { icon: 'RefreshCw', text: '7 Dias de Garantia' },
      ],
    },
  },
  {
    type: 'footer',
    name: 'Footer',
    description: 'Rodapé com informações legais',
    icon: 'LayoutBottom',
    defaultProps: {
      companyName: 'Empresa Exemplo',
      cnpj: '00.000.000/0001-00',
      address: 'Rua Exemplo, 123 - São Paulo, SP',
    },
  },
  {
    type: 'grid-1',
    name: 'Grid 1 Coluna',
    description: 'Linha única para organizar componentes',
    icon: 'Columns2',
    isGrid: true,
    gridColumns: 1,
    defaultProps: {
      gap: 16,
    },
  },
  {
    type: 'grid-2',
    name: 'Grid 2 Colunas',
    description: 'Organize 2 componentes lado a lado',
    icon: 'Columns2',
    isGrid: true,
    gridColumns: 2,
    defaultProps: {
      gap: 16,
    },
  },
  {
    type: 'grid-3',
    name: 'Grid 3 Colunas',
    description: 'Organize 3 componentes lado a lado',
    icon: 'Columns3',
    isGrid: true,
    gridColumns: 3,
    defaultProps: {
      gap: 16,
    },
  },
  {
    type: 'grid-4',
    name: 'Grid 4 Colunas',
    description: 'Organize 4 componentes lado a lado',
    icon: 'Columns4',
    isGrid: true,
    gridColumns: 4,
    defaultProps: {
      gap: 16,
    },
  },
  {
    type: 'testimonial',
    name: 'Depoimento',
    description: 'Depoimento de cliente com foto e estrelas',
    icon: 'MessageCircle',
    defaultProps: {
      name: 'Maria Silva',
      role: 'Empreendedora',
      text: 'Produto incrível! Transformou completamente meu negócio. Recomendo para todos!',
      avatar: '',
      rating: 5,
    },
  },
  {
    type: 'countdown',
    name: 'Countdown',
    description: 'Timer de urgência para aumentar conversão',
    icon: 'Timer',
    defaultProps: {
      title: 'Oferta termina em:',
      minutes: 14,
      seconds: 59,
      urgencyText: 'Últimas unidades!',
    },
  },
  {
    type: 'benefits',
    name: 'Benefícios',
    description: 'Lista de benefícios com ícones',
    icon: 'CheckCircle',
    defaultProps: {
      title: 'O que você vai receber:',
      items: [
        { icon: 'Check', text: 'Acesso imediato após a compra' },
        { icon: 'Check', text: 'Suporte por 12 meses' },
        { icon: 'Check', text: 'Atualizações gratuitas' },
        { icon: 'Check', text: 'Garantia de 7 dias' },
      ],
    },
  },
  {
    type: 'faq',
    name: 'FAQ',
    description: 'Perguntas frequentes do produto',
    icon: 'HelpCircle',
    defaultProps: {
      title: 'Dúvidas Frequentes',
      items: [
        {
          question: 'Como recebo o produto?',
          answer: 'Após a confirmação do pagamento, você receberá um e-mail com as instruções de acesso.',
        },
        {
          question: 'Tem garantia?',
          answer: 'Sim! Você tem 7 dias de garantia para solicitar reembolso.',
        },
        {
          question: 'Preciso de conhecimento técnico?',
          answer: 'Não! O produto foi criado para iniciantes e experts.',
        },
      ],
    },
  },
  {
    type: 'video',
    name: 'Vídeo',
    description: 'Player de vídeo para demonstração',
    icon: 'Play',
    defaultProps: {
      url: '',
      title: 'Assista ao vídeo de apresentação',
      thumbnail: '',
    },
  },
  {
    type: 'social-proof',
    name: 'Prova Social',
    description: 'Mostra vendas recentes para criar urgência',
    icon: 'Users',
    defaultProps: {
      recentPurchases: 47,
      timeRange: 'últimas 24 horas',
      message: 'pessoas já compraram nas',
    },
  },
  {
    type: 'coupon',
    name: 'Cupom',
    description: 'Campo para inserir cupom de desconto',
    icon: 'Tag',
    defaultProps: {
      label: 'Possui cupom de desconto?',
      placeholder: 'Digite seu cupom',
      buttonText: 'Aplicar',
    },
  },
  {
    type: 'bump-offer',
    name: 'Bump Offer',
    description: 'Oferta adicional com checkbox',
    icon: 'PlusCircle',
    defaultProps: {
      title: 'Adicione o Pack Completo!',
      description: 'Acesso a todos os bônus por apenas',
      price: 67.0,
      originalPrice: 197.0,
      buttonText: 'Sim, quero!',
    },
  },
]

export const FLOW_NODE_TYPES: FlowNodeConfig[] = [
  {
    type: 'start',
    name: 'Início',
    description: 'Ponto de início do fluxo',
    icon: 'Play',
    color: '#22c55e',
  },
  {
    type: 'checkout',
    name: 'Checkout',
    description: 'Página de checkout',
    icon: 'ShoppingCart',
    color: '#3b82f6',
  },
  {
    type: 'upsell',
    name: 'Upsell',
    description: 'Oferta adicional',
    icon: 'Sparkles',
    color: '#f59e0b',
  },
  {
    type: 'thank-you',
    name: 'Obrigado',
    description: 'Página de confirmação',
    icon: 'CheckCircle',
    color: '#22c55e',
  },
  {
    type: 'email',
    name: 'E-mail',
    description: 'Enviar e-mail',
    icon: 'Mail',
    color: '#8b5cf6',
  },
  {
    type: 'condition',
    name: 'Condição',
    description: 'Verificar condição',
    icon: 'GitBranch',
    color: '#ec4899',
  },
  {
    type: 'webhook',
    name: 'Webhook',
    description: 'Chamar API externa',
    icon: 'Webhook',
    color: '#6366f1',
  },
]

export const DEFAULT_FLOW_NODES: FlowNode[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: 'Início', type: 'start' },
  },
  {
    id: 'checkout-1',
    type: 'checkout',
    position: { x: 250, y: 150 },
    data: { label: 'Checkout', type: 'checkout' },
  },
  {
    id: 'thank-you-1',
    type: 'thank-you',
    position: { x: 250, y: 250 },
    data: { label: 'Obrigado', type: 'thank-you' },
  },
]

export const DEFAULT_FLOW_EDGES: FlowEdge[] = [
  {
    id: 'e-start-checkout',
    source: 'start-1',
    target: 'checkout-1',
    animated: true,
  },
  {
    id: 'e-checkout-thankyou',
    source: 'checkout-1',
    target: 'thank-you-1',
    animated: true,
  },
]
