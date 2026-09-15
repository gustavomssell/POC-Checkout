import { Palette, Image, Video, Sparkles } from 'lucide-react'
import { useCheckoutStore } from '@/stores/checkoutStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { BackgroundConfig, BackgroundType } from '@/types/checkout'

const PRESET_COLORS = [
  '#0f172a', '#1e293b', '#000000', '#1a1a2e', '#16213e',
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#fef3c7',
]

const PRESET_GRADIENTS = [
  { from: '#0f172a', to: '#1e293b' },
  { from: '#0f172a', to: '#1a1a2e' },
  { from: '#667eea', to: '#764ba2' },
  { from: '#f093fb', to: '#f5576c' },
  { from: '#4facfe', to: '#00f2fe' },
  { from: '#43e97b', to: '#38f9d7' },
  { from: '#fa709a', to: '#fee140' },
  { from: '#a18cd1', to: '#fbc2eb' },
]

export function BackgroundSettings() {
  const { currentTemplate, updateBackground } = useCheckoutStore()

  const background: BackgroundConfig = currentTemplate?.background || {
    type: 'color',
    color: '#0f172a',
  }

  const handleUpdate = (updates: Partial<BackgroundConfig>) => {
    updateBackground({ ...background, ...updates })
  }

  return (
    <div className="w-72 border-l bg-sidebar flex flex-col hidden lg:flex">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Background
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Personalize o fundo do checkout
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs">Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'color' as BackgroundType, icon: Palette, label: 'Cor' },
                { type: 'gradient' as BackgroundType, icon: Sparkles, label: 'Gradiente' },
                { type: 'image' as BackgroundType, icon: Image, label: 'Imagem' },
                { type: 'video' as BackgroundType, icon: Video, label: 'Vídeo' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleUpdate({ type: item.type })}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border text-xs transition-colors
                    ${background.type === item.type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted text-muted-foreground'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Settings */}
          {background.type === 'color' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Cor</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={background.color || '#0f172a'}
                    onChange={(e) => handleUpdate({ color: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <Input
                    value={background.color || '#0f172a'}
                    onChange={(e) => handleUpdate({ color: e.target.value })}
                    className="flex-1 h-10 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Cores Predefinidas</Label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleUpdate({ color })}
                      className={`
                        w-full aspect-square rounded border-2 transition-transform hover:scale-110
                        ${background.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
                      `}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gradient Settings */}
          {background.type === 'gradient' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Direção</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'to-r', label: '→ Direita' },
                    { value: 'to-l', label: '← Esquerda' },
                    { value: 'to-b', label: '↓ Baixo' },
                    { value: 'to-br', label: '↘ Diagonal' },
                  ].map((dir) => (
                    <button
                      key={dir.value}
                      onClick={() => handleUpdate({ gradientDirection: dir.value })}
                      className={`
                        p-2 rounded border text-xs transition-colors
                        ${background.gradientDirection === dir.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Cores</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={background.gradientFrom || '#0f172a'}
                    onChange={(e) => handleUpdate({ gradientFrom: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">para</span>
                  <input
                    type="color"
                    value={background.gradientTo || '#1e293b'}
                    onChange={(e) => handleUpdate({ gradientTo: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Gradientes Predefinidos</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_GRADIENTS.map((grad, i) => (
                    <button
                      key={i}
                      onClick={() => handleUpdate({ gradientFrom: grad.from, gradientTo: grad.to })}
                      className={`
                        w-full aspect-square rounded border-2 transition-transform hover:scale-110
                        ${background.gradientFrom === grad.from && background.gradientTo === grad.to
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border'
                        }
                      `}
                      style={{
                        background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Image Settings */}
          {background.type === 'image' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">URL da Imagem</Label>
                <Input
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={background.imageUrl || ''}
                  onChange={(e) => handleUpdate({ imageUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Sobreposição</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={background.overlayColor || '#000000'}
                    onChange={(e) => handleUpdate({ overlayColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(background.overlayOpacity || 50)}
                      onChange={(e) => handleUpdate({ overlayOpacity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Opacidade: {background.overlayOpacity || 50}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Desfoque</Label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={background.blur || 0}
                  onChange={(e) => handleUpdate({ blur: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Desfoque: {background.blur || 0}px
                </p>
              </div>
            </div>
          )}

          {/* Video Settings */}
          {background.type === 'video' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">URL do Vídeo (YouTube/Vimeo)</Label>
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={background.videoUrl || ''}
                  onChange={(e) => handleUpdate({ videoUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Sobreposição</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={background.overlayColor || '#000000'}
                    onChange={(e) => handleUpdate({ overlayColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={(background.overlayOpacity || 50)}
                      onChange={(e) => handleUpdate({ overlayOpacity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Opacidade: {background.overlayOpacity || 50}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Desfoque</Label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={background.blur || 0}
                  onChange={(e) => handleUpdate({ blur: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Desfoque: {background.blur || 0}px
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
