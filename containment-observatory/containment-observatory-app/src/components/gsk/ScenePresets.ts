export type SceneKey = 'desk' | 'outside' | 'car' | 'sofa'

export type Vector3Tuple = [number, number, number]

export interface SceneLightConfig {
  ambient: {
    intensity: number
    color?: string
  }
  key?: {
    position: Vector3Tuple
    intensity: number
    color: string
  }
  fill?: {
    position: Vector3Tuple
    intensity: number
    color: string
  }
  rim?: {
    position: Vector3Tuple
    intensity: number
    color: string
  }
}

export interface ScenePreset {
  camera: {
    position: Vector3Tuple
    fov: number
  }
  lighting: SceneLightConfig
  showContainmentFrame: boolean
}

export const scenePresets = {
  desk: {
    camera: { position: [0, 1.5, 4], fov: 50 },
    lighting: {
      ambient: { intensity: 0.24 },
      key: { position: [-4, 4, 3], intensity: 0.85, color: '#00d4ff' },
      fill: { position: [4, 2.5, 2], intensity: 0.48, color: '#ff69b4' },
    },
    showContainmentFrame: true,
  },
  outside: {
    camera: { position: [0, 2, 6], fov: 55 },
    lighting: {
      ambient: { intensity: 0.68, color: '#8fb7ff' },
      key: { position: [0, 5, 2], intensity: 0.35, color: '#00d4ff' },
    },
    showContainmentFrame: false,
  },
  car: {
    camera: { position: [3, 2, 3], fov: 48 },
    lighting: {
      ambient: { intensity: 0.22 },
      key: { position: [-3, 4, 4], intensity: 0.56, color: '#00d4ff' },
      fill: { position: [4, 2, 1], intensity: 0.32, color: '#ff69b4' },
      rim: { position: [0, 3, -4], intensity: 0.75, color: '#ffd166' },
    },
    showContainmentFrame: true,
  },
  sofa: {
    camera: { position: [2, 1, 3], fov: 50 },
    lighting: {
      ambient: { intensity: 0.3 },
      key: { position: [-4, 3, 3], intensity: 0.5, color: '#00d4ff' },
      fill: { position: [3, 2, 2], intensity: 0.6, color: '#ffb86b' },
    },
    showContainmentFrame: true,
  },
} satisfies Record<SceneKey, ScenePreset>

export const defaultScenePreset = scenePresets.desk
