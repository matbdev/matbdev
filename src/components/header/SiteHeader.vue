<script setup lang="ts">
import { ref } from 'vue'
import HeaderLanguageSwitch from './HeaderLanguageSwitch.vue'
import HeaderNavMenu from './HeaderNavMenu.vue'
import type { MenuOptionsProps } from './types'
import { useLiquidGlassPointer } from './useLiquidGlassPointer'

defineProps<{
  menuOptions: MenuOptionsProps[]
}>()

const headerRef = ref<HTMLElement | null>(null)
const menuRef = ref<InstanceType<typeof HeaderNavMenu> | null>(null)

const { isTracking, onPointerMove, onPointerLeave } = useLiquidGlassPointer(headerRef)

function onNavMouseLeave() {
  menuRef.value?.hideLens()
}
</script>

<template>
  <!-- Definição SVG para refração óptica sutil de vidro -->
  <svg
    class="header__filter-defs"
    width="0"
    height="0"
    aria-hidden="true"
    style="position: absolute; width: 0; height: 0; pointer-events: none"
  >
    <defs>
      <filter
        id="glass-refraction"
        x="0"
        y="0"
        width="100%"
        height="100%"
        color-interpolation-filters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.006 0.025"
          numOctaves="1"
          seed="8"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="3" result="soft-noise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="soft-noise"
          scale="4"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>

  <header
    ref="headerRef"
    class="header__container"
    :class="{ 'is-tracking': isTracking }"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <nav class="header__nav" @mouseleave="onNavMouseLeave">
      <HeaderNavMenu ref="menuRef" :menu-options="menuOptions" />

      <span class="header__divider" aria-hidden="true" />

      <HeaderLanguageSwitch />
    </nav>
  </header>
</template>

<style lang="scss" scoped>
.header {
  &__container {
    position: sticky;
    top: $space-6;
    z-index: 50;
    isolation: isolate;

    // Cápsula concêntrica ajustada ao conteúdo
    width: fit-content;
    max-width: calc(100vw - ($layout-gutter * 2));
    margin: 0 auto;
    padding: 0.375rem;
    border-radius: $radius-pill;

    // Corpo óptico Darkroom (grafite profundo + dispersão frost-blue)
    background:
      linear-gradient(
        135deg,
        rgba(238, 236, 230, 0.07) 0%,
        rgba(255, 255, 255, 0.015) 42%,
        rgba(168, 196, 227, 0.045) 76%,
        rgba(238, 236, 230, 0.035) 100%
      ),
      rgba(22, 25, 30, 0.68);
    backdrop-filter: blur(24px) saturate(165%);
    -webkit-backdrop-filter: blur(24px) saturate(165%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow:
      0 22px 48px -12px rgba(0, 0, 0, 0.75),
      0 4px 14px -2px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 0 rgba(238, 236, 230, 0.2),
      inset 0 -1px 0 0 rgba(168, 196, 227, 0.08);

    @supports (backdrop-filter: url('#glass-refraction')) {
      backdrop-filter: url('#glass-refraction') blur(24px) saturate(165%);
      -webkit-backdrop-filter: url('#glass-refraction') blur(24px) saturate(165%);
    }

    // Rastro líquido interno em duas velocidades (núcleo âmbar + cauda laranja)
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      z-index: -1;
      pointer-events: none;
      opacity: 0;
      background:
        radial-gradient(
          110px 68px at var(--pointer-x, 50%) var(--pointer-y, 50%),
          rgba(255, 196, 112, 0.14) 0%,
          transparent 70%
        ),
        radial-gradient(
          230px 120px at var(--glow-x, 50%) var(--glow-y, 50%),
          rgba(255, 176, 96, 0.14) 0%,
          rgba(255, 196, 112, 0.05) 45%,
          transparent 76%
        );
      transition: opacity 420ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    // Chanfro especular de 1px que ilumina a borda de vidro próxima ao cursor
    &::after {
      content: '';
      position: absolute;
      inset: -1px;
      padding: 1px;
      border-radius: inherit;
      pointer-events: none;
      z-index: 2;
      opacity: 0;
      background: radial-gradient(
        180px circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
        rgba(255, 196, 112, 0.65) 0%,
        rgba(255, 176, 96, 0.34) 38%,
        rgba(255, 255, 255, 0.05) 72%,
        transparent 100%
      );
      -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      mask-composite: exclude;
      transition: opacity 320ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    &.is-tracking::before,
    &.is-tracking::after {
      opacity: 1;
    }
  }

  &__nav {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    width: 100%;
    min-width: 0;
  }

  &__divider {
    display: inline-block;
    width: 1px;
    height: 18px;
    margin: 0 0.15rem;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.04) 0%,
      rgba(255, 232, 208, 0.22) 50%,
      rgba(168, 196, 227, 0.08) 100%
    );
    flex-shrink: 0;
  }

  @media (max-width: 640px) {
    &__container {
      max-width: calc(100vw - 1.5rem);
      padding: 0.3rem;
    }

    &__nav {
      gap: 0.25rem;
    }

    &__divider {
      margin: 0 0.05rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__container::before,
    &__container::after {
      transition: none;
    }
  }
}
</style>
