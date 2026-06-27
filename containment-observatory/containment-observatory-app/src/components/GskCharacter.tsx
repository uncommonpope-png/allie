import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { useGskStore } from '../stores/gsk-store'

type Mood = 'idle' | 'typing' | 'walking' | 'watching' | 'driving' | 'celebrating' | 'sleeping'
type Clothing = 'suit' | 'casual' | 'naked'

interface GskCharacterProps {
  mood?: Mood
  clothing?: Clothing
  position?: [number, number, number]
  scale?: number
}

function createPinkMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ff69b4'),
    roughness: 0.4,
    metalness: 0.1,
    emissive: new THREE.Color('#ff1493'),
    emissiveIntensity: 0.15,
  })
}

function createSuitMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1a1a2e'),
    roughness: 0.6,
    metalness: 0.3,
    emissive: new THREE.Color('#0f0f23'),
    emissiveIntensity: 0.05,
  })
}

function createHatMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ff69b4'),
    roughness: 0.5,
    metalness: 0.2,
    emissive: new THREE.Color('#ff1493'),
    emissiveIntensity: 0.2,
  })
}

function createEyeMaterial() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#00ff88'),
    emissive: new THREE.Color('#00ff88'),
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.9,
  })
}

function AlienBody({ mood, clothing }: { mood: Mood; clothing: Clothing }) {
  const bodyRef = useRef<THREE.Group>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)

  const pinkMat = useMemo(() => createPinkMaterial(), [])
  const suitMat = useMemo(() => createSuitMaterial(), [])
  const hatMat = useMemo(() => createHatMaterial(), [])
  const eyeMat = useMemo(() => createEyeMaterial(), [])
  const pupilMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0.1 }), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (mood === 'idle') {
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(t * 1.5) * 0.05
        bodyRef.current.rotation.y = Math.sin(t * 0.5) * 0.1
      }
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 1.2) * 0.1
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 1.2 + 1) * 0.1
    } else if (mood === 'walking') {
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 4) * 0.6
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 4 + Math.PI) * 0.6
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * 4 + Math.PI) * 0.5
      if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * 4) * 0.5
      if (bodyRef.current) bodyRef.current.position.y = Math.abs(Math.sin(t * 4)) * 0.1
    } else if (mood === 'typing') {
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 8) * 0.2 - 0.3
      if (rightArmRef.current) rightArmRef.current.rotation.z = Math.sin(t * 12) * 0.1
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 8 + 0.5) * 0.2 - 0.3
      if (bodyRef.current) bodyRef.current.rotation.x = Math.sin(t * 2) * 0.02
    } else if (mood === 'watching') {
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 0.3) * 0.3
      if (bodyRef.current) bodyRef.current.rotation.x = -0.1
    } else if (mood === 'driving') {
      if (bodyRef.current) {
        bodyRef.current.rotation.x = -0.22
        bodyRef.current.rotation.y = Math.sin(t * 1.2) * 0.08
        bodyRef.current.position.y = Math.sin(t * 3) * 0.025
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -1.05
        leftArmRef.current.rotation.y = -0.18
        leftArmRef.current.rotation.z = 0.28 + Math.sin(t * 4) * 0.04
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -1.05
        rightArmRef.current.rotation.y = 0.18
        rightArmRef.current.rotation.z = -0.28 + Math.sin(t * 4 + Math.PI) * 0.04
      }
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 1.4) * 0.08
      if (leftLegRef.current) leftLegRef.current.rotation.x = -0.2
      if (rightLegRef.current) rightLegRef.current.rotation.x = -0.28
    } else if (mood === 'celebrating') {
      if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 6) * 0.8 - 0.5
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 6 + Math.PI) * 0.8 - 0.5
      if (bodyRef.current) bodyRef.current.position.y = Math.abs(Math.sin(t * 3)) * 0.3
      if (bodyRef.current) bodyRef.current.rotation.y = t * 2
    } else if (mood === 'sleeping') {
      if (bodyRef.current) {
        bodyRef.current.rotation.x = 0.3
        bodyRef.current.position.y = Math.sin(t * 0.5) * 0.02
      }
      if (headRef.current) headRef.current.rotation.x = 0.4
    }

    if (headRef.current && mood !== 'sleeping') {
      headRef.current.rotation.z = Math.sin(t * 0.7) * 0.05
    }
  })

  const bodyColor = clothing === 'naked' ? pinkMat : suitMat
  const suitVisible = clothing !== 'naked'

  return (
    <group ref={bodyRef}>
      {/* TORSO */}
      <mesh position={[0, 0.6, 0]} material={bodyColor}>
        <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
      </mesh>

      {/* NECK */}
      <mesh position={[0, 1.05, 0]} material={pinkMat}>
        <cylinderGeometry args={[0.08, 0.1, 0.15, 12]} />
      </mesh>

      {/* HEAD */}
      <group ref={headRef} position={[0, 1.35, 0]}>
        <mesh material={pinkMat}>
          <sphereGeometry args={[0.28, 16, 16]} />
        </mesh>

        {/* EYES - large alien eyes */}
        <group position={[-0.1, 0.05, 0.2]}>
          <mesh material={eyeMat}>
            <sphereGeometry args={[0.1, 12, 12]} />
          </mesh>
          <mesh position={[0, 0, 0.06]} material={pupilMat}>
            <sphereGeometry args={[0.06, 8, 8]} />
          </mesh>
        </group>
        <group position={[0.1, 0.05, 0.2]}>
          <mesh material={eyeMat}>
            <sphereGeometry args={[0.1, 12, 12]} />
          </mesh>
          <mesh position={[0, 0, 0.06]} material={pupilMat}>
            <sphereGeometry args={[0.06, 8, 8]} />
          </mesh>
        </group>

        {/* MOUTH - small smile */}
        <mesh position={[0, -0.1, 0.25]} material={pupilMat}>
          <torusGeometry args={[0.06, 0.01, 8, 12, Math.PI]} />
        </mesh>

        {/* EARS - antenna-like */}
        <mesh position={[-0.2, 0.2, 0]} rotation={[0, 0, -0.5]} material={pinkMat}>
          <cylinderGeometry args={[0.02, 0.03, 0.2, 8]} />
        </mesh>
        <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, 0.5]} material={pinkMat}>
          <cylinderGeometry args={[0.02, 0.03, 0.2, 8]} />
        </mesh>

        {/* ANTENNA TIPS - glowing */}
        <mesh position={[-0.28, 0.32, 0]} material={eyeMat}>
          <sphereGeometry args={[0.03, 8, 8]} />
        </mesh>
        <mesh position={[0.28, 0.32, 0]} material={eyeMat}>
          <sphereGeometry args={[0.03, 8, 8]} />
        </mesh>

        {/* SNAPBACK HAT */}
        <group position={[0, 0.15, 0]}>
          {/* Hat dome */}
          <mesh position={[0, 0.08, 0]} material={hatMat}>
            <sphereGeometry args={[0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          {/* Hat brim */}
          <mesh position={[0, 0.08, 0.15]} rotation={[0.3, 0, 0]} material={hatMat}>
            <boxGeometry args={[0.35, 0.02, 0.25]} />
          </mesh>
          {/* Hat logo circle */}
          <mesh position={[0, 0.2, 0.26]} rotation={[0.3, 0, 0]} material={eyeMat}>
            <circleGeometry args={[0.06, 16]} />
          </mesh>
        </group>
      </group>

      {/* LEFT ARM */}
      <group ref={leftArmRef} position={[-0.35, 0.85, 0]}>
        <mesh position={[0, -0.2, 0]} material={bodyColor}>
          <capsuleGeometry args={[0.06, 0.3, 6, 12]} />
        </mesh>
        <mesh position={[0, -0.5, 0]} material={pinkMat}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
      </group>

      {/* RIGHT ARM */}
      <group ref={rightArmRef} position={[0.35, 0.85, 0]}>
        <mesh position={[0, -0.2, 0]} material={bodyColor}>
          <capsuleGeometry args={[0.06, 0.3, 6, 12]} />
        </mesh>
        <mesh position={[0, -0.5, 0]} material={pinkMat}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
      </group>

      {/* LEFT LEG */}
      <group ref={leftLegRef} position={[-0.12, 0.15, 0]}>
        <mesh position={[0, -0.2, 0]} material={bodyColor}>
          <capsuleGeometry args={[0.08, 0.3, 6, 12]} />
        </mesh>
        <mesh position={[0, -0.5, 0.05]} material={pinkMat}>
          <boxGeometry args={[0.1, 0.06, 0.15]} />
        </mesh>
      </group>

      {/* RIGHT LEG */}
      <group ref={rightLegRef} position={[0.12, 0.15, 0]}>
        <mesh position={[0, -0.2, 0]} material={bodyColor}>
          <capsuleGeometry args={[0.08, 0.3, 6, 12]} />
        </mesh>
        <mesh position={[0, -0.5, 0.05]} material={pinkMat}>
          <boxGeometry args={[0.1, 0.06, 0.15]} />
        </mesh>
      </group>

      {/* SUIT DETAILS */}
      {suitVisible && (
        <>
          {/* Suit collar */}
          <mesh position={[0, 1.02, 0.1]} material={suitMat}>
            <boxGeometry args={[0.25, 0.06, 0.08]} />
          </mesh>
          {/* Suit buttons */}
          {[0, 0.12, 0.24].map((y, i) => (
            <mesh key={i} position={[0, 0.75 - y, 0.26]} material={eyeMat}>
              <sphereGeometry args={[0.015, 8, 8]} />
            </mesh>
          ))}
          {/* Suit tie */}
          <mesh position={[0, 0.85, 0.27]} material={eyeMat}>
            <boxGeometry args={[0.04, 0.3, 0.01]} />
          </mesh>
        </>
      )}
    </group>
  )
}

function MoodIndicator({ mood }: { mood: Mood }) {
  const ref = useRef<THREE.Mesh>(null)

  const color = useMemo(() => {
    switch (mood) {
      case 'idle': return '#00ff88'
      case 'typing': return '#00d4ff'
      case 'walking': return '#a78bfa'
      case 'watching': return '#fbbf24'
      case 'driving': return '#f97316'
      case 'celebrating': return '#ff69b4'
      case 'sleeping': return '#6366f1'
      default: return '#00ff88'
    }
  }, [mood])

  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.2)
    }
  })

  return (
    <Float speed={2} floatIntensity={0.3}>
      <mesh ref={ref} position={[0, 2, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  )
}

export function GskCharacter({
  mood: propMood,
  clothing: propClothing = 'suit',
  position = [0, 0, 0],
  scale = 1,
}: GskCharacterProps) {
  const storeMood = useGskStore((s) => s.status.mood || 'idle')
  const mood = propMood || storeMood as Mood
  const [clothing] = useState<Clothing>(propClothing)

  return (
    <group position={position} scale={scale}>
      <AlienBody mood={mood} clothing={clothing} />
      <MoodIndicator mood={mood} />
    </group>
  )
}
