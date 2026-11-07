<script setup lang="ts">
import { skillCategories, skills, skillsSectionCopy, skillsUi } from '@/data/skills/index'
import { useSkillsShowcase } from './useSkillsShowcase'
import SkillsArcCarousel from './SkillsArcCarousel.vue'
import SkillsHighlightCard from './SkillsHighlightCard.vue'
import SkillsHighlightDialog from './SkillsHighlightDialog.vue'

const {
  activeCategory,
  selectedIndex,
  isDialogOpen,
  selectedHighlight,
  filteredSkills,
  activeSkill,
  handleSelectCategory,
  handleSelectSkill,
  handleOpenDetails,
  handleSelectHighlightInDialog,
  handleCloseDetails,
} = useSkillsShowcase(skills)
</script>

<template>
  <section id="skills" class="skills-section" aria-labelledby="skills-section-title">
    <div class="skills-section__shell">
      <!-- Section Intro Header (Compact, no eyebrow, single orange dot) -->
      <header class="skills-section__header">
        <h2 id="skills-section-title" class="skills-section__title">
          {{ skillsSectionCopy.title }}<span class="skills-section__period">.</span>
        </h2>

        <p class="skills-section__intro">
          {{ skillsSectionCopy.introduction }}
        </p>
      </header>

      <!-- Main Showcase Grid: Left = Featured Highlight, Right = 'C' Orbital Carousel -->
      <div v-if="activeSkill" class="skills-section__grid">
        <!-- Left: Featured Highlight & Multi-Project Preview -->
        <div class="skills-section__highlight-col">
          <SkillsHighlightCard
            :skill="activeSkill"
            :ui="skillsUi"
            @open-details="handleOpenDetails"
          />
        </div>

        <!-- Right: Sculptural 'C' Arc Carousel with Category Filters -->
        <div class="skills-section__carousel-col">
          <SkillsArcCarousel
            :skills="filteredSkills"
            :categories="skillCategories"
            :active-category="activeCategory"
            :selected-index="selectedIndex"
            :ui="skillsUi"
            @select="handleSelectSkill"
            @select-category="handleSelectCategory"
          />
        </div>
      </div>

      <!-- Graceful Fallback Notice (if any filter is ever empty) -->
      <div v-else class="skills-section__empty">
        <p class="skills-section__empty-text">
          {{ skillsUi.emptyCategoryNotice || 'Nenhuma ferramenta encontrada para esta categoria.' }}
        </p>
        <button
          type="button"
          class="skills-section__empty-btn"
          @click="handleSelectCategory('all')"
        >
          {{ skillsUi.resetCategoryButton || 'Ver todas as ferramentas' }}
        </button>
      </div>

      <!-- Specification & Deep Dive Modal Dialog -->
      <SkillsHighlightDialog
        v-if="activeSkill"
        :open="isDialogOpen"
        :skill="activeSkill"
        :highlight="selectedHighlight ?? activeSkill.highlight"
        :ui="skillsUi"
        @select-highlight="handleSelectHighlightInDialog"
        @close="handleCloseDetails"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.skills-section {
  position: relative;
  background-color: #0e1014;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  isolation: isolate;

  // Atmospheric radial glow behind the section
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(50% 60% at 90% 40%, rgba(255, 176, 96, 0.04) 0%, transparent 70%),
      radial-gradient(45% 55% at 10% 60%, rgba(168, 196, 227, 0.035) 0%, transparent 70%);
  }

  &__shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: $layout-max;
    margin: 0 auto;
    padding: $space-section $layout-gutter;
    display: flex;
    flex-direction: column;
    gap: $space-section-gap;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    max-width: 44rem;
  }

  &__title {
    font-size: clamp(2.2rem, 4.2vw, 3.4rem);
    font-weight: 500;
    line-height: 1.05;
    letter-spacing: -0.035em;
    color: $color-ink;
  }

  &__period {
    color: #ffb060;
  }

  &__intro {
    font-size: clamp(0.92rem, 1.4vw, 1.02rem);
    line-height: 1.6;
    color: $color-muted;
    max-width: 38rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
    align-items: start;
    gap: clamp(1.5rem, 3.5vw, 3.5rem);
  }

  &__highlight-col,
  &__carousel-col {
    min-width: 0;
    width: 100%;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $space-3;
    padding: $space-12 $space-4;
    border-radius: $radius-lg;
    background-color: #14171d;
    border: 1px dashed rgba(255, 255, 255, 0.1);
    text-align: center;
  }

  &__empty-text {
    font-size: 0.88rem;
    color: $color-muted;
  }

  &__empty-btn {
    padding: 0.45rem 1rem;
    border-radius: $radius-pill;
    background: linear-gradient(
      135deg,
      rgba(255, 176, 96, 0.16) 0%,
      rgba(168, 196, 227, 0.08) 100%
    );
    border: 1px solid rgba(255, 196, 112, 0.35);
    font-size: 0.74rem;
    font-weight: 600;
    color: #fffaf0;
    cursor: pointer;
    transition:
      border-color $transition-fast,
      transform $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      border-color: $color-interaction-border;
      transform: translateY(-1px);
    }
  }

  @media (max-width: 960px) {
    &__grid {
      grid-template-columns: 1fr;
      gap: $space-4;
    }

    &__carousel-col {
      order: 1;
    }

    &__highlight-col {
      order: 2;
    }
  }

  @media (max-width: 640px) {
    &__shell {
      gap: $space-4;
    }
  }
}
</style>
