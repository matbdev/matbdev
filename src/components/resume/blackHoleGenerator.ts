// Procedural ASCII Black Hole Generator
// Inspired by ascii-magic (piece: black-hole by Kailash)
// Self-contained mathematical simulation with accretion disk, gravitational lensing and starfield.

function clamp(v: number, a = 0, b = 1): number {
  return v < a ? a : v > b ? b : v
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t)
}

function rng(seed = 1): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash2(x: number, y: number, s: number): number {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

function noise2(x: number, y: number, seed = 0): number {
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

function fbm(x: number, y: number, octaves = 4, seed = 0): number {
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

export function generateGradient(stops: string[], n = 10): string[] {
  const toRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const rgb = stops.map(toRgb)
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * (rgb.length - 1)
    const j = Math.min(rgb.length - 2, Math.floor(t))
    const f = t - j
    const c0 = rgb[j]
    const c1 = rgb[j + 1]
    if (!c0 || !c1) continue
    const c = c0.map((v, k) => Math.round(lerp(v, c1[k] ?? v, f)))
    out.push('#' + c.map((v) => v.toString(16).padStart(2, '0')).join(''))
  }
  return out
}

export const BLACK_HOLE_BG_COLORS = generateGradient(
  ['#020208', '#070a1e', '#11143a', '#1e1a4a', '#2c1c48'],
  8,
)
export const BLACK_HOLE_STAR_COLORS = ['#7f8fd0', '#dfe6ff']
export const BLACK_HOLE_DISK_COLORS = generateGradient(
  [
    '#1c0400',
    '#4a0c02',
    '#8a1e04',
    '#c8400a',
    '#ec7418',
    '#ffae40',
    '#ffd890',
    '#fff3d8',
    '#ffffff',
  ],
  18,
)

export const BLACK_HOLE_COLS = 100
export const BLACK_HOLE_ROWS = 38
export const BLACK_HOLE_FPS = 24

const SH = ' ░▒▓█'

export interface BlackHoleFrame {
  chars: string[]
  colors: string[]
  cols: number
  rows: number
}

export function createBlackHoleSimulator() {
  const cols = BLACK_HOLE_COLS
  const rows = BLACK_HOLE_ROWS
  const totalCells = cols * rows

  const chars: string[] = Array.from({ length: totalCells }, () => ' ')
  const colors: string[] = Array.from({ length: totalCells }, () => '#000000')

  const cx = cols / 2
  const cy = rows / 2 + 0.5
  const RS = 9.5
  const S = 0.2
  const ROT = -0.08
  const RIN = 13
  const ROUT = 46
  const cr = Math.cos(ROT)
  const sr = Math.sin(ROT)
  const r = rng(3)

  const SW = 220
  const SHH = 90
  const smap = new Uint8Array(SW * SHH)
  for (let i = 0; i < 520; i++) {
    smap[Math.floor(r() * SW) + Math.floor(r() * SHH) * SW] = 1 + Math.floor(r() * 3)
  }

  const bgn = new Float32Array(totalCells)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      bgn[x + y * cols] = fbm(x * 0.03, y * 0.08, 4, 8)
    }
  }

  const P = 7

  const tex = (rd: number, ph: number, t: number) => {
    let s = 0
    for (let k = 0; k < 2; k++) {
      const f = (t / P + k * 0.5) % 1
      const wgt = 1 - Math.abs(f * 2 - 1)
      const a = ph - f * P * 1.7 * Math.pow(RIN / rd, 1.5)
      s += wgt * fbm(Math.cos(a) * rd * 0.22 + k * 30, Math.sin(a) * rd * 0.22, 3, 2)
    }
    return s
  }

  return (t: number): BlackHoleFrame => {
    chars.fill(' ')

    for (let y = 0; y < rows; y++) {
      const rowOffset = y * cols
      for (let x = 0; x < cols; x++) {
        const idx = rowOffset + x
        const dx = x + 0.5 - cx
        const dy = (y + 0.5 - cy) * 2
        const u = dx * cr + dy * sr
        const w = -dx * sr + dy * cr
        const rr = Math.hypot(u, w)
        let I = -1

        // Background, lensed around the black hole event horizon
        if (rr > RS) {
          const bend = 1 + (RS * RS * 1.4) / (rr * rr)
          const sx = Math.floor((((cx + dx * bend + t * 3) % SW) + SW) % SW)
          const sy = Math.floor(((cy * 2 + dy * bend) / 2 + 30 + SHH) % SHH)
          const halo = Math.exp(-(rr - RS) / 20) * 0.35
          const bgVal = bgn[idx] ?? 0.5
          const v = clamp(bgVal * 0.9 - 0.18 + halo)
          const bgIdx = Math.min(BLACK_HOLE_BG_COLORS.length - 1, Math.floor(v * 8))
          chars[idx] = v > 0.42 ? '▒' : '░'
          colors[idx] = BLACK_HOLE_BG_COLORS[bgIdx] ?? '#020208'

          const st = smap[sx + sy * SW]
          if (st) {
            chars[idx] = st === 3 ? '+' : st === 2 ? '·' : '.'
            colors[idx] = BLACK_HOLE_STAR_COLORS[st > 1 ? 1 : 0] ?? '#dfe6ff'
          }
        } else {
          chars[idx] = ' '
          colors[idx] = '#000000'
        }

        // Lensed image of the far disk: a bright halo hugging the shadow
        if (rr > RS && rr < RS * 2) {
          const a = Math.atan2(w, u)
          const top = 0.55 + 0.45 * Math.max(0, -Math.sin(a))
          const prof = Math.exp(-Math.pow((rr - RS * 1.18) / (RS * 0.32), 2))
          const tx = tex(RIN + (rr - RS) * 3, a, t)
          I = Math.max(I, prof * top * (0.55 + 0.75 * tx) * (1 - 0.35 * Math.cos(a)))
        }

        // Photon ring
        const ring = Math.exp(-Math.pow((rr - RS * 1.04) / 0.7, 2))
        if (ring > 0.2) {
          I = Math.max(I, ring * 1.05)
        }

        // Primary accretion disk
        const rz = w / S
        const rd = Math.hypot(u, rz)
        if (rd > RIN && rd < ROUT && (rz > 0 || rr > RS * 1.05)) {
          const ph = Math.atan2(rz, u)
          const temp = Math.pow(RIN / rd, 0.9)
          const edge = clamp((rd - RIN) / 2) * clamp((ROUT - rd) / 10)
          const dop = 1 - 0.5 * (u / rd)
          const tx = tex(rd, ph, t)
          const D = temp * edge * dop * (0.45 + 0.9 * tx)
          if (rz < 0 && rr < RS * 2.1) {
            I = Math.max(I, D * 0.6)
          } else {
            I = Math.max(I, D)
          }
        }

        if (I > 0.06) {
          const v = clamp(I)
          const chIdx = 1 + Math.min(3, Math.floor(v * 4.5))
          const diskColorIdx = Math.min(BLACK_HOLE_DISK_COLORS.length - 1, Math.floor(v * 18))
          chars[idx] = SH[chIdx] ?? '░'
          colors[idx] = BLACK_HOLE_DISK_COLORS[diskColorIdx] ?? '#ffae40'
        }
      }
    }

    return {
      chars,
      colors,
      cols,
      rows,
    }
  }
}
