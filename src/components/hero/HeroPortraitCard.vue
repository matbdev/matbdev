<script setup lang="ts">
import { computed, ref } from 'vue'
import { MapPin } from 'lucide-vue-next'
import portrait640Src from '@/assets/images/mateus-640.webp'
import portrait1280Src from '@/assets/images/mateus-1280.webp'
import portraitSrc from '@/assets/images/mateus.webp'
import { heroProfile } from '@/data/heroProfile'
import HeroFocusConsole from './HeroFocusConsole.vue'
import HeroPerchedPenguin from './HeroPerchedPenguin.vue'
import { useCardTiltAndGlass } from './useCardTiltAndGlass'

const portraitSrcSet = `${portrait640Src} 640w, ${portrait1280Src} 1280w, ${portraitSrc} 1920w`

const cardRef = ref<HTMLElement | null>(null)
const penguinCompRef = ref<InstanceType<typeof HeroPerchedPenguin> | null>(null)

const isPenguinDragging = computed(() => Boolean(penguinCompRef.value?.isDraggingPenguin))
const isPenguinActive = computed(() =>
  Boolean(penguinCompRef.value?.isDraggingPenguin || penguinCompRef.value?.isReturningPenguin),
)

const { isTracking, onCardPointerMove, onCardPointerLeave } = useCardTiltAndGlass(
  cardRef,
  isPenguinDragging,
)
</script>

<template>
  <div class="portrait-stage" :class="{ 'is-penguin-active': isPenguinActive }">
    <div
      ref="cardRef"
      class="portrait-card"
      :class="{ 'is-tracking': isTracking }"
      @pointermove="onCardPointerMove"
      @pointerleave="onCardPointerLeave"
    >
      <!-- Camada óptica Liquid Glass desacoplada do texto (evita rasterização borrada em 3D) -->
      <div class="portrait-card__glass" aria-hidden="true" />

      <div class="portrait-card__content">
        <HeroPerchedPenguin
          ref="penguinCompRef"
          :card-el="cardRef"
          @pick-up="onCardPointerLeave"
        />

        <div class="portrait-card__meta">
          <span class="portrait-card__location">
            <MapPin class="portrait-card__pin" aria-hidden="true" />
            {{ heroProfile.location }}
          </span>
        </div>

        <figure class="portrait-card__figure">
          <div class="portrait-card__frame">
            <img
              :src="portraitSrc"
              :srcset="portraitSrcSet"
              sizes="(max-width: 920px) 720px, 640px"
              :alt="heroProfile.portraitAlt"
              width="1920"
              height="1920"
              decoding="async"
              fetchpriority="high"
              class="portrait-card__img"
            />
            <span class="portrait-card__rim" aria-hidden="true" />
          </div>
        </figure>

        <HeroFocusConsole />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.portrait-stage {
  position: relative;
  pointer-events: none;

  &.is-penguin-active {
    z-index: 30;
  }

  @media (max-width: 920px) {
    margin-top: 1.5rem;
  }
}

.portrait-card {
  position: relative;
  z-index: 1;
  pointer-events: auto;
  border-radius: $radius-lg;

  // Superfície óptica Liquid Glass (idêntica ao SiteHeader, isolada em plano próprio)
  &__glass {
    position: absolute;
    inset: 0;
    z-index: 0;
    isolation: isolate;
    pointer-events: none;
    border-radius: inherit;
    transform: var(--card-transform, none);
    transform-origin: 50% 50%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;

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

    // Rastro líquido interno em duas velocidades (núcleo warm-white + cauda frost-blue)
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
          160px 140px at var(--pointer-x, 50%) var(--pointer-y, 50%),
          rgba(238, 236, 230, 0.14) 0%,
          transparent 70%
        ),
        radial-gradient(
          280px 240px at var(--glow-x, 50%) var(--glow-y, 50%),
          rgba(168, 196, 227, 0.14) 0%,
          rgba(238, 236, 230, 0.05) 45%,
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
        240px circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
        rgba(238, 236, 230, 0.65) 0%,
        rgba(168, 196, 227, 0.34) 38%,
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
  }

  &.is-tracking &__glass::before,
  &.is-tracking &__glass::after {
    opacity: 1;
  }

  // Conteúdo e tipografia em plano vetorial limpo (sem backdrop-filter nem lock de CSS transition)
  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: $space-3;
    padding: $space-3;
    transform: var(--card-transform, none);
    transform-origin: 50% 50%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    text-rendering: geometricPrecision;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-2;
    padding: 0 $space-1;
    font-size: 0.66rem;
    color: #c8cbd2;
  }

  &__location {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    white-space: nowrap;
  }

  &__pin {
    width: 12px;
    height: 12px;
    color: #ffb060;
    flex-shrink: 0;
  }

  &__figure {
    margin: 0;
  }

  &__frame {
    position: relative;
    overflow: hidden;
    border-radius: $radius-md;
    aspect-ratio: 1 / 0.96;
    background: #1d1e22;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__rim {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    box-shadow:
      inset 0 1px 0 rgba(238, 236, 230, 0.2),
      inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    background: linear-gradient(180deg, transparent 74%, rgba(16, 18, 22, 0.24) 100%);
  }

  @media (prefers-reduced-motion: reduce) {
    &__glass::before,
    &__glass::after {
      transition: none;
    }
  }
}
</style>
