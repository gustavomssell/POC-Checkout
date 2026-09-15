import { useCheckoutStore } from '@/stores/checkoutStore'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DEFAULT_THEME } from '@/types/checkout'
import type { ThemeConfig } from '@/types/checkout'

const FONTS = [
  'Roboto',
  'Inter',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Nunito',
  'Source Sans Pro',
]

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border cursor-pointer"
        />
      </div>
    </div>
  )
}

export function ThemeSettings() {
  const { currentTemplate, updateTheme } = useCheckoutStore()

  const theme: ThemeConfig = currentTemplate?.theme || DEFAULT_THEME

  const handleUpdate = (updates: Partial<ThemeConfig>) => {
    updateTheme({ ...theme, ...updates })
  }

  const handleColorUpdate = (path: string, value: string) => {
    const keys = path.split('.')
    const newTheme = { ...theme }
    let current: Record<string, unknown> = newTheme

    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...(current[keys[i]] as Record<string, unknown>) }
      current = current[keys[i]] as Record<string, unknown>
    }

    current[keys[keys.length - 1]] = value
    updateTheme(newTheme)
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-5">
        {/* Theme Preset */}
        <div className="space-y-2">
          <Label className="text-xs">Tema</Label>
          <select
            value={theme.preset}
            onChange={(e) => handleUpdate({ preset: e.target.value as ThemeConfig['preset'] })}
            className="w-full h-10 px-3 border rounded-md bg-background text-foreground text-sm"
          >
            <option value="default">Padrão</option>
            <option value="dark">Escuro</option>
            <option value="light">Claro</option>
            <option value="custom">Customizado</option>
          </select>
        </div>

        {/* Font */}
        <div className="space-y-2">
          <Label className="text-xs">Fonte</Label>
          <select
            value={theme.font}
            onChange={(e) => handleUpdate({ font: e.target.value })}
            className="w-full h-10 px-3 border rounded-md bg-background text-foreground text-sm"
          >
            {FONTS.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>

        {/* Text Colors */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Cores do Texto</Label>
          <div className="space-y-2 p-3 bg-background rounded-lg border">
            <ColorField
              label="Cor primária do texto"
              value={theme.colors.primaryText}
              onChange={(v) => handleColorUpdate('colors.primaryText', v)}
            />
            <ColorField
              label="Cor secundária do texto"
              value={theme.colors.secondaryText}
              onChange={(v) => handleColorUpdate('colors.secondaryText', v)}
            />
            <ColorField
              label="Cor ativa do texto"
              value={theme.colors.activeText}
              onChange={(v) => handleColorUpdate('colors.activeText', v)}
            />
            <ColorField
              label="Cor dos ícones"
              value={theme.colors.iconColor}
              onChange={(v) => handleColorUpdate('colors.iconColor', v)}
            />
          </div>
        </div>

        {/* Background Colors */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Cores de Fundo</Label>
          <div className="space-y-2 p-3 bg-background rounded-lg border">
            <ColorField
              label="Cor de fundo"
              value={theme.colors.backgroundColor}
              onChange={(v) => handleColorUpdate('colors.backgroundColor', v)}
            />
            <ColorField
              label="Cor de fundo do formulário"
              value={theme.colors.formBackground}
              onChange={(v) => handleColorUpdate('colors.formBackground', v)}
            />
          </div>
        </div>

        {/* Unselected Buttons */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Botões não selecionados</Label>
          <div className="space-y-2 p-3 bg-background rounded-lg border">
            <ColorField
              label="Cor do texto"
              value={theme.buttons.unselected.textColor}
              onChange={(v) => handleColorUpdate('buttons.unselected.textColor', v)}
            />
            <ColorField
              label="Cor de fundo"
              value={theme.buttons.unselected.backgroundColor}
              onChange={(v) => handleColorUpdate('buttons.unselected.backgroundColor', v)}
            />
            <ColorField
              label="Cor dos ícones"
              value={theme.buttons.unselected.iconColor}
              onChange={(v) => handleColorUpdate('buttons.unselected.iconColor', v)}
            />
          </div>
        </div>

        {/* Selected Button */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Botão selecionado</Label>
          <div className="space-y-2 p-3 bg-background rounded-lg border">
            <ColorField
              label="Cor do texto"
              value={theme.buttons.selected.textColor}
              onChange={(v) => handleColorUpdate('buttons.selected.textColor', v)}
            />
            <ColorField
              label="Cor de fundo"
              value={theme.buttons.selected.backgroundColor}
              onChange={(v) => handleColorUpdate('buttons.selected.backgroundColor', v)}
            />
            <ColorField
              label="Cor dos ícones"
              value={theme.buttons.selected.iconColor}
              onChange={(v) => handleColorUpdate('buttons.selected.iconColor', v)}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Preview</Label>
          <div
            className="p-4 rounded-lg border"
            style={{ backgroundColor: theme.colors.backgroundColor }}
          >
            <p style={{ color: theme.colors.primaryText, fontFamily: theme.font }}>
              Texto primário
            </p>
            <p style={{ color: theme.colors.secondaryText, fontFamily: theme.font }} className="text-sm">
              Texto secundário
            </p>
            <p style={{ color: theme.colors.activeText, fontFamily: theme.font }} className="text-sm">
              Texto ativo
            </p>
            <div className="flex gap-2 mt-3">
              <button
                className="px-3 py-1 rounded text-sm"
                style={{
                  backgroundColor: theme.buttons.unselected.backgroundColor,
                  color: theme.buttons.unselected.textColor,
                  border: '1px solid #e2e8f0',
                }}
              >
                Não selecionado
              </button>
              <button
                className="px-3 py-1 rounded text-sm"
                style={{
                  backgroundColor: theme.buttons.selected.backgroundColor,
                  color: theme.buttons.selected.textColor,
                }}
              >
                Selecionado
              </button>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
