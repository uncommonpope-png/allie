import type { ReactNode } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useGskStore } from '../stores/gsk-store'

interface PanelChromeProps {
  id: string
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function PanelChrome({ id, title, icon, children, className }: PanelChromeProps) {
  const setCameraPanel = useGskStore((s) => s.setCameraPanel)
  const mode = useGskStore((s) => s.mode)
  const cameraPanel = useGskStore((s) => s.cameraPanel)

  const isCamera = mode === 'camera' && cameraPanel === id
  const isHidden = mode === 'camera' && cameraPanel !== id

  if (isHidden) return null

  return (
    <div className={`bg-glass border glass-border-glass shadow-[0_0_28px_oklch(0.82_0.16_235_/_0.08)] flex flex-col h-full overflow-hidden ${isCamera ? 'fixed inset-0 z-50 rounded-none border-plasma-cyan' : 'rounded-xl'} ${className || ''}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b glass-border-glass bg-[oklch(0.82_0.16_235_/_0.04)]">
        <div className="flex items-center gap-2 text-xs font-mono text-[oklch(0.86_0.04_235)] uppercase tracking-wider">
          {icon}
          {title}
        </div>
        <button
          onClick={() => setCameraPanel(isCamera ? null : id)}
          className="p-1 rounded border border-transparent text-[oklch(0.68_0.05_235)] hover:text-plasma-cyan hover:bg-[oklch(0.82_0.16_235_/_0.08)] hover:border-plasma-cyan transition-colors"
        >
          {isCamera ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {children}
      </div>
    </div>
  )
}
