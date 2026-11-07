/**
 * Updates localized CSS variables (--mx, --my) on architectural controls
 * for the cursor-tracked warm-amber spotlight effect.
 */
export function onSpotMove(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  const target = event.currentTarget as HTMLElement | null
  if (!target) return
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--mx', `${(event.clientX - rect.left).toFixed(1)}px`)
  target.style.setProperty('--my', `${(event.clientY - rect.top).toFixed(1)}px`)
}
