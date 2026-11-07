<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, ExternalLink, Layers, Workflow } from 'lucide-vue-next'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import { resolveImageAsset } from '@/data/imageAssets'
import { isPt } from '@/state/locale'
import type { ProjectViewModel } from './types'

const props = defineProps<{
  project: ProjectViewModel
}>()

defineEmits<{
  select: [project: ProjectViewModel]
}>()

const resolvedImage = computed(() => {
  if (props.project.media.type === 'image') {
    return resolveImageAsset(props.project.media.src)
  }
  return undefined
})

const conceptLabel = computed(() => {
  if (props.project.media.type === 'concept') {
    return props.project.media.label
  }
  return ''
})

const viewDetailsText = computed(() => (isPt.value ? 'Ver detalhes' : 'View details'))
const repoLabel = computed(() => (isPt.value ? 'Repositório' : 'Repository'))
const websiteLabel = computed(() => (isPt.value ? 'Site ao vivo' : 'Live site'))
</script>

<template>
  <article
    class="project-card"
    role="button"
    tabindex="0"
    :aria-label="`${project.title} — ${viewDetailsText}`"
    :aria-labelledby="`project-${project.id}-title`"
    @pointermove="onSpotMove"
    @click="$emit('select', project)"
    @keydown.enter.prevent="$emit('select', project)"
    @keydown.space.prevent="$emit('select', project)"
  >
    <!-- Top Meta Bar -->
    <header class="project-card__header">
      <div class="project-card__meta">
        <span class="project-card__context-pill" @pointermove.stop="onSpotMove">
          {{ project.context }}
        </span>

        <span class="project-card__badge-pill" @pointermove.stop="onSpotMove">
          {{ project.badge }}
        </span>
      </div>
    </header>

    <!-- Visual Media Preview -->
    <div class="project-card__media-frame" aria-hidden="true">
      <img
        v-if="project.media.type === 'image' && resolvedImage"
        :src="resolvedImage"
        :alt="project.media.alt"
        class="project-card__image"
        loading="lazy"
      />

      <!-- Conceptual Visualizer for Data/AI Architecture Projects -->
      <div v-else class="project-card__concept">
        <div class="project-card__concept-header">
          <Workflow class="project-card__concept-icon" aria-hidden="true" />
          <span class="project-card__concept-label">{{ conceptLabel }}</span>
        </div>

        <div
          v-if="project.diagram && project.diagram.length > 0"
          class="project-card__concept-flow"
        >
          <template v-for="(node, idx) in project.diagram" :key="node">
            <span class="project-card__concept-node">
              <strong class="project-card__node-num">0{{ idx + 1 }}.</strong>
              <span>{{ node }}</span>
            </span>
            <span
              v-if="idx < (project.diagram?.length ?? 0) - 1"
              class="project-card__concept-sep"
              aria-hidden="true"
            >
              →
            </span>
          </template>
        </div>
      </div>
    </div>

    <!-- Core Body -->
    <div class="project-card__body">
      <div class="project-card__titles">
        <h3 :id="`project-${project.id}-title`" class="project-card__title">
          {{ project.title }}
        </h3>
        <p class="project-card__subtitle">
          {{ project.subtitle }}
        </p>
      </div>

      <p class="project-card__description">
        {{ project.description }}
      </p>

      <!-- Key Technologies List -->
      <ul
        v-if="project.technologies && project.technologies.length > 0"
        class="project-card__tech-list"
        role="list"
        aria-label="Technologies"
      >
        <li
          v-for="tech in project.technologies"
          :key="tech"
          class="project-card__tech-tag"
          @pointermove.stop="onSpotMove"
        >
          {{ tech }}
        </li>
      </ul>
    </div>

    <!-- Footer Actions -->
    <footer class="project-card__footer" @click.stop>
      <div class="project-card__links">
        <a
          v-if="project.links.repository"
          :href="project.links.repository"
          target="_blank"
          rel="noopener noreferrer"
          class="project-card__action-btn"
          :aria-label="`${project.title} — ${repoLabel}`"
          @pointermove="onSpotMove"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            class="project-card__action-icon"
            aria-hidden="true"
          >
            <path
              d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.02 11.02 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.42.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
            />
          </svg>
          <span>{{ repoLabel }}</span>
          <ArrowUpRight class="project-card__action-arrow" aria-hidden="true" />
        </a>

        <a
          v-if="project.links.website"
          :href="project.links.website"
          target="_blank"
          rel="noopener noreferrer"
          class="project-card__action-btn"
          :aria-label="`${project.title} — ${websiteLabel}`"
          @pointermove="onSpotMove"
        >
          <ExternalLink class="project-card__action-icon" aria-hidden="true" />
          <span>{{ websiteLabel }}</span>
          <ArrowUpRight class="project-card__action-arrow" aria-hidden="true" />
        </a>
      </div>

      <button
        type="button"
        class="project-card__details-btn"
        :aria-label="`${project.title} — ${viewDetailsText}`"
        @pointermove="onSpotMove"
        @click="$emit('select', project)"
      >
        <Layers class="project-card__details-icon" aria-hidden="true" />
        <span>{{ viewDetailsText }}</span>
      </button>
    </footer>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.project-card {
  @include amber-spot(260px, 280px);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: clamp(1.35rem, 2.5vw, 1.75rem);
  border-radius: $radius-lg;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0.005) 100%), #12151b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition:
    border-color $transition-fast,
    box-shadow $transition-fast,
    transform $transition-fast;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    border-color: $color-interaction-border;
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.48),
      0 0 28px rgba(255, 176, 96, 0.1);
    transform: translateY(-2px);

    .project-card__details-btn {
      color: $color-interaction;
      border-color: $color-interaction-border;
    }
  }

  &:focus-visible {
    outline: 2px solid $color-focus;
    outline-offset: 2px;
  }

  // Header Meta
  &__header {
    margin-bottom: $space-3;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.45rem;
  }

  &__context-pill,
  &__badge-pill {
    @include amber-spot(46px, 52px);
    display: inline-flex;
    align-items: center;
    padding: 0.24rem 0.62rem;
    border-radius: $radius-pill;
    font-size: 0.7rem;
    font-weight: 550;
    line-height: 1.3;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast;
  }

  &__context-pill {
    color: #c4c8d2;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
      background: rgba(255, 176, 96, 0.08);
    }
  }

  &__badge-pill {
    color: #ffe6c2;
    background: rgba(255, 176, 96, 0.12);
    border: 1px solid rgba(255, 176, 96, 0.28);

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
      background: rgba(255, 176, 96, 0.18);
    }
  }

  // Media Frame
  &__media-frame {
    position: relative;
    width: 100%;
    height: 185px;
    border-radius: $radius-md;
    overflow: hidden;
    background-color: #0b0d11;
    border: 1px solid rgba(255, 255, 255, 0.07);
    margin-bottom: $space-4;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    display: block;
  }

  &__concept {
    width: 100%;
    height: 100%;
    padding: $space-3;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background:
      radial-gradient(circle at 80% 20%, rgba(255, 176, 96, 0.06) 0%, transparent 60%),
      rgba(255, 255, 255, 0.015);
  }

  &__concept-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: #a8c4e3;
    letter-spacing: 0.03em;
  }

  &__concept-icon {
    width: 13px;
    height: 13px;
    color: #ffb060;
  }

  &__concept-flow {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
  }

  &__concept-node {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.35rem 0.65rem;
    border-radius: $radius-pill;
    background: rgba(255, 255, 255, 0.045);
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.72rem;
    color: #e0e4ec;
  }

  &__node-num {
    font-size: 0.68rem;
    font-family: monospace;
    color: #ffb060;
  }

  &__concept-sep {
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.75rem;
  }

  // Body
  &__body {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    flex: 1;
  }

  &__titles {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__title {
    font-size: clamp(1.2rem, 2vw, 1.45rem);
    font-weight: 550;
    color: $color-ink;
    margin: 0;
    line-height: 1.25;
    letter-spacing: -0.015em;
  }

  &__subtitle {
    font-size: 0.84rem;
    color: #ffc470;
    margin: 0;
    font-weight: 500;
  }

  &__description {
    font-size: 0.85rem;
    line-height: 1.6;
    color: #b0b6c2;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  // Technologies List
  &__tech-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    list-style: none;
    padding: 0;
    margin: $space-1 0 0;
  }

  &__tech-tag {
    @include amber-spot(44px, 50px);
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.55rem;
    border-radius: $radius-pill;
    font-size: 0.7rem;
    font-weight: 550;
    color: #c4c8d2;
    background: rgba(255, 255, 255, 0.035);
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
      background: rgba(255, 176, 96, 0.09);
    }
  }

  // Footer Actions
  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
    margin-top: $space-4;
    padding-top: $space-3;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  &__action-btn {
    @include amber-spot(48px, 54px);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: $radius-sm;
    font-size: 0.74rem;
    font-weight: 550;
    color: #c4c8d2;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    text-decoration: none;
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

  &__action-icon {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  &__action-arrow {
    width: 12px;
    height: 12px;
    opacity: 0.7;
    transition: transform $transition-fast;
  }

  &:hover &__action-arrow {
    transform: translate(1px, -1px);
    opacity: 1;
  }

  &__details-btn {
    @include amber-spot(48px, 54px);
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: $radius-sm;
    font-size: 0.74rem;
    font-weight: 600;
    color: #a8c4e3;
    background: rgba(168, 196, 227, 0.08);
    border: 1px solid rgba(168, 196, 227, 0.2);
    cursor: pointer;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
      background: rgba(255, 176, 96, 0.12);
    }
  }

  &__details-icon {
    width: 13px;
    height: 13px;
  }
}
</style>
