<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRef, watch } from 'vue'
import {
  Award,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Database,
  Globe,
  Layers,
  Server,
} from 'lucide-vue-next'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import type { Skill, SkillCategory, SkillsUiCopy } from '@/data/skills/index'
import SkillIcon from './SkillIcon.vue'
import { useArcCarousel } from './useArcCarousel'

const props = defineProps<{
  skills: readonly Skill[]
  categories: readonly SkillCategory[]
  activeCategory: string
  selectedIndex: number
  ui: SkillsUiCopy
}>()

const emit = defineEmits<{
  select: [index: number]
  selectCategory: [categoryId: string]
}>()

const stageRef = ref<HTMLElement | null>(null)
const mobileRailRef = ref<HTMLElement | null>(null)

const {
  visibleSlots,
  svgPaths,
  isDragging,
  goToIndex,
  stepBy,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onKeyDown,
} = useArcCarousel(toRef(props, 'skills'), stageRef, toRef(props, 'selectedIndex'), (nextIndex) =>
  emit('select', nextIndex),
)

const activeSkill = computed(() => props.skills[props.selectedIndex])

const formattedPosition = computed(() => {
  if (props.skills.length === 0) return '00 / 00'
  const current = String(props.selectedIndex + 1).padStart(2, '0')
  const total = String(props.skills.length).padStart(2, '0')
  return `${current} / ${total}`
})

function resolveCategoryIcon(categoryId: string) {
  switch (categoryId) {
    case 'data':
      return Database
    case 'system':
      return Server
    case 'web':
      return Globe
    case 'certifications':
      return Award
    case 'all':
    default:
      return Layers
  }
}

function handleMobileSelect(index: number) {
  emit('select', index)
  scrollToActivePill(index)
}

function scrollToActivePill(index: number) {
  void nextTick(() => {
    const rail = mobileRailRef.value
    if (!rail) return
    const pills = rail.querySelectorAll<HTMLElement>('.skills-arc__mobile-pill')
    const pill = pills[index]
    if (pill) {
      const targetLeft = pill.offsetLeft - rail.clientWidth / 2 + pill.clientWidth / 2
      rail.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' })
    }
  })
}

watch(
  () => props.selectedIndex,
  (newIdx) => {
    scrollToActivePill(newIdx)
  },
)

onMounted(() => {
  scrollToActivePill(props.selectedIndex)
})
</script>

<template>
  <div class="skills-arc">
    <!-- Category filter pills (Todas, Dados & IA, Sistemas & Backend, Web & Portais) -->
    <div
      v-if="categories.length > 0"
      class="skills-arc__categories"
      role="group"
      :aria-label="ui.categoriesLabel || 'Categorias'"
    >
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        class="skills-arc__category-btn"
        :class="{ 'is-active': activeCategory === cat.id }"
        :aria-pressed="activeCategory === cat.id"
        @pointermove="onSpotMove"
        @click="emit('selectCategory', cat.id)"
      >
        <component
          :is="resolveCategoryIcon(cat.id)"
          class="skills-arc__category-icon"
          aria-hidden="true"
        />
        <span class="skills-arc__category-label">{{ cat.label }}</span>
      </button>
    </div>

    <!-- Desktop View (>= 860px): Free-floating Unboxed 'C' Orbital Arc -->
    <div
      ref="stageRef"
      class="skills-arc__stage"
      :class="{ 'is-dragging': isDragging }"
      role="listbox"
      tabindex="0"
      :aria-label="ui.carouselLabel"
      :aria-activedescendant="activeSkill ? `skill-arc-option-${activeSkill.id}` : undefined"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @keydown="onKeyDown"
    >
      <!-- Sculptural 'C' SVG Track & Focal Beacon -->
      <svg
        class="skills-arc__svg"
        :viewBox="`0 0 ${svgPaths.width} ${svgPaths.height}`"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="skills-c-rail-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#a8c4e3" stop-opacity="0" />
            <stop offset="22%" stop-color="#a8c4e3" stop-opacity="0.25" />
            <stop offset="50%" stop-color="#ffb060" stop-opacity="0.85" />
            <stop offset="78%" stop-color="#a8c4e3" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#a8c4e3" stop-opacity="0" />
          </linearGradient>

          <linearGradient id="skills-c-outer-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#eeece6" stop-opacity="0" />
            <stop offset="50%" stop-color="#eeece6" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#eeece6" stop-opacity="0" />
          </linearGradient>

          <linearGradient id="skills-c-focal-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ffb060" stop-opacity="0" />
            <stop offset="50%" stop-color="#ffd9a0" stop-opacity="0.95" />
            <stop offset="100%" stop-color="#ffb060" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Outer architectural dashed reference arc -->
        <path
          :d="svgPaths.outerArc"
          stroke="url(#skills-c-outer-grad)"
          stroke-width="1"
          stroke-dasharray="3 6"
        />

        <!-- Primary 'C' orbital curve -->
        <path
          :d="svgPaths.mainArc"
          stroke="url(#skills-c-rail-grad)"
          stroke-width="1.5"
          stroke-linecap="round"
        />

        <!-- Illuminated focal arc segment around center -->
        <path
          :d="svgPaths.focalArc"
          stroke="url(#skills-c-focal-grad)"
          stroke-width="2.5"
          stroke-linecap="round"
        />

        <!-- Optical horizontal connector pointing toward the featured highlight on the left -->
        <line
          x1="0"
          :y1="svgPaths.centerY"
          :x2="Math.max(0, svgPaths.apexX - 8)"
          :y2="svgPaths.centerY"
          stroke="#ffb060"
          stroke-opacity="0.55"
          stroke-width="1.25"
          stroke-linecap="round"
        />

        <!-- Focal apex ring on the 'C' equator -->
        <circle
          :cx="svgPaths.apexX"
          :cy="svgPaths.centerY"
          r="12"
          stroke="#ffb060"
          stroke-opacity="0.36"
          stroke-width="1"
        />
      </svg>

      <!-- Skill Slots orbiting along the 'C' curve -->
      <button
        v-for="slot in visibleSlots"
        :id="`skill-arc-option-${slot.item.id}`"
        :key="slot.item.id"
        type="button"
        role="option"
        class="skills-arc__slot"
        :class="[
          `skills-arc__slot--${slot.item.context.id}`,
          {
            'is-focused': slot.focusProgress > 0.62,
            'is-selected': slot.isSelected,
          },
        ]"
        :aria-selected="slot.isSelected"
        :tabindex="-1"
        :style="{
          transform: `translate3d(${slot.x.toFixed(2)}px, calc(-50% + ${slot.y.toFixed(2)}px), 0) scale(${slot.scale.toFixed(3)})`,
          opacity: slot.opacity.toFixed(3),
          zIndex: slot.zIndex,
          '--focus': slot.focusProgress.toFixed(3),
        }"
        @pointermove="onSpotMove"
        @click="goToIndex(slot.index)"
      >
        <!-- Orbital Node with Official Tool Icon -->
        <span class="skills-arc__node" aria-hidden="true">
          <SkillIcon
            :name="slot.item.id"
            :size="slot.focusProgress > 0.6 ? 16 : 13"
            class="skills-arc__node-icon"
          />
        </span>

        <span class="skills-arc__pill">
          <span class="skills-arc__name">{{ slot.item.name }}</span>
          <span v-if="slot.focusProgress > 0.5" class="skills-arc__context-tag">
            {{ slot.item.context.label }}
          </span>
        </span>
      </button>
    </div>

    <!-- Mobile / Compact View (< 860px): Horizontal Fluid Tool Dial -->
    <div class="skills-arc__mobile-view">
      <div ref="mobileRailRef" class="skills-arc__mobile-rail">
        <button
          v-for="(skill, idx) in skills"
          :key="skill.id"
          type="button"
          class="skills-arc__mobile-pill"
          :class="{ 'is-selected': selectedIndex === idx }"
          @click="handleMobileSelect(idx)"
        >
          <SkillIcon :name="skill.id" :size="16" class="skills-arc__mobile-icon" />
          <span class="skills-arc__mobile-name">{{ skill.name }}</span>
        </button>
      </div>
    </div>

    <!-- Controls Bar: Stepper & Interaction Hint -->
    <div class="skills-arc__controls">
      <div class="skills-arc__stepper">
        <button
          type="button"
          class="skills-arc__step-btn skills-arc__step-btn--desktop"
          :aria-label="ui.previousSkill"
          @pointermove="onSpotMove"
          @click="stepBy(-1)"
        >
          <ChevronUp class="skills-arc__step-icon" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="skills-arc__step-btn skills-arc__step-btn--mobile"
          :aria-label="ui.previousSkill"
          @click="stepBy(-1)"
        >
          <ChevronLeft class="skills-arc__step-icon" aria-hidden="true" />
        </button>

        <span class="skills-arc__counter" aria-live="off">{{ formattedPosition }}</span>

        <button
          type="button"
          class="skills-arc__step-btn skills-arc__step-btn--desktop"
          :aria-label="ui.nextSkill"
          @pointermove="onSpotMove"
          @click="stepBy(1)"
        >
          <ChevronDown class="skills-arc__step-icon" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="skills-arc__step-btn skills-arc__step-btn--mobile"
          :aria-label="ui.nextSkill"
          @click="stepBy(1)"
        >
          <ChevronRight class="skills-arc__step-icon" aria-hidden="true" />
        </button>
      </div>

      <p class="skills-arc__hint">{{ ui.interactionHint }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.skills-arc {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: $space-3;
  min-width: 0;

  &__categories {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    gap: 0.35rem;
    padding-bottom: 2px;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__category-btn {
    @include amber-spot(64px, 72px);
    display: inline-flex;
    align-items: center;
    gap: 0.36rem;
    padding: 0.36rem 0.68rem;
    border-radius: $radius-pill;
    background-color: #15181e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.69rem;
    font-weight: 550;
    color: #b4b9c2;
    flex-shrink: 0;
    white-space: nowrap;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast,
      box-shadow $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
    }

    &.is-active {
      color: $color-ink;
      border-color: rgba(255, 204, 132, 0.36);
      background: linear-gradient(
        135deg,
        rgba(255, 176, 96, 0.16) 0%,
        rgba(168, 196, 227, 0.07) 100%
      );
      box-shadow: inset 0 1px 0 rgba(255, 240, 210, 0.22);

      .skills-arc__category-icon {
        color: #ffb060;
      }
    }
  }

  &__category-icon,
  &__category-label {
    position: relative;
    z-index: 1;
  }

  &__category-icon {
    width: 12.5px;
    height: 12.5px;
    flex-shrink: 0;
    transition: color $transition-fast;
  }

  // Desktop 'C' Stage: Unboxed, free-floating optical space
  &__stage {
    position: relative;
    width: 100%;
    height: 440px;
    user-select: none;
    touch-action: none;
    cursor: grab;
    // Let the focal aura and selected-item shadows fade beyond the stage.
    overflow: visible;
    background: transparent;
    border: none;
    box-shadow: none;

    // Soft atmospheric aura behind the C curve apex
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 180px;
      height: 320px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(
        ellipse at 0% 50%,
        rgba(255, 176, 96, 0.09) 0%,
        rgba(168, 196, 227, 0.03) 50%,
        transparent 75%
      );
      filter: blur(24px);
    }

    &.is-dragging {
      cursor: grabbing;
    }

    &:focus-visible {
      outline: 2px solid $color-focus;
      outline-offset: 4px;
    }
  }

  &__svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  &__slot {
    position: absolute;
    left: 0;
    top: 50%;
    transform-origin: 0px 50%;
    margin-left: -10px;
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.2rem 0.2rem 0.2rem 0;
    background: none;
    border: 0;
    text-align: left;
    will-change: transform, opacity;

    &.is-focused .skills-arc__pill {
      padding: 0.54rem 1.05rem;
      color: $color-ink;
      border-color: rgba(255, 212, 138, 0.44);
      background:
        linear-gradient(
          135deg,
          rgba(255, 196, 112, 0.2) 0%,
          rgba(238, 236, 230, 0.07) 48%,
          rgba(168, 196, 227, 0.1) 100%
        ),
        rgba(22, 26, 33, 0.96);
      box-shadow:
        0 14px 32px -12px rgba(0, 0, 0, 0.72),
        0 0 24px -6px rgba(255, 176, 96, 0.24),
        inset 0 1px 0 rgba(255, 244, 218, 0.34);
    }

    &.is-focused .skills-arc__name {
      font-size: 0.96rem;
      font-weight: 650;
      letter-spacing: -0.02em;
      color: #fffaf2;
    }

    &:hover:not(:disabled),
    &:focus-visible {
      .skills-arc__pill {
        color: $color-interaction;
        border-color: $color-interaction-border;
        background: $color-interaction-soft;
      }

      .skills-arc__name {
        color: $color-interaction;
      }

      .skills-arc__node {
        border-color: $color-interaction;
      }
    }
  }

  &__node {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #14171d;
    border: 1.5px solid rgba(168, 196, 227, 0.35);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    transition:
      border-color $transition-fast,
      transform $transition-fast,
      box-shadow $transition-fast;

    .is-focused & {
      border-color: #ffd08a;
      transform: scale(1.15);
      box-shadow: 0 0 14px rgba(255, 176, 96, 0.7);
    }
  }

  &__node-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__pill {
    @include amber-spot(78px, 88px);
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
    padding: 0.42rem 0.86rem;
    border-radius: $radius-pill;
    background-color: rgba(22, 25, 32, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.4);
    transition:
      padding $transition-fast,
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast,
      box-shadow $transition-fast;
  }

  &__name,
  &__context-tag {
    position: relative;
    z-index: 1;
    white-space: nowrap;
  }

  &__name {
    font-size: 0.84rem;
    font-weight: 540;
    line-height: 1.2;
    color: #cfd3da;
    transition:
      font-size $transition-fast,
      color $transition-fast;
  }

  &__context-tag {
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #ffca8a;
    line-height: 1.15;
  }

  // Mobile Horizontal Rail (< 960px)
  &__mobile-view {
    display: none;
    width: 100%;
    padding: $space-1 0;
  }

  &__mobile-rail {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    touch-action: pan-y;
    padding: 0.25rem 0 0.5rem 0;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__mobile-pill {
    scroll-snap-align: start;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.48rem 0.88rem;
    min-height: 38px;
    border-radius: $radius-pill;
    background-color: #15181f;
    border: 1px solid rgba(255, 255, 255, 0.09);
    font-size: 0.8rem;
    font-weight: 500;
    color: #c4c8d0;
    cursor: pointer;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast,
      box-shadow $transition-fast,
      transform $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
      background: $color-interaction-soft;
    }

    &:active {
      transform: scale(0.97);
    }

    &.is-selected {
      color: #fffaf0;
      border-color: rgba(255, 176, 96, 0.5);
      background: linear-gradient(
        135deg,
        rgba(255, 176, 96, 0.18) 0%,
        rgba(168, 196, 227, 0.08) 100%
      );
      box-shadow:
        0 4px 16px -4px rgba(255, 176, 96, 0.25),
        inset 0 1px 0 rgba(255, 246, 226, 0.25);
      font-weight: 650;
    }
  }

  &__mobile-icon {
    flex-shrink: 0;
  }

  &__mobile-name {
    white-space: nowrap;
  }

  &__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
  }

  &__stepper {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.24rem;
    border-radius: $radius-pill;
    background-color: #14171c;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__step-btn {
    @include amber-spot(40px, 46px);
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #1a1e25;
    border: 1px solid rgba(255, 255, 255, 0.07);
    color: #c8ccd4;
    transition: color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
    }

    &--mobile {
      display: none;
    }
  }

  &__step-icon {
    position: relative;
    z-index: 1;
    width: 14px;
    height: 14px;
  }

  &__counter {
    padding: 0 0.35rem;
    font-size: 0.7rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: $color-muted;
  }

  &__hint {
    font-size: 0.7rem;
    color: $color-muted;
    line-height: 1.4;
  }

  // Responsive Breakpoint: <= 960px activates Mobile View
  @media (max-width: 960px) {
    &__stage {
      display: none;
    }

    &__mobile-view {
      display: block;
    }

    &__controls {
      justify-content: flex-start;
    }

    &__hint {
      display: none;
    }

    &__step-btn--desktop {
      display: none;
    }

    &__step-btn--mobile {
      display: inline-flex;
    }

    &__category-btn {
      padding: 0.38rem 0.68rem;
      font-size: 0.72rem;
      min-height: 32px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__category-btn,
    &__category-btn::before,
    &__category-btn::after,
    &__node,
    &__pill,
    &__pill::before,
    &__pill::after,
    &__name,
    &__step-btn,
    &__step-btn::before,
    &__step-btn::after,
    &__mobile-pill {
      transition: none;
    }
  }
}
</style>
