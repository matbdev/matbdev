<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import projectsData from '@/data/projects.json'
import sectionsData from '@/data/sections.json'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import { currentLocale } from '@/state/locale'
import ProjectCard from './ProjectCard.vue'
import ProjectDetailModal from './ProjectDetailModal.vue'
import type { ProjectMedia, ProjectViewModel } from './types'

const sectionCopy = computed(() => {
  const content = sectionsData.sections.projects.content
  return currentLocale.value === 'pt-BR' ? content['pt-BR'] : content.en
})

const cleanTitle = computed(() => sectionCopy.value.title.replace(/\.+$/, ''))

const githubUrl = computed(() => {
  return sectionCopy.value.githubUrl || 'https://github.com/matbdev'
})

const viewAllText = computed(() => {
  return (
    sectionCopy.value.viewAll ||
    (currentLocale.value === 'pt-BR' ? 'Ver todos no GitHub' : 'View all on GitHub')
  )
})

// Modal dialog state
const isModalOpen = ref(false)
const selectedProject = ref<ProjectViewModel | null>(null)

function openProjectModal(project: ProjectViewModel) {
  selectedProject.value = project
  isModalOpen.value = true
}

function closeProjectModal() {
  isModalOpen.value = false
  selectedProject.value = null
}

const highlightedProjects = computed<ProjectViewModel[]>(() => {
  const loc = currentLocale.value === 'pt-BR' ? 'pt-BR' : 'en'

  return projectsData.projects
    .filter((p) => Boolean(p.highlight))
    .sort((a, b) => a.order - b.order)
    .slice(0, 3)
    .map((item) => {
      const content = item.content[loc] ?? item.content.en

      let media: ProjectMedia
      if (
        item.media.type === 'image' &&
        'src' in item.media &&
        typeof item.media.src === 'string'
      ) {
        const altMap = 'alt' in item.media && item.media.alt ? item.media.alt : undefined
        const altText = altMap ? (loc === 'pt-BR' ? altMap['pt-BR'] : altMap.en) : ''
        media = {
          type: 'image',
          src: item.media.src,
          alt: altText,
          width:
            'width' in item.media && typeof item.media.width === 'number'
              ? item.media.width
              : undefined,
          height:
            'height' in item.media && typeof item.media.height === 'number'
              ? item.media.height
              : undefined,
        }
      } else {
        const labelMap = 'label' in item.media && item.media.label ? item.media.label : undefined
        const labelText = labelMap ? (loc === 'pt-BR' ? labelMap['pt-BR'] : labelMap.en) : ''
        media = {
          type: 'concept',
          variant:
            'variant' in item.media && typeof item.media.variant === 'string'
              ? item.media.variant
              : 'flow',
          label: labelText,
        }
      }

      return {
        id: item.id,
        title: content.title,
        subtitle: content.subtitle,
        context: content.context,
        badge: content.badge,
        description: content.description,
        problem: content.problem,
        contribution: content.contribution,
        detailContext: 'detailContext' in content ? content.detailContext : undefined,
        diagram: 'diagram' in content ? content.diagram : undefined,
        categories: item.categories,
        technologies: item.technologies,
        highlight: Boolean(item.highlight),
        order: item.order,
        links: item.links,
        media,
      }
    })
})
</script>

<template>
  <section id="projects" class="projects-section" aria-labelledby="projects-title">
    <div class="projects-section__shell">
      <!-- Section Header with flex-aligned GitHub CTA -->
      <header class="projects-section__header">
        <div class="projects-section__headings">
          <h2 id="projects-title" class="projects-section__title">
            {{ cleanTitle }}<span class="projects-section__period">.</span>
          </h2>

          <p class="projects-section__intro">
            {{ sectionCopy.introduction }}
          </p>
        </div>

        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="projects-section__github-btn"
          :aria-label="`${viewAllText} (abre em nova aba)`"
          @pointermove="onSpotMove"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            class="projects-section__github-icon"
            aria-hidden="true"
          >
            <path
              d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.02 11.02 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.42.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
            />
          </svg>
          <span>{{ viewAllText }}</span>
          <ArrowUpRight class="projects-section__github-arrow" aria-hidden="true" />
        </a>
      </header>

      <!-- 3 Featured Projects Grid -->
      <div class="projects-section__grid" role="list" aria-label="Projetos em destaque">
        <ProjectCard
          v-for="project in highlightedProjects"
          :key="project.id"
          :project="project"
          @select="openProjectModal"
        />
      </div>
    </div>

    <!-- Deep-dive Project Details Modal -->
    <ProjectDetailModal :open="isModalOpen" :project="selectedProject" @close="closeProjectModal" />
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.projects-section {
  position: relative;
  width: 100%;
  padding-block: var(--section-spacing-y, clamp(3.5rem, 6.5vw, 6.5rem));
  background-color: transparent;
  color: $color-ink;

  &__shell {
    width: min(100% - 2rem, 1200px);
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    gap: clamp(2rem, 3.5vw, 3rem);
  }

  // Header with flex alignment
  &__header {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    @media (min-width: 768px) {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
      gap: 2rem;
    }
  }

  &__headings {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    max-width: 680px;
  }

  &__title {
    font-size: clamp(2rem, 4.2vw, 3.1rem);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.035em;
    color: #f8fafc;
    margin: 0;
  }

  &__period {
    color: #ffb060;
  }

  &__intro {
    font-size: clamp(0.95rem, 1.4vw, 1.1rem);
    line-height: 1.6;
    color: #94a3b8;
    margin: 0;
  }

  &__github-btn {
    @include amber-spot(120px, 140px);
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.65rem 1.25rem;
    border-radius: $radius-pill;
    font-size: 0.85rem;
    font-weight: 600;
    color: #f1f5f9;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
    align-self: flex-start;
    transition:
      color $transition-fast,
      background-color $transition-fast,
      border-color $transition-fast,
      transform $transition-fast,
      box-shadow $transition-fast;

    @media (min-width: 768px) {
      align-self: flex-end;
      margin-bottom: 0.35rem;
    }

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      background-color: $color-interaction-soft;
      border-color: $color-interaction-border;
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.4),
        0 0 16px rgba(255, 176, 96, 0.12);
      transform: translateY(-2px);

      .projects-section__github-arrow {
        transform: translate(2px, -2px);
      }
    }

    &:focus-visible {
      outline: 2px solid $color-focus;
      outline-offset: 3px;
    }
  }

  &__github-icon {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
  }

  &__github-arrow {
    width: 15px;
    height: 15px;
    color: #ffb060;
    transition: transform $transition-fast;
  }

  // 3-card responsive grid
  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(1.25rem, 2vw, 1.85rem);

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1100px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}
</style>
