import { useGskStore } from '../stores/gsk-store'
import { StatusPill } from './StatusPill'
import { LiveClock } from './LiveClock'
import { Camera, Eye, Activity } from 'lucide-react'
import { cn } from '../lib/utils'

interface TopbarProps {
  onToggleSidebar: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const connected = useGskStore((s) => s.connected)
  const status = useGskStore((s) => s.status)
  const mode = useGskStore((s) => s.mode)
  const setMode = useGskStore((s) => s.setMode)

  return (
    <header className="h-10 flex items-center justify-between px-4 border-b border-border-glass bg-glass-1 backdrop-blur-xl z-40 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md hover:bg-glass-3 text-text-muted hover:text-text-primary transition-colors lg:hidden"
        >
          <Activity size={16} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-accent/20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-sm bg-accent animate-pulse-glow" />
          </div>
          <span className="text-xs font-mono font-bold text-text-primary tracking-wider">
            CONTAINMENT OBSERVATORY
          </span>
        </div>
        <StatusPill online={connected} />
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-text-muted">
          <span>MODE</span>
          <span className="text-council">{status.mode}</span>
          <span className="text-text-muted">|</span>
          <span>LLM</span>
          <span className="text-skill">{status.llmModel}</span>
          <span className="text-text-muted">|</span>
          <span>SKILLS</span>
          <span className="text-warning">{status.skillsLoaded}</span>
        </div>

        <div className="flex items-center gap-1 bg-glass-2 rounded-md p-0.5">
          <button
            onClick={() => setMode('observe')}
            className={cn(
              'px-2 py-1 rounded text-[10px] font-mono transition-colors',
              mode === 'observe' ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Eye size={10} className="inline mr-1" />
            OBSERVE
          </button>
          <button
            onClick={() => setMode('camera')}
            className={cn(
              'px-2 py-1 rounded text-[10px] font-mono transition-colors',
              mode === 'camera' ? 'bg-council/20 text-council' : 'text-text-muted hover:text-text-primary'
            )}
          >
            <Camera size={10} className="inline mr-1" />
            CAMERA
          </button>
        </div>

        <LiveClock />
      </div>
    </header>
  )
}
