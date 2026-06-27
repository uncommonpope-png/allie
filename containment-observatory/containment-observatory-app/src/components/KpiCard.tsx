import { cn } from '../lib/utils'
import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  accent?: boolean
  className?: string
}

export function KpiCard({ label, value, icon, accent, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'glass-panel p-3 flex flex-col gap-1',
        accent && 'glass-accent-glow border-border-accent',
        className
      )}
    >
      <div className="flex items-center gap-2 text-text-muted text-[10px] uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className={cn(
        'text-lg font-mono font-bold',
        accent ? 'text-accent' : 'text-text-primary'
      )}>
        {value}
      </div>
    </div>
  )
}
