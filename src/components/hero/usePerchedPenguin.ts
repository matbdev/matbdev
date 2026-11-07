import { onUnmounted, ref, type Ref } from 'vue'

/**
 * Manages the interactive perched Tux mascot physics:
 * pointer-capture drag, pendulum struggle wiggle looking back toward his perch,
 * and underdamped elastic spring return.
 */
export function usePerchedPenguin(
  penguinRef: Ref<HTMLButtonElement | null>,
  cardRef: Ref<HTMLElement | null>,
  onPickUp: () => void,
) {
  const isDraggingPenguin = ref(false)
  const isReturningPenguin = ref(false)

  let penguinRafId: number | null = null
  let activePointerId: number | null = null
  let grabStartX = 0
  let grabStartY = 0
  let dragTargetX = 0
  let dragTargetY = 0
  let maxDragDist = 0
  let lastPenguinTime = 0

  let tuxX = 0
  let tuxY = 0
  let tuxVx = 0
  let tuxVy = 0
  let swingAngle = 0
  let swingVel = 0
  let wigglePhase = 0
  let tuxFacing = -1

  function syncPenguinStyles(
    x: number,
    y: number,
    rot: number,
    sx: number,
    sy: number,
    away: number,
  ) {
    const pEl = penguinRef.value
    const cEl = cardRef.value
    if (pEl) {
      pEl.style.setProperty('--tux-x', `${x.toFixed(2)}px`)
      pEl.style.setProperty('--tux-y', `${y.toFixed(2)}px`)
      pEl.style.setProperty('--tux-rot', `${rot.toFixed(2)}deg`)
      pEl.style.setProperty('--tux-sx', sx.toFixed(3))
      pEl.style.setProperty('--tux-sy', sy.toFixed(3))
    }
    if (cEl) {
      cEl.style.setProperty('--tux-away', away.toFixed(3))
    }
  }

  function animatePenguin(now: number) {
    penguinRafId = null
    const dt = lastPenguinTime > 0 ? Math.min(0.05, (now - lastPenguinTime) / 1000) : 1 / 60
    lastPenguinTime = now
    const dt60 = dt * 60

    if (isDraggingPenguin.value) {
      const prevX = tuxX
      const prevY = tuxY
      const follow = Math.min(1, 0.55 * dt60)
      tuxX += (dragTargetX - tuxX) * follow
      tuxY += (dragTargetY - tuxY) * follow

      tuxVx = (tuxX - prevX) / Math.max(0.25, dt60)
      tuxVy = (tuxY - prevY) / Math.max(0.25, dt60)

      const dist = Math.hypot(tuxX, tuxY)
      const urgency = Math.min(1, dist / 160)
      const awayAlpha = Math.min(1, Math.max(0, (dist - 16) / 64))

      // Faces back toward his home perch on the card so he looks like he's begging to go back
      if (tuxX < -18) tuxFacing = 1
      else if (tuxX > 12) tuxFacing = -1

      wigglePhase += dt * (22 + urgency * 14)

      const targetSwing = Math.max(-34, Math.min(34, -tuxVx * 1.6))
      swingVel = (swingVel + (targetSwing - swingAngle) * 0.24 * dt60) * Math.pow(0.76, dt60)
      swingAngle += swingVel * dt60

      const homeLean = Math.max(-14, Math.min(14, -tuxX * 0.055))
      const struggleWiggle = Math.sin(wigglePhase) * (5 + urgency * 8.5)
      const totalRot = swingAngle + homeLean + struggleWiggle

      const kick = Math.sin(wigglePhase * 2)
      const kickBobY = Math.abs(Math.sin(wigglePhase)) * -(1.5 + urgency * 2.5)
      const sx = tuxFacing * (1 - kick * (0.03 + urgency * 0.04))
      const sy = 1 + kick * (0.035 + urgency * 0.048)

      syncPenguinStyles(tuxX, tuxY + kickBobY, totalRot, sx, sy, awayAlpha)
      penguinRafId = requestAnimationFrame(animatePenguin)
      return
    }

    if (isReturningPenguin.value) {
      const stiffness = 0.165
      const damping = Math.pow(0.755, dt60)
      tuxVx = (tuxVx - tuxX * stiffness * dt60) * damping
      tuxVy = (tuxVy - tuxY * stiffness * dt60) * damping
      tuxX += tuxVx * dt60
      tuxY += tuxVy * dt60

      const dist = Math.hypot(tuxX, tuxY)
      const speed = Math.hypot(tuxVx, tuxVy)
      const awayAlpha = Math.min(1, Math.max(0, (dist - 14) / 64))

      if (Math.abs(tuxVx) > 2.2) {
        tuxFacing = tuxVx > 0 ? 1 : -1
      } else if (dist < 20) {
        tuxFacing = -1
      }

      const flightBank = Math.max(-28, Math.min(28, tuxVx * 1.35))
      swingVel = (swingVel + (flightBank - swingAngle) * 0.26 * dt60) * Math.pow(0.74, dt60)
      swingAngle += swingVel * dt60

      const stretch = Math.min(0.12, speed * 0.0045)
      const sx = tuxFacing * (1 - stretch * 0.65)
      const sy = 1 + stretch

      if (dist < 0.35 && speed < 0.25 && Math.abs(swingAngle) < 0.4) {
        tuxX = 0
        tuxY = 0
        tuxVx = 0
        tuxVy = 0
        swingAngle = 0
        swingVel = 0
        tuxFacing = -1
        isReturningPenguin.value = false
        lastPenguinTime = 0
        syncPenguinStyles(0, 0, 0, -1, 1, 0)
        return
      }

      syncPenguinStyles(tuxX, tuxY, swingAngle, sx, sy, awayAlpha)
      penguinRafId = requestAnimationFrame(animatePenguin)
    }
  }

  function startPenguinLoop() {
    if (penguinRafId === null) {
      lastPenguinTime = 0
      penguinRafId = requestAnimationFrame(animatePenguin)
    }
  }

  function onPenguinPointerDown(event: PointerEvent) {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    event.preventDefault()
    event.stopPropagation()

    const btn = penguinRef.value
    if (!btn) return

    activePointerId = event.pointerId
    btn.setPointerCapture(event.pointerId)

    onPickUp()

    grabStartX = event.clientX - tuxX
    grabStartY = event.clientY - tuxY
    dragTargetX = tuxX
    dragTargetY = tuxY - 4
    maxDragDist = 0
    wigglePhase = 0

    isReturningPenguin.value = false
    isDraggingPenguin.value = true
    startPenguinLoop()
  }

  function onPenguinPointerMove(event: PointerEvent) {
    if (!isDraggingPenguin.value || event.pointerId !== activePointerId) return
    event.stopPropagation()

    dragTargetX = event.clientX - grabStartX
    dragTargetY = event.clientY - grabStartY - 4
    maxDragDist = Math.max(maxDragDist, Math.hypot(dragTargetX, dragTargetY))
  }

  function onPenguinPointerUp(event: PointerEvent) {
    if (!isDraggingPenguin.value || event.pointerId !== activePointerId) return
    const btn = penguinRef.value
    if (btn && btn.hasPointerCapture(event.pointerId)) {
      btn.releasePointerCapture(event.pointerId)
    }
    activePointerId = null
    isDraggingPenguin.value = false

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tuxX = 0
      tuxY = 0
      tuxVx = 0
      tuxVy = 0
      swingAngle = 0
      swingVel = 0
      tuxFacing = -1
      isReturningPenguin.value = false
      syncPenguinStyles(0, 0, 0, -1, 1, 0)
      return
    }

    // Quick tap on Tux without dragging: cute little hop & wiggle right on his perch
    if (maxDragDist < 5) {
      tuxVy = -6.8
      swingVel = 18
    } else {
      tuxVx = Math.max(-18, Math.min(18, tuxVx))
      tuxVy = Math.max(-18, Math.min(18, tuxVy))
    }

    isReturningPenguin.value = true
    startPenguinLoop()
  }

  onUnmounted(() => {
    if (penguinRafId !== null) cancelAnimationFrame(penguinRafId)
  })

  return {
    isDraggingPenguin,
    isReturningPenguin,
    onPenguinPointerDown,
    onPenguinPointerMove,
    onPenguinPointerUp,
  }
}
