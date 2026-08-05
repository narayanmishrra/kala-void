"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  color: THREE.Color
  size: number
  targetPosition: THREE.Vector3
  pulsePhase: number
}

function BrainConstellation() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, colors, particleCount } = useMemo(() => {
    const count = 800
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const colors = [
      new THREE.Color("#8052ff"),
      new THREE.Color("#ffb829"),
      new THREE.Color("#15846e"),
      new THREE.Color("#ffffff"),
      new THREE.Color("#9370ff"),
      new THREE.Color("#ffcc66"),
    ]

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const radius = 2 + Math.sin(phi * 3) * 0.5 + Math.random() * 0.3
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.8
      const z = radius * Math.cos(phi)

      const wrinkle = Math.sin(theta * 5 + phi * 3) * 0.2
      const finalX = x * (1 + wrinkle * 0.1)
      const finalY = y + Math.sin(theta * 8) * 0.15
      const finalZ = z * (1 + wrinkle * 0.1)

      pos[i * 3] = finalX
      pos[i * 3 + 1] = finalY
      pos[i * 3 + 2] = finalZ

      const color = colors[Math.floor(Math.random() * colors.length)]
      col[i * 3] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }

    return { positions: pos, colors: col, particleCount: count }
  }, [])

  const geometryRef = useRef<THREE.BufferGeometry>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    if (!geometryRef.current) return

    const particles: Particle[] = []
    const colors = [
      new THREE.Color("#8052ff"),
      new THREE.Color("#ffb829"),
      new THREE.Color("#15846e"),
      new THREE.Color("#ffffff"),
      new THREE.Color("#9370ff"),
      new THREE.Color("#ffcc66"),
    ]

    for (let i = 0; i < particleCount; i++) {
      const position = new THREE.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      )
      const targetPosition = position.clone().add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        )
      )

      particles.push({
        position,
        velocity: new THREE.Vector3(0, 0, 0),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.02 + Math.random() * 0.03,
        targetPosition,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    particlesRef.current = particles
  }, [positions, particleCount])

  useFrame((state) => {
    if (!pointsRef.current || !geometryRef.current) return

    const geometry = geometryRef.current
    const positionAttr = geometry.attributes.position as THREE.BufferAttribute
    const colorAttr = geometry.attributes.color as THREE.BufferAttribute
    const time = state.clock.elapsedTime * 0.3

    particlesRef.current.forEach((particle, i) => {
      particle.targetPosition.y += Math.sin(time + particle.pulsePhase) * 0.0005
      particle.position.lerp(particle.targetPosition, 0.01)

      particle.targetPosition.x += (Math.random() - 0.5) * 0.001
      particle.targetPosition.y += (Math.random() - 0.5) * 0.001
      particle.targetPosition.z += (Math.random() - 0.5) * 0.001

      positionAttr.setXYZ(i, particle.position.x, particle.position.y, particle.position.z)

      const pulse = 0.7 + Math.sin(time * 2 + particle.pulsePhase) * 0.3
      colorAttr.setXYZ(i, particle.color.r * pulse, particle.color.g * pulse, particle.color.b * pulse)
    })

    positionAttr.needsUpdate = true
    colorAttr.needsUpdate = true

    pointsRef.current.rotation.y += 0.001
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function CameraController() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

export function Hero() {
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(128, 82, 255, 0.03) 0%, transparent 70%)'
        }}
      />

      {/* Particle Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
          style={{ background: "transparent" }}
        >
          <CameraController />
          <BrainConstellation />
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 container-page text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <span className="type-nav text-[#9a9a9a]">LOADING</span>
            <div className="w-64 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8052ff] transition-all duration-300 ease-out"
                style={{ width: `${Math.min(loadProgress, 100)}%` }}
              />
            </div>
            <span className="type-body text-[#bdbdbd]">
              {Math.round(Math.min(loadProgress, 100))}%
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 animate-fadeIn">
            <p className="type-heading-sm text-[#bdbdbd]">
              Your workplace has the answer.
            </p>
            <h1 className="type-display text-[#ffffff] max-w-4xl leading-[1.05]">
              Ask Dala to find it.
            </h1>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </section>
  )
}
