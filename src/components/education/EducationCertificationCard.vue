<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { resolveImageAsset } from '@/data/imageAssets'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import { isPt } from '@/state/locale'
import type { CertificationViewModel } from './types'

const props = defineProps<{
  certification: CertificationViewModel
}>()

defineEmits<{
  select: [certification: CertificationViewModel]
}>()

const resolvedImage = computed(() => resolveImageAsset(props.certification.image))

const verifyLabel = computed(() => (isPt.value ? 'Verificar no Credly' : 'Verify on Credly'))
const newTabLabel = computed(() => (isPt.value ? 'abre em nova aba' : 'opens in new tab'))
const detailsLabel = computed(() =>
  isPt.value ? 'Ver detalhes da certificação' : 'View certification details',
)
</script>

<template>
  <article
    class="cert-card"
    role="button"
    tabindex="0"
    :aria-label="`${certification.name} — ${detailsLabel}`"
    :aria-labelledby="`cert-${certification.id}-title`"
    @pointermove="onSpotMove"
    @click="$emit('select', certification)"
    @keydown.enter.prevent="$emit('select', certification)"
    @keydown.space.prevent="$emit('select', certification)"
  >
    <div class="cert-card__body">
      <!-- Badge Image Column (Enlarged to 100px for strong visual weight) -->
      <div class="cert-card__badge-wrap">
        <img
          v-if="resolvedImage"
          :src="resolvedImage"
          :alt="`${certification.issuer} — ${certification.name}`"
          width="100"
          height="100"
          class="cert-card__badge-img"
          loading="lazy"
        />
        <div v-else class="cert-card__badge-fallback" aria-hidden="true" />
      </div>

      <!-- Content Column -->
      <div class="cert-card__content">
        <div class="cert-card__issuer-row">
          <span class="cert-card__issuer-pill">
            {{ certification.issuer }}
          </span>

          <a
            :href="certification.credentialUrl"
            target="_blank"
            rel="noreferrer noopener"
            class="cert-card__verify-link"
            :aria-label="`${verifyLabel}: ${certification.name} (${newTabLabel})`"
            @click.stop
          >
            <span>{{ verifyLabel }}</span>
            <ArrowUpRight class="cert-card__link-icon" aria-hidden="true" />
          </a>
        </div>

        <h3 :id="`cert-${certification.id}-title`" class="cert-card__title">
          {{ certification.name }}
        </h3>

        <p class="cert-card__topic">
          {{ certification.topic }}
        </p>

        <!-- Tech tags -->
        <ul
          v-if="certification.technologies && certification.technologies.length > 0"
          class="cert-card__tech-list"
          role="list"
        >
          <li
            v-for="tech in certification.technologies"
            :key="tech"
            class="cert-card__tech-tag"
            @pointermove.stop="onSpotMove"
          >
            {{ tech }}
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.cert-card {
  @include amber-spot(220px, 240px);
  padding: clamp(1.25rem, 2vw, 1.65rem);
  border-radius: $radius-lg;
  background:
    radial-gradient(ellipse 60% 50% at 95% 95%, rgba(255, 176, 96, 0.04) 0%, transparent 70%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0.005) 100%), #12151b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  flex: 1;
  cursor: pointer;
  transition:
    border-color $transition-fast,
    box-shadow $transition-fast,
    transform $transition-fast;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    border-color: $color-interaction-border;
    box-shadow:
      0 22px 56px rgba(0, 0, 0, 0.42),
      0 0 24px rgba(255, 176, 96, 0.08);
    transform: translateY(-2px);

    .cert-card__badge-img {
      transform: scale(1.06);
      filter: drop-shadow(0 0 20px rgba(255, 176, 96, 0.45));
    }

    .cert-card__verify-link {
      color: $color-interaction;
      border-color: $color-interaction-border;
    }
  }

  &:focus-visible {
    outline: 2px solid $color-focus;
    outline-offset: 2px;
  }

  &__body {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  &__badge-wrap {
    width: 100px;
    height: 100px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__badge-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.4));
    transition:
      transform $transition-fast,
      filter $transition-fast;
  }

  &__badge-fallback {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #1c2029;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  &__issuer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__issuer-pill {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #a8c4e3;
  }

  &__verify-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.72rem;
    font-weight: 550;
    color: #c4c8d2;
    text-decoration: none;
    padding: 0.18rem 0.5rem;
    border-radius: $radius-pill;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition:
      color $transition-fast,
      border-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
      background-color: $color-interaction-soft;
    }

    &:focus-visible {
      outline: 2px solid $color-focus;
      outline-offset: 2px;
    }
  }

  &__link-icon {
    width: 12px;
    height: 12px;
  }

  &__title {
    font-size: clamp(1.05rem, 1.8vw, 1.25rem);
    font-weight: 550;
    line-height: 1.3;
    color: $color-ink;
    margin: 0;
    letter-spacing: -0.01em;
  }

  &__topic {
    font-size: 0.82rem;
    line-height: 1.5;
    color: #94a3b8;
    margin: 0;
  }

  &__tech-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    list-style: none;
    padding: 0;
    margin: $space-2 0 0;
  }

  &__tech-tag {
    @include amber-spot(46px, 52px);
    display: inline-flex;
    align-items: center;
    padding: 0.18rem 0.52rem;
    border-radius: $radius-pill;
    font-size: 0.68rem;
    font-weight: 550;
    color: #c4c8d0;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: default;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast,
      transform $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
      background: rgba(255, 176, 96, 0.1);
      transform: translateY(-1px);
    }
  }

  @media (max-width: 640px) {
    &__body {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    &__badge-wrap {
      width: 72px;
      height: 72px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      transform: none;

      .cert-card__badge-img {
        transform: none;
      }
    }

    &__tech-tag {
      transition: none;
    }
  }
}
</style>
