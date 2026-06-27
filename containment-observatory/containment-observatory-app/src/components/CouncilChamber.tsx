import { useGskStore } from '../stores/gsk-store'
import { PanelChrome } from './PanelChrome'
import { Users } from 'lucide-react'
import { cn } from '../lib/utils'

const roleIcons: Record<string, string> = {
  oracle: '🔮',
  architect: '🏗️',
  sentinel: '🛡️',
  muse: '🎨',
  analyst: '📊',
  chronicler: '📜',
}

export function CouncilChamber() {
  const council = useGskStore((s) => s.council)

  return (
    <PanelChrome id="council" title="Council Chamber" icon={<Users size={12} />}>
      <div className="space-y-2">
        {council.length === 0 && (
          <div className="text-center text-text-muted text-xs py-8">
            Council offline...
          </div>
        )}
        {council.map((member) => (
          <div
            key={member.name}
            className="glass-panel p-3 flex items-center gap-3"
          >
            <div className="text-lg">{roleIcons[member.role] || '👤'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-text-primary font-bold">
                  {member.name}
                </span>
                <span className="text-[9px] font-mono text-text-muted uppercase">
                  {member.role}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-text-muted">
                <span className={cn(
                  'px-1.5 py-0.5 rounded',
                  member.status === 'active' ? 'bg-skill/20 text-skill' :
                  member.status === 'idle' ? 'bg-warning/20 text-warning' :
                  'bg-danger/20 text-danger'
                )}>
                  {member.status}
                </span>
                <span>PROPOSALS {member.proposals}</span>
                <span>VOTES {member.votes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PanelChrome>
  )
}
