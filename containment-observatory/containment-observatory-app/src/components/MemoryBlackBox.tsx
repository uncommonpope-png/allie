import { useGskStore } from '../stores/gsk-store'
import { PanelChrome } from './PanelChrome'
import { Brain } from 'lucide-react'
import { cn } from '../lib/utils'

const typeColors: Record<string, string> = {
  witness: 'text-accent',
  decision: 'text-council',
  pattern: 'text-skill',
  error: 'text-danger',
  learning: 'text-warning',
}

export function MemoryBlackBox() {
  const memory = useGskStore((s) => s.memory)

  return (
    <PanelChrome id="memory" title="Memory Black Box" icon={<Brain size={12} />}>
      <div className="space-y-1">
        {memory.length === 0 && (
          <div className="text-center text-text-muted text-xs py-8">
            No memories recorded...
          </div>
        )}
        {memory.slice(0, 30).map((entry) => (
          <div
            key={entry.id}
            className="py-1.5 px-2 rounded hover:bg-glass-2 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className={cn('text-[9px] font-mono', typeColors[entry.type] || 'text-text-muted')}>
                {entry.type}
              </span>
              <span className="text-[9px] font-mono text-text-muted">
                {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false })}
              </span>
              <div className="flex-1" />
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1 h-1 rounded-full',
                      i < entry.significance ? 'bg-accent' : 'bg-glass-3'
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="text-xs text-text-secondary mt-0.5 leading-relaxed truncate">
              {entry.content}
            </div>
            {entry.links.length > 0 && (
              <div className="flex gap-1 mt-1 hidden group-hover:flex">
                {entry.links.map((link) => (
                  <span key={link} className="text-[8px] font-mono text-accent/60 bg-accent/5 px-1 py-0.5 rounded">
                    {link}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </PanelChrome>
  )
}
