import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type GskScene = 'desk' | 'outside' | 'car' | 'sofa'

type SceneLightingProps = {
  scene: GskScene
}

type RimLightProps = {
  color: THREE.ColorRepresentation
  position: [number, number, number]
  intensity?: number
}

function RimLight({ color, position, intensity = 0.8 }: RimLightProps) {
  const ref = useRef<THREE.PointLight>(null)
  const baseColor = useRef(new THREE.Color(color))

  useFrame((state) => {
    if (!ref.current) return

    const hsl = { h: 0, s: 0, l: 0 }
    baseColor.current.getHSL(hsl)
    const hueShift = Math.sin(state.clock.elapsedTime * 0.8) * 0.025
    const lightnessShift = Math.sin(state.clock.elapsedTime * 1.3) * 0.08

    ref.current.color.setHSL(
      THREE.MathUtils.euclideanModulo(hsl.h + hueShift, 1),
      hsl.s,
      THREE.MathUtils.clamp(hsl.l + lightnessShift, 0, 1),
    )
  })

  return <pointLight ref={ref} position={position} intensity={intensity} color={color} />
}

export function SceneLighting({ scene }: SceneLightingProps) {
  switch (scene) {
    case 'desk':
      return (
        <>
          <ambientLight intensity={0.15} />
          <pointLight castShadow position={[3, 4, 2]} intensity={1} color="#00d4ff" />
          <pointLight position={[-2, 3, -1]} intensity={0.45} color="#ff69b4" />
          <RimLight position={[0, 2, -3]} intensity={0.7} color="#fbbf24" />
        </>
      )
    case 'outside':
      return (
        <>
          <ambientLight intensity={0.3} />
          <hemisphereLight args={['#00d4ff', '#ff69b4', 0.7]} />
        </>
      )
    case 'car':
      return (
        <>
          <ambientLight intensity={0.1} />
          <pointLight castShadow position={[4, 3, 1]} intensity={1} color="#fbbf24" />
          <RimLight position={[-1, 2, -4]} intensity={0.8} color="#00d4ff" />
        </>
      )
    case 'sofa':
      return (
        <>
          <ambientLight intensity={0.2} />
          <pointLight castShadow position={[2, 3, 2]} intensity={0.9} color="#f59e0b" />
          <pointLight position={[-3, 2, 1]} intensity={0.5} color="#3b82f6" />
        </>
      )
    default:
      return null
  }
}
