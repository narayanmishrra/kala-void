/* ============================================================
   BLCK VOID — components/canvas/ParticleVoid.tsx
   Three.js WebGL particle constellation.
   ============================================================ */

'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { particleSystem } from '@/lib/tokens'

interface ParticleVoidProps {
  className?: string
}

const PARTICLE_COLORS = [
  '#8052ff', '#9b72ff', '#6030cc', '#ffb829',
  '#15846e', '#b347ff', '#4df0ff', '#ff6b9d', '#7b52ab', '#3d85c8',
]

const COLOR_WEIGHTS = [0.30, 0.15, 0.10, 0.10, 0.08, 0.08, 0.07, 0.05, 0.04, 0.03]

function selectWeightedColor(): string {
  const rand = Math.random()
  let cumWeight = 0
  for (let i = 0; i < PARTICLE_COLORS.length; i++) {
    cumWeight += COLOR_WEIGHTS[i]
    if (rand <= cumWeight) return PARTICLE_COLORS[i]
  }
  return PARTICLE_COLORS[0]
}

function generateVoidShape(count: number, scale: number): Float32Array {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = i / count
    const arm = Math.floor(Math.random() * 2)
    const angle = t * Math.PI * 6 + arm * Math.PI
    const radius = t * scale * 0.8
    const noise = (Math.random() - 0.5) * scale * 0.25
    positions[i * 3 + 0] = Math.cos(angle) * radius + noise * Math.cos(angle + Math.PI / 2)
    positions[i * 3 + 1] = Math.sin(angle) * radius + noise * Math.sin(angle + Math.PI / 2)
    positions[i * 3 + 2] = (Math.random() - 0.5) * scale * 0.15
  }
  return positions
}

function generateAmbientPositions(count: number, spreadRadius: number): Float32Array {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(Math.random() * 2 - 1)
    const r = spreadRadius * (0.6 + Math.random() * 0.4)
    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi) * 0.3
  }
  return positions
}

export default function ParticleVoid({ className }: ParticleVoidProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const frameRef = useRef<number | null>(null)
  const isActiveRef = useRef<boolean>(true)
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetRotRef = useRef({ x: 0, y: 0 })
  const currentRotRef = useRef({ x: 0, y: 0 })
  const startTimeRef = useRef<number>(Date.now())
  const linesRef = useRef<THREE.LineSegments[]>([])
  const ambientRef = useRef<THREE.LineSegments[]>([])
  const constellationRef = useRef<THREE.Group | null>(null)

  const cleanup = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    linesRef.current.forEach(line => {
      line.geometry?.dispose()
      ;(line.material as THREE.LineBasicMaterial)?.dispose()
    })
    ambientRef.current.forEach(line => {
      line.geometry?.dispose()
      ;(line.material as THREE.LineBasicMaterial)?.dispose()
    })
    linesRef.current = []
    ambientRef.current = []
    rendererRef.current?.dispose()
    if (mountRef.current && rendererRef.current) {
      const canvas = rendererRef.current.domElement
      if (canvas.parentNode === mountRef.current) {
        mountRef.current.removeChild(canvas)
      }
    }
    rendererRef.current = null
    sceneRef.current = null
    cameraRef.current = null
  }, [])

  useEffect(() => {
    if (!mountRef.current) return
    const mount = mountRef.current
    const W = mount.clientWidth
    const H = mount.clientHeight
    const isMobile = window.innerWidth < 768
    const count = isMobile ? particleSystem.countMobile : particleSystem.countDesktop
    const scale = isMobile ? 2.5 : 3.5

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000)
    camera.position.z = 8
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Build constellation
    const constellation = new THREE.Group()
    constellationRef.current = constellation
    scene.add(constellation)

    const positions = generateVoidShape(count, scale)

    // Create shared triangle geometry
    function createTriangleGeo(size: number): THREE.BufferGeometry {
      const h = (size * Math.sqrt(3)) / 2
      const verts = new Float32Array([
        0, h * 0.667, 0,
        -size / 2, -h * 0.333, 0,
        size / 2, -h * 0.333, 0,
        0, h * 0.667, 0,
      ])
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
      return geo
    }

    const triangleGeo = createTriangleGeo(0.06)
    linesRef.current = []

    for (let i = 0; i < count; i++) {
      const colorHex = selectWeightedColor()
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(colorHex),
        transparent: true,
        opacity: 0.6 + Math.random() * 0.4,
      })

      const line = new THREE.LineSegments(triangleGeo.clone(), material)
      const tx = positions[i * 3 + 0]
      const ty = positions[i * 3 + 1]
      const tz = positions[i * 3 + 2]

      line.userData = {
        finalX: tx,
        finalY: ty,
        finalZ: tz,
        seed: Math.random() * Math.PI * 2,
      }
      line.position.set(0, 0, 0)
      line.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      )

      constellation.add(line)
      linesRef.current.push(line)
    }

    // Ambient particles
    const ambientCount = isMobile ? 200 : particleSystem.countAmbient
    const ambientPositions = generateAmbientPositions(
      ambientCount,
      scale * particleSystem.ambientSpreadFactor,
    )

    const ambientColors = ['#8052ff', '#ffb829', '#15846e']
    for (let i = 0; i < ambientCount; i++) {
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(ambientColors[Math.floor(Math.random() * ambientColors.length)]),
        transparent: true,
        opacity: particleSystem.ambientOpacityMin +
          Math.random() * (particleSystem.ambientOpacityMax - particleSystem.ambientOpacityMin),
      })

      const ambientLine = new THREE.LineSegments(createTriangleGeo(0.04), material)
      ambientLine.position.set(
        ambientPositions[i * 3 + 0],
        ambientPositions[i * 3 + 1],
        ambientPositions[i * 3 + 2],
      )
      ambientLine.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      )
      scene.add(ambientLine)
      ambientRef.current.push(ambientLine)
    }

    // Mouse tracking
    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect()
      mouseRef.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    // Visibility
    const onVisibility = () => {
      if (document.hidden) {
        isActiveRef.current = false
        if (frameRef.current) cancelAnimationFrame(frameRef.current)
      } else {
        isActiveRef.current = true
        startTimeRef.current = Date.now()
        frameRef.current = requestAnimationFrame(animate)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // Resize
    const onResize = () => {
      if (!mount || !renderer || !camera) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize, { passive: true })

    // Animation loop
    let lastTime = 0
    const animate = (timestamp: number) => {
      if (!isActiveRef.current) return
      frameRef.current = requestAnimationFrame(animate)

      const now = Date.now()
      const elapsed = now - startTimeRef.current
      const time = elapsed * 0.001

      const rawDelta = timestamp - lastTime
      const delta = Math.min(rawDelta, 33.33)
      lastTime = timestamp

      // Entrance
      const entranceProgress = Math.min(elapsed / particleSystem.entranceDuration, 1)
      const entranceEased = 1 - Math.pow(1 - entranceProgress, 3)

      // Constellation rotation
      constellation.rotation.y += particleSystem.rotationSpeedY * delta

      // Mouse parallax
      const maxTiltRad = (particleSystem.parallaxMaxTilt * Math.PI) / 180
      targetRotRef.current.x = mouseRef.current.y * maxTiltRad * 0.3
      targetRotRef.current.y = mouseRef.current.x * maxTiltRad * 0.5
      currentRotRef.current.x += (targetRotRef.current.x - currentRotRef.current.x) * particleSystem.parallaxLerpFactor
      currentRotRef.current.y += (targetRotRef.current.y - currentRotRef.current.y) * particleSystem.parallaxLerpFactor
      constellation.rotation.x = currentRotRef.current.x

      // Particle drift + entrance
      for (let i = 0; i < linesRef.current.length; i++) {
        const line = linesRef.current[i]
        const { finalX, finalY, finalZ, seed } = line.userData
        const baseX = finalX * entranceEased
        const baseY = finalY * entranceEased
        const baseZ = finalZ * entranceEased
        const driftX = Math.sin(time * 0.5 + seed) * particleSystem.driftAmplitude * 0.1
        const driftY = Math.cos(time * 0.4 + seed * 1.3) * particleSystem.driftAmplitude * 0.1
        line.position.set(baseX + driftX, baseY + driftY, baseZ)
        line.rotation.z += 0.001 * (seed > Math.PI ? 1 : -1)
      }

      // Ambient drift
      for (let i = 0; i < ambientRef.current.length; i++) {
        const line = ambientRef.current[i]
        line.rotation.z += 0.0005
        line.rotation.x += 0.0003
      }

      renderer.render(scene, camera)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      cleanup()
    }
  }, [cleanup])

  return (
    <div
      ref={mountRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        willChange: 'transform',
        transform: 'translateZ(0)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
      role="presentation"
    />
  )
}
