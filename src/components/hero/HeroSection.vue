<script setup lang="ts">
import { ref } from 'vue'
import { RotateCcw } from 'lucide-vue-next'
import HeroIdentity from './HeroIdentity.vue'
import HeroPortraitCard from './HeroPortraitCard.vue'
import ToriiSunsetStage from './ToriiSunsetStage.vue'
import { isPt } from '@/state/locale'

const stageRef = ref<InstanceType<typeof ToriiSunsetStage> | null>(null)
const isSunMoved = ref(false)
const hasInteracted = ref(false)

function handleResetSun() {
  stageRef.value?.resetSun()
}
</script>

<template>
  <section id="home" class="hero" aria-labelledby="hero-title">
    <!-- Interactive ASCII / Halftone Squares (100% dot-size) Sea Torii Sunset Stage -->
    <div class="hero__stage-wrap">
      <ToriiSunsetStage
        ref="stageRef"
        @sun-moved="isSunMoved = $event"
        @interacted="hasInteracted = true"
      />
    </div>

    <!-- Optical atmospheric vignette: protects side text/portrait legibility while keeping central Torii & sunset vivid -->
    <div class="hero__atmosphere" aria-hidden="true" />

    <div class="hero__shell">
      <div class="hero__grid">
        <!-- Left Column: Core Identity & Actions -->
        <HeroIdentity />

        <!-- Center Column: Open Interactive Window for Torii Gate, Sun, Gulls & Sea -->
        <div class="hero__center-window" aria-hidden="true" />

        <!-- Right Column: Portrait & Focus Console -->
        <aside class="hero__aside">
          <HeroPortraitCard />
        </aside>
      </div>

      <!-- Bottom Rail: Subtle Interactive Scene Affordance -->
      <div class="hero__foot">
        <div class="hero__scene-hint" :class="{ 'is-active': hasInteracted }">
          <span class="hero__scene-dot" aria-hidden="true" />
          <span class="hero__scene-text">
            {{
              isPt
                ? 'Pôr do sol interativo · arraste o sol, toque o céu ou o mar'
                : 'Interactive sunset · drag the sun, brush the sky or sea'
            }}
          </span>
          <button
            v-if="isSunMoved"
            type="button"
            class="hero__scene-reset hero__interactive"
            @click="handleResetSun"
          >
            <RotateCcw class="hero__reset-icon" aria-hidden="true" />
            <span>{{ isPt ? 'Resetar sol' : 'Reset sun' }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  width: 100%;
  min-height: clamp(760px, 100svh, 980px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  isolation: isolate;
  background-color: #09090d;

  &__stage-wrap {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  // Protects contrast on left & right columns while keeping the central Torii, Sun & Sea vibrant
  &__atmosphere {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background:
      linear-gradient(180deg, rgba(12, 13, 16, 0.42) 0%, transparent 16%),
      radial-gradient(
        52% 74% at 11% 48%,
        rgba(14, 15, 19, 0.8) 0%,
        rgba(14, 15, 19, 0.52) 50%,
        transparent 100%
      ),
      radial-gradient(
        40% 66% at 90% 52%,
        rgba(14, 15, 19, 0.6) 0%,
        rgba(14, 15, 19, 0.26) 55%,
        transparent 100%
      ),
      linear-gradient(180deg, transparent 78%, rgba(17, 18, 20, 0.72) 92%, var(--color-bg) 100%);
  }

  &__shell {
    position: relative;
    z-index: 2;
    pointer-events: none;
    width: 100%;
    max-width: $layout-max;
    min-height: inherit;
    margin: 0 auto;
    padding: 6.75rem $layout-gutter $space-6;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: $space-8;
  }

  &__interactive {
    pointer-events: auto;
  }

  &__grid {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(290px, 1.05fr) minmax(220px, 0.95fr) minmax(270px, 336px);
    align-items: center;
    gap: $space-6;
  }

  &__center-window {
    min-height: 360px;
  }

  &__aside {
    justify-self: end;
    width: 100%;
    max-width: 336px;
  }

  &__foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: $space-4;
    padding-top: $space-2;
    font-size: 0.72rem;
    color: #b8bcc4;
    min-height: 38px;
  }

  &__scene-hint {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: 0.3rem 0.75rem;
    border-radius: $radius-pill;
    background: rgba(17, 19, 24, 0.62);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    color: #c8cbd2;
    min-height: 38px;
  }

  &__scene-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ffb060;
    box-shadow: 0 0 8px rgba(255, 176, 96, 0.75);
    animation: pulse-amber 2.8s ease-in-out infinite;
  }

  &__scene-reset {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    margin-left: $space-1;
    padding: 0.16rem 0.5rem;
    border-radius: $radius-pill;
    font-size: 0.68rem;
    font-weight: 600;
    color: $color-ink;
    background: rgba(255, 196, 112, 0.18);
    border: 1px solid rgba(255, 196, 112, 0.34);
    transition:
      background $transition-fast,
      border-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible {
      background: rgba(255, 196, 112, 0.3);
      border-color: $color-interaction-border;
    }
  }

  &__reset-icon {
    width: 11px;
    height: 11px;
  }
}

@keyframes pulse-amber {
  0%,
  100% {
    opacity: 0.65;
    transform: scale(0.92);
  }
  50% {
    opacity: 1;
    transform: scale(1.12);
  }
}

@media (max-width: 1120px) {
  .hero {
    &__grid {
      grid-template-columns: minmax(260px, 1fr) minmax(120px, 0.55fr) minmax(250px, 308px);
    }
  }
}

@media (max-width: 920px) {
  .hero {
    min-height: auto;

    &__atmosphere {
      background: linear-gradient(
        180deg,
        rgba(12, 13, 17, 0.78) 0%,
        rgba(14, 15, 19, 0.52) 28%,
        rgba(14, 15, 19, 0.14) 46%,
        rgba(14, 15, 19, 0.56) 72%,
        var(--color-bg) 100%
      );
    }

    &__shell {
      padding-top: 5.5rem;
      gap: $space-6;
    }

    &__grid {
      grid-template-columns: 1fr;
      gap: $space-6;
    }

    &__center-window {
      min-height: clamp(160px, 30vw, 220px);
    }

    &__aside {
      justify-self: center;
      max-width: min(100%, 380px);
    }

    &__foot {
      justify-content: center;
    }
  }
}

@media (max-width: 640px) {
  .hero {
    &__shell {
      padding: 4.85rem $layout-gutter $space-5;
      gap: $space-5;
    }

    &__scene-hint {
      flex-wrap: wrap;
      justify-content: center;
      text-align: center;
      padding: 0.42rem 0.75rem;
      border-radius: $radius-md;
      line-height: 1.4;
      max-width: 100%;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__scene-dot {
    animation: none;
  }
}
</style>
