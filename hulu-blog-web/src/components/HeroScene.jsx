import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

const PARTICLE_COUNT = 14

function Particle({ radius, speed, phase, tilt, size, color }) {
  const ref = useRef(null)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phase
    const x = Math.cos(t) * radius
    const z = Math.sin(t) * radius
    const y = Math.sin(t * 0.6 + phase) * tilt
    if (ref.current) ref.current.position.set(x, y, z)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function Core() {
  const coreRef = useRef(null)
  const ringRef = useRef(null)
  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.18
      coreRef.current.rotation.x += delta * 0.06
    }
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.1
  })
  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial color="#34c6a6" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.1, 0.006, 8, 90]} />
        <meshBasicMaterial color="#fb9e30" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

function Field() {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
        radius: 1.7 + Math.random() * 1.3,
        speed: 0.15 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        tilt: 0.4 + Math.random() * 0.8,
        size: 0.03 + Math.random() * 0.045,
        color: i % 3 === 0 ? '#fb9e30' : '#34c6a6',
      })),
    []
  )
  return (
    <>
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </>
  )
}

export default function HeroScene({ className = '' }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.4, 5.2], fov: 45 }}
        dpr={[1, 1.6]}
        gl={{ alpha: true, antialias: true }}
      >
        <Core />
        <Field />
      </Canvas>
    </div>
  )
}
