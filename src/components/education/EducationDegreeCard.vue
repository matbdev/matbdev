<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, Calendar, GraduationCap } from 'lucide-vue-next'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import { isPt } from '@/state/locale'
import type { EducationDegreeViewModel } from './types'

defineProps<{
  degree: EducationDegreeViewModel
}>()

defineEmits<{
  select: [degree: EducationDegreeViewModel]
}>()

const statusLabel = computed(() => (isPt.value ? 'Em andamento' : 'In progress'))
const detailsLabel = computed(() =>
  isPt.value ? 'Ver detalhes da formação' : 'View degree details',
)

const focusPillars = computed(() =>
  isPt.value
    ? [
        'Engenharia de Software',
        'Sistemas Distribuídos',
        'Engenharia de Dados',
        'Arquitetura de Software',
      ]
    : ['Software Engineering', 'Distributed Systems', 'Data Engineering', 'Software Architecture'],
)
</script>

<template>
  <article
    class="degree-card"
    role="button"
    tabindex="0"
    :aria-label="`${degree.degree} — ${detailsLabel}`"
    :aria-labelledby="`degree-${degree.id}-title`"
    @pointermove="onSpotMove"
    @click="$emit('select', degree)"
    @keydown.enter.prevent="$emit('select', degree)"
    @keydown.space.prevent="$emit('select', degree)"
  >
    <div class="degree-card__header">
      <div class="degree-card__header-left">
        <div class="degree-card__icon-badge" aria-hidden="true">
          <GraduationCap class="degree-card__icon" />
        </div>

        <div class="degree-card__meta">
          <span class="degree-card__institution-pill">
            {{ degree.institution }}
          </span>

          <div class="degree-card__period">
            <Calendar class="degree-card__period-icon" aria-hidden="true" />
            <time>{{ degree.period }}</time>
          </div>
        </div>
      </div>

      <!-- Top Right Status Pill -->
      <span class="degree-card__status-pill">
        <span class="degree-card__status-dot" aria-hidden="true" />
        <span>{{ statusLabel }}</span>
      </span>
    </div>

    <div class="degree-card__title-row">
      <h3 :id="`degree-${degree.id}-title`" class="degree-card__title">
        {{ degree.degree }}
      </h3>

      <span class="degree-card__action-hint">
        <span>{{ isPt ? 'Detalhes' : 'Details' }}</span>
        <ArrowUpRight class="degree-card__hint-icon" aria-hidden="true" />
      </span>
    </div>

    <p class="degree-card__description">
      {{ degree.description }}
    </p>

    <div class="degree-card__pillars">
      <span class="degree-card__pillars-label">
        {{ isPt ? 'Eixos de estudo' : 'Key study areas' }}
      </span>

      <ul class="degree-card__pillars-list" role="list">
        <li
          v-for="pillar in focusPillars"
          :key="pillar"
          class="degree-card__pillar-tag"
          @pointermove.stop="onSpotMove"
        >
          {{ pillar }}
        </li>
      </ul>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.degree-card {
  @include amber-spot(260px, 280px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: $space-4;
  padding: clamp(1.35rem, 2.5vw, 2rem);
  border-radius: $radius-lg;
  background:
    radial-gradient(ellipse 65% 50% at 10% 10%, rgba(168, 196, 227, 0.05) 0%, transparent 65%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0.005) 100%), #12151b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.32);
  cursor: pointer;
  transition:
    border-color $transition-fast,
    box-shadow $transition-fast,
    transform $transition-fast;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    border-color: $color-interaction-border;
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.45),
      0 0 24px rgba(255, 176, 96, 0.08);
    transform: translateY(-2px);

    .degree-card__action-hint {
      color: $color-interaction;
      border-color: $color-interaction-border;
    }
  }

  &:focus-visible {
    outline: 2px solid $color-focus;
    outline-offset: 2px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
  }

  &__icon-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: $radius-md;
    background: rgba(168, 196, 227, 0.1);
    border: 1px solid rgba(168, 196, 227, 0.2);
    color: #a8c4e3;
    flex-shrink: 0;
  }

  &__icon {
    width: 22px;
    height: 22px;
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }

  &__institution-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.22rem 0.6rem;
    border-radius: $radius-pill;
    font-size: 0.74rem;
    font-weight: 600;
    color: #e2e8f0;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: fit-content;
  }

  &__status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.22rem 0.6rem;
    border-radius: $radius-pill;
    font-size: 0.7rem;
    font-weight: 600;
    color: #4ade80;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.25);
    flex-shrink: 0;
  }

  &__status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px rgba(74, 222, 128, 0.8);
  }

  &__period {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.74rem;
    color: #94a3b8;
  }

  &__period-icon {
    width: 12px;
    height: 12px;
  }

  &__title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__title {
    font-size: clamp(1.25rem, 2.2vw, 1.55rem);
    font-weight: 550;
    line-height: 1.25;
    color: $color-ink;
    margin: 0;
    letter-spacing: -0.015em;
  }

  &__action-hint {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    font-weight: 550;
    color: #94a3b8;
    padding: 0.18rem 0.45rem;
    border-radius: $radius-pill;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
    transition:
      color $transition-fast,
      border-color $transition-fast;
  }

  &__hint-icon {
    width: 11px;
    height: 11px;
  }

  &__description {
    font-size: clamp(0.9rem, 1.3vw, 0.98rem);
    line-height: 1.65;
    color: #cbd5e1;
    margin: 0;
  }

  &__pillars {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding-top: $space-3;
    margin-top: auto;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__pillars-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #8c93a0;
  }

  &__pillars-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__pillar-tag {
    @include amber-spot(46px, 52px);
    display: inline-flex;
    align-items: center;
    padding: 0.22rem 0.62rem;
    border-radius: $radius-pill;
    font-size: 0.72rem;
    font-weight: 550;
    color: #d0d4dc;
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

  @media (max-width: 640px) {
    padding: 1.25rem;
    gap: $space-3;

    &__header {
      flex-direction: column;
      gap: 0.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      transform: none;
    }

    &__pillar-tag {
      transition: none;
    }
  }
}
</style>
