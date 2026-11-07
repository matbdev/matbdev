<script setup lang="ts">
import { computed } from 'vue'
import { FileCode } from 'lucide-vue-next'
import type { SkillSnippet } from '@/data/skills/types'
import { highlightCode } from './highlightCode'

const props = defineProps<{ snippet: SkillSnippet; label: string }>()
const highlightedCode = computed(() => highlightCode(props.snippet.code))
</script>

<template>
  <div class="skills-dialog__snippet-section">
    <h4 class="skills-dialog__section-heading">
      <FileCode class="skills-dialog__section-icon" aria-hidden="true" />
      <span>{{ label }}</span>
      <span class="skills-dialog__snippet-badge">{{ snippet.language }}</span>
    </h4>

    <div class="skills-dialog__terminal">
      <div class="skills-dialog__terminal-bar">
        <div class="skills-dialog__terminal-dots" aria-hidden="true">
          <span class="skills-dialog__dot skills-dialog__dot--red" />
          <span class="skills-dialog__dot skills-dialog__dot--amber" />
          <span class="skills-dialog__dot skills-dialog__dot--green" />
        </div>
        <span class="skills-dialog__terminal-file">{{ snippet.file }}</span>
      </div>
      <pre class="skills-dialog__code"><code v-html="highlightedCode" /></pre>
    </div>
  </div>
</template>

<style scoped lang="scss">
.skills-dialog {
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

  &__snippet-section {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__snippet-badge {
    margin-left: auto;
    font-size: 0.6rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 0.15rem 0.45rem;
    border-radius: $radius-pill;
    color: #ffd9a0;
    background: rgba(255, 176, 96, 0.12);
    border: 1px solid rgba(255, 176, 96, 0.25);
  }

  &__terminal {
    display: flex;
    flex-direction: column;
    border-radius: $radius-md;
    background: #0d0f14;
    border: 1px solid rgba(255, 255, 255, 0.09);
    box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }

  &__terminal-bar {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.4rem 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__terminal-dots {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    opacity: 0.7;

    &--red {
      background-color: #ef4444;
    }
    &--amber {
      background-color: #f59e0b;
    }
    &--green {
      background-color: #10b981;
    }
  }

  &__terminal-file {
    font-family: monospace;
    font-size: 0.68rem;
    color: #cfd3da;
  }

  &__code {
    margin: 0;
    padding: 0.75rem 0.9rem;
    font-family: 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace;
    font-size: 0.72rem;
    line-height: 1.55;
    color: #e5e7eb;
    white-space: pre;
    overflow-x: auto;

    :deep(.tok-kw) {
      color: #ffb060;
      font-weight: 600;
    }

    :deep(.tok-str) {
      color: #ffd9a0;
    }

    :deep(.tok-decorator) {
      color: #a8c4e3;
    }

    :deep(.tok-comment) {
      color: #717784;
      font-style: italic;
    }

    :deep(.tok-num) {
      color: #93c5fd;
    }
  }
}
</style>
