import {
  Cpu,
  GitBranch,
  Layers,
  Users,
  Brain,
  Terminal,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '../lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { id: 'kpi', icon: Cpu, label: 'Status' },
  { id: 'timeline', icon: GitBranch, label: 'Timeline' },
  { id: 'skills', icon: Layers, label: 'Skills' },
  { id: 'council', icon: Users, label: 'Council' },
  { id: 'memory', icon: Brain, label: 'Memory' },
  { id: 'console', icon: Terminal, label: 'Console' },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'h-full border-r border-border-glass bg-glass-1 backdrop-blur-xl flex flex-col transition-all duration-200 shrink-0',
        collapsed ? 'w-12' : 'w-40'
      )}
    >
      <div className="flex items-center justify-end p-2">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-glass-3 text-text-muted hover:text-text-primary transition-colors hidden lg:block"
        >
          <ChevronLeft
            size={14}
            className={cn('transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      <nav className="flex-1 px-1.5 space-y-0.5">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-glass-3 transition-colors',
              collapsed && 'justify-center'
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={14} />
            {!collapsed && (
              <span className="text-[11px] font-mono">{item.label}</span>
            )}
          </a>
        ))}
      </nav>

      <div className="p-2 border-t border-border-glass">
        <div className={cn('text-[9px] font-mono text-text-muted', collapsed ? 'text-center' : '')}>
          {collapsed ? 'v1' : 'OBSERVATORY v1.0'}
        </div>
      </div>
    </aside>
  )
}
