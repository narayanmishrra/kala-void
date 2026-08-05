'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * DALA — https://dala.craftedbygc.com inspired
 * FIXED: particles vanished due to zIndex -1 + ShaderMaterial compile issues
 * Now:
 * - fixed container zIndex 0 (visible) + canvas 100%
 * - MeshBasicMaterial (no custom shader) guaranteed visible
 * - triangle shards + halo glow + connection web
 * - shapes: organic brain → disperse → bulb → globe with scroll morph
 */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}
function srgbToLinear(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex)
  const lin = (s: number) => (s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4))
  return [lin(r), lin(g), lin(b)]
}

const PALETTE = ['#d8c7ff', '#a387ff', '#8052ff', '#ffb957', '#6ee5d0', '#ff8fb8', '#7bd8ff']
const WEIGHTS = [0.22, 0.26, 0.20, 0.08, 0.08, 0.08, 0.08]
const IRIS = hexToRgb('#8a5cff')

// Brain math — two lobes + fissure + wrinkle
const RX = 1.62, RY = 1.08, RZ = 0.74, HZ = 0.36
function hemiDist(x: number, y: number, z: number, side: 1 | -1) {
  const az = z - side * HZ, ay = y - 0.04
  return Math.sqrt((x * x) / (RX * RX) + (ay * ay) / (RY * RY) + (az * az) / (RZ * RZ))
}
function cereDist(x: number, y: number, z: number) {
  const cx = (x + 1.05) / 0.5, cy = (y + 0.52) / 0.38, cz = z / 0.44
  return Math.sqrt(cx * cx + cy * cy + cz * cz)
}
function brainDist(x: number, y: number, z: number) {
  return Math.min(hemiDist(x, y, z, 1), hemiDist(x, y, z, -1), cereDist(x, y, z))
}
function wrinkle(x: number, y: number, z: number) {
  return Math.sin(5.7 * x + 1.2 * z) * Math.sin(4.6 * y + 2.3 * x) * Math.sin(3.8 * z + y) * Math.cos(6.9 * x * 0.6)
}
function inFissure(y: number, z: number) {
  if (y <= -0.48) return false
  return Math.abs(z) < 0.105 + 0.07 * Math.max(0, y)
}

function sampleBrain(count: number, seed: number) {
  const rng = mulberry32(seed)
  const out = new Float32Array(count * 3)
  let i = 0, tries = 0
  while (i < count && tries < count * 150) {
    tries++
    const x = (rng() * 2 - 1) * 1.82, y = (rng() * 2 - 1) * 1.28, z = (rng() * 2 - 1) * 1.3
    if (inFissure(y, z)) continue
    const lim = 1 + 0.11 * wrinkle(x, y, z)
    const d = brainDist(x, y, z)
    if (d > lim) continue
    if (rng() < 0.8 && d < 0.66 * lim) continue
    out[i * 3] = x / 1.55; out[i * 3 + 1] = y / 1.55; out[i * 3 + 2] = z / 1.55; i++
  }
  while (i < count) { out[i * 3] = (rng() * 2 - 1); out[i * 3 + 1] = (rng() * 2 - 1) * 0.9; out[i * 3 + 2] = (rng() * 2 - 1) * 0.7; i++ }
  return out
}
function sampleDisperse(count: number, seed: number) {
  const rng = mulberry32(seed)
  const out = new Float32Array(count * 3)
  const clusters: [number, number, number][] = []
  for (let c = 0; c < 9; c++) clusters.push([(rng() * 2 - 1) * 0.95, (rng() * 2 - 1) * 0.9, (rng() * 2 - 1) * 0.5])
  for (let i = 0; i < count; i++) {
    let x, y, z
    if (rng() < 0.35) {
      const cl = clusters[Math.floor(rng() * clusters.length)]
      const j = rng() + rng() + rng() - 1.5
      x = cl[0] + j * 0.32; y = cl[1] + j * 0.32; z = cl[2] + j * 0.18
    } else {
      x = (rng() * 2 - 1) * 1.25; y = (rng() * 2 - 1) * 1.15; z = (rng() * 2 - 1) * 0.7
    }
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z
  }
  return out
}
function sampleBulb(count: number, seed: number) {
  const rng = mulberry32(seed)
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = rng()
    let x = 0, y = 0, z = 0
    if (r < 0.68) {
      // upper glass sphere hollow shell centred (0,0.42,0) R 0.78
      let tries = 0
      while (tries < 30) {
        tries++
        const u = rng(), v = rng()
        const theta = 2 * Math.PI * u
        const phi = Math.acos(2 * v - 1)
        const R = 0.78 * (0.88 + rng() * 0.20)
        const sx = R * Math.sin(phi) * Math.cos(theta)
        const sy = R * Math.sin(phi) * Math.sin(theta)
        const sz = R * Math.cos(phi)
        if (R < 0.42 && rng() < 0.92) continue
        y = sy * 0.92 + 0.42
        if (y < -0.12) continue
        x = sx; z = sz; break
      }
    } else if (r < 0.86) {
      y = -0.62 + rng() * 0.72
      const t = (y + 0.62) / 0.72
      const rMax = 0.20 + t * 0.22
      const th = rng() * Math.PI * 2
      const rr = rMax * (0.78 + rng() * 0.32)
      x = Math.cos(th) * rr; z = Math.sin(th) * rr
    } else if (r < 0.97) {
      y = -0.98 + rng() * 0.38
      const th = rng() * Math.PI * 2
      const thread = 0.025 * Math.sin(y * 44)
      const rBase = 0.31 + thread
      const rr = rBase * (0.75 + rng() * 0.35)
      x = Math.cos(th) * rr; z = Math.sin(th) * rr
    } else {
      y = -1.06 + rng() * 0.16
      const th = rng() * Math.PI * 2
      const rr = 0.14 * Math.sqrt(rng())
      x = Math.cos(th) * rr; z = Math.sin(th) * rr
    }
    out[i * 3] = x; out[i * 3 + 1] = y; out[i * 3 + 2] = z
  }
  return out
}
function sampleGlobe(count: number) {
  const rng = mulberry32(4242)
  const out = new Float32Array(count * 3)
  const shell = Math.floor(count * 0.86)
  const g = 2.3999632297
  for (let i = 0; i < count; i++) {
    if (i < shell) {
      const y = 1 - (i / Math.max(1, shell - 1)) * 2
      const rad = Math.sqrt(Math.max(0, 1 - y * y))
      const th = i * g
      out[i * 3] = Math.cos(th) * rad * (0.96 + (rng() - 0.5) * 0.08)
      out[i * 3 + 1] = y * (0.98 + (rng() - 0.5) * 0.05)
      out[i * 3 + 2] = Math.sin(th) * rad * (0.96 + (rng() - 0.5) * 0.08)
    } else {
      const R = Math.cbrt(rng()) * 0.84
      const th = rng() * Math.PI * 2, ph = Math.acos(rng() * 2 - 1)
      out[i * 3] = R * Math.sin(ph) * Math.cos(th)
      out[i * 3 + 1] = R * Math.sin(ph) * Math.sin(th)
      out[i * 3 + 2] = R * Math.cos(ph)
    }
  }
  return out
}

function buildConnections(pos: Float32Array, cnt: number, maxDist: number, maxPer: number, maxTot: number) {
  const cell = maxDist
  const buckets = new Map<number, number[]>()
  const key = (ix: number, iy: number, iz: number) => (ix + 512) + (iy + 512) * 2048 + (iz + 512) * 2048 * 2048
  for (let i = 0; i < cnt; i++) {
    const ix = Math.floor(pos[i * 3] / cell), iy = Math.floor(pos[i * 3 + 1] / cell), iz = Math.floor(pos[i * 3 + 2] / cell)
    const k = key(ix, iy, iz)
    const b = buckets.get(k); if (b) b.push(i); else buckets.set(k, [i])
  }
  const deg = new Uint16Array(cnt)
  const tmp: number[] = []
  const maxD2 = maxDist * maxDist
  for (let i = 0; i < cnt && tmp.length / 2 < maxTot; i++) {
    if (deg[i] >= maxPer) continue
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2]
    const ix = Math.floor(x / cell), iy = Math.floor(y / cell), iz = Math.floor(z / cell)
    for (let dx = -1; dx <= 1 && tmp.length / 2 < maxTot; dx++) for (let dy = -1; dy <= 1 && tmp.length / 2 < maxTot; dy++) for (let dz = -1; dz <= 1 && tmp.length / 2 < maxTot; dz++) {
      const buck = buckets.get(key(ix + dx, iy + dy, iz + dz)); if (!buck) continue
      for (let b = 0; b < buck.length; b++) {
        const j = buck[b]; if (j <= i || deg[j] >= maxPer) continue
        const ddx = x - pos[j * 3], ddy = y - pos[j * 3 + 1], ddz = z - pos[j * 3 + 2]
        if (ddx * ddx + ddy * ddy + ddz * ddz > maxD2) continue
        tmp.push(i, j); deg[i]++; deg[j]++
        if (deg[i] >= maxPer) break
      }
    }
  }
  return Uint32Array.from(tmp)
}

export default function ParticleField() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const cleanup = initDalaField(ref.current)
    return () => cleanup?.()
  }, [])
  // NOTE: zIndex 0 not -1 — -1 puts canvas behind body background and appears vanished
  return <div ref={ref} aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#000', overflow: 'hidden' }} />
}

function initDalaField(container: HTMLDivElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isMobile = window.innerWidth < 768
  const COUNT = isMobile ? 1800 : 3000
  const AMBIENT = isMobile ? 160 : 340
  const CONN_D = 0.20
  const CONN_PER = 3
  const CONN_TOT = isMobile ? 1800 : 3400
  const SCATTER = 5.2
  const SEED = 1337

  // shapes
  const brain = sampleBrain(COUNT, SEED)
  const disp = sampleDisperse(COUNT, SEED + 21)
  const bulb = sampleBulb(COUNT, SEED + 33)
  const globe = sampleGlobe(COUNT)
  const shapes = [brain, disp, bulb, globe]
  const conns = [
    buildConnections(brain, COUNT, CONN_D, CONN_PER, CONN_TOT),
    buildConnections(disp, COUNT, CONN_D * 1.22, 2, Math.floor(CONN_TOT * 0.34)),
    buildConnections(bulb, COUNT, CONN_D * 1.08, CONN_PER, Math.floor(CONN_TOT * 0.88)),
    buildConnections(globe, COUNT, CONN_D * 1.18, CONN_PER, Math.floor(CONN_TOT * 0.7)),
  ]
  const rotSpd = [0.065, 0.018, 0.10, 0.12]

  const rng = mulberry32(SEED + 99)
  const col = new Float32Array(COUNT * 3)
  const size = new Float32Array(COUNT)
  const stagger = new Float32Array(COUNT)
  const spin = new Float32Array(COUNT)
  const tw = new Float32Array(COUNT)
  const ang0 = new Float32Array(COUNT)
  const scatter = new Float32Array(COUNT * 3)
  const turb = new Float32Array(COUNT * 3)
  const delay = new Float32Array(COUNT)
  const bU = new Float32Array(COUNT * 3)
  const bV = new Float32Array(COUNT * 3)

  for (let i = 0; i < COUNT; i++) {
    const rr = rng()
    let acc = 0, idx = 0
    for (let c = 0; c < WEIGHTS.length; c++) { acc += WEIGHTS[c]; if (rr <= acc) { idx = c; break } }
    const [r, g, b] = hexToRgb(PALETTE[idx])
    const bright = 0.85 + rng() * 0.45
    col[i * 3] = r * bright; col[i * 3 + 1] = g * bright; col[i * 3 + 2] = b * bright

    stagger[i] = rng()
    ang0[i] = rng() * Math.PI * 2
    tw[i] = rng() * Math.PI * 2
    delay[i] = Math.pow(rng(), 1.35) * 0.95
    size[i] = 0.018 + rng() * rng() * 0.062

    const dir = rng() > 0.5 ? 1 : -1
    spin[i] = dir * (0.25 + rng() * 0.7)

    const th = rng() * Math.PI * 2, ph = Math.acos(rng() * 2 - 1), R = SCATTER * (0.7 + rng() * 0.7)
    scatter[i * 3] = R * Math.sin(ph) * Math.cos(th)
    scatter[i * 3 + 1] = R * Math.sin(ph) * Math.sin(th)
    scatter[i * 3 + 2] = R * Math.cos(ph)

    const tth = rng() * Math.PI * 2, tph = Math.acos(rng() * 2 - 1)
    turb[i * 3] = Math.sin(tph) * Math.cos(tth)
    turb[i * 3 + 1] = Math.sin(tph) * Math.sin(tth)
    turb[i * 3 + 2] = Math.cos(tph)

    const nTh = rng() * Math.PI * 2, nPh = Math.acos(rng() * 2 - 1)
    const nx = Math.sin(nPh) * Math.cos(nTh), ny = Math.sin(nPh) * Math.sin(nTh), nz = Math.cos(nPh)
    const tx = Math.abs(ny) < 0.9 ? 0 : 1, ty = Math.abs(ny) < 0.9 ? 1 : 0
    let ux = -nz * ty, uy = nz * tx, uz = nx * ty - ny * tx
    const ul = Math.hypot(ux, uy, uz) || 1; ux /= ul; uy /= ul; uz /= ul
    const vx = ny * uz - nz * uy, vy = nz * ux - nx * uz, vz = nx * uy - ny * ux
    bU[i * 3] = ux; bU[i * 3 + 1] = uy; bU[i * 3 + 2] = uz
    bV[i * 3] = vx; bV[i * 3 + 1] = vy; bV[i * 3 + 2] = vz
  }

  // ambient dust
  const rngA = mulberry32(SEED + 777)
  const ambPos = new Float32Array(AMBIENT * 3)
  const ambCol = new Float32Array(AMBIENT * 3)
  const ambPh = new Float32Array(AMBIENT)
  for (let i = 0; i < AMBIENT; i++) {
    const th = rngA() * Math.PI * 2, ph = Math.acos(rngA() * 2 - 1), R = 1.8 + rngA() * 1.8
    ambPos[i * 3] = R * Math.sin(ph) * Math.cos(th)
    ambPos[i * 3 + 1] = R * Math.sin(ph) * Math.sin(th) * 0.9
    ambPos[i * 3 + 2] = R * Math.cos(ph) * 0.6
    const [r, g, b] = hexToRgb(PALETTE[Math.floor(rngA() * PALETTE.length)])
    const br = 0.12 + rngA() * 0.18
    ambCol[i * 3] = r * br; ambCol[i * 3 + 1] = g * br; ambCol[i * 3 + 2] = b * br
    ambPh[i] = rngA() * Math.PI * 2
  }

  // THREE
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 80)
  camera.position.set(0, 0, 5)
  const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: !isMobile, powerPreference: 'high-performance' })
  renderer.setClearColor(0x000000, 1)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'
  container.appendChild(renderer.domElement)

  const group = new THREE.Group()
  scene.add(group)

  // TRIANGLES — use MeshBasicMaterial (guaranteed visible, no shader compile fail)
  const triVert = COUNT * 3
  const triPos = new Float32Array(triVert * 3)
  const triCol = new Float32Array(triVert * 3)
  const triGeo = new THREE.BufferGeometry()
  triGeo.setAttribute('position', new THREE.BufferAttribute(triPos, 3))
  triGeo.setAttribute('color', new THREE.BufferAttribute(triCol, 3))
  const triMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  const triMesh = new THREE.Mesh(triGeo, triMat)
  triMesh.frustumCulled = false
  group.add(triMesh)

  // HALO — larger, dimmer, for glow
  const haloPos = new Float32Array(triVert * 3)
  const haloCol = new Float32Array(triVert * 3)
  const haloGeo = new THREE.BufferGeometry()
  haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos, 3))
  haloGeo.setAttribute('color', new THREE.BufferAttribute(haloCol, 3))
  const haloMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthTest: false,
  })
  const haloMesh = new THREE.Mesh(haloGeo, haloMat)
  haloMesh.frustumCulled = false
  group.add(haloMesh)

  // LINES
  const maxPairs = Math.max(...conns.map(c => c.length)) / 2
  const lPosA = new Float32Array(Math.max(1, maxPairs) * 6)
  const lColA = new Float32Array(Math.max(1, maxPairs) * 6)
  const lPosB = new Float32Array(Math.max(1, maxPairs) * 6)
  const lColB = new Float32Array(Math.max(1, maxPairs) * 6)
  const lGeoA = new THREE.BufferGeometry()
  lGeoA.setAttribute('position', new THREE.BufferAttribute(lPosA, 3))
  lGeoA.setAttribute('color', new THREE.BufferAttribute(lColA, 3))
  const lGeoB = new THREE.BufferGeometry()
  lGeoB.setAttribute('position', new THREE.BufferAttribute(lPosB, 3))
  lGeoB.setAttribute('color', new THREE.BufferAttribute(lColB, 3))
  const lMatA = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.38, depthWrite: false, blending: THREE.AdditiveBlending })
  const lMatB = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.38, depthWrite: false, blending: THREE.AdditiveBlending })
  const lineA = new THREE.LineSegments(lGeoA, lMatA)
  const lineB = new THREE.LineSegments(lGeoB, lMatB)
  lineA.frustumCulled = false; lineB.frustumCulled = false
  group.add(lineA, lineB)

  // DUST as Points
  const dPos = new Float32Array(AMBIENT * 3)
  const dCol = new Float32Array(AMBIENT * 3)
  const dGeo = new THREE.BufferGeometry()
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3))
  dGeo.setAttribute('color', new THREE.BufferAttribute(dCol, 3))
  const dMat = new THREE.PointsMaterial({ size: 1.8, vertexColors: true, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true })
  const dust = new THREE.Points(dGeo, dMat)
  dust.frustumCulled = false
  scene.add(dust)

  // sizing
  let W = window.innerWidth, H = window.innerHeight, halfW = 4, halfH = 3, unit = 1
  const updSize = () => {
    W = window.innerWidth; H = window.innerHeight
    camera.aspect = W / H; camera.updateProjectionMatrix()
    renderer.setSize(W, H, false)
    const vFOV = (camera.fov * Math.PI) / 180
    halfH = Math.tan(vFOV * 0.5) * 5
    halfW = halfH * camera.aspect
    unit = Math.max(0.58, Math.min(isMobile ? 1.05 : 1.4, halfW * (isMobile ? 0.30 : 0.25)))
  }
  updSize()
  window.addEventListener('resize', updSize, { passive: true })

  // mouse
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
  const repel = { x: 999, y: 999, active: false }
  const onMM = (e: MouseEvent) => {
    const nx = (e.clientX / W) * 2 - 1, ny = -(e.clientY / H) * 2 + 1
    mouse.tx = nx * halfW; mouse.ty = ny * halfH
  }
  window.addEventListener('mousemove', onMM, { passive: true })

  const centers = new Float32Array(COUNT * 3)
  const dustC = new Float32Array(AMBIENT * 3)

  let t = 0, prev = performance.now(), morph = 0, target = 0
  const getTarget = () => {
    const doc = document.documentElement
    const tot = doc.scrollHeight - window.innerHeight
    if (tot <= window.innerHeight * 0.6) {
      const span = Math.max(1, window.innerHeight * 4.2)
      return Math.max(0, Math.min(1, window.scrollY / span))
    }
    return Math.max(0, Math.min(1, window.scrollY / tot))
  }
  const rotAt = (shape: Float32Array, i: number, ang: number, su: number): [number, number, number] => {
    const i3 = i * 3, lx = shape[i3], ly = shape[i3 + 1], lz = shape[i3 + 2]
    const ca = Math.cos(ang), sa = Math.sin(ang)
    return [(lx * ca + lz * sa) * su, ly * su, (-lx * sa + lz * ca) * su]
  }
  const updLines = (geo: THREE.BufferGeometry, pairs: Uint32Array, w: number, su: number) => {
    const pA = geo.getAttribute('position') as THREE.BufferAttribute
    const cA = geo.getAttribute('color') as THREE.BufferAttribute
    const pArr = pA.array as Float32Array, cArr = cA.array as Float32Array
    const n = pairs.length / 2
    if (w < 0.008 || n === 0) { geo.setDrawRange(0, 0); return }
    const link = 0.20 * su * 1.55, start = link * 0.78, range = link * 0.95
    for (let p = 0; p < n; p++) {
      const a = pairs[p * 2], b = pairs[p * 2 + 1]
      const ax = centers[a * 3], ay = centers[a * 3 + 1], az = centers[a * 3 + 2]
      const bx = centers[b * 3], by = centers[b * 3 + 1], bz = centers[b * 3 + 2]
      const v0 = p * 6
      pArr[v0] = ax; pArr[v0 + 1] = ay; pArr[v0 + 2] = az
      pArr[v0 + 3] = bx; pArr[v0 + 4] = by; pArr[v0 + 5] = bz
      const dist = Math.hypot(bx - ax, by - ay, bz - az)
      const fade = 1 - Math.max(0, Math.min(1, (dist - start) / range))
      const alpha = Math.max(0, fade * w)
      const base = 0.22 + (p % 7) * 0.014
      const rr = IRIS[0] * base * alpha, gg = IRIS[1] * base * alpha, bb = IRIS[2] * base * alpha
      cArr[v0] = rr; cArr[v0 + 1] = gg; cArr[v0 + 2] = bb
      cArr[v0 + 3] = rr; cArr[v0 + 4] = gg; cArr[v0 + 5] = bb
    }
    pA.needsUpdate = true; cA.needsUpdate = true; geo.setDrawRange(0, n * 2)
  }

  let raf = 0
  const step = (dt: number) => {
    t += dt
    target = getTarget()
    const k = reduced ? 1 : Math.min(1, dt * 3.0); morph += (target - morph) * k
    const mk = Math.min(1, dt * 4.5); mouse.x += (mouse.tx - mouse.x) * mk; mouse.y += (mouse.ty - mouse.y) * mk
    const rk = Math.min(1, dt * 10); repel.x += (mouse.x - repel.x) * rk; repel.y += (mouse.y - repel.y) * rk
    repel.active = Math.hypot(repel.x - mouse.x, repel.y - mouse.y) < 80 || Math.abs(repel.x) < halfW * 0.94

    const states = shapes.length, sf = morph * (states - 1), sa = Math.min(Math.floor(sf), states - 2), sb = sa + 1
    const fRaw = Math.max(0, Math.min(1, sf - sa))
    const wB = fRaw * fRaw * (3 - 2 * fRaw), wA = 1 - wB

    for (let i = 0; i < COUNT; i++) {
      const angA = t * rotSpd[sa] + ang0[i] * 0.15, angB = t * rotSpd[sb] + ang0[i] * 0.15
      const [ax, ay, az] = rotAt(shapes[sa], i, angA, unit)
      const [bx, by, bz] = rotAt(shapes[sb], i, angB, unit)
      const st = stagger[i], mStag = 0.38
      const fi = Math.max(0, Math.min(1, (fRaw - st * mStag) / (1 - mStag)))
      const ei = fi * fi * (3 - 2 * fi)

      let px = ax + (bx - ax) * ei, py = ay + (by - ay) * ei, pz = az + (bz - az) * ei

      const sw = Math.sin(Math.PI * fi)
      const turbAmp = sw * 0.68 * unit
      px += turb[i * 3] * turbAmp
      py += turb[i * 3 + 1] * turbAmp
      pz += turb[i * 3 + 2] * turbAmp * 0.6

      const sw2 = sw * 0.22 * unit
      px += Math.sin(t * 0.9 + ang0[i]) * sw2 * 0.6
      py += Math.cos(t * 0.85 + ang0[i] * 1.3) * sw2 * 0.6
      pz += Math.sin(t * 0.7 + ang0[i] * 0.7) * sw2 * 0.45

      const eE = Math.max(0, Math.min(1, (t - delay[i]) / 2.0))
      const ease = eE < 0.5 ? 4 * eE * eE * eE : 1 - Math.pow(-2 * eE + 2, 3) / 2
      const sx = scatter[i * 3] * unit, sy = scatter[i * 3 + 1] * unit, sz = scatter[i * 3 + 2] * unit
      px = sx * (1 - ease) + px * ease; py = sy * (1 - ease) + py * ease; pz = sz * (1 - ease) + pz * ease

      if (repel.active) {
        const dx = px - repel.x, dy = py - repel.y, d2 = dx * dx + dy * dy, R = 1.42, R2 = R * R
        if (d2 < R2 && d2 > 0.0006) {
          const d = Math.sqrt(d2), push = (Math.sqrt(R2) - d) / Math.sqrt(R2)
          const pp = push * push * 1.45
          px += (dx / d) * pp; py += (dy / d) * pp; pz += pp * 0.28
        }
      }
      centers[i * 3] = px; centers[i * 3 + 1] = py; centers[i * 3 + 2] = pz

      const ang = t * spin[i] + ang0[i]
      const ca = Math.cos(ang), saS = Math.sin(ang)
      const ux = bU[i * 3], uy = bU[i * 3 + 1], uz = bU[i * 3 + 2]
      const vx = bV[i * 3], vy = bV[i * 3 + 1], vz = bV[i * 3 + 2]
      const rUx = ux * ca + vx * saS, rUy = uy * ca + vy * saS, rUz = uz * ca + vz * saS
      const rVx = -ux * saS + vx * ca, rVy = -uy * saS + vy * ca, rVz = -uz * saS + vz * ca

      const breath = 1 + 0.20 * Math.sin(t * 1.25 + tw[i])
      const szTri = size[i] * unit * breath
      const szH = szTri * 2.4

      const base = i * 9
      triPos[base] = px + rUx * szTri; triPos[base + 1] = py + rUy * szTri; triPos[base + 2] = pz + rUz * szTri
      triPos[base + 3] = px + (-0.5 * rUx + 0.8660254 * rVx) * szTri; triPos[base + 4] = py + (-0.5 * rUy + 0.8660254 * rVy) * szTri; triPos[base + 5] = pz + (-0.5 * rUz + 0.8660254 * rVz) * szTri
      triPos[base + 6] = px + (-0.5 * rUx - 0.8660254 * rVx) * szTri; triPos[base + 7] = py + (-0.5 * rUy - 0.8660254 * rVy) * szTri; triPos[base + 8] = pz + (-0.5 * rUz - 0.8660254 * rVz) * szTri

      haloPos[base] = px + rUx * szH; haloPos[base + 1] = py + rUy * szH; haloPos[base + 2] = pz + rUz * szH
      haloPos[base + 3] = px + (-0.5 * rUx + 0.8660254 * rVx) * szH; haloPos[base + 4] = py + (-0.5 * rUy + 0.8660254 * rVy) * szH; haloPos[base + 5] = pz + (-0.5 * rUz + 0.8660254 * rVz) * szH
      haloPos[base + 6] = px + (-0.5 * rUx - 0.8660254 * rVx) * szH; haloPos[base + 7] = py + (-0.5 * rUy - 0.8660254 * rVy) * szH; haloPos[base + 8] = pz + (-0.5 * rUz - 0.8660254 * rVz) * szH

      const bright = 0.78 + 0.32 * Math.sin(t * 2.1 + tw[i])
      const rC = col[i * 3] * bright * (0.55 + 0.45 * ease)
      const gC = col[i * 3 + 1] * bright * (0.55 + 0.45 * ease)
      const bC = col[i * 3 + 2] * bright * (0.55 + 0.45 * ease)
      triCol[base] = rC; triCol[base + 1] = gC; triCol[base + 2] = bC
      triCol[base + 3] = rC; triCol[base + 4] = gC; triCol[base + 5] = bC
      triCol[base + 6] = rC; triCol[base + 7] = gC; triCol[base + 8] = bC

      const hr = rC * 0.62, hg = gC * 0.62, hb = bC * 0.62
      haloCol[base] = hr; haloCol[base + 1] = hg; haloCol[base + 2] = hb
      haloCol[base + 3] = hr; haloCol[base + 4] = hg; haloCol[base + 5] = hb
      haloCol[base + 6] = hr; haloCol[base + 7] = hg; haloCol[base + 8] = hb
    }
    ; (triGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
    ; (triGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true
    ; (haloGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
    ; (haloGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true

    updLines(lGeoA, conns[sa], wA, unit)
    updLines(lGeoB, conns[sb], wB, unit)

    if (!isMobile) {
      const maxY = (12 * Math.PI) / 180, maxX = (10 * Math.PI) / 180
      group.rotation.y = (mouse.x / Math.max(0.1, halfW)) * maxY + t * 0.014
      group.rotation.x = -(mouse.y / Math.max(0.1, halfH)) * maxX
      group.rotation.z = (mouse.x / Math.max(0.1, halfW)) * 0.035
    } else {
      group.rotation.y = t * 0.022
    }

    for (let i = 0; i < AMBIENT; i++) {
      const i3 = i * 3
      dustC[i3] = ambPos[i3] * unit + Math.sin(t * 0.24 + ambPh[i]) * 0.15
      dustC[i3 + 1] = ambPos[i3 + 1] * unit + Math.cos(t * 0.20 + ambPh[i]) * 0.12
      dustC[i3 + 2] = ambPos[i3 + 2] * unit + Math.sin(t * 0.16 + ambPh[i] * 1.2) * 0.09
      dCol[i3] = ambCol[i3]; dCol[i3 + 1] = ambCol[i3 + 1]; dCol[i3 + 2] = ambCol[i3 + 2]
    }
    dPos.set(dustC)
    ; (dGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
    ; (dGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true
  }

  // initial fill so first frame visible
  step(0.2)

  const loop = (now: number) => {
    const dt = Math.min((now - prev) / 1000, 0.1); prev = now
    step(dt)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(loop)
  }

  if (reduced) {
    renderer.render(scene, camera)
    const onS = () => { morph = getTarget(); step(0.05); renderer.render(scene, camera) }
    window.addEventListener('scroll', onS, { passive: true })
    return () => {
      window.removeEventListener('scroll', onS)
      window.removeEventListener('resize', updSize); window.removeEventListener('mousemove', onMM)
      cancelAnimationFrame(raf); renderer.dispose()
      triGeo.dispose(); haloGeo.dispose(); lGeoA.dispose(); lGeoB.dispose(); dGeo.dispose()
      triMat.dispose(); haloMat.dispose(); lMatA.dispose(); lMatB.dispose(); dMat.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }

  raf = requestAnimationFrame(loop)
  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', updSize); window.removeEventListener('mousemove', onMM)
    renderer.dispose()
    triGeo.dispose(); haloGeo.dispose(); lGeoA.dispose(); lGeoB.dispose(); dGeo.dispose()
    triMat.dispose(); haloMat.dispose(); lMatA.dispose(); lMatB.dispose(); dMat.dispose()
    if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
  }
}
