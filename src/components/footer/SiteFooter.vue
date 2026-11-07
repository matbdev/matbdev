<script setup lang="ts">
import { ref } from 'vue'
import FooterBottomBar from './FooterBottomBar.vue'
import FooterContactInfo from './FooterContactInfo.vue'
import FooterHorizonStrip from './FooterHorizonStrip.vue'
import FooterMessageComposer from './FooterMessageComposer.vue'

const footerRef = ref<HTMLElement | null>(null)
const horizonRef = ref<InstanceType<typeof FooterHorizonStrip> | null>(null)

function onFooterPointerMove(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const el = footerRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  if (rect.width <= 0) return
  horizonRef.value?.pulsePointer((event.clientX - rect.left) / rect.width)
}
</script>

<template>
  <footer
    id="contact"
    ref="footerRef"
    class="site-footer"
    aria-labelledby="footer-contact-title"
    @pointermove="onFooterPointerMove"
  >
    <div class="site-footer__shell">
      <div class="site-footer__main">
        <FooterContactInfo />
        <FooterMessageComposer />
      </div>

      <FooterBottomBar />
    </div>

    <FooterHorizonStrip ref="horizonRef" />
  </footer>
</template>

<style scoped lang="scss">
.site-footer {
  background-color: #0d0f12;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;

  &__shell {
    position: relative;
    width: 100%;
    max-width: $layout-max;
    margin: 0 auto;
    padding: $space-section $layout-gutter $space-6;
  }

  &__main {
    display: grid;
    grid-template-columns: minmax(0, 0.96fr) minmax(0, 1.04fr);
    align-items: stretch;
    gap: clamp(2.25rem, 4.5vw, 4.5rem);
    padding-bottom: clamp(2.5rem, 5vw, 4rem);
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  }

  @media (max-width: 960px) {
    &__main {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    &__shell {
      padding: $space-section $layout-gutter $space-5;
    }
  }
}
</style>
