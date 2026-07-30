import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars } from "@react-three/drei";

/**
 * Decorative, non-interactive 3D scene: a slowly rotating distorted sphere
 * plus a starfield, tinted with the app's violet/cyan accent colors.
 * Pointer events are disabled so it never intercepts clicks from the UI
 * sitting on top of it.
 */
export default function Scene3D({ variant = "login" }: { variant?: "login" | "dashboard" }) {
  return (
    <div className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
      <Canvas
        camera={{ position: [0, 0, variant === "login" ? 6 : 9], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={40} color='#8b5cf6' />
        <pointLight position={[-5, -3, -5]} intensity={30} color='#22d3ee' />

        <Stars
          radius={40}
          depth={30}
          count={variant === "login" ? 1800 : 900}
          factor={2.2}
          fade
          speed={0.6}
        />

        <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
          <Sphere args={[1.6, 64, 64]} position={variant === "login" ? [1.6, 0.3, 0] : [3.2, 1.5, -2]}>
            <MeshDistortMaterial
              color='#8b5cf6'
              attach='material'
              distort={0.45}
              speed={1.6}
              roughness={0.15}
              metalness={0.3}
              opacity={0.55}
              transparent
            />
          </Sphere>
        </Float>

        {variant === "login" && (
          <Float speed={1.1} rotationIntensity={0.4} floatIntensity={1.6}>
            <Sphere args={[0.7, 48, 48]} position={[-2.2, -1, -1]}>
              <MeshDistortMaterial
                color='#22d3ee'
                distort={0.5}
                speed={2}
                roughness={0.2}
                metalness={0.2}
                opacity={0.45}
                transparent
              />
            </Sphere>
          </Float>
        )}
      </Canvas>
    </div>
  );
}
