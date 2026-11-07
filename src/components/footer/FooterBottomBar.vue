<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp } from 'lucide-vue-next'
import contactData from '@/data/contact.json'
import { heroProfile } from '@/data/heroProfile'
import { isPt } from '@/state/locale'

const currentYear = new Date().getFullYear()

const backToTopLabel = computed(() => {
  const ui = contactData.contact.ui.content
  return isPt.value ? ui['pt-BR'].backToTop : ui.en.backToTop
})

function scrollToTop() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
}
</script>

<template>
  <div class="footer-bar">
    <p class="footer-bar__copyright">
      © {{ currentYear }} {{ heroProfile.fullName }}
      <span class="footer-bar__handle">@{{ heroProfile.handle }}</span>
    </p>

    <button type="button" class="footer-bar__top-btn" @click="scrollToTop">
      <span class="footer-bar__top-label">
        {{ backToTopLabel }}
      </span>
      <ArrowUp class="footer-bar__top-icon" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped lang="scss">
.footer-bar {
  padding-top: $space-5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $space-4;

  &__copyright {
    font-size: 0.72rem;
    color: #c8cbd2;
    font-weight: 500;
  }

  &__handle {
    margin-left: 0.35rem;
    color: #ffb060;
    font-weight: 600;
  }

  &__top-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.38rem;
    padding: 0.42rem 0.85rem;
    border-radius: $radius-pill;
    background-color: #14171c;
    border: 1px solid rgba(255, 255, 255, 0.09);
    font-size: 0.7rem;
    font-weight: 600;
    color: $color-ink;
    transition: color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;

      .footer-bar__top-icon {
        transform: translateY(-2px);
        color: $color-interaction;
      }
    }
  }

  &__top-label,
  &__top-icon {
    position: relative;
    z-index: 1;
  }

  &__top-icon {
    width: 13px;
    height: 13px;
    color: $color-muted;
    transition:
      transform $transition-fast,
      color $transition-fast;
  }

  @media (max-width: 480px) {
    padding-top: $space-4;
    gap: $space-3;

    &__top-btn {
      min-height: 36px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__top-icon {
      transition: none;
    }
  }
}
</style>
