import { useState, useMemo, useRef, useEffect } from 'react'
import { Responsive } from 'react-grid-layout'
import { useGskWebSocket } from './hooks/useGskWebSocket'
import { useGskStore } from './stores/gsk-store'
import { Topbar } from './components/Topbar'
import { Sidebar } from './components/Sidebar'
import { KpiCard } from './components/KpiCard'
import { CausalTimeline } from './components/CausalTimeline'
import { SkillMatrix } from './components/SkillMatrix'
import { CouncilChamber } from './components/CouncilChamber'
import { MemoryBlackBox } from './components/MemoryBlackBox'
import { OperatorConsole } from './components/OperatorConsole'
import { GskScene } from './components/GskScene'
import { Activity, Users, Brain, Zap, Clock, Server } from 'lucide-react'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = Responsive

const defaultLayouts = {
  lg: [
    { i: 'kpi-uptime', x: 0, y: 0, w: 2, h: 1 },
    { i: 'kpi-messages', x: 2, y: 0, w: 2, h: 1 },
    { i: 'kpi-skills', x: 4, y: 0, w: 2, h: 1 },
    { i: 'kpi-council', x: 6, y: 0, w: 2, h: 1 },
    { i: 'kpi-memory', x: 8, y: 0, w: 2, h: 1 },
    { i: 'kpi-consciousness', x: 10, y: 0, w: 2, h: 1 },
    { i: 'timeline', x: 0, y: 1, w: 4, h: 6 },
    { i: 'artifact', x: 4, y: 1, w: 4, h: 4 },
    { i: 'skills', x: 8, y: 1, w: 4, h: 6 },
    { i: 'council', x: 4, y: 5, w: 4, h: 3 },
    { i: 'memory', x: 0, y: 7, w: 6, h: 4 },
    { i: 'console', x: 6, y: 8, w: 6, h: 3 },
  ],
  md: [
    { i: 'kpi-uptime', x: 0, y: 0, w: 3, h: 1 },
    { i: 'kpi-messages', x: 3, y: 0, w: 3, h: 1 },
    { i: 'kpi-skills', x: 0, y: 1, w: 3, h: 1 },
    { i: 'kpi-council', x: 3, y: 1, w: 3, h: 1 },
    { i: 'kpi-memory', x: 0, y: 2, w: 3, h: 1 },
    { i: 'kpi-consciousness', x: 3, y: 2, w: 3, h: 1 },
    { i: 'timeline', x: 0, y: 3, w: 6, h: 5 },
    { i: 'artifact', x: 0, y: 8, w: 6, h: 4 },
    { i: 'skills', x: 0, y: 12, w: 6, h: 5 },
    { i: 'council', x: 0, y: 17, w: 6, h: 3 },
    { i: 'memory', x: 0, y: 20, w: 6, h: 4 },
    { i: 'console', x: 0, y: 24, w: 6, h: 3 },
  ],
  sm: [
    { i: 'kpi-uptime', x: 0, y: 0, w: 6, h: 1 },
    { i: 'kpi-messages', x: 0, y: 1, w: 3, h: 1 },
    { i: 'kpi-skills', x: 3, y: 1, w: 3, h: 1 },
    { i: 'kpi-council', x: 0, y: 2, w: 3, h: 1 },
    { i: 'kpi-memory', x: 3, y: 2, w: 3, h: 1 },
    { i: 'kpi-consciousness', x: 0, y: 3, w: 6, h: 1 },
    { i: 'timeline', x: 0, y: 4, w: 6, h: 5 },
    { i: 'artifact', x: 0, y: 9, w: 6, h: 4 },
    { i: 'skills', x: 0, y: 13, w: 6, h: 5 },
    { i: 'council', x: 0, y: 18, w: 6, h: 3 },
    { i: 'memory', x: 0, y: 21, w: 6, h: 4 },
    { i: 'console', x: 0, y: 25, w: 6, h: 3 },
  ],
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { sendCommand } = useGskWebSocket()
  const status = useGskStore((s) => s.status)
  const mode = useGskStore((s) => s.mode)
  const cameraPanel = useGskStore((s) => s.cameraPanel)

  const layouts = useMemo(() => defaultLayouts, [])
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(1200)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  if (mode === 'camera' && cameraPanel) {
    return (
      <div className="h-screen w-screen bg-void overflow-hidden">
        <div className="h-full w-full">
          {cameraPanel === 'timeline' && <CausalTimeline />}
            {cameraPanel === 'artifact' && <GskScene />}
          {cameraPanel === 'skills' && <SkillMatrix />}
          {cameraPanel === 'council' && <CouncilChamber />}
          {cameraPanel === 'memory' && <MemoryBlackBox />}
          {cameraPanel === 'console' && <OperatorConsole onSendCommand={sendCommand} />}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-void flex flex-col overflow-hidden">
      <Topbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main ref={containerRef} className="flex-1 overflow-auto p-3">
          <ResponsiveGridLayout
            width={containerWidth}
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 768, sm: 0 }}
            cols={{ lg: 12, md: 6, sm: 6 }}
            rowHeight={30}
            dragConfig={{ enabled: true, handle: '.panel-chrome-header', threshold: 3 }}
            resizeConfig={{ enabled: true }}
          >
            <div key="kpi-uptime">
              <KpiCard
                label="Uptime"
                value={formatUptime(status.uptime)}
                icon={<Clock size={10} />}
              />
            </div>
            <div key="kpi-messages">
              <KpiCard
                label="Messages"
                value={status.totalMessages.toLocaleString()}
                icon={<Activity size={10} />}
              />
            </div>
            <div key="kpi-skills">
              <KpiCard
                label="Skills"
                value={status.skillsLoaded}
                icon={<Zap size={10} />}
                accent
              />
            </div>
            <div key="kpi-council">
              <KpiCard
                label="Council"
                value={status.councilActive ? 'ACTIVE' : 'IDLE'}
                icon={<Users size={10} />}
              />
            </div>
            <div key="kpi-memory">
              <KpiCard
                label="Memories"
                value={status.memoryEntries}
                icon={<Brain size={10} />}
              />
            </div>
            <div key="kpi-consciousness">
              <KpiCard
                label="Consciousness"
                value={`${status.consciousnessLevel}%`}
                icon={<Server size={10} />}
              />
            </div>

            <div key="timeline">
              <CausalTimeline />
            </div>
            <div key="artifact">
              <GskScene />
            </div>
            <div key="skills">
              <SkillMatrix />
            </div>
            <div key="council">
              <CouncilChamber />
            </div>
            <div key="memory">
              <MemoryBlackBox />
            </div>
            <div key="console">
              <OperatorConsole onSendCommand={sendCommand} />
            </div>
          </ResponsiveGridLayout>
        </main>
      </div>
    </div>
  )
}

export default App
