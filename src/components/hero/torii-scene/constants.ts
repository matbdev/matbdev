// Scene grid dimensions & depth layer constants
export const W = 240
export const H = 135
export const HOR = 71
export const CX = 120
export const BASE = 101
export const POST_X: readonly [number, number] = [100, 140]
export const DEFAULT_SUN_X = CX
export const DEFAULT_SUN_Y = 64
export const SUNR = 9

// Depth layers (0 = farthest background, 4 = nearest foreground)
export const SKY = 0
export const ISLE = 1
export const SEA = 2
export const GATE = 3
export const ROCK = 4

export type Rgb = [number, number, number]
export type Stop = [number, string]
export type Point2D = [number, number]

export type PixelAdder = (x: number, y: number, c: Rgb, alpha: number, upToLayer?: number) => void

export const clamp = (v: number, a = 0, b = 1): number => (v < a ? a : v > b ? b : v)
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t
export const smooth = (t: number): number => t * t * (3 - 2 * t)

function hash2(x: number, y: number, s: number): number {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

export function noise2(x: number, y: number, seed = 0): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = smooth(x - xi)
  const yf = smooth(y - yi)
  const a = hash2(xi, yi, seed)
  const b = hash2(xi + 1, yi, seed)
  const c = hash2(xi, yi + 1, seed)
  const d = hash2(xi + 1, yi + 1, seed)
  return lerp(lerp(a, b, xf), lerp(c, d, xf), yf)
}

export function fbm(x: number, y: number, octaves = 4, seed = 0): number {
  let v = 0
  let amp = 0.5
  let f = 1
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    v += amp * noise2(x * f, y * f, seed + i * 17)
    norm += amp
    amp *= 0.5
    f *= 2
  }
  return v / norm
}

const hexMap = new Map<string, Rgb>()
export function hex(h: string): Rgb {
  const cached = hexMap.get(h)
  if (cached) return cached
  const parsed: Rgb = [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ]
  hexMap.set(h, parsed)
  return parsed
}

export function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

export function ramp(stops: Stop[], t: number): Rgb {
  const ct = clamp(t)
  for (let i = 1; i < stops.length; i++) {
    const cur = stops[i]!
    const prev = stops[i - 1]!
    if (ct <= cur[0]) {
      const span = cur[0] - prev[0] || 1
      return mix(hex(prev[1]), hex(cur[1]), (ct - prev[0]) / span)
    }
  }
  return hex(stops[stops.length - 1]![1])
}

export function toHex(c: Rgb): string {
  return (
    '#' +
    c
      .map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0'))
      .join('')
  )
}

export function inPoly(x: number, y: number, poly: Point2D[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!
    const [xj, yj] = poly[j]!
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

// Hand-picked sunset palette from sea-torii-sunset + deep twilight & bright foam accents
const ANCHORS: Array<[...string[], number]> = [
  [
    '#46264c',
    '#7a3e72',
    '#a85a80',
    '#b85e80',
    '#c25a7a',
    '#e0707a',
    '#f5886c',
    '#ff9c64',
    '#ffb060',
    '#ffc470',
    '#ffd488',
    18,
  ],
  ['#ffffff', '#fff6d8', '#ffe6a0', '#ffd27a', 4],
  ['#442044', '#5a2a52', '#6e3258', '#84405e', 4],
  ['#2a0c12', '#3e1218', '#5a1a1c', '#7a2420', '#a03224', '#c44e30', 7],
  ['#ffbe7a', '#f59a6c', '#e07a6a', '#c0606a', '#9a4a64', '#74385a', '#52284a', '#361832', 14],
  ['#ffcf7a', '#f8b060', '#f0a070', 3],
  ['#1a0a14', '#24101c', 2],
  ['#ffe8d0', '#f8c8b0', 2],
  ['#9a4a6a', '#b85a70', 2],
]

function buildPalette(anchors: Array<[...string[], number]>): Rgb[] {
  const pal: Rgb[] = []
  for (const a of anchors) {
    const n = a[a.length - 1] as number
    const cs = (a.slice(0, -1) as string[]).map(hex)
    for (let i = 0; i < n; i++) {
      const t = (i / Math.max(1, n - 1)) * (cs.length - 1)
      const k = Math.min(cs.length - 2, Math.floor(t))
      pal.push(cs.length === 1 ? cs[0]! : mix(cs[k]!, cs[k + 1]!, t - k))
    }
  }
  return pal
}

export const PAL = buildPalette(ANCHORS)
export const PAL_HEX = PAL.map(toHex)
export const PAL_LUM = PAL.map((c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255)

// Shared colour constants
export const COL_DARK = hex('#24101c')
export const COL_TROUGH = hex('#74385a')
export const COL_DEEP_CAVITY = hex('#361832')
export const COL_FOAM_BRIGHT = hex('#fff6d8')
export const COL_FOAM_WARM = hex('#ffe8d0')

// 15-bit RGB nearest palette index lookup cache
const nearestCache = new Int16Array(32768).fill(-1)
export function nearestPaletteIndex(r: number, g: number, b: number): number {
  const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
  const hit = nearestCache[key]!
  if (hit >= 0) return hit
  let best = 0
  let bestDist = 1e9
  for (let i = 0; i < PAL.length; i++) {
    const p = PAL[i]!
    const d = (p[0] - r) ** 2 * 0.3 + (p[1] - g) ** 2 * 0.59 + (p[2] - b) ** 2 * 0.11
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  nearestCache[key] = best
  return best
}

export function computeSunVisibility(sunY: number): number {
  return clamp((HOR + SUNR - sunY) / (SUNR * 1.35), 0.15, 1)
}
