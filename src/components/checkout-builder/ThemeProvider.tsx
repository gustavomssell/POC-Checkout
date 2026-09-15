import type { ThemeConfig } from '@/types/checkout'
import { DEFAULT_THEME } from '@/types/checkout'

interface ThemeProviderProps {
  theme?: ThemeConfig
  children: React.ReactNode
}

export function ThemeProvider({ theme = DEFAULT_THEME, children }: ThemeProviderProps) {
  const style = {
    '--theme-primary-text': theme.colors.primaryText,
    '--theme-secondary-text': theme.colors.secondaryText,
    '--theme-active-text': theme.colors.activeText,
    '--theme-icon-color': theme.colors.iconColor,
    '--theme-background': theme.colors.backgroundColor,
    '--theme-form-background': theme.colors.formBackground,
    '--theme-btn-unselected-text': theme.buttons.unselected.textColor,
    '--theme-btn-unselected-bg': theme.buttons.unselected.backgroundColor,
    '--theme-btn-unselected-icon': theme.buttons.unselected.iconColor,
    '--theme-btn-selected-text': theme.buttons.selected.textColor,
    '--theme-btn-selected-bg': theme.buttons.selected.backgroundColor,
    '--theme-btn-selected-icon': theme.buttons.selected.iconColor,
    '--theme-font': theme.font,
  } as React.CSSProperties

  return (
    <div style={style} className="theme-provider h-full flex flex-col">
      {children}
    </div>
  )
}
