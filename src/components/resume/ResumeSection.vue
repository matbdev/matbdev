<script setup lang="ts">
import { computed, ref } from 'vue'
import { Award, Briefcase, Eye, GraduationCap } from 'lucide-vue-next'
import sectionsData from '@/data/sections.json'
import { currentLocale } from '@/state/locale'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import { useCardTiltAndGlass } from '@/composables/useCardTiltAndGlass'
import { useResumeState } from '@/data/resume/useResumeState'
import ResumeBlackHoleBackdrop from './ResumeBlackHoleBackdrop.vue'
import ResumeControls from './ResumeControls.vue'
import ResumeModalDialog from './ResumeModalDialog.vue'

const { selectedDiscipline, selectedLocale, document, controlsUi, docUi, isCopied, copyMarkdown } =
  useResumeState()

const isModalOpen = ref(false)
const snapshotCardRef = ref<HTMLElement | null>(null)
const { isTracking, onCardPointerMove, onCardPointerLeave } = useCardTiltAndGlass(snapshotCardRef)

// Extract key technical skills for the active discipline (up to 6 items)
const previewSkills = computed(() => {
  const allSkills = document.value.skills.flatMap((group) => group.items)
  return allSkills.slice(0, 6)
})

const sectionCopy = computed(() => {
  const content = sectionsData.sections.resumes.content
  return currentLocale.value === 'pt-BR' ? content['pt-BR'] : content.en
})

// Ensures there is no trailing period in the title string before the orange dot
const cleanTitle = computed(() => sectionCopy.value.title.replace(/\.+$/, ''))
</script>

<template>
  <section id="resume" class="resume-section" aria-labelledby="resume-title">
    <!-- Cosmic ASCII Black Hole Atmospheric Backdrop -->
    <ResumeBlackHoleBackdrop />

    <div class="resume-section__shell">
      <header class="resume-section__heading">
        <h2 id="resume-title" class="resume-section__title">
          {{ cleanTitle }}<span class="resume-section__period">.</span>
        </h2>

        <p class="resume-section__intro">
          {{ sectionCopy.introduction }}
        </p>
      </header>

      <div class="resume-section__grid">
        <!-- Controls Column -->
        <div class="resume-section__controls-col">
          <ResumeControls
            v-model:discipline="selectedDiscipline"
            v-model:locale="selectedLocale"
            :ui="controlsUi"
            :is-copied="isCopied"
            :static-pdf-url="document.staticPdfUrl"
            :note="sectionCopy.note"
            @preview="isModalOpen = true"
            @copy="copyMarkdown"
          />
        </div>

        <!-- Snapshot Teaser Card (Clickable to open full resume modal with 3D Liquid Glass) -->
        <div class="resume-section__snapshot-col">
          <div
            ref="snapshotCardRef"
            class="resume-snapshot"
            :class="{ 'is-tracking': isTracking }"
            role="button"
            tabindex="0"
            :aria-label="controlsUi.previewAction"
            @pointermove="onCardPointerMove"
            @pointerleave="onCardPointerLeave"
            @click="isModalOpen = true"
            @keydown.enter.prevent="isModalOpen = true"
            @keydown.space.prevent="isModalOpen = true"
          >
            <!-- Optical Liquid Glass Layer decoupled from text -->
            <div class="resume-snapshot__glass" aria-hidden="true" />

            <div class="resume-snapshot__content">
              <div class="resume-snapshot__header">
                <span class="resume-snapshot__badge" @pointermove.stop="onSpotMove">
                  {{ document.discipline === 'data' ? controlsUi.data : controlsUi.software }} ·
                  {{ document.locale === 'en' ? 'English' : 'Português' }}
                </span>
                <span class="resume-snapshot__view-hint">
                  <Eye class="resume-snapshot__hint-icon" aria-hidden="true" />
                  <span>{{ controlsUi.previewAction }}</span>
                </span>
              </div>

              <div class="resume-snapshot__body">
                <h3 class="resume-snapshot__name">{{ document.header.name }}</h3>
                <p class="resume-snapshot__tagline">{{ document.header.tagline }}</p>

                <p v-if="document.summary" class="resume-snapshot__summary">
                  {{ document.summary }}
                </p>

                <!-- Highlights list with warm amber hover spotlight -->
                <div class="resume-snapshot__pills">
                  <div class="resume-snapshot__pill" @pointermove.stop="onSpotMove">
                    <Briefcase class="resume-snapshot__pill-icon" aria-hidden="true" />
                    <span>Tramontina Multi S.A.</span>
                  </div>
                  <div class="resume-snapshot__pill" @pointermove.stop="onSpotMove">
                    <GraduationCap class="resume-snapshot__pill-icon" aria-hidden="true" />
                    <span>Univates · Engenharia de Software</span>
                  </div>
                  <div class="resume-snapshot__pill" @pointermove.stop="onSpotMove">
                    <Award class="resume-snapshot__pill-icon" aria-hidden="true" />
                    <span>Google Cloud (ACE) & Astronomer Airflow 3</span>
                  </div>
                </div>

                <!-- Technical Skills preview tags with warm amber hover spotlight -->
                <div
                  v-if="previewSkills.length > 0"
                  class="resume-snapshot__skills"
                  aria-label="Technical skills preview"
                >
                  <span
                    v-for="skill in previewSkills"
                    :key="skill"
                    class="resume-snapshot__skill-tag"
                    @pointermove.stop="onSpotMove"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Full Résumé Modal Dialog -->
    <ResumeModalDialog
      :open="isModalOpen"
      :document="document"
      :ui="docUi"
      :controls-ui="controlsUi"
      :is-copied="isCopied"
      @close="isModalOpen = false"
      @copy="copyMarkdown"
    />
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.resume-section {
  position: relative;
  background-color: #0f1115;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  isolation: isolate;

  &__shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: $layout-max;
    margin: 0 auto;
    padding: $space-section $layout-gutter;
    display: flex;
    flex-direction: column;
    gap: $space-section-gap;
  }

  &__heading {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    max-width: 44rem;
  }

  &__title {
    font-size: clamp(2.2rem, 4.2vw, 3.4rem);
    font-weight: 500;
    line-height: 1.05;
    letter-spacing: -0.035em;
    color: $color-ink;
    margin: 0;
  }

  &__period {
    color: #ffb060;
  }

  &__intro {
    font-size: clamp(0.92rem, 1.4vw, 1.02rem);
    line-height: 1.6;
    color: $color-muted;
    max-width: 38rem;
    margin: 0;
  }

  &__grid {
    display: grid;
    grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
    align-items: stretch;
    gap: clamp(2rem, 4vw, 3rem);
  }

  &__controls-col {
    width: 100%;
  }

  &__snapshot-col {
    width: 100%;
    display: flex;
  }

  @media (max-width: 960px) {
    &__grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    &__shell {
      gap: $space-4;
    }
  }
}

.resume-snapshot {
  position: relative;
  z-index: 1;
  width: 100%;
  pointer-events: auto;
  border-radius: $radius-lg;
  cursor: pointer;

  // Optical Liquid Glass surface (identical to HeroPortraitCard and SiteHeader)
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

    // Darkroom optical body: graphite + frost-blue dispersion
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

    // Dual-speed internal liquid glow (warm-white core + frost-blue tail)
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

    // Specular 1px edge chamfer following cursor
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

  // Crisp content layer with 3D perspective tilt
  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    padding: clamp(1.75rem, 3.5vw, 2.5rem);
    transform: var(--card-transform, none);
    transform-origin: 50% 50%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    text-rendering: geometricPrecision;
  }

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    .resume-snapshot__view-hint {
      color: $color-interaction;
    }
  }

  &:focus-visible {
    outline: 2px solid $color-focus;
    outline-offset: 2px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    margin-bottom: $space-4;
  }

  &__badge {
    @include amber-spot(56px, 64px);
    padding: 0.25rem 0.65rem;
    border-radius: $radius-pill;
    font-size: 0.72rem;
    font-weight: 600;
    color: #ffe6c2;
    background: rgba(255, 176, 96, 0.14);
    border: 1px solid rgba(255, 176, 96, 0.3);
    transition:
      border-color $transition-fast,
      color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      border-color: $color-interaction-border;
      color: $color-interaction;
    }
  }

  &__view-hint {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: $text-xs;
    font-weight: 500;
    color: $color-muted;
    transition: color $transition-fast;
  }

  &__hint-icon {
    width: 14px;
    height: 14px;
  }

  &__name {
    font-size: clamp(1.4rem, 2.4vw, 1.85rem);
    font-weight: 700;
    color: $color-ink;
    margin: 0 0 $space-2;
    letter-spacing: -0.03em;
  }

  &__tagline {
    font-size: clamp(0.88rem, 1.2vw, 1rem);
    font-weight: 500;
    color: #ffc470;
    margin: 0 0 $space-4;
  }

  &__summary {
    font-size: $text-sm;
    line-height: 1.65;
    color: #d1d3d8;
    margin: 0 0 $space-5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__pills {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    margin-bottom: 0;
  }

  &__pill {
    @include amber-spot(64px, 72px);
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: 0.45rem 0.8rem;
    border-radius: $radius-sm;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: $text-xs;
    color: #c4c8d0;
    cursor: default;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast,
      transform $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
      background: rgba(255, 176, 96, 0.08);
      transform: translateX(2px);

      .resume-snapshot__pill-icon {
        color: $color-interaction;
      }
    }
  }

  &__pill-icon {
    width: 14px;
    height: 14px;
    color: #a8c4e3;
    flex-shrink: 0;
    transition: color $transition-fast;
  }

  &__skills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: $space-4;
  }

  &__skill-tag {
    @include amber-spot(46px, 52px);
    display: inline-flex;
    align-items: center;
    padding: 0.22rem 0.58rem;
    border-radius: $radius-pill;
    font-size: 0.68rem;
    font-weight: 550;
    color: #c4c8d0;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: default;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast,
      transform $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
      background: rgba(255, 176, 96, 0.1);
      transform: translateY(-1px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__glass::before,
    &__glass::after {
      transition: none;
    }
  }
}
</style>
