'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * DALA craftedbygc — faithful particle recreation
 * - Tiny TRIANGLE fragments (not points) — double-sided, additive, spinning
 * - Glow halo layer for soft bloom
 * - 4 scroll-driven shapes: organic brain → dispersed → lightbulb → globe
 * - Per-particle stagger, turbulence vortex, entrance from scattered sphere
 * - Mouse repel crater + parallax tilt like original
 * - Connection web (faint purple) that fades with distance and morph
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
function srgbToLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const lin = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return [lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255)]
}

// DALA palette — purple-dominant with warm sparks, but mostly soft lavender/white
const PALETTE = ['#bba0ff', '#8052ff', '#a07cff', '#d7c7ff', '#ffb957', '#6ee5d0', '#ff8fb8', '#7bd8ff', '#9b6cff', '#f2eaff']
const WEIGHTS   = [ 0.26   ,  0.22   ,  0.12   ,  0.10   ,  0.06    , 0.05    , 0.05    , 0.04   , 0.06    , 0.04]
const IRIS_LIN = srgbToLinear('#8255ff')

// ─ Brain field ─
// Two ellipsoids offset in Z with fissure + cerebellum nub
const RX=1.62, RY=1.08, RZ=0.74, HZ=0.36
function hemiDist(x:number,y:number,z:number, side:1|-1){
  const az=z-side*HZ, ay=y-0.04
  return Math.sqrt((x*x)/(RX*RX)+(ay*ay)/(RY*RY)+(az*az)/(RZ*RZ))
}
function cereDist(x:number,y:number,z:number){
  const cx=(x+1.05)/0.50, cy=(y+0.52)/0.38, cz=z/0.44
  return Math.sqrt(cx*cx+cy*cy+cz*cz)
}
function brainDist(x:number,y:number,z:number){
  return Math.min(hemiDist(x,y,z,1), hemiDist(x,y,z,-1), cereDist(x,y,z))
}
function wrinkle(x:number,y:number,z:number){
  // layered sine → pseudo-sulci; higher frequency = more Dala wrinkled edge
  return Math.sin(5.7*x+1.2*z)*Math.sin(4.6*y+2.3*x+0.8)*Math.sin(3.8*z+1.0*y)*Math.cos(6.9*x*0.6+y*0.7)
}
function inFissure(y:number,z:number){
  if(y<=-0.48) return false
  return Math.abs(z) < 0.105+0.07*Math.max(0,y)
}
function accepted(x:number,y:number,z:number,bias:number, rng:()=>number){
  if(inFissure(y,z)) return false
  const lim=1+0.11*wrinkle(x,y,z)
  const d=brainDist(x,y,z)
  if(d>lim) return false
  if(rng()<bias && d<0.68*lim) return false // surface bias
  return true
}

// ─ Shapes ─
function sampleBrain(count:number, seed:number){
  const rng=mulberry32(seed)
  const out=new Float32Array(count*3)
  let i=0, tries=0
  while(i<count && tries<count*120){
    tries++
    const x=(rng()*2-1)*1.82, y=(rng()*2-1)*1.28, z=(rng()*2-1)*1.30
    if(!accepted(x,y,z,0.82,rng)) continue
    out[i*3+0]=x/1.60; out[i*3+1]=y/1.60; out[i*3+2]=z/1.60; i++
  }
  while(i<count){ out[i*3+0]=(rng()*2-1)*1.1; out[i*3+1]=(rng()*2-1)*0.9; out[i*3+2]=(rng()*2-1)*0.8; i++ }
  return out
}
function sampleDisperse(count:number, seed:number){
  const rng=mulberry32(seed)
  const out=new Float32Array(count*3)
  const clusters:[number,number,number][]=[]
  for(let c=0;c<9;c++) clusters.push([(rng()*2-1)*0.92,(rng()*2-1)*0.88,(rng()*2-1)*0.45])
  for(let i=0;i<count;i++){
    let x,y,z
    if(rng()<0.32){
      const cl=clusters[Math.floor(rng()*clusters.length)]
      const j=(rng()+rng()+rng()-1.5)
      x=cl[0]+j*0.30; y=cl[1]+j*0.30; z=cl[2]+j*0.16
    }else{
      x=(rng()*2-1)*1.22; y=(rng()*2-1)*1.12; z=(rng()*2-1)*0.65
    }
    out[i*3+0]=x; out[i*3+1]=y; out[i*3+2]=z
  }
  return out
}
function sampleBulb(count:number, seed:number){
  const rng=mulberry32(seed)
  const out=new Float32Array(count*3)
  for(let i=0;i<count;i++){
    const r=rng()
    let x=0,y=0,z=0
    if(r<0.70){
      // upper glass sphere: hollow shell, center (0,0.45,0), R 0.76
      let ok=false, at=0
      while(!ok && at<50){
        at++
        const u=rng(), v=rng()
        const theta=2*Math.PI*u
        const phi=Math.acos(2*v-1)
        const R=0.76*(0.90+rng()*0.14) // shell thickness
        const sx=R*Math.sin(phi)*Math.cos(theta)
        const sy=R*Math.sin(phi)*Math.sin(theta)
        const sz=R*Math.cos(phi)
        if(Math.hypot(sx,sy,sz)<0.38 && rng()<0.88) continue
        y=sy*0.98+0.45
        if(y<-0.10) continue
        x=sx; z=sz; ok=true
      }
    }else if(r<0.88){
      // neck filament column -0.65..0.05
      y=-0.62+rng()*0.74
      const t=(y+0.62)/0.74
      const rMax=0.21+t*0.22+Math.sin(y*19)*0.014
      const th=rng()*Math.PI*2
      const rr=rng()<0.78? rMax*(0.86+rng()*0.16) : rMax*Math.sqrt(rng())
      x=Math.cos(th)*rr; z=Math.sin(th)*rr
    }else if(r<0.975){
      // screw base -0.98..-0.60 threaded
      y=-0.98+rng()*0.38
      const th=rng()*Math.PI*2
      const thread=0.028*Math.sin(y*44)
      const rBase=0.312+thread
      const rr=rng()<0.80? rBase*(0.88+rng()*0.16) : rBase*(0.2+rng()*0.8)
      x=Math.cos(th)*rr; z=Math.sin(th)*rr
    }else{
      y=-1.06+rng()*0.16
      const th=rng()*Math.PI*2
      const rr=0.16*Math.sqrt(rng())
      x=Math.cos(th)*rr; z=Math.sin(th)*rr
    }
    out[i*3+0]=x; out[i*3+1]=y; out[i*3+2]=z
  }
  return out
}
function sampleGlobe(count:number, seed:number){
  const rng=mulberry32(seed)
  const out=new Float32Array(count*3)
  const shell=Math.floor(count*0.86)
  const g=2.399963229728653
  for(let i=0;i<count;i++){
    if(i<shell){
      const y=1-(i/Math.max(1,shell-1))*2
      const rad=Math.sqrt(Math.max(0,1-y*y))
      const th=i*g
      const jit=0.04
      out[i*3+0]=Math.cos(th)*rad*(1+(rng()-0.5)*jit)
      out[i*3+1]=y*(1+(rng()-0.5)*jit)*0.99
      out[i*3+2]=Math.sin(th)*rad*(1+(rng()-0.5)*jit)
    }else{
      const R=Math.cbrt(rng())*0.86
      const th=rng()*Math.PI*2, ph=Math.acos(rng()*2-1)
      out[i*3+0]=R*Math.sin(ph)*Math.cos(th)
      out[i*3+1]=R*Math.sin(ph)*Math.sin(th)
      out[i*3+2]=R*Math.cos(ph)
    }
  }
  return out
}

function buildConnections(pos:Float32Array,cnt:number,maxDist:number,maxPer:number,maxTot:number){
  const cell=maxDist
  const buckets=new Map<number, number[]>()
  const key=(ix:number,iy:number,iz:number)=> (ix+256)+(iy+256)*1024+(iz+256)*1024*1024
  for(let i=0;i<cnt;i++){
    const ix=Math.floor(pos[i*3+0]/cell), iy=Math.floor(pos[i*3+1]/cell), iz=Math.floor(pos[i*3+2]/cell)
    const k=key(ix,iy,iz)
    const b=buckets.get(k); if(b) b.push(i); else buckets.set(k,[i])
  }
  const deg=new Uint16Array(cnt)
  const tmp:number[]=[]
  const maxD2=maxDist*maxDist
  for(let i=0;i<cnt && tmp.length/2<maxTot;i++){
    if(deg[i]>=maxPer) continue
    const x=pos[i*3+0], y=pos[i*3+1], z=pos[i*3+2]
    const ix=Math.floor(x/cell), iy=Math.floor(y/cell), iz=Math.floor(z/cell)
    for(let dx=-1;dx<=1 && tmp.length/2<maxTot;dx++) for(let dy=-1;dy<=1 && tmp.length/2<maxTot;dy++) for(let dz=-1;dz<=1 && tmp.length/2<maxTot;dz++){
      const buck=buckets.get(key(ix+dx,iy+dy,iz+dz)); if(!buck) continue
      for(let b=0;b<buck.length;b++){
        const j=buck[b]; if(j<=i || deg[j]>=maxPer) continue
        const ddx=x-pos[j*3+0], ddy=y-pos[j*3+1], ddz=z-pos[j*3+2]
        if(ddx*ddx+ddy*ddy+ddz*ddz>maxD2) continue
        tmp.push(i,j); deg[i]++; deg[j]++
        if(deg[i]>=maxPer) break
      }
    }
  }
  return Uint32Array.from(tmp)
}

export default function ParticleField(){
  const ref=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    if(!ref.current) return
    const clean=init(ref.current)
    return ()=> clean?.()
  },[])
  return <div ref={ref} aria-hidden style={{position:'fixed',inset:0,zIndex:-1,pointerEvents:'none',background:'#000',overflow:'hidden'}}/>
}

function init(container:HTMLDivElement){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile=window.innerWidth<768
  const COUNT=mobile? 1900 : 3600
  const AMBIENT=mobile? 180: 380
  const CONN_D=0.185
  const CONN_PER=3
  const CONN_TOT=mobile? 2000: 3800
  const SCATTER=5.6
  const SEED=1337

  // shapes
  const brain=sampleBrain(COUNT, SEED)
  const disp=sampleDisperse(COUNT, SEED+23)
  const bulb=sampleBulb(COUNT, SEED+37)
  const globe=sampleGlobe(COUNT, SEED+44)
  const shapes=[brain,disp,bulb,globe]
  const conns=[
    buildConnections(brain,COUNT,CONN_D,CONN_PER,CONN_TOT),
    buildConnections(disp,COUNT,CONN_D*1.18,2,Math.floor(CONN_TOT*0.36)),
    buildConnections(bulb,COUNT,CONN_D*1.05,CONN_PER,Math.floor(CONN_TOT*0.92)),
    buildConnections(globe,COUNT,CONN_D*1.20,CONN_PER,Math.floor(CONN_TOT*0.72)),
  ]
  const rotSpd=[0.072, 0.020, 0.105, 0.135]

  const rng=mulberry32(SEED+99)
  const col=new Float32Array(COUNT*3)
  const size=new Float32Array(COUNT)
  const stagger=new Float32Array(COUNT)
  const spin=new Float32Array(COUNT)
  const twPh=new Float32Array(COUNT)
  const seedAng=new Float32Array(COUNT)
  const scatter=new Float32Array(COUNT*3)
  const turb=new Float32Array(COUNT*3)
  const delay=new Float32Array(COUNT)
  const bU=new Float32Array(COUNT*3)
  const bV=new Float32Array(COUNT*3)

  for(let i=0;i<COUNT;i++){
    // color weighted, but brighter & more lavender like DALA
    const rr=rng()
    let acc=0, idx=0
    for(let c=0;c<WEIGHTS.length;c++){ acc+=WEIGHTS[c]; if(rr<=acc){ idx=c; break } }
    const [cr,cg,cb]=srgbToLinear(PALETTE[idx])
    const bright=0.84+rng()*0.32 + (idx<4?0.12:0) // purples brighter
    col[i*3+0]=cr*bright; col[i*3+1]=cg*bright; col[i*3+2]=cb*bright

    stagger[i]=rng()
    seedAng[i]=rng()*Math.PI*2
    twPh[i]=rng()*Math.PI*2
    delay[i]=Math.pow(rng(),1.6)*1.05
    const sr=rng()
    size[i]=0.014 + sr*sr*0.055 // 0.014-0.069 tiny slivers

    const dir=rng()>0.5?1:-1
    spin[i]=dir*(0.22+rng()*0.68) // faster spin than before

    const th=rng()*Math.PI*2, ph=Math.acos(rng()*2-1), R=SCATTER*(0.72+rng()*0.65)
    scatter[i*3+0]=R*Math.sin(ph)*Math.cos(th)
    scatter[i*3+1]=R*Math.sin(ph)*Math.sin(th)
    scatter[i*3+2]=R*Math.cos(ph)

    const tth=rng()*Math.PI*2, tph=Math.acos(rng()*2-1)
    turb[i*3+0]=Math.sin(tph)*Math.cos(tth)
    turb[i*3+1]=Math.sin(tph)*Math.sin(tth)
    turb[i*3+2]=Math.cos(tph)

    const nTh=rng()*Math.PI*2, nPh=Math.acos(rng()*2-1)
    const nx=Math.sin(nPh)*Math.cos(nTh), ny=Math.sin(nPh)*Math.sin(nTh), nz=Math.cos(nPh)
    const tx=Math.abs(ny)<0.9?0:1, ty=Math.abs(ny)<0.9?1:0
    let ux=ny*0-nz*ty, uy=nz*tx-nx*0, uz=nx*ty-ny*tx
    const ul=Math.hypot(ux,uy,uz)||1; ux/=ul; uy/=ul; uz/=ul
    const vx=ny*uz-nz*uy, vy=nz*ux-nx*uz, vz=nx*uy-ny*ux
    bU[i*3+0]=ux; bU[i*3+1]=uy; bU[i*3+2]=uz
    bV[i*3+0]=vx; bV[i*3+1]=vy; bV[i*3+2]=vz
  }

  // ambient
  const rngA=mulberry32(SEED+777)
  const ambPos=new Float32Array(AMBIENT*3)
  const ambCol=new Float32Array(AMBIENT*3)
  const ambPh=new Float32Array(AMBIENT)
  for(let i=0;i<AMBIENT;i++){
    const th=rngA()*Math.PI*2, ph=Math.acos(rngA()*2-1), R=1.8+rngA()*1.6
    ambPos[i*3+0]=R*Math.sin(ph)*Math.cos(th)
    ambPos[i*3+1]=R*Math.sin(ph)*Math.sin(th)*0.92
    ambPos[i*3+2]=R*Math.cos(ph)*0.60
    const [cr,cg,cb]=srgbToLinear(PALETTE[Math.floor(rngA()*PALETTE.length)])
    const b=0.09+rngA()*0.16
    ambCol[i*3+0]=cr*b; ambCol[i*3+1]=cg*b; ambCol[i*3+2]=cb*b
    ambPh[i]=rngA()*Math.PI*2
  }

  // three
  const scene=new THREE.Scene()
  const camera=new THREE.PerspectiveCamera(46,1,0.1,100)
  camera.position.set(0,0,5)
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:!mobile,powerPreference:'high-performance'})
  renderer.setClearAlpha(0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
  container.appendChild(renderer.domElement)
  const group=new THREE.Group()
  scene.add(group)

  // core triangles
  const triVert=COUNT*3
  const triPos=new Float32Array(triVert*3)
  const triCol=new Float32Array(triVert*3)
  const triGeo=new THREE.BufferGeometry()
  triGeo.setAttribute('position', new THREE.BufferAttribute(triPos,3))
  triGeo.setAttribute('color', new THREE.BufferAttribute(triCol,3))
  const triMat=new THREE.ShaderMaterial({
    uniforms:{uOp:{value:0.96},uT:{value:0}},
    vertexShader:`attribute vec3 color; varying vec3 vC; void main(){ vC=color; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader:`varying vec3 vC; uniform float uOp; void main(){ gl_FragColor=vec4(vC,uOp); }`,
    vertexColors:true, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide
  })
  const triMesh=new THREE.Mesh(triGeo,triMat); triMesh.frustumCulled=false; group.add(triMesh)

  // halo triangles — same centers, 2.3x bigger, 0.18 opacity
  const haloPos=new Float32Array(triVert*3)
  const haloCol=new Float32Array(triVert*3)
  const haloGeo=new THREE.BufferGeometry()
  haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos,3))
  haloGeo.setAttribute('color', new THREE.BufferAttribute(haloCol,3))
  const haloMat=new THREE.ShaderMaterial({
    uniforms:{uOp:{value:0.20},uT:{value:0}},
    vertexShader:`attribute vec3 color; varying vec3 vC; void main(){ vC=color; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader:`varying vec3 vC; uniform float uOp; void main(){ gl_FragColor=vec4(vC,uOp*0.9); }`,
    vertexColors:true, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, depthTest:false
  })
  const haloMesh=new THREE.Mesh(haloGeo,haloMat); haloMesh.frustumCulled=false; group.add(haloMesh)

  // lines
  const maxPairs=Math.max(...conns.map(c=>c.length))/2
  const lPosA=new Float32Array(Math.max(1,maxPairs)*6), lColA=new Float32Array(Math.max(1,maxPairs)*6)
  const lPosB=new Float32Array(Math.max(1,maxPairs)*6), lColB=new Float32Array(Math.max(1,maxPairs)*6)
  const lGeoA=new THREE.BufferGeometry(); lGeoA.setAttribute('position', new THREE.BufferAttribute(lPosA,3)); lGeoA.setAttribute('color', new THREE.BufferAttribute(lColA,3))
  const lGeoB=new THREE.BufferGeometry(); lGeoB.setAttribute('position', new THREE.BufferAttribute(lPosB,3)); lGeoB.setAttribute('color', new THREE.BufferAttribute(lColB,3))
  const lMat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.38,depthWrite:false,blending:THREE.AdditiveBlending})
  const lineA=new THREE.LineSegments(lGeoA,lMat); const lineB=new THREE.LineSegments(lGeoB,lMat.clone() as any)
  lineA.frustumCulled=false; lineB.frustumCulled=false; group.add(lineA,lineB)

  // dust points
  const dPos=new Float32Array(AMBIENT*3), dCol=new Float32Array(AMBIENT*3)
  const dGeo=new THREE.BufferGeometry(); dGeo.setAttribute('position', new THREE.BufferAttribute(dPos,3)); dGeo.setAttribute('color', new THREE.BufferAttribute(dCol,3))
  const dMat=new THREE.ShaderMaterial({
    uniforms:{uT:{value:0}},
    vertexShader:`attribute vec3 color; varying vec3 vC; void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=1.6*(280./-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader:`varying vec3 vC; void main(){ float d=length(gl_PointCoord-vec2(0.5)); if(d>0.5) discard; float a=smoothstep(0.5,0.0,d)*0.60; gl_FragColor=vec4(vC,a); }`,
    vertexColors:true, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending
  })
  const dust=new THREE.Points(dGeo,dMat); dust.frustumCulled=false; scene.add(dust)

  // sizing
  let W=window.innerWidth, H=window.innerHeight, halfW=4, halfH=3, unit=1
  const updSize=()=>{
    W=window.innerWidth; H=window.innerHeight
    camera.aspect=W/H; camera.updateProjectionMatrix()
    renderer.setSize(W,H)
    const vFOV=camera.fov*Math.PI/180
    halfH=Math.tan(vFOV*0.5)*5; halfW=halfH*camera.aspect
    unit=Math.max(0.56, Math.min(mobile?1.05:1.42, halfW*(mobile?0.30:0.245)))
  }
  updSize()
  window.addEventListener('resize', updSize, {passive:true})

  // mouse
  const mouse={x:0,y:0,tx:0,ty:0}
  const repel={x:999,y:999,active:false}
  const onMM=(e:MouseEvent)=>{ const nx=(e.clientX/W)*2-1, ny=-(e.clientY/H)*2+1; mouse.tx=nx*halfW; mouse.ty=ny*halfH }
  window.addEventListener('mousemove', onMM, {passive:true})

  const centers=new Float32Array(COUNT*3)
  const dustC=new Float32Array(AMBIENT*3)

  let t=0, prev=performance.now(), morph=0, target=0
  const getTarget=()=>{
    const doc=document.documentElement
    const tot=doc.scrollHeight-window.innerHeight
    if(tot<=window.innerHeight*0.6){
      const span=Math.max(1,window.innerHeight*4.2)
      return Math.max(0,Math.min(1,window.scrollY/span))
    }
    return Math.max(0,Math.min(1,window.scrollY/tot))
  }
  const rotAt=(shape:Float32Array,i:number,ang:number, su:number):[number,number,number]=>{
    const i3=i*3, lx=shape[i3], ly=shape[i3+1], lz=shape[i3+2]
    const ca=Math.cos(ang), sa=Math.sin(ang)
    return [(lx*ca+lz*sa)*su, ly*su, (-lx*sa+lz*ca)*su]
  }
  const updLines=(geo:THREE.BufferGeometry, pairs:Uint32Array, w:number, su:number)=>{
    const pA=geo.getAttribute('position') as THREE.BufferAttribute, cA=geo.getAttribute('color') as THREE.BufferAttribute
    const pArr=pA.array as Float32Array, cArr=cA.array as Float32Array
    const n=pairs.length/2
    if(w<0.01 || n===0){ geo.setDrawRange(0,0); return }
    const link=CONN_D*su*1.55, start=link*0.78, range=link*0.95
    for(let p=0;p<n;p++){
      const a=pairs[p*2], b=pairs[p*2+1]
      const ax=centers[a*3], ay=centers[a*3+1], az=centers[a*3+2]
      const bx=centers[b*3], by=centers[b*3+1], bz=centers[b*3+2]
      const v0=p*6
      pArr[v0]=ax; pArr[v0+1]=ay; pArr[v0+2]=az
      pArr[v0+3]=bx; pArr[v0+4]=by; pArr[v0+5]=bz
      const dist=Math.hypot(bx-ax,by-ay,bz-az)
      const fade=1-Math.max(0,Math.min(1,(dist-start)/range))
      const alpha=Math.max(0,fade*w)
      const base=0.20 + (p%7)*0.013
      const r=IRIS_LIN[0]*base*alpha, g=IRIS_LIN[1]*base*alpha, bcol=IRIS_LIN[2]*base*alpha
      cArr[v0]=r; cArr[v0+1]=g; cArr[v0+2]=bcol
      cArr[v0+3]=r; cArr[v0+4]=g; cArr[v0+5]=bcol
    }
    pA.needsUpdate=true; cA.needsUpdate=true; geo.setDrawRange(0,n*2)
  }

  let raf=0
  const step=(dt:number)=>{
    t+=dt
    target=getTarget()
    const k=reduced?1:Math.min(1,dt*3.0); morph+=(target-morph)*k
    const mk=Math.min(1,dt*4.5); mouse.x+=(mouse.tx-mouse.x)*mk; mouse.y+=(mouse.ty-mouse.y)*mk
    const rk=Math.min(1,dt*10); repel.x+=(mouse.x-repel.x)*rk; repel.y+=(mouse.y-repel.y)*rk
    repel.active=Math.hypot(repel.x-mouse.x,repel.y-mouse.y)<80 || Math.abs(repel.x)<halfW*0.94

    const states=shapes.length, sf=morph*(states-1), sa=Math.min(Math.floor(sf),states-2), sb=sa+1
    const fRaw=Math.max(0,Math.min(1,sf-sa))
    const wB=fRaw*fRaw*(3-2*fRaw), wA=1-wB

    for(let i=0;i<COUNT;i++){
      const angA=t*rotSpd[sa]+seedAng[i]*0.15, angB=t*rotSpd[sb]+seedAng[i]*0.15
      const [ax,ay,az]=rotAt(shapes[sa],i,angA,unit)
      const [bx,by,bz]=rotAt(shapes[sb],i,angB,unit)
      const st=stagger[i], mStag=0.38
      const fi=Math.max(0,Math.min(1,(fRaw-st*mStag)/(1-mStag)))
      const ei=fi*fi*(3-2*fi)

      let px=ax+(bx-ax)*ei, py=ay+(by-ay)*ei, pz=az+(bz-az)*ei

      // Dala-like swirl turbulence — adds organic vortex in mid-transition
      // simulate curl noise with cross of sin phases
      const sw=Math.sin(Math.PI*fi)
      const turbAmp=sw*0.68*unit
      // primary turbulence
      px+=turb[i*3+0]*turbAmp
      py+=turb[i*3+1]*turbAmp
      pz+=turb[i*3+2]*turbAmp*0.6
      // secondary orbit swirl perpendicular to turb direction
      const sw2=sw*0.22*unit
      px+=Math.sin(t*0.9+seedAng[i])*sw2*0.6
      py+=Math.cos(t*0.85+seedAng[i]*1.3)*sw2*0.6
      pz+=Math.sin(t*0.7+seedAng[i]*0.7)*sw2*0.45

      const eE=Math.max(0,Math.min(1,(t-delay[i])/2.15))
      const ease=eE<0.5? 4*eE*eE*eE : 1-Math.pow(-2*eE+2,3)/2
      const sx=scatter[i*3+0]*unit, sy=scatter[i*3+1]*unit, sz=scatter[i*3+2]*unit
      px=sx*(1-ease)+px*ease; py=sy*(1-ease)+py*ease; pz=sz*(1-ease)+pz*ease

      if(repel.active){
        const dx=px-repel.x, dy=py-repel.y, d2=dx*dx+dy*dy, R=1.42, R2=R*R
        if(d2<R2 && d2>0.0006){
          const d=Math.sqrt(d2), push=(Math.sqrt(R2)-d)/Math.sqrt(R2)
          const pp=push*push*1.45
          px+=(dx/d)*pp; py+=(dy/d)*pp; pz+=pp*0.28
        }
      }
      centers[i*3+0]=px; centers[i*3+1]=py; centers[i*3+2]=pz

      const ang=t*spin[i]+seedAng[i]
      const ca=Math.cos(ang), saS=Math.sin(ang)
      const ux=bU[i*3+0], uy=bU[i*3+1], uz=bU[i*3+2]
      const vx=bV[i*3+0], vy=bV[i*3+1], vz=bV[i*3+2]
      const rUx=ux*ca+vx*saS, rUy=uy*ca+vy*saS, rUz=uz*ca+vz*saS
      const rVx=-ux*saS+vx*ca, rVy=-uy*saS+vy*ca, rVz=-uz*saS+vz*ca

      const breath=1+0.20*Math.sin(t*1.25+twPh[i])
      const szTri=size[i]*unit*breath
      const szH=szTri*2.35

      const base=i*9
      // core
      triPos[base+0]=px+rUx*szTri; triPos[base+1]=py+rUy*szTri; triPos[base+2]=pz+rUz*szTri
      triPos[base+3]=px+(-0.5*rUx+0.8660254*rVx)*szTri; triPos[base+4]=py+(-0.5*rUy+0.8660254*rVy)*szTri; triPos[base+5]=pz+(-0.5*rUz+0.8660254*rVz)*szTri
      triPos[base+6]=px+(-0.5*rUx-0.8660254*rVx)*szTri; triPos[base+7]=py+(-0.5*rUy-0.8660254*rVy)*szTri; triPos[base+8]=pz+(-0.5*rUz-0.8660254*rVz)*szTri
      // halo — larger
      haloPos[base+0]=px+rUx*szH; haloPos[base+1]=py+rUy*szH; haloPos[base+2]=pz+rUz*szH
      haloPos[base+3]=px+(-0.5*rUx+0.8660254*rVx)*szH; haloPos[base+4]=py+(-0.5*rUy+0.8660254*rVy)*szH; haloPos[base+5]=pz+(-0.5*rUz+0.8660254*rVz)*szH
      haloPos[base+6]=px+(-0.5*rUx-0.8660254*rVx)*szH; haloPos[base+7]=py+(-0.5*rUy-0.8660254*rVy)*szH; haloPos[base+8]=pz+(-0.5*rUz-0.8660254*rVz)*szH

      const tw=0.78+0.30*Math.sin(t*2.2+twPh[i])+0.12*Math.sin(t*0.8+seedAng[i])
      const rC=col[i*3+0]*tw*(0.5+0.5*ease), gC=col[i*3+1]*tw*(0.5+0.5*ease), bC=col[i*3+2]*tw*(0.5+0.5*ease)
      triCol[base+0]=rC; triCol[base+1]=gC; triCol[base+2]=bC
      triCol[base+3]=rC; triCol[base+4]=gC; triCol[base+5]=bC
      triCol[base+6]=rC; triCol[base+7]=gC; triCol[base+8]=bC
      // halo color dimmer same hue
      const hr=rC*0.72, hg=gC*0.72, hb=bC*0.72
      haloCol[base+0]=hr; haloCol[base+1]=hg; haloCol[base+2]=hb
      haloCol[base+3]=hr; haloCol[base+4]=hg; haloCol[base+5]=hb
      haloCol[base+6]=hr; haloCol[base+7]=hg; haloCol[base+8]=hb
    }
    ;(triGeo.attributes.position as any).needsUpdate=true; (triGeo.attributes.color as any).needsUpdate=true
    ;(haloGeo.attributes.position as any).needsUpdate=true; (haloGeo.attributes.color as any).needsUpdate=true
    triMat.uniforms.uT.value=t; haloMat.uniforms.uT.value=t

    updLines(lGeoA, conns[sa], wA, unit)
    updLines(lGeoB, conns[sb], wB, unit)

    if(!mobile){
      const maxY=(12*Math.PI)/180, maxX=(10*Math.PI)/180
      group.rotation.y=(mouse.x/Math.max(0.1,halfW))*maxY + t*0.014
      group.rotation.x=-(mouse.y/Math.max(0.1,halfH))*maxX
      group.rotation.z=(mouse.x/Math.max(0.1,halfW))*0.035
    }else{
      group.rotation.y=t*0.022
    }

    for(let i=0;i<AMBIENT;i++){
      const i3=i*3
      dustC[i3+0]=ambPos[i3+0]*unit+Math.sin(t*0.24+ambPh[i])*0.16
      dustC[i3+1]=ambPos[i3+1]*unit+Math.cos(t*0.20+ambPh[i])*0.14
      dustC[i3+2]=ambPos[i3+2]*unit+Math.sin(t*0.16+ambPh[i]*1.2)*0.09
      dCol[i3+0]=ambCol[i3+0]; dCol[i3+1]=ambCol[i3+1]; dCol[i3+2]=ambCol[i3+2]
    }
    dPos.set(dustC); (dGeo.attributes.position as any).needsUpdate=true; (dGeo.attributes.color as any).needsUpdate=true
    dMat.uniforms.uT.value=t
  }

  const loop=(now:number)=>{
    const dt=Math.min((now-prev)/1000,0.1); prev=now; step(dt); renderer.render(scene,camera); raf=requestAnimationFrame(loop)
  }

  if(reduced){
    step(9.0); renderer.render(scene,camera)
    const onS=()=>{ morph=getTarget(); step(0.03); renderer.render(scene,camera) }
    window.addEventListener('scroll', onS, {passive:true})
    return ()=>{
      window.removeEventListener('scroll', onS)
      window.removeEventListener('resize', updSize); window.removeEventListener('mousemove', onMM)
      cancelAnimationFrame(raf); renderer.dispose()
      triGeo.dispose(); haloGeo.dispose(); lGeoA.dispose(); lGeoB.dispose(); dGeo.dispose()
      triMat.dispose(); haloMat.dispose(); (lMat as any).dispose(); (lineB.material as any).dispose(); dMat.dispose()
      if(container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }

  raf=requestAnimationFrame(loop)
  return ()=>{
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', updSize); window.removeEventListener('mousemove', onMM)
    renderer.dispose()
    triGeo.dispose(); haloGeo.dispose(); lGeoA.dispose(); lGeoB.dispose(); dGeo.dispose()
    triMat.dispose(); haloMat.dispose(); lMat.dispose(); (lineB.material as any).dispose(); dMat.dispose()
    if(container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
  }
}
