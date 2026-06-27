import { useState, useRef, useEffect } from 'react'
import { useGskStore } from '../stores/gsk-store'
import { PanelChrome } from './PanelChrome'
import { Terminal, Send } from 'lucide-react'
import { cn } from '../lib/utils'

const roleColors: Record<string, string> = {
  operator: 'text-accent',
  system: 'text-warning',
  gsk: 'text-skill',
}

interface OperatorConsoleProps {
  onSendCommand: (cmd: string) => void
}

export function OperatorConsole({ onSendCommand }: OperatorConsoleProps) {
  const messages = useGskStore((s) => s.console)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onSendCommand(input.trim())
    setInput('')
  }

  return (
    <PanelChrome id="console" title="Operator Console" icon={<Terminal size={12} />}>
      <div className="flex flex-col h-full">
        <div ref={scrollRef} className="flex-1 overflow-auto space-y-1 mb-2">
          {messages.length === 0 && (
            <div className="text-center text-text-muted text-xs py-4">
              Awaiting input...
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="text-xs font-mono leading-relaxed">
              <span className="text-text-muted">
                [{new Date(msg.timestamp).toLocaleTimeString('en-US', { hour12: false })}]
              </span>
              <span className={cn('ml-1 font-bold', roleColors[msg.role] || 'text-text-secondary')}>
                {msg.role}:
              </span>
              <span className="ml-1 text-text-secondary">{msg.content}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send command to GSK..."
            className="flex-1 bg-glass-2 border border-border-glass rounded px-2 py-1 text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/30"
          />
          <button
            type="submit"
            className="p-1.5 rounded bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </PanelChrome>
  )
}
