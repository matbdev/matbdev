<script setup lang="ts">
import { ref } from 'vue'
import type { MenuOptionsProps } from './types'

defineProps<{
  menuOptions: MenuOptionsProps[]
}>()

const menuWrapRef = ref<HTMLElement | null>(null)

const lensState = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  visible: false,
  gliding: false,
})

function onOptionHover(option: MenuOptionsProps, event: Event) {
  if (option.highlighted) {
    hideLens()
    return
  }

  const target = event.currentTarget as HTMLElement
  const wrap = menuWrapRef.value
  if (!target || !wrap) return

  const wrapRect = wrap.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const wasVisible = lensState.value.visible

  lensState.value = {
    x: targetRect.left - wrapRect.left + wrap.scrollLeft,
    y: targetRect.top - wrapRect.top,
    width: targetRect.width,
    height: targetRect.height,
    visible: true,
    gliding: wasVisible,
  }
}

function hideLens() {
  lensState.value.visible = false
  lensState.value.gliding = false
}

defineExpose({
  hideLens,
})
</script>

<template>
  <div ref="menuWrapRef" class="header-menu" @scroll.passive="hideLens">
    <!-- Lente Menisco Deslizante (Floating Liquid Droplet) -->
    <span
      class="header-menu__lens"
      :class="{
        'is-visible': lensState.visible,
        'is-gliding': lensState.gliding,
      }"
      :style="{
        transform: `translate3d(${lensState.x}px, ${lensState.y}px, 0)`,
        width: `${lensState.width}px`,
        height: `${lensState.height}px`,
      }"
      aria-hidden="true"
    />

    <ul class="header-menu__options">
      <li
        v-for="option in menuOptions"
        :key="option.href"
        :class="['header-menu__option', { 'header-menu__option--highlighted': option.highlighted }]"
      >
        <a
          :href="option.href"
          @mouseenter="onOptionHover(option, $event)"
          @focus="onOptionHover(option, $event)"
          @blur="hideLens"
        >
          <span>{{ option.label }}</span>
          <component
            v-if="option.icon"
            :is="option.icon"
            class="header-menu__icon"
            aria-hidden="true"
          />
        </a>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.header-menu {
  position: relative;
  min-width: 0;
  flex: 1 1 auto;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  // Gota/Menisco Óptico Deslizante
  &__lens {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    pointer-events: none;
    border-radius: $radius-pill;
    opacity: 0;
    scale: 0.94;

    background:
      radial-gradient(120% 100% at 50% 0%, rgba(255, 196, 112, 0.17) 0%, transparent 68%),
      linear-gradient(
        165deg,
        rgba(255, 255, 255, 0.09) 0%,
        rgba(255, 176, 96, 0.06) 65%,
        rgba(255, 255, 255, 0.02) 100%
      );
    box-shadow:
      inset 0 1px 0 0 rgba(255, 196, 112, 0.34),
      inset 0 -1px 0 0 rgba(255, 176, 96, 0.14),
      inset 1px 0 0 0 rgba(255, 255, 255, 0.08),
      inset -1px 0 0 0 rgba(255, 255, 255, 0.08),
      0 6px 16px -4px rgba(0, 0, 0, 0.38);

    transition:
      opacity $transition-fast,
      scale 260ms cubic-bezier(0.16, 1, 0.3, 1);

    &.is-gliding {
      transition:
        transform 400ms cubic-bezier(0.22, 1, 0.36, 1),
        width 400ms cubic-bezier(0.22, 1, 0.36, 1),
        height 400ms cubic-bezier(0.22, 1, 0.36, 1),
        opacity $transition-fast,
        scale 260ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    &.is-visible {
      opacity: 1;
      scale: 1;
    }
  }

  &__options {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.25rem;
    width: max-content;
  }

  &__option {
    a {
      position: relative;
      z-index: 1;
      display: inline-flex;
      align-items: center;
      gap: $space-1;
      padding: 0.5rem 0.9rem;
      border-radius: $radius-pill;
      color: $color-text;
      font-size: $text-xs;
      font-weight: 500;
      letter-spacing: 0.01em;
      white-space: nowrap;
      text-decoration: none;
      transition:
        color $transition-fast,
        border-color $transition-fast,
        background $transition-fast,
        box-shadow $transition-fast;

      &:hover:not(:disabled),
      &:focus-visible {
        color: $color-interaction;
      }
    }

    // Cápsula CTA com assinatura frost-blue do sistema Darkroom
    &--highlighted {
      margin-left: $space-2;

      a {
        color: $color-ink;
        font-weight: 600;
        padding: 0.5rem 1rem;
        border: 1px solid rgba(168, 196, 227, 0.22);
        background: linear-gradient(
          135deg,
          rgba(238, 236, 230, 0.11) 0%,
          rgba(168, 196, 227, 0.07) 100%
        );
        box-shadow:
          inset 0 1px 0 0 rgba(238, 236, 230, 0.24),
          0 2px 10px -2px rgba(0, 0, 0, 0.3);

        &:hover:not(:disabled),
        &:focus-visible {
          border-color: $color-interaction-border;
          background: linear-gradient(
            135deg,
            rgba(255, 176, 96, 0.24) 0%,
            rgba(238, 236, 230, 0.1) 100%
          );
          box-shadow:
            inset 0 1px 0 0 rgba(255, 255, 255, 0.38),
            0 6px 20px -4px rgba(255, 176, 96, 0.28);

          .header-menu__icon {
            transform: translate(2px, -2px);
            color: $color-interaction;
          }
        }
      }
    }
  }

  &__icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    transition:
      transform $transition-fast,
      color $transition-fast;
  }

  @media (max-width: 768px) {
    &__options {
      gap: 0.15rem;
    }

    &__option a {
      padding: 0.42rem 0.68rem;
      font-size: 0.72rem;
    }

    &__option--highlighted {
      margin-left: $space-1;

      a {
        padding: 0.42rem 0.8rem;
      }
    }
  }

  @media (max-width: 480px) {
    &__option a {
      padding: 0.38rem 0.56rem;
      font-size: 0.68rem;
    }

    &__option--highlighted a {
      padding: 0.38rem 0.68rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__lens,
    &__option a,
    &__icon {
      transition: none;
    }
  }
}
</style>
