<script setup lang="ts">
import { Check, Copy, Download, Layers, Terminal } from 'lucide-vue-next'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import type { ResumeDiscipline, ResumeLocale, ResumeUI } from '@/data/resume/resumeTypes'

defineProps<{
  discipline: ResumeDiscipline
  locale: ResumeLocale
  ui: ResumeUI
  isCopied: boolean
  staticPdfUrl: string
  note?: string
}>()

const emit = defineEmits<{
  'update:discipline': [value: ResumeDiscipline]
  'update:locale': [value: ResumeLocale]
  copy: []
}>()
</script>

<template>
  <div class="resume-controls">
    <div class="resume-controls__card">
      <div class="resume-controls__selectors">
        <!-- Discipline Switcher -->
        <fieldset class="resume-controls__group">
          <legend class="resume-controls__legend">{{ ui.discipline }}</legend>
          <div class="resume-controls__segmented" role="radiogroup" :aria-label="ui.discipline">
            <button
              type="button"
              role="radio"
              class="resume-controls__option"
              :class="{ 'resume-controls__option--active': discipline === 'data' }"
              :aria-checked="discipline === 'data'"
              @pointermove="onSpotMove"
              @click="emit('update:discipline', 'data')"
            >
              <Layers class="resume-controls__icon" aria-hidden="true" />
              <span class="resume-controls__label-wrap">
                <span class="resume-controls__label">{{ ui.data }}</span>
                <span class="resume-controls__sub">{{ ui.dataSubtitle }}</span>
              </span>
            </button>

            <button
              type="button"
              role="radio"
              class="resume-controls__option"
              :class="{ 'resume-controls__option--active': discipline === 'software' }"
              :aria-checked="discipline === 'software'"
              @pointermove="onSpotMove"
              @click="emit('update:discipline', 'software')"
            >
              <Terminal class="resume-controls__icon" aria-hidden="true" />
              <span class="resume-controls__label-wrap">
                <span class="resume-controls__label">{{ ui.software }}</span>
                <span class="resume-controls__sub">{{ ui.softwareSubtitle }}</span>
              </span>
            </button>
          </div>
        </fieldset>

        <!-- Language Switcher -->
        <fieldset class="resume-controls__group">
          <legend class="resume-controls__legend">{{ ui.language }}</legend>
          <div
            class="resume-controls__segmented resume-controls__segmented--lang"
            role="radiogroup"
            :aria-label="ui.language"
          >
            <button
              type="button"
              role="radio"
              class="resume-controls__option resume-controls__option--lang"
              :class="{ 'resume-controls__option--active': locale === 'en' }"
              :aria-checked="locale === 'en'"
              @pointermove="onSpotMove"
              @click="emit('update:locale', 'en')"
            >
              <span class="resume-controls__label" lang="en">English</span>
            </button>

            <button
              type="button"
              role="radio"
              class="resume-controls__option resume-controls__option--lang"
              :class="{ 'resume-controls__option--active': locale === 'pt-BR' }"
              :aria-checked="locale === 'pt-BR'"
              @pointermove="onSpotMove"
              @click="emit('update:locale', 'pt-BR')"
            >
              <span class="resume-controls__label" lang="pt-BR">Português</span>
            </button>
          </div>
        </fieldset>
      </div>

      <!-- Actions Bar -->
      <div class="resume-controls__actions">
        <!-- Primary Action: Direct PDF Download -->
        <a :href="staticPdfUrl" download class="resume-controls__btn resume-controls__btn--primary">
          <Download class="resume-controls__action-icon" aria-hidden="true" />
          <span>{{ ui.downloadAction }}</span>
        </a>

        <!-- Secondary Action: Copy as Markdown -->
        <button
          type="button"
          class="resume-controls__btn resume-controls__btn--secondary"
          :class="{ 'resume-controls__btn--copied': isCopied }"
          :aria-live="isCopied ? 'polite' : 'off'"
          @pointermove="onSpotMove"
          @click="emit('copy')"
        >
          <Check v-if="isCopied" class="resume-controls__action-icon" aria-hidden="true" />
          <Copy v-else class="resume-controls__action-icon" aria-hidden="true" />
          <span>{{ isCopied ? ui.copiedSuccess : ui.copyAction }}</span>
        </button>
      </div>

      <!-- Explanatory Note -->
      <p v-if="note" class="resume-controls__note">
        {{ note }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.resume-controls {
  width: 100%;

  &__card {
    display: flex;
    flex-direction: column;
    gap: $space-6;
    padding: clamp(1.5rem, 3vw, 2rem);
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
    border-radius: $radius-lg;
    box-shadow:
      0 22px 48px -12px rgba(0, 0, 0, 0.75),
      0 4px 14px -2px rgba(0, 0, 0, 0.45),
      inset 0 1px 0 0 rgba(238, 236, 230, 0.2),
      inset 0 -1px 0 0 rgba(168, 196, 227, 0.08);
  }

  &__selectors {
    display: flex;
    flex-direction: column;
    gap: $space-5;
  }

  &__group {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__legend {
    font-size: $text-xs;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: $color-muted;
    padding: 0;
  }

  &__segmented {
    display: flex;
    flex-direction: column;
    padding: 4px;
    border-radius: $radius-md;
    background: rgba(14, 16, 20, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.07);
    gap: 4px;

    &--lang {
      flex-direction: row;
    }
  }

  &__option {
    @include amber-spot(70px, 80px);
    display: flex;
    align-items: center;
    gap: $space-3;
    padding: 0.65rem 0.95rem;
    border-radius: $radius-sm;
    border: 1px solid transparent;
    background: transparent;
    color: $color-muted;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
    transition:
      color $transition-fast,
      background $transition-fast,
      border-color $transition-fast,
      box-shadow $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;

      .resume-controls__icon {
        color: $color-interaction;
      }

      .resume-controls__label {
        color: $color-interaction;
      }
    }

    &:focus-visible {
      outline: 2px solid $color-focus;
      outline-offset: 1px;
    }

    &--active {
      color: $color-ink;
      background: rgba(34, 44, 55, 0.85);
      border-color: rgba(255, 176, 96, 0.45);
      box-shadow:
        0 4px 14px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 220, 160, 0.2);

      .resume-controls__icon {
        color: #ffb060;
      }
    }

    &--lang {
      @include amber-spot(56px, 64px);
      flex: 1;
      justify-content: center;
      padding: 0.55rem 0.8rem;

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        .resume-controls__label {
          color: $color-interaction;
        }
      }
    }
  }

  &__icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: $color-muted;
    transition: color $transition-fast;
  }

  &__label-wrap {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__label {
    font-size: $text-xs;
    font-weight: 600;
    line-height: 1.25;
  }

  &__sub {
    font-size: 0.7rem;
    color: $color-muted;
    line-height: 1.2;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    padding-top: $space-2;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $space-2;
    padding: 0.75rem 1.25rem;
    border-radius: $radius-pill;
    font-family: inherit;
    font-size: $text-xs;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition:
      transform $transition-fast,
      border-color $transition-fast,
      background $transition-fast,
      color $transition-fast,
      box-shadow $transition-fast;

    &:focus-visible {
      outline: 2px solid $color-focus;
      outline-offset: 2px;
    }

    &--primary {
      color: #111214;
      background: linear-gradient(135deg, #ffc470 0%, #e2d2ba 100%);
      border: 1px solid rgba(255, 220, 160, 0.55);
      box-shadow: 0 8px 20px -6px rgba(255, 176, 96, 0.35);

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 12px 26px -6px rgba(255, 176, 96, 0.55);
        background: linear-gradient(135deg, #ffd08a 0%, #ede0cb 100%);
      }
    }

    &--secondary {
      @include amber-spot(56px, 64px);
      color: $color-ink;
      background: rgba(28, 31, 38, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        background-color: $color-interaction-soft;
        border-color: $color-interaction-border;
        transform: translateY(-1px);

        .resume-controls__action-icon {
          color: $color-interaction;
        }
      }
    }

    &--copied {
      background: rgba(34, 75, 45, 0.85) !important;
      border-color: rgba(72, 187, 120, 0.5) !important;
      color: #86efac !important;
    }
  }

  &__action-icon {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }

  &__note {
    font-size: 0.75rem;
    line-height: 1.5;
    color: $color-muted;
    margin: 0;
    opacity: 0.8;
  }
}
</style>
