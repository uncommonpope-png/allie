export interface GskStatus {
  mode: string
  brainOnline: boolean
  uptime: number
  totalMessages: number
  activeUsers: number
  memoryEntries: number
  councilActive: boolean
  consciousnessLevel: number
  skillsLoaded: number
  llmProvider: string
  llmModel: string
  mood?: string
}

export interface TimelineEvent {
  id: string
  timestamp: number
  type: 'thought' | 'decision' | 'action' | 'observation' | 'error'
  summary: string
  details?: string
  parentId?: string
}

export interface SkillEntry {
  name: string
  category: string
  invocations: number
  lastUsed: number
  successRate: number
  avgDuration: number
  description: string
}

export interface CouncilMember {
  name: string
  role: string
  status: 'active' | 'idle' | 'offline'
  lastSpoke: number
  proposals: number
  votes: number
}

export interface MemoryEntry {
  id: string
  timestamp: number
  type: 'witness' | 'decision' | 'pattern' | 'error' | 'learning'
  content: string
  significance: number
  links: string[]
}

export interface ConsoleMessage {
  id: string
  timestamp: number
  role: 'operator' | 'system' | 'gsk'
  content: string
}

export type DashboardMode = 'observe' | 'camera'
