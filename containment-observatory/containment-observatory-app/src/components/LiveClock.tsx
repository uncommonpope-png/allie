import { useGskStore } from '../stores/gsk-store'

export function LiveClock() {
  const lastUpdate = useGskStore((s) => s.lastUpdate)
  const now = new Date(lastUpdate)
  const time = now.toLocaleTimeString('en-US', { hour12: false })
  const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="font-mono text-xs text-text-secondary">
      <span className="text-accent">{time}</span>
      <span className="ml-2 text-text-muted">{date}</span>
    </div>
  )
}
