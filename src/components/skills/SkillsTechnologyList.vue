<script setup lang="ts">
import { onSpotMove } from '@/composables/useAmberSpotlight'
import SkillIcon from './SkillIcon.vue'

defineProps<{
  technologies: readonly string[]
  activeName: string
  variant: 'card' | 'dialog'
}>()
</script>

<template>
  <div v-if="variant === 'card' && technologies.length > 0" class="skills-card__techs" @click.stop>
    <span
      v-for="tech in technologies"
      :key="tech"
      class="skills-card__tech-pill"
      :class="{ 'is-focused': tech.toLowerCase() === activeName.toLowerCase() }"
      @pointermove="onSpotMove"
    >
      <SkillIcon :name="tech" :size="13" class="skills-card__tech-icon" />
      <span class="skills-card__tech-label">{{ tech }}</span>
    </span>
  </div>
  <div v-else-if="technologies.length > 0" class="skills-dialog__tech-list">
    <span
      v-for="tech in technologies"
      :key="tech"
      class="skills-dialog__tech-item"
      :class="{ 'is-focused': tech.toLowerCase() === activeName.toLowerCase() }"
      @pointermove="onSpotMove"
    >
      <SkillIcon :name="tech" :size="13" class="skills-dialog__tech-icon" />
      <span class="skills-dialog__tech-label">{{ tech }}</span>
    </span>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;
.skills-card {
  &__techs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.25rem;
  }

  &__tech-pill {
    @include amber-spot(46px, 52px);
    display: inline-flex;
    align-items: center;
    gap: 0.32rem;
    padding: 0.22rem 0.58rem;
    border-radius: $radius-pill;
    font-size: 0.68rem;
    font-weight: 500;
    color: #c4c8d0;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: default;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
    }

    &.is-focused {
      color: #fff6eb;
      background: rgba(255, 176, 96, 0.14);
      border-color: rgba(255, 176, 96, 0.42);
      font-weight: 600;
    }
  }

  &__tech-icon,
  &__tech-label {
    position: relative;
    z-index: 1;
  }
}
.skills-dialog {
  &__tech-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__tech-item {
    @include amber-spot(46px, 52px);
    display: inline-flex;
    align-items: center;
    gap: 0.32rem;
    padding: 0.25rem 0.65rem;
    border-radius: $radius-pill;
    font-size: 0.7rem;
    color: #c4c8d0;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: default;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
    }

    &.is-focused {
      color: #fff9f0;
      background: rgba(255, 176, 96, 0.16);
      border-color: rgba(255, 176, 96, 0.42);
      font-weight: 600;
    }
  }

  &__tech-icon,
  &__tech-label {
    position: relative;
    z-index: 1;
  }
}
</style>
