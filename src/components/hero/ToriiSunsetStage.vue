<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { createBackdropSystem } from './torii-scene/backdrop'
import { createCloudsSystem } from './torii-scene/clouds'
import {
  clamp,
  COL_FOAM_BRIGHT,
  DEFAULT_SUN_X,
  DEFAULT_SUN_Y,
  H,
  hex,
  HOR,
  lerp,
  SKY,
  SUNR,
  W,
  type Point2D,
  type Rgb,
} from './torii-scene/constants'
import { createGullsSystem } from './torii-scene/gulls'
import { createSquaresRenderer, type StageViewport } from './torii-scene/renderer'
import { createWaterSystem } from './torii-scene/water'

const emit = defineEmits<{
  sunMoved: [moved: boolean]
  interacted: []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const cursorMode = ref<'default' | 'grab' | 'grabbing' | 'pointer'>('default')

// Modular scene subsystems
const backdrop = createBackdropSystem()
const clouds = createCloudsSystem()
const water = createWaterSystem()
const gulls = createGullsSystem((gx, gy, power) => water.spawnSplash(gx, gy, power))
const renderer = createSquaresRenderer()

const frameRgb = new Float32Array(W * H * 3)
const COL_SUN_EDGE = hex('#ffe6a0')
const COL_SUN_HALO = hex('#ffd488')

// Sun & pointer state
let sunX = DEFAULT_SUN_X
let sunY = DEFAULT_SUN_Y
let targetSunX = DEFAULT_SUN_X
let targetSunY = DEFAULT_SUN_Y
let lastBuiltSunX = -999
let lastBuiltSunY = -999
let wasSunMoved = false

let isDraggingSun = false
let dragOffsetX = 0
let dragOffsetY = 0
let pointerMovedWhileDown = false
let downGridX = 0
let downGridY = 0

let hoverGridX = -999
let hoverGridY = -999
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
let isVisible = true
let prefersReducedMotion = false
let simTime = 0
let lastFrameMs = 0

function addPixel(x: number, y: number, c: Rgb, alpha: number, upToLayer = 255) {
  const rx = Math.round(x)
  const ry = Math.round(y)
  if (rx < 0 || ry < 0 || rx >= W || ry >= H) return
  const idx = ry * W + rx
  if (backdrop.baseLayer[idx]! > upToLayer) return
  const a = clamp(alpha)
  const o = idx * 3
  frameRgb[o] = lerp(frameRgb[o]!, c[0], a)
  frameRgb[o + 1] = lerp(frameRgb[o + 1]!, c[1], a)
  frameRgb[o + 2] = lerp(frameRgb[o + 2]!, c[2], a)
}

function clientToGrid(clientX: number, clientY: number): Point2D | null {
  const cv = canvasRef.value
  if (!cv) return null
  const rect = cv.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  const lx = clientX - rect.left
  const ly = clientY - rect.top
  return [(lx - viewport.stageOffsetX) / viewport.cellPx, (ly - viewport.stageOffsetY) / viewport.cellPx]
}

function isPointNearSun(gx: number, gy: number): boolean {
  if (gy > HOR + 5) return false
  return Math.hypot(gx - sunX, gy - sunY) <= SUNR + 4.5
}

function updateCursor(gx: number, gy: number) {
  if (isDraggingSun) {
    cursorMode.value = 'grabbing'
    return
  }
  if (isPointNearSun(gx, gy)) {
    cursorMode.value = 'grab'
    return
  }
  if (gulls.isHoveringGull(gx, gy)) {
    cursorMode.value = 'pointer'
    return
  }
  cursorMode.value = 'default'
}

function stepScene(dt: number) {
  // 1. Viscous sun spring
  sunX += (targetSunX - sunX) * Math.min(1, dt * 13)
  sunY += (targetSunY - sunY) * Math.min(1, dt * 13)

  const movedNow = Math.hypot(targetSunX - DEFAULT_SUN_X, targetSunY - DEFAULT_SUN_Y) > 1.5
  if (movedNow !== wasSunMoved) {
    wasSunMoved = movedNow
    emit('sunMoved', movedNow)
  }

  if (Math.hypot(sunX - lastBuiltSunX, sunY - lastBuiltSunY) > 0.03) {
    backdrop.rebuildLitScene(sunX, sunY)
    lastBuiltSunX = sunX
    lastBuiltSunY = sunY
  }

  frameRgb.set(backdrop.baseRgb)

  // 2. High cirrus clouds (drift behind the sun)
  clouds.step(dt, prefersReducedMotion)
  clouds.renderPass('far', simTime, sunX, sunY, addPixel)

  // 3. Sun disc (occluded naturally by Torii gate, islands & horizon)
  const hoveringSun = isDraggingSun || isPointNearSun(hoverGridX, hoverGridY)
  const haloExtra = hoveringSun ? 2 : 0
  const rOuter = SUNR + haloExtra
  for (let y = Math.floor(sunY - rOuter); y <= Math.ceil(sunY + rOuter); y++) {
    for (let x = Math.floor(sunX - rOuter); x <= Math.ceil(sunX + rOuter); x++) {
      const d = Math.hypot(x - sunX, y - sunY)
      if (d < SUNR) {
        addPixel(x, y, d < SUNR - 2 ? COL_FOAM_BRIGHT : COL_SUN_EDGE, 1, SKY)
      } else if (hoveringSun && d < rOuter) {
        addPixel(x, y, COL_SUN_HALO, (1 - (d - SUNR) / haloExtra) * 0.42, SKY)
      }
    }
  }

  // 4. Mid & low sunset clouds + dispersed wind wisps (catch golden rim light as they cross the sun)
  clouds.renderPass('near', simTime, sunX, sunY, addPixel)

  // 5. Sea waves, foam, pointer wake & "glub!" splashes
  water.stepAndRender(dt, simTime, sunX, sunY, backdrop.baseLayer, addPixel)

  // 6. Flock of gulls & drifting feathers
  gulls.stepAndRender(dt, simTime, hoverGridX, hoverGridY, addPixel)
}

function syncCanvasSize() {
  const cv = canvasRef.value
  if (!cv) return
  const rect = cv.getBoundingClientRect()
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
  viewport.stageOffsetY = (viewport.viewH - H * viewport.cellPx) * 0.48
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

  if (!prefersReducedMotion) {
    simTime += dt
  }

  stepScene(dt)
  renderer.paintSquares100(ctx, frameRgb, viewport)

  const hasActiveInteractions =
    isDraggingSun ||
    Math.hypot(targetSunX - sunX, targetSunY - sunY) > 0.05 ||
    clouds.hasActiveInteractions() ||
    water.hasActiveInteractions() ||
    gulls.hasActiveInteractions()

  if (isVisible && (!prefersReducedMotion || hasActiveInteractions)) {
    rafId = requestAnimationFrame(renderLoop)
  }
}

function ensureRunning() {
  if (rafId === null && isVisible) {
    lastFrameMs = 0
    rafId = requestAnimationFrame(renderLoop)
  }
}

function onPointerDown(event: PointerEvent) {
  const pt = clientToGrid(event.clientX, event.clientY)
  if (!pt) return
  const [gx, gy] = pt

  downGridX = gx
  downGridY = gy
  pointerMovedWhileDown = false
  hoverGridX = gx
  hoverGridY = gy

  if (isPointNearSun(gx, gy)) {
    isDraggingSun = true
    dragOffsetX = sunX - gx
    dragOffsetY = sunY - gy
    cursorMode.value = 'grabbing'
    ;(event.currentTarget as HTMLElement | null)?.setPointerCapture?.(event.pointerId)
    emit('interacted')
    ensureRunning()
  }
}

function onPointerMove(event: PointerEvent) {
  const pt = clientToGrid(event.clientX, event.clientY)
  if (!pt) return
  const [gx, gy] = pt

  if (Math.hypot(gx - downGridX, gy - downGridY) > 1.2) {
    pointerMovedWhileDown = true
  }

  if (isDraggingSun) {
    targetSunX = clamp(gx + dragOffsetX, 16, W - 16)
    targetSunY = clamp(gy + dragOffsetY, 14, HOR + 6)
    hoverGridX = gx
    hoverGridY = gy
    ensureRunning()
    return
  }

  if (prevGridX > -500) {
    if (gy < HOR && prevGridY < HOR) {
      clouds.spawnWindSegment(prevGridX, prevGridY, gx, gy)
      ensureRunning()
    } else if (gy >= HOR + 0.5 && prevGridY >= HOR) {
      water.spawnWakeSegment(prevGridX, prevGridY, gx, gy)
      ensureRunning()
    }
  }

  prevGridX = gx
  prevGridY = gy
  hoverGridX = gx
  hoverGridY = gy
  updateCursor(gx, gy)
}

function onPointerUp(event: PointerEvent) {
  const pt = clientToGrid(event.clientX, event.clientY)

  if (isDraggingSun) {
    isDraggingSun = false
    ;(event.currentTarget as HTMLElement | null)?.releasePointerCapture?.(event.pointerId)
    if (pt) updateCursor(pt[0], pt[1])
    return
  }

  if (!pt || pointerMovedWhileDown) return
  const [gx, gy] = pt

  if (gy < HOR) {
    if (gulls.clickGull(gx, gy) || clouds.clickCloud(gx, gy, sunX, sunY)) {
      emit('interacted')
      updateCursor(gx, gy)
      ensureRunning()
    }
    return
  }

  water.spawnSplash(gx, gy, 1)
  emit('interacted')
  ensureRunning()
}

function onPointerLeave() {
  if (!isDraggingSun) {
    cursorMode.value = 'default'
  }
  hoverGridX = -999
  hoverGridY = -999
  prevGridX = -999
  prevGridY = -999
}

function resetSun() {
  targetSunX = DEFAULT_SUN_X
  targetSunY = DEFAULT_SUN_Y
  ensureRunning()
}

defineExpose({
  resetSun,
})

let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let motionQuery: MediaQueryList | null = null

function handleMotionChange(e: MediaQueryListEvent) {
  prefersReducedMotion = e.matches
  ensureRunning()
}

onMounted(() => {
  const cv = canvasRef.value
  if (!cv) return

  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion = motionQuery.matches
  motionQuery.addEventListener('change', handleMotionChange)

  syncCanvasSize()
  backdrop.rebuildLitScene(sunX, sunY)
  lastBuiltSunX = sunX
  lastBuiltSunY = sunY

  resizeObserver = new ResizeObserver(() => {
    syncCanvasSize()
    if (rafId === null) {
      const ctx = cv.getContext('2d')
      if (ctx) {
        stepScene(0.016)
        renderer.paintSquares100(ctx, frameRgb, viewport)
      }
    }
  })
  resizeObserver.observe(cv)

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      isVisible = entry.isIntersecting
      if (isVisible) {
        ensureRunning()
      } else if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    },
    { threshold: 0.02 },
  )
  intersectionObserver.observe(cv)

  ensureRunning()
})

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  motionQuery?.removeEventListener('change', handleMotionChange)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="torii-stage"
    :class="`is-${cursorMode}`"
    aria-hidden="true"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerLeave"
    @pointerleave="onPointerLeave"
  />
</template>

<style scoped lang="scss">
.torii-stage {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;

  &.is-grab {
    cursor: grab;
  }

  &.is-grabbing {
    cursor: grabbing;
  }

  &.is-pointer {
    cursor: pointer;
  }
}
</style>
