'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { particleSystem as ps } from '@/lib/tokens'
import {
  createField,
  createAmbient,
  srgbHexToLinear,
  type FieldData,
  type AmbientData,
} from '@/lib/particles'

const SQRT3 = Math.sqrt(3)
const IRIS_LINEAR = srgbHexToLinear('#8052ff')

function writeTriangles(
  positions: Float32Array,
  count: number,
  sizes: Float32Array,
  basisU: Float32Array,
  basisV: Float32Array,
  centers: Float32Array,
  spinRates: Float32Array,
  breatheAmp: number,
  breatheFreq: number,
  time: number,
): void {
  const bScale = 1 + breatheAmp * Math.sin(time * breatheFreq)
  for (let i = 0; i < count; i++) {
    const cx = centers[i * 3 + 0]
    const cy = centers[i * 3 + 1]
    const cz = centers[i * 3 + 2]
    const r = sizes[i] * bScale
    const angle = time * spinRates[i]
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)

    const ux = basisU[i * 3 + 0]
    const uy = basisU[i * 3 + 1]
    const uz = basisU[i * 3 + 2]
    const vx = basisV[i * 3 + 0]
    const vy = basisV[i * 3 + 1]
    const vz = basisV[i * 3 + 2]

    const rx = (ux * cosA + vx * sinA) * r
    const ry = (uy * cosA + vy * sinA) * r
    const rz = (uz * cosA + vz * sinA) * r
    const sx = (-ux * sinA + vx * cosA) * r
    const sy = (-uy * sinA + vy * cosA) * r
    const sz = (-uz * sinA + vz * cosA) * r

    const v0 = i * 9
    positions[v0 + 0] = cx + ry
    positions[v0 + 1] = cy - rx
    positions[v0 + 2] = cz + rz

    positions[v0 + 3] = cx - 0.5 * ry - 0.5 * SQRT3 * sy
    positions[v0 + 4] = cy + 0.5 * rx + 0.5 * SQRT3 * sx
    positions[v0 + 5] = cz - 0.5 * rz - 0.5 * SQRT3 * sz

    positions[v0 + 6] = cx - 0.5 * ry + 0.5 * SQRT3 * sy
    positions[v0 + 7] = cy + 0.5 * rx - 0.5 * SQRT3 * sx
    positions[v0 + 8] = cz - 0.5 * rz + 0.5 * SQRT3 * sz
  }
}

function writeColors(
  colorAttr: THREE.BufferAttribute,
  count: number,
  baseColors: Float32Array,
  twinkle: Float32Array,
  time: number,
  twinkleFreq: number,
): void {
  const arr = colorAttr.array as Float32Array
  for (let i = 0; i < count; i++) {
    const tw = 0.82 + 0.18 * Math.sin(time * twinkleFreq + twinkle[i])
    const r = baseColors[i * 3 + 0] * tw
    const g = baseColors[i * 3 + 1] * tw
    const b = baseColors[i * 3 + 2] * tw
    const v0 = i * 9
    arr[v0 + 0] = r
    arr[v0 + 1] = g
    arr[v0 + 2] = b
    arr[v0 + 3] = r
    arr[v0 + 4] = g
    arr[v0 + 5] = b
    arr[v0 + 6] = r
    arr[v0 + 7] = g
    arr[v0 + 8] = b
  }
  colorAttr.needsUpdate = true
}

export default function ParticleField() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = window.innerWidth
    let height = window.innerHeight
    const isMobile = width < 768
    const count = isMobile ? ps.countMobile : width < 1024 ? ps.countTablet : ps.countDesktop
    const ambientCount = isMobile ? ps.countAmbientMobile : ps.countAmbientDesktop

    const fieldData: FieldData = createField({
      count,
      colors: ps.colors,
      colorWeights: ps.colorWeights,
      connectionMaxDist: ps.connectionDistanceFactor,
      connectionMaxPerParticle: ps.connectionMaxPerParticle,
      connectionMaxTotal: ps.connectionMaxTotal,
      scatterFactor: ps.scatterFactor,
      seed: ps.seed,
    })

    const ambientData: AmbientData = createAmbient(
      ambientCount,
      1.3,
      ps.colors,
      ps.colorWeights,
      ps.seed + 999,
    )

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(ps.cameraFov, width / height, 0.1, 100)
    camera.position.z = 8

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const fieldGroup = new THREE.Group()
    scene.add(fieldGroup)

    // Triangles mesh
    const triGeo = new THREE.BufferGeometry()
    const triPos = new Float32Array(count * 9)
    const triCol = new Float32Array(count * 9)
    const posAttr = new THREE.BufferAttribute(triPos, 3)
    const colAttr = new THREE.BufferAttribute(triCol, 3)
    triGeo.setAttribute('position', posAttr)
    triGeo.setAttribute('color', colAttr)

    const triMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    })
    const triMesh = new THREE.Mesh(triGeo, triMat)
    fieldGroup.add(triMesh)

    // Web lines (2 active sets for crossfading)
    let maxPairs = 0
    for (let s = 0; s < 4; s++) {
      const numPairs = Math.floor(fieldData.shapePairs[s].length / 2)
      if (numPairs > maxPairs) maxPairs = numPairs
    }
    const webGeoA = new THREE.BufferGeometry()
    const webPosA = new Float32Array(maxPairs * 6)
    const webColA = new Float32Array(maxPairs * 6)
    webGeoA.setAttribute('position', new THREE.BufferAttribute(webPosA, 3))
    webGeoA.setAttribute('color', new THREE.BufferAttribute(webColA, 3))

    const webGeoB = new THREE.BufferGeometry()
    const webPosB = new Float32Array(maxPairs * 6)
    const webColB = new Float32Array(maxPairs * 6)
    webGeoB.setAttribute('position', new THREE.BufferAttribute(webPosB, 3))
    webGeoB.setAttribute('color', new THREE.BufferAttribute(webColB, 3))

    const webMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const webMeshA = new THREE.LineSegments(webGeoA, webMat)
    const webMeshB = new THREE.LineSegments(webGeoB, webMat)
    fieldGroup.add(webMeshA)
    fieldGroup.add(webMeshB)

    // Ambient dust mesh
    const dustGeo = new THREE.BufferGeometry()
    const dustPos = new Float32Array(ambientCount * 9)
    const dustCol = new Float32Array(ambientCount * 9)
    const dustPosAttr = new THREE.BufferAttribute(dustPos, 3)
    const dustColAttr = new THREE.BufferAttribute(dustCol, 3)
    dustGeo.setAttribute('position', dustPosAttr)
    dustGeo.setAttribute('color', dustColAttr)
    const dustMesh = new THREE.Mesh(dustGeo, triMat)
    scene.add(dustMesh)

    // Precompute web brightness jitter per shape set
    const webJitters: number[][] = []
    for (let s = 0; s < 4; s++) {
      const pairs = fieldData.shapePairs[s]
      const nPairs = Math.floor(pairs.length / 2)
      const jit = []
      for (let p = 0; p < nPairs; p++) {
        jit.push(ps.connectionBrightnessMin + ((p * 17) % 100) * 0.001)
      }
      webJitters.push(jit)
    }

    // Dynamic layout parameters
    let shapeUnit = 1.0
    const offsetsX = [0, 0, 0, 0]
    let halfW = 4.0
    let halfH = 3.73
    let disperseScaleX = 4.0
    let disperseScaleY = 3.5
    let disperseScaleZ = 0.5

    const updateSize = () => {
      width = window.innerWidth
      height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)

      halfH = Math.tan((ps.cameraFov * 0.5 * Math.PI) / 180) * 8
      halfW = halfH * camera.aspect
      shapeUnit = Math.max(
        ps.shapeUnitMin,
        Math.min(ps.shapeUnitMax, halfW * ps.shapeUnitFactor),
      )

      const sideOffset = halfW * ps.sideOffsetFactor
      offsetsX[0] = sideOffset // Brain right
      offsetsX[1] = 0 // Disperse center
      offsetsX[2] = -sideOffset // Bulb left
      offsetsX[3] = sideOffset // Globe right

      disperseScaleX = halfW * 0.96
      disperseScaleY = halfH * 0.94
      disperseScaleZ = halfH * 0.45
    }
    updateSize()

    // Scroll state tracking
    let phase = 0
    let targetPhase = 0
    const getScrollTarget = () => {
      const doc = document.documentElement
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight)
      const t = Math.max(0, Math.min(1, window.scrollY / maxScroll))
      return t * (ps.states - 1)
    }
    phase = targetPhase = getScrollTarget()

    // Interaction tracking
    const pointer = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      inside: false,
    }
    const repel = { x: 999, y: 999, active: false }

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / width) * 2 - 1
      const ny = -(e.clientY / height) * 2 + 1
      pointer.targetX = nx * halfW
      pointer.targetY = ny * halfH
      pointer.inside = true
    }
    const onPointerLeave = () => {
      pointer.inside = false
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })
    window.addEventListener('resize', updateSize, { passive: true })

    // Animation buffers and scratch arrays
    const centers = new Float32Array(count * 3)
    const dustCenters = new Float32Array(ambientCount * 3)
    const scratchW = new Float32Array(3)
    const scratchA = new Float32Array(3)
    const scratchB = new Float32Array(3)

    const shapeScales = [
      ps.brainScale,
      1.0, // Disperse uses anisotropic scaling
      ps.bulbScale,
      ps.globeScale,
    ]
    const shapeRotSpeeds = [
      ps.brainRotSpeed,
      ps.disperseRotSpeed,
      ps.bulbRotSpeed,
      ps.globeRotSpeed,
    ]

    function evalShapeWorld(
      shapeIndex: number,
      particleIdx: number,
      time: number,
      out: Float32Array,
    ): void {
      const idx3 = particleIdx * 3
      const lx = fieldData.shapes[shapeIndex][idx3 + 0]
      const ly = fieldData.shapes[shapeIndex][idx3 + 1]
      const lz = fieldData.shapes[shapeIndex][idx3 + 2]

      const angle = time * shapeRotSpeeds[shapeIndex]
      const cosT = Math.cos(angle)
      const sinT = Math.sin(angle)

      const rx = lx * cosT + lz * sinT
      const rz = -lx * sinT + lz * cosT

      if (shapeIndex === 1) {
        out[0] = rx * disperseScaleX + offsetsX[1]
        out[1] = ly * disperseScaleY
        out[2] = rz * disperseScaleZ
      } else {
        const sc = shapeUnit * shapeScales[shapeIndex]
        out[0] = rx * sc + offsetsX[shapeIndex]
        out[1] = ly * sc
        out[2] = rz * sc
      }
    }

    let lastWeightA = -1
    let lastWeightB = -1

    function updateWebMesh(
      mesh: THREE.LineSegments,
      shapeIndex: number,
      weight: number,
      isA: boolean,
    ): void {
      const geo = mesh.geometry
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
      const colAttr = geo.getAttribute('color') as THREE.BufferAttribute
      const pairs = fieldData.shapePairs[shapeIndex]
      const nPairs = Math.floor(pairs.length / 2)
      const pArr = posAttr.array as Float32Array
      const cArr = colAttr.array as Float32Array

      if (weight < 0.003 || nPairs === 0) {
        mesh.visible = false
        if (isA ? lastWeightA > 0.003 : lastWeightB > 0.003) {
          cArr.fill(0)
          colAttr.needsUpdate = true
        }
        if (isA) lastWeightA = weight
        else lastWeightB = weight
        return
      }

      mesh.visible = true
      const linkRef = ps.connectionDistanceFactor * shapeUnit * 1.25
      const fadeStart = linkRef * ps.webFadeStart
      const fadeRange = Math.max(0.001, linkRef * (ps.webFadeEnd - ps.webFadeStart))
      const jitters = webJitters[shapeIndex]

      for (let p = 0; p < nPairs; p++) {
        const i0 = pairs[p * 2 + 0]
        const i1 = pairs[p * 2 + 1]
        const x0 = centers[i0 * 3 + 0]
        const y0 = centers[i0 * 3 + 1]
        const z0 = centers[i0 * 3 + 2]
        const x1 = centers[i1 * 3 + 0]
        const y1 = centers[i1 * 3 + 1]
        const z1 = centers[i1 * 3 + 2]

        const v0 = p * 6
        pArr[v0 + 0] = x0
        pArr[v0 + 1] = y0
        pArr[v0 + 2] = z0
        pArr[v0 + 3] = x1
        pArr[v0 + 4] = y1
        pArr[v0 + 5] = z1

        const dist = Math.hypot(x1 - x0, y1 - y0, z1 - z0)
        const fade = 1 - Math.max(0, Math.min(1, (dist - fadeStart) / fadeRange))
        const alpha = Math.max(0, fade * weight)
        const bright = jitters[p] * alpha

        cArr[v0 + 0] = IRIS_LINEAR[0] * bright
        cArr[v0 + 1] = IRIS_LINEAR[1] * bright
        cArr[v0 + 2] = IRIS_LINEAR[2] * bright
        cArr[v0 + 3] = IRIS_LINEAR[0] * bright
        cArr[v0 + 4] = IRIS_LINEAR[1] * bright
        cArr[v0 + 5] = IRIS_LINEAR[2] * bright
      }

      posAttr.needsUpdate = true
      colAttr.needsUpdate = true
      if (isA) lastWeightA = weight
      else lastWeightB = weight
    }

    let simTime = 0
    let prevTime = performance.now()
    let rafId = 0
    let colorFrame = 0

    const step = (dt: number) => {
      simTime += dt
      targetPhase = getScrollTarget()
      const smoothRate = Math.min(1, dt * ps.scrollSmoothRate)
      phase += (targetPhase - phase) * smoothRate

      // Smooth pointer & repel
      const pr = Math.min(1, dt * ps.parallaxRate)
      pointer.x += (pointer.targetX - pointer.x) * pr
      pointer.y += (pointer.targetY - pointer.y) * pr

      const rr = Math.min(1, dt * ps.repelRate)
      if (pointer.inside) {
        repel.x += (pointer.targetX - repel.x) * rr
        repel.y += (pointer.targetY - repel.y) * rr
        repel.active = true
      } else {
        repel.x += (999 - repel.x) * rr
        repel.y += (999 - repel.y) * rr
        if (Math.abs(repel.x) > 100) repel.active = false
      }

      const stateA = Math.min(Math.floor(phase), ps.states - 2)
      const stateB = stateA + 1
      const f = Math.max(0, Math.min(1, phase - stateA))
      const staggerRange = 1 - ps.morphStagger

      for (let i = 0; i < count; i++) {
        evalShapeWorld(stateA, i, simTime, scratchA)
        evalShapeWorld(stateB, i, simTime, scratchB)

        const fi = Math.max(
          0,
          Math.min(1, (f - fieldData.stagger[i] * ps.morphStagger) / staggerRange),
        )
        const ei = fi * fi * (3 - 2 * fi)

        const turb =
          Math.sin(Math.PI * fi) * ps.turbulence * shapeUnit * 0.75
        const i3 = i * 3
        scratchW[0] = scratchA[0] + (scratchB[0] - scratchA[0]) * ei + fieldData.turbDir[i3 + 0] * turb
        scratchW[1] = scratchA[1] + (scratchB[1] - scratchA[1]) * ei + fieldData.turbDir[i3 + 1] * turb
        scratchW[2] = scratchA[2] + (scratchB[2] - scratchA[2]) * ei + fieldData.turbDir[i3 + 2] * turb

        // Entrance scatter blending (initial load)
        const eEnter = Math.max(
          0,
          Math.min(1, (simTime - fieldData.delays[i]) / (ps.entranceDuration / 1000)),
        )
        const enterEase = eEnter * eEnter * (3 - 2 * eEnter)
        let px = fieldData.scatter[i3 + 0] * shapeUnit * (1 - enterEase) + scratchW[0] * enterEase
        let py = fieldData.scatter[i3 + 1] * shapeUnit * (1 - enterEase) + scratchW[1] * enterEase
        const pz = fieldData.scatter[i3 + 2] * shapeUnit * (1 - enterEase) + scratchW[2] * enterEase

        // Pointer repulsion
        if (repel.active) {
          const dx = px - repel.x
          const dy = py - repel.y
          const d2 = dx * dx + dy * dy
          const r2 = ps.repelRadius * ps.repelRadius
          if (d2 < r2 && d2 > 1e-4) {
            const d = Math.sqrt(d2)
            const push = ((ps.repelRadius - d) / ps.repelRadius) * ps.repelStrength
            px += (dx / d) * push
            py += (dy / d) * push
          }
        }

        centers[i3 + 0] = px
        centers[i3 + 1] = py
        centers[i3 + 2] = pz
      }

      writeTriangles(
        triPos,
        count,
        fieldData.sizes,
        fieldData.basisU,
        fieldData.basisV,
        centers,
        fieldData.spinRates,
        ps.breatheAmplitude,
        ps.breatheFrequency,
        simTime,
      )
      posAttr.needsUpdate = true

      colorFrame++
      if (colorFrame % 2 === 0) {
        writeColors(colAttr, count, fieldData.colors, fieldData.twinkle, simTime, ps.twinkleFrequency)
      }

      // Update webs
      const wB = f * f * (3 - 2 * f)
      const wA = 1 - wB
      updateWebMesh(webMeshA, stateA, wA, true)
      updateWebMesh(webMeshB, stateB, wB, false)

      // Parallax tilt on the field group
      if (!isMobile) {
        const maxTiltRad = (ps.parallaxMaxTilt * Math.PI) / 180
        const tiltY = (pointer.x / halfW) * maxTiltRad
        const tiltX = -(pointer.y / halfH) * maxTiltRad
        fieldGroup.rotation.y = tiltY
        fieldGroup.rotation.x = tiltX
      }

      // Ambient dust positions
      for (let i = 0; i < ambientCount; i++) {
        const i3 = i * 3
        let px = ambientData.positions[i3 + 0]
        let py = ambientData.positions[i3 + 1]
        const pz = ambientData.positions[i3 + 2]
        // Slow float
        px += Math.sin(simTime * 0.3 + ambientData.seeds[i]) * 0.15
        py += Math.cos(simTime * 0.25 + ambientData.seeds[i]) * 0.15
        dustCenters[i3 + 0] = px
        dustCenters[i3 + 1] = py
        dustCenters[i3 + 2] = pz
      }
      writeTriangles(
        dustPos,
        ambientCount,
        ambientData.sizes,
        ambientData.basisU,
        ambientData.basisV,
        dustCenters,
        ambientData.spinRates,
        0.008,
        0.4,
        simTime,
      )
      dustPosAttr.needsUpdate = true
    }

    const frame = (now: number) => {
      const dt = Math.min((now - prevTime) / 1000, 0.1)
      prevTime = now
      step(dt)
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(frame)
    }

    if (reducedMotion) {
      step(10.0)
      renderer.render(scene, camera)
      const onStaticScroll = () => {
        targetPhase = getScrollTarget()
        phase = targetPhase
        step(0.01)
        renderer.render(scene, camera)
      }
      window.addEventListener('scroll', onStaticScroll, { passive: true })
      return () => {
        window.removeEventListener('scroll', onStaticScroll)
        window.removeEventListener('resize', updateSize)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerleave', onPointerLeave)
        renderer.dispose()
        triGeo.dispose()
        webGeoA.dispose()
        webGeoB.dispose()
        dustGeo.dispose()
        triMat.dispose()
        webMat.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
    }

    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateSize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      renderer.dispose()
      triGeo.dispose()
      webGeoA.dispose()
      webGeoB.dispose()
      dustGeo.dispose()
      triMat.dispose()
      webMat.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )
}
