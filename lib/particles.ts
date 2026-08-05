/* ============================================================
   KALA VOID — lib/particles.ts
   Pure math for DALA-style particle constellation
   No three.js imports — deterministic factories returning typed arrays
   Shapes: brain → dispersed → lightbulb → globe
   ============================================================ */

export type Rng = () => number

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
export function srgbHexToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const chan = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return [chan((n >> 16) & 255), chan((n >> 8) & 255), chan(n & 255)]
}

// ─ Brain field math
const RX = 1.62, RY = 1.08, RZ = 0.74, HZ = 0.36
function hemisphereDist(x: number, y: number, z: number, side: 1 | -1): number {
  const az = z - side * HZ, ay = y - 0.04
  return Math.sqrt((x*x)/(RX*RX)+(ay*ay)/(RY*RY)+(az*az)/(RZ*RZ))
}
function cerebellumDist(x: number, y: number, z: number): number {
  const cx=(x+1.05)/0.50, cy=(y+0.52)/0.38, cz=z/0.44
  return Math.sqrt(cx*cx+cy*cy+cz*cz)
}
export function brainDist(x:number,y:number,z:number): number {
  return Math.min(hemisphereDist(x,y,z,1), hemisphereDist(x,y,z,-1), cerebellumDist(x,y,z))
}
function wrinkle(x:number,y:number,z:number): number {
  return Math.sin(5.7*x+1.2*z)*Math.sin(4.6*y+2.3*x+0.8)*Math.sin(3.8*z+1.0*y)*Math.cos(6.9*x*0.6+y*0.7)
}
function inFissure(y:number,z:number): boolean {
  if(y<=-0.48) return false
  return Math.abs(z) < 0.105+0.07*Math.max(0,y)
}
function isAccepted(x:number,y:number,z:number,bias:number,rng:Rng): boolean {
  if(inFissure(y,z)) return false
  const lim=1+0.11*wrinkle(x,y,z)
  const d=brainDist(x,y,z)
  if(d>lim) return false
  if(rng()<bias && d<0.68*lim) return false
  return true
}

// ─ Connections ─
export function buildConnections(
  positions: Float32Array,
  count: number,
  maxDist: number,
  maxPerParticle: number,
  maxTotal: number,
): { pairs: Uint32Array; total: number } {
  const cell=maxDist
  const buckets=new Map<number, number[]>()
  const key=(ix:number,iy:number,iz:number)=> (ix+256)+(iy+256)*1024+(iz+256)*1024*1024
  for(let i=0;i<count;i++){
    const ix=Math.floor(positions[i*3+0]/cell), iy=Math.floor(positions[i*3+1]/cell), iz=Math.floor(positions[i*3+2]/cell)
    const k=key(ix,iy,iz); const b=buckets.get(k); if(b) b.push(i); else buckets.set(k,[i])
  }
  const deg=new Uint16Array(count)
  const tmp:number[]=[]
  const maxD2=maxDist*maxDist
  let total=0
  for(let i=0;i<count && total<maxTotal;i++){
    if(deg[i]>=maxPerParticle) continue
    const x=positions[i*3+0], y=positions[i*3+1], z=positions[i*3+2]
    const ix=Math.floor(x/cell), iy=Math.floor(y/cell), iz=Math.floor(z/cell)
    for(let dx=-1;dx<=1 && total<maxTotal;dx++) for(let dy=-1;dy<=1 && total<maxTotal;dy++) for(let dz=-1;dz<=1 && total<maxTotal;dz++){
      const buck=buckets.get(key(ix+dx,iy+dy,iz+dz)); if(!buck) continue
      for(const j of buck){
        if(j<=i || deg[j]>=maxPerParticle) continue
        const ddx=x-positions[j*3+0], ddy=y-positions[j*3+1], ddz=z-positions[j*3+2]
        if(ddx*ddx+ddy*ddy+ddz*ddz>maxD2) continue
        tmp.push(i,j); deg[i]++; deg[j]++; total++
        if(deg[i]>=maxPerParticle) break
      }
    }
  }
  return { pairs: Uint32Array.from(tmp), total }
}

// ─ Shape samplers ─
export function sampleBrain(count:number, rng:Rng): Float32Array {
  const out=new Float32Array(count*3)
  let i=0, tries=0
  while(i<count && tries<count*120){
    tries++
    const x=(rng()*2-1)*1.82, y=(rng()*2-1)*1.28, z=(rng()*2-1)*1.30
    if(!isAccepted(x,y,z,0.82,rng)) continue
    out[i*3+0]=x/1.60; out[i*3+1]=y/1.60; out[i*3+2]=z/1.60; i++
  }
  while(i<count){ out[i*3+0]=(rng()*2-1)*1.1; out[i*3+1]=(rng()*2-1)*0.9; out[i*3+2]=(rng()*2-1)*0.8; i++ }
  return out
}
export function sampleDisperse(count:number, rng:Rng): Float32Array {
  const out=new Float32Array(count*3)
  const clusters:[number,number,number][]=[]
  for(let c=0;c<9;c++) clusters.push([(rng()*2-1)*0.92,(rng()*2-1)*0.88,(rng()*2-1)*0.45])
  for(let i=0;i<count;i++){
    let x,y,z
    if(rng()<0.32){
      const cl=clusters[Math.floor(rng()*clusters.length)]
      const j=(rng()+rng()+rng()-1.5)
      x=cl[0]+j*0.30; y=cl[1]+j*0.30; z=cl[2]+j*0.16
    }else{ x=(rng()*2-1)*1.22; y=(rng()*2-1)*1.12; z=(rng()*2-1)*0.65 }
    out[i*3+0]=x; out[i*3+1]=y; out[i*3+2]=z
  }
  return out
}
export function sampleBulb(count:number, rng:Rng): Float32Array {
  const out=new Float32Array(count*3)
  for(let i=0;i<count;i++){
    const r=rng(); let x=0,y=0,z=0
    if(r<0.70){
      let ok=false, at=0
      while(!ok && at<50){ at++
        const u=rng(), v=rng(), th=2*Math.PI*u, ph=Math.acos(2*v-1)
        const R=0.76*(0.90+rng()*0.14)
        const sx=R*Math.sin(ph)*Math.cos(th), sy=R*Math.sin(ph)*Math.sin(th), sz=R*Math.cos(ph)
        if(Math.hypot(sx,sy,sz)<0.38 && rng()<0.88) continue
        y=sy*0.98+0.45; if(y<-0.10) continue; x=sx; z=sz; ok=true
      }
    }else if(r<0.88){
      y=-0.62+rng()*0.74; const t=(y+0.62)/0.74; const rMax=0.21+t*0.22+Math.sin(y*19)*0.014
      const th=rng()*Math.PI*2, rr=rng()<0.78? rMax*(0.86+rng()*0.16) : rMax*Math.sqrt(rng())
      x=Math.cos(th)*rr; z=Math.sin(th)*rr
    }else if(r<0.975){
      y=-0.98+rng()*0.38; const th=rng()*Math.PI*2, thread=0.028*Math.sin(y*44), rBase=0.312+thread
      const rr=rng()<0.80? rBase*(0.88+rng()*0.16) : rBase*(0.2+rng()*0.8)
      x=Math.cos(th)*rr; z=Math.sin(th)*rr
    }else{
      y=-1.06+rng()*0.16; const th=rng()*Math.PI*2, rr=0.16*Math.sqrt(rng()); x=Math.cos(th)*rr; z=Math.sin(th)*rr
    }
    out[i*3+0]=x; out[i*3+1]=y; out[i*3+2]=z
  }
  return out
}
export function sampleGlobe(count:number, rng:Rng): Float32Array {
  const out=new Float32Array(count*3)
  const shell=Math.floor(count*0.86), g=2.399963229728653
  for(let i=0;i<count;i++){
    if(i<shell){
      const y=1-(i/Math.max(1,shell-1))*2, rad=Math.sqrt(Math.max(0,1-y*y)), th=i*g, jit=0.04
      out[i*3+0]=Math.cos(th)*rad*(1+(rng()-0.5)*jit)
      out[i*3+1]=y*(1+(rng()-0.5)*jit)*0.99
      out[i*3+2]=Math.sin(th)*rad*(1+(rng()-0.5)*jit)
    }else{
      const R=Math.cbrt(rng())*0.86, th=rng()*Math.PI*2, ph=Math.acos(rng()*2-1)
      out[i*3+0]=R*Math.sin(ph)*Math.cos(th); out[i*3+1]=R*Math.sin(ph)*Math.sin(th); out[i*3+2]=R*Math.cos(ph)
    }
  }
  return out
}

// ─ Factories ─
export interface ConstellationOptions {
  count: number; scale: number; colors: readonly string[]; colorWeights: readonly number[]
  connectionMaxDist: number; connectionMaxPerParticle: number; connectionMaxTotal: number
  scatterFactor: number; seed: number
}
export interface ConstellationData {
  count: number; targets: Float32Array; scatter: Float32Array; seeds: Float32Array
  delays: Float32Array; sizes: Float32Array; spinRates: Float32Array; basisU: Float32Array; basisV: Float32Array
  colors: Float32Array; twinkle: Float32Array; connectionPairs: Uint32Array; meanSpacing: number
}
export function createConstellation(opts: ConstellationOptions): ConstellationData {
  const { count, scale, colors, colorWeights, connectionMaxDist, connectionMaxPerParticle, connectionMaxTotal, scatterFactor, seed }=opts
  const rng=mulberry32(seed)
  const targets=sampleBrain(count, rng)
  for(let i=0;i<count;i++){ targets[i*3+0]*=scale; targets[i*3+1]*=scale; targets[i*3+2]*=scale }
  const scatter=new Float32Array(count*3), seeds=new Float32Array(count), delays=new Float32Array(count)
  const sizes=new Float32Array(count), spinRates=new Float32Array(count), basisU=new Float32Array(count*3), basisV=new Float32Array(count*3)
  const colorsBuf=new Float32Array(count*3), twinkle=new Float32Array(count)
  for(let i=0;i<count;i++){
    const th=rng()*Math.PI*2, ph=Math.acos(rng()*2-1), r=scatterFactor*scale*(0.75+rng()*0.55)
    scatter[i*3+0]=r*Math.sin(ph)*Math.cos(th); scatter[i*3+1]=r*Math.sin(ph)*Math.sin(th); scatter[i*3+2]=r*Math.cos(ph)
    seeds[i]=rng()*Math.PI*2; delays[i]=rng()*0.9; sizes[i]=0.022+rng()*rng()*0.034
    spinRates[i]=(rng()>0.5?1:-1)*(0.15+rng()*0.5)
    const nTh=rng()*Math.PI*2, nPh=Math.acos(rng()*2-1), nx=Math.sin(nPh)*Math.cos(nTh), ny=Math.sin(nPh)*Math.sin(nTh), nz=Math.cos(nPh)
    const txA=Math.abs(ny)<0.93?0:1, tyA=Math.abs(ny)<0.93?1:0
    let ux=ny*0-nz*tyA, uy=nz*txA-nx*0, uz=nx*tyA-ny*txA; const ul=Math.hypot(ux,uy,uz)||1; ux/=ul; uy/=ul; uz/=ul
    basisU[i*3+0]=ux; basisU[i*3+1]=uy; basisU[i*3+2]=uz
    basisV[i*3+0]=ny*uz-nz*uy; basisV[i*3+1]=nz*ux-nx*uz; basisV[i*3+2]=nx*uy-ny*ux
    const [cr,cg,cb]=srgbHexToLinear(colors[pickWeightedIndex(rng,colorWeights)]); const b=0.55+rng()*0.45
    colorsBuf[i*3+0]=cr*b; colorsBuf[i*3+1]=cg*b; colorsBuf[i*3+2]=cb*b
    twinkle[i]=rng()*Math.PI*2
  }
  const { pairs }=buildConnections(targets,count,connectionMaxDist,connectionMaxPerParticle,connectionMaxTotal)
  return { count, targets, scatter, seeds, delays, sizes, spinRates, basisU, basisV, colors:colorsBuf, twinkle, connectionPairs:pairs, meanSpacing:0 }
}

export interface AmbientData {
  count: number; positions: Float32Array; seeds: Float32Array; sizes: Float32Array; spinRates: Float32Array; basisU: Float32Array; basisV: Float32Array; colors: Float32Array
}
export function createAmbient(count:number, scale:number, colors:readonly string[], colorWeights:readonly number[], seed:number): AmbientData {
  const rng=mulberry32(seed)
  const positions=new Float32Array(count*3), seeds=new Float32Array(count), sizes=new Float32Array(count), spinRates=new Float32Array(count), basisU=new Float32Array(count*3), basisV=new Float32Array(count*3), colorsBuf=new Float32Array(count*3)
  for(let i=0;i<count;i++){
    const th=rng()*Math.PI*2, ph=Math.acos(rng()*2-1), r=scale*(1.5+rng()*1.1)
    positions[i*3+0]=r*Math.sin(ph)*Math.cos(th); positions[i*3+1]=r*Math.sin(ph)*Math.sin(th)*0.85; positions[i*3+2]=r*Math.cos(ph)*0.6
    seeds[i]=rng()*Math.PI*2; sizes[i]=0.016+rng()*0.03; spinRates[i]=(rng()>0.5?1:-1)*(0.08+rng()*0.25)
    const nTh=rng()*Math.PI*2, nPh=Math.acos(rng()*2-1), nx=Math.sin(nPh)*Math.cos(nTh), ny=Math.sin(nPh)*Math.sin(nTh), nz=Math.cos(nPh)
    const txA=Math.abs(ny)<0.93?0:1, tyA=Math.abs(ny)<0.93?1:0
    let ux=-nz*tyA, uy=nz*txA, uz=nx*tyA-ny*txA; const ul=Math.hypot(ux,uy,uz)||1; ux/=ul; uy/=ul; uz/=ul
    basisU[i*3+0]=ux; basisU[i*3+1]=uy; basisU[i*3+2]=uz
    basisV[i*3+0]=ny*uz-nz*uy; basisV[i*3+1]=nz*ux-nx*uz; basisV[i*3+2]=nx*uy-ny*ux
    const [cr,cg,cb]=srgbHexToLinear(colors[pickWeightedIndex(rng,colorWeights)]); const b=0.12+rng()*0.22
    colorsBuf[i*3+0]=cr*b; colorsBuf[i*3+1]=cg*b; colorsBuf[i*3+2]=cb*b
  }
  return { count, positions, seeds, sizes, spinRates, basisU, basisV, colors:colorsBuf }
}

export interface FieldOptions {
  count: number; colors: readonly string[]; colorWeights: readonly number[]
  connectionMaxDist: number; connectionMaxPerParticle: number; connectionMaxTotal: number
  scatterFactor: number; seed: number
}
export interface FieldData {
  count: number; shapes: Float32Array[]; shapePairs: Uint32Array[]; scatter: Float32Array
  seeds: Float32Array; delays: Float32Array; sizes: Float32Array; spinRates: Float32Array
  basisU: Float32Array; basisV: Float32Array; colors: Float32Array; twinkle: Float32Array
  stagger: Float32Array; turbDir: Float32Array
}
export function createField(opts: FieldOptions): FieldData {
  const { count, colors, colorWeights, connectionMaxDist, connectionMaxPerParticle, connectionMaxTotal, scatterFactor, seed }=opts
  const rng=mulberry32(seed)
  const brain=sampleBrain(count, mulberry32(seed+11))
  const disp=sampleDisperse(count, mulberry32(seed+23))
  const bulb=sampleBulb(count, mulberry32(seed+37))
  const globe=sampleGlobe(count, mulberry32(seed+41))
  const shapes=[brain,disp,bulb,globe]
  const shapePairs:Uint32Array[]=[]
  for(let s=0;s<4;s++){
    const { pairs }=buildConnections(shapes[s],count,connectionMaxDist,connectionMaxPerParticle,connectionMaxTotal)
    shapePairs.push(pairs)
  }
  const scatter=new Float32Array(count*3), seeds=new Float32Array(count), delays=new Float32Array(count)
  const sizes=new Float32Array(count), spinRates=new Float32Array(count), basisU=new Float32Array(count*3), basisV=new Float32Array(count*3), colorsBuf=new Float32Array(count*3), twinkle=new Float32Array(count), stagger=new Float32Array(count), turbDir=new Float32Array(count*3)
  for(let i=0;i<count;i++){
    const sTh=rng()*Math.PI*2, sPh=Math.acos(rng()*2-1), sR=scatterFactor*(0.75+rng()*0.55)
    scatter[i*3+0]=sR*Math.sin(sPh)*Math.cos(sTh); scatter[i*3+1]=sR*Math.sin(sPh)*Math.sin(sTh); scatter[i*3+2]=sR*Math.cos(sPh)
    const tTh=rng()*Math.PI*2, tPh=Math.acos(rng()*2-1)
    turbDir[i*3+0]=Math.sin(tPh)*Math.cos(tTh); turbDir[i*3+1]=Math.sin(tPh)*Math.sin(tTh); turbDir[i*3+2]=Math.cos(tPh)
    stagger[i]=rng(); seeds[i]=rng()*Math.PI*2; delays[i]=rng()*rng()*0.45; sizes[i]=0.024+rng()*rng()*0.036
    spinRates[i]=(rng()>0.5?1:-1)*(0.12+rng()*0.5); twinkle[i]=rng()*Math.PI*2
    const nTh=rng()*Math.PI*2, nPh=Math.acos(rng()*2-1), nx=Math.sin(nPh)*Math.cos(nTh), ny=Math.sin(nPh)*Math.sin(nTh), nz=Math.cos(nPh)
    const txA=Math.abs(ny)<0.93?0:1, tyA=Math.abs(ny)<0.93?1:0
    let ux=-nz*tyA, uy=nz*txA, uz=nx*tyA-ny*txA; const ul=Math.hypot(ux,uy,uz)||1; ux/=ul; uy/=ul; uz/=ul
    basisU[i*3+0]=ux; basisU[i*3+1]=uy; basisU[i*3+2]=uz
    basisV[i*3+0]=ny*uz-nz*uy; basisV[i*3+1]=nz*ux-nx*uz; basisV[i*3+2]=nx*uy-ny*ux
    const [cr,cg,cb]=srgbHexToLinear(colors[pickWeightedIndex(rng,colorWeights)])
    colorsBuf[i*3+0]=cr; colorsBuf[i*3+1]=cg; colorsBuf[i*3+2]=cb
  }
  return { count, shapes, shapePairs, scatter, seeds, delays, sizes, spinRates, basisU, basisV, colors:colorsBuf, twinkle, stagger, turbDir }
}
