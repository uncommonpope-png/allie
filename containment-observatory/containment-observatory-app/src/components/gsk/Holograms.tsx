import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Mood = 'idle' | 'typing' | 'walking' | 'watching' | 'driving' | 'celebrating' | 'sleeping'

type SceneName = 'desk' | 'outside' | 'car' | 'sofa' | string

interface SharedHologramProps {
  position?: [number, number, number]
  scale?: number
}

interface MoodGlyphProps extends SharedHologramProps {
  mood?: Mood
}

interface BrainStatusRingProps extends SharedHologramProps {
  online?: boolean
}

interface SceneLabelProps extends SharedHologramProps {
  sceneName?: SceneName
}

interface DataArcProps extends SharedHologramProps {
  active?: boolean
}

interface HologramSystemProps extends SharedHologramProps {
  mood?: Mood
  brainOnline?: boolean
  sceneName?: SceneName
}

const cyan = new THREE.Color('#00d4ff')
const magenta = new THREE.Color('#ff4fd8')

function createLineGeometry(points: [number, number, number][], close = false) {
  const vertices = close ? [...points, points[0]] : points
  return new THREE.BufferGeometry().setFromPoints(vertices.map((point) => new THREE.Vector3(...point)))
}

function createZGeometry() {
  const positions: number[] = []

  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.32
    const y = i * 0.18
    positions.push(
      x - 0.08, y + 0.08, 0,
      x + 0.08, y + 0.08, 0,
      x + 0.08, y + 0.08, 0,
      x - 0.08, y - 0.08, 0,
      x - 0.08, y - 0.08, 0,
      x + 0.08, y - 0.08, 0,
    )
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geometry
}

function createStripeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 8

  const context = canvas.getContext('2d')
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'rgba(0, 212, 255, 0.95)'
    context.fillRect(0, 0, 42, canvas.height)
    context.fillStyle = 'rgba(255, 79, 216, 0.65)'
    context.fillRect(52, 0, 20, canvas.height)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(5, 1)
  return texture
}

function createSceneTexture(sceneName: SceneName) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128

  const context = canvas.getContext('2d')
  if (context) {
    const label = sceneName.toUpperCase()
    context.clearRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = 'rgba(2, 8, 23, 0.38)'
    context.fillRect(22, 24, 468, 80)

    context.strokeStyle = 'rgba(0, 212, 255, 0.88)'
    context.lineWidth = 4
    context.strokeRect(22, 24, 468, 80)

    context.fillStyle = 'rgba(255, 79, 216, 0.9)'
    context.fillRect(42, 40, 7, 48)
    context.fillRect(462, 40, 7, 48)

    context.font = '700 34px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = 'rgba(206, 247, 255, 0.95)'
    context.fillText(label, canvas.width / 2, canvas.height / 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function TypingBars({ material }: { material: THREE.Material }) {
  const bars = useMemo(
    () => [
      { position: [-0.22, 0.16, 0] as const, width: 0.42 },
      { position: [-0.08, 0.04, 0] as const, width: 0.7 },
      { position: [-0.16, -0.08, 0] as const, width: 0.54 },
      { position: [0.04, -0.2, 0] as const, width: 0.38 },
    ],
    [],
  )

  return (
    <group>
      {bars.map((bar, index) => (
        <mesh key={index} position={bar.position} material={material}>
          <boxGeometry args={[bar.width, 0.035, 0.018]} />
        </mesh>
      ))}
    </group>
  )
}

export function MoodGlyph({ mood = 'idle', position = [0, 2.05, 0], scale = 1 }: MoodGlyphProps) {
  const groupRef = useRef<THREE.Group>(null)
  const zRef = useRef<THREE.LineSegments>(null)

  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(0.32, 16, 12), [])
  const wheelGeometry = useMemo(() => new THREE.TorusGeometry(0.28, 0.018, 8, 48), [])
  const eyeGeometry = useMemo(() => {
    const points: [number, number, number][] = []
    for (let i = 0; i < 64; i++) {
      const angle = (i / 64) * Math.PI * 2
      points.push([Math.cos(angle) * 0.38, Math.sin(angle) * 0.16, 0])
    }
    return createLineGeometry(points, true)
  }, [])
  const arrowGeometry = useMemo(
    () => createLineGeometry([[0, 0.34, 0], [0.26, -0.18, 0], [0.07, -0.1, 0], [0, -0.34, 0], [-0.07, -0.1, 0], [-0.26, -0.18, 0]], true),
    [],
  )
  const starGeometry = useMemo(() => {
    const points: [number, number, number][] = []
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + (i / 10) * Math.PI * 2
      const radius = i % 2 === 0 ? 0.36 : 0.16
      points.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0])
    }
    return createLineGeometry(points, true)
  }, [])
  const zGeometry = useMemo(() => createZGeometry(), [])
  const hologramMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: cyan,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.38,
        wireframe: true,
      }),
    [],
  )
  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: magenta,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.62,
      }),
    [],
  )
  const barMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: cyan,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.5,
      }),
    [],
  )
  const arrowLine = useMemo(() => new THREE.Line(arrowGeometry, lineMaterial), [arrowGeometry, lineMaterial])
  const eyeLine = useMemo(() => new THREE.Line(eyeGeometry, lineMaterial), [eyeGeometry, lineMaterial])
  const starLine = useMemo(() => new THREE.Line(starGeometry, lineMaterial), [starGeometry, lineMaterial])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.65
      groupRef.current.position.y = position[1] + Math.sin(t * 1.8) * 0.06
    }

    if (zRef.current) {
      zRef.current.position.y = (t * 0.28) % 0.7
      const mat = zRef.current.material as THREE.LineBasicMaterial
      mat.opacity = 0.7 - zRef.current.position.y * 0.55
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {mood === 'idle' && <mesh geometry={sphereGeometry} material={hologramMaterial} />}
      {mood === 'typing' && <TypingBars material={barMaterial} />}
      {mood === 'walking' && <primitive object={arrowLine} />}
      {mood === 'watching' && (
        <group>
          <primitive object={eyeLine} />
          <mesh material={barMaterial}>
            <sphereGeometry args={[0.05, 12, 12]} />
          </mesh>
        </group>
      )}
      {mood === 'driving' && (
        <group>
          <mesh geometry={wheelGeometry} material={hologramMaterial} rotation={[0, 0, Math.PI / 2]} />
          <mesh material={barMaterial}>
            <boxGeometry args={[0.46, 0.025, 0.02]} />
          </mesh>
          <mesh material={barMaterial} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.46, 0.025, 0.02]} />
          </mesh>
        </group>
      )}
      {mood === 'celebrating' && <primitive object={starLine} />}
      {mood === 'sleeping' && <lineSegments ref={zRef} geometry={zGeometry} material={lineMaterial} />}
    </group>
  )
}

export function BrainStatusRing({ online = true, position = [0, 0, 0], scale = 1 }: BrainStatusRingProps) {
  const ref = useRef<THREE.Mesh>(null)
  const geometry = useMemo(() => new THREE.TorusGeometry(0.85, 0.018, 10, 96), [])
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: cyan,
        emissive: cyan,
        emissiveIntensity: 1.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.55,
      }),
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulse = online ? 0.85 + Math.sin(t * 3.5) * 0.25 : 0.18

    material.emissiveIntensity = pulse
    material.opacity = online ? 0.42 + Math.sin(t * 3.5) * 0.14 : 0.12

    if (ref.current) {
      ref.current.rotation.z = t * 0.22
      ref.current.scale.setScalar(scale * (online ? 1 + Math.sin(t * 2.4) * 0.025 : 1))
    }
  })

  return <mesh ref={ref} geometry={geometry} material={material} position={position} rotation={[Math.PI / 2, 0, 0]} />
}

export function SceneLabel({ sceneName = 'desk', position = [0, 2.72, 0], scale = 1 }: SceneLabelProps) {
  const ref = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => createSceneTexture(sceneName), [sceneName])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.78,
      }),
    [texture],
  )

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.12
    }
  })

  return (
    <mesh ref={ref} position={position} scale={scale} material={material}>
      <planeGeometry args={[1.35, 0.34]} />
    </mesh>
  )
}

export function DataArc({ active = true, position = [0, 0.75, 0], scale = 1 }: DataArcProps) {
  const groupRef = useRef<THREE.Group>(null)
  const texture = useMemo(() => createStripeTexture(), [])
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: texture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: active ? 0.58 : 0.16,
      }),
    [active, texture],
  )
  const geometries = useMemo(() => {
    return [0, 1, 2].map((index) => {
      const radius = 0.95 + index * 0.13
      const yOffset = (index - 1) * 0.18
      const points = [
        new THREE.Vector3(-radius, yOffset - 0.1, -0.12),
        new THREE.Vector3(-radius * 0.45, yOffset + 0.38, radius * 0.48),
        new THREE.Vector3(radius * 0.4, yOffset + 0.22, radius * 0.4),
        new THREE.Vector3(radius, yOffset - 0.04, -0.1),
      ]
      const curve = new THREE.CatmullRomCurve3(points)
      return new THREE.TubeGeometry(curve, 72, 0.008, 6, false)
    })
  }, [])

  useFrame((state, delta) => {
    texture.offset.x -= delta * (active ? 1.8 : 0.25)

    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.22
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} material={material} rotation={[0, (index * Math.PI * 2) / 3, 0]} />
      ))}
    </group>
  )
}

export function HologramSystem({
  mood = 'idle',
  brainOnline = true,
  sceneName = 'desk',
  position = [0, 0, 0],
  scale = 1,
}: HologramSystemProps) {
  return (
    <group position={position} scale={scale}>
      <BrainStatusRing online={brainOnline} />
      <DataArc active={brainOnline} />
      <MoodGlyph mood={mood} />
      <SceneLabel sceneName={sceneName} />
    </group>
  )
}
