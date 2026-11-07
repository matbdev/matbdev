import {
  BASE,
  clamp,
  COL_DARK,
  COL_FOAM_BRIGHT,
  COL_FOAM_WARM,
  GATE,
  HOR,
  lerp,
  SEA,
  SKY,
  W,
  type PixelAdder,
} from './constants'

interface FeatherParticle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  maxAge: number
  phase: number
}

interface GullEntity {
  dx: number
  dy: number
  ph: number
  mode: 'flying' | 'diving' | 'underwater' | 'bobbing' | 'recovering'
  x: number
  y: number
  vx: number
  vy: number
  diveTargetY: number
  timer: number
  flyOffLeft: boolean
}

export function createGullsSystem(onWaterImpact: (gx: number, gy: number, power: number) => void) {
  const gulls: GullEntity[] = Array.from({ length: 6 }, (_, i) => ({
    dx: i * 8 + (i % 2) * 3,
    dy: (i % 3) * 3 - i,
    ph: i * 1.1,
    mode: 'flying',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    diveTargetY: HOR + 12,
    timer: 0,
    flyOffLeft: false,
  }))

  const feathers: FeatherParticle[] = []

  function spawnFeatherBurst(gx: number, gy: number) {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.3
      const speed = 7 + (i % 3) * 3.5
      feathers.push({
        x: gx,
        y: gy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        age: 0,
        maxAge: 1.25 + (i % 3) * 0.22,
        phase: i * 1.4,
      })
    }
    if (feathers.length > 36) feathers.splice(0, feathers.length - 36)
  }

  function isHoveringGull(gx: number, gy: number): boolean {
    if (gy >= HOR) return false
    for (const g of gulls) {
      if (g.mode !== 'flying') continue
      if (Math.hypot(gx - g.x, gy - g.y) < 5.8) return true
    }
    return false
  }

  function clickGull(gx: number, gy: number): boolean {
    if (gy >= HOR) return false
    let closest: GullEntity | null = null
    let bestD = 5.8
    for (const g of gulls) {
      if (g.mode !== 'flying') continue
      const d = Math.hypot(gx - g.x, gy - g.y)
      if (d < bestD) {
        bestD = d
        closest = g
      }
    }
    if (!closest) return false

    spawnFeatherBurst(closest.x, closest.y)
    closest.mode = 'diving'
    closest.vx = -3.2
    closest.vy = -7.5
    closest.diveTargetY = clamp(
      HOR + 10 + (Math.round(Math.abs(closest.ph * 10)) % 4) * 4.5,
      HOR + 8,
      BASE - 2,
    )
    closest.timer = 0
    closest.flyOffLeft = false
    return true
  }

  function stepAndRender(
    dt: number,
    simTime: number,
    hoverGridX: number,
    hoverGridY: number,
    addPixel: PixelAdder,
  ) {
    // 1. Drifting feathers from startled gulls
    for (let idx = feathers.length - 1; idx >= 0; idx--) {
      const f = feathers[idx]!
      f.age += dt
      if (f.age >= f.maxAge) {
        feathers.splice(idx, 1)
        continue
      }
      f.vx *= 1 - Math.min(0.9, dt * 3.5)
      f.vy = Math.min(6, f.vy + dt * 16)
      f.x += f.vx * dt + Math.sin(simTime * 8 + f.phase) * dt * 2.2
      f.y += f.vy * dt
      const fade = (1 - f.age / f.maxAge) ** 1.2
      addPixel(f.x, f.y, COL_FOAM_BRIGHT, fade * 0.95, GATE)
    }

    // 2. Gull flock (formation flight -> startled dive -> submerged bubbles -> wave bobbing -> calm takeoff)
    const gt = ((simTime + 2) % 32) / 32
    const flockBaseX = lerp(W + 24, -64, gt)
    const flockBaseY = 33 + Math.sin(gt * 7) * 3.2

    for (const b of gulls) {
      const slotX = flockBaseX + b.dx
      const slotY = flockBaseY + b.dy + Math.sin(simTime * 1.5 + b.ph)

      if (b.mode === 'flying') {
        b.x = slotX
        b.y = slotY
        const nearMouse = Math.hypot(hoverGridX - b.x, hoverGridY - b.y) < 8 ? 2.1 : 1
        const flap = Math.sin(simTime * 7 * nearMouse + b.ph)
        const up = flap > 0.3 ? -1 : flap < -0.3 ? 1 : 0
        const rx = Math.round(b.x)
        const ry = Math.round(b.y)
        addPixel(rx, ry, COL_DARK, 1, SKY)
        addPixel(rx - 1, ry + Math.min(0, up), COL_DARK, 1, SKY)
        addPixel(rx + 1, ry + Math.min(0, up), COL_DARK, 1, SKY)
        addPixel(rx - 2, ry + up, COL_DARK, 1, SKY)
        addPixel(rx + 2, ry + up, COL_DARK, 1, SKY)
      } else if (b.mode === 'diving') {
        b.timer += dt
        b.vy += 62 * dt
        b.x += b.vx * dt
        b.y += b.vy * dt

        const spin = Math.sin(b.timer * 26) > 0 ? -1 : 1
        const rx = Math.round(b.x)
        const ry = Math.round(b.y)
        addPixel(rx, ry, COL_DARK, 1, SEA)
        addPixel(rx - 1, ry - 1, COL_DARK, 1, SEA)
        addPixel(rx + 1, ry - 1, COL_DARK, 1, SEA)
        addPixel(rx - 2, ry - 1 + spin, COL_DARK, 1, SEA)
        addPixel(rx + 2, ry - 1 - spin, COL_DARK, 1, SEA)

        if (b.y >= b.diveTargetY) {
          onWaterImpact(b.x, b.diveTargetY, 0.94)
          b.y = b.diveTargetY
          b.mode = 'underwater'
          b.timer = 0
        }
      } else if (b.mode === 'underwater') {
        b.timer += dt
        if (b.timer > 0.25 && b.timer < 1.15) {
          const bubbleProgress = (b.timer - 0.25) / 0.9
          addPixel(
            b.x + Math.sin(b.timer * 14) * 1.2,
            b.diveTargetY - bubbleProgress * 1.5,
            COL_FOAM_BRIGHT,
            (1 - bubbleProgress) * 0.78,
            SEA,
          )
        }
        if (b.timer >= 1.2) {
          b.mode = 'bobbing'
          b.timer = 0
        }
      } else if (b.mode === 'bobbing') {
        b.timer += dt
        b.x -= dt * 1.5
        const waveBob = Math.sin(simTime * 3.4 + b.ph) * 0.65
        b.y = b.diveTargetY + waveBob

        const rx = Math.round(b.x)
        const ry = Math.round(b.y)
        addPixel(rx - 2, ry + 1, COL_FOAM_WARM, 0.45, SEA)
        addPixel(rx + 2, ry + 1, COL_FOAM_WARM, 0.45, SEA)
        addPixel(rx - 1, ry, COL_DARK, 1, SEA)
        addPixel(rx, ry, COL_DARK, 1, SEA)
        addPixel(rx + 1, ry, COL_DARK, 1, SEA)
        addPixel(rx - 1, ry - 1, COL_DARK, 0.95, SEA)

        if (b.timer >= 1.7) {
          b.mode = 'recovering'
          b.timer = 0
          b.vx = -4
          b.vy = -4
          b.flyOffLeft = slotX > b.x + 75 || slotX < -25
        }
      } else if (b.mode === 'recovering') {
        b.timer += dt

        if (!b.flyOffLeft && slotX > b.x + 85) {
          b.flyOffLeft = true
        }

        const goalX = b.flyOffLeft ? -32 : slotX
        const goalY = b.flyOffLeft ? 30 + (b.dy % 4) : slotY
        const dx = goalX - b.x
        const dy = goalY - b.y
        const dist = Math.hypot(dx, dy)

        const rampUp = clamp(b.timer / 0.9, 0.28, 1)
        const maxSpeed = 16.5 * rampUp
        const step = Math.min(dist, maxSpeed * dt)

        if (dist > 0.01) {
          b.x += (dx / dist) * step
          b.y += (dy / dist) * step
        }

        const flap = Math.sin(simTime * 11.5 + b.ph)
        const up = flap > 0.25 ? -1 : flap < -0.25 ? 1 : 0
        const maxLayer = b.y < HOR - 1 ? SKY : SEA
        const rx = Math.round(b.x)
        const ry = Math.round(b.y)
        addPixel(rx, ry, COL_DARK, 1, maxLayer)
        addPixel(rx - 1, ry + Math.min(0, up), COL_DARK, 1, maxLayer)
        addPixel(rx + 1, ry + Math.min(0, up), COL_DARK, 1, maxLayer)
        addPixel(rx - 2, ry + up, COL_DARK, 1, maxLayer)
        addPixel(rx + 2, ry + up, COL_DARK, 1, maxLayer)

        if ((!b.flyOffLeft && dist < 1.4) || (b.flyOffLeft && b.x < -18)) {
          b.mode = 'flying'
        }
      }
    }
  }

  function hasActiveInteractions(): boolean {
    return feathers.length > 0 || gulls.some((g) => g.mode !== 'flying')
  }

  return {
    isHoveringGull,
    clickGull,
    stepAndRender,
    hasActiveInteractions,
  }
}
