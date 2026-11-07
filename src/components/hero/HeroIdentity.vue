<script setup lang="ts">
import { ArrowUpRight, Award, Download } from 'lucide-vue-next'
import { heroProfile } from '@/data/heroProfile'
</script>

<template>
  <div class="hero-identity">
    <h1 id="hero-title" class="hero-identity__title">
      {{ heroProfile.firstName }}<br />
      {{ heroProfile.lastName }}<span class="hero-identity__period">.</span>
    </h1>

    <p class="hero-identity__role">{{ heroProfile.role }}</p>

    <p class="hero-identity__description">
      {{ heroProfile.description }}
    </p>

    <div class="hero-identity__actions">
      <a
        :href="heroProfile.actions.primary.href"
        class="hero-identity__cta-primary hero-identity__interactive"
      >
        <span>{{ heroProfile.actions.primary.label }}</span>
        <ArrowUpRight class="hero-identity__cta-icon" aria-hidden="true" />
      </a>

      <a
        :href="heroProfile.actions.secondary.href"
        class="hero-identity__cta-secondary hero-identity__interactive"
      >
        <span>{{ heroProfile.actions.secondary.label }}</span>
        <Download class="hero-identity__cta-icon" aria-hidden="true" />
      </a>
    </div>

    <ul class="hero-identity__socials" aria-label="Social profiles">
      <li v-for="social in heroProfile.socials" :key="social.name">
        <a
          :href="social.href"
          target="_blank"
          rel="noopener noreferrer"
          class="hero-identity__social-link hero-identity__interactive"
        >
          <svg
            v-if="social.kind === 'github'"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="hero-identity__social-icon"
            aria-hidden="true"
          >
            <path
              d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.02 11.02 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.42.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
            />
          </svg>
          <svg
            v-else-if="social.kind === 'linkedin'"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="hero-identity__social-icon"
            aria-hidden="true"
          >
            <path
              d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z"
            />
          </svg>
          <Award v-else class="hero-identity__social-icon" aria-hidden="true" />
          <span>{{ social.name }}</span>
          <ArrowUpRight class="hero-identity__social-arrow" aria-hidden="true" />
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.hero-identity {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: none;

  &__interactive {
    pointer-events: auto;
  }

  &__title {
    font-size: clamp(2.85rem, 4.9vw, 4.55rem);
    font-weight: 550;
    line-height: 0.98;
    letter-spacing: -0.04em;
    color: $color-ink;
    text-shadow: 0 10px 32px rgba(0, 0, 0, 0.65);
  }

  &__period {
    color: #ffb060;
  }

  &__role {
    margin-top: $space-4;
    font-size: clamp(1.1rem, 1.55vw, 1.38rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    color: #f3e8df;
    text-shadow: 0 4px 18px rgba(0, 0, 0, 0.65);
  }

  &__description {
    margin-top: $space-4;
    max-width: 27rem;
    font-size: $text-sm;
    line-height: 1.78;
    color: #d5d6da;
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.75);
  }

  &__actions {
    margin-top: $space-8;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $space-4;
  }

  &__cta-primary {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: 0.68rem 1.25rem;
    border-radius: $radius-pill;
    font-size: $text-xs;
    font-weight: 600;
    color: $color-ink;
    border: 1px solid rgba(255, 212, 136, 0.3);
    background:
      linear-gradient(135deg, rgba(255, 196, 112, 0.2) 0%, rgba(168, 196, 227, 0.1) 100%),
      rgba(22, 25, 30, 0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow:
      inset 0 1px 0 rgba(255, 246, 216, 0.28),
      0 12px 28px -10px rgba(0, 0, 0, 0.65);
    transition:
      transform $transition-fast,
      border-color $transition-fast,
      box-shadow $transition-fast,
      background $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible {
      transform: translateY(-1px);
      border-color: $color-interaction-border;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.42),
        0 14px 32px -8px rgba(255, 176, 96, 0.26);

      .hero-identity__cta-icon {
        transform: translate(2px, -2px);
      }
    }
  }

  &__cta-secondary {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: 0.68rem 1.05rem;
    border-radius: $radius-pill;
    font-size: $text-xs;
    font-weight: 500;
    color: #e4e3df;
    background: rgba(18, 20, 24, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible {
      color: $color-interaction;
      border-color: $color-interaction-border;
      background-color: $color-interaction-soft;
    }
  }

  &__cta-icon {
    width: 15px;
    height: 15px;
    transition: transform $transition-fast;
  }

  &__socials {
    margin-top: $space-8;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $space-5;
  }

  &__social-link {
    display: inline-flex;
    align-items: center;
    gap: 0.42rem;
    font-size: $text-xs;
    color: #c8cbd2;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
    transition: color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible {
      color: $color-interaction;

      .hero-identity__social-arrow {
        opacity: 1;
        transform: translate(0, 0);
      }
    }
  }

  &__social-icon {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }

  &__social-arrow {
    width: 12px;
    height: 12px;
    opacity: 0;
    transform: translate(-3px, 3px);
    transition:
      opacity $transition-fast,
      transform $transition-fast;
  }

  @media (max-width: 920px) {
    max-width: 34rem;

    &__description {
      max-width: 32rem;
    }
  }

  @media (max-width: 640px) {
    &__title {
      font-size: clamp(2.4rem, 10vw, 3.25rem);
    }

    &__role {
      margin-top: $space-3;
      font-size: clamp(1rem, 4.2vw, 1.2rem);
    }

    &__description {
      margin-top: $space-3;
      font-size: 0.84rem;
      line-height: 1.68;
    }

    &__actions {
      margin-top: $space-6;
      gap: $space-3;
      width: 100%;
    }

    &__socials {
      margin-top: $space-6;
      gap: $space-3 $space-4;
    }
  }

  @media (max-width: 440px) {
    &__cta-primary,
    &__cta-secondary {
      flex: 1 1 auto;
      justify-content: center;
      min-height: 42px;
    }
  }
}
</style>
