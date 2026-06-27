import { useGLTF } from '@react-three/drei'
import { Component, useMemo, Suspense, type ReactNode } from 'react'

interface AssetProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

function modelUrl(fileName: string) {
  return `${import.meta.env.BASE_URL}assets/models/${fileName}`
}

class AssetErrorBoundary extends Component<{
  fallback: ReactNode
  children: ReactNode
}, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

function useClonedScene(url: string) {
  const { scene } = useGLTF(url)
  return useMemo(() => scene.clone(), [scene])
}

function PlaceholderMesh({ color = '#ff00ff', ...props }: AssetProps & { color?: string }) {
  return (
    <mesh {...props}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} wireframe />
    </mesh>
  )
}

function AssetWrapper({ url, ...props }: AssetProps & { url: string }) {
  const cloned = useClonedScene(url)
  return <primitive object={cloned} {...props} />
}

function SafeAsset({ url, color, ...props }: AssetProps & { url: string; color?: string }) {
  const fallback = <PlaceholderMesh color={color} {...props} />

  return (
    <AssetErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <AssetWrapper url={url} {...props} />
      </Suspense>
    </AssetErrorBoundary>
  )
}

export function AlienBlobby(props: AssetProps) {
  return <SafeAsset url={modelUrl('alien-blobby.glb')} color="#22d3ee" {...props} />
}

export function DoctorAlien(props: AssetProps) {
  return <SafeAsset url={modelUrl('doctor-alien.glb')} color="#a855f7" {...props} />
}

export function ScifiCorridor(props: AssetProps) {
  return <SafeAsset url={modelUrl('scifi-corridor.glb')} color="#3b82f6" {...props} />
}

export function ServerRack(props: AssetProps) {
  return <SafeAsset url={modelUrl('server-rack.glb')} color="#6b7280" {...props} />
}

export function RetroScreens(props: AssetProps) {
  return <SafeAsset url={modelUrl('retro-screens.glb')} color="#10b981" {...props} />
}

export function RetroTvModel(props: AssetProps) {
  return <SafeAsset url={modelUrl('retro-tv.glb')} color="#f59e0b" {...props} />
}

export function DeskLamp(props: AssetProps) {
  return <SafeAsset url={modelUrl('desk-lamp.glb')} color="#fbbf24" {...props} />
}

export function DataCenterRack(props: AssetProps) {
  return <SafeAsset url={modelUrl('data-center-rack.glb')} color="#64748b" {...props} />
}

export function NeonBarSign(props: AssetProps) {
  return <SafeAsset url={modelUrl('neon-bar-sign.glb')} color="#f43f5e" {...props} />
}

export function NeonSignJapanese(props: AssetProps) {
  return <SafeAsset url={modelUrl('neon-sign-japanese.glb')} color="#ec4899" {...props} />
}

export function HologramGlobe(props: AssetProps) {
  return <SafeAsset url={modelUrl('hologram-globe.glb')} color="#06b6d4" {...props} />
}

export function HologramProjector(props: AssetProps) {
  return <SafeAsset url={modelUrl('hologram-projector.glb')} color="#8b5cf6" {...props} />
}

export function GemRock(props: AssetProps) {
  return <SafeAsset url={modelUrl('gem-rock.glb')} color="#14b8a6" {...props} />
}

export function ArcadeCabinet(props: AssetProps) {
  return <SafeAsset url={modelUrl('arcade-cabinet.glb')} color="#f97316" {...props} />
}

export function CyberpunkApartment(props: AssetProps) {
  return <SafeAsset url={modelUrl('cyberpunk-apartment.glb')} color="#7c3aed" {...props} />
}

export function CyberpunkFloor(props: AssetProps) {
  return <SafeAsset url={modelUrl('cyberpunk-floor.glb')} color="#4f46e5" {...props} />
}

export function CartoonRaceCar(props: AssetProps) {
  return <SafeAsset url={modelUrl('cartoon-race-car.glb')} color="#ef4444" {...props} />
}

export function LavaPlanet(props: AssetProps) {
  return <SafeAsset url={modelUrl('lava-planet.glb')} color="#dc2626" {...props} />
}

export function DamagedHelmet(props: AssetProps) {
  return <SafeAsset url={modelUrl('damaged-helmet.glb')} color="#78716c" {...props} />
}

export function Boombox(props: AssetProps) {
  return <SafeAsset url={modelUrl('boombox.glb')} color="#a1a1aa" {...props} />
}

export function Avocado(props: AssetProps) {
  return <SafeAsset url={modelUrl('avocado.glb')} color="#65a30d" {...props} />
}

export function CarConcept(props: AssetProps) {
  return <SafeAsset url={modelUrl('car-concept.glb')} color="#e11d48" {...props} />
}

export function BrainStem(props: AssetProps) {
  return <SafeAsset url={modelUrl('brain-stem.glb')} color="#f472b6" {...props} />
}

export function Dragon(props: AssetProps) {
  return <SafeAsset url={modelUrl('dragon.glb')} color="#b91c1c" {...props} />
}

export function CesiumMan(props: AssetProps) {
  return <SafeAsset url={modelUrl('cesium-man.glb')} color="#0ea5e9" {...props} />
}

export function ChessSet(props: AssetProps) {
  return <SafeAsset url={modelUrl('chess-set.glb')} color="#d4d4d8" {...props} />
}

export function Corset(props: AssetProps) {
  return <SafeAsset url={modelUrl('corset.glb')} color="#db2777" {...props} />
}

export function BarnLamp(props: AssetProps) {
  return <SafeAsset url={modelUrl('barn-lamp.glb')} color="#ca8a04" {...props} />
}
