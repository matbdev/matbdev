<script setup lang="ts">
import { computed, ref } from 'vue'
import { Code2, Layers } from 'lucide-vue-next'
import { heroProfile, type DisciplineFocus, type FocusContent } from '@/data/heroProfile'
import { isPt } from '@/state/locale'

const activeFocus = ref<DisciplineFocus>('overview')
const currentFocus = computed<FocusContent>(() => heroProfile.focusContent[activeFocus.value])

function toggleDiscipline(target: Exclude<DisciplineFocus, 'overview'>) {
  activeFocus.value = activeFocus.value === target ? 'overview' : target
}

function onPillPointerMove(event: PointerEvent) {
  if (event.pointerType === 'touch') return
  const target = event.currentTarget as HTMLElement | null
  if (!target) return
  const rect = target.getBoundingClientRect()
  target.style.setProperty('--mx', `${(event.clientX - rect.left).toFixed(1)}px`)
  target.style.setProperty('--my', `${(event.clientY - rect.top).toFixed(1)}px`)
}
</script>

<template>
  <div class="focus-console">
    <div
      class="focus-console__switch"
      role="group"
      :aria-label="isPt ? 'Explorar foco profissional' : 'Explore a professional focus'"
    >
      <button
        type="button"
        class="focus-console__btn"
        :aria-pressed="activeFocus === 'data'"
        @pointermove="onPillPointerMove"
        @click="toggleDiscipline('data')"
      >
        <Layers class="focus-console__icon" aria-hidden="true" />
        <span class="focus-console__btn-label">{{ isPt ? 'Dados' : 'Data' }}</span>
      </button>
      <button
        type="button"
        class="focus-console__btn"
        :aria-pressed="activeFocus === 'software'"
        @pointermove="onPillPointerMove"
        @click="toggleDiscipline('software')"
      >
        <Code2 class="focus-console__icon" aria-hidden="true" />
        <span class="focus-console__btn-label">Software</span>
      </button>
    </div>

    <div class="focus-console__body" aria-live="polite" aria-atomic="true">
      <h2 class="focus-console__title">{{ currentFocus.title }}</h2>
      <p class="focus-console__desc">{{ currentFocus.description }}</p>

      <ul
        class="focus-console__tags"
        :aria-label="isPt ? 'Tecnologias principais' : 'Key technologies'"
      >
        <li v-for="tech in currentFocus.stack" :key="tech" @pointermove="onPillPointerMove">
          <span class="focus-console__tag-label">{{ tech }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.focus-console {
  padding: $space-3;
  border-radius: $radius-md;
  background: rgba(14, 16, 20, 0.42);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: inset 0 1px 0 rgba(238, 236, 230, 0.06);

  &__switch {
    display: flex;
    gap: $space-2;
  }

  &__btn {
    position: relative;
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.38rem;
    padding: 0.42rem 0.6rem;
    border-radius: $radius-pill;
    font-size: 0.7rem;
    font-weight: 500;
    color: #b9bec6;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.025);
    transition:
      color $transition-fast,
      background $transition-fast,
      border-color $transition-fast,
      box-shadow $transition-fast;

    // Foco âmbar/laranja localizado apenas sob o ponteiro do mouse
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      opacity: 0;
      background: radial-gradient(
        62px circle at var(--mx, 50%) var(--my, 50%),
        rgba(255, 176, 96, 0.3) 0%,
        rgba(255, 196, 112, 0.1) 54%,
        transparent 100%
      );
      transition: opacity 180ms ease;
    }

    &::after {
      content: '';
      position: absolute;
      inset: -1px;
      padding: 1px;
      border-radius: inherit;
      pointer-events: none;
      opacity: 0;
      background: radial-gradient(
        68px circle at var(--mx, 50%) var(--my, 50%),
        rgba(255, 220, 152, 0.88) 0%,
        rgba(255, 176, 96, 0.4) 52%,
        transparent 100%
      );
      -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      mask-composite: exclude;
      transition: opacity 180ms ease;
    }

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;

      &::before,
      &::after {
        opacity: 1;
      }
    }

    &[aria-pressed='true'] {
      color: $color-ink;
      border-color: rgba(255, 212, 136, 0.34);
      background: linear-gradient(
        135deg,
        rgba(255, 196, 112, 0.22) 0%,
        rgba(255, 176, 96, 0.1) 58%,
        rgba(168, 196, 227, 0.08) 100%
      );
      box-shadow:
        inset 0 1px 0 rgba(255, 246, 216, 0.3),
        0 4px 14px -4px rgba(255, 176, 96, 0.2);

      .focus-console__icon {
        color: #ffb060;
      }
    }
  }

  &__btn-label,
  &__icon {
    position: relative;
    z-index: 1;
  }

  &__icon {
    width: 13px;
    height: 13px;
    transition: color $transition-fast;
  }

  &__body {
    margin-top: $space-3;
  }

  &__title {
    font-size: 0.82rem;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
    color: $color-ink;
  }

  &__desc {
    margin-top: $space-1;
    font-size: 0.7rem;
    line-height: 1.55;
    color: $color-dark-muted;
  }

  &__tags {
    margin-top: $space-3;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;

    li {
      position: relative;
      padding: 0.16rem 0.5rem;
      border-radius: $radius-pill;
      font-size: 0.62rem;
      color: #dbe4ef;
      background: rgba(255, 255, 255, 0.045);
      border: 1px solid rgba(255, 255, 255, 0.1);
      cursor: default;
      transition: color $transition-fast;

      // Brilho laranja/âmbar concentrado apenas onde o mouse passa
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        opacity: 0;
        background: radial-gradient(
          36px circle at var(--mx, 50%) var(--my, 50%),
          rgba(255, 176, 96, 0.36) 0%,
          rgba(255, 196, 112, 0.13) 50%,
          transparent 100%
        );
        transition: opacity 160ms ease;
      }

      &::after {
        content: '';
        position: absolute;
        inset: -1px;
        padding: 1px;
        border-radius: inherit;
        pointer-events: none;
        opacity: 0;
        background: radial-gradient(
          42px circle at var(--mx, 50%) var(--my, 50%),
          rgba(255, 220, 152, 0.92) 0%,
          rgba(255, 176, 96, 0.44) 52%,
          transparent 100%
        );
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        mask-composite: exclude;
        transition: opacity 160ms ease;
      }

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        color: $color-interaction;

        &::before,
        &::after {
          opacity: 1;
        }
      }
    }
  }

  &__tag-label {
    position: relative;
    z-index: 1;
  }
}
</style>
