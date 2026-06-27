import * as THREE from 'three'

export function createGlowMaterial(
  color: THREE.ColorRepresentation,
  intensity: number,
) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color).multiplyScalar(intensity),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  })
}

export function createGlassMaterial(color: THREE.ColorRepresentation) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.8,
    roughness: 0.08,
    transparent: true,
    opacity: 0.35,
  })
}

export function createWireframeMaterial(
  color: THREE.ColorRepresentation,
  opacity: number,
) {
  return new THREE.MeshBasicMaterial({
    color,
    opacity,
    wireframe: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  })
}

export function createEmissiveMaterial(
  baseColor: THREE.ColorRepresentation,
  emissiveColor: THREE.ColorRepresentation,
  intensity: number,
) {
  return new THREE.MeshStandardMaterial({
    color: baseColor,
    emissive: emissiveColor,
    emissiveIntensity: intensity,
  })
}
