<script setup lang="ts">
import { computed, ref } from 'vue'
import experienceData from '@/data/experience.json'
import sectionsData from '@/data/sections.json'
import { currentLocale } from '@/state/locale'
import ExperienceRoleCard from './ExperienceRoleCard.vue'
import ExperienceWaterBackdrop from './ExperienceWaterBackdrop.vue'
import type { ExperienceRoleViewModel } from './types'

const waterRef = ref<InstanceType<typeof ExperienceWaterBackdrop> | null>(null)

function onPointerMove(e: PointerEvent) {
  waterRef.value?.handlePointerMove(e)
}

function onPointerDown(e: PointerEvent) {
  waterRef.value?.handlePointerDown(e)
}

function onPointerLeave() {
  waterRef.value?.handlePointerLeave()
}

const sectionCopy = computed(() => {
  const content = sectionsData.sections.experience.content
  return currentLocale.value === 'pt-BR' ? content['pt-BR'] : content.en
})

const cleanTitle = computed(() => sectionCopy.value.title.replace(/\.+$/, ''))

const roles = computed<ExperienceRoleViewModel[]>(() => {
  const loc = currentLocale.value === 'pt-BR' ? 'pt-BR' : 'en'

  return experienceData.experience
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => {
      const content = item.content[loc] ?? item.content.en
      return {
        id: item.id,
        company: item.company,
        title: content.title,
        period: content.period,
        isCurrent: item.current,
        summary: content.summary,
        description: 'description' in content ? content.description : undefined,
        details: 'details' in content ? content.details : undefined,
        technologies: 'technologies' in item ? item.technologies : undefined,
        note: 'note' in content ? content.note : undefined,
      }
    })
})
</script>

<template>
  <section
    id="experience"
    class="experience-section"
    aria-labelledby="experience-title"
    @pointermove="onPointerMove"
    @pointerdown="onPointerDown"
    @pointerleave="onPointerLeave"
  >
    <!-- Quadriculado Halftone Squares interactive mouse wake (Hero water style) -->
    <ExperienceWaterBackdrop ref="waterRef" />

    <div class="experience-section__shell">
      <header class="experience-section__heading">
        <h2 id="experience-title" class="experience-section__title">
          {{ cleanTitle }}<span class="experience-section__period">.</span>
        </h2>

        <p class="experience-section__intro">
          {{ sectionCopy.introduction }}
        </p>
      </header>

      <div class="experience-section__timeline">
        <ExperienceRoleCard v-for="role in roles" :key="role.id" :role="role" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.experience-section {
  position: relative;
  background-color: #0d0f13;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  isolation: isolate;

  &__shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: $layout-max;
    margin: 0 auto;
    padding: $space-section $layout-gutter;
    display: flex;
    flex-direction: column;
    gap: $space-section-gap;
  }

  &__heading {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    max-width: 44rem;
  }

  &__title {
    font-size: clamp(2.2rem, 4.2vw, 3.4rem);
    font-weight: 500;
    line-height: 1.05;
    letter-spacing: -0.035em;
    color: $color-ink;
    margin: 0;
  }

  &__period {
    color: #ffb060;
  }

  &__intro {
    font-size: clamp(0.92rem, 1.4vw, 1.02rem);
    line-height: 1.6;
    color: $color-muted;
    max-width: 38rem;
    margin: 0;
  }

  &__timeline {
    display: flex;
    flex-direction: column;
    gap: clamp(2rem, 3.5vw, 3rem);
    width: 100%;
  }

  @media (max-width: 640px) {
    &__shell {
      gap: $space-4;
    }
  }
}
</style>
