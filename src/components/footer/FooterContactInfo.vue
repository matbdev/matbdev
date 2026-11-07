<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { ArrowUpRight, Award, Check, Copy, FileText, Mail } from 'lucide-vue-next'
import contactData from '@/data/contact.json'
import profileData from '@/data/profile.json'
import sectionsData from '@/data/sections.json'
import { isPt } from '@/state/locale'

interface RawSocial {
  name: string
  icon: string
  href: string
}

const rawProfile =
  (profileData as { profile?: typeof profileData.profile }).profile ?? profileData.profile

const email = rawProfile.email || 'mateus@matbdev.com'
const socials = (rawProfile.socials || []) as RawSocial[]

const contactCopy = computed(() => {
  const c = sectionsData.sections.contact.content
  return isPt.value ? c['pt-BR'] : c.en
})

const uiCopy = computed(() => {
  const ui = contactData.contact.ui.content
  return isPt.value ? ui['pt-BR'] : ui.en
})

const emailCopyState = ref<'idle' | 'copied' | 'failed'>('idle')
let emailCopyTimer: ReturnType<typeof setTimeout> | null = null

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email)
    emailCopyState.value = 'copied'
  } catch {
    emailCopyState.value = 'failed'
  }

  if (emailCopyTimer !== null) clearTimeout(emailCopyTimer)
  emailCopyTimer = setTimeout(() => {
    emailCopyState.value = 'idle'
    emailCopyTimer = null
  }, 2200)
}

onUnmounted(() => {
  if (emailCopyTimer !== null) clearTimeout(emailCopyTimer)
})
</script>

<template>
  <div class="footer-info">
    <div class="footer-info__intro">
      <h2 id="footer-contact-title" class="footer-info__title">
        {{ contactCopy.title }}<span class="footer-info__period">.</span>
      </h2>

      <p class="footer-info__desc">
        {{ contactCopy.introduction }}
      </p>
    </div>

    <div class="footer-info__direct">
      <div class="footer-info__email-box">
        <a
          :href="`mailto:${email}`"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-info__email-link"
        >
          <span class="footer-info__email-left">
            <Mail class="footer-info__email-icon" aria-hidden="true" />
            <span class="footer-info__email-address">{{ email }}</span>
          </span>
          <ArrowUpRight class="footer-info__email-arrow" aria-hidden="true" />
        </a>

        <button
          type="button"
          class="footer-info__copy-btn"
          :class="{ 'is-copied': emailCopyState === 'copied' }"
          :aria-label="uiCopy.copyEmailAria"
          @click="copyEmail"
        >
          <Check
            v-if="emailCopyState === 'copied'"
            class="footer-info__copy-icon"
            aria-hidden="true"
          />
          <Copy v-else class="footer-info__copy-icon" aria-hidden="true" />
          <span class="footer-info__copy-label">
            <template v-if="emailCopyState === 'copied'">
              {{ uiCopy.copiedEmailButton }}
            </template>
            <template v-else-if="emailCopyState === 'failed'">
              {{ uiCopy.errorEmailButton }}
            </template>
            <template v-else>
              {{ uiCopy.copyEmailButton }}
            </template>
          </span>
        </button>
      </div>

      <!-- Single-row balanced pills (GitHub, LinkedIn, Credly, Instagram, Résumé) -->
      <ul class="footer-info__pills" :aria-label="uiCopy.socialsAria">
        <li v-for="social in socials" :key="social.name">
          <a
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-info__pill"
          >
            <svg
              v-if="social.icon === 'github'"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="footer-info__pill-icon"
              aria-hidden="true"
            >
              <path
                d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.02 11.02 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.42.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
              />
            </svg>
            <svg
              v-else-if="social.icon === 'linkedin'"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="footer-info__pill-icon"
              aria-hidden="true"
            >
              <path
                d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z"
              />
            </svg>
            <svg
              v-else-if="social.icon === 'instagram'"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="footer-info__pill-icon"
              aria-hidden="true"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <Award v-else class="footer-info__pill-icon" aria-hidden="true" />

            <span class="footer-info__pill-text">{{ social.name }}</span>
          </a>
        </li>

        <li>
          <a href="#resume" class="footer-info__pill">
            <FileText class="footer-info__pill-icon" aria-hidden="true" />
            <span class="footer-info__pill-text">{{ uiCopy.resumePill }}</span>
          </a>
        </li>
      </ul>
    </div>

    <span class="footer-info__sr-status" role="status" aria-live="polite">
      <template v-if="emailCopyState === 'copied'">
        {{ uiCopy.copiedEmailSr }}
      </template>
    </span>
  </div>
</template>

<style scoped lang="scss">
.footer-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: $space-8;
  min-width: 0;

  &__title {
    font-size: clamp(1.95rem, 4.6vw, 3.3rem);
    font-weight: 500;
    line-height: 1.03;
    letter-spacing: -0.04em;
    color: $color-ink;
    max-width: 14ch;
  }

  &__period {
    color: #ffb060;
  }

  &__desc {
    margin-top: $space-4;
    max-width: 28rem;
    font-size: $text-sm;
    line-height: 1.75;
    color: $color-muted;
  }

  &__direct {
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__email-box {
    display: flex;
    align-items: stretch;
    gap: $space-2;
    padding: 0.35rem;
    border-radius: $radius-md;
    background-color: #13161b;
    border: 1px solid rgba(255, 255, 255, 0.09);
  }

  &__email-link {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    padding: 0.7rem 0.95rem;
    border-radius: calc(#{$radius-md} - 4px);
    background-color: #181b21;
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: $color-ink;
    transition: color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      .footer-info__email-arrow {
        transform: translate(2px, -2px);
        color: $color-interaction;
      }
    }
  }

  &__email-left {
    position: relative;
    z-index: 1;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
  }

  &__email-icon {
    width: 16px;
    height: 16px;
    color: #ffb060;
    flex-shrink: 0;
  }

  &__email-address {
    font-size: clamp(0.92rem, 1.3vw, 1.1rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__email-arrow {
    position: relative;
    z-index: 1;
    width: 15px;
    height: 15px;
    color: $color-muted;
    flex-shrink: 0;
    transition:
      transform $transition-fast,
      color $transition-fast;
  }

  &__copy-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0 0.95rem;
    border-radius: calc(#{$radius-md} - 4px);
    background-color: #181b21;
    border: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.72rem;
    font-weight: 600;
    color: #c8cbd2;
    white-space: nowrap;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
    }

    &.is-copied {
      color: $color-ink;
      border-color: rgba(255, 196, 112, 0.42);
      background-color: #221d18;

      .footer-info__copy-icon {
        color: #ffb060;
      }
    }
  }

  &__copy-icon,
  &__copy-label {
    position: relative;
    z-index: 1;
  }

  &__copy-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  &__pills {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.36rem;
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    li {
      flex-shrink: 0;
    }
  }

  &__pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.34rem;
    padding: 0.4rem 0.64rem;
    border-radius: $radius-pill;
    background-color: #14171c;
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.69rem;
    font-weight: 500;
    color: #c4c8d0;
    white-space: nowrap;
    transition: color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;

      .footer-info__pill-icon {
        color: $color-interaction;
      }
    }
  }

  &__pill-icon,
  &__pill-text {
    position: relative;
    z-index: 1;
  }

  &__pill-icon {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
    transition: color $transition-fast;
  }

  &__sr-status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (max-width: 960px) {
    gap: $space-6;

    &__desc {
      max-width: 34rem;
    }
  }

  @media (max-width: 520px) {
    &__email-box {
      flex-direction: column;
    }

    &__email-link {
      min-height: 44px;
    }

    &__copy-btn {
      min-height: 42px;
      padding: 0.6rem 1rem;
    }

    &__pills {
      gap: 0.24rem;
    }

    &__pill {
      gap: 0.24rem;
      padding: 0.36rem clamp(0.38rem, 1.8vw, 0.56rem);
      font-size: clamp(0.6rem, 2.55vw, 0.67rem);
    }

    &__pill-icon {
      width: 11.5px;
      height: 11.5px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__email-arrow,
    &__copy-btn,
    &__pill,
    &__pill-icon {
      transition: none;
    }
  }
}
</style>
