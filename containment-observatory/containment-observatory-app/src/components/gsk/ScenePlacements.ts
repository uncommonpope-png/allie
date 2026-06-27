export type Vector3Tuple = [number, number, number]

export interface AssetPlacement {
  component: string
  position: Vector3Tuple
  rotation?: Vector3Tuple
  scale?: number
}

export const deskPlacements: AssetPlacement[] = [
  { component: 'AlienBlobby', position: [0.8, -0.5, 0.5], rotation: [0, 0.3, 0], scale: 0.008 },
  { component: 'DeskLamp', position: [0.5, 0.0, 0.9], rotation: [0, -0.2, 0], scale: 0.01 },
  { component: 'RetroScreens', position: [-1.5, 0.3, -2.5], scale: 0.008 },
  { component: 'ServerRack', position: [-2.8, 0.5, -1.5], rotation: [0, 0.2, 0], scale: 0.004 },
  { component: 'DataCenterRack', position: [2.5, 0.3, -2.0], rotation: [0, -0.1, 0], scale: 0.006 },
  { component: 'NeonBarSign', position: [0, 2.5, -2.8], scale: 0.005 },
  { component: 'HologramProjector', position: [-0.5, 0.0, 0.7], scale: 0.01 },
  { component: 'HologramGlobe', position: [-0.5, 0.8, 0.7], scale: 0.006 },
  { component: 'GemRock', position: [1.5, -0.3, -1.0], rotation: [0, 0.5, 0], scale: 0.005 },
  { component: 'Boombox', position: [-2.0, -0.3, 0.5], rotation: [0, 0.4, 0], scale: 0.004 },
  { component: 'ChessSet', position: [1.8, -0.3, 1.5], scale: 0.005 },
  { component: 'DamagedHelmet', position: [-1.0, 0.0, 1.2], rotation: [0, 0.3, 0], scale: 0.006 },
  { component: 'BarnLamp', position: [2.5, 1.5, -1.0], scale: 0.003 },
]

export const outsidePlacements: AssetPlacement[] = [
  { component: 'LavaPlanet', position: [0, 8, -20], scale: 0.5 },
  { component: 'ScifiCorridor', position: [0, -0.5, -8], rotation: [0, 3.14, 0], scale: 0.003 },
  { component: 'CyberpunkApartment', position: [-5, -0.5, -6], rotation: [0, 0.5, 0], scale: 0.003 },
  { component: 'NeonSignJapanese', position: [-4, 2, -5], rotation: [0, 0.3, 0], scale: 0.004 },
  { component: 'DoctorAlien', position: [2, -0.5, 2], rotation: [0, -0.5, 0], scale: 0.008 },
  { component: 'Dragon', position: [-3, 1, -4], rotation: [0, 0.8, 0], scale: 0.002 },
  { component: 'GemRock', position: [3, -0.3, -2], rotation: [0, 1.2, 0], scale: 0.008 },
  { component: 'Avocado', position: [-1, -0.3, 3], scale: 0.01 },
  { component: 'CesiumMan', position: [4, -0.5, -1], rotation: [0, -1.0, 0], scale: 0.008 },
  { component: 'CartoonRaceCar', position: [-2, -0.5, 4], rotation: [0, 0.3, 0], scale: 0.01 },
]

export const carPlacements: AssetPlacement[] = [
  { component: 'CarConcept', position: [0, -0.3, 0], scale: 0.005 },
  { component: 'ScifiCorridor', position: [0, 0, -10], rotation: [0, 3.14, 0], scale: 0.002 },
  { component: 'NeonBarSign', position: [-3, 2, -5], rotation: [0, 0.5, 0], scale: 0.004 },
  { component: 'DataCenterRack', position: [4, 0, -6], scale: 0.003 },
  { component: 'LavaPlanet', position: [0, 10, -25], scale: 0.3 },
  { component: 'HologramGlobe', position: [2, 3, -3], scale: 0.005 },
  { component: 'BrainStem', position: [-4, 0.5, -4], rotation: [0, 1.0, 0], scale: 0.003 },
]

export const sofaPlacements: AssetPlacement[] = [
  { component: 'ArcadeCabinet', position: [-2, -0.5, -1], rotation: [0, 0.3, 0], scale: 0.006 },
  { component: 'RetroTvModel', position: [0, 0, -2.5], scale: 0.004 },
  { component: 'Boombox', position: [2, -0.3, 0.5], rotation: [0, -0.3, 0], scale: 0.005 },
  { component: 'NeonSignJapanese', position: [0, 2.5, -2.8], scale: 0.004 },
  { component: 'HologramProjector', position: [1.5, 0.0, 0.8], scale: 0.01 },
  { component: 'HologramGlobe', position: [1.5, 0.8, 0.8], scale: 0.005 },
  { component: 'ChessSet', position: [-1, -0.3, 1.5], rotation: [0, 0.5, 0], scale: 0.006 },
  { component: 'Corset', position: [2.5, 0.5, -2], scale: 0.003 },
  { component: 'BarnLamp', position: [-2, 1.5, 0], scale: 0.004 },
]

export const scenePlacements = {
  desk: deskPlacements,
  outside: outsidePlacements,
  car: carPlacements,
  sofa: sofaPlacements,
} as const
