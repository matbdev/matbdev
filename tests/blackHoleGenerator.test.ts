import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createBlackHoleSimulator,
  BLACK_HOLE_COLS,
  BLACK_HOLE_ROWS,
  BLACK_HOLE_DISK_COLORS,
  BLACK_HOLE_BG_COLORS,
} from '../src/components/resume/blackHoleGenerator.ts'

test('blackHoleGenerator initializes with standard cosmic palette and dimensions', () => {
  assert.equal(BLACK_HOLE_COLS, 100)
  assert.equal(BLACK_HOLE_ROWS, 38)
  assert.equal(BLACK_HOLE_DISK_COLORS.length, 18)
  assert.equal(BLACK_HOLE_BG_COLORS.length, 8)
  // Ensure disk palette contains amber/gold tones (#ffb..., #ffc...)
  assert.ok(BLACK_HOLE_DISK_COLORS.some((hex) => hex.startsWith('#ffb') || hex.startsWith('#ffc')))
})

test('blackHoleGenerator computes valid frames with event horizon and accretion disk', () => {
  const simulator = createBlackHoleSimulator()
  const frame = simulator(1.0)

  assert.equal(frame.cols, 100)
  assert.equal(frame.rows, 38)
  assert.equal(frame.chars.length, 100 * 38)
  assert.equal(frame.colors.length, 100 * 38)

  // Center cell (50, 19) is inside the event horizon shadow (RS = 9.5), so it should be empty
  const centerIdx = 19 * 100 + 50
  assert.equal(frame.chars[centerIdx], ' ')

  // The accretion disk should have dense block characters (░, ▒, ▓, █)
  const hasDiskBlocks = frame.chars.some((c) => c === '█' || c === '▓' || c === '▒' || c === '░')
  assert.ok(hasDiskBlocks, 'Accretion disk should contain block shading characters')

  // Starfield should contain cosmic stars (+, ·, .)
  const hasStars = frame.chars.some((c) => c === '+' || c === '·' || c === '.')
  assert.ok(hasStars, 'Background should contain lensed starfield points')
})
