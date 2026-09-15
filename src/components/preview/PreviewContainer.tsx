import { useState } from 'react'
import { useCheckoutStore } from '@/stores/checkoutStore'
import { DeviceFrame } from './DeviceFrame'
import { CheckoutRenderer } from './CheckoutRenderer'

interface PreviewContainerProps {
  isOpen: boolean
  onClose: () => void
}

export function PreviewContainer({ isOpen, onClose }: PreviewContainerProps) {
  const { currentTemplate } = useCheckoutStore()
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')

  if (!isOpen || !currentTemplate) return null

  return (
    <DeviceFrame mode={mode} onModeChange={setMode} onClose={onClose}>
      <CheckoutRenderer
        components={currentTemplate.components}
        background={currentTemplate.background}
        theme={currentTemplate.theme}
        productName={currentTemplate.name}
        mode={mode}
      />
    </DeviceFrame>
  )
}
