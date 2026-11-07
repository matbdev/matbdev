import { clamp, H, nearestPaletteIndex, PAL_HEX, PAL_LUM, W } from './constants'

// Ink coverage of LEVELS[3..7] ("▄▅▆▇█") in ASCII Magic's glyphs.js
const LEVEL_COVER = [0.5135, 0.6351, 0.7568, 0.8784, 1.0] as const

export interface StageViewport {
  viewW: number
  viewH: number
  dpr: number
  cellPx: number
  stageOffsetX: number
  stageOffsetY: number
}

export function createSquaresRenderer() {
  const cellPalIdx = new Uint8Array(W * H)
  const cellRawDensity = new Float32Array(W * H)

  // Exact ASCII Magic "Squares" + Dot size 100% halftone renderer
  function paintSquares100(
    ctx: CanvasRenderingContext2D,
    frameRgb: Float32Array,
    vp: StageViewport,
  ) {
    const { viewW, viewH, dpr, cellPx, stageOffsetX, stageOffsetY } = vp
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, viewW, viewH)

    let maxD = 0
    let minD = Infinity
    const total = W * H

    for (let i = 0; i < total; i++) {
      const o = i * 3
      const r = clamp(frameRgb[o]!, 0, 255)
      const g = clamp(frameRgb[o + 1]!, 0, 255)
      const b = clamp(frameRgb[o + 2]!, 0, 255)

      const k = nearestPaletteIndex(r, g, b)
      const lumY = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
      const lv = lumY > 0.86 ? 4 : clamp(Math.round(5 + (lumY - PAL_LUM[k]!) * 12), 3, 6) - 3
      const rawD = LEVEL_COVER[lv]! * PAL_LUM[k]!

      cellPalIdx[i] = k
      cellRawDensity[i] = rawD
      if (rawD > maxD) maxD = rawD
      if (rawD >= 0.004 && rawD < minD) minD = rawD
    }

    // Anchor scene density range so occlusion of the sun disc by mountains, clouds, or Torii
    // does not cause dynamic range collapse and auto-exposure flickering across the sky.
    const effectiveMaxD = Math.max(0.965, maxD)
    const effectiveMinD = Math.min(0.038, minD)
    const hasSpan = effectiveMaxD - effectiveMinD > 0.05
    const span = hasSpan ? effectiveMaxD - effectiveMinD : effectiveMaxD || 1
    const lo = hasSpan ? effectiveMinD : 0

    // ASCII Magic lookOpts(contrast=0, look="squares", size=100%):
    // gamma = 0.35 * 1.9 = 0.665, size = 1.0, minDot = 0.22, steps = 3
    const effectiveGamma = 0.35 * 1.9
    const minDot = 0.22
    const steps = 3

    const paths = new Map<number, Path2D>()

    const cStart = Math.max(0, Math.floor(-stageOffsetX / cellPx))
    const cEnd = Math.min(W - 1, Math.ceil((viewW - stageOffsetX) / cellPx))
    const rStart = Math.max(0, Math.floor(-stageOffsetY / cellPx))
    const rEnd = Math.min(H - 1, Math.ceil((viewH - stageOffsetY) / cellPx))

    for (let r = rStart; r <= rEnd; r++) {
      const cy = stageOffsetY + (r + 0.5) * cellPx
      const rowOffset = r * W
      for (let c = cStart; c <= cEnd; c++) {
        const idx = rowOffset + c
        const rawD = cellRawDensity[idx]!
        if (rawD < 0.004) continue

        const d = Math.max(0.0001, Math.pow(Math.max(0, rawD - lo) / span, effectiveGamma))
        const v = Math.ceil(d * steps) / steps
        const half = 0.5 * cellPx * 1.0 * (minDot + (1 - minDot) * v)
        if (half < 0.15) continue

        const palIdx = cellPalIdx[idx]!
        let path = paths.get(palIdx)
        if (!path) {
          path = new Path2D()
          paths.set(palIdx, path)
        }
        const cx = stageOffsetX + (c + 0.5) * cellPx
        path.rect(cx - half, cy - half, half * 2, half * 2)
      }
    }

    for (const [palIdx, path] of paths) {
      ctx.fillStyle = PAL_HEX[palIdx]!
      ctx.fill(path)
    }
  }

  return {
    paintSquares100,
  }
}
