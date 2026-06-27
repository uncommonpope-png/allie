import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function RetroLaptop({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const screenRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group position={position}>
      {/* Laptop base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.04, 0.4]} />
        <meshStandardMaterial color="#2d2d3d" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Keyboard */}
      <mesh position={[0, 0.025, 0.05]}>
        <boxGeometry args={[0.5, 0.005, 0.25]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
      </mesh>
      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.22, -0.17]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.55, 0.35, 0.02]} />
        <meshStandardMaterial
          color="#0a0a1a"
          emissive="#00d4ff"
          emissiveIntensity={0.3}
          roughness={0.1}
        />
      </mesh>
      {/* Screen glow */}
      <mesh position={[0, 0.22, -0.16]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[0.48, 0.28]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}

export function RetroTV({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const screenRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.15
    }
  })

  return (
    <group position={position}>
      {/* TV body */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.4]} />
        <meshStandardMaterial color="#3d3d2d" roughness={0.8} metalness={0.2} />
      </mesh>
      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.42, 0.21]}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#a78bfa"
          emissiveIntensity={0.4}
          roughness={0.1}
        />
      </mesh>
      {/* TV legs */}
      <mesh position={[-0.3, 0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color="#5d4e37" roughness={0.6} />
      </mesh>
      <mesh position={[0.3, 0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color="#5d4e37" roughness={0.6} />
      </mesh>
      {/* Knobs */}
      <mesh position={[0.35, 0.5, 0.21]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.35, 0.42, 0.21]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export function PinkCadillac({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const wheelRef1 = useRef<THREE.Mesh>(null)
  const wheelRef2 = useRef<THREE.Mesh>(null)
  const wheelRef3 = useRef<THREE.Mesh>(null)
  const wheelRef4 = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const rot = state.clock.elapsedTime * 2
    ;[wheelRef1, wheelRef2, wheelRef3, wheelRef4].forEach((ref) => {
      if (ref.current) ref.current.rotation.x = rot
    })
  })

  return (
    <group position={position}>
      {/* Car body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.25, 0.5]} />
        <meshStandardMaterial color="#ff69b4" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0.1, 0.55, 0]}>
        <boxGeometry args={[0.7, 0.25, 0.45]} />
        <meshStandardMaterial color="#ff69b4" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Windshield */}
      <mesh position={[-0.2, 0.55, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.02, 0.2, 0.4]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      {/* Wheels */}
      <group ref={wheelRef1} position={[-0.4, 0.12, 0.28]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 12]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
        </mesh>
      </group>
      <group ref={wheelRef2} position={[0.4, 0.12, 0.28]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 12]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
        </mesh>
      </group>
      <group ref={wheelRef3} position={[-0.4, 0.12, -0.28]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 12]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
        </mesh>
      </group>
      <group ref={wheelRef4} position={[0.4, 0.12, -0.28]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.05, 12]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
        </mesh>
      </group>
      {/* Headlights */}
      <mesh position={[-0.62, 0.32, 0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.62, 0.32, -0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
      </mesh>
      {/* Taillights */}
      <mesh position={[0.62, 0.32, 0.15]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.62, 0.32, -0.15]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

export function AlienDesk({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Desk surface */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.6]} />
        <meshStandardMaterial color="#2d1b4e" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Desk legs */}
      {[[-0.55, 0.2, 0.25], [0.55, 0.2, 0.25], [-0.55, 0.2, -0.25], [0.55, 0.2, -0.25]].map(
        ([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
            <meshStandardMaterial color="#1a1a2e" roughness={0.6} metalness={0.5} />
          </mesh>
        )
      )}
      {/* Alien artifacts on desk */}
      <mesh position={[0.4, 0.48, 0.1]}>
        <dodecahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.3, 0.48, -0.1]}>
        <octahedronGeometry args={[0.05, 0]} />
        <meshStandardMaterial color="#ff69b4" emissive="#ff69b4" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

export function AlienSofa({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Sofa base */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.8, 0.25, 0.4]} />
        <meshStandardMaterial color="#4a1a6b" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Sofa back */}
      <mesh position={[0, 0.42, -0.15]}>
        <boxGeometry args={[0.8, 0.2, 0.1]} />
        <meshStandardMaterial color="#5a2a7b" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Armrests */}
      <mesh position={[-0.4, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.15, 0.35]} />
        <meshStandardMaterial color="#4a1a6b" roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0.4, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.15, 0.35]} />
        <meshStandardMaterial color="#4a1a6b" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Cushions */}
      <mesh position={[-0.2, 0.35, 0.05]}>
        <boxGeometry args={[0.3, 0.08, 0.25]} />
        <meshStandardMaterial color="#ff69b4" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, 0.35, 0.05]}>
        <boxGeometry args={[0.3, 0.08, 0.25]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.8} />
      </mesh>
    </group>
  )
}
