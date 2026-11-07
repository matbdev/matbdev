<script setup lang="ts">
import { ref } from 'vue'
import { Check, Copy, Download, X } from 'lucide-vue-next'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import { useModalDialog } from '@/composables/useModalDialog'
import type { ResumeDocument, ResumeUI } from '@/data/resume/resumeTypes'
import ResumeSheet from './ResumeSheet.vue'

const props = defineProps<{
  open: boolean
  document: ResumeDocument
  ui: ResumeUI
  controlsUi: ResumeUI
  isCopied: boolean
}>()

const emit = defineEmits<{
  close: []
  copy: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)

useModalDialog(
  () => props.open,
  dialogRef,
  closeBtnRef,
  () => emit('close'),
)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="resume-modal-overlay"
        role="presentation"
        @click.self="emit('close')"
        @wheel.self.prevent
        @touchmove.self.prevent
      >
        <div
          ref="dialogRef"
          class="resume-modal"
          role="dialog"
          tabindex="-1"
          aria-modal="true"
          aria-labelledby="resume-modal-title"
          @wheel.stop
        >
          <!-- Header Bar -->
          <div class="resume-modal__header">
            <div class="resume-modal__info">
              <span id="resume-modal-title" class="resume-modal__badge">
                {{ document.discipline === 'data' ? controlsUi.data : controlsUi.software }} ·
                {{ document.locale === 'en' ? 'English' : 'Português' }}
              </span>
            </div>

            <div class="resume-modal__actions">
              <a
                :href="document.staticPdfUrl"
                download
                class="resume-modal__btn resume-modal__btn--primary"
                @pointermove="onSpotMove"
              >
                <Download class="resume-modal__btn-icon" aria-hidden="true" />
                <span class="resume-modal__btn-text">{{ controlsUi.downloadAction }}</span>
              </a>

              <button
                type="button"
                class="resume-modal__btn resume-modal__btn--secondary"
                :class="{ 'is-copied': isCopied }"
                @pointermove="onSpotMove"
                @click="emit('copy')"
              >
                <Check v-if="isCopied" class="resume-modal__btn-icon" aria-hidden="true" />
                <Copy v-else class="resume-modal__btn-icon" aria-hidden="true" />
                <span class="resume-modal__btn-text">
                  {{ isCopied ? controlsUi.copiedSuccess : controlsUi.copyAction }}
                </span>
              </button>

              <button
                ref="closeBtnRef"
                type="button"
                class="resume-modal__close-btn"
                :aria-label="controlsUi.closeModal"
                @pointermove="onSpotMove"
                @click="emit('close')"
              >
                <X class="resume-modal__close-icon" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Modal Scrollable Document Sheet Content -->
          <div class="resume-modal__body">
            <ResumeSheet :document="document" :ui="ui" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.resume-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp($space-3, 3vw, $space-6);
  background-color: rgba(8, 10, 14, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.resume-modal {
  position: relative;
  width: 100%;
  max-width: 980px;
  max-height: calc(100vh - 3rem);
  display: flex;
  flex-direction: column;
  border-radius: $radius-lg;
  background-color: #14171d;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 32px 64px -16px rgba(0, 0, 0, 0.85),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  overflow: hidden;
  overscroll-behavior: contain;

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    padding: $space-3 $space-5;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background-color: #181b22;
  }

  &__info {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__badge {
    padding: 0.25rem 0.65rem;
    border-radius: $radius-pill;
    font-size: 0.72rem;
    font-weight: 600;
    color: #ffe6c2;
    background: rgba(255, 176, 96, 0.14);
    border: 1px solid rgba(255, 176, 96, 0.3);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__btn {
    @include amber-spot(48px, 56px);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.42rem 0.85rem;
    border-radius: $radius-pill;
    font-size: $text-xs;
    font-weight: 600;
    font-family: inherit;
    text-decoration: none;
    cursor: pointer;
    transition:
      color $transition-fast,
      background $transition-fast,
      border-color $transition-fast;

    &--primary {
      color: #111214;
      background: linear-gradient(135deg, #ffc470 0%, #e2d2ba 100%);
      border: 1px solid rgba(255, 220, 160, 0.55);

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        background: linear-gradient(135deg, #ffd08a 0%, #ede0cb 100%);
      }
    }

    &--secondary {
      color: $color-ink;
      background-color: #1e222a;
      border: 1px solid rgba(255, 255, 255, 0.1);

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        background-color: $color-interaction-soft;
        border-color: $color-interaction-border;
      }

      &.is-copied {
        background: rgba(34, 75, 45, 0.85) !important;
        border-color: rgba(72, 187, 120, 0.5) !important;
        color: #86efac !important;
      }
    }
  }

  &__btn-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  &__close-btn {
    @include amber-spot(48px, 56px);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #1e222a;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #c4c8d0;
    cursor: pointer;
    transition:
      color $transition-fast,
      border-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
    }
  }

  &__close-icon {
    position: relative;
    z-index: 1;
    width: 15px;
    height: 15px;
  }

  &__body {
    padding: clamp($space-4, 3vw, $space-6);
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  @media (max-width: 640px) {
    max-height: calc(100vh - 1.5rem);

    &__header {
      padding: $space-3 $space-4;
    }

    &__btn-text {
      display: none;
    }

    &__btn {
      padding: 0.42rem 0.55rem;
    }
  }
}

// Transitions
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 240ms ease;

  .resume-modal {
    transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .resume-modal {
    transform: scale(0.96) translateY(12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .resume-modal-overlay,
  .resume-modal,
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: none;
  }
}
</style>
