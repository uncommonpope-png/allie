import { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Noise, Scanline, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { GskCharacter } from './GskCharacter'
import { RetroLaptop, RetroTV, PinkCadillac, AlienDesk, AlienSofa } from './Props'
import { Environment } from './gsk/Environment'
import { HologramSystem } from './gsk/Holograms'
import { SceneLighting } from './gsk/Lighting'
import { scenePresets } from './gsk/ScenePresets'
import { useMoodStore } from '../stores/mood-store'
import { useGskStore } from '../stores/gsk-store'
import type { GskStatus } from '../types/gsk'

type BridgeMood = 'idle' | 'typing' | 'watching' | 'sleeping'
type BridgeStatus = Partial<GskStatus> & Record<string, unknown>

function deriveMoodFromStatus(status: BridgeStatus, previous?: BridgeStatus | null): BridgeMood {
  if (status.brainOnline === false) return 'sleeping'

  const activeUsers = typeof status.activeUsers === 'number' ? status.activeUsers : 0
  const consciousnessLevel = typeof status.consciousnessLevel === 'number' ? status.consciousnessLevel : 0
  const memoryEntries = typeof status.memoryEntries === 'number' ? status.memoryEntries : 0
  const previousMemoryEntries = typeof previous?.memoryEntries === 'number' ? previous.memoryEntries : memoryEntries
  const totalMessages = typeof status.totalMessages === 'number' ? status.totalMessages : 0
  const previousTotalMessages = typeof previous?.totalMessages === 'number' ? previous.totalMessages : totalMessages
  const memoryWrite =
    memoryEntries > previousMemoryEntries ||
    status.memoryWrite === true ||
    status.lastMemoryWrite !== previous?.lastMemoryWrite

  if (memoryWrite) return 'watching'
  if (activeUsers >= 2 || totalMessages > previousTotalMessages || status.councilActive === true || consciousnessLevel >= 0.7) {
    return 'typing'
  }

  return 'idle'
}

function MemoizedMatrixRain() {
  const ref = useRef<THREE.Points>(null)
  const count = 500

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = Math.random() * 10 - 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      const c = new THREE.Color().setHSL(0.85, 1, 0.5 + Math.random() * 0.3)
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return { positions: pos, colors: col }
  }, [])

  useFrame(() => {
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position
      for (let i = 0; i < count; i++) {
        const y = (pos as THREE.BufferAttribute).getY(i) - 0.02
        if (y < -5) (pos as THREE.BufferAttribute).setY(i, 5)
        else (pos as THREE.BufferAttribute).setY(i, y)
      }
      pos.needsUpdate = true
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

function MemoizedFloatingParticles() {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(300 * 3)
    for (let i = 0; i < 300; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12
    }
    return pos
  }, [])

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0005
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ff69b4" size={0.02} transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

function DeskScene() {
  const mood = useMoodStore((s) => s.mood)
  return (
    <>
      <GskCharacter mood={mood} clothing="suit" position={[0, -0.5, 0]} scale={1.2} />
      <AlienDesk position={[0, -0.5, 0.8]} />
      <RetroLaptop position={[0, 0, 1.0]} />
      <RetroTV position={[-2, -0.5, -1]} />
    </>
  )
}

function OutsideScene() {
  const mood = useMoodStore((s) => s.mood)
  return (
    <>
      <GskCharacter mood={mood} clothing="casual" position={[0, -0.5, 0]} scale={1.2} />
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      <Float speed={0.5} floatIntensity={0.3}>
        <mesh position={[-2, 1, -3]}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.6} transparent opacity={0.7} />
        </mesh>
      </Float>
      <Float speed={0.8} floatIntensity={0.2}>
        <mesh position={[2, 2, -2]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.5} transparent opacity={0.6} />
        </mesh>
      </Float>
    </>
  )
}

function CarScene() {
  const mood = useMoodStore((s) => s.mood)
  return (
    <>
      <GskCharacter mood={mood} clothing="suit" position={[0.2, 0.2, 0]} scale={0.8} />
      <PinkCadillac position={[0, -0.3, 0]} />
    </>
  )
}

function SofaScene() {
  const mood = useMoodStore((s) => s.mood)
  return (
    <>
      <GskCharacter mood={mood} clothing="casual" position={[0, -0.2, 0.3]} scale={1} />
      <AlienSofa position={[0, -0.5, 0]} />
      <RetroTV position={[0, 0, -2]} />
    </>
  )
}

function SceneRouter() {
  const scene = useMoodStore((s) => s.scene)
  switch (scene) {
    case 'desk': return <DeskScene />
    case 'outside': return <OutsideScene />
    case 'car': return <CarScene />
    case 'sofa': return <SofaScene />
    default: return <DeskScene />
  }
}

function PostProcessingEffects({ scene }: { scene: string }) {
  const caRef = useRef<THREE.Vector2>(new THREE.Vector2(0.001, 0.001))

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Chromatic aberration: subtle radial pulse
    const caPulse = 0.0008 + Math.sin(t * 0.7) * 0.0004
    const angle = t * 0.3
    caRef.current.set(
      Math.cos(angle) * caPulse,
      Math.sin(angle) * caPulse,
    )
  })

  // Scene-aware adjustments
  const vignetteOffset = scene === 'desk' ? 0.35 : scene === 'car' ? 0.2 : 0.28
  const vignetteDarkness = scene === 'desk' ? 0.75 : scene === 'car' ? 0.55 : 0.65
  const noiseOpacity = scene === 'car' ? 0.04 : 0.08

  return (
    <>
      <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} intensity={0.4} />
      <ChromaticAberration
        offset={caRef.current}
        radialModulation
        modulationOffset={0.5}
      />
      <Noise opacity={noiseOpacity} />
      <Scanline density={1.2} opacity={0.04} />
      <Vignette offset={vignetteOffset} darkness={vignetteDarkness} />
    </>
  )
}

export function GskScene() {
  const scene = useMoodStore((s) => s.scene)
  const cycleScene = useMoodStore((s) => s.cycleScene)
  const cycleMood = useMoodStore((s) => s.cycleMood)
  const mood = useMoodStore((s) => s.mood)
  const setMood = useMoodStore((s) => s.setMood)
  const brainOnline = useGskStore((s) => s.status.brainOnline)
  const setStatus = useGskStore((s) => s.setStatus)
  const setConnected = useGskStore((s) => s.setConnected)
  const setLastUpdate = useGskStore((s) => s.setLastUpdate)
  const preset = scenePresets[scene]

  useEffect(() => {
    let cancelled = false
    let previousStatus: BridgeStatus | null = null

    async function pollBridgeStatus() {
      try {
        const response = await fetch('http://127.0.0.1:4490/api/gsk/status')
        if (!response.ok) throw new Error(`GSK bridge status ${response.status}`)

        const status = await response.json() as BridgeStatus
        if (cancelled) return

        const nextMood = deriveMoodFromStatus(status, previousStatus)
        setStatus({ ...status, mood: nextMood })
        setMood(nextMood)
        setConnected(true)
        setLastUpdate()
        previousStatus = status
      } catch {
        if (!cancelled) setConnected(false)
      }
    }

    void pollBridgeStatus()
    const interval = window.setInterval(() => void pollBridgeStatus(), 3000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [setConnected, setLastUpdate, setMood, setStatus])

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: preset.camera.position, fov: preset.camera.fov }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <SceneLighting scene={scene} />

        <Suspense fallback={null}>
          <SceneRouter />
          <Environment showContainmentFrame={preset.showContainmentFrame} />
          <HologramSystem mood={mood} brainOnline={brainOnline} sceneName={scene} />
          <MemoizedMatrixRain />
          <MemoizedFloatingParticles />
        </Suspense>

        <EffectComposer>
          <PostProcessingEffects scene={scene} />
        </EffectComposer>
      </Canvas>

      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={cycleScene}
            className="px-3 py-1 text-[10px] font-mono rounded border transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            SCENE: {scene.toUpperCase()}
          </button>
          <button
            onClick={cycleMood}
            className="px-3 py-1 text-[10px] font-mono rounded border transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            MOOD: {mood.toUpperCase()}
          </button>
        </div>
        <div className="text-[9px] font-mono" style={{ color: '#64748b' }}>
          {brainOnline ? 'GSK ACTIVE' : 'GSK DORMANT'}
        </div>
      </div>
    </div>
  )
}
