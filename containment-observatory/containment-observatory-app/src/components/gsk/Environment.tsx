import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CYAN = '#00d4ff'
const MAGENTA = '#ff69b4'

type Vec3 = [number, number, number]

interface EnvironmentProps {
  showContainmentFrame?: boolean
}

function createFloorGridGeometry() {
  const vertices: number[] = []
  const ringSegments = 96
  const ringRadii = [0.8, 1.35, 1.95, 2.65, 3.45, 4.35, 5.3]
  const spokeCount = 24
  const outerRadius = ringRadii[ringRadii.length - 1]

  for (const radius of ringRadii) {
    for (let i = 0; i < ringSegments; i++) {
      const a = (i / ringSegments) * Math.PI * 2
      const b = ((i + 1) / ringSegments) * Math.PI * 2
      vertices.push(Math.cos(a) * radius, 0, Math.sin(a) * radius)
      vertices.push(Math.cos(b) * radius, 0, Math.sin(b) * radius)
    }
  }

  for (let i = 0; i < spokeCount; i++) {
    const a = (i / spokeCount) * Math.PI * 2
    vertices.push(Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35)
    vertices.push(Math.cos(a) * outerRadius, 0, Math.sin(a) * outerRadius)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.computeBoundingSphere()

  return geometry
}

function createFloorScanlineGeometry() {
  const vertices: number[] = []
  const width = 9.6
  const laneCount = 5

  for (let i = 0; i < laneCount; i++) {
    const z = (i - Math.floor(laneCount / 2)) * 0.07
    vertices.push(-width / 2, 0.012, z)
    vertices.push(width / 2, 0.012, z)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.computeBoundingSphere()

  return geometry
}

function createContainmentFrameGeometry() {
  const vertices: number[] = []
  const width = 4.4
  const depth = 3.4
  const bottom = -0.5
  const top = 2.75
  const pillarRadius = 0.08
  const beamRadius = 0.06
  const corners: Vec3[] = [
    [-width / 2, 0, -depth / 2],
    [width / 2, 0, -depth / 2],
    [width / 2, 0, depth / 2],
    [-width / 2, 0, depth / 2],
  ]

  const addBoxEdges = (center: Vec3, size: Vec3) => {
    const [cx, cy, cz] = center
    const [sx, sy, sz] = size.map((value) => value / 2) as Vec3
    const points: Vec3[] = [
      [cx - sx, cy - sy, cz - sz],
      [cx + sx, cy - sy, cz - sz],
      [cx + sx, cy - sy, cz + sz],
      [cx - sx, cy - sy, cz + sz],
      [cx - sx, cy + sy, cz - sz],
      [cx + sx, cy + sy, cz - sz],
      [cx + sx, cy + sy, cz + sz],
      [cx - sx, cy + sy, cz + sz],
    ]
    const edgePairs = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ]

    for (const [a, b] of edgePairs) {
      vertices.push(...points[a], ...points[b])
    }
  }

  for (const [x, , z] of corners) {
    addBoxEdges([x, (bottom + top) / 2, z], [pillarRadius, top - bottom, pillarRadius])
  }

  addBoxEdges([0, top, -depth / 2], [width + pillarRadius, beamRadius, beamRadius])
  addBoxEdges([0, top, depth / 2], [width + pillarRadius, beamRadius, beamRadius])
  addBoxEdges([-width / 2, top, 0], [beamRadius, beamRadius, depth + pillarRadius])
  addBoxEdges([width / 2, top, 0], [beamRadius, beamRadius, depth + pillarRadius])

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.computeBoundingSphere()

  return geometry
}

function createBackWallTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512

  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#101426')
  gradient.addColorStop(0.55, '#070912')
  gradient.addColorStop(1, '#02030a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.lineWidth = 1
  for (let i = 0; i <= canvas.width; i += 32) {
    ctx.strokeStyle = i % 128 === 0 ? 'rgba(0, 212, 255, 0.18)' : 'rgba(0, 212, 255, 0.07)'
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, canvas.height)
    ctx.stroke()
  }

  for (let i = 0; i <= canvas.height; i += 32) {
    ctx.strokeStyle = i % 128 === 0 ? 'rgba(255, 105, 180, 0.14)' : 'rgba(255, 105, 180, 0.05)'
    ctx.beginPath()
    ctx.moveTo(0, i)
    ctx.lineTo(canvas.width, i)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  return texture
}

function DataTower({ position, height, accent }: { position: Vec3; height: number; accent: string }) {
  const bodyGeometry = useMemo(() => new THREE.BoxGeometry(0.32, height, 0.42), [height])
  const stripeGeometry = useMemo(() => new THREE.BoxGeometry(0.34, 0.025, 0.018), [])
  const bodyMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#070914',
      emissive: '#02040a',
      emissiveIntensity: 0.2,
      metalness: 0.45,
      roughness: 0.34,
    }),
    [],
  )
  const stripeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: accent,
      emissive: accent,
      emissiveIntensity: 1.7,
      metalness: 0.2,
      roughness: 0.2,
      transparent: true,
      opacity: 0.82,
    }),
    [accent],
  )
  const stripePositions = useMemo(() => {
    const positions: number[] = []
    for (let y = -height / 2 + 0.22; y < height / 2 - 0.1; y += 0.22) {
      positions.push(y)
    }
    return positions
  }, [height])

  return (
    <group position={position}>
      <mesh geometry={bodyGeometry} material={bodyMaterial} />
      {stripePositions.map((y, index) => (
        <mesh
          key={`${position[0]}-${index}`}
          geometry={stripeGeometry}
          material={stripeMaterial}
          position={[0, y, 0.22]}
        />
      ))}
    </group>
  )
}

export function FloorGrid() {
  const gridGeometry = useMemo(() => createFloorGridGeometry(), [])
  const scanlineGeometry = useMemo(() => createFloorScanlineGeometry(), [])
  const gridMaterial = useMemo(
    () => new THREE.LineBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    [],
  )
  const scanlineMaterial = useMemo(
    () => new THREE.LineBasicMaterial({
      color: CYAN,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    [],
  )
  const scanlineRef = useRef<THREE.LineSegments>(null)

  useFrame((state) => {
    if (!scanlineRef.current) return

    const cycle = (state.clock.elapsedTime * 0.8) % 1
    scanlineRef.current.position.z = THREE.MathUtils.lerp(-4.8, 4.8, cycle)
    scanlineRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.08
    scanlineMaterial.opacity = 0.18 + Math.sin(state.clock.elapsedTime * 4) * 0.08
  })

  return (
    <group position={[0, -0.51, 0]}>
      <lineSegments geometry={gridGeometry} material={gridMaterial} />
      <lineSegments ref={scanlineRef} geometry={scanlineGeometry} material={scanlineMaterial} />
    </group>
  )
}

export function ContainmentFrame() {
  const geometry = useMemo(() => createContainmentFrameGeometry(), [])
  const material = useMemo(
    () => new THREE.LineBasicMaterial({
      color: MAGENTA,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    [],
  )

  return <lineSegments geometry={geometry} material={material} />
}

export function DataTowers() {
  const towers = useMemo(
    () => [
      { position: [-3.05, 0.55, -1.15] as Vec3, height: 2.1, accent: CYAN },
      { position: [-2.52, 0.35, -2.05] as Vec3, height: 1.7, accent: MAGENTA },
      { position: [2.85, 0.48, -1.65] as Vec3, height: 1.95, accent: CYAN },
    ],
    [],
  )

  return (
    <group>
      {towers.map((tower) => (
        <DataTower
          key={tower.position.join(':')}
          position={tower.position}
          height={tower.height}
          accent={tower.accent}
        />
      ))}
    </group>
  )
}

export function BackWall() {
  const geometry = useMemo(() => new THREE.PlaneGeometry(9, 4.8, 1, 1), [])
  const texture = useMemo(() => createBackWallTexture(), [])
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#080a14',
      map: texture,
      metalness: 0.22,
      roughness: 0.42,
      transparent: true,
      opacity: 0.9,
    }),
    [texture],
  )

  return <mesh geometry={geometry} material={material} position={[0, 1.2, -3]} />
}

export function Environment({ showContainmentFrame = true }: EnvironmentProps) {
  return (
    <group>
      <BackWall />
      <FloorGrid />
      <DataTowers />
      {showContainmentFrame && <ContainmentFrame />}
    </group>
  )
}
