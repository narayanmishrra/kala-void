/* ============================================================
   BLCK VOID — lib/particles.ts
   Pure math for the WebGL particle constellation.
   No three.js imports — deterministic, node-testable factories
   that return pre-allocated typed arrays.
   ============================================================ */

// ─── RNG ─────────────────────────────────────────────────────

export type Rng = () => number

/** Deterministic seeded PRNG so every mount renders the same layout. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickWeightedIndex(rng: Rng, weights: readonly number[]): number {
  const r = rng()
  let acc = 0
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i]
    if (r <= acc) return i
  }
  return 0
}

/** sRGB hex ('#8052ff') → linear-space [r,g,b] floats for vertex colors. */
export function srgbHexToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const chan = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return [chan((n >> 16) & 255), chan((n >> 8) & 255), chan(n & 255)]
}

// ─── ORGANIC BRAIN FIELD ─────────────────────────────────────
// Two wrinkled hemispheres ellipsoids offset along ±z with a carved
// midline fissure, plus a low "cerebellum" mass at the back-bottom.
// Unit space — the caller multiplies by `scale`.

const RX = 1.58 // hemisphere radius along view axis (long)
const RY = 1.02 // vertical radius
const RZ = 0.72 // depth radius per lobe
const HZ = 0.34 // half-offset between lobes

function hemisphereDist(x: number, y: number, z: number, side: 1 | -1): number {
  const az = z - side * HZ
  const ay = y - 0.04
  return Math.sqrt((x * x) / (RX * RX) + (ay * ay) / (RY * RY) + (az * az) / (RZ * RZ))
}

function cerebellumDist(x: number, y: number, z: number): number {
  const cx = (x + 1.02) / 0.46
  const cy = (y + 0.5) / 0.34
  const cz = z / 0.4
  return Math.sqrt(cx * cx + cy * cy + cz * cz)
}

export function brainDist(x: number, y: number, z: number): number {
  const d = Math.min(hemisphereDist(x, y, z, 1), hemisphereDist(x, y, z, -1))
  return Math.min(d, cerebellumDist(x, y, z))
}

/** Sulci undulation — drives the wrinkled perimeter. Range ~[-1, 1]. */
function wrinkle(x: number, y: number, z: number): number {
  return (
    Math.sin(5.1 * x + 1.3 * z) *
    Math.sin(4.3 * y + 2.2 * x) *
    Math.sin(3.7 * z + 0.9 * y + 1.7)
  )
}

/** Midline fissure between the hemispheres (does not carve the cerebellum). */
function inFissure(y: number, z: number): boolean {
  if (y <= -0.42) return false
  const gap = 0.105 + 0.055 * Math.max(0, y)
  return Math.abs(z) < gap
}

function isAccepted(x: number, y: number, z: number, shellBias: number, rng: Rng): boolean {
  if (inFissure(y, z)) return false
  const limit = 1 + 0.085 * wrinkle(x, y, z)
  const d = brainDist(x, y, z)
  if (d > limit) return false
  // Bias density toward the surface so the silhouette reads clearly
  // and the interior stays airy.
  if (rng() < shellBias && d < 0.66 * limit) return false
  return true
}

// ─── CONSTELLATION FACTORY ───────────────────────────────────

export interface ConstellationOptions {
  count: number
  /** World multiplier applied to the unit brain. */
  scale: number
  /** Palette as sRGB hex strings, picked by weight. */
  colors: readonly string[]
  colorWeights: readonly number[]
  /** Connection web settings (world units). */
  connectionMaxDist: number
  connectionMaxPerParticle: number
  connectionMaxTotal: number
  /** How far out particles scatter before converging. Multiplied by scale. */
  scatterFactor: number
  /** Deterministic layout seed. */
  seed: number
}

export interface ConstellationData {
  count: number
  /** Final brain positions (3N). */
  targets: Float32Array
  /** Entrance start positions (3N). */
  scatter: Float32Array
  /** Per-particle drift phases (N). */
  seeds: Float32Array
  /** Entrance delay per particle in seconds (N). */
  delays: Float32Array
  /** Triangle circumradius per particle (N). */
  sizes: Float32Array
  /** Signed spin speed rad/s per particle (N). */
  spinRates: Float32Array
  /** Orthonormal in-plane basis U per particle (3N). */
  basisU: Float32Array
  /** Orthonormal in-plane basis V per particle (3N). */
  basisV: Float32Array
  /** Linear-space base color per particle (3N). */
  colors: Float32Array
  /** Twinkle phase offsets (N). */
  twinkle: Float32Array
  /** Connection pairs [a,b,a,b,...] (2M). */
  connectionPairs: Uint32Array
  /** Average nearest-neighbor spacing (diagnostic). */
  meanSpacing: number
}

export function createConstellation(opts: ConstellationOptions): ConstellationData {
  const {
    count,
    scale,
    colors,
    colorWeights,
    connectionMaxDist,
    connectionMaxPerParticle,
    connectionMaxTotal,
    scatterFactor,
    seed,
  } = opts

  const rng = mulberry32(seed)

  const targets = new Float32Array(count * 3)
  const scatter = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const delays = new Float32Array(count)
  const sizes = new Float32Array(count)
  const spinRates = new Float32Array(count)
  const basisU = new Float32Array(count * 3)
  const basisV = new Float32Array(count * 3)
  const colorsBuf = new Float32Array(count * 3)
  const twinkle = new Float32Array(count)

  // Sample brain volume (rejection sampling).
  let placed = 0
  let guard = count * 200
  while (placed < count && guard-- > 0) {
    const x = (rng() * 2 - 1) * 1.75
    const y = (rng() * 2 - 1) * 1.2
    const z = (rng() * 2 - 1) * 1.2
    if (!isAccepted(x, y, z, 0.78, rng)) continue
    targets[placed * 3 + 0] = x * scale
    targets[placed * 3 + 1] = y * scale
    targets[placed * 3 + 2] = z * scale
    placed++
  }
  // Fallback (should never trigger): widen bounds linearly.
  while (placed < count) {
    targets[placed * 3 + 0] = (rng() * 2 - 1) * 1.6 * scale
    targets[placed * 3 + 1] = (rng() * 2 - 1) * 1.1 * scale
    targets[placed * 3 + 2] = (rng() * 2 - 1) * 1.1 * scale
    placed++
  }

  const scatterR = scatterFactor * scale

  for (let i = 0; i < count; i++) {
    // Entrance scatter: uniform in a sphere shell.
    const theta = rng() * Math.PI * 2
    const phi = Math.acos(rng() * 2 - 1)
    const r = scatterR * (0.75 + rng() * 0.55)
    scatter[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
    scatter[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    scatter[i * 3 + 2] = r * Math.cos(phi)

    seeds[i] = rng() * Math.PI * 2
    delays[i] = rng() * 0.9
    sizes[i] = 0.022 + rng() * rng() * 0.034 // tiny, clustered toward small
    const dir = rng() > 0.5 ? 1 : -1
    spinRates[i] = dir * (0.15 + rng() * 0.5)

    // Random triangle plane: unit normal → orthonormal basis.
    const nTheta = rng() * Math.PI * 2
    const nPhi = Math.acos(rng() * 2 - 1)
    const nx = Math.sin(nPhi) * Math.cos(nTheta)
    const ny = Math.sin(nPhi) * Math.sin(nTheta)
    const nz = Math.cos(nPhi)
    // u = normalize(n × t)
    const tx = Math.abs(ny) < 0.93 ? 0 : 1
    const ty = Math.abs(ny) < 0.93 ? 1 : 0
    let ux = ny * 0 - nz * ty
    let uy = nz * tx - nx * 0
    let uz = nx * ty - ny * tx
    const ul = Math.hypot(ux, uy, uz) || 1
    ux /= ul
    uy /= ul
    uz /= ul
    // v = n × u
    const vx = ny * uz - nz * uy
    const vy = nz * ux - nx * uz
    const vz = nx * uy - ny * ux
    basisU[i * 3 + 0] = ux
    basisU[i * 3 + 1] = uy
    basisU[i * 3 + 2] = uz
    basisV[i * 3 + 0] = vx
    basisV[i * 3 + 1] = vy
    basisV[i * 3 + 2] = vz

    const [cr, cg, cb] = srgbHexToLinear(colors[pickWeightedIndex(rng, colorWeights)])
    const brightness = 0.55 + rng() * 0.45
    colorsBuf[i * 3 + 0] = cr * brightness
    colorsBuf[i * 3 + 1] = cg * brightness
    colorsBuf[i * 3 + 2] = cb * brightness

    twinkle[i] = rng() * Math.PI * 2
  }

  const { pairs } = buildConnections(
    targets,
    count,
    connectionMaxDist,
    connectionMaxPerParticle,
    connectionMaxTotal,
  )

  // Diagnostic: mean 8-neighborhood spacing (used by tests/tuning).
  let spacingSum = 0
  let spacingCount = 0
  for (let i = 0; i < Math.min(count, 400); i++) {
    let best = Infinity
    for (let j = 0; j < count; j++) {
      if (j === i) continue
      const dx = targets[i * 3] - targets[j * 3]
      const dy = targets[i * 3 + 1] - targets[j * 3 + 1]
      const dz = targets[i * 3 + 2] - targets[j * 3 + 2]
      const d2 = dx * dx + dy * dy + dz * dz
      if (d2 < best) best = d2
    }
    spacingSum += Math.sqrt(best)
    spacingCount++
  }

  return {
    count,
    targets,
    scatter,
    seeds,
    delays,
    sizes,
    spinRates,
    basisU,
    basisV,
    colors: colorsBuf,
    twinkle,
    connectionPairs: pairs,
    meanSpacing: spacingCount > 0 ? spacingSum / spacingCount : 0,
  }
}

// ─── CONNECTION WEB ──────────────────────────────────────────
// Nearest-neighbor links via a spatial hash grid.

export function buildConnections(
  positions: Float32Array,
  count: number,
  maxDist: number,
  maxPerParticle: number,
  maxTotal: number,
): { pairs: Uint32Array; total: number } {
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
  const maxDist2 = maxDist * maxDist
  let total = 0

  for (let i = 0; i < count && total < maxTotal; i++) {
    if (degree[i] >= maxPerParticle) continue
    const x = positions[i * 3 + 0]
    const y = positions[i * 3 + 1]
    const z = positions[i * 3 + 2]
    const ix = Math.floor(x / cell)
    const iy = Math.floor(y / cell)
    const iz = Math.floor(z / cell)

    for (let dx = -1; dx <= 1 && total < maxTotal; dx++) {
      for (let dy = -1; dy <= 1 && total < maxTotal; dy++) {
        for (let dz = -1; dz <= 1 && total < maxTotal; dz++) {
          const bucket = buckets.get(keyOf(ix + dx, iy + dy, iz + dz))
          if (!bucket) continue
          for (let b = 0; b < bucket.length; b++) {
            const j = bucket[b]
            if (j <= i) continue
            if (degree[j] >= maxPerParticle) continue
            const ddx = x - positions[j * 3 + 0]
            const ddy = y - positions[j * 3 + 1]
            const ddz = z - positions[j * 3 + 2]
            if (ddx * ddx + ddy * ddy + ddz * ddz > maxDist2) continue
            tmp.push(i, j)
            degree[i]++
            degree[j]++
            total++
            if (degree[i] >= maxPerParticle || total >= maxTotal) break
          }
        }
      }
    }
  }

  return { pairs: Uint32Array.from(tmp), total }
}

// ─── AMBIENT DUST ────────────────────────────────────────────

export interface AmbientData {
  count: number
  positions: Float32Array
  seeds: Float32Array
  sizes: Float32Array
  spinRates: Float32Array
  basisU: Float32Array
  basisV: Float32Array
  colors: Float32Array
}

export function createAmbient(
  count: number,
  scale: number,
  colors: readonly string[],
  colorWeights: readonly number[],
  seed: number,
): AmbientData {
  const rng = mulberry32(seed)
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const sizes = new Float32Array(count)
  const spinRates = new Float32Array(count)
  const basisU = new Float32Array(count * 3)
  const basisV = new Float32Array(count * 3)
  const colorsBuf = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const theta = rng() * Math.PI * 2
    const phi = Math.acos(rng() * 2 - 1)
    const r = scale * (1.5 + rng() * 1.1)
    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.85
    positions[i * 3 + 2] = r * Math.cos(phi) * 0.6

    seeds[i] = rng() * Math.PI * 2
    sizes[i] = 0.016 + rng() * 0.03
    const dir = rng() > 0.5 ? 1 : -1
    spinRates[i] = dir * (0.08 + rng() * 0.25)

    const nTheta = rng() * Math.PI * 2
    const nPhi = Math.acos(rng() * 2 - 1)
    const nx = Math.sin(nPhi) * Math.cos(nTheta)
    const ny = Math.sin(nPhi) * Math.sin(nTheta)
    const nz = Math.cos(nPhi)
    const txA = Math.abs(ny) < 0.93 ? 0 : 1
    const tyA = Math.abs(ny) < 0.93 ? 1 : 0
    let ux = -nz * tyA
    let uy = nz * txA
    let uz = nx * tyA - ny * txA
    const ul = Math.hypot(ux, uy, uz) || 1
    ux /= ul
    uy /= ul
    uz /= ul
    basisU[i * 3 + 0] = ux
    basisU[i * 3 + 1] = uy
    basisU[i * 3 + 2] = uz
    basisV[i * 3 + 0] = ny * uz - nz * uy
    basisV[i * 3 + 1] = nz * ux - nx * uz
    basisV[i * 3 + 2] = nx * uy - ny * ux

    const [cr, cg, cb] = srgbHexToLinear(colors[pickWeightedIndex(rng, colorWeights)])
    const brightness = 0.12 + rng() * 0.22
    colorsBuf[i * 3 + 0] = cr * brightness
    colorsBuf[i * 3 + 1] = cg * brightness
    colorsBuf[i * 3 + 2] = cb * brightness
  }

  return { count, positions, seeds, sizes, spinRates, basisU, basisV, colors: colorsBuf }
}
