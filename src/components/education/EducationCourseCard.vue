<script setup lang="ts">
import { computed } from 'vue'
import { Database, Flame, GitBranch, Network, Terminal } from 'lucide-vue-next'
import type { Component } from 'vue'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import { isPt } from '@/state/locale'
import type { CourseViewModel } from './types'

const props = defineProps<{
  course: CourseViewModel
}>()

const iconComponent = computed<Component>(() => {
  switch (props.course.id) {
    case 'ccna-coursework':
      return Network
    case 'linux-fundamentals':
      return Terminal
    case 'sql-advanced':
      return Database
    case 'git-fundamentals':
      return GitBranch
    case 'databricks-certified-data-engineer':
      return Flame
    default:
      return Terminal
  }
})

const localizedType = computed(() => {
  switch (props.course.type) {
    case 'coursework':
      return isPt.value ? 'Formação teórica e prática' : 'Coursework'
    case 'course':
      return isPt.value ? 'Curso oficial' : 'Official course'
    case 'skills-assessment':
      return isPt.value ? 'Avaliação de habilidades' : 'Skills assessment'
    case 'exam-prep':
      return isPt.value ? 'Preparação para exame' : 'Exam preparation'
    case 'course-track':
      return isPt.value
        ? `Trilha de ${props.course.courseCount ?? 4} cursos`
        : `${props.course.courseCount ?? 4}-course track`
    default:
      return props.course.type
  }
})
</script>

<template>
  <div class="course-card" @pointermove="onSpotMove">
    <div class="course-card__header">
      <div class="course-card__icon-box" aria-hidden="true">
        <component :is="iconComponent" class="course-card__icon" />
      </div>

      <span class="course-card__type-tag">
        {{ localizedType }}
      </span>
    </div>

    <h4 class="course-card__name">
      {{ course.name }}
    </h4>

    <p class="course-card__provider">
      {{ course.provider }}
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.course-card {
  @include amber-spot(70px, 80px);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.15rem 1.25rem;
  border-radius: $radius-md;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition:
    border-color $transition-fast,
    background-color $transition-fast,
    transform $transition-fast;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    border-color: $color-interaction-border;
    background-color: $color-interaction-soft;
    transform: translateY(-2px);
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  &__icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(168, 196, 227, 0.1);
    color: #a8c4e3;
    flex-shrink: 0;
  }

  &__icon {
    width: 15px;
    height: 15px;
  }

  &__type-tag {
    font-size: 0.68rem;
    font-weight: 550;
    color: #8c93a0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__name {
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.35;
    color: #f1f5f9;
    margin: 0;
  }

  &__provider {
    font-size: 0.78rem;
    line-height: 1.4;
    color: #94a3b8;
    margin: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      transform: none;
    }
  }
}
</style>
