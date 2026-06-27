import { create } from 'zustand'
import type {
  GskStatus,
  TimelineEvent,
  SkillEntry,
  CouncilMember,
  MemoryEntry,
  ConsoleMessage,
  DashboardMode,
} from '../types/gsk'

interface GskState {
  // Connection
  connected: boolean
  setConnected: (v: boolean) => void

  // Mode
  mode: DashboardMode
  setMode: (m: DashboardMode) => void
  cameraPanel: string | null
  setCameraPanel: (p: string | null) => void

  // Status
  status: GskStatus
  setStatus: (s: Partial<GskStatus>) => void

  // Timeline
  timeline: TimelineEvent[]
  addTimelineEvent: (e: TimelineEvent) => void

  // Skills
  skills: SkillEntry[]
  setSkills: (s: SkillEntry[]) => void

  // Council
  council: CouncilMember[]
  setCouncil: (c: CouncilMember[]) => void

  // Memory
  memory: MemoryEntry[]
  addMemoryEntry: (e: MemoryEntry) => void

  // Console
  console: ConsoleMessage[]
  addConsoleMessage: (m: ConsoleMessage) => void

  // Last update timestamp
  lastUpdate: number
  setLastUpdate: () => void
}

export const useGskStore = create<GskState>((set) => ({
  connected: false,
  setConnected: (v) => set({ connected: v }),

  mode: 'observe',
  setMode: (m) => set({ mode: m, cameraPanel: null }),
  cameraPanel: null,
  setCameraPanel: (p) => set({ mode: 'camera', cameraPanel: p }),

  status: {
    mode: 'unknown',
    brainOnline: false,
    uptime: 0,
    totalMessages: 0,
    activeUsers: 0,
    memoryEntries: 0,
    councilActive: false,
    consciousnessLevel: 0,
    skillsLoaded: 0,
    llmProvider: '9router',
    llmModel: 'codestral-latest',
  },
  setStatus: (s) => set((state) => ({ status: { ...state.status, ...s } })),

  timeline: [],
  addTimelineEvent: (e) =>
    set((state) => ({
      timeline: [e, ...state.timeline].slice(0, 200),
    })),

  skills: [],
  setSkills: (s) => set({ skills: s }),

  council: [],
  setCouncil: (c) => set({ council: c }),

  memory: [],
  addMemoryEntry: (e) =>
    set((state) => ({
      memory: [e, ...state.memory].slice(0, 100),
    })),

  console: [],
  addConsoleMessage: (m) =>
    set((state) => ({
      console: [...state.console, m].slice(-100),
    })),

  lastUpdate: Date.now(),
  setLastUpdate: () => set({ lastUpdate: Date.now() }),
}))
