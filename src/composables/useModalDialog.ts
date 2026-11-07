import { nextTick, onScopeDispose, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

/** Owns focus, keyboard handling and temporary scroll styles for one modal. */
export function useModalDialog(
  open: MaybeRefOrGetter<boolean>,
  dialog: Readonly<Ref<HTMLElement | null>>,
  initialFocus: Readonly<Ref<HTMLElement | null>>,
  close: () => void,
) {
  let restore: (() => void) | undefined

  function release() {
    restore?.()
    restore = undefined
  }

  watch(
    () => toValue(open),
    async (isOpen, _, onCleanup) => {
      if (!isOpen) {
        release()
        return
      }
      if (typeof document === 'undefined') return

      const previousFocus = document.activeElement
      const html = document.documentElement
      const body = document.body
      const saved = [html, body].map((element) => ({
        element,
        properties: ['overflow', 'overscroll-behavior', 'padding-right'].map((property) => ({
          property,
          value: element.style.getPropertyValue(property),
          priority: element.style.getPropertyPriority(property),
        })),
      }))

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          event.preventDefault()
          close()
          return
        }
        if (event.key !== 'Tab' || !dialog.value) return
        const focusables = Array.from(
          dialog.value.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]',
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(':disabled, [hidden], [aria-hidden="true"]') &&
            element.getClientRects().length > 0,
        )
        const first = focusables[0]
        const last = focusables.at(-1)

        if (!first || !last) {
          event.preventDefault()
          dialog.value.focus()
        } else if (
          !dialog.value.contains(document.activeElement) ||
          (event.shiftKey && document.activeElement === first)
        ) {
          event.preventDefault()
          ;(event.shiftKey ? last : first).focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth)
      if (scrollbarWidth > 0) {
        const padding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0
        body.style.paddingRight = `${padding + scrollbarWidth}px`
      }
      for (const element of [html, body]) {
        element.style.overflow = 'hidden'
        element.style.overscrollBehavior = 'none'
      }
      window.addEventListener('keydown', handleKeyDown)

      restore = () => {
        window.removeEventListener('keydown', handleKeyDown)
        for (const { element, properties } of saved) {
          for (const { property, value, priority } of properties) {
            if (value) element.style.setProperty(property, value, priority)
            else element.style.removeProperty(property)
          }
        }
        if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
          previousFocus.focus({ preventScroll: true })
        }
      }

      let cancelled = false
      onCleanup(() => {
        cancelled = true
      })
      await nextTick()
      if (!cancelled && toValue(open)) initialFocus.value?.focus({ preventScroll: true })
    },
    { immediate: true },
  )

  onScopeDispose(release)
}
