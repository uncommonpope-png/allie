import { useGLTF } from '@react-three/drei'
import { useMemo, Suspense } from 'react'

interface AssetProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
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
  return (
    <Suspense fallback={<PlaceholderMesh color={color} {...props} />}>
      <AssetWrapper url={url} {...props} />
    </Suspense>
  )
}

export function AlienBlobby(props: AssetProps) {
  return <SafeAsset url="/assets/models/alien-blobby.glb" color="#22d3ee" {...props} />
}

export function DoctorAlien(props: AssetProps) {
  return <SafeAsset url="/assets/models/doctor-alien.glb" color="#a855f7" {...props} />
}

export function ScifiCorridor(props: AssetProps) {
  return <SafeAsset url="/assets/models/scifi-corridor.glb" color="#3b82f6" {...props} />
}

export function ServerRack(props: AssetProps) {
  return <SafeAsset url="/assets/models/server-rack.glb" color="#6b7280" {...props} />
}

export function RetroScreens(props: AssetProps) {
  return <SafeAsset url="/assets/models/retro-screens.glb" color="#10b981" {...props} />
}

export function RetroTvModel(props: AssetProps) {
  return <SafeAsset url="/assets/models/retro-tv.glb" color="#f59e0b" {...props} />
}

export function DeskLamp(props: AssetProps) {
  return <SafeAsset url="/assets/models/desk-lamp.glb" color="#fbbf24" {...props} />
}

export function DataCenterRack(props: AssetProps) {
  return <SafeAsset url="/assets/models/data-center-rack.glb" color="#64748b" {...props} />
}

export function NeonBarSign(props: AssetProps) {
  return <SafeAsset url="/assets/models/neon-bar-sign.glb" color="#f43f5e" {...props} />
}

export function NeonSignJapanese(props: AssetProps) {
  return <SafeAsset url="/assets/models/neon-sign-japanese.glb" color="#ec4899" {...props} />
}

export function HologramGlobe(props: AssetProps) {
  return <SafeAsset url="/assets/models/hologram-globe.glb" color="#06b6d4" {...props} />
}

export function HologramProjector(props: AssetProps) {
  return <SafeAsset url="/assets/models/hologram-projector.glb" color="#8b5cf6" {...props} />
}

export function GemRock(props: AssetProps) {
  return <SafeAsset url="/assets/models/gem-rock.glb" color="#14b8a6" {...props} />
}

export function ArcadeCabinet(props: AssetProps) {
  return <SafeAsset url="/assets/models/arcade-cabinet.glb" color="#f97316" {...props} />
}

export function CyberpunkApartment(props: AssetProps) {
  return <SafeAsset url="/assets/models/cyberpunk-apartment.glb" color="#7c3aed" {...props} />
}

export function CyberpunkFloor(props: AssetProps) {
  return <SafeAsset url="/assets/models/cyberpunk-floor.glb" color="#4f46e5" {...props} />
}

export function CartoonRaceCar(props: AssetProps) {
  return <SafeAsset url="/assets/models/cartoon-race-car.glb" color="#ef4444" {...props} />
}

export function LavaPlanet(props: AssetProps) {
  return <SafeAsset url="/assets/models/lava-planet.glb" color="#dc2626" {...props} />
}

export function DamagedHelmet(props: AssetProps) {
  return <SafeAsset url="/assets/models/damaged-helmet.glb" color="#78716c" {...props} />
}

export function Boombox(props: AssetProps) {
  return <SafeAsset url="/assets/models/boombox.glb" color="#a1a1aa" {...props} />
}

export function Avocado(props: AssetProps) {
  return <SafeAsset url="/assets/models/avocado.glb" color="#65a30d" {...props} />
}

export function CarConcept(props: AssetProps) {
  return <SafeAsset url="/assets/models/car-concept.glb" color="#e11d48" {...props} />
}

export function BrainStem(props: AssetProps) {
  return <SafeAsset url="/assets/models/brain-stem.glb" color="#f472b6" {...props} />
}

export function Dragon(props: AssetProps) {
  return <SafeAsset url="/assets/models/dragon.glb" color="#b91c1c" {...props} />
}

export function CesiumMan(props: AssetProps) {
  return <SafeAsset url="/assets/models/cesium-man.glb" color="#0ea5e9" {...props} />
}

export function ChessSet(props: AssetProps) {
  return <SafeAsset url="/assets/models/chess-set.glb" color="#d4d4d8" {...props} />
}

export function Corset(props: AssetProps) {
  return <SafeAsset url="/assets/models/corset.glb" color="#db2777" {...props} />
}

export function BarnLamp(props: AssetProps) {
  return <SafeAsset url="/assets/models/barn-lamp.glb" color="#ca8a04" {...props} />
}
