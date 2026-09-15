import { Monitor, Smartphone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeviceFrameProps {
  mode: 'desktop' | 'mobile'
  onModeChange: (mode: 'desktop' | 'mobile') => void
  onClose: () => void
  children: React.ReactNode
}

export function DeviceFrame({ mode, onModeChange, onClose, children }: DeviceFrameProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-14 border-b bg-background flex items-center px-4 gap-4">
          <h2 className="text-sm font-semibold">Preview do Checkout</h2>
          <div className="flex-1" />
          <div className="flex items-center border rounded-lg p-0.5">
            <Button
              variant={mode === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => onModeChange('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={mode === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => onModeChange('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-8 bg-muted/30">
          <div
            className={`
              bg-white shadow-2xl transition-all duration-300
              ${mode === 'mobile'
                ? 'w-[375px] h-[812px] rounded-[40px] border-[8px] border-gray-900 overflow-hidden'
                : 'w-full max-w-4xl rounded-xl border'
              }
            `}
          >
            {mode === 'mobile' && (
              <div className="h-6 bg-gray-900 flex items-center justify-center">
                <div className="w-20 h-5 bg-black rounded-full" />
              </div>
            )}
            <div className={`@container ${mode === 'mobile' ? 'h-[calc(100%-24px)] overflow-y-auto' : 'min-h-[600px]'}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
