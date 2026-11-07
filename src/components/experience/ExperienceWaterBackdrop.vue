<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import {
  clamp,
  COL_DARK,
  COL_DEEP_CAVITY,
  COL_FOAM_BRIGHT,
  COL_FOAM_WARM,
  CX,
  H,
  hex,
  lerp,
  mix,
  nearestPaletteIndex,
  PAL_HEX,
  W,
  type Point2D,
  type Rgb,
} from '@/components/hero/torii-scene/constants'
import type { StageViewport } from '@/components/hero/torii-scene/renderer'

interface WakeNode {
  x: number
  y: number
  age: number
  maxAge: number
  strength: number
}

interface SplashDroplet {
  vx: number
  vy: number
}

interface WaterSplash {
  x: number
  y: number
  age: number
  maxAge: number
  power: number
  droplets: SplashDroplet[]
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Exact colors from the Hero's sunset water system
const COL_SURF = hex('#f8c8b0')

const cellRgb = new Uint8ClampedArray(W * H * 3)
const cellAlpha = new Float32Array(W * H)

const wakes: WakeNode[] = []
const splashes: WaterSplash[] = []

let prevGridX = -999
let prevGridY = -999

const viewport: StageViewport = {
  viewW: 0,
  viewH: 0,
  dpr: 1,
  cellPx: 8,
  stageOffsetX: 0,
  stageOffsetY: 0,
}

let rafId: number | null = null
let isVisible = false
let prefersReducedMotion = false
let lastFrameMs = 0

function addPixel(x: number, y: number, c: Rgb, alpha: number) {
  const rx = Math.round(x)
  const ry = Math.round(y)
  if (rx < 0 || ry < 0 || rx >= W || ry >= H) return
  const idx = ry * W + rx
  const a = clamp(alpha)
  if (a <= 0.04) return

  const curA = cellAlpha[idx]!
  const newA = Math.min(1, curA + a * (1 - curA * 0.4))
  cellAlpha[idx] = newA

  const o = idx * 3
  const blend = a / Math.max(0.001, curA + a)
  cellRgb[o] = Math.round(lerp(cellRgb[o]!, c[0], blend))
  cellRgb[o + 1] = Math.round(lerp(cellRgb[o + 1]!, c[1], blend))
  cellRgb[o + 2] = Math.round(lerp(cellRgb[o + 2]!, c[2], blend))
}

function spawnWakeSegment(x0: number, y0: number, x1: number, y1: number) {
  if (prefersReducedMotion) return

  const dist = Math.hypot(x1 - x0, y1 - y0)
  if (dist < 0.6) return

  // Cleaner, sparser steps to avoid excess dots
  const steps = Math.min(4, Math.max(1, Math.ceil(dist / 3.4)))
  const strength = clamp(dist / 4.8, 0.35, 1.0)

  for (let s = 1; s <= steps; s++) {
    const u = s / steps
    const wx = lerp(x0, x1, u)
    const wy = lerp(y0, y1, u)
    if (wy < 0 || wy >= H) continue
    wakes.push({
      x: wx,
      y: wy,
      age: 0,
      maxAge: 0.82,
      strength,
    })
  }

  if (wakes.length > 50) wakes.splice(0, wakes.length - 50)
}

function spawnSplash(gx: number, gy: number, power = 1) {
  if (prefersReducedMotion) return

  const cy = clamp(gy, 2, H - 2)
  const droplets: SplashDroplet[] = Array.from({ length: 5 }, (_, i) => {
    const spread = (i - 2) / 2
    return {
      vx: spread * (11 + (i % 2) * 4) * power,
      vy: (14 + (1 - Math.abs(spread)) * 10) * power,
    }
  })

  splashes.push({
    x: gx,
    y: cy,
    age: 0,
    maxAge: 1.6,
    power,
    droplets,
  })

  if (splashes.length > 6) splashes.shift()
}

function hasActiveInteractions(): boolean {
  return wakes.length > 0 || splashes.length > 0
}

function stepScene(dt: number) {
  cellAlpha.fill(0)
  cellRgb.fill(0)

  // 1. Pointer wake on the water ("algo passando na água" - sparser, cleaner dots)
  for (let idx = wakes.length - 1; idx >= 0; idx--) {
    const wk = wakes[idx]!
    wk.age += dt
    if (wk.age >= wk.maxAge) {
      wakes.splice(idx, 1)
      continue
    }

    const prog = wk.age / wk.maxAge
    const fade = (1 - prog) ** 1.35 * wk.strength
    const depthK = clamp(wk.y / H)
    const rx = 1.4 + prog * (4.2 + depthK * 3.8)
    const ry = Math.max(1.0, rx * (0.42 + 0.28 * depthK))
    const sunProx = clamp(1 - Math.abs(wk.x - CX) / (24 + depthK * 32))
    const wakeCrest = mix(COL_SURF, COL_FOAM_BRIGHT, 0.5 + sunProx * 0.5)

    // Sparser sampling to keep the ripple subtle and minimalist
    const samples = Math.max(6, Math.ceil(rx * 2.8))
    for (let s = 0; s < samples; s++) {
      const ang = (s / samples) * Math.PI * 2
      const px = wk.x + Math.cos(ang) * rx
      const py = wk.y + Math.sin(ang) * ry
      if (py < 0 || py >= H) continue

      addPixel(px, py, wakeCrest, fade * 0.8)

      if (prog < 0.5 && s % 2 === 0) {
        addPixel(
          wk.x + Math.cos(ang) * Math.max(0, rx - 1.1),
          wk.y + Math.sin(ang) * Math.max(0, ry - 0.7),
          COL_DEEP_CAVITY,
          fade * 0.4,
        )
      }
    }

    // Leading bright foam dot right under cursor
    if (wk.age < 0.14) {
      addPixel(wk.x, wk.y, COL_FOAM_BRIGHT, (1 - wk.age / 0.14) * 0.95 * wk.strength)
    }
  }

  // 2. Click splashes ("glub!" plunge + Worthington rebound jet + droplets + concentric rings)
  for (let idx = splashes.length - 1; idx >= 0; idx--) {
    const sp = splashes[idx]!
    sp.age += dt
    if (sp.age >= sp.maxAge) {
      splashes.splice(idx, 1)
      continue
    }

    const depthK = clamp(sp.y / H)
    const perspY = 0.36 + 0.32 * depthK
    const ringCrest = mix(COL_FOAM_WARM, COL_FOAM_BRIGHT, 0.65)

    // Phase A: Dark plunge cavity
    if (sp.age < 0.24) {
      const cp = 1 - sp.age / 0.24
      const cr = 2.0 * sp.power * cp
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -Math.ceil(cr); dx <= Math.ceil(cr); dx++) {
          if (Math.hypot(dx, dy * 1.8) <= cr + 0.3) {
            addPixel(sp.x + dx, sp.y + dy, COL_DARK, cp * 0.85)
          }
        }
      }
    }

    // Phase B: Worthington rebound jet
    if (sp.age >= 0.12 && sp.age < 0.42) {
      const jp = (sp.age - 0.12) / 0.3
      const arch = Math.sin(jp * Math.PI)
      const jetH = Math.round(arch * 4.2 * sp.power)
      for (let h = 0; h <= jetH; h++) {
        addPixel(
          sp.x,
          sp.y - h,
          h === jetH ? COL_FOAM_BRIGHT : COL_FOAM_WARM,
          (1 - jp * 0.45) * 0.9,
        )
      }
    }

    // Phase C: Ballistic droplets in the air
    if (sp.age < 0.46) {
      const gravity = 65
      const dpAlpha = clamp(1 - sp.age / 0.46)
      for (const d of sp.droplets) {
        const dx = sp.x + d.vx * sp.age
        const dy = sp.y - d.vy * sp.age + 0.5 * gravity * sp.age * sp.age
        if (dy <= sp.y + 1) {
          addPixel(dx, dy, COL_FOAM_BRIGHT, dpAlpha * 0.95)
        }
      }
    }

    // Phase D: Single clean expanding ring
    const rp = sp.age / sp.maxAge
    if (rp < 1) {
      const rx = (1.6 + rp * 18) * sp.power
      const ry = Math.max(1, rx * perspY)
      const alpha = (1 - rp) ** 1.55 * 0.75
      const steps = Math.max(10, Math.ceil(rx * 3.2))

      for (let s = 0; s < steps; s++) {
        const ang = (s / steps) * Math.PI * 2
        const px = sp.x + Math.cos(ang) * rx
        const py = sp.y + Math.sin(ang) * ry
        if (py < 0 || py >= H) continue

        addPixel(px, py, ringCrest, alpha)
        if (s % 2 === 0) {
          addPixel(
            sp.x + Math.cos(ang) * Math.max(0, rx - 1.1),
            sp.y + Math.sin(ang) * Math.max(0, ry - 0.6),
            COL_DEEP_CAVITY,
            alpha * 0.45,
          )
        }
      }
    }
  }
}

// Exact Halftone Squares renderer (Quadriculado style from Hero with clean cutoff)
function paintSquares(ctx: CanvasRenderingContext2D, vp: StageViewport) {
  const { viewW, viewH, dpr, cellPx, stageOffsetX, stageOffsetY } = vp
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, viewW, viewH)

  const paths = new Map<number, Path2D>()
  const minDot = 0.3
  const steps = 3

  const cStart = Math.max(0, Math.floor(-stageOffsetX / cellPx))
  const cEnd = Math.min(W - 1, Math.ceil((viewW - stageOffsetX) / cellPx))
  const rStart = Math.max(0, Math.floor(-stageOffsetY / cellPx))
  const rEnd = Math.min(H - 1, Math.ceil((viewH - stageOffsetY) / cellPx))

  for (let r = rStart; r <= rEnd; r++) {
    const cy = stageOffsetY + (r + 0.5) * cellPx
    const rowOffset = r * W
    for (let c = cStart; c <= cEnd; c++) {
      const idx = rowOffset + c
      const alpha = cellAlpha[idx]!
      // Filter out peripheral faint fuzz to keep only crisp, distinct dots
      if (alpha < 0.12) continue

      const o = idx * 3
      const cr = cellRgb[o]!
      const cg = cellRgb[o + 1]!
      const cb = cellRgb[o + 2]!

      const palIdx = nearestPaletteIndex(cr, cg, cb)
      const v = Math.ceil(alpha * steps) / steps
      const half = 0.5 * cellPx * (minDot + (1 - minDot) * v)
      if (half < 0.25) continue

      let path = paths.get(palIdx)
      if (!path) {
        path = new Path2D()
        paths.set(palIdx, path)
      }
      const cx = stageOffsetX + (c + 0.5) * cellPx
      path.rect(cx - half, cy - half, half * 2, half * 2)
    }
  }

  for (const [palIdx, path] of paths) {
    ctx.fillStyle = PAL_HEX[palIdx]!
    ctx.fill(path)
  }
}

function syncCanvasSize() {
  const cv = canvasRef.value
  if (!cv || !cv.parentElement) return

  const rect = cv.parentElement.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return

  viewport.viewW = rect.width
  viewport.viewH = rect.height
  viewport.dpr = Math.min(window.devicePixelRatio || 1, 2)

  const targetW = Math.round(viewport.viewW * viewport.dpr)
  const targetH = Math.round(viewport.viewH * viewport.dpr)
  if (cv.width !== targetW || cv.height !== targetH) {
    cv.width = targetW
    cv.height = targetH
  }

  viewport.cellPx = Math.max(viewport.viewW / W, viewport.viewH / H)
  viewport.stageOffsetX = (viewport.viewW - W * viewport.cellPx) * 0.5
  viewport.stageOffsetY = (viewport.viewH - H * viewport.cellPx) * 0.5
}

function renderLoop(nowMs: number) {
  rafId = null
  const cv = canvasRef.value
  if (!cv) return
  const ctx = cv.getContext('2d')
  if (!ctx) return

  const rawDt = lastFrameMs ? (nowMs - lastFrameMs) / 1000 : 1 / 60
  lastFrameMs = nowMs
  const dt = Math.min(0.05, Math.max(0.001, rawDt))

  stepScene(dt)
  paintSquares(ctx, viewport)

  // Only animate while active wakes or splashes remain
  if (isVisible && hasActiveInteractions()) {
    rafId = requestAnimationFrame(renderLoop)
  }
}

function ensureRunning() {
  if (rafId === null && isVisible && !prefersReducedMotion) {
    lastFrameMs = performance.now()
    rafId = requestAnimationFrame(renderLoop)
  }
}

function clientToGrid(clientX: number, clientY: number): Point2D | null {
  const cv = canvasRef.value
  if (!cv) return null
  const rect = cv.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  const lx = clientX - rect.left
  const ly = clientY - rect.top
  return [
    (lx - viewport.stageOffsetX) / viewport.cellPx,
    (ly - viewport.stageOffsetY) / viewport.cellPx,
  ]
}

function handlePointerMove(e: PointerEvent) {
  const pt = clientToGrid(e.clientX, e.clientY)
  if (!pt) return
  const [gx, gy] = pt

  if (prevGridX > -500) {
    spawnWakeSegment(prevGridX, prevGridY, gx, gy)
    ensureRunning()
  }

  prevGridX = gx
  prevGridY = gy
}

function handlePointerDown(e: PointerEvent) {
  const pt = clientToGrid(e.clientX, e.clientY)
  if (!pt) return
  const [gx, gy] = pt
  spawnSplash(gx, gy, 1)
  ensureRunning()
}

function handlePointerLeave() {
  prevGridX = -999
  prevGridY = -999
}

defineExpose({
  handlePointerMove,
  handlePointerDown,
  handlePointerLeave,
})

let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let motionQuery: MediaQueryList | null = null
let targetSection: HTMLElement | null = null

function handleMotionChange(e: MediaQueryListEvent) {
  prefersReducedMotion = e.matches
  if (prefersReducedMotion) {
    wakes.length = 0
    splashes.length = 0
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
}

onMounted(() => {
  const cv = canvasRef.value
  if (!cv) return

  targetSection = cv.closest<HTMLElement>('.experience-section') || cv.parentElement
  if (!targetSection) return

  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)

  syncCanvasSize()

  targetSection.addEventListener('pointermove', handlePointerMove, { passive: true })
  targetSection.addEventListener('pointerdown', handlePointerDown, { passive: true })
  targetSection.addEventListener('pointerleave', handlePointerLeave, { passive: true })

  resizeObserver = new ResizeObserver(() => {
    syncCanvasSize()
  })
  resizeObserver.observe(targetSection)

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      isVisible = entry.isIntersecting
      if (isVisible && hasActiveInteractions()) {
        ensureRunning()
      } else if (!isVisible && rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    },
    { threshold: 0.05 },
  )
  intersectionObserver.observe(targetSection)
})

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }

  if (targetSection) {
    targetSection.removeEventListener('pointermove', handlePointerMove)
    targetSection.removeEventListener('pointerdown', handlePointerDown)
    targetSection.removeEventListener('pointerleave', handlePointerLeave)
  }

  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  motionQuery?.removeEventListener('change', handleMotionChange)
})
</script>

<template>
  <div class="experience-water" aria-hidden="true">
    <canvas ref="canvasRef" class="experience-water__canvas" />
  </div>
</template>

<style scoped lang="scss">
.experience-water {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0; // Positioned in the background behind cards and title
  overflow: hidden;

  &__canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    user-select: none;
  }
}
</style>
