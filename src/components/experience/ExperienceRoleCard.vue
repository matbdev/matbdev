<script setup lang="ts">
import { computed } from 'vue'
import { Building2, Calendar, Cpu, Sparkles, Workflow } from 'lucide-vue-next'
import type { Component } from 'vue'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import { isPt } from '@/state/locale'
import type { ExperienceRoleViewModel } from './types'

defineProps<{
  role: ExperienceRoleViewModel
}>()

function getDetailIcon(id: string): Component {
  switch (id) {
    case 'data-pipelines':
      return Workflow
    case 'backend-iot':
      return Cpu
    case 'platform-ai':
      return Sparkles
    default:
      return Workflow
  }
}

const currentLabel = computed(() => (isPt.value ? 'Cargo atual' : 'Current role'))
</script>

<template>
  <article
    class="experience-card"
    :class="{ 'is-current': role.isCurrent }"
    :aria-labelledby="`experience-${role.id}-title`"
  >
    <!-- Timeline node and connector line -->
    <div class="experience-card__timeline" aria-hidden="true">
      <div class="experience-card__node">
        <span v-if="role.isCurrent" class="experience-card__pulse" />
      </div>
      <div class="experience-card__rail" />
    </div>

    <!-- Main Content Panel with Amber Spotlight -->
    <div class="experience-card__panel" @pointermove="onSpotMove">
      <!-- Header Meta -->
      <header class="experience-card__header">
        <div class="experience-card__meta-bar">
          <div class="experience-card__meta-left">
            <div class="experience-card__company-pill" @pointermove="onSpotMove">
              <Building2 class="experience-card__meta-icon" aria-hidden="true" />
              <span>{{ role.company }}</span>
            </div>

            <div class="experience-card__period-pill" @pointermove="onSpotMove">
              <Calendar class="experience-card__meta-icon" aria-hidden="true" />
              <time>{{ role.period }}</time>
            </div>
          </div>

          <!-- Status Pill anchored to the top right corner -->
          <div v-if="role.isCurrent" class="experience-card__status-pill">
            <span class="experience-card__status-dot" aria-hidden="true" />
            <span>{{ currentLabel }}</span>
          </div>
        </div>

        <h3 :id="`experience-${role.id}-title`" class="experience-card__title">
          {{ role.title }}
        </h3>

        <p class="experience-card__summary">
          {{ role.summary }}
        </p>
      </header>

      <!-- Key Technologies (if defined) -->
      <div
        v-if="role.technologies && role.technologies.length > 0"
        class="experience-card__tech-wrap"
      >
        <span class="experience-card__tech-label">
          {{ isPt ? 'Tecnologias' : 'Stack' }}
        </span>
        <ul class="experience-card__tech-list" role="list">
          <li
            v-for="tech in role.technologies"
            :key="tech"
            class="experience-card__tech-tag"
            @pointermove="onSpotMove"
          >
            {{ tech }}
          </li>
        </ul>
      </div>

      <!-- Descriptive Body for Trainee Role -->
      <p v-if="role.description" class="experience-card__description">
        {{ role.description }}
      </p>

      <!-- Contribution Details for Developer Role -->
      <div v-if="role.details && role.details.length > 0" class="experience-card__details">
        <div
          v-for="detail in role.details"
          :key="detail.id"
          class="experience-card__detail-item"
          @pointermove="onSpotMove"
        >
          <div class="experience-card__detail-head">
            <div class="experience-card__detail-icon-wrap" aria-hidden="true">
              <component :is="getDetailIcon(detail.id)" class="experience-card__detail-icon" />
            </div>
            <h4 class="experience-card__detail-title">
              {{ detail.title }}
            </h4>
          </div>

          <p class="experience-card__detail-text">
            {{ detail.text }}
          </p>
        </div>
      </div>

      <!-- Authorial Note -->
      <footer v-if="role.note" class="experience-card__footer">
        <p class="experience-card__note">
          {{ role.note }}
        </p>
      </footer>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.experience-card {
  position: relative;
  display: flex;
  gap: clamp(1.25rem, 3vw, 2.5rem);

  &:last-child &__rail {
    display: none;
  }

  // Timeline Column
  &__timeline {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 24px;
    flex-shrink: 0;
  }

  &__node {
    position: relative;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-top: 1.5rem;
    background: #2a2f3a;
    border: 2px solid #58606e;
    z-index: 2;
    transition:
      border-color $transition-fast,
      background-color $transition-fast;
  }

  &.is-current &__node {
    background: #ffb060;
    border-color: #ffe0a3;
    box-shadow: 0 0 14px rgba(255, 176, 96, 0.45);
  }

  &__pulse {
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 1px solid rgba(255, 176, 96, 0.45);
    animation: node-pulse 2.8s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  }

  &__rail {
    position: absolute;
    top: 2.2rem;
    bottom: -1.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.03) 100%
    );
    z-index: 1;
  }

  // Content Panel
  &__panel {
    @include amber-spot(260px, 280px);
    flex: 1;
    min-width: 0;
    padding: clamp(1.5rem, 3vw, 2.25rem);
    border-radius: $radius-lg;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0.005) 100%),
      #12151b;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.32);
    display: flex;
    flex-direction: column;
    gap: $space-5;
    transition:
      border-color $transition-fast,
      box-shadow $transition-fast,
      transform $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      border-color: $color-interaction-border;
      box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.45),
        0 0 28px rgba(255, 176, 96, 0.1);
      transform: translateY(-2px);
    }
  }

  &.is-current &__panel {
    border-color: rgba(255, 176, 96, 0.32);
    background:
      radial-gradient(ellipse 70% 40% at 90% 0%, rgba(255, 176, 96, 0.05) 0%, transparent 70%),
      linear-gradient(145deg, rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0.008) 100%),
      #13161d;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      border-color: $color-interaction-border;
      box-shadow:
        0 26px 64px rgba(0, 0, 0, 0.5),
        0 0 32px rgba(255, 176, 96, 0.16);
      transform: translateY(-2px);
    }
  }

  // Header
  &__header {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__meta-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
  }

  &__meta-left {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  &__company-pill,
  &__period-pill {
    @include amber-spot(48px, 56px);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.65rem;
    border-radius: $radius-pill;
    font-size: 0.72rem;
    font-weight: 500;
    color: #c4c8d2;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
      background: rgba(255, 176, 96, 0.08);
    }
  }

  &__meta-icon {
    width: 12px;
    height: 12px;
    color: #a8c4e3;
    flex-shrink: 0;
  }

  &__status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.65rem;
    border-radius: $radius-pill;
    font-size: 0.7rem;
    font-weight: 600;
    color: #4ade80;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.25);
    margin-left: auto;
    flex-shrink: 0;
    transition:
      border-color $transition-fast,
      background-color $transition-fast,
      box-shadow $transition-fast;
  }

  &__status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px rgba(74, 222, 128, 0.8);
  }

  &__title {
    font-size: clamp(1.25rem, 2.2vw, 1.55rem);
    font-weight: 550;
    color: $color-ink;
    line-height: 1.25;
    margin: 0;
    letter-spacing: -0.015em;
  }

  &__summary {
    font-size: clamp(0.9rem, 1.3vw, 0.98rem);
    line-height: 1.6;
    color: #d1d5db;
    margin: 0;
  }

  // Tech wrap
  &__tech-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding-top: $space-1;
  }

  &__tech-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #8c93a0;
  }

  &__tech-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__tech-tag {
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

  &__description {
    font-size: clamp(0.88rem, 1.25vw, 0.95rem);
    line-height: 1.7;
    color: #b0b6c2;
    margin: 0;
  }

  // Contribution details (Grid)
  &__details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 0.85rem;
    margin-top: $space-2;
  }

  &__detail-item {
    @include amber-spot(90px, 100px);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 1rem 1.1rem;
    border-radius: $radius-md;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition:
      border-color $transition-fast,
      background-color $transition-fast,
      transform $transition-fast,
      box-shadow $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      border-color: $color-interaction-border;
      background: rgba(255, 176, 96, 0.04);
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);

      .experience-card__detail-icon-wrap {
        background: rgba(255, 176, 96, 0.18);
        color: $color-interaction;
        border-color: $color-interaction-border;
      }

      .experience-card__detail-title {
        color: $color-interaction;
      }
    }
  }

  &__detail-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__detail-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: rgba(168, 196, 227, 0.1);
    border: 1px solid transparent;
    color: #a8c4e3;
    flex-shrink: 0;
    transition:
      background-color $transition-fast,
      border-color $transition-fast,
      color $transition-fast;
  }

  &__detail-icon {
    width: 14px;
    height: 14px;
  }

  &__detail-title {
    font-size: 0.82rem;
    font-weight: 600;
    color: #f0f2f5;
    margin: 0;
    transition: color $transition-fast;
  }

  &__detail-text {
    font-size: 0.8rem;
    line-height: 1.6;
    color: #9ea5b1;
    margin: 0;
  }

  // Footer note
  &__footer {
    padding-top: $space-1;
    border-top: 1px dashed rgba(255, 255, 255, 0.08);
  }

  &__note {
    font-size: 0.74rem;
    color: $color-muted;
    margin: 0;
    font-style: italic;
  }

  @keyframes node-pulse {
    0% {
      transform: scale(0.95);
      opacity: 0.9;
    }
    50% {
      transform: scale(1.6);
      opacity: 0;
    }
    100% {
      transform: scale(0.95);
      opacity: 0;
    }
  }

  @media (max-width: 640px) {
    gap: 0.85rem;

    &__node {
      margin-top: 1.1rem;
      width: 12px;
      height: 12px;
    }

    &__rail {
      top: 1.8rem;
    }

    &__panel {
      padding: 1.25rem;
      gap: $space-4;
    }

    &__meta-bar {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    &__status-pill {
      margin-left: 0;
    }

    &__details {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__pulse {
      animation: none;
    }

    &__tech-tag,
    &__detail-item {
      transition: none;
    }
  }
}
</style>
