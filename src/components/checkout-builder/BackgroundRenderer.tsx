import type { BackgroundConfig } from '@/types/checkout'

interface BackgroundRendererProps {
  background?: BackgroundConfig
  children: React.ReactNode
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&rel=0&modestbranding=1`
  }
  return null
}

function getVimeoEmbedUrl(url: string): string | null {
  if (!url) return null
  const match = url.match(/vimeo\.com\/(\d+)/)
  if (match) return `https://player.vimeo.com/video/${match[1]}?autoplay=1&muted=1&loop=1&background=1`
  return null
}

function getVideoEmbedUrl(url: string): string | null {
  return getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url)
}

export function BackgroundRenderer({ background, children }: BackgroundRendererProps) {
  if (!background || (background.type === 'color' && (!background.color || background.color === '#0f172a'))) {
    return <>{children}</>
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    minHeight: '100%',
  }

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  }

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 1,
  }

  switch (background.type) {
    case 'color':
      containerStyle.backgroundColor = background.color
      break

    case 'gradient': {
      const dir = background.gradientDirection || 'to-b'
      containerStyle.background = `linear-gradient(var(--gradient-dir, to bottom), ${background.gradientFrom || '#0f172a'}, ${background.gradientTo || '#1e293b'})`
      // Map direction to CSS
      const dirMap: Record<string, string> = {
        'to-r': 'to right',
        'to-l': 'to left',
        'to-b': 'to bottom',
        'to-br': 'to bottom right',
      }
      containerStyle.background = `linear-gradient(${dirMap[dir] || 'to bottom'}, ${background.gradientFrom || '#0f172a'}, ${background.gradientTo || '#1e293b'})`
      break
    }

    case 'image':
      if (background.imageUrl) {
        containerStyle.backgroundImage = `url(${background.imageUrl})`
        containerStyle.backgroundSize = 'cover'
        containerStyle.backgroundPosition = 'center'
        containerStyle.backgroundRepeat = 'no-repeat'
        if (background.blur) {
          containerStyle.filter = `blur(${background.blur}px)`
          containerStyle.transform = 'scale(1.1)'
        }
      }
      break

    case 'video': {
      const embedUrl = background.videoUrl ? getVideoEmbedUrl(background.videoUrl) : null
      if (embedUrl) {
        return (
          <div style={containerStyle}>
            <div style={overlayStyle}>
              <iframe
                src={embedUrl}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100vw',
                  height: '100vh',
                  transform: 'translate(-50%, -50%)',
                  border: 'none',
                  pointerEvents: 'none',
                  filter: background.blur ? `blur(${background.blur}px)` : undefined,
                }}
                allow="autoplay; encrypted-media"
                title="Background video"
              />
              {(background.overlayOpacity || 0) > 0 && (
                <div
                  style={{
                    ...overlayStyle,
                    backgroundColor: background.overlayColor || '#000000',
                    opacity: (background.overlayOpacity || 50) / 100,
                  }}
                />
              )}
            </div>
            <div style={contentStyle}>{children}</div>
          </div>
        )
      }
      break
    }
  }

  return (
    <div style={containerStyle}>
      {background.type === 'image' && (background.overlayOpacity || 0) > 0 && (
        <div
          style={{
            ...overlayStyle,
            backgroundColor: background.overlayColor || '#000000',
            opacity: (background.overlayOpacity || 50) / 100,
          }}
        />
      )}
      <div style={contentStyle}>{children}</div>
    </div>
  )
}
