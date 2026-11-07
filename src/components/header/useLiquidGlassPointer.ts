import { onUnmounted, ref, type Ref } from 'vue'

/**
 * Tracks pointer movement over a Liquid Glass container using a dual-speed
 * requestAnimationFrame loop (snappy rim highlight + viscous inner glow).
 */
export function useLiquidGlassPointer(containerRef: Ref<HTMLElement | null>) {
  const isTracking = ref(false)

  let rafId: number | null = null
  let rawClientX = 0
  let rawClientY = 0
  let needsRectSync = false
  let hasInitialPoint = false

  let targetX = 50
  let targetY = 50
  let rimX = 50
  let rimY = 50
  let glowX = 50
  let glowY = 50

  function animatePointer() {
    rafId = null
    const el = containerRef.value
    if (!el) return

    if (needsRectSync) {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        targetX = Math.min(100, Math.max(0, ((rawClientX - rect.left) / rect.width) * 100))
        targetY = Math.min(100, Math.max(0, ((rawClientY - rect.top) / rect.height) * 100))

        if (!hasInitialPoint) {
          rimX = glowX = targetX
          rimY = glowY = targetY
          hasInitialPoint = true
        }
      }
      needsRectSync = false
    }

    // Borda especular acompanha de perto; halo líquido desliza com inércia viscosa
    rimX += (targetX - rimX) * 0.34
    rimY += (targetY - rimY) * 0.34
    glowX += (targetX - glowX) * 0.1
    glowY += (targetY - glowY) * 0.1

    el.style.setProperty('--pointer-x', `${rimX.toFixed(2)}%`)
    el.style.setProperty('--pointer-y', `${rimY.toFixed(2)}%`)
    el.style.setProperty('--glow-x', `${glowX.toFixed(2)}%`)
    el.style.setProperty('--glow-y', `${glowY.toFixed(2)}%`)

    const dx = Math.abs(targetX - glowX)
    const dy = Math.abs(targetY - glowY)

    if (dx > 0.06 || dy > 0.06) {
      rafId = requestAnimationFrame(animatePointer)
    }
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerType === 'touch') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    isTracking.value = true
    rawClientX = event.clientX
    rawClientY = event.clientY
    needsRectSync = true

    if (rafId === null) {
      rafId = requestAnimationFrame(animatePointer)
    }
  }

  function onPointerLeave() {
    isTracking.value = false
    hasInitialPoint = false
  }

  onUnmounted(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }
  })

  return {
    isTracking,
    onPointerMove,
    onPointerLeave,
  }
}
