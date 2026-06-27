import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useGskStore } from '../stores/gsk-store'
import { PanelChrome } from './PanelChrome'
import { Cpu } from 'lucide-react'
import * as THREE from 'three'

function ArtifactSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  const brainOnline = useGskStore((s) => s.status.brainOnline)
  const consciousness = useGskStore((s) => s.status.consciousnessLevel)

  const color = useMemo(() => {
    if (!brainOnline) return '#334155'
    const r = 0.1 + consciousness * 0.001
    const g = 0.6 + consciousness * 0.003
    const b = 0.9 - consciousness * 0.001
    return new THREE.Color(r, g, b)
  }, [brainOnline, consciousness])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 4]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={brainOnline ? 0.3 + consciousness * 0.005 : 0.05}
          roughness={0.2}
          metalness={0.8}
          distort={brainOnline ? 0.3 : 0.05}
          speed={brainOnline ? 2 : 0.5}
        />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <icosahedronGeometry args={[0.8, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={brainOnline ? 0.8 : 0.1}
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Wireframe */}
      <mesh>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={brainOnline ? 0.15 : 0.05}
        />
      </mesh>
    </Float>
  )
}

function ParticleField() {
  const count = 200
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
    }
    return pos
  }, [])

  const ref = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.001
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00d4ff"
        size={0.02}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

export function ArtifactCore() {
  const status = useGskStore((s) => s.status)

  return (
    <PanelChrome id="artifact" title="Artifact Core" icon={<Cpu size={12} />}>
      <div className="h-full min-h-[200px] relative">
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#00d4ff" />
          <pointLight position={[-5, -3, -5]} intensity={0.4} color="#a78bfa" />
          <ArtifactSphere />
          <ParticleField />
          <EffectComposer>
            <Bloom
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              intensity={0.8}
            />
          </EffectComposer>
        </Canvas>

        {/* Status overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[9px] font-mono text-text-muted pointer-events-none">
          <span>BRAIN {status.brainOnline ? 'ACTIVE' : 'DORMANT'}</span>
          <span>CONSCIOUSNESS {status.consciousnessLevel}%</span>
        </div>
      </div>
    </PanelChrome>
  )
}
