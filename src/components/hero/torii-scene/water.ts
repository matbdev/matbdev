import {
  BASE,
  clamp,
  COL_DARK,
  COL_DEEP_CAVITY,
  COL_FOAM_BRIGHT,
  COL_FOAM_WARM,
  COL_TROUGH,
  computeSunVisibility,
  CX,
  GATE,
  H,
  hex,
  HOR,
  lerp,
  mix,
  noise2,
  POST_X,
  ROCK,
  SEA,
  W,
  type PixelAdder,
} from './constants'

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

export function createWaterSystem() {
  const waves = Array.from({ length: 14 }, (_, i) => ({ ph: i / 14, s: i * 3.7 }))
  const wakes: WakeNode[] = []
  const splashes: WaterSplash[] = []

  const COL_CREST_BASE = hex('#ffc89a')
  const COL_CREST_SUN = hex('#ffe6a0')
  const COL_SURF = hex('#f8c8b0')

  function spawnSplash(gx: number, gy: number, power = 1) {
    const cy = clamp(gy, HOR + 1, H - 2)
    const droplets: SplashDroplet[] = Array.from({ length: 7 }, (_, i) => {
      const spread = (i - 3) / 3
      return {
        vx: spread * (11 + (i % 2) * 4) * power,
        vy: (15 + (1 - Math.abs(spread)) * 10 + (i % 3) * 2) * power,
      }
    })
    splashes.push({
      x: gx,
      y: cy,
      age: 0,
      maxAge: 2.05,
      power,
      droplets,
    })
    if (splashes.length > 10) splashes.shift()
  }

  function spawnWakeSegment(x0: number, y0: number, x1: number, y1: number) {
    const dist = Math.hypot(x1 - x0, y1 - y0)
    if (dist < 0.35) return
    const steps = Math.min(8, Math.max(1, Math.ceil(dist / 1.6)))
    const strength = clamp(dist / 5, 0.35, 1)
    for (let s = 1; s <= steps; s++) {
      const u = s / steps
      const wx = lerp(x0, x1, u)
      const wy = lerp(y0, y1, u)
      if (wy < HOR + 0.5 || wy >= H) continue
      wakes.push({
        x: wx,
        y: wy,
        age: 0,
        maxAge: 0.98,
        strength,
      })
    }
    if (wakes.length > 100) wakes.splice(0, wakes.length - 100)
  }

  function stepAndRender(
    dt: number,
    simTime: number,
    sunX: number,
    sunY: number,
    baseLayer: Uint8Array,
    addPixel: PixelAdder,
  ) {
    const sunVis = computeSunVisibility(sunY)

    // 1. Rolling ocean wave crests catching dynamic sun path
    for (const wv of waves) {
      const p = (wv.ph + simTime * 0.042) % 1
      const yb = HOR + 1 + (H - HOR) * p ** 1.7
      const amp = 0.3 + p * 2.3
      const thick = p > 0.55 ? 2 : 1
      const reflX = sunX + (sunX - CX) * p * 0.16

      for (let x = 0; x < W; x++) {
        const y = Math.round(yb + Math.sin(x * (0.15 - p * 0.09) + wv.s + simTime * 0.4) * amp)
        const brk = noise2(x / (4 + p * 10), wv.s, 7)
        if (brk < 0.3) continue
        const sunHighlight = clamp(1 - Math.abs(x - reflX) / (10 + p * 34)) * sunVis
        const lc = mix(COL_CREST_BASE, COL_CREST_SUN, sunHighlight)
        for (let k = 0; k < thick; k++) {
          addPixel(x, y - k, lc, 0.55 + p * 0.35, SEA)
        }
        addPixel(x, y + 1, COL_TROUGH, 0.45 + p * 0.3, SEA)
        if (p > 0.6) addPixel(x, y + 2, COL_TROUGH, 0.4, SEA)
      }
    }

    // 2. Foam rings around Torii posts & surf along foreground rocks
    for (const px of POST_X) {
      for (let k = 0; k < 2; k++) {
        const p = (simTime * 0.5 + k * 0.5) % 1
        const r = 4 + p * 9
        for (let x = Math.round(px - r); x <= px + r; x++) {
          addPixel(x, BASE + 1 + Math.round(p * 2), COL_FOAM_WARM, (1 - p) * 0.8, SEA)
        }
      }
    }

    for (let x = 0; x < W; x++) {
      const surf = 0.5 + 0.5 * Math.sin(simTime * 0.9 + x * 0.05)
      for (let y = 104; y < H; y++) {
        const i = y * W + x
        if (baseLayer[i] === ROCK) {
          if (baseLayer[i - W] !== ROCK && surf > 0.45) {
            addPixel(x, y - 1, COL_SURF, surf * 0.7, SEA)
          }
          break
        }
      }
    }

    // 3. Pointer wake on the water ("algo passando na água")
    for (let idx = wakes.length - 1; idx >= 0; idx--) {
      const wk = wakes[idx]!
      wk.age += dt
      if (wk.age >= wk.maxAge) {
        wakes.splice(idx, 1)
        continue
      }
      const prog = wk.age / wk.maxAge
      const fade = (1 - prog) ** 1.45 * wk.strength
      const depthK = clamp((wk.y - HOR) / (H - HOR))
      const rx = 1.4 + prog * (5.5 + depthK * 4.8)
      const ry = Math.max(0.9, rx * (0.32 + 0.34 * depthK))
      const sunProx = clamp(1 - Math.abs(wk.x - sunX) / (18 + depthK * 30)) * sunVis
      const wakeCrest = mix(COL_SURF, COL_FOAM_BRIGHT, sunProx * 0.75)

      const samples = Math.max(10, Math.ceil(rx * 5))
      for (let s = 0; s < samples; s++) {
        const ang = (s / samples) * Math.PI * 2
        const px = wk.x + Math.cos(ang) * rx
        const py = wk.y + Math.sin(ang) * ry
        if (py < HOR + 0.5) continue
        addPixel(px, py, wakeCrest, fade * 0.52, SEA)
        if (prog < 0.65) {
          addPixel(
            wk.x + Math.cos(ang) * Math.max(0, rx - 1),
            wk.y + Math.sin(ang) * Math.max(0, ry - 0.6),
            COL_DEEP_CAVITY,
            fade * 0.32,
            SEA,
          )
        }
      }

      if (wk.age < 0.14) {
        addPixel(wk.x, wk.y, COL_FOAM_BRIGHT, (1 - wk.age / 0.14) * 0.75 * wk.strength, SEA)
      }
    }

    // 4. Click splashes in the water ("glub!" cavity + crown droplets + rebound jet + concentric rings)
    for (let idx = splashes.length - 1; idx >= 0; idx--) {
      const sp = splashes[idx]!
      sp.age += dt
      if (sp.age >= sp.maxAge) {
        splashes.splice(idx, 1)
        continue
      }

      const depthK = clamp((sp.y - HOR) / (H - HOR))
      const perspY = 0.3 + 0.36 * depthK
      const sunProx = clamp(1 - Math.abs(sp.x - sunX) / 40) * sunVis
      const ringCrest = mix(COL_FOAM_WARM, COL_FOAM_BRIGHT, 0.45 + sunProx * 0.55)

      // Phase A: Dark "glub" plunge cavity at center
      if (sp.age < 0.28) {
        const cp = 1 - sp.age / 0.28
        const cr = 2.4 * sp.power * cp
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -Math.ceil(cr); dx <= Math.ceil(cr); dx++) {
            if (Math.hypot(dx, dy * 1.8) <= cr + 0.4) {
              addPixel(sp.x + dx, sp.y + dy, COL_DARK, cp * 0.85, SEA)
            }
          }
        }
      }

      // Phase B: Central vertical "bloop / glub" Worthington rebound jet + foam bubbles
      if (sp.age >= 0.13 && sp.age < 0.48) {
        const jp = (sp.age - 0.13) / 0.35
        const arch = Math.sin(jp * Math.PI)
        const jetH = Math.round(arch * 5.2 * sp.power)
        for (let h = 0; h <= jetH; h++) {
          addPixel(
            sp.x,
            sp.y - h,
            h === jetH ? COL_FOAM_BRIGHT : COL_FOAM_WARM,
            (1 - jp * 0.45) * 0.92,
            GATE,
          )
        }
        if (jp > 0.35) {
          addPixel(sp.x - 2, sp.y - 1, COL_FOAM_BRIGHT, (1 - jp) * 0.85, SEA)
          addPixel(sp.x + 2, sp.y, COL_FOAM_BRIGHT, (1 - jp) * 0.85, SEA)
        }
      }

      // Phase C: Ballistic crown droplets arcing into the air
      if (sp.age < 0.52) {
        const gravity = 68
        const dpAlpha = clamp(1 - sp.age / 0.52)
        for (const d of sp.droplets) {
          const dx = sp.x + d.vx * sp.age
          const dy = sp.y - d.vy * sp.age + 0.5 * gravity * sp.age * sp.age
          if (dy <= sp.y + 1) {
            addPixel(dx, dy, COL_FOAM_BRIGHT, dpAlpha * 0.95, GATE)
          }
        }
      }

      // Phase D: Primary & secondary expanding concentric rings
      for (let ringIdx = 0; ringIdx < 2; ringIdx++) {
        const rAge = sp.age - ringIdx * 0.2
        if (rAge <= 0) continue
        const rMax = sp.maxAge - ringIdx * 0.2
        const rp = rAge / rMax
        if (rp >= 1) continue

        const rx = (1.8 + rp * (22 - ringIdx * 5)) * sp.power
        const ry = Math.max(1, rx * perspY)
        const alpha = (1 - rp) ** 1.55 * (ringIdx === 0 ? 0.88 : 0.62)
        const steps = Math.max(16, Math.ceil(rx * 6.5))

        for (let s = 0; s < steps; s++) {
          const ang = (s / steps) * Math.PI * 2
          const px = sp.x + Math.cos(ang) * rx
          const py = sp.y + Math.sin(ang) * ry
          if (py < HOR + 0.5) continue
          addPixel(px, py, ringCrest, alpha, SEA)
          addPixel(
            sp.x + Math.cos(ang) * Math.max(0, rx - 1.1),
            sp.y + Math.sin(ang) * Math.max(0, ry - 0.6),
            COL_DEEP_CAVITY,
            alpha * 0.55,
            SEA,
          )
        }
      }
    }
  }

  function hasActiveInteractions(): boolean {
    return wakes.length > 0 || splashes.length > 0
  }

  return {
    spawnSplash,
    spawnWakeSegment,
    stepAndRender,
    hasActiveInteractions,
  }
}
