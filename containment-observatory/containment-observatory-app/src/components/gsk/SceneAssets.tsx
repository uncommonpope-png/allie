import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'

const MODELS = [
  '/assets/models/alien-blobby.glb',
  '/assets/models/doctor-alien.glb',
  '/assets/models/scifi-corridor.glb',
  '/assets/models/server-rack.glb',
  '/assets/models/retro-screens.glb',
  '/assets/models/retro-tv.glb',
  '/assets/models/desk-lamp.glb',
  '/assets/models/data-center-rack.glb',
  '/assets/models/neon-bar-sign.glb',
  '/assets/models/neon-sign-japanese.glb',
  '/assets/models/hologram-globe.glb',
  '/assets/models/hologram-projector.glb',
  '/assets/models/gem-rock.glb',
  '/assets/models/arcade-cabinet.glb',
  '/assets/models/cyberpunk-apartment.glb',
  '/assets/models/cyberpunk-floor.glb',
  '/assets/models/cartoon-race-car.glb',
  '/assets/models/lava-planet.glb',
  '/assets/models/damaged-helmet.glb',
  '/assets/models/boombox.glb',
  '/assets/models/avocado.glb',
  '/assets/models/car-concept.glb',
  '/assets/models/brain-stem.glb',
  '/assets/models/dragon.glb',
  '/assets/models/cesium-man.glb',
  '/assets/models/chess-set.glb',
  '/assets/models/corset.glb',
  '/assets/models/barn-lamp.glb',
] as const

for (const path of MODELS) {
  useGLTF.preload(path)
}

interface AssetProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

function useClonedScene(url: string) {
  const { scene } = useGLTF(url)
  return useMemo(() => scene.clone(), [scene])
}

function AssetWrapper({ url, ...props }: AssetProps & { url: string }) {
  const cloned = useClonedScene(url)
  return <primitive object={cloned} {...props} />
}

export function AlienBlobby(props: AssetProps) {
  return <AssetWrapper url="/assets/models/alien-blobby.glb" {...props} />
}

export function DoctorAlien(props: AssetProps) {
  return <AssetWrapper url="/assets/models/doctor-alien.glb" {...props} />
}

export function ScifiCorridor(props: AssetProps) {
  return <AssetWrapper url="/assets/models/scifi-corridor.glb" {...props} />
}

export function ServerRack(props: AssetProps) {
  return <AssetWrapper url="/assets/models/server-rack.glb" {...props} />
}

export function RetroScreens(props: AssetProps) {
  return <AssetWrapper url="/assets/models/retro-screens.glb" {...props} />
}

export function RetroTvModel(props: AssetProps) {
  return <AssetWrapper url="/assets/models/retro-tv.glb" {...props} />
}

export function DeskLamp(props: AssetProps) {
  return <AssetWrapper url="/assets/models/desk-lamp.glb" {...props} />
}

export function DataCenterRack(props: AssetProps) {
  return <AssetWrapper url="/assets/models/data-center-rack.glb" {...props} />
}

export function NeonBarSign(props: AssetProps) {
  return <AssetWrapper url="/assets/models/neon-bar-sign.glb" {...props} />
}

export function NeonSignJapanese(props: AssetProps) {
  return <AssetWrapper url="/assets/models/neon-sign-japanese.glb" {...props} />
}

export function HologramGlobe(props: AssetProps) {
  return <AssetWrapper url="/assets/models/hologram-globe.glb" {...props} />
}

export function HologramProjector(props: AssetProps) {
  return <AssetWrapper url="/assets/models/hologram-projector.glb" {...props} />
}

export function GemRock(props: AssetProps) {
  return <AssetWrapper url="/assets/models/gem-rock.glb" {...props} />
}

export function ArcadeCabinet(props: AssetProps) {
  return <AssetWrapper url="/assets/models/arcade-cabinet.glb" {...props} />
}

export function CyberpunkApartment(props: AssetProps) {
  return <AssetWrapper url="/assets/models/cyberpunk-apartment.glb" {...props} />
}

export function CyberpunkFloor(props: AssetProps) {
  return <AssetWrapper url="/assets/models/cyberpunk-floor.glb" {...props} />
}

export function CartoonRaceCar(props: AssetProps) {
  return <AssetWrapper url="/assets/models/cartoon-race-car.glb" {...props} />
}

export function LavaPlanet(props: AssetProps) {
  return <AssetWrapper url="/assets/models/lava-planet.glb" {...props} />
}

export function DamagedHelmet(props: AssetProps) {
  return <AssetWrapper url="/assets/models/damaged-helmet.glb" {...props} />
}

export function Boombox(props: AssetProps) {
  return <AssetWrapper url="/assets/models/boombox.glb" {...props} />
}

export function Avocado(props: AssetProps) {
  return <AssetWrapper url="/assets/models/avocado.glb" {...props} />
}

export function CarConcept(props: AssetProps) {
  return <AssetWrapper url="/assets/models/car-concept.glb" {...props} />
}

export function BrainStem(props: AssetProps) {
  return <AssetWrapper url="/assets/models/brain-stem.glb" {...props} />
}

export function Dragon(props: AssetProps) {
  return <AssetWrapper url="/assets/models/dragon.glb" {...props} />
}

export function CesiumMan(props: AssetProps) {
  return <AssetWrapper url="/assets/models/cesium-man.glb" {...props} />
}

export function ChessSet(props: AssetProps) {
  return <AssetWrapper url="/assets/models/chess-set.glb" {...props} />
}

export function Corset(props: AssetProps) {
  return <AssetWrapper url="/assets/models/corset.glb" {...props} />
}

export function BarnLamp(props: AssetProps) {
  return <AssetWrapper url="/assets/models/barn-lamp.glb" {...props} />
}
