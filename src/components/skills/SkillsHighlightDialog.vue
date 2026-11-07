<script setup lang="ts">
import { computed, ref } from 'vue'
import { ExternalLink, Workflow, X } from 'lucide-vue-next'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import type { Skill, SkillHighlight, SkillsUiCopy } from '@/data/skills/index'
import { useModalDialog } from '@/composables/useModalDialog'
import SkillsHighlightMedia from './SkillsHighlightMedia.vue'
import SkillsTechnologyList from './SkillsTechnologyList.vue'
import SkillsCodeSnippet from './SkillsCodeSnippet.vue'
import { resolveHighlightLinkIcon } from './highlightLinkIcons'

const props = defineProps<{
  open: boolean
  skill: Skill
  highlight?: SkillHighlight
  ui: SkillsUiCopy
}>()

const emit = defineEmits<{
  close: []
  selectHighlight: [highlight: SkillHighlight]
}>()

const dialogRef = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)
const activeHighlight = computed<SkillHighlight>(() => {
  return props.highlight ?? props.skill.highlight
})

useModalDialog(
  () => props.open,
  dialogRef,
  closeBtnRef,
  () => emit('close'),
)
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="open"
        class="skills-dialog-overlay"
        role="presentation"
        @click.self="emit('close')"
        @wheel.self.prevent
        @touchmove.self.prevent
      >
        <div
          ref="dialogRef"
          class="skills-dialog"
          role="dialog"
          tabindex="-1"
          aria-modal="true"
          :aria-labelledby="`dialog-title-${activeHighlight.key}`"
          @wheel.stop
        >
          <!-- Header Bar with Close Button -->
          <div class="skills-dialog__header">
            <div class="skills-dialog__eyebrows">
              <span class="skills-dialog__kind">{{ activeHighlight.kindLabel }}</span>
              <span v-if="activeHighlight.badge" class="skills-dialog__badge">
                {{ activeHighlight.badge }}
              </span>
            </div>

            <button
              ref="closeBtnRef"
              type="button"
              class="skills-dialog__close-btn"
              :aria-label="ui.closeDetails"
              @pointermove="onSpotMove"
              @click="emit('close')"
            >
              <X class="skills-dialog__close-icon" aria-hidden="true" />
            </button>
          </div>

          <!-- Dialog Body Content -->
          <div class="skills-dialog__content">
            <!-- If the skill has multiple projects, provide quick switch tabs inside dialog -->
            <div v-if="skill.highlights.length > 1" class="skills-dialog__proj-switcher">
              <span class="skills-dialog__switcher-label">
                {{ ui.otherProjectsLabel || 'Projetos relacionados' }}:
              </span>
              <div class="skills-dialog__switcher-pills">
                <button
                  v-for="(hl, idx) in skill.highlights"
                  :key="hl.key"
                  type="button"
                  class="skills-dialog__switcher-btn"
                  :class="{ 'is-active': activeHighlight.key === hl.key }"
                  @pointermove="onSpotMove"
                  @click="emit('selectHighlight', hl)"
                >
                  <span>0{{ idx + 1 }}.</span>
                  <span>{{ hl.title }}</span>
                </button>
              </div>
            </div>

            <!-- Title, Subtitle & Meta -->
            <div class="skills-dialog__titles">
              <h2 :id="`dialog-title-${activeHighlight.key}`" class="skills-dialog__title">
                {{ activeHighlight.title }}
              </h2>
              <p v-if="activeHighlight.subtitle" class="skills-dialog__subtitle">
                {{ activeHighlight.subtitle }}
              </p>
              <span v-if="activeHighlight.meta" class="skills-dialog__meta">
                {{ activeHighlight.meta }}
              </span>
            </div>

            <!-- Media Preview / Workflow -->
            <SkillsHighlightMedia :media="activeHighlight.media" variant="dialog" />

            <!-- Flow Diagram (if structured architecture flow exists) -->
            <div v-if="activeHighlight.flow.length > 0" class="skills-dialog__flow-section">
              <h4 class="skills-dialog__section-heading">
                <Workflow class="skills-dialog__section-icon" aria-hidden="true" />
                <span>{{ ui.flowLabel }}</span>
              </h4>
              <div class="skills-dialog__flow-diagram">
                <template v-for="(node, idx) in activeHighlight.flow" :key="node">
                  <div class="skills-dialog__flow-node">
                    {{ node }}
                  </div>
                  <span
                    v-if="idx < activeHighlight.flow.length - 1"
                    class="skills-dialog__flow-connector"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </template>
              </div>
            </div>

            <!-- Specification Blocks (Problem, Contribution, Context) -->
            <div class="skills-dialog__blocks">
              <div
                v-for="block in activeHighlight.blocks"
                :key="block.label"
                class="skills-dialog__block"
              >
                <h4 class="skills-dialog__block-title">{{ block.label }}</h4>
                <p class="skills-dialog__block-text">{{ block.text }}</p>
              </div>
            </div>

            <!-- Related Technologies Stack -->
            <div v-if="activeHighlight.technologies.length > 0" class="skills-dialog__stack">
              <h4 class="skills-dialog__section-heading">
                {{ ui.relatedSkills }}
              </h4>
              <SkillsTechnologyList
                :technologies="activeHighlight.technologies"
                :active-name="skill.name"
                variant="dialog"
              />
            </div>

            <!-- Production Code Snippet (Live Code) -->
            <SkillsCodeSnippet
              v-if="skill.snippet"
              :snippet="skill.snippet"
              :label="ui.terminalLabel || 'Código em ação'"
            />

            <!-- Full Redirection Links -->
            <div v-if="activeHighlight.links.length > 0" class="skills-dialog__links-section">
              <div class="skills-dialog__links-grid">
                <a
                  v-for="link in activeHighlight.links"
                  :key="link.href"
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="skills-dialog__action-btn"
                  @pointermove="onSpotMove"
                >
                  <component
                    :is="resolveHighlightLinkIcon(link.kind)"
                    class="skills-dialog__action-icon"
                    aria-hidden="true"
                  />
                  <span class="skills-dialog__action-label">{{ link.label }}</span>
                  <ExternalLink class="skills-dialog__action-arrow" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.skills-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp($space-4, 4vw, $space-8);
  background-color: rgba(8, 10, 14, 0.58);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.skills-dialog {
  position: relative;
  width: 100%;
  max-width: 680px;
  max-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  border-radius: $radius-lg;
  background-color: #15181f;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 32px 64px -16px rgba(0, 0, 0, 0.85),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  overflow: hidden;
  overscroll-behavior: contain;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    padding: $space-4 $space-6;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background-color: #181b22;
  }

  &__eyebrows {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__kind {
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #a8c4e3;
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

  &__close-btn {
    @include amber-spot(48px, 56px);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #1e222a;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #c4c8d0;
    transition:
      color $transition-fast,
      border-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
    }
  }

  &__close-icon {
    position: relative;
    z-index: 1;
    width: 15px;
    height: 15px;
  }

  &__content {
    padding: clamp($space-4, 3vw, $space-6);
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__proj-switcher {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    padding-bottom: $space-3;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__switcher-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #9b9fa7;
  }

  &__switcher-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
  }

  &__switcher-btn {
    @include amber-spot(48px, 56px);
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.3rem 0.65rem;
    border-radius: $radius-pill;
    background-color: #1a1e26;
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.7rem;
    line-height: 1.35;
    font-weight: 550;
    color: #b8bcc4;
    transition: color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
    }

    &.is-active {
      color: #fffaf0;
      border-color: rgba(255, 176, 96, 0.45);
      background-color: rgba(255, 176, 96, 0.12);
    }
  }

  &__titles {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 650;
    letter-spacing: -0.03em;
    line-height: 1.2;
    color: $color-ink;
  }

  &__subtitle {
    font-size: 0.92rem;
    color: #a8c4e3;
    line-height: 1.45;
  }

  &__meta {
    font-size: 0.74rem;
    color: $color-muted;
  }

  &__section-heading {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.76rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #a8c4e3;
    margin-bottom: $space-2;
  }

  &__section-icon {
    width: 13px;
    height: 13px;
    color: #ffb060;
  }

  &__flow-diagram {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    padding: $space-3;
    border-radius: $radius-md;
    background-color: #0f1217;
    border: 1px solid rgba(255, 255, 255, 0.07);
  }

  &__flow-node {
    padding: 0.3rem 0.6rem;
    border-radius: $radius-sm;
    background: rgba(255, 176, 96, 0.12);
    border: 1px solid rgba(255, 176, 96, 0.28);
    font-size: 0.72rem;
    font-weight: 600;
    color: #ffe8cc;
  }

  &__flow-connector {
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.8rem;
  }

  &__blocks {
    display: flex;
    flex-direction: column;
    gap: $space-4;
  }

  &__block {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: $space-3;
    border-radius: $radius-md;
    background-color: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  &__block-title {
    font-size: 0.76rem;
    font-weight: 650;
    color: #ffca8a;
  }

  &__block-text {
    font-size: 0.82rem;
    line-height: 1.65;
    color: #c8cbd2;
  }

  &__links-grid {
    display: flex;
    flex-wrap: wrap;
    gap: $space-3;
    padding-top: $space-3;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__action-btn {
    @include amber-spot(80px, 92px);
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.55rem 1rem;
    border-radius: $radius-pill;
    background: linear-gradient(
      135deg,
      rgba(255, 176, 96, 0.16) 0%,
      rgba(168, 196, 227, 0.08) 100%
    );
    border: 1px solid rgba(255, 196, 112, 0.35);
    font-size: 0.76rem;
    font-weight: 600;
    color: #fffaf0;
    box-shadow: inset 0 1px 0 rgba(255, 244, 220, 0.25);
    transition:
      border-color $transition-fast,
      transform $transition-fast,
      box-shadow $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      border-color: $color-interaction-border;
      transform: translateY(-1px);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        0 6px 20px -4px rgba(255, 176, 96, 0.35);

      .skills-dialog__action-arrow {
        transform: translate(2px, -2px);
        color: $color-interaction;
      }
    }
  }

  &__action-icon {
    position: relative;
    z-index: 1;
    width: 14px;
    height: 14px;
    color: #ffb060;
  }

  &__action-label {
    position: relative;
    z-index: 1;
  }

  &__action-arrow {
    position: relative;
    z-index: 1;
    width: 13px;
    height: 13px;
    color: #a8c4e3;
    transition:
      transform $transition-fast,
      color $transition-fast;
  }
}

// Dialog Transitions
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 240ms ease;

  .skills-dialog {
    transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
  }
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;

  .skills-dialog {
    transform: scale(0.95) translateY(12px);
  }
}

@media (max-width: 640px) {
  .skills-dialog {
    max-height: calc(100vh - 2rem);

    &__action-btn {
      width: 100%;
      justify-content: center;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .skills-dialog-overlay,
  .skills-dialog,
  .skills-dialog__action-btn,
  .skills-dialog__action-arrow,
  .dialog-fade-enter-active,
  .dialog-fade-leave-active {
    transition: none;
  }
}
</style>
