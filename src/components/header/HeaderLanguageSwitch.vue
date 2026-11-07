<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Check, ChevronDown, Globe } from 'lucide-vue-next'
import { localePath } from '@/data/seo'
import { AVAILABLE_LOCALES, currentLocale, isPt, setLocale, type Locale } from '@/state/locale'

const langDropdownRef = ref<HTMLElement | null>(null)
const isLangOpen = ref(false)

function toggleLangDropdown() {
  isLangOpen.value = !isLangOpen.value
}

function chooseLocale(code: Locale) {
  setLocale(code)
  isLangOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (langDropdownRef.value && !langDropdownRef.value.contains(event.target as Node)) {
    isLangOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="langDropdownRef" class="header-lang">
    <button
      type="button"
      class="header-lang__trigger"
      :class="{ 'is-open': isLangOpen }"
      :aria-expanded="isLangOpen"
      aria-haspopup="listbox"
      :aria-label="isPt ? 'Mudar idioma do site' : 'Change website language'"
      @click.stop="toggleLangDropdown"
      @keydown.esc="isLangOpen = false"
    >
      <Globe class="header-lang__icon" aria-hidden="true" />
      <span class="header-lang__text">{{ currentLocale === 'pt-BR' ? 'PT' : 'EN' }}</span>
      <ChevronDown class="header-lang__chevron" aria-hidden="true" />
    </button>

    <Transition name="lang-dropdown">
      <ul
        v-if="isLangOpen"
        class="header-lang__dropdown"
        role="listbox"
        :aria-label="isPt ? 'Idiomas disponíveis' : 'Available languages'"
      >
        <li v-for="loc in AVAILABLE_LOCALES" :key="loc.code" role="none">
          <a
            class="header-lang__option"
            :class="{ 'is-selected': currentLocale === loc.code }"
            role="option"
            :aria-selected="currentLocale === loc.code"
            :href="localePath(loc.code)"
            :hreflang="loc.code"
            @click.prevent="chooseLocale(loc.code)"
          >
            <div class="header-lang__option-content">
              <span class="header-lang__option-name">{{ loc.label }}</span>
              <span class="header-lang__option-badge">{{ loc.shortLabel }}</span>
            </div>
            <Check
              v-if="currentLocale === loc.code"
              class="header-lang__check"
              aria-hidden="true"
            />
          </a>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.header-lang {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;

  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.34rem;
    padding: 0.44rem 0.65rem;
    border-radius: $radius-pill;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #c8cbd2;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    transition:
      color $transition-fast,
      background $transition-fast,
      border-color $transition-fast,
      box-shadow $transition-fast;

    &:hover:not(:disabled),
    &.is-open {
      color: $color-interaction;
      background-color: $color-interaction-soft;
      border-color: $color-interaction-border;
      box-shadow: 0 4px 14px -4px rgba(0, 0, 0, 0.5);
    }
  }

  &__icon {
    width: 13px;
    height: 13px;
    color: #ffb060;
  }

  &__text {
    line-height: 1;
    font-size: 0.72rem;
  }

  &__chevron {
    width: 11px;
    height: 11px;
    opacity: 0.65;
    transition: transform $transition-fast;
  }

  &__trigger.is-open &__chevron {
    transform: rotate(180deg);
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    min-width: 148px;
    margin: 0;
    padding: 0.35rem;
    list-style: none;
    border-radius: $radius-md;
    background: rgba(18, 20, 25, 0.94);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 18px 40px -8px rgba(0, 0, 0, 0.8),
      0 4px 12px -2px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 232, 208, 0.18);
    z-index: 60;
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.45rem 0.65rem;
    border-radius: calc(#{$radius-md} - 4px);
    font-size: 0.72rem;
    color: #b8bcc4;
    cursor: pointer;
    transition:
      background $transition-fast,
      color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      background-color: $color-interaction-soft;
    }

    &.is-selected {
      color: $color-ink;
      font-weight: 600;
      background: rgba(255, 196, 112, 0.14);
    }
  }

  &__option-content {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  &__option-badge {
    font-size: 0.62rem;
    padding: 0.1rem 0.35rem;
    border-radius: $radius-pill;
    background: rgba(255, 255, 255, 0.08);
    color: #ffb060;
  }

  &__check {
    width: 13px;
    height: 13px;
    color: #ffb060;
  }

  @media (max-width: 768px) {
    &__trigger {
      padding: 0.4rem 0.56rem;
    }
  }

  @media (max-width: 480px) {
    &__trigger {
      padding: 0.36rem 0.5rem;
      gap: 0.26rem;
    }
  }
}

.lang-dropdown-enter-active,
.lang-dropdown-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms cubic-bezier(0.16, 1, 0.3, 1);
}

.lang-dropdown-enter-from,
.lang-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.96);
}
</style>
