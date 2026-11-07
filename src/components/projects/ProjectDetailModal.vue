<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  Target,
  Workflow,
  X,
} from 'lucide-vue-next'
import { useModalDialog } from '@/composables/useModalDialog'
import { resolveImageAsset } from '@/data/imageAssets'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import { isPt } from '@/state/locale'
import type { ProjectViewModel } from './types'

const props = defineProps<{
  open: boolean
  project: ProjectViewModel | null
}>()

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)

useModalDialog(
  () => props.open,
  dialogRef,
  closeBtnRef,
  () => emit('close'),
)

const resolvedImage = computed(() => {
  if (props.project?.media?.type === 'image') {
    return resolveImageAsset(props.project.media.src)
  }
  return undefined
})

const conceptLabel = computed(() => {
  if (props.project?.media?.type === 'concept') {
    return props.project.media.label
  }
  return ''
})

const repoLabel = computed(() => (isPt.value ? 'Ver no GitHub' : 'View on GitHub'))
const websiteLabel = computed(() => (isPt.value ? 'Acessar aplicação' : 'Open live site'))
const closeLabel = computed(() => (isPt.value ? 'Fechar' : 'Close'))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open && project"
        class="project-modal-overlay"
        role="presentation"
        @click.self="emit('close')"
        @wheel.self.prevent
        @touchmove.self.prevent
      >
        <div
          ref="dialogRef"
          class="project-modal"
          role="dialog"
          tabindex="-1"
          aria-modal="true"
          :aria-labelledby="`project-modal-${project.id}-title`"
          @wheel.stop
        >
          <!-- Header Bar with Meta & Close Button -->
          <div class="project-modal__header">
            <div class="project-modal__meta-row">
              <span class="project-modal__context-pill" @pointermove.stop="onSpotMove">
                {{ project.context }}
              </span>

              <span class="project-modal__badge-pill" @pointermove.stop="onSpotMove">
                <Sparkles class="project-modal__badge-icon" aria-hidden="true" />
                <span>{{ project.badge }}</span>
              </span>
            </div>

            <button
              ref="closeBtnRef"
              type="button"
              class="project-modal__close-btn"
              :aria-label="closeLabel"
              @click="emit('close')"
            >
              <X class="project-modal__close-icon" aria-hidden="true" />
            </button>
          </div>

          <!-- Body Content -->
          <div class="project-modal__body">
            <!-- Hero Title & Subtitle -->
            <div class="project-modal__hero">
              <h3 :id="`project-modal-${project.id}-title`" class="project-modal__title">
                {{ project.title }}
              </h3>
              <p class="project-modal__subtitle">
                {{ project.subtitle }}
              </p>
            </div>

            <!-- Media Preview: Image or Concept Flow -->
            <div class="project-modal__media-frame" aria-hidden="true">
              <img
                v-if="project.media.type === 'image' && resolvedImage"
                :src="resolvedImage"
                :alt="project.media.alt"
                class="project-modal__image"
                loading="lazy"
              />

              <div v-else class="project-modal__concept">
                <div class="project-modal__concept-header">
                  <Workflow class="project-modal__concept-icon" aria-hidden="true" />
                  <span class="project-modal__concept-label">{{ conceptLabel }}</span>
                </div>

                <div
                  v-if="project.diagram && project.diagram.length > 0"
                  class="project-modal__concept-flow"
                >
                  <template v-for="(node, idx) in project.diagram" :key="node">
                    <span class="project-modal__concept-node">
                      <strong class="project-modal__node-num">0{{ idx + 1 }}.</strong>
                      <span>{{ node }}</span>
                    </span>
                    <span
                      v-if="idx < (project.diagram?.length ?? 0) - 1"
                      class="project-modal__concept-sep"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </template>
                </div>
              </div>
            </div>

            <!-- Overview Description -->
            <p class="project-modal__overview">
              {{ project.description }}
            </p>

            <!-- Dual Problem & Solution Cards -->
            <div class="project-modal__cards-grid">
              <div class="project-modal__card" @pointermove="onSpotMove">
                <div class="project-modal__card-header">
                  <div class="project-modal__card-icon-wrap project-modal__card-icon-wrap--problem">
                    <Target class="project-modal__card-icon" aria-hidden="true" />
                  </div>
                  <h4 class="project-modal__card-title">
                    {{ isPt ? 'Desafio & Problema' : 'Challenge & Problem' }}
                  </h4>
                </div>
                <p class="project-modal__card-text">
                  {{ project.problem }}
                </p>
              </div>

              <div class="project-modal__card" @pointermove="onSpotMove">
                <div class="project-modal__card-header">
                  <div
                    class="project-modal__card-icon-wrap project-modal__card-icon-wrap--solution"
                  >
                    <CheckCircle2 class="project-modal__card-icon" aria-hidden="true" />
                  </div>
                  <h4 class="project-modal__card-title">
                    {{ isPt ? 'Solução & Contribuição' : 'Solution & Contribution' }}
                  </h4>
                </div>
                <p class="project-modal__card-text">
                  {{ project.contribution }}
                </p>
              </div>
            </div>

            <!-- Architecture Flow Section if diagram available -->
            <div
              v-if="project.diagram && project.diagram.length > 0"
              class="project-modal__section"
            >
              <h4 class="project-modal__section-title">
                {{ isPt ? 'Fluxo de Arquitetura & Dados' : 'Architecture & Data Flow' }}
              </h4>

              <div class="project-modal__diagram-row">
                <template v-for="(step, sIdx) in project.diagram" :key="step">
                  <div class="project-modal__diagram-step" @pointermove="onSpotMove">
                    <span class="project-modal__step-badge">Etapa 0{{ sIdx + 1 }}</span>
                    <span class="project-modal__step-name">{{ step }}</span>
                  </div>

                  <span
                    v-if="sIdx < (project.diagram?.length ?? 0) - 1"
                    class="project-modal__diagram-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </template>
              </div>
            </div>

            <!-- Detail Context Note if present -->
            <div v-if="project.detailContext" class="project-modal__context-note">
              <Layers class="project-modal__note-icon" aria-hidden="true" />
              <span>{{ project.detailContext }}</span>
            </div>

            <!-- Tech Stack Section -->
            <div class="project-modal__section">
              <h4 class="project-modal__section-title">
                {{ isPt ? 'Tecnologias & Ferramentas' : 'Technologies & Tools' }}
              </h4>

              <ul class="project-modal__tech-list" role="list">
                <li
                  v-for="tech in project.technologies"
                  :key="tech"
                  class="project-modal__tech-tag"
                  @pointermove.stop="onSpotMove"
                >
                  {{ tech }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Footer Actions Bar -->
          <footer class="project-modal__footer">
            <div class="project-modal__links">
              <a
                v-if="project.links.repository"
                :href="project.links.repository"
                target="_blank"
                rel="noopener noreferrer"
                class="project-modal__btn project-modal__btn--primary"
                @pointermove="onSpotMove"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="project-modal__btn-icon"
                  aria-hidden="true"
                >
                  <path
                    d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.02 11.02 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.42.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
                  />
                </svg>
                <span>{{ repoLabel }}</span>
                <ArrowUpRight class="project-modal__btn-arrow" aria-hidden="true" />
              </a>

              <a
                v-if="project.links.website"
                :href="project.links.website"
                target="_blank"
                rel="noopener noreferrer"
                class="project-modal__btn project-modal__btn--secondary"
                @pointermove="onSpotMove"
              >
                <ExternalLink class="project-modal__btn-icon" aria-hidden="true" />
                <span>{{ websiteLabel }}</span>
                <ArrowUpRight class="project-modal__btn-arrow" aria-hidden="true" />
              </a>
            </div>

            <button
              type="button"
              class="project-modal__btn project-modal__btn--ghost"
              @click="emit('close')"
            >
              {{ closeLabel }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.project-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 3vw, 2.5rem);
  background: rgba(8, 9, 12, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  overflow-y: auto;
}

.project-modal {
  position: relative;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: $radius-lg;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 176, 96, 0.05) 0%, transparent 70%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0.008) 100%), #13161d;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.75),
    0 0 40px rgba(255, 176, 96, 0.06);
  padding: clamp(1.5rem, 3.5vw, 2.25rem);
  display: flex;
  flex-direction: column;
  gap: $space-5;
  color: $color-ink;

  &:focus {
    outline: none;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: $space-3;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__meta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  &__context-pill {
    @include amber-spot(46px, 52px);
    display: inline-flex;
    align-items: center;
    padding: 0.22rem 0.65rem;
    border-radius: $radius-pill;
    font-size: 0.74rem;
    font-weight: 600;
    color: #cbd5e1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__badge-pill {
    @include amber-spot(46px, 52px);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.22rem 0.65rem;
    border-radius: $radius-pill;
    font-size: 0.74rem;
    font-weight: 600;
    color: #ffb060;
    background: rgba(255, 176, 96, 0.1);
    border: 1px solid rgba(255, 176, 96, 0.28);
  }

  &__badge-icon {
    width: 12px;
    height: 12px;
  }

  &__close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #c4c8d2;
    cursor: pointer;
    transition:
      color $transition-fast,
      background-color $transition-fast,
      border-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      background-color: $color-interaction-soft;
      border-color: $color-interaction-border;
    }

    &:focus-visible {
      outline: 2px solid $color-focus;
      outline-offset: 2px;
    }
  }

  &__close-icon {
    width: 16px;
    height: 16px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__hero {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__title {
    font-size: clamp(1.4rem, 2.5vw, 1.85rem);
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.025em;
    margin: 0;
  }

  &__subtitle {
    font-size: clamp(0.95rem, 1.4vw, 1.05rem);
    color: #a8c4e3;
    line-height: 1.5;
    margin: 0;
  }

  &__media-frame {
    position: relative;
    width: 100%;
    border-radius: $radius-md;
    overflow: hidden;
    background: rgba(10, 12, 16, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__image {
    display: block;
    width: 100%;
    max-height: 320px;
    object-fit: cover;
    object-position: top;
  }

  &__concept {
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: radial-gradient(circle at 50% 50%, rgba(255, 176, 96, 0.05) 0%, transparent 80%);
  }

  &__concept-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__concept-icon {
    width: 15px;
    height: 15px;
    color: #ffb060;
  }

  &__concept-label {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #cbd5e1;
  }

  &__concept-flow {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  &__concept-node {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    border-radius: $radius-md;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.09);
    font-size: 0.8rem;
    color: #f1f5f9;
  }

  &__node-num {
    color: #ffb060;
    font-weight: 700;
  }

  &__concept-sep {
    color: rgba(255, 255, 255, 0.3);
    font-weight: 600;
  }

  &__overview {
    font-size: clamp(0.92rem, 1.4vw, 1rem);
    line-height: 1.7;
    color: #d1d5db;
    margin: 0;
  }

  // Cards grid: Problem & Solution
  &__cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 0.85rem;
  }

  &__card {
    @include amber-spot(200px, 220px);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 1.15rem;
    border-radius: $radius-md;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.07);
    transition: border-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      border-color: $color-interaction-border;
    }
  }

  &__card-header {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }

  &__card-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;

    &--problem {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
    }

    &--solution {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #4ade80;
    }
  }

  &__card-icon {
    width: 15px;
    height: 15px;
  }

  &__card-title {
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #cbd5e1;
    margin: 0;
  }

  &__card-text {
    font-size: 0.85rem;
    line-height: 1.6;
    color: #94a3b8;
    margin: 0;
  }

  // Section details
  &__section {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    padding-top: $space-3;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__section-title {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #94a3b8;
    margin: 0;
  }

  &__diagram-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.65rem;
  }

  &__diagram-step {
    @include amber-spot(140px, 150px);
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.6rem 0.9rem;
    border-radius: $radius-sm;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__step-badge {
    font-size: 0.65rem;
    font-weight: 700;
    color: #ffb060;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__step-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #f1f5f9;
  }

  &__diagram-arrow {
    color: rgba(255, 255, 255, 0.25);
    font-size: 1.1rem;
    font-weight: 600;
  }

  &__context-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.65rem 0.9rem;
    border-radius: $radius-sm;
    background: rgba(168, 196, 227, 0.05);
    border: 1px solid rgba(168, 196, 227, 0.15);
    font-size: 0.8rem;
    color: #a8c4e3;
  }

  &__note-icon {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }

  &__tech-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__tech-tag {
    @include amber-spot(46px, 52px);
    display: inline-flex;
    align-items: center;
    padding: 0.24rem 0.65rem;
    border-radius: $radius-pill;
    font-size: 0.74rem;
    font-weight: 550;
    color: #c4c8d2;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  // Footer Actions
  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: $space-4;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.55rem 1.05rem;
    border-radius: $radius-pill;
    font-size: 0.82rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition:
      color $transition-fast,
      background-color $transition-fast,
      border-color $transition-fast,
      transform $transition-fast;

    &:focus-visible {
      outline: 2px solid $color-focus;
      outline-offset: 2px;
    }

    &--primary {
      @include amber-spot(120px, 140px);
      color: #0d0f13;
      background: #ffb060;
      border: 1px solid #ffb060;

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        background: #ffbe7a;
        transform: translateY(-1px);
      }
    }

    &--secondary {
      @include amber-spot(120px, 140px);
      color: #f1f5f9;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        background-color: $color-interaction-soft;
        border-color: $color-interaction-border;
        color: $color-interaction;
        transform: translateY(-1px);
      }
    }

    &--ghost {
      color: #94a3b8;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.08);

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        color: $color-interaction;
        background-color: $color-interaction-soft;
        border-color: $color-interaction-border;
      }
    }
  }

  &__btn-icon {
    width: 15px;
    height: 15px;
  }

  &__btn-arrow {
    width: 14px;
    height: 14px;
  }
}

// Fade transitions
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity $transition-fast;

  .project-modal {
    transition:
      transform $transition-fast,
      opacity $transition-fast;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .project-modal {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }
}
</style>
