'use client'

import React, { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'

// ─── RNG ─────────────────────────────────────────────────────────────────────
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Color helpers ────────────────────────────────────────────────────────────
function srgbToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const chan = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return [chan((n >> 16) & 255), chan((n >> 8) & 255), chan(n & 255)]
}

const COLORS = ['#8052ff', '#9b72ff', '#6030cc', '#ffb829', '#15846e', '#b347ff', '#4df0ff', '#ff6b9d', '#7b52ab', '#3d85c8']
const COLOR_WEIGHTS = [0.26, 0.12, 0.08, 0.12, 0.10, 0.09, 0.08, 0.06, 0.05, 0.04]

// ─── Organic Brain Shape ─────────────────────────────────────────────────────
const RX = 1.55  // hemisphere radius along view axis
const RY = 1.0   // vertical radius
const RZ = 0.7   // depth radius per lobe
const HZ = 0.32  // half-offset between lobes

function hemisphereDist(x: number, y: number, z: number, side: 1 | -1): number {
  const az = z - side * HZ
  const ay = y - 0.04
  return Math.sqrt((x * x) / (RX * RX) + (ay * ay) / (RY * RY) + (az * az) / (RZ * RZ))
}

function cerebellumDist(x: number, y: number, z: number): number {
  const cx = (x + 1.0) / 0.44
  const cy = (y + 0.48) / 0.32
  const cz = z / 0.38
  return Math.sqrt(cx * cx + cy * cy + cz * cz)
}

function brainDist(x: number, y: number, z: number): number {
  return Math.min(hemisphereDist(x, y, z, 1), hemisphereDist(x, y, z, -1), cerebellumDist(x, y, z))
}

function wrinkle(x: number, y: number, z: number): number {
  return (
    Math.sin(5.1 * x + 1.3 * z) *
    Math.sin(4.3 * y + 2.2 * x) *
    Math.sin(3.7 * z + 0.9 * y + 1.7)
  )
}

function inFissure(y: number, z: number): boolean {
  if (y <= -0.4) return false
  const gap = 0.1 + 0.05 * Math.max(0, y)
  return Math.abs(z) < gap
}

function isAccepted(x: number, y: number, z: number, shellBias: number, rng: () => number): boolean {
  if (inFissure(y, z)) return false
  const limit = 1 + 0.08 * wrinkle(x, y, z)
  const d = brainDist(x, y, z)
  if (d > limit) return false
  if (rng() < shellBias && d < 0.65 * limit) return false
  return true
}

// ─── Shape samplers ──────────────────────────────────────────────────────────
function sampleBrain(count: number, seed: number): Float32Array {
  const rng = mulberry32(seed)
  const out = new Float32Array(count * 3)
  let i = 0, attempts = 0
  while (i < count && attempts < count * 50) {
    attempts++
    const x = (rng() * 2 - 1) * 1.7
    const y = (rng() * 2 - 1) * 1.15
    const z = (rng() * 2 - 1) * 1.15
    if (!isAccepted(x, y, z, 0.75, rng)) continue
    out[i * 3 + 0] = x / 1.55
    out[i * 3 + 1] = y / 1.55
    out[i * 3 + 2] = z / 1.55
    i++
  }
  // Fallback
  while (i < count) {
    out[i * 3 + 0] = (rng() * 2 - 1) * 1.5
    out[i * 3 + 1] = (rng() * 2 - 1) * 1.0
    out[i * 3 + 2] = (rng() * 2 - 1) * 1.0
    i++
  }
  return out
}

function sampleSphere(count: number, seed: number): Float32Array {
  const rng = mulberry32(seed)
  const out = new Float32Array(count * 3)
  const golden = 2.399963229728653
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = i * golden
    out[i * 3 + 0] = Math.cos(theta) * r + (rng() - 0.5) * 0.03
    out[i * 3 + 1] = y + (rng() - 0.5) * 0.03
    out[i * 3 + 2] = Math.sin(theta) * r + (rng() - 0.5) * 0.03
  }
  return out
}

// ─── Connection builder ───────────────────────────────────────────────────────
function buildConnections(
  positions: Float32Array,
  count: number,
  maxDist: number,
  maxPer: number,
  maxTotal: number
): Uint32Array {
  const cell = maxDist
  const buckets = new Map<number, number[]>()
  const keyOf = (ix: number, iy: number, iz: number) =>
    (ix + 64) + (iy + 64) * 256 + (iz + 64) * 65536

  for (let i = 0; i < count; i++) {
    const ix = Math.floor(positions[i * 3 + 0] / cell)
    const iy = Math.floor(positions[i * 3 + 1] / cell)
    const iz = Math.floor(positions[i * 3 + 2] / cell)
    const k = keyOf(ix, iy, iz)
    const bucket = buckets.get(k)
    if (bucket) bucket.push(i)
    else buckets.set(k, [i])
  }

  const degree = new Uint8Array(count)
  const tmp: number[] = []
  const maxD2 = maxDist * maxDist

  for (let i = 0; i < count && tmp.length / 2 < maxTotal; i++) {
    if (degree[i] >= maxPer) continue
    const x = positions[i * 3 + 0], y = positions[i * 3 + 1], z = positions[i * 3 + 2]
    const ix = Math.floor(x / cell), iy = Math.floor(y / cell), iz = Math.floor(z / cell)

    for (let dx = -1; dx <= 1 && tmp.length / 2 < maxTotal; dx++) {
      for (let dy = -1; dy <= 1 && tmp.length / 2 < maxTotal; dy++) {
        for (let dz = -1; dz <= 1 && tmp.length / 2 < maxTotal; dz++) {
          const bucket = buckets.get(keyOf(ix + dx, iy + dy, iz + dz))
          if (!bucket) continue
          for (let j of bucket) {
            if (j <= i) continue
            if (degree[j] >= maxPer) continue
            const ddx = x - positions[j * 3], ddy = y - positions[j * 3 + 1], ddz = z - positions[j * 3 + 2]
            if (ddx * ddx + ddy * ddy + ddz * ddz > maxD2) continue
            tmp.push(i, j)
            degree[i]++; degree[j]++
            if (degree[i] >= maxPer) break
          }
        }
      }
    }
  }
  return Uint32Array.from(tmp)
}

// ─── Constants ───────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 1600
const AMBIENT_COUNT = 200
const CONNECTION_DIST = 0.2
const CONNECTION_MAX_PER = 2
const CONNECTION_MAX_TOTAL = 1400
const SCATTER_FACTOR = 3.2
const SEED = 1337

const IRIS_LINEAR = srgbToLinear('#8052ff')

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ParticleField() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let cleanup: (() => void) | undefined
    try {
      cleanup = initField(container)
    } catch {
      while (container.firstChild) container.removeChild(container.firstChild)
      return () => {}
    }
    return () => { cleanup?.() }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )
}

function initField(container: HTMLDivElement): () => void {
  const reducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let width = window.innerWidth
  let height = window.innerHeight
  const isMobile = width < 768

  // Precompute shapes
  const brain = sampleBrain(PARTICLE_COUNT, SEED)
  const sphere = sampleSphere(PARTICLE_COUNT, SEED + 17)
  const brainConn = buildConnections(brain, PARTICLE_COUNT, CONNECTION_DIST, CONNECTION_MAX_PER, CONNECTION_MAX_TOTAL)
  const sphereConn = buildConnections(sphere, PARTICLE_COUNT, CONNECTION_DIST * 1.2, CONNECTION_MAX_PER, Math.floor(CONNECTION_MAX_TOTAL * 0.7))

  // Precompute particle data
  const rng = mulberry32(SEED + 99)
  const particleColors = new Float32Array(PARTICLE_COUNT * 3)
  const particleSizes = new Float32Array(PARTICLE_COUNT)
  const stagger = new Float32Array(PARTICLE_COUNT)
  const spinRates = new Float32Array(PARTICLE_COUNT)
  const basisU = new Float32Array(PARTICLE_COUNT * 3)
  const basisV = new Float32Array(PARTICLE_COUNT * 3)
  const scatterPos = new Float32Array(PARTICLE_COUNT * 3)
  const delays = new Float32Array(PARTICLE_COUNT)
  const turbDir = new Float32Array(PARTICLE_COUNT * 3)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Color
    const r = rng()
    let acc = 0
    let colorIdx = 0
    for (let c = 0; c < COLOR_WEIGHTS.length; c++) {
      acc += COLOR_WEIGHTS[c]
      if (r <= acc) { colorIdx = c; break }
    }
    const [cr, cg, cb] = srgbToLinear(COLORS[colorIdx])
    const bright = 0.6 + rng() * 0.4
    particleColors[i * 3 + 0] = cr * bright
    particleColors[i * 3 + 1] = cg * bright
    particleColors[i * 3 + 2] = cb * bright

    // Size
    particleSizes[i] = 0.018 + rng() * rng() * 0.028
    stagger[i] = rng()
    const dir = rng() > 0.5 ? 1 : -1
    spinRates[i] = dir * (0.15 + rng() * 0.45)

    // Basis vectors
    const nTheta = rng() * Math.PI * 2
    const nPhi = Math.acos(rng() * 2 - 1)
    const nx = Math.sin(nPhi) * Math.cos(nTheta)
    const ny = Math.sin(nPhi) * Math.sin(nTheta)
    const nz = Math.cos(nPhi)
    const tx = Math.abs(ny) < 0.93 ? 0 : 1
    const ty = Math.abs(ny) < 0.93 ? 1 : 0
    let ux = -nz * ty, uy = nz * tx, uz = nx * ty - ny * tx
    const ul = Math.hypot(ux, uy, uz) || 1
    ux /= ul; uy /= ul; uz /= ul
    basisU[i * 3 + 0] = ux; basisU[i * 3 + 1] = uy; basisU[i * 3 + 2] = uz
    basisV[i * 3 + 0] = ny * uz - nz * uy
    basisV[i * 3 + 1] = nz * ux - nx * uz
    basisV[i * 3 + 2] = nx * uy - ny * ux

    // Scatter positions
    const sTheta = rng() * Math.PI * 2
    const sPhi = Math.acos(rng() * 2 - 1)
    const sR = SCATTER_FACTOR * (0.75 + rng() * 0.55)
    scatterPos[i * 3 + 0] = sR * Math.sin(sPhi) * Math.cos(sTheta)
    scatterPos[i * 3 + 1] = sR * Math.sin(sPhi) * Math.sin(sTheta)
    scatterPos[i * 3 + 2] = sR * Math.cos(sPhi)

    // Turbulence direction
    const tTheta = rng() * Math.PI * 2
    const tPhi = Math.acos(rng() * 2 - 1)
    turbDir[i * 3 + 0] = Math.sin(tPhi) * Math.cos(tTheta)
    turbDir[i * 3 + 1] = Math.sin(tPhi) * Math.sin(tTheta)
    turbDir[i * 3 + 2] = Math.cos(tPhi)

    delays[i] = rng() * rng() * 0.4
  }

  // Ambient particles
  const rngA = mulberry32(SEED + 999)
  const ambientPositions = new Float32Array(AMBIENT_COUNT * 3)
  const ambientColors = new Float32Array(AMBIENT_COUNT * 3)
  const ambientSizes = new Float32Array(AMBIENT_COUNT)
  const ambientBasisU = new Float32Array(AMBIENT_COUNT * 3)
  const ambientBasisV = new Float32Array(AMBIENT_COUNT * 3)
  const ambientSpins = new Float32Array(AMBIENT_COUNT)

  for (let i = 0; i < AMBIENT_COUNT; i++) {
    const theta = rngA() * Math.PI * 2
    const phi = Math.acos(rngA() * 2 - 1)
    const r = 1.3 + rngA() * 1.0
    ambientPositions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
    ambientPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85
    ambientPositions[i * 3 + 2] = r * Math.cos(phi) * 0.55

    const [cr, cg, cb] = srgbToLinear(COLORS[Math.floor(rngA() * COLORS.length)])
    ambientColors[i * 3 + 0] = cr * (0.12 + rngA() * 0.18)
    ambientColors[i * 3 + 1] = cg * (0.12 + rngA() * 0.18)
    ambientColors[i * 3 + 2] = cb * (0.12 + rngA() * 0.18)

    ambientSizes[i] = 0.014 + rngA() * 0.022

    const nTheta = rngA() * Math.PI * 2
    const nPhi = Math.acos(rngA() * 2 - 1)
    const nx = Math.sin(nPhi) * Math.cos(nTheta)
    const ny = Math.sin(nPhi) * Math.sin(nTheta)
    const nz = Math.cos(nPhi)
    const tx = Math.abs(ny) < 0.93 ? 0 : 1
    const ty = Math.abs(ny) < 0.93 ? 1 : 0
    let ux = -nz * ty, uy = nz * tx, uz = nx * ty - ny * tx
    const ul = Math.hypot(ux, uy, uz) || 1
    ux /= ul; uy /= ul; uz /= ul
    ambientBasisU[i * 3 + 0] = ux; ambientBasisU[i * 3 + 1] = uy; ambientBasisU[i * 3 + 2] = uz
    ambientBasisV[i * 3 + 0] = ny * uz - nz * uy
    ambientBasisV[i * 3 + 1] = nz * ux - nx * uz
    ambientBasisV[i * 3 + 2] = nx * uy - ny * ux

    const dir = rngA() > 0.5 ? 1 : -1
    ambientSpins[i] = dir * (0.08 + rngA() * 0.2)
  }

  // Three.js setup
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance',
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const group = new THREE.Group()
  scene.add(group)

  // Particle triangles mesh
  const triGeo = new THREE.BufferGeometry()
  const triPos = new Float32Array(PARTICLE_COUNT * 9)
  const triCol = new Float32Array(PARTICLE_COUNT * 9)
  const posAttr = new THREE.BufferAttribute(triPos, 3)
  const colAttr = new THREE.BufferAttribute(triCol, 3)
  triGeo.setAttribute('position', posAttr)
  triGeo.setAttribute('color', colAttr)
  const triMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  })
  const triMesh = new THREE.Mesh(triGeo, triMat)
  group.add(triMesh)

  // Connection lines - two meshes for crossfading
  const maxPairs = Math.max(brainConn.length, sphereConn.length) / 2
  const lineGeoA = new THREE.BufferGeometry()
  const linePosA = new Float32Array(maxPairs * 6)
  const lineColA = new Float32Array(maxPairs * 6)
  lineGeoA.setAttribute('position', new THREE.BufferAttribute(linePosA, 3))
  lineGeoA.setAttribute('color', new THREE.BufferAttribute(lineColA, 3))

  const lineGeoB = new THREE.BufferGeometry()
  const linePosB = new Float32Array(maxPairs * 6)
  const lineColB = new Float32Array(maxPairs * 6)
  lineGeoB.setAttribute('position', new THREE.BufferAttribute(linePosB, 3))
  lineGeoB.setAttribute('color', new THREE.BufferAttribute(lineColB, 3))

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  group.add(new THREE.LineSegments(lineGeoA, lineMat))
  group.add(new THREE.LineSegments(lineGeoB, lineMat))

  // Ambient dust
  const dustGeo = new THREE.BufferGeometry()
  const dustPos = new Float32Array(AMBIENT_COUNT * 9)
  const dustCol = new Float32Array(AMBIENT_COUNT * 9)
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
  dustGeo.setAttribute('color', new THREE.BufferAttribute(dustCol, 3))
  const dustMesh = new THREE.Mesh(dustGeo, triMat)
  scene.add(dustMesh)

  // Dynamic sizing
  let shapeUnit = 1.0
  let halfW = 4.0, halfH = 3.73

  const updateSize = () => {
    width = window.innerWidth
    height = window.innerHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    halfH = Math.tan((50 * 0.5 * Math.PI) / 180) * 5
    halfW = halfH * camera.aspect
    shapeUnit = Math.max(0.5, Math.min(1.3, halfW * 0.22))
  }
  updateSize()

  // Mouse/interaction state
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 }
  const repel = { x: 999, y: 999, active: false }

  const onMouseMove = (e: MouseEvent) => {
    const nx = (e.clientX / width) * 2 - 1
    const ny = -(e.clientY / height) * 2 + 1
    mouse.targetX = nx * halfW
    mouse.targetY = ny * halfH
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('resize', updateSize, { passive: true })

  // Computed centers
  const centers = new Float32Array(PARTICLE_COUNT * 3)
  const dustCenters = new Float32Array(AMBIENT_COUNT * 3)

  // Animation state
  let simTime = 0
  let prevTime = performance.now()
  let morphPhase = 0
  let targetMorph = 0

  // Scroll-driven morphing
  const getScrollTarget = () => {
    const span = Math.max(1, window.innerHeight * 3)
    return Math.max(0, Math.min(1, window.scrollY / span))
  }

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
    time: number
  ) {
    const bScale = 1 + breatheAmp * Math.sin(time * breatheFreq)
    const SQRT3 = 1.732050808
    for (let i = 0; i < count; i++) {
      const cx = centers[i * 3], cy = centers[i * 3 + 1], cz = centers[i * 3 + 2]
      const r = sizes[i] * bScale
      const angle = time * spinRates[i]
      const cosA = Math.cos(angle), sinA = Math.sin(angle)

      const ux = basisU[i * 3], uy = basisU[i * 3 + 1], uz = basisU[i * 3 + 2]
      const vx = basisV[i * 3], vy = basisV[i * 3 + 1], vz = basisV[i * 3 + 2]

      const rx = (ux * cosA + vx * sinA) * r
      const ry = (uy * cosA + vy * sinA) * r
      const rz = (uz * cosA + vz * sinA) * r
      const sx = (-ux * sinA + vx * cosA) * r
      const sy = (-uy * sinA + vy * cosA) * r
      const sz = (-uz * sinA + vz * cosA) * r

      const v0 = i * 9
      positions[v0] = cx + ry
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
    time: number,
    freq: number
  ) {
    const arr = colorAttr.array as Float32Array
    for (let i = 0; i < count; i++) {
      const tw = 0.82 + 0.18 * Math.sin(time * freq + stagger[i] * Math.PI * 2)
      const r = baseColors[i * 3] * tw
      const g = baseColors[i * 3 + 1] * tw
      const b = baseColors[i * 3 + 2] * tw
      const v0 = i * 9
      arr[v0] = r; arr[v0 + 1] = g; arr[v0 + 2] = b
      arr[v0 + 3] = r; arr[v0 + 4] = g; arr[v0 + 5] = b
      arr[v0 + 6] = r; arr[v0 + 7] = g; arr[v0 + 8] = b
    }
    colorAttr.needsUpdate = true
  }

  function updateLines(
    geo: THREE.BufferGeometry,
    pairs: Uint32Array,
    weight: number
  ) {
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
    const colAttr = geo.getAttribute('color') as THREE.BufferAttribute
    const pArr = posAttr.array as Float32Array
    const cArr = colAttr.array as Float32Array
    const nPairs = Math.floor(pairs.length / 2)

    if (weight < 0.005 || nPairs === 0) {
      geo.setDrawRange(0, 0)
      return
    }

    const linkDist = CONNECTION_DIST * shapeUnit * 1.3
    const fadeStart = linkDist * 1.1
    const fadeRange = linkDist * 1.3

    for (let p = 0; p < nPairs; p++) {
      const i0 = pairs[p * 2], i1 = pairs[p * 2 + 1]
      const x0 = centers[i0 * 3], y0 = centers[i0 * 3 + 1], z0 = centers[i0 * 3 + 2]
      const x1 = centers[i1 * 3], y1 = centers[i1 * 3 + 1], z1 = centers[i1 * 3 + 2]
      const v0 = p * 6
      pArr[v0] = x0; pArr[v0 + 1] = y0; pArr[v0 + 2] = z0
      pArr[v0 + 3] = x1; pArr[v0 + 4] = y1; pArr[v0 + 5] = z1

      const dist = Math.hypot(x1 - x0, y1 - y0, z1 - z0)
      const fade = 1 - Math.max(0, Math.min(1, (dist - fadeStart) / fadeRange))
      const alpha = Math.max(0, fade * weight)
      const bright = (0.08 + (p * 17 % 100) * 0.001) * alpha

      cArr[v0] = IRIS_LINEAR[0] * bright
      cArr[v0 + 1] = IRIS_LINEAR[1] * bright
      cArr[v0 + 2] = IRIS_LINEAR[2] * bright
      cArr[v0 + 3] = IRIS_LINEAR[0] * bright
      cArr[v0 + 4] = IRIS_LINEAR[1] * bright
      cArr[v0 + 5] = IRIS_LINEAR[2] * bright
    }
    posAttr.needsUpdate = true
    colAttr.needsUpdate = true
    geo.setDrawRange(0, nPairs * 2)
  }

  const step = (dt: number) => {
    simTime += dt
    targetMorph = getScrollTarget()
    morphPhase += (targetMorph - morphPhase) * Math.min(1, dt * 5)

    // Smooth mouse
    const pr = Math.min(1, dt * 3.5)
    mouse.x += (mouse.targetX - mouse.x) * pr
    mouse.y += (mouse.targetY - mouse.y) * pr

    // Repel
    const rr = Math.min(1, dt * 10)
    repel.x += (mouse.x - repel.x) * rr
    repel.y += (mouse.y - repel.y) * rr
    repel.active = Math.hypot(repel.x - mouse.x, repel.y - mouse.y) < 50 || Math.abs(repel.x) < 100

    // Morph weight
    const wB = morphPhase * morphPhase * (3 - 2 * morphPhase)
    const wA = 1 - wB

    // Update particle positions
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3

      // Brain position
      const bx = brain[i3] * shapeUnit
      const by = brain[i3 + 1] * shapeUnit
      const bz = brain[i3 + 2] * shapeUnit
      const angle = simTime * 0.1
      const cosT = Math.cos(angle), sinT = Math.sin(angle)
      const bRx = bx * cosT + bz * sinT
      const bRz = -bx * sinT + bz * cosT

      // Sphere position
      const sx = sphere[i3] * shapeUnit * 1.1
      const sy = sphere[i3 + 1] * shapeUnit * 1.1
      const sz = sphere[i3 + 2] * shapeUnit * 1.1

      // Morphed position
      const staggerF = stagger[i]
      const morphStagger = 0.25
      const staggerRange = 1 - morphStagger
      const fi = Math.max(0, Math.min(1, (morphPhase - staggerF * morphStagger) / staggerRange))
      const ei = fi * fi * (3 - 2 * fi)

      let px = bRx + (sx - bRx) * ei
      let py = by + (sy - by) * ei
      let pz = bRz + (sz - bRz) * ei

      // Turbulence
      const turb = Math.sin(Math.PI * fi) * 0.7 * shapeUnit
      px += turbDir[i3] * turb
      py += turbDir[i3 + 1] * turb
      pz += turbDir[i3 + 2] * turb

      // Entrance animation
      const eEnter = Math.max(0, Math.min(1, (simTime - delays[i]) / 2.0))
      const enterEase = eEnter * eEnter * (3 - 2 * eEnter)
      px = scatterPos[i3] * shapeUnit * (1 - enterEase) + px * enterEase
      py = scatterPos[i3 + 1] * shapeUnit * (1 - enterEase) + py * enterEase
      pz = scatterPos[i3 + 2] * shapeUnit * (1 - enterEase) + pz * enterEase

      // Mouse repulsion
      if (repel.active) {
        const dx = px - repel.x
        const dy = py - repel.y
        const d2 = dx * dx + dy * dy
        const r2 = 1.1 * 1.1
        if (d2 < r2 && d2 > 0.0001) {
          const d = Math.sqrt(d2)
          const push = ((Math.sqrt(r2) - d) / Math.sqrt(r2)) * 0.55
          px += (dx / d) * push
          py += (dy / d) * push
        }
      }

      centers[i3] = px
      centers[i3 + 1] = py
      centers[i3 + 2] = pz
    }

    // Update triangle mesh
    writeTriangles(
      triPos, PARTICLE_COUNT, particleSizes, basisU, basisV, centers,
      spinRates, 0.012, 0.55, simTime
    )
    posAttr.needsUpdate = true

    // Update colors
    writeColors(colAttr, PARTICLE_COUNT, particleColors, simTime, 1.3)

    // Update connection lines
    const lineMeshA = group.children[1] as THREE.LineSegments
    const lineMeshB = group.children[2] as THREE.LineSegments
    updateLines(lineMeshA.geometry, brainConn, wA)
    updateLines(lineMeshB.geometry, sphereConn, wB)

    // Parallax tilt
    if (!isMobile) {
      const maxTilt = (8 * Math.PI) / 180
      group.rotation.y = (mouse.x / halfW) * maxTilt
      group.rotation.x = -(mouse.y / halfH) * maxTilt
    }

    // Ambient dust
    for (let i = 0; i < AMBIENT_COUNT; i++) {
      const i3 = i * 3
      let px = ambientPositions[i3]
      let py = ambientPositions[i3 + 1]
      const pz = ambientPositions[i3 + 2]
      px += Math.sin(simTime * 0.3 + i * 0.1) * 0.12
      py += Math.cos(simTime * 0.25 + i * 0.1) * 0.12
      dustCenters[i3] = px
      dustCenters[i3 + 1] = py
      dustCenters[i3 + 2] = pz
    }
    writeTriangles(
      dustPos, AMBIENT_COUNT, ambientSizes, ambientBasisU, ambientBasisV,
      dustCenters, ambientSpins, 0.008, 0.4, simTime
    )
    ;(dustGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    ;(dustGeo.getAttribute('color') as THREE.BufferAttribute).array.set(ambientColors)
    ;(dustGeo.getAttribute('color') as THREE.BufferAttribute).needsUpdate = true
  }

  const frame = (now: number) => {
    const dt = Math.min((now - prevTime) / 1000, 0.1)
    prevTime = now
    step(dt)
    renderer.render(scene, camera)
    requestAnimationFrame(frame)
  }

  if (reducedMotion) {
    step(10.0)
    renderer.render(scene, camera)
    const onScroll = () => {
      morphPhase = getScrollTarget()
      step(0.01)
      renderer.render(scene, camera)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateSize)
      window.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }

  requestAnimationFrame(frame)

  return () => {
    window.removeEventListener('resize', updateSize)
    window.removeEventListener('mousemove', onMouseMove)
    renderer.dispose()
    triGeo.dispose()
    lineGeoA.dispose()
    lineGeoB.dispose()
    dustGeo.dispose()
    triMat.dispose()
    lineMat.dispose()
    if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
  }
}
