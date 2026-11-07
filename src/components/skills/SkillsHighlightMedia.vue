<script setup lang="ts">
import { Workflow } from 'lucide-vue-next'
import type { HighlightMedia } from '@/data/skills/types'

defineProps<{
  media: HighlightMedia
  variant: 'card' | 'dialog'
}>()
</script>

<template>
  <div
    v-if="variant === 'card'"
    class="skills-card__media-frame"
    :class="{ 'skills-card__media-frame--concept': media.type === 'concept' }"
  >
    <img
      v-if="media.type === 'image'"
      :src="media.src"
      :alt="media.alt"
      :class="['skills-card__image', `skills-card__image--${media.fit}`]"
      loading="lazy"
    />

    <!-- Conceptual Architecture / Workflow Visualizer -->
    <div v-else-if="media.type === 'concept'" class="skills-card__concept">
      <div class="skills-card__concept-header">
        <Workflow class="skills-card__concept-icon" aria-hidden="true" />
        <span class="skills-card__concept-label">{{ media.label }}</span>
      </div>

      <div v-if="media.steps.length > 0" class="skills-card__concept-flow">
        <template v-for="(step, idx) in media.steps" :key="step">
          <div
            class="skills-card__concept-step"
            :class="{ 'is-active': media.activeStep === step }"
          >
            <span class="skills-card__step-num">0{{ idx + 1 }}</span>
            <span class="skills-card__step-text">{{ step }}</span>
          </div>
          <div
            v-if="idx < media.steps.length - 1"
            class="skills-card__concept-arrow"
            aria-hidden="true"
          >
            →
          </div>
        </template>
      </div>
    </div>
  </div>

  <div v-else class="skills-dialog__media">
    <img
      v-if="media.type === 'image'"
      :src="media.src"
      :alt="media.alt"
      :class="['skills-dialog__image', `skills-dialog__image--${media.fit}`]"
    />

    <div v-else-if="media.type === 'concept'" class="skills-dialog__concept">
      <div class="skills-dialog__concept-header">
        <Workflow class="skills-dialog__concept-icon" aria-hidden="true" />
        <span>{{ media.label }}</span>
      </div>
      <div class="skills-dialog__concept-steps">
        <span
          v-for="(step, idx) in media.steps"
          :key="step"
          class="skills-dialog__concept-step"
          :class="{ 'is-active': media.activeStep === step }"
        >
          <strong>0{{ idx + 1 }}.</strong> {{ step }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.skills-card {
  &__media-frame {
    position: relative;
    width: 100%;
    min-height: 180px;
    max-height: 220px;
    border-radius: $radius-md;
    overflow: hidden;
    background-color: #0d0f13;
    border: 1px solid rgba(255, 255, 255, 0.07);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $space-4;

    &--concept {
      min-height: auto;
      max-height: none;
      background: transparent;
      border: none;
      margin-bottom: $space-3;
      padding: 0;
    }
  }

  &__image {
    width: 100%;
    height: 100%;

    &--cover {
      object-fit: cover;
    }

    &--contain {
      object-fit: contain;
      padding: $space-4;
      max-height: 160px;
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.6));
    }
  }

  &__concept {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: $space-2;
    width: 100%;
    height: auto;
    padding: 0.65rem 0.85rem;
    border-radius: $radius-md;
    background: #0e1116;
    border: 1px solid rgba(255, 255, 255, 0.07);
  }

  &__concept-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: #ffb060;
  }

  &__concept-icon {
    width: 14px;
    height: 14px;
  }

  &__concept-flow {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
  }

  &__concept-step {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.6rem;
    border-radius: $radius-sm;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.68rem;
    color: #c4c8d0;

    &.is-active {
      color: #fff4e2;
      border-color: rgba(255, 176, 96, 0.4);
      background: rgba(255, 176, 96, 0.12);

      .skills-card__step-num {
        color: #ffb060;
      }
    }
  }

  &__step-num {
    font-size: 0.6rem;
    font-family: monospace;
    color: $color-muted;
  }

  &__concept-arrow {
    color: rgba(255, 255, 255, 0.25);
    font-size: 0.75rem;
  }
}
.skills-dialog {
  &__media {
    width: 100%;
    border-radius: $radius-md;
    background-color: #0d0f13;
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__image {
    width: 100%;
    max-height: 280px;

    &--cover {
      object-fit: cover;
    }

    &--contain {
      object-fit: contain;
      padding: $space-4;
      max-height: 180px;
    }
  }

  &__concept {
    width: 100%;
    padding: clamp($space-3, 3vw, $space-4);
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__concept-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.76rem;
    font-weight: 600;
    color: #ffb060;
  }

  &__concept-icon {
    width: 15px;
    height: 15px;
  }

  &__concept-steps {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
  }

  &__concept-step {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 0.8rem;
    border-radius: $radius-pill;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.74rem;
    line-height: 1.35;
    color: #c4c8d0;
    white-space: normal;
    word-break: break-word;

    strong {
      color: $color-muted;
      font-family: monospace;
      font-size: 0.7rem;
    }

    &.is-active {
      color: #fff4e2;
      background: rgba(255, 176, 96, 0.14);
      border-color: rgba(255, 176, 96, 0.4);
      box-shadow: 0 2px 10px rgba(255, 176, 96, 0.15);

      strong {
        color: #ffb060;
      }
    }
  }
}
@media (max-width: 640px) {
  .skills-card {
    &__media-frame {
      min-height: 150px;

      &--concept {
        min-height: auto;
      }
    }
  }
}
</style>
