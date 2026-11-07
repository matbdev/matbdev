import { onUnmounted, ref, type Ref } from 'vue'

/**
 * Drives the rAF-interpolated 3D perspective tilt (--card-transform) and
 * dual-speed Liquid Glass coordinates (--pointer-x, --pointer-y, --glow-x, --glow-y)
 * without triggering CSS transition rasterization locks.
 */
export function useCardTiltAndGlass(
  cardRef: Ref<HTMLElement | null>,
  isPenguinDragging?: Ref<boolean>,
) {
  const isTracking = ref(false)

  let rafId: number | null = null
  let rawClientX = 0
  let rawClientY = 0
  let needsRectSync = false
  let hasInitialPoint = false

  // Optical Liquid Glass pointer & viscous glow coordinates (matching SiteHeader)
  let targetX = 50
  let targetY = 50
  let rimX = 50
  let rimY = 50
  let glowX = 50
  let glowY = 50

  // Smooth rAF-driven 3D tilt & parallax (avoids CSS transition raster lock)
  let targetTiltX = 0
  let targetTiltY = 0
  let currentTiltX = 0
  let currentTiltY = 0

  function animateCard() {
    rafId = null
    const el = cardRef.value
    if (!el) return

    if (needsRectSync) {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        targetX = Math.min(100, Math.max(0, ((rawClientX - rect.left) / rect.width) * 100))
        targetY = Math.min(100, Math.max(0, ((rawClientY - rect.top) / rect.height) * 100))

        const nx = targetX / 100 - 0.5
        const ny = targetY / 100 - 0.5
        targetTiltX = -ny * 6.4
        targetTiltY = nx * 7.6

        if (!hasInitialPoint) {
          rimX = glowX = targetX
          rimY = glowY = targetY
          hasInitialPoint = true
        }
      }
      needsRectSync = false
    }

    // Specular bevel follows closely; internal liquid halo glides with viscous inertia
    rimX += (targetX - rimX) * 0.34
    rimY += (targetY - rimY) * 0.34
    glowX += (targetX - glowX) * 0.1
    glowY += (targetY - glowY) * 0.1

    currentTiltX += (targetTiltX - currentTiltX) * 0.15
    currentTiltY += (targetTiltY - currentTiltY) * 0.15

    el.style.setProperty('--pointer-x', `${rimX.toFixed(2)}%`)
    el.style.setProperty('--pointer-y', `${rimY.toFixed(2)}%`)
    el.style.setProperty('--glow-x', `${glowX.toFixed(2)}%`)
    el.style.setProperty('--glow-y', `${glowY.toFixed(2)}%`)

    const tiltMoving =
      Math.abs(targetTiltX - currentTiltX) >= 0.01 || Math.abs(targetTiltY - currentTiltY) >= 0.01

    if (!isTracking.value && !tiltMoving && targetTiltX === 0 && targetTiltY === 0) {
      currentTiltX = 0
      currentTiltY = 0
      el.style.setProperty('--card-transform', 'none')
    } else {
      el.style.setProperty(
        '--card-transform',
        `perspective(1200px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`,
      )
    }

    const glowMoving =
      isTracking.value && (Math.abs(targetX - glowX) > 0.06 || Math.abs(targetY - glowY) > 0.06)

    if (glowMoving || tiltMoving) {
      rafId = requestAnimationFrame(animateCard)
    }
  }

  function onCardPointerMove(event: PointerEvent) {
    if (isPenguinDragging?.value) return
    if (event.pointerType === 'touch') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    isTracking.value = true
    rawClientX = event.clientX
    rawClientY = event.clientY
    needsRectSync = true

    if (rafId === null) {
      rafId = requestAnimationFrame(animateCard)
    }
  }

  function onCardPointerLeave() {
    isTracking.value = false
    hasInitialPoint = false
    needsRectSync = false
    targetTiltX = 0
    targetTiltY = 0

    if (rafId === null) {
      rafId = requestAnimationFrame(animateCard)
    }
  }

  onUnmounted(() => {
    if (rafId !== null) cancelAnimationFrame(rafId)
  })

  return {
    isTracking,
    onCardPointerMove,
    onCardPointerLeave,
  }
}
