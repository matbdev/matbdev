import {
  clamp,
  COL_FOAM_BRIGHT,
  computeSunVisibility,
  DEFAULT_SUN_Y,
  hex,
  HOR,
  lerp,
  mix,
  noise2,
  SKY,
  W,
  type PixelAdder,
  type Rgb,
} from './constants'

export interface CloudBand {
  cx: number
  cy: number
  len: number
  speed: number
  boostVx: number
  pass: 'far' | 'near'
  subOffsetX: number
  subOffsetY: number
  subLenRatio: number
  seed: number
  opacity: number
  state: 'normal' | 'dissipating' | 'reforming'
  stateTimer: number
}

interface WindGust {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  maxAge: number
  strength: number
}

interface CloudWisp {
  x: number
  y: number
  vx: number
  vy: number
  color: Rgb
  age: number
  maxAge: number
  phase: number
}

export function createCloudsSystem() {
  const clouds: CloudBand[] = [
    // High, slow cirrus bands (pass behind the sun)
    {
      cx: 48,
      cy: 15,
      len: 44,
      speed: 0.52,
      boostVx: 0,
      pass: 'far',
      subOffsetX: 10,
      subOffsetY: 2,
      subLenRatio: 0.55,
      seed: 11,
      opacity: 1,
      state: 'normal',
      stateTimer: 0,
    },
    {
      cx: 154,
      cy: 13,
      len: 36,
      speed: 0.44,
      boostVx: 0,
      pass: 'far',
      subOffsetX: -8,
      subOffsetY: 2,
      subLenRatio: 0.5,
      seed: 23,
      opacity: 1,
      state: 'normal',
      stateTimer: 0,
    },
    {
      cx: 214,
      cy: 22,
      len: 40,
      speed: 0.62,
      boostVx: 0,
      pass: 'far',
      subOffsetX: 7,
      subOffsetY: -2,
      subLenRatio: 0.48,
      seed: 37,
      opacity: 1,
      state: 'normal',
      stateTimer: 0,
    },

    // Mid-altitude sunset bands (drift gently across the sky & sun)
    {
      cx: 56,
      cy: 39,
      len: 54,
      speed: 1.05,
      boostVx: 0,
      pass: 'near',
      subOffsetX: -12,
      subOffsetY: 3,
      subLenRatio: 0.6,
      seed: 51,
      opacity: 1,
      state: 'normal',
      stateTimer: 0,
    },
    {
      cx: 186,
      cy: 33,
      len: 46,
      speed: 0.92,
      boostVx: 0,
      pass: 'near',
      subOffsetX: 11,
      subOffsetY: 3,
      subLenRatio: 0.52,
      seed: 67,
      opacity: 1,
      state: 'normal',
      stateTimer: 0,
    },
    {
      cx: 126,
      cy: 27,
      len: 34,
      speed: 0.84,
      boostVx: 0,
      pass: 'near',
      subOffsetX: 6,
      subOffsetY: 2,
      subLenRatio: 0.45,
      seed: 79,
      opacity: 1,
      state: 'normal',
      stateTimer: 0,
    },

    // Low horizon bands (warmer, slightly faster parallax behind the Torii)
    {
      cx: 146,
      cy: 50,
      len: 36,
      speed: 1.38,
      boostVx: 0,
      pass: 'near',
      subOffsetX: -7,
      subOffsetY: 2,
      subLenRatio: 0.5,
      seed: 93,
      opacity: 1,
      state: 'normal',
      stateTimer: 0,
    },
    {
      cx: 24,
      cy: 55,
      len: 42,
      speed: 1.48,
      boostVx: 0,
      pass: 'near',
      subOffsetX: 9,
      subOffsetY: -2,
      subLenRatio: 0.54,
      seed: 109,
      opacity: 1,
      state: 'normal',
      stateTimer: 0,
    },
    {
      cx: 212,
      cy: 58,
      len: 32,
      speed: 1.3,
      boostVx: 0,
      pass: 'near',
      subOffsetX: -6,
      subOffsetY: 2,
      subLenRatio: 0.46,
      seed: 127,
      opacity: 1,
      state: 'normal',
      stateTimer: 0,
    },
  ]

  const gusts: WindGust[] = []
  const wisps: CloudWisp[] = []

  const COL_SHADE_DUSK = hex('#6e3258')
  const COL_SHADE_WARM = hex('#9a4a6a')
  const COL_MID_CORAL = hex('#e0707a')
  const COL_GOLD = hex('#ffd488')
  const COL_RIM = hex('#ffe6a0')

  function computeCloudTint(x: number, y: number, sunX: number, sunY: number): Rgb {
    const duskBlend = clamp((sunY - DEFAULT_SUN_Y) / 12, 0, 1)
    const sunVis = computeSunVisibility(sunY)
    const dist = Math.hypot(x - sunX, (y - sunY) * 1.35)
    const sunProx = clamp(1 - dist / 78) * sunVis

    const farTint = mix(COL_SHADE_WARM, COL_SHADE_DUSK, duskBlend * 0.7)
    if (sunProx < 0.45) {
      return mix(farTint, COL_MID_CORAL, (sunProx / 0.45) * 0.65)
    }
    return mix(mix(farTint, COL_MID_CORAL, 0.65), COL_GOLD, (sunProx - 0.45) / 0.55)
  }

  function spawnWindSegment(x0: number, y0: number, x1: number, y1: number) {
    const dist = Math.hypot(x1 - x0, y1 - y0)
    if (dist < 0.4) return
    const steps = Math.min(6, Math.max(1, Math.ceil(dist / 2.4)))
    const vx = clamp(x1 - x0, -14, 14)
    const vy = clamp(y1 - y0, -10, 10)
    const strength = clamp(dist / 5.5, 0.3, 1)

    for (let s = 1; s <= steps; s++) {
      const u = s / steps
      const gx = lerp(x0, x1, u)
      const gy = lerp(y0, y1, u)
      if (gy < 2 || gy >= HOR - 1) continue

      gusts.push({
        x: gx,
        y: gy,
        vx,
        vy,
        age: 0,
        maxAge: 2.25,
        strength,
      })

      // Impart gentle horizontal drift momentum to any cloud brushed by the cursor
      for (const c of clouds) {
        if (c.opacity < 0.2) continue
        if (Math.abs(gx - c.cx) < c.len * 0.58 && Math.abs(gy - c.cy) < 5.5) {
          c.boostVx = clamp(c.boostVx + vx * 0.22, -7.5, 7.5)
        }
      }
    }

    if (gusts.length > 64) gusts.splice(0, gusts.length - 64)
  }

  function findCloudAt(gx: number, gy: number): CloudBand | null {
    if (gy >= HOR - 1 || gy < 4) return null
    // Check near pass first, then far pass
    for (let i = clouds.length - 1; i >= 0; i--) {
      const c = clouds[i]!
      if (c.state !== 'normal' || c.opacity < 0.45) continue
      const halfLen = c.len * 0.54
      if (Math.abs(gx - c.cx) <= halfLen && Math.abs(gy - c.cy) <= 4.2) {
        return c
      }
    }
    return null
  }

  function clickCloud(gx: number, gy: number, sunX: number, sunY: number): boolean {
    const hit = findCloudAt(gx, gy)
    if (!hit) return false

    hit.state = 'dissipating'
    hit.stateTimer = 0

    // Burst into soft sunset cloud wisps that drift on the breeze
    const count = 11
    for (let i = 0; i < count; i++) {
      const spread = (i / (count - 1) - 0.5) * hit.len * 0.72
      const wx = hit.cx + spread
      const wy = hit.cy + ((i % 3) - 1) * 1.1
      const pushX = (wx - gx) * 0.45 + (i % 2 === 0 ? 3.5 : -3.5)
      const pushY = -2.2 - (i % 3) * 1.4
      const col = mix(computeCloudTint(wx, wy, sunX, sunY), COL_FOAM_BRIGHT, 0.22)

      wisps.push({
        x: wx,
        y: wy,
        vx: pushX + hit.speed,
        vy: pushY,
        color: col,
        age: 0,
        maxAge: 1.45 + (i % 4) * 0.22,
        phase: i * 1.3,
      })
    }
    if (wisps.length > 60) wisps.splice(0, wisps.length - 60)
    return true
  }

  function step(dt: number, prefersReducedMotion: boolean) {
    // Advance cloud drift & dissipation states
    for (const c of clouds) {
      if (!prefersReducedMotion) {
        c.cx += (c.speed + c.boostVx) * dt
      } else {
        c.cx += c.boostVx * dt
      }
      c.boostVx *= Math.max(0, 1 - dt * 1.8)

      const margin = c.len * 0.7 + 16
      if (c.cx > W + margin) c.cx = -margin
      else if (c.cx < -margin) c.cx = W + margin

      if (c.state === 'dissipating') {
        c.stateTimer += dt
        c.opacity = Math.max(0, 1 - c.stateTimer / 0.38)
        if (c.stateTimer >= 3.4) {
          c.state = 'reforming'
          c.stateTimer = 0
        }
      } else if (c.state === 'reforming') {
        c.stateTimer += dt
        c.opacity = clamp(c.stateTimer / 1.8)
        if (c.opacity >= 1) {
          c.opacity = 1
          c.state = 'normal'
        }
      }
    }

    // Age wind gusts
    for (let i = gusts.length - 1; i >= 0; i--) {
      const g = gusts[i]!
      g.age += dt
      if (g.age >= g.maxAge) {
        gusts.splice(i, 1)
      }
    }

    // Age cloud wisps
    for (let i = wisps.length - 1; i >= 0; i--) {
      const w = wisps[i]!
      w.age += dt
      if (w.age >= w.maxAge) {
        wisps.splice(i, 1)
        continue
      }
      w.vx *= Math.max(0, 1 - dt * 1.9)
      w.vy *= Math.max(0, 1 - dt * 2.1)
      w.x += w.vx * dt
      w.y += w.vy * dt
    }
  }

  function sampleWindDistortion(x: number, y: number): [number, number, number] {
    if (gusts.length === 0) return [0, 0, 1]
    let shiftX = 0
    let shiftY = 0
    let densityMul = 1

    for (const g of gusts) {
      const dx = x - g.x
      const dy = (y - g.y) * 1.9
      const d = Math.hypot(dx, dy)
      const radius = 11 + (g.age / g.maxAge) * 5
      if (d >= radius) continue

      const life = (1 - g.age / g.maxAge) ** 1.4
      const falloff = (1 - d / radius) * life * g.strength

      // Shear along pointer sweep + gentle vertical parting away from stroke center
      shiftX += g.vx * falloff * 0.65
      const pushDir = dy >= 0 ? 1 : -1
      shiftY += (g.vy * 0.25 + pushDir * 1.35) * falloff
      densityMul *= 1 - falloff * 0.58
    }

    return [clamp(shiftX, -8, 8), clamp(shiftY, -3.5, 3.5), clamp(densityMul, 0.14, 1)]
  }

  function drawSingleBar(
    cx: number,
    cy: number,
    len: number,
    baseAlpha: number,
    seed: number,
    sunX: number,
    sunY: number,
    simTime: number,
    addPixel: PixelAdder,
  ) {
    if (baseAlpha <= 0.02) return
    const halfL = len * 0.5
    const sunVis = computeSunVisibility(sunY)

    for (let x = cx - halfL; x <= cx + halfL; x++) {
      const u = Math.abs(x - cx) / halfL
      const envelope = clamp(1 - u) * 1.55
      const breathe = noise2(x * 0.12 + simTime * 0.08, seed, seed) * 0.45
      const thickness = Math.max(1, Math.round(0.85 + envelope * 0.95 + breathe))

      const [windDx, windDy, windDensity] = sampleWindDistortion(x, cy)
      const drawX = x + windDx
      if (drawX < -1 || drawX >= W + 1) continue

      const tint = computeCloudTint(drawX, cy, sunX, sunY)
      const sunDist = Math.hypot(drawX - sunX, (cy - sunY) * 1.3)
      const rimGlow = clamp(1 - sunDist / 52) * sunVis
      const sunBelow = sunY >= cy

      for (let k = 0; k < thickness; k++) {
        const py = cy + k + windDy
        if (py < 1 || py >= HOR - 1) continue

        const isSunFacingEdge = sunBelow ? k === thickness - 1 : k === 0
        const col = isSunFacingEdge && rimGlow > 0.15 ? mix(tint, COL_RIM, rimGlow * 0.65) : tint
        const alpha = clamp(envelope * 0.56 * baseAlpha * windDensity, 0, 0.78)
        if (alpha > 0.03) {
          addPixel(drawX, py, col, alpha, SKY)
        }
      }
    }
  }

  function renderPass(
    pass: 'far' | 'near',
    simTime: number,
    sunX: number,
    sunY: number,
    addPixel: PixelAdder,
  ) {
    for (const c of clouds) {
      if (c.pass !== pass || c.opacity <= 0.02) continue
      const passAlpha = (pass === 'far' ? 0.76 : 1) * c.opacity

      // Main cloud bar
      drawSingleBar(c.cx, c.cy, c.len, passAlpha, c.seed, sunX, sunY, simTime, addPixel)

      // Delicate companion wisp bar for layered woodblock texture
      drawSingleBar(
        c.cx + c.subOffsetX,
        c.cy + c.subOffsetY,
        c.len * c.subLenRatio,
        passAlpha * 0.72,
        c.seed + 19,
        sunX,
        sunY,
        simTime,
        addPixel,
      )
    }

    // Draw dispersed wisps on the 'near' pass
    if (pass === 'near') {
      for (const w of wisps) {
        const p = w.age / w.maxAge
        const fade = (1 - p) ** 1.35 * 0.72
        const swayX = w.x + Math.sin(simTime * 5 + w.phase) * 0.8
        if (w.y >= 1 && w.y < HOR - 1) {
          addPixel(swayX, w.y, w.color, fade, SKY)
          addPixel(swayX + 1, w.y, w.color, fade * 0.65, SKY)
          addPixel(swayX - 1, w.y, w.color, fade * 0.65, SKY)
        }
      }
    }
  }

  function hasActiveInteractions(): boolean {
    return (
      gusts.length > 0 ||
      wisps.length > 0 ||
      clouds.some((c) => Math.abs(c.boostVx) > 0.05 || c.state !== 'normal')
    )
  }

  return {
    spawnWindSegment,
    clickCloud,
    step,
    renderPass,
    hasActiveInteractions,
  }
}
