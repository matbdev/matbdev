<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ArrowUpRight, ChevronLeft, ChevronRight, Layers } from 'lucide-vue-next'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import type { Skill, SkillHighlight, SkillsUiCopy } from '@/data/skills/index'
import SkillIcon from './SkillIcon.vue'
import SkillsHighlightMedia from './SkillsHighlightMedia.vue'
import SkillsTechnologyList from './SkillsTechnologyList.vue'
import { resolveHighlightLinkIcon } from './highlightLinkIcons'

const props = defineProps<{
  skill: Skill
  ui: SkillsUiCopy
}>()

const emit = defineEmits<{
  openDetails: [highlight: SkillHighlight]
}>()

const activeHighlightIndex = ref(0)

// Reset to first highlight when the selected skill changes
watch(
  () => props.skill.id,
  () => {
    activeHighlightIndex.value = 0
  },
)

const activeHighlight = computed<SkillHighlight>(() => {
  const list = props.skill.highlights
  if (!list || list.length === 0) return props.skill.highlight
  const idx = Math.max(0, Math.min(list.length - 1, activeHighlightIndex.value))
  return list[idx] ?? props.skill.highlight
})

const hasPhoto = computed(() => {
  return activeHighlight.value.media.type === 'image' && activeHighlight.value.media.fit === 'cover'
})

const hasBadgeImage = computed(() => {
  return (
    activeHighlight.value.media.type === 'image' && activeHighlight.value.media.fit === 'contain'
  )
})

const hasVisualMedia = computed(() => hasPhoto.value || hasBadgeImage.value)

/**
 * Compact mode: when there is neither a screenshot photo nor a certification badge,
 * tighten the card padding and media frame height so text feels well-proportioned.
 */
const isCompact = computed(() => !hasVisualMedia.value)

function selectHighlight(index: number) {
  activeHighlightIndex.value = index
}

function prevHighlight() {
  const count = props.skill.highlights.length
  if (count <= 1) return
  activeHighlightIndex.value = (activeHighlightIndex.value - 1 + count) % count
}

function nextHighlight() {
  const count = props.skill.highlights.length
  if (count <= 1) return
  activeHighlightIndex.value = (activeHighlightIndex.value + 1) % count
}
</script>

<template>
  <div class="skills-highlight">
    <!-- Active Skill Context & Usage Banner -->
    <div class="skills-highlight__header" @pointermove="onSpotMove">
      <div class="skills-highlight__skill-badge">
        <SkillIcon :name="skill.id" :size="20" class="skills-highlight__tool-icon" />
        <span class="skills-highlight__skill-name">{{ skill.name }}</span>
        <span class="skills-highlight__context-dot" aria-hidden="true" />
        <span class="skills-highlight__context-label">{{ skill.context.label }}</span>
      </div>

      <p class="skills-highlight__usage">
        <span class="skills-highlight__usage-label">{{ ui.usageLabel }}:</span>
        {{ skill.usage }}
      </p>

      <!-- Multi-Project Switcher (when skill has multiple linked projects) -->
      <div v-if="skill.highlights.length > 1" class="skills-highlight__projects-nav">
        <span class="skills-highlight__nav-label">
          {{ ui.otherProjectsLabel || 'Projetos relacionados' }}:
        </span>

        <div class="skills-highlight__project-pills">
          <button
            v-for="(hl, idx) in skill.highlights"
            :key="hl.key"
            type="button"
            class="skills-highlight__proj-btn"
            :class="{ 'is-active': activeHighlightIndex === idx }"
            @pointermove="onSpotMove"
            @click="selectHighlight(idx)"
          >
            <span class="skills-highlight__proj-btn-idx">0{{ idx + 1 }}.</span>
            <span>{{ hl.title }}</span>
          </button>
        </div>

        <div class="skills-highlight__stepper-arrows">
          <button
            type="button"
            class="skills-highlight__arrow-btn"
            aria-label="Projeto anterior"
            @pointermove="onSpotMove"
            @click="prevHighlight"
          >
            <ChevronLeft class="skills-highlight__arrow-icon" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="skills-highlight__arrow-btn"
            aria-label="Próximo projeto"
            @pointermove="onSpotMove"
            @click="nextHighlight"
          >
            <ChevronRight class="skills-highlight__arrow-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <!-- Featured work card -->
    <Transition name="highlight-switch" mode="out-in">
      <article
        :key="activeHighlight.key"
        class="skills-card"
        :class="{ 'skills-card--compact': isCompact }"
        @pointermove="onSpotMove"
        @click="emit('openDetails', activeHighlight)"
      >
        <!-- Card Top Bar: Highlight Type & Badge -->
        <div class="skills-card__top">
          <div class="skills-card__kind-tag">
            <span class="skills-card__kind-indicator" aria-hidden="true" />
            <span>{{ ui.highlightLabel }} · {{ activeHighlight.kindLabel }}</span>
          </div>

          <div class="skills-card__top-right">
            <span v-if="activeHighlight.badge" class="skills-card__badge">
              {{ activeHighlight.badge }}
            </span>
            <span v-if="skill.highlights.length > 1" class="skills-card__counter">
              {{ activeHighlightIndex + 1 }} / {{ skill.highlights.length }}
            </span>
          </div>
        </div>

        <!-- Media Preview: Screenshot or Conceptual Workflow -->
        <SkillsHighlightMedia :media="activeHighlight.media" variant="card" />

        <!-- Identity & Summary -->
        <div class="skills-card__body">
          <div class="skills-card__titles">
            <h3 class="skills-card__title">{{ activeHighlight.title }}</h3>
            <p v-if="activeHighlight.subtitle" class="skills-card__subtitle">
              {{ activeHighlight.subtitle }}
            </p>
            <span v-if="activeHighlight.meta" class="skills-card__meta">
              {{ activeHighlight.meta }}
            </span>
          </div>

          <p v-if="activeHighlight.summary" class="skills-card__summary">
            {{ activeHighlight.summary }}
          </p>

          <!-- Technologies / Associated Stack -->
          <SkillsTechnologyList
            :technologies="activeHighlight.technologies"
            :active-name="skill.name"
            variant="card"
          />
        </div>

        <!-- Card Footer Actions: Quick Links & Deep Dive Trigger -->
        <div class="skills-card__footer" @click.stop>
          <div class="skills-card__links">
            <a
              v-for="link in activeHighlight.links"
              :key="link.href"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="skills-card__link-btn"
              @pointermove="onSpotMove"
            >
              <component
                :is="resolveHighlightLinkIcon(link.kind)"
                class="skills-card__link-icon"
                aria-hidden="true"
              />
              <span class="skills-card__link-text">{{ link.label }}</span>
              <ArrowUpRight class="skills-card__link-arrow" aria-hidden="true" />
            </a>
          </div>

          <button
            type="button"
            class="skills-card__details-btn"
            @pointermove="onSpotMove"
            @click="emit('openDetails', activeHighlight)"
          >
            <Layers class="skills-card__details-icon" aria-hidden="true" />
            <span>{{ ui.openDetails }}</span>
          </button>
        </div>
      </article>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.skills-highlight {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  min-width: 0;

  &__header {
    @include amber-spot(260px, 280px);
    display: flex;
    flex-direction: column;
    gap: $space-2;
    padding: $space-4;
    border-radius: $radius-md;
    background: #14171d;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__skill-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.74rem;
    font-weight: 600;
  }

  &__tool-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__skill-name {
    color: #fffaf0;
    font-size: 0.94rem;
    letter-spacing: -0.01em;
    font-weight: 650;
  }

  &__context-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
  }

  &__context-label {
    color: #a8c4e3;
    font-size: 0.72rem;
    font-weight: 500;
  }

  &__usage {
    font-size: 0.8rem;
    line-height: 1.6;
    color: #c1c5cd;
  }

  &__usage-label {
    color: #ffca8a;
    font-weight: 600;
    margin-right: 0.25rem;
  }

  &__projects-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding-top: $space-2;
    margin-top: $space-2;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__nav-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #9b9fa7;
  }

  &__project-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  &__proj-btn {
    @include amber-spot(56px, 64px);
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    padding: 0.28rem 0.65rem;
    border-radius: $radius-pill;
    background-color: #1a1e26;
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.68rem;
    font-weight: 550;
    color: #b8bcc4;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
    }

    &.is-active {
      color: #fffaf0;
      border-color: rgba(255, 176, 96, 0.45);
      background-color: rgba(255, 176, 96, 0.12);

      .skills-highlight__proj-btn-idx {
        color: #ffb060;
      }
    }
  }

  &__proj-btn-idx {
    font-size: 0.62rem;
    font-family: monospace;
    color: $color-muted;
  }

  &__stepper-arrows {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin-left: auto;
  }

  &__arrow-btn {
    @include amber-spot(36px, 42px);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #1a1e26;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #c4c8d0;
    transition: color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
    }
  }

  &__arrow-icon {
    position: relative;
    z-index: 1;
    width: 13px;
    height: 13px;
  }
}

// Match the cursor-tracked spotlight used by the selected project cards.
.skills-card {
  @include amber-spot(260px, 280px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: $radius-lg;
  background-color: #15181f;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 40px -20px rgba(0, 0, 0, 0.7);
  padding: clamp($space-4, 3vw, $space-6);
  cursor: pointer;
  transition:
    border-color $transition-fast,
    transform $transition-fast,
    box-shadow $transition-fast;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    border-color: $color-interaction-border;
    transform: translateY(-2px);
    box-shadow: 0 20px 48px -20px rgba(0, 0, 0, 0.85);
  }

  // Compact variant: when highlight has neither a photo nor a badge,
  // tighten padding, margins, gaps and text so content sits snugly.
  &--compact {
    padding: clamp($space-3, 2.5vw, $space-4);

    .skills-card__title {
      font-size: 1.15rem;
      line-height: 1.25;
    }

    .skills-card__subtitle {
      font-size: 0.78rem;
    }

    .skills-card__summary {
      font-size: 0.78rem;
      line-height: 1.52;
      -webkit-line-clamp: 3;
    }

    .skills-card__footer {
      padding-top: $space-3;
      margin-top: $space-3;
    }
  }

  &__top {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $space-2;
    margin-bottom: $space-4;
  }

  &__kind-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #a8c4e3;
  }

  &__kind-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #ffb060;
    box-shadow: 0 0 8px rgba(255, 176, 96, 0.8);
  }

  &__top-right {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  &__badge {
    padding: 0.2rem 0.55rem;
    border-radius: $radius-pill;
    font-size: 0.65rem;
    font-weight: 600;
    color: #ffe6c2;
    background: rgba(255, 176, 96, 0.14);
    border: 1px solid rgba(255, 176, 96, 0.3);
  }

  &__counter {
    padding: 0.18rem 0.45rem;
    border-radius: $radius-pill;
    font-size: 0.62rem;
    font-variant-numeric: tabular-nums;
    color: #9b9fa7;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.25;
    letter-spacing: -0.02em;
    color: $color-ink;
  }

  &__subtitle {
    font-size: 0.82rem;
    color: #a8c4e3;
    line-height: 1.4;
    margin-top: 0.15rem;
  }

  &__meta {
    display: inline-block;
    font-size: 0.7rem;
    color: $color-muted;
    margin-top: 0.15rem;
  }

  &__summary {
    font-size: 0.8rem;
    line-height: 1.6;
    color: $color-text;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  // Tags have the localized amber spotlight hover effect

  &__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    padding-top: $space-4;
    margin-top: $space-4;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
  }

  &__link-btn {
    @include amber-spot(56px, 64px);
    display: inline-flex;
    align-items: center;
    gap: 0.32rem;
    padding: 0.36rem 0.65rem;
    border-radius: $radius-pill;
    background-color: #1a1e26;
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.68rem;
    font-weight: 550;
    color: #c4c8d0;
    transition:
      color $transition-fast,
      border-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;

      .skills-card__link-arrow {
        transform: translate(2px, -2px);
        color: $color-interaction;
      }
    }
  }

  &__link-icon {
    position: relative;
    z-index: 1;
    width: 12px;
    height: 12px;
    color: #a8c4e3;
  }

  &__link-text {
    position: relative;
    z-index: 1;
  }

  &__link-arrow {
    position: relative;
    z-index: 1;
    width: 11px;
    height: 11px;
    color: $color-muted;
    transition:
      transform $transition-fast,
      color $transition-fast;
  }

  &__details-btn {
    @include amber-spot(64px, 72px);
    display: inline-flex;
    align-items: center;
    gap: 0.36rem;
    padding: 0.4rem 0.85rem;
    border-radius: $radius-pill;
    background: linear-gradient(
      135deg,
      rgba(255, 176, 96, 0.16) 0%,
      rgba(168, 196, 227, 0.08) 100%
    );
    border: 1px solid rgba(255, 196, 112, 0.32);
    font-size: 0.72rem;
    font-weight: 600;
    color: $color-ink;
    box-shadow: inset 0 1px 0 rgba(255, 244, 220, 0.2);
    transition:
      color $transition-fast,
      border-color $transition-fast,
      box-shadow $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.35),
        0 4px 16px -2px rgba(255, 176, 96, 0.3);

      .skills-card__details-icon {
        color: $color-interaction;
      }
    }
  }

  &__details-icon {
    position: relative;
    z-index: 1;
    width: 13px;
    height: 13px;
    color: #ffd08a;
    transition: color $transition-fast;
  }
}

// Switching animation between highlighted items
.highlight-switch-enter-active,
.highlight-switch-leave-active {
  transition:
    opacity 280ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.highlight-switch-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

.highlight-switch-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

@media (max-width: 640px) {
  .skills-highlight {
    &__header {
      padding: $space-3;
    }

    &__stepper-arrows {
      display: none;
    }
  }

  .skills-card {
    padding: $space-4;

    &--compact {
      padding: $space-3;
    }

    &__title {
      font-size: 1.1rem;
    }

    &__footer {
      flex-direction: column;
      align-items: stretch;
      gap: $space-3;
    }

    &__links {
      width: 100%;
    }

    &__link-btn {
      flex: 1 1 auto;
      justify-content: center;
    }

    &__details-btn {
      justify-content: center;
      width: 100%;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .skills-card,
  .skills-card__link-arrow,
  .skills-card__details-icon,
  .highlight-switch-enter-active,
  .highlight-switch-leave-active {
    transition: none;
  }
}
</style>
