<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const stripCanvasRef = ref<HTMLCanvasElement | null>(null)

let stripRafId: number | null = null
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let isVisible = true
let pointerNormX = -1
let pointerEnergy = 0

function renderStripFrame(timeMs: number) {
  const canvas = stripCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const cssW = canvas.clientWidth
  const cssH = canvas.clientHeight
  if (cssW <= 0 || cssH <= 0) return

  const targetW = Math.round(cssW * dpr)
  const targetH = Math.round(cssH * dpr)
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW
    canvas.height = targetH
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssW, cssH)

  const cell = 6
  const step = cell + 1
  const cols = Math.ceil(cssW / step)
  const rows = Math.floor(cssH / step)
  const t = timeMs * 0.0014

  pointerEnergy *= 0.95

  for (let r = 0; r < rows; r++) {
    const rowDepth = (r + 1) / Math.max(1, rows)
    const y = cssH - (rows - r) * step

    for (let c = 0; c < cols; c++) {
      const nx = c / Math.max(1, cols - 1)
      const centerGlow = Math.exp(-Math.pow((nx - 0.52) / 0.28, 2))

      const waveA = Math.sin(c * 0.21 + t + r * 0.85)
      const waveB = Math.cos(c * 0.11 - t * 0.72 + r * 1.2)
      let shimmer = (waveA * 0.55 + waveB * 0.45) * 0.5 + 0.5

      if (pointerNormX >= 0 && pointerEnergy > 0.01) {
        const dist = Math.abs(nx - pointerNormX)
        const ripple = Math.exp(-Math.pow(dist / 0.09, 2)) * Math.sin(dist * 46 - t * 3.4)
        shimmer += pointerEnergy * (0.42 * Math.exp(-Math.pow(dist / 0.11, 2)) + ripple * 0.22)
      }

      const intensity = shimmer * (0.28 + 0.72 * rowDepth) * (0.35 + 0.65 * centerGlow)
      if (intensity < 0.16) continue

      const alpha = Math.min(0.62, (intensity - 0.14) * 0.78)
      const warmMix = Math.min(1, centerGlow * 0.75 + pointerEnergy * 0.35)
      const red = Math.round(58 + warmMix * 188)
      const green = Math.round(42 + warmMix * 124)
      const blue = Math.round(68 + warmMix * 24)

      ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`
      ctx.fillRect(c * step, y, cell, cell)
    }
  }
}

function tickStrip(now: number) {
  stripRafId = null
  if (!isVisible) return
  renderStripFrame(now)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stripRafId = requestAnimationFrame(tickStrip)
  }
}

function startStrip() {
  if (stripRafId === null && isVisible) {
    stripRafId = requestAnimationFrame(tickStrip)
  }
}

function pulsePointer(normX: number) {
  pointerNormX = Math.min(1, Math.max(0, normX))
  pointerEnergy = Math.min(1, pointerEnergy + 0.18)
}

onMounted(() => {
  if (typeof IntersectionObserver !== 'undefined' && stripCanvasRef.value) {
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        isVisible = entry.isIntersecting
        if (isVisible) startStrip()
        else if (stripRafId !== null) {
          cancelAnimationFrame(stripRafId)
          stripRafId = null
        }
      },
      { threshold: 0.02 },
    )
    intersectionObserver.observe(stripCanvasRef.value)
  }

  if (typeof ResizeObserver !== 'undefined' && stripCanvasRef.value) {
    resizeObserver = new ResizeObserver(() => {
      renderStripFrame(performance.now())
    })
    resizeObserver.observe(stripCanvasRef.value)
  }

  startStrip()
})

onUnmounted(() => {
  if (stripRafId !== null) cancelAnimationFrame(stripRafId)
  intersectionObserver?.disconnect()
  resizeObserver?.disconnect()
})

defineExpose({
  pulsePointer,
})
</script>

<template>
  <div class="footer-horizon" aria-hidden="true">
    <canvas ref="stripCanvasRef" class="footer-horizon__canvas" />
  </div>
</template>

<style scoped lang="scss">
.footer-horizon {
  width: 100%;
  height: 40px;
  pointer-events: none;
  opacity: 0.9;

  &__canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
}
</style>
