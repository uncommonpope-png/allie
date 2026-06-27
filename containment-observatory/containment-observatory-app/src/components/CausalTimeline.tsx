import { useGskStore } from '../stores/gsk-store'
import { PanelChrome } from './PanelChrome'
import { GitBranch } from 'lucide-react'
import { cn } from '../lib/utils'

const typeColors: Record<string, string> = {
  thought: 'bg-council',
  decision: 'bg-accent',
  action: 'bg-skill',
  observation: 'bg-warning',
  error: 'bg-danger',
}

const typeLabels: Record<string, string> = {
  thought: 'THOUGHT',
  decision: 'DECISION',
  action: 'ACTION',
  observation: 'OBSERVE',
  error: 'ERROR',
}

export function CausalTimeline() {
  const timeline = useGskStore((s) => s.timeline)

  return (
    <PanelChrome id="timeline" title="Causal Timeline" icon={<GitBranch size={12} />}>
      <div className="space-y-1">
        {timeline.length === 0 && (
          <div className="text-center text-text-muted text-xs py-8">
            Waiting for events...
          </div>
        )}
        {timeline.slice(0, 50).map((event, i) => (
          <div key={event.id || i} className="flex gap-2 group">
            <div className="flex flex-col items-center">
              <div className={cn('w-2 h-2 rounded-full shrink-0 mt-1', typeColors[event.type] || 'bg-text-muted')} />
              {i < 49 && <div className="w-px flex-1 bg-border-glass" />}
            </div>
            <div className="pb-2 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('text-[9px] font-mono px-1.5 py-0.5 rounded', typeColors[event.type], 'text-void')}>
                  {typeLabels[event.type] || event.type}
                </span>
                <span className="text-[9px] font-mono text-text-muted">
                  {new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                </span>
              </div>
              <div className="text-xs text-text-secondary mt-0.5 leading-relaxed truncate">
                {event.summary}
              </div>
              {event.details && (
                <div className="text-[10px] text-text-muted mt-0.5 hidden group-hover:block truncate max-w-xs">
                  {event.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PanelChrome>
  )
}
