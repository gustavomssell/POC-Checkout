export type ComponentType =
  | 'header'
  | 'product-card'
  | 'form-field'
  | 'payment-methods'
  | 'order-summary'
  | 'upsell'
  | 'guarantees'
  | 'footer'
  | 'grid-1'
  | 'grid-2'
  | 'grid-3'
  | 'grid-4'
  | 'testimonial'
  | 'countdown'
  | 'benefits'
  | 'faq'
  | 'video'
  | 'social-proof'
  | 'coupon'
  | 'bump-offer'

export type GridColumns = 1 | 2 | 3 | 4

export type ComponentPlacement = 'above' | 'below' | 'sidebar'

export interface CheckoutComponent {
  id: string
  type: ComponentType
  props: Record<string, unknown>
  order: number
  children?: CheckoutComponent[]
  gridColumns?: GridColumns
  /** Posição em relação ao formulário fixo do checkout. Ausente = 'below' (compatibilidade). */
  placement?: ComponentPlacement
  /** Largura total da faixa. Ausente = true (compatibilidade). */
  fullWidth?: boolean
}

export interface CheckoutTemplate {
  id: string
  name: string
  description: string
  components: CheckoutComponent[]
  background?: BackgroundConfig
  theme?: ThemeConfig
  createdAt: string
  updatedAt: string
}

export interface ComponentConfig {
  type: ComponentType
  name: string
  description: string
  icon: string
  defaultProps: Record<string, unknown>
  isGrid?: boolean
  gridColumns?: GridColumns
}

export interface FieldConfig {
  id: string
  label: string
  type: 'text' | 'email' | 'phone' | 'cpf' | 'cnpj'
  required: boolean
  placeholder?: string
}

export interface ProductConfig {
  name: string
  price: number
  originalPrice?: number
  description?: string
  imageUrl?: string
}

export interface PaymentConfig {
  methods: ('credit-card' | 'pix' | 'boleto')[]
  installments: number
}

export interface UpsellConfig {
  title: string
  description: string
  price: number
  originalPrice?: number
  buttonText: string
}

export interface TestimonialConfig {
  name: string
  role: string
  text: string
  avatar?: string
  rating: number
}

export interface BenefitsConfig {
  title: string
  items: Array<{ icon: string; text: string }>
}

export interface FAQConfig {
  title: string
  items: Array<{ question: string; answer: string }>
}

export type BackgroundType = 'color' | 'gradient' | 'image' | 'video'

export interface BackgroundConfig {
  type: BackgroundType
  color?: string
  gradientFrom?: string
  gradientTo?: string
  gradientDirection?: string
  imageUrl?: string
  videoUrl?: string
  overlayOpacity?: number
  overlayColor?: string
  blur?: number
}

export type ThemePreset = 'default' | 'dark' | 'light' | 'custom'

export interface ThemeConfig {
  preset: ThemePreset
  font: string
  colors: {
    primaryText: string
    secondaryText: string
    activeText: string
    iconColor: string
    backgroundColor: string
    formBackground: string
  }
  buttons: {
    unselected: {
      textColor: string
      backgroundColor: string
      iconColor: string
    }
    selected: {
      textColor: string
      backgroundColor: string
      iconColor: string
    }
  }
}

export const DEFAULT_THEME: ThemeConfig = {
  preset: 'custom',
  font: 'Roboto',
  colors: {
    primaryText: '#1a1a2e',
    secondaryText: '#64748b',
    activeText: '#10b981',
    iconColor: '#1a1a2e',
    backgroundColor: '#ffffff',
    formBackground: '#ffffff',
  },
  buttons: {
    unselected: {
      textColor: '#64748b',
      backgroundColor: '#ffffff',
      iconColor: '#1a1a2e',
    },
    selected: {
      textColor: '#ffffff',
      backgroundColor: '#10b981',
      iconColor: '#ffffff',
    },
  },
}
