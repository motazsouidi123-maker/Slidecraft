import { useEffect, useRef } from 'react'
import {
  WebGLRenderer, Scene, PerspectiveCamera, PMREMGenerator, Group, Mesh, BoxGeometry, TorusGeometry,
  MeshStandardMaterial, CanvasTexture, SRGBColorSpace, ACESFilmicToneMapping, AmbientLight, DirectionalLight,
  PointLight, BufferGeometry, Float32BufferAttribute, Points, PointsMaterial, AdditiveBlending, MathUtils,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/*
  PRESORA cinematic hero: three floating metallic presentation slides, a gold ring and drifting gold dust.
  - Loaded only on demand (see HeroVisual in ui.jsx); never part of the main bundle.
  - Renders only while visible on screen and while the tab is active.
  - Calm by design: slow autonomous drift only (no pointer following, no scroll parallax).
  - Mobile/low-power/reduced-motion devices never load this file (see HeroVisual in ui.jsx).
  - Lower pixel ratio, fewer particles, ~30fps and no antialiasing if it is ever used on a small screen.
  - If anything fails (no WebGL, lost context) it calls onFail and the flat hero is shown instead.
*/

const SERIF = '"Cormorant Garamond", Georgia, "Times New Roman", serif'
const SANS = 'Manrope, system-ui, sans-serif'

function faceTexture(kind, aniso) {
  const W = 1024, H = 640
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const g = c.getContext('2d')
  const spaced = (txt, x, y, ls, align = 'left') => {
    if ('letterSpacing' in g) g.letterSpacing = `${ls}px`
    g.textAlign = align; g.fillText(txt, x, y)
    if ('letterSpacing' in g) g.letterSpacing = '0px'
  }
  if (kind === 0) {
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#171512'); bg.addColorStop(1, '#0B0B0B')
    g.fillStyle = bg; g.fillRect(0, 0, W, H)
    g.fillStyle = '#C08A52'; g.font = `500 20px ${SANS}`; spaced('PRESORA', 72, 92, 8); spaced('01', W - 72, 92, 4, 'right')
    g.fillStyle = '#C08A52'; g.fillRect(72, 360, 110, 3)
    g.fillStyle = '#F5F1EA'; g.font = `italic 300 96px ${SERIF}`; g.textAlign = 'left'; g.fillText('Annual Strategy', 72, 466)
    g.fillStyle = '#E9C99A'; g.font = `500 22px ${SANS}`; spaced('CORPORATE PRESENTATION', 72, 520, 6)
  } else if (kind === 1) {
    g.fillStyle = '#F5F1EA'; g.fillRect(0, 0, W, H)
    g.fillStyle = '#8F867B'; g.font = `500 20px ${SANS}`; spaced('ESSAY / 02', 72, 92, 7)
    g.fillStyle = '#0B0B0B'; g.font = `300 124px ${SERIF}`; g.textAlign = 'left'
    g.fillText('Less, but', 72, 330); g.font = `italic 300 124px ${SERIF}`; g.fillText('better.', 72, 450)
    g.fillStyle = '#0B0B0B'; g.fillRect(72, 540, 270, 5)
    g.fillStyle = 'rgba(143,134,123,.35)'; g.fillRect(372, 540, 270, 5); g.fillRect(672, 540, 270, 5)
  } else {
    const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#7a5530'); bg.addColorStop(0.5, '#C08A52'); bg.addColorStop(1, '#7a5530')
    g.fillStyle = bg; g.fillRect(0, 0, W, H)
    g.fillStyle = 'rgba(245,241,234,.75)'; g.font = `500 20px ${SANS}`; spaced('STORY / 03', 72, 92, 7)
    g.fillStyle = '#F5F1EA'; g.font = `italic 300 86px ${SERIF}`; g.textAlign = 'left'
    g.fillText('Every story begins', 72, 330); g.fillText('with a single slide.', 72, 436)
    g.fillStyle = 'rgba(245,241,234,.7)'; g.fillRect(72, 520, 150, 3)
  }
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = aniso
  return t
}

const clamp01 = v => Math.min(1, Math.max(0, v))
const easeOut = v => 1 - Math.pow(1 - v, 3)
const introDone = () => { try { return sessionStorage.getItem('presora_intro') === '1' } catch { return true } }

export default function Hero3D({ onFail }) {
  const host = useRef(null)
  const fail = useRef(onFail)
  fail.current = onFail

  useEffect(() => {
    const el = host.current
    let dead = false, raf = 0, running = false, visible = true, teardown = null

    const build = () => {
      const mobile = window.matchMedia('(max-width: 767px)').matches
      const disposables = []
      const track = o => { disposables.push(o); return o }

      const renderer = new WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: 'default' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75))
      renderer.toneMapping = ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
      el.appendChild(renderer.domElement)

      const scene = new Scene()
      const pmrem = new PMREMGenerator(renderer)
      const envScene = new RoomEnvironment()
      const envTex = pmrem.fromScene(envScene, 0.04).texture
      scene.environment = envTex
      if ('environmentIntensity' in scene) scene.environmentIntensity = 0.55

      const camera = new PerspectiveCamera(35, 1, 0.1, 60)
      const rig = new Group(); scene.add(rig)

      // Materials: metallic bronze edges, gold accents, slide faces drawn on canvas
      const bronze = track(new MeshStandardMaterial({ color: 0x9a6a3a, metalness: 1, roughness: 0.34 }))
      const dark = track(new MeshStandardMaterial({ color: 0x1a1410, metalness: 0.9, roughness: 0.45 }))
      const goldMat = track(new MeshStandardMaterial({ color: 0xe9c99a, metalness: 1, roughness: 0.22 }))

      const aniso = Math.min(renderer.capabilities.getMaxAnisotropy(), mobile ? 2 : 8)
      const cardGeo = track(new BoxGeometry(3.4, 2.125, 0.07))
      const defs = [
        { pos: [-1.75, 0.55, -1.3], rot: [0.04, 0.36, -0.12], s: 1 },
        { pos: [1.75, -0.2, -0.3], rot: [-0.03, -0.32, 0.08], s: 1 },
        { pos: [-0.1, -0.4, 1.2], rot: [0.02, 0.08, -0.03], s: 1.12 },
      ]
      const cards = defs.map((d, i) => {
        const map = track(faceTexture(i, aniso))
        const face = track(new MeshStandardMaterial({ map, emissiveMap: map, emissive: 0xffffff, emissiveIntensity: 0.38, metalness: 0.12, roughness: 0.55 }))
        const m = new Mesh(cardGeo, [bronze, bronze, bronze, bronze, face, dark])
        m.position.set(...d.pos); m.rotation.set(...d.rot); m.scale.setScalar(d.s)
        m.userData = { base: d.pos.slice(), baseRot: d.rot.slice(), phase: i * 2.1 }
        rig.add(m); return m
      })

      // Gold rings
      const ringGeo = track(new TorusGeometry(2.9, 0.014, 12, mobile ? 100 : 180))
      const ring = new Mesh(ringGeo, goldMat); ring.rotation.set(1.15, 0.2, 0.3); rig.add(ring)
      const ring2 = new Mesh(track(new TorusGeometry(3.6, 0.008, 12, mobile ? 100 : 180)), bronze); ring2.rotation.set(1.35, -0.25, -0.2); rig.add(ring2)

      // Gold dust
      const count = mobile ? 90 : 220
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        const r = 3 + Math.random() * 4.2, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1)
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7; pos[i * 3 + 2] = r * Math.cos(ph)
      }
      const dustGeo = track(new BufferGeometry()); dustGeo.setAttribute('position', new Float32BufferAttribute(pos, 3))
      const dustMat = track(new PointsMaterial({ color: 0xe9c99a, size: mobile ? 0.05 : 0.04, transparent: true, opacity: 0.7, depthWrite: false, blending: AdditiveBlending }))
      const dust = new Points(dustGeo, dustMat); rig.add(dust)

      // Lights
      scene.add(new AmbientLight(0x2a2018, 0.6))
      const key = new DirectionalLight(0xffe2b8, 2.1); key.position.set(4, 5, 6); scene.add(key)
      const rim = new PointLight(0xc08a52, 18, 22); rim.position.set(-5, -2, 3); scene.add(rim)

      // Sizing
      let baseZ = 11
      const resize = () => {
        const w = el.clientWidth || 1, h = el.clientHeight || 1
        renderer.setSize(w, h)
        camera.aspect = w / h; camera.updateProjectionMatrix()
        baseZ = Math.max(10.5, 12.7 / camera.aspect)
      }
      resize()
      const ro = new ResizeObserver(resize); ro.observe(el)

      // Gentle autonomous drift only: no pointer following, no scroll parallax
      const cur = { x: 0, y: 0 }

      // Loop
      const t0 = performance.now()
      let started = false, tStart = 0, chk = 0, shown = false, skip = false
      const loop = () => {
        if (!running) return
        raf = requestAnimationFrame(loop)
        if (mobile) { skip = !skip; if (skip) return }
        const now = performance.now(), t = (now - t0) / 1000
        if (!started) {
          if ((++chk % 15 === 0 && introDone()) || now - t0 > 5600) { started = true; tStart = now }
        }
        const k = started ? easeOut(clamp01((now - tStart) / 2600)) : 0

        const tx = Math.sin(t * 0.3) * 0.5
        const ty = Math.cos(t * 0.24) * 0.25
        cur.x += (tx - cur.x) * 0.04; cur.y += (ty - cur.y) * 0.04

        camera.position.set(0, 0, MathUtils.lerp(baseZ + 4.5, baseZ, k))
        camera.lookAt(0, 0, 0)
        rig.rotation.y = cur.x * 0.3 + (1 - k) * -0.5
        rig.rotation.x = cur.y * 0.12
        rig.scale.setScalar(0.82 + 0.18 * k)

        cards.forEach(m => {
          const u = m.userData
          m.position.y = u.base[1] + Math.sin(t * 0.8 + u.phase) * 0.12
          m.rotation.y = u.baseRot[1] + Math.sin(t * 0.4 + u.phase) * 0.04
        })
        ring.rotation.z = 0.3 + t * 0.12; ring2.rotation.z = -0.2 - t * 0.07
        dust.rotation.y = t * 0.02

        renderer.render(scene, camera)
        if (!shown) { shown = true; el.style.opacity = '1' }
      }
      const start = () => { if (!running && visible && !document.hidden) { running = true; loop() } }
      const stop = () => { running = false; cancelAnimationFrame(raf) }

      const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop() }) : null
      if (io) io.observe(el)
      const onVis = () => { document.hidden ? stop() : start() }
      document.addEventListener('visibilitychange', onVis)
      const onLost = e => { e.preventDefault(); stop(); if (fail.current) fail.current() }
      renderer.domElement.addEventListener('webglcontextlost', onLost)
      start()

      teardown = () => {
        stop(); ro.disconnect(); if (io) io.disconnect()
        document.removeEventListener('visibilitychange', onVis)
        renderer.domElement.removeEventListener('webglcontextlost', onLost)
        disposables.forEach(o => o.dispose && o.dispose())
        envTex.dispose(); pmrem.dispose(); if (envScene.dispose) envScene.dispose()
        renderer.dispose(); renderer.forceContextLoss()
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }

    const boot = async () => {
      try {
        if (document.fonts && document.fonts.load) {
          await Promise.race([document.fonts.load('italic 300 80px "Cormorant Garamond"'), new Promise(r => setTimeout(r, 1200))])
        }
      } catch { /* draw with fallback fonts */ }
      if (dead) return
      try { build() } catch { if (fail.current) fail.current() }
    }
    boot()

    return () => { dead = true; if (teardown) teardown() }
  }, [])

  return <div ref={host} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: 0 }} />
}
