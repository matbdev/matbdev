import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

export interface ArcSlot<T> {
  item: T
  index: number
  /** Signed angular distance in steps from the focal center (`0` = focused). */
  offset: number
  /** Pixel X coordinate on the stage (leftmost apex when `offset = 0`). */
  x: number
  /** Pixel Y coordinate relative to the vertical center of the stage. */
  y: number
  /** Visual scale factor (`1` at center, tapering toward the C tips). */
  scale: number
  /** Opacity (`1` at center, fading smoothly past the C ends). */
  opacity: number
  /** Continuous `0..1` proximity to the focal slot (`1` when centered). */
  focusProgress: number
  /** Whether this slot corresponds to the currently selected index. */
  isSelected: boolean
  /** Paint order so centered items always sit above outer neighbours. */
  zIndex: number
}

export interface ArcSvgPaths {
  width: number
  height: number
  apexX: number
  centerY: number
  /** Full C-shaped orbital guide path. */
  mainArc: string
  /** Subtle outer concentric reference arc. */
  outerArc: string
  /** Highlighted segment around the focal equator (`θ = 0`). */
  focalArc: string
}

const SPRING_STIFFNESS = 175
const SPRING_DAMPING = 25
const DRAG_THRESHOLD_PX = 6

/**
 * Computes slot offset along the C curve.
 * For small collections (< 4 items), behaves as a linear track to prevent
 * 180-degree wrap-around teleportation across the circle.
 */
function computeSlotOffset(fromPos: number, toIndex: number, count: number): number {
  if (count <= 0) return 0
  if (count < 4) {
    return toIndex - fromPos
  }
  return shortestCircularDelta(fromPos, toIndex, count)
}

/**
 * Shortest signed circular step distance from `fromPos` to `toIndex` on a ring of `count` items.
 */
function shortestCircularDelta(fromPos: number, toIndex: number, count: number): number {
  if (count <= 0) return 0
  const raw = (((toIndex - fromPos) % count) + count) % count
  return raw > count / 2 ? raw - count : raw
}

/**
 * Normalizes any continuous ring position to a valid `[0, count - 1]` integer index.
 */
function normalizeRingIndex(position: number, count: number): number {
  if (count <= 0) return 0
  return ((Math.round(position) % count) + count) % count
}

function buildCArcPath(
  apexX: number,
  centerY: number,
  radius: number,
  halfSpanDeg: number,
): string {
  const rad = (halfSpanDeg * Math.PI) / 180
  const endX = apexX + radius * (1 - Math.cos(rad))
  const topY = centerY - radius * Math.sin(rad)
  const bottomY = centerY + radius * Math.sin(rad)
  return `M ${endX.toFixed(1)} ${topY.toFixed(1)} A ${radius} ${radius} 0 0 0 ${endX.toFixed(1)} ${bottomY.toFixed(1)}`
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Drives the C-shaped orbital skill carousel:
 * - Continuous circular wrap-around along a parametric 'C' curve
 * - Frame-rate-independent spring animation so items travel along the curve
 * - Vertical pointer/touch drag with momentum & snap-to-slot
 * - Keyboard navigation (Arrows, Home, End)
 */
export function useArcCarousel<T>(
  items: Readonly<Ref<readonly T[]>>,
  stageRef: Ref<HTMLElement | null>,
  selectedIndex: Ref<number>,
  onSelectIndex: (index: number) => void,
) {
  const stageWidth = ref(420)
  const stageHeight = ref(456)
  const isDragging = ref(false)

  // Continuous ring coordinates (`0` = first item, wraps modulo `items.length`)
  const currentPosition = ref(selectedIndex.value)
  let targetPosition = selectedIndex.value
  let velocity = 0
  let rafId: number | null = null
  let lastFrameTime = 0

  // Pointer drag tracking
  let activePointerId: number | null = null
  let pointerStartY = 0
  let dragStartPosition = 0
  let lastPointerY = 0
  let lastPointerTime = 0
  let dragVelocity = 0

  let resizeObserver: ResizeObserver | null = null

  const geometryConfig = computed(() => {
    const compact = stageWidth.value < 380
    return {
      apexX: compact ? 18 : 28,
      radius: compact ? 162 : 220,
      stepAngleDeg: compact ? 22 : 20.5,
      visibleSteps: compact ? 2.55 : 3.35,
      pxPerStep: compact ? 64 : 76,
    }
  })

  const svgPaths = computed<ArcSvgPaths>(() => {
    const width = stageWidth.value
    const height = stageHeight.value
    const centerY = height / 2
    const { apexX, radius } = geometryConfig.value
    const halfSpan = width < 380 ? 56 : 68

    return {
      width,
      height,
      apexX,
      centerY,
      mainArc: buildCArcPath(apexX, centerY, radius, halfSpan),
      outerArc: buildCArcPath(apexX - 10, centerY, radius + 10, halfSpan - 6),
      focalArc: buildCArcPath(apexX, centerY, radius, 19),
    }
  })

  const visibleSlots = computed<ArcSlot<T>[]>(() => {
    const list = items.value
    const count = list.length
    if (count === 0) return []

    const pos = currentPosition.value
    const activeIdx = selectedIndex.value
    const { apexX, radius, stepAngleDeg, visibleSteps } = geometryConfig.value
    const stepRad = (stepAngleDeg * Math.PI) / 180

    const slots: ArcSlot<T>[] = []

    for (let index = 0; index < count; index++) {
      const offset = computeSlotOffset(pos, index, count)
      const absOffset = Math.abs(offset)
      if (absOffset > visibleSteps) continue

      const theta = offset * stepRad
      // Parametric 'C' curve: leftmost at theta = 0, curving right toward top & bottom
      const x = apexX + radius * (1 - Math.cos(theta))
      const y = radius * Math.sin(theta)

      const focusProgress = Math.max(0, 1 - absOffset)
      const normalizedDistance = Math.min(1, absOffset / visibleSteps)
      const scale = 1 - normalizedDistance * 0.22
      const opacity =
        absOffset <= 1
          ? 1 - absOffset * 0.22
          : Math.max(0, (1 - (absOffset - 1) / (visibleSteps - 1)) * 0.78)

      slots.push({
        item: list[index]!,
        index,
        offset,
        x,
        y,
        scale,
        opacity,
        focusProgress,
        isSelected: index === activeIdx,
        zIndex: Math.round((visibleSteps + 1 - absOffset) * 10),
      })
    }

    return slots
  })

  function stopAnimation() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function tickAnimation(now: number) {
    rafId = null
    if (isDragging.value) return

    const dt =
      lastFrameTime > 0 ? Math.min(0.032, Math.max(0.001, (now - lastFrameTime) / 1000)) : 0.016
    lastFrameTime = now

    const displacement = targetPosition - currentPosition.value
    const acceleration = displacement * SPRING_STIFFNESS - velocity * SPRING_DAMPING
    velocity += acceleration * dt
    currentPosition.value += velocity * dt

    if (Math.abs(targetPosition - currentPosition.value) < 0.0012 && Math.abs(velocity) < 0.008) {
      currentPosition.value = targetPosition
      velocity = 0
      lastFrameTime = 0
      return
    }

    rafId = requestAnimationFrame(tickAnimation)
  }

  function startAnimation() {
    if (prefersReducedMotion()) {
      stopAnimation()
      currentPosition.value = targetPosition
      velocity = 0
      return
    }

    if (rafId === null) {
      lastFrameTime = 0
      rafId = requestAnimationFrame(tickAnimation)
    }
  }

  function goToIndex(nextIndex: number) {
    const count = items.value.length
    if (count === 0) return

    if (count < 4) {
      const clamped = Math.max(0, Math.min(count - 1, nextIndex))
      targetPosition = clamped
      if (clamped !== selectedIndex.value) {
        onSelectIndex(clamped)
      }
      startAnimation()
      return
    }

    const normalized = ((nextIndex % count) + count) % count
    const delta = shortestCircularDelta(currentPosition.value, normalized, count)
    targetPosition = Math.round(currentPosition.value + delta)

    if (normalized !== selectedIndex.value) {
      onSelectIndex(normalized)
    }
    startAnimation()
  }

  function stepBy(deltaSteps: number) {
    const count = items.value.length
    if (count === 0) return

    if (count < 4) {
      const next = Math.max(0, Math.min(count - 1, Math.round(targetPosition) + deltaSteps))
      targetPosition = next
      if (next !== selectedIndex.value) {
        onSelectIndex(next)
      }
      startAnimation()
      return
    }

    targetPosition = Math.round(targetPosition) + deltaSteps
    const normalized = normalizeRingIndex(targetPosition, count)
    if (normalized !== selectedIndex.value) {
      onSelectIndex(normalized)
    }
    startAnimation()
  }

  // Reset position and target when items list changes (e.g. category filter applied)
  watch(items, (newItems) => {
    stopAnimation()
    const count = newItems.length
    if (count === 0) {
      currentPosition.value = 0
      targetPosition = 0
      velocity = 0
      return
    }
    const safeIdx = Math.max(0, Math.min(count - 1, selectedIndex.value))
    currentPosition.value = safeIdx
    targetPosition = safeIdx
    velocity = 0
  })

  // Keep arc synced when parent updates `selectedIndex` externally (e.g. context tab or tag click)
  watch(selectedIndex, (nextIdx) => {
    const count = items.value.length
    if (count === 0) return

    if (count < 4) {
      const clamped = Math.max(0, Math.min(count - 1, nextIdx))
      if (Math.round(targetPosition) !== clamped) {
        targetPosition = clamped
        startAnimation()
      }
      return
    }

    const currentTargetNormalized = normalizeRingIndex(targetPosition, count)
    if (currentTargetNormalized !== nextIdx) {
      const delta = shortestCircularDelta(currentPosition.value, nextIdx, count)
      targetPosition = Math.round(currentPosition.value + delta)
      startAnimation()
    }
  })

  // --- Pointer drag handlers ------------------------------------------------

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    activePointerId = event.pointerId
    pointerStartY = event.clientY
    lastPointerY = event.clientY
    lastPointerTime = performance.now()
    dragStartPosition = currentPosition.value
    dragVelocity = 0
  }

  function onPointerMove(event: PointerEvent) {
    if (activePointerId !== event.pointerId) return

    const dy = event.clientY - pointerStartY
    if (!isDragging.value) {
      if (Math.abs(dy) < DRAG_THRESHOLD_PX) return
      isDragging.value = true
      stopAnimation()
      velocity = 0
      stageRef.value?.setPointerCapture(event.pointerId)
    }

    const now = performance.now()
    const dt = Math.max(1, now - lastPointerTime)
    const { pxPerStep } = geometryConfig.value
    const instantVelocity = -(event.clientY - lastPointerY) / pxPerStep / (dt / 1000)
    dragVelocity = dragVelocity * 0.65 + instantVelocity * 0.35

    lastPointerY = event.clientY
    lastPointerTime = now

    // Dragging upward (`dy < 0`) pulls lower items (`+offset`) up into the focal slot
    const rawPos = dragStartPosition - dy / pxPerStep
    const count = items.value.length

    if (count < 4) {
      currentPosition.value = Math.max(-0.25, Math.min(count - 0.75, rawPos))
      const nearest = Math.max(0, Math.min(count - 1, Math.round(currentPosition.value)))
      if (nearest !== selectedIndex.value) {
        onSelectIndex(nearest)
      }
      return
    }

    currentPosition.value = rawPos
    if (count > 0) {
      const nearest = normalizeRingIndex(currentPosition.value, count)
      if (nearest !== selectedIndex.value) {
        onSelectIndex(nearest)
      }
    }
  }

  function finishPointerGesture(event: PointerEvent) {
    if (activePointerId !== event.pointerId) return
    const wasDragging = isDragging.value
    activePointerId = null
    isDragging.value = false

    if (!wasDragging) return

    if (stageRef.value?.hasPointerCapture(event.pointerId)) {
      stageRef.value.releasePointerCapture(event.pointerId)
    }

    const count = items.value.length
    if (count === 0) return

    if (count < 4) {
      const projected = currentPosition.value + Math.max(-0.8, Math.min(0.8, dragVelocity * 0.1))
      const clamped = Math.max(0, Math.min(count - 1, Math.round(projected)))
      targetPosition = clamped
      velocity = 0
      if (clamped !== selectedIndex.value) {
        onSelectIndex(clamped)
      }
      startAnimation()
      return
    }

    // Project a gentle flick momentum before snapping to an integer slot
    const projected = currentPosition.value + Math.max(-2.2, Math.min(2.2, dragVelocity * 0.14))
    targetPosition = Math.round(projected)
    velocity = dragVelocity * 0.5

    const snappedIndex = normalizeRingIndex(targetPosition, count)
    if (snappedIndex !== selectedIndex.value) {
      onSelectIndex(snappedIndex)
    }
    startAnimation()
  }

  // --- Keyboard navigation --------------------------------------------------

  function onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        stepBy(1)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        stepBy(-1)
        break
      case 'Home':
        event.preventDefault()
        goToIndex(0)
        break
      case 'End':
        event.preventDefault()
        goToIndex(items.value.length - 1)
        break
    }
  }

  // --- Stage measurement ----------------------------------------------------

  function syncStageSize() {
    const el = stageRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width > 0) stageWidth.value = rect.width
    if (rect.height > 0) stageHeight.value = rect.height
  }

  onMounted(() => {
    syncStageSize()
    if (typeof ResizeObserver !== 'undefined' && stageRef.value) {
      resizeObserver = new ResizeObserver(syncStageSize)
      resizeObserver.observe(stageRef.value)
    }
  })

  onUnmounted(() => {
    stopAnimation()
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  return {
    visibleSlots,
    svgPaths,
    isDragging,
    goToIndex,
    stepBy,
    onPointerDown,
    onPointerMove,
    onPointerUp: finishPointerGesture,
    onPointerCancel: finishPointerGesture,
    onKeyDown,
  }
}
