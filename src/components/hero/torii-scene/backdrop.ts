import {
  BASE,
  CX,
  DEFAULT_SUN_Y,
  fbm,
  GATE,
  H,
  hex,
  HOR,
  inPoly,
  ISLE,
  mix,
  noise2,
  POST_X,
  ramp,
  ROCK,
  SEA,
  SKY,
  W,
  clamp,
  computeSunVisibility,
  type Point2D,
  type Rgb,
  type Stop,
} from './constants'

const SKY_STOPS_WARM: Stop[] = [
  [0, '#96507a'],
  [0.18, '#a85a80'],
  [0.34, '#b85e80'],
  [0.5, '#c8607a'],
  [0.65, '#e0707a'],
  [0.78, '#f5886c'],
  [0.9, '#ff9c64'],
  [1, '#ffb060'],
]

const SKY_STOPS_DUSK: Stop[] = [
  [0, '#44244c'],
  [0.24, '#62305e'],
  [0.48, '#8e466c'],
  [0.72, '#bc5e72'],
  [0.88, '#e07a68'],
  [1, '#f29464'],
]

const SEA_STOPS_WARM: Stop[] = [
  [0, '#ffbe7a'],
  [0.12, '#f59a6c'],
  [0.3, '#e07a6a'],
  [0.55, '#c0606a'],
  [0.8, '#9a4a64'],
  [1, '#74385a'],
]

const SEA_STOPS_DUSK: Stop[] = [
  [0, '#d8826c'],
  [0.18, '#b46268'],
  [0.42, '#8c4862'],
  [0.72, '#643254'],
  [1, '#442042'],
]

// Static precomputed geometry masks & noises (shared across instances, built once)
let initialized = false
const isleTop = new Int16Array(W)
const seaBandNoise = new Float32Array(W * H)
const staticGateMask = new Uint8Array(W * H)
const staticGateWood = new Float32Array(W * H * 3)
const staticRockMask = new Uint8Array(W * H)
const staticRockRgb = new Float32Array(W * H * 3)

function ensureStaticGeometry() {
  if (initialized) return
  initialized = true

  // 1. Far islands silhouette across the horizon
  for (let x = 0; x < W; x++) {
    const l = 63 + (x / 65) ** 2 * 8 - 2.2 * fbm(x / 10, 3, 3, 5)
    const r = 65 + ((W - x) / 58) ** 2 * 7 - 2.2 * fbm(x / 9, 7, 3, 9)
    const top = Math.min(x < 78 ? l : 999, x > 168 ? r : 999)
    isleTop[x] = Math.floor(top)
  }

  // 2. Sea reflection noise
  for (let y = HOR; y < H; y++) {
    for (let x = 0; x < W; x++) {
      seaBandNoise[y * W + x] = noise2(x / 7, y * 0.9, 3)
    }
  }

  // 3. Torii gate structure
  const putGate = (x: number, y: number) => {
    const rx = Math.round(x)
    const ry = Math.round(y)
    if (rx < 0 || ry < 0 || rx >= W || ry >= H) return
    const idx = ry * W + rx
    staticGateMask[idx] = 1
    const col = noise2(rx / 2, ry / 2, 4) > 0.75 ? hex('#3e1218') : hex('#2a0c12')
    staticGateWood[idx * 3] = col[0]
    staticGateWood[idx * 3 + 1] = col[1]
    staticGateWood[idx * 3 + 2] = col[2]
  }

  const rectGate = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) putGate(x, y)
    }
  }

  for (const px of POST_X) {
    for (let y = 35; y <= BASE; y++) {
      const w = 3 + (y - 35) / 60
      for (let x = Math.round(px - w); x <= Math.round(px + w - 1); x++) {
        putGate(x, y)
      }
    }
  }
  rectGate(86, 46, 154, 49) // lower beam
  rectGate(118, 35, 122, 46) // centre strut
  for (let x = 78; x <= 162; x++) {
    const u = Math.abs(x - CX) / 42
    const lift = u ** 3 * 5
    for (let y = Math.round(28 - lift); y <= Math.round(32 - lift * 0.8); y++) {
      putGate(x, y) // curved top beam
    }
    if (u < 0.88) {
      for (let y = 33; y <= 35; y++) putGate(x, y) // second beam
    }
  }

  // 4. Foreground shore rocks tucked into bottom corners
  const rockL: Point2D[] = [
    [0, 108],
    [12, 106],
    [26, 112],
    [40, 117],
    [54, 126],
    [62, H],
    [0, H],
  ]
  const rockR: Point2D[] = [
    [W, 116],
    [228, 114],
    [215, 120],
    [201, 127],
    [193, H],
    [W, H],
  ]

  for (let y = 104; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (inPoly(x + 0.5, y + 0.5, rockL) || inPoly(x + 0.5, y + 0.5, rockR)) {
        const idx = y * W + x
        staticRockMask[idx] = 1
        const n = fbm(x / 4, y / 4, 3, 11)
        const col = n > 0.58 ? hex('#3e1218') : hex('#1a0a14')
        staticRockRgb[idx * 3] = col[0]
        staticRockRgb[idx * 3 + 1] = col[1]
        staticRockRgb[idx * 3 + 2] = col[2]
      }
    }
  }
}

export function createBackdropSystem() {
  ensureStaticGeometry()

  const baseRgb = new Float32Array(W * H * 3)
  const baseLayer = new Uint8Array(W * H)

  function putBase(x: number, y: number, c: Rgb, layerId: number) {
    const rx = Math.round(x)
    const ry = Math.round(y)
    if (rx < 0 || ry < 0 || rx >= W || ry >= H) return
    const i = ry * W + rx
    baseRgb[i * 3] = c[0]
    baseRgb[i * 3 + 1] = c[1]
    baseRgb[i * 3 + 2] = c[2]
    baseLayer[i] = layerId
  }

  function rebuildLitScene(sx: number, sy: number) {
    const duskBlend = clamp((sy - DEFAULT_SUN_Y) / 12, 0, 1)
    const sunVis = computeSunVisibility(sy)

    // 1. Sky gradient + solar glow (clouds are now rendered dynamically per frame!)
    const glowCol = mix(hex('#ffc470'), hex('#ff9c64'), duskBlend * 0.6)
    for (let y = 0; y < HOR; y++) {
      const t = y / HOR
      const baseSky = mix(ramp(SKY_STOPS_WARM, t), ramp(SKY_STOPS_DUSK, t), duskBlend)
      for (let x = 0; x < W; x++) {
        const d = Math.hypot(x - sx, (y - sy) * 1.6)
        const c = mix(baseSky, glowCol, clamp(1 - d / 72) * 0.6 * sunVis)
        putBase(x, y, c, SKY)
      }
    }

    // 2. Far islands on the horizon
    for (let x = 0; x < W; x++) {
      const top = isleTop[x]!
      if (top >= HOR) continue
      const warmEdge = clamp(1 - Math.abs(x - sx) / 64) * 0.28 * sunVis
      const hiCol = mix(hex('#84405e'), hex('#b85a70'), warmEdge)
      for (let y = top; y < HOR; y++) {
        putBase(x, y, mix(hiCol, hex('#5a2a52'), clamp((y - top) / 5)), ISLE)
      }
    }

    // 3. Sea + dynamic sun reflection column
    for (let y = HOR; y < H; y++) {
      const k = (y - HOR) / (H - HOR)
      const rowBase = mix(ramp(SEA_STOPS_WARM, k), ramp(SEA_STOPS_DUSK, k), duskBlend)
      const reflCenterX = sx + (sx - CX) * k * 0.16
      const reflHalfW = 6 + k * 30
      for (let x = 0; x < W; x++) {
        let c = rowBase
        const sd = Math.abs(x - reflCenterX) / reflHalfW
        if (sd < 1) {
          const band = seaBandNoise[y * W + x]!
          const glint = (1 - sd * sd) * (band > 0.4 ? 0.82 : 0.35) * (1 - k * 0.38) * sunVis
          c = mix(c, hex('#ffcf7a'), glint)
        }
        putBase(x, y, c, SEA)
      }
    }

    // 4. Torii gate + directional rim light on sun-facing edges
    for (let y = 26; y <= BASE; y++) {
      for (let x = 78; x <= 162; x++) {
        const idx = y * W + x
        if (!staticGateMask[idx]) continue
        baseRgb[idx * 3] = staticGateWood[idx * 3]!
        baseRgb[idx * 3 + 1] = staticGateWood[idx * 3 + 1]!
        baseRgb[idx * 3 + 2] = staticGateWood[idx * 3 + 2]!
        baseLayer[idx] = GATE
      }
    }

    for (let y = 26; y <= BASE; y++) {
      for (let x = 78; x <= 162; x++) {
        const idx = y * W + x
        if (baseLayer[idx] !== GATE) continue
        const leftOpen = baseLayer[idx - 1] !== GATE
        const rightOpen = baseLayer[idx + 1] !== GATE
        const topOpen = baseLayer[idx - W] !== GATE
        const bottomOpen = baseLayer[idx + W] !== GATE

        const facesHoriz = (leftOpen && sx <= x + 10) || (rightOpen && sx >= x - 10)
        const facesVert = (topOpen && sy <= y + 6) || (bottomOpen && sy >= y - 6)
        if (!facesHoriz && !facesVert) continue

        const dist = Math.hypot(x - sx, y - sy)
        if (dist < 58) {
          const rimStrength = clamp(1 - dist / 58)
          const rimCol = mix(hex('#7a2420'), hex('#c44e30'), rimStrength * 0.65 * sunVis)
          putBase(x, y, rimCol, GATE)
        }
      }
    }

    // Reflection of the posts below the waterline (leaning slightly away from the sun)
    for (let y = BASE + 1; y < H; y++) {
      const depthRatio = (y - BASE) / (H - BASE)
      const baseWobble = Math.sin(y * 1.3) * 1.2
      for (const px of POST_X) {
        const lean = clamp((px - sx) * 0.055, -2.8, 2.8) * depthRatio
        const wob = Math.round(baseWobble + lean)
        const fade = clamp(1 - depthRatio * 0.45, 0.35, 1) * 0.65
        for (let x = px - 3; x <= px + 3; x++) {
          const tx = x + wob
          if (tx < 0 || tx >= W) continue
          const i = (y * W + tx) * 3
          const cur: Rgb = [baseRgb[i]!, baseRgb[i + 1]!, baseRgb[i + 2]!]
          putBase(tx, y, mix(cur, hex('#24101c'), fade), SEA)
        }
      }
    }

    // 5. Foreground shore rocks
    for (let y = 104; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x
        if (!staticRockMask[idx]) continue
        let c: Rgb = [
          staticRockRgb[idx * 3]!,
          staticRockRgb[idx * 3 + 1]!,
          staticRockRgb[idx * 3 + 2]!,
        ]
        if (!staticRockMask[idx - W]) {
          const rockRim = clamp(1 - Math.abs(x - sx) / 86) * 0.35 * sunVis
          c = mix(c, hex('#7a2420'), rockRim)
        }
        putBase(x, y, c, ROCK)
      }
    }
  }

  return {
    baseRgb,
    baseLayer,
    rebuildLitScene,
  }
}
