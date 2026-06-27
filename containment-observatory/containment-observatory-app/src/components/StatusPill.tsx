import { cn } from '../lib/utils'

interface StatusPillProps {
  online: boolean
  label?: string
}

export function StatusPill({ online, label }: StatusPillProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          online ? 'bg-skill animate-pulse-glow' : 'bg-danger'
        )}
      />
      <span className="text-xs font-mono text-text-secondary">
        {label || (online ? 'ONLINE' : 'OFFLINE')}
      </span>
    </div>
  )
}
