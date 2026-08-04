/* ============================================================
   BLCK VOID — components/canvas/ParticleVoid.tsx
   Three.js particle constellation: tiny multicolored triangles
   forming an organic brain — the brand's signature gesture.

   Unlike a naive one-mesh-per-particle scene (~5,800 draw
   calls), every layer here is a single merged BufferGeometry:
   the whole scene renders in 3 draw calls.

   Layers:
     1. connections — dim iris web between near particles
     2. triangles   — the multicolored constellation itself
     3. dust        — faint ambient motes drifting behind
   ============================================================ */

'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { particleSystem as ps } from '@/lib/tokens'
import {
  createConstellation,
  createAmbient,
  srgbHexToLinear,
  type ConstellationData,
  type AmbientData,
} from '@/lib/particles'

interface ParticleVoidProps {
  className?: string
}

// Triangle corner angles (equilateral, apex up).
const A0 = Math.PI / 2
const A1 = A0 + (Math.PI * 2) / 3
const A2 = A0 + (Math.PI * 4) / 3

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeOutCubic = (v: number) => 1 - Math.pow(1 - v, 3)

/**
 * Writes the six line-segment vertices (v0v1, v1v2, v2v0 — a fully
 * closed outline) for every triangle into `out`.
 */
function writeTriangles(
  out: Float32Array,
  centers: Float32Array,
  basisU: Float32Array,
  basisV: Float32Array,
  sizes: Float32Array,
  spinRates: Float32Array,
  count: number,
  time: number,
) {
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const cx = centers[i3]
    const cy = centers[i3 + 1]
    const cz = centers[i3 + 2]
    const ux = basisU[i3]
    const uy = basisU[i3 + 1]
    const uz = basisU[i3 + 2]
    const vx = basisV[i3]
    const vy = basisV[i3 + 1]
    const vz = basisV[i3 + 2]
    const r = sizes[i]
    const th = spinRates[i] * time

    const c0 = Math.cos(A0 + th) * r
    const s0 = Math.sin(A0 + th) * r
    const k0x = ux * c0 + vx * s0
    const k0y = uy * c0 + vy * s0
    const k0z = uz * c0 + vz * s0
    const c1 = Math.cos(A1 + th) * r
    const s1 = Math.sin(A1 + th) * r
    const k1x = ux * c1 + vx * s1
    const k1y = uy * c1 + vy * s1
    const k1z = uz * c1 + vz * s1
    const c2 = Math.cos(A2 + th) * r
    const s2 = Math.sin(A2 + th) * r
    const k2x = ux * c2 + vx * s2
    const k2y = uy * c2 + vy * s2
    const k2z = uz * c2 + vz * s2

    const o = i * 18
    out[o] = cx + k0x
    out[o + 1] = cy + k0y
    out[o + 2] = cz + k0z
    out[o + 3] = cx + k1x
    out[o + 4] = cy + k1y
    out[o + 5] = cz + k1z
    out[o + 6] = cx + k1x
    out[o + 7] = cy + k1y
    out[o + 8] = cz + k1z
    out[o + 9] = cx + k2x
    out[o + 10] = cy + k2y
    out[o + 11] = cz + k2z
    out[o + 12] = cx + k2x
    out[o + 13] = cy + k2y
    out[o + 14] = cz + k2z
    out[o + 15] = cx + k0x
    out[o + 16] = cy + k0y
    out[o + 17] = cz + k0z
  }
}

/** Per-particle twinkle — rewrites the merged vertex-color buffer. */
function writeColors(
  out: Float32Array,
  base: Float32Array,
  phases: Float32Array,
  count: number,
  time: number,
  frequency: number,
) {
  for (let i = 0; i < count; i++) {
    const m = 0.78 + 0.22 * Math.sin(time * frequency + phases[i])
    const r = base[i * 3] * m
    const g = base[i * 3 + 1] * m
    const b = base[i * 3 + 2] * m
    let o = i * 18
    for (let v = 0; v < 6; v++) {
      out[o] = r
      out[o + 1] = g
      out[o + 2] = b
      o += 3
    }
  }
}

export default function ParticleVoid({ className }: ParticleVoidProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mountEl = mountRef.current
    if (!mountEl) return
    const mount: HTMLDivElement = mountEl

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let disposed = false
    let initialized = false
    let running = false
    let onScreen = false
    let raf: number | null = null
    let simTime = 0
    let last = 0
    let frameNo = 0

    // Scene objects (assigned by init()).
    let renderer: THREE.WebGLRenderer | null = null
    let scene: THREE.Scene | null = null
    let camera: THREE.PerspectiveCamera | null = null
    let brain: THREE.Group | null = null
    let dustMesh: THREE.LineSegments | null = null
    let triGeo: THREE.BufferGeometry | null = null
    let connGeo: THREE.BufferGeometry | null = null
    let dustGeo: THREE.BufferGeometry | null = null
    let dustMat: THREE.LineBasicMaterial | null = null
    let connMat: THREE.LineBasicMaterial | null = null
    let triMat: THREE.LineBasicMaterial | null = null
    let data: ConstellationData | null = null
    let ambient: AmbientData | null = null
    let centers: Float32Array = new Float32Array(0)
    let repX: Float32Array = new Float32Array(0)
    let repY: Float32Array = new Float32Array(0)
    let dustGeoPositions: Float32Array = new Float32Array(0)
    let scale: number = ps.scaleDesktop

    // Interaction state.
    const pointer = { ndcX: 0, ndcY: 0, inside: false }
    let tiltX = 0
    let tiltY = 0
    const hitPoint = new THREE.Vector3()
    const invMatrix = new THREE.Matrix4()

    const entranceSec = ps.entranceDuration / 1000

    // ── Sizing ────────────────────────────────────────────────

    function updateSize() {
      if (!renderer || !camera) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (w === 0 || h === 0) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      // Fit the brain regardless of container aspect: pull the camera
      // back until both axes clear the margins.
      const halfW = scale * ps.fitMarginX
      const halfH = Math.max(scale * ps.fitMarginY, halfW / camera.aspect)
      const dist = halfH / Math.tan(THREE.MathUtils.degToRad(ps.cameraFov / 2))
      camera.position.z = THREE.MathUtils.clamp(dist, 6, 22)
      camera.updateProjectionMatrix()
      camera.updateMatrixWorld()
    }

    // ── Scene construction ────────────────────────────────────

    function init() {
      if (initialized || disposed) return
      initialized = true

      const vw = window.innerWidth
      const isMobile = vw < 768
      const isTablet = !isMobile && vw < 1280
      const count = isMobile ? ps.countMobile : isTablet ? ps.countTablet : ps.countDesktop
      scale = isMobile ? ps.scaleMobile : ps.scaleDesktop

      data = createConstellation({
        count,
        scale,
        colors: ps.colors,
        colorWeights: ps.colorWeights,
        connectionMaxDist: ps.connectionDistanceFactor * scale,
        connectionMaxPerParticle: ps.connectionMaxPerParticle,
        connectionMaxTotal: ps.connectionMaxTotal,
        scatterFactor: ps.scatterFactor,
        seed: ps.seed,
      })
      ambient = createAmbient(
        isMobile ? ps.countAmbientMobile : ps.countAmbientDesktop,
        scale,
        ps.colors,
        ps.colorWeights,
        ps.seed + 7,
      )

      centers = new Float32Array(count * 3)
      centers.set(data.targets)
      repX = new Float32Array(count)
      repY = new Float32Array(count)

      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(ps.cameraFov, 1, 0.1, 100)

      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: !isMobile,
          powerPreference: 'high-performance',
        })
      } catch {
        initialized = false
        return // WebGL unavailable — the CSS backdrop remains.
      }
      renderer.setClearColor(0x000000, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      mount.appendChild(renderer.domElement)

      brain = new THREE.Group()
      scene.add(brain)

      // 1 — Connection web (rendered under the triangles).
      const pairs = data.connectionPairs
      const pairCount = pairs.length / 2
      connGeo = new THREE.BufferGeometry()
      connGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(pairCount * 6), 3).setUsage(
          THREE.DynamicDrawUsage,
        ),
      )
      const connColors = new Float32Array(pairCount * 6)
      const [ir, ig, ib] = srgbHexToLinear('#8052ff')
      const connRng = (i: number) => {
        // Cheap deterministic per-pair brightness jitter.
        const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
        return x - Math.floor(x)
      }
      for (let p = 0; p < pairCount; p++) {
        const b =
          ps.connectionBrightnessMin +
          connRng(p) * (ps.connectionBrightnessMax - ps.connectionBrightnessMin)
        for (let v = 0; v < 2; v++) {
          connColors[p * 6 + v * 3] = ir * b
          connColors[p * 6 + v * 3 + 1] = ig * b
          connColors[p * 6 + v * 3 + 2] = ib * b
        }
      }
      connGeo.setAttribute('color', new THREE.BufferAttribute(connColors, 3))
      connMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
      })
      const connMesh = new THREE.LineSegments(connGeo, connMat)
      connMesh.renderOrder = 0
      connMesh.frustumCulled = false
      brain.add(connMesh)

      // 2 — The triangular constellation itself.
      triGeo = new THREE.BufferGeometry()
      triGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(count * 18), 3).setUsage(
          THREE.DynamicDrawUsage,
        ),
      )
      triGeo.setAttribute(
        'color',
        new THREE.BufferAttribute(new Float32Array(count * 18), 3).setUsage(
          THREE.DynamicDrawUsage,
        ),
      )
      triMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
      })
      const triMesh = new THREE.LineSegments(triGeo, triMat)
      triMesh.renderOrder = 1
      triMesh.frustumCulled = false
      brain.add(triMesh)

      // 3 — Ambient dust motes behind everything.
      dustGeo = new THREE.BufferGeometry()
      dustGeoPositions = new Float32Array(ambient.count * 3)
      dustGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(dustGeoPositions, 3).setUsage(THREE.DynamicDrawUsage),
      )
      const dustColors = new Float32Array(ambient.count * 18)
      for (let i = 0; i < ambient.count; i++) {
        for (let v = 0; v < 6; v++) {
          dustColors[i * 18 + v * 3] = ambient.colors[i * 3]
          dustColors[i * 18 + v * 3 + 1] = ambient.colors[i * 3 + 1]
          dustColors[i * 18 + v * 3 + 2] = ambient.colors[i * 3 + 2]
        }
      }
      dustGeo.setAttribute('color', new THREE.BufferAttribute(dustColors, 3))
      dustMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      dustMesh = new THREE.LineSegments(dustGeo, dustMat)
      dustMesh.frustumCulled = false
      scene.add(dustMesh)

      updateSize()

      if (reducedMotion) {
        // Static, fully-formed frame — no loop, no cursor response.
        simTime = entranceSec + 1
        step(0)
        render()
      } else {
        maybeStart()
      }
    }

    // ── Simulation ────────────────────────────────────────────

    function step(dt: number) {
      if (!brain || !camera || !data) return
      const count = data.count

      // Group motion: slow tumble + breathing + cursor parallax.
      const maxTilt = THREE.MathUtils.degToRad(ps.parallaxMaxTilt)
      const targetTiltX = -pointer.ndcY * maxTilt * 0.35
      const targetTiltY = pointer.ndcX * maxTilt * 0.6
      const aP = 1 - Math.exp(-ps.parallaxRate * dt)
      tiltX += (targetTiltX - tiltX) * aP
      tiltY += (targetTiltY - tiltY) * aP
      brain.rotation.y = simTime * ps.rotationSpeedY + tiltY
      brain.rotation.x = tiltX
      brain.scale.setScalar(1 + ps.breatheAmplitude * Math.sin(simTime * ps.breatheFrequency))
      brain.updateMatrixWorld(true)

      // Cursor ray → z=0 plane → brain-local repulsion point.
      const repel = pointer.inside && !reducedMotion
      let pxL = 0
      let pyL = 0
      if (repel) {
        hitPoint.set(pointer.ndcX, pointer.ndcY, 0.5).unproject(camera)
        hitPoint.sub(camera.position).normalize()
        const t = -camera.position.z / (hitPoint.z || -1e-6)
        hitPoint.multiplyScalar(t).add(camera.position)
        invMatrix.copy(brain.matrixWorld).invert()
        hitPoint.applyMatrix4(invMatrix)
        pxL = hitPoint.x
        pyL = hitPoint.y
      }

      const R2 = ps.repelRadius * ps.repelRadius
      const aR = 1 - Math.exp(-ps.repelRate * dt)
      const driftA = ps.driftAmplitude
      const { targets, scatter, seeds, delays } = data

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        // Entrance: converging flight from the scatter sphere.
        const e = easeOutCubic(clamp01((simTime - delays[i]) / entranceSec))
        let px = scatter[i3] + (targets[i3] - scatter[i3]) * e
        let py = scatter[i3 + 1] + (targets[i3 + 1] - scatter[i3 + 1]) * e
        let pz = scatter[i3 + 2] + (targets[i3 + 2] - scatter[i3 + 2]) * e

        // Ambient drift.
        const sd = seeds[i]
        px += Math.sin(simTime * 0.42 + sd) * driftA
        py += Math.cos(simTime * 0.36 + sd * 1.31) * driftA
        pz += Math.sin(simTime * 0.3 + sd * 0.67) * driftA * 0.7

        // Cursor repulsion, exponentially smoothed per particle.
        let dtx = 0
        let dty = 0
        if (repel) {
          const dx = px - pxL
          const dy = py - pyL
          const d2 = dx * dx + dy * dy
          if (d2 < R2 && d2 > 1e-6) {
            const d = Math.sqrt(d2)
            const f = 1 - d / ps.repelRadius
            const ff = (f * f * ps.repelStrength) / d
            dtx = dx * ff
            dty = dy * ff
          }
        }
        repX[i] += (dtx - repX[i]) * aR
        repY[i] += (dty - repY[i]) * aR
        px += repX[i]
        py += repY[i]

        centers[i3] = px
        centers[i3 + 1] = py
        centers[i3 + 2] = pz
      }

      // Geometry rewrites for the merged buffers.
      if (!triGeo || !connGeo || !dustGeo || !ambient) return

      const triPos = triGeo.attributes.position as THREE.BufferAttribute
      writeTriangles(
        triPos.array as Float32Array,
        centers,
        data.basisU,
        data.basisV,
        data.sizes,
        data.spinRates,
        count,
        simTime,
      )
      triPos.needsUpdate = true

      // Twinkle at half rate — the cadence is imperceptible.
      const triCol = triGeo.attributes.color as THREE.BufferAttribute
      if (frameNo % 2 === 0 || reducedMotion) {
        writeColors(
          triCol.array as Float32Array,
          data.colors,
          data.twinkle,
          count,
          simTime,
          ps.twinkleFrequency,
        )
        triCol.needsUpdate = true
      }

      // Connection web follows the animated centers.
      const connPos = connGeo.attributes.position as THREE.BufferAttribute
      const connArr = connPos.array as Float32Array
      const pairs = data.connectionPairs
      for (let p = 0; p < pairs.length / 2; p++) {
        const a3 = pairs[p * 2] * 3
        const b3 = pairs[p * 2 + 1] * 3
        connArr[p * 6] = centers[a3]
        connArr[p * 6 + 1] = centers[a3 + 1]
        connArr[p * 6 + 2] = centers[a3 + 2]
        connArr[p * 6 + 3] = centers[b3]
        connArr[p * 6 + 4] = centers[b3 + 1]
        connArr[p * 6 + 5] = centers[b3 + 2]
      }
      connPos.needsUpdate = true

      // Dust — slow free drift, no repulsion.
      const dustPos = dustGeo.attributes.position as THREE.BufferAttribute
      const dustArr = dustPos.array as Float32Array
      for (let i = 0; i < ambient.count; i++) {
        const i3 = i * 3
        const sd = ambient.seeds[i]
        const dx = ambient.positions[i3] + Math.sin(simTime * 0.18 + sd) * 0.12
        const dy = ambient.positions[i3 + 1] + Math.cos(simTime * 0.15 + sd * 1.4) * 0.12
        const dz = ambient.positions[i3 + 2] + Math.sin(simTime * 0.12 + sd * 0.8) * 0.06
        dustGeoPositions[i3] = dx
        dustGeoPositions[i3 + 1] = dy
        dustGeoPositions[i3 + 2] = dz
      }
      writeTriangles(
        dustArr,
        dustGeoPositions,
        ambient.basisU,
        ambient.basisV,
        ambient.sizes,
        ambient.spinRates,
        ambient.count,
        simTime * 0.6,
      )
      dustPos.needsUpdate = true
      if (dustMesh) dustMesh.rotation.y = simTime * 0.012
      if (dustMat) dustMat.opacity = clamp01(simTime / 2.4)
    }

    function render() {
      if (renderer && scene && camera) renderer.render(scene, camera)
    }

    function frame(nowMs: number) {
      if (!running) return
      raf = requestAnimationFrame(frame)
      const dt = Math.min((nowMs - last) / 1000, 1 / 30)
      last = nowMs
      simTime += dt
      frameNo++
      step(dt)
      render()
    }

    // ── Lifecycle ─────────────────────────────────────────────

    function maybeStart() {
      if (running || disposed || reducedMotion) return
      if (!renderer || !onScreen || document.hidden) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    function stop() {
      running = false
      if (raf !== null) {
        cancelAnimationFrame(raf)
        raf = null
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (!initialized) {
        if (w > 0 && h > 0) init()
        return
      }
      updateSize()
      if (reducedMotion) {
        simTime = entranceSec + 1
        step(0)
        render()
      }
    })
    resizeObserver.observe(mount)

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0]?.isIntersecting ?? false
        if (onScreen && !initialized) init()
        if (onScreen) maybeStart()
        else stop()
      },
      { threshold: 0 },
    )
    intersectionObserver.observe(mount)

    function onPointerMove(e: PointerEvent) {
      const rect = mount.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
      // Parallax follows across the hero; repulsion only inside the canvas.
      pointer.ndcX = THREE.MathUtils.clamp(nx, -1, 1)
      pointer.ndcY = THREE.MathUtils.clamp(ny, -1, 1)
      pointer.inside = Math.abs(nx) <= 1.05 && Math.abs(ny) <= 1.05
    }

    function onPointerEnd() {
      pointer.inside = false
    }

    function onVisibility() {
      if (document.hidden) stop()
      else maybeStart()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerEnd, { passive: true })
    window.addEventListener('blur', onPointerEnd)
    document.addEventListener('visibilitychange', onVisibility)

    // Kick init if the mount already has size at effect time.
    if (mount.clientWidth > 0 && mount.clientHeight > 0) init()

    return () => {
      disposed = true
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerEnd)
      window.removeEventListener('blur', onPointerEnd)
      document.removeEventListener('visibilitychange', onVisibility)

      triGeo?.dispose()
      connGeo?.dispose()
      dustGeo?.dispose()
      triMat?.dispose()
      connMat?.dispose()
      dustMat?.dispose()
      if (renderer) {
        renderer.dispose()
        const canvas = renderer.domElement
        if (canvas.parentNode === mount) mount.removeChild(canvas)
      }
      renderer = null
      scene = null
      camera = null
      brain = null
      dustMesh = null
    }
  }, [])

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
