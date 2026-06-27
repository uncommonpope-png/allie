import { useGskStore } from '../stores/gsk-store'
import { PanelChrome } from './PanelChrome'
import { Layers } from 'lucide-react'
import { cn } from '../lib/utils'

const categoryColors: Record<string, string> = {
  core: 'text-accent',
  utility: 'text-skill',
  research: 'text-council',
  social: 'text-warning',
  system: 'text-text-muted',
}

export function SkillMatrix() {
  const skills = useGskStore((s) => s.skills)

  const totalInvocations = skills.reduce((acc, s) => acc + s.invocations, 0)
  const avgSuccess = skills.length
    ? Math.round(skills.reduce((acc, s) => acc + s.successRate, 0) / skills.length)
    : 0

  return (
    <PanelChrome id="skills" title="Skill Matrix" icon={<Layers size={12} />}>
      <div className="space-y-3">
        <div className="flex gap-4 text-[10px] font-mono text-text-muted">
          <span>LOADED <span className="text-skill">{skills.length}</span></span>
          <span>INVOKED <span className="text-accent">{totalInvocations}</span></span>
          <span>SUCCESS <span className="text-warning">{avgSuccess}%</span></span>
        </div>

        <div className="space-y-1">
          {skills.slice(0, 30).map((skill) => (
            <div
              key={skill.name}
              className="flex items-center justify-between py-1 px-2 rounded hover:bg-glass-2 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn('text-[10px] font-mono', categoryColors[skill.category] || 'text-text-muted')}>
                  {skill.category}
                </span>
                <span className="text-xs text-text-secondary truncate">{skill.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted shrink-0">
                <span>x{skill.invocations}</span>
                <div className="w-12 h-1 bg-glass-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-skill rounded-full transition-all"
                    style={{ width: `${skill.successRate}%` }}
                  />
                </div>
                <span className="text-skill">{skill.successRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PanelChrome>
  )
}
