<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { BLACK_HOLE_COLS, BLACK_HOLE_ROWS, createBlackHoleSimulator } from './blackHoleGenerator'

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Monospace font parameters
const FONT_FAMILY = 'Menlo, Consolas, "DejaVu Sans Mono", "Liberation Mono", monospace'
const CELL_W = 10
const CELL_H = Math.round(CELL_W * 1.66) // Monospace cell height is ~1.66x width

// Speed multiplier (0.5x speed as requested)
const SPEED = 0.5
const TARGET_INTERVAL_MS = 1000 / 24 // 24 FPS target

let animationFrameId: number | null = null
let intersectionObserver: IntersectionObserver | null = null
let isVisible = false
let simTime = 0
let lastFrameTime = 0

// Fast glyph tile cache: (char + color) -> offscreen Canvas
const glyphAtlas = new Map<string, HTMLCanvasElement>()

function getGlyphTile(char: string, color: string, dpr: number): HTMLCanvasElement {
  const key = `${char}_${color}_${dpr}`
  const cached = glyphAtlas.get(key)
  if (cached) return cached

  const tile = document.createElement('canvas')
  tile.width = Math.ceil(CELL_W * dpr)
  tile.height = Math.ceil(CELL_H * dpr)
  const tCtx = tile.getContext('2d')

  if (tCtx) {
    tCtx.scale(dpr, dpr)
    tCtx.font = `${CELL_W / 0.602}px ${FONT_FAMILY}`
    tCtx.textBaseline = 'middle'
    tCtx.textAlign = 'center'
    tCtx.fillStyle = color
    tCtx.fillText(char, CELL_W / 2, CELL_H / 2)
  }

  glyphAtlas.set(key, tile)
  return tile
}

onMounted(() => {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = BLACK_HOLE_COLS * CELL_W * dpr
  canvas.height = BLACK_HOLE_ROWS * CELL_H * dpr

  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  const simulator = createBlackHoleSimulator()
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const canvasWidth = canvas.width
  const canvasHeight = canvas.height

  function drawFrame(time: number) {
    if (!ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.restore()

    const frame = simulator(time)
    const { cols, rows, chars, colors } = frame

    for (let y = 0; y < rows; y++) {
      const rowOffset = y * cols
      const dy = y * CELL_H * dpr
      for (let x = 0; x < cols; x++) {
        const idx = rowOffset + x
        const char = chars[idx]
        if (!char || char === ' ') continue

        const color = colors[idx] ?? '#ffffff'
        const tile = getGlyphTile(char, color, dpr)
        const dx = x * CELL_W * dpr
        ctx.drawImage(tile, dx, dy)
      }
    }
  }

  // If user prefers reduced motion, render a single still frame at t=1.0 and do not animate
  if (prefersReducedMotion) {
    drawFrame(1.0)
    return
  }

  function loop(now: number) {
    if (!isVisible) {
      animationFrameId = null
      return
    }

    if (now - lastFrameTime >= TARGET_INTERVAL_MS) {
      const deltaSec = lastFrameTime > 0 ? (now - lastFrameTime) / 1000 : 1 / 24
      simTime += deltaSec * SPEED
      lastFrameTime = now
      drawFrame(simTime)
    }

    animationFrameId = requestAnimationFrame(loop)
  }

  // Observe visibility to avoid consuming CPU/GPU when the section is offscreen
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      isVisible = entry.isIntersecting
      if (isVisible && !animationFrameId) {
        lastFrameTime = performance.now()
        animationFrameId = requestAnimationFrame(loop)
      } else if (!isVisible && animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    },
    { threshold: 0.05 },
  )

  intersectionObserver.observe(container)
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }
  glyphAtlas.clear()
})
</script>

<template>
  <div ref="containerRef" class="resume-black-hole" aria-hidden="true">
    <canvas ref="canvasRef" class="resume-black-hole__canvas" />
  </div>
</template>

<style scoped lang="scss">
.resume-black-hole {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  opacity: 0.85;

  &__canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
    user-select: none;
  }
}
</style>
