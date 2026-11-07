<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import type { ResumeDocument, ResumeUI } from '@/data/resume/resumeTypes'

defineProps<{
  document: ResumeDocument
  ui: ResumeUI
}>()
</script>

<template>
  <article class="resume-sheet" aria-label="Curriculum Vitae">
    <!-- Header -->
    <header class="resume-sheet__header">
      <h2 class="resume-sheet__name">{{ document.header.name }}</h2>
      <p class="resume-sheet__tagline">{{ document.header.tagline }}</p>

      <div class="resume-sheet__meta">
        <span>{{ document.header.location }}</span>
        <span class="resume-sheet__dot" aria-hidden="true">•</span>
        <span>{{ document.header.englishLevel }}</span>
        <span class="resume-sheet__dot" aria-hidden="true">•</span>
        <a :href="'mailto:' + document.header.email" class="resume-sheet__link">
          {{ document.header.email }}
        </a>
      </div>

      <div v-if="document.header.links.length > 0" class="resume-sheet__links">
        <template v-for="(link, i) in document.header.links" :key="link.label">
          <a
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            class="resume-sheet__link resume-sheet__link--social"
          >
            <span>{{ link.label }}</span>
            <ArrowUpRight class="resume-sheet__arrow print-hide" aria-hidden="true" />
          </a>
          <span
            v-if="i < document.header.links.length - 1"
            class="resume-sheet__dot"
            aria-hidden="true"
          >
            •
          </span>
        </template>
      </div>
    </header>

    <!-- Professional Profile / Summary -->
    <section v-if="document.summary" class="resume-sheet__section resume-sheet__section--summary">
      <h3 class="resume-sheet__section-title">{{ ui.summaryHeading }}</h3>
      <p class="resume-sheet__body resume-sheet__body--summary">{{ document.summary }}</p>
    </section>

    <!-- Professional Experience -->
    <section
      v-if="document.experience.length > 0"
      class="resume-sheet__section resume-sheet__section--experience"
    >
      <h3 class="resume-sheet__section-title">{{ ui.experienceHeading }}</h3>

      <div class="resume-sheet__entries">
        <div v-for="exp in document.experience" :key="exp.id" class="resume-sheet__entry">
          <div class="resume-sheet__entry-header">
            <h4 class="resume-sheet__entry-role">
              {{ exp.role }}
              <span class="resume-sheet__entry-company">· {{ exp.company }}</span>
            </h4>
            <span class="resume-sheet__entry-period">{{ exp.period }}</span>
          </div>

          <p v-if="exp.summary" class="resume-sheet__entry-summary">{{ exp.summary }}</p>

          <ul v-if="exp.highlights.length > 0" class="resume-sheet__highlights">
            <li v-for="(hl, hIdx) in exp.highlights" :key="hIdx" class="resume-sheet__highlight">
              <strong v-if="hl.label" class="resume-sheet__highlight-label">{{ hl.label }}:</strong>
              <span class="resume-sheet__highlight-text">{{ hl.text }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Featured Technical Projects -->
    <section
      v-if="document.projects.length > 0"
      class="resume-sheet__section resume-sheet__section--projects"
    >
      <h3 class="resume-sheet__section-title">{{ ui.projectsHeading }}</h3>

      <div class="resume-sheet__entries">
        <div v-for="proj in document.projects" :key="proj.id" class="resume-sheet__entry">
          <div class="resume-sheet__entry-header">
            <h4 class="resume-sheet__entry-role">
              {{ proj.name }}
              <span v-if="proj.badge" class="resume-sheet__badge print-hide">{{ proj.badge }}</span>
            </h4>
            <a
              v-if="proj.repositoryUrl"
              :href="proj.repositoryUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="resume-sheet__link resume-sheet__link--repo"
            >
              <span>Repository</span>
              <ArrowUpRight class="resume-sheet__arrow print-hide" aria-hidden="true" />
            </a>
          </div>

          <p class="resume-sheet__body">{{ proj.description }}</p>

          <div class="resume-sheet__tags" aria-label="Technologies used">
            <span v-for="tech in proj.technologies" :key="tech" class="resume-sheet__tag">
              {{ tech }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Technical Skills -->
    <section
      v-if="document.skills.length > 0"
      class="resume-sheet__section resume-sheet__section--skills"
    >
      <h3 class="resume-sheet__section-title">{{ ui.skillsHeading }}</h3>

      <div class="resume-sheet__skills-grid">
        <div v-for="group in document.skills" :key="group.group" class="resume-sheet__skill-group">
          <strong class="resume-sheet__skill-title">{{ group.group }}</strong>
          <p class="resume-sheet__skill-list">{{ group.items.join(', ') }}</p>
        </div>
      </div>
    </section>

    <!-- Academic Background & Training -->
    <section
      v-if="document.education.length > 0 || document.certifications.length > 0"
      class="resume-sheet__section resume-sheet__section--education resume-sheet__section--split"
    >
      <!-- Education -->
      <div v-if="document.education.length > 0" class="resume-sheet__col">
        <h3 class="resume-sheet__section-title">{{ ui.educationHeading }}</h3>
        <div v-for="edu in document.education" :key="edu.id" class="resume-sheet__entry">
          <h4 class="resume-sheet__entry-role">{{ edu.degree }}</h4>
          <p class="resume-sheet__entry-sub">{{ edu.institution }} · {{ edu.period }}</p>
          <p v-if="edu.description" class="resume-sheet__body resume-sheet__body--compact">
            {{ edu.description }}
          </p>
        </div>
      </div>

      <!-- Certifications & Training -->
      <div
        v-if="document.certifications.length > 0 || document.courses.length > 0"
        class="resume-sheet__col"
      >
        <h3 class="resume-sheet__section-title">{{ ui.certificationsHeading }}</h3>
        <ul class="resume-sheet__list">
          <li
            v-for="cert in document.certifications"
            :key="cert.id"
            class="resume-sheet__list-item"
          >
            <span class="resume-sheet__cert-name">
              <strong>{{ cert.name }}</strong> — {{ cert.issuer }}
            </span>
            <a
              v-if="cert.verifyUrl"
              :href="cert.verifyUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="resume-sheet__link resume-sheet__link--verify print-hide"
            >
              <span>{{ ui.verified }}</span>
              <ArrowUpRight class="resume-sheet__arrow" aria-hidden="true" />
            </a>
          </li>

          <li v-for="course in document.courses" :key="course.id" class="resume-sheet__list-item">
            <span>
              <strong>{{ course.name }}</strong> — {{ course.provider }}
            </span>
          </li>
        </ul>
      </div>
    </section>
  </article>
</template>

<style scoped lang="scss">
.resume-sheet {
  position: relative;
  width: 100%;
  margin: 0;
  padding: clamp(1.75rem, 4vw, 3rem) clamp(1.5rem, 3.5vw, 2.75rem);
  background: linear-gradient(180deg, #191c22 0%, #131518 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: $radius-lg;
  box-shadow:
    0 24px 60px -15px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  font-family: inherit;
  color: $color-text;
  line-height: 1.6;

  &__header {
    margin-bottom: $space-6;
    padding-bottom: $space-5;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__name {
    font-size: clamp(1.6rem, 2.8vw, 2.25rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    color: $color-ink;
    margin: 0 0 $space-2;
    text-transform: uppercase;
  }

  &__tagline {
    font-size: clamp(0.9rem, 1.3vw, 1.08rem);
    font-weight: 500;
    color: #ffc470;
    margin: 0 0 $space-3;
  }

  &__meta,
  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $space-2 $space-3;
    font-size: $text-xs;
    color: $color-muted;
  }

  &__links {
    margin-top: $space-2;
  }

  &__dot {
    opacity: 0.45;
  }

  &__link {
    color: $color-accent;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    transition: color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible {
      color: $color-interaction;
      text-decoration: underline;
    }

    &--social,
    &--repo,
    &--verify {
      font-weight: 500;
    }
  }

  &__arrow {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }

  &__section {
    margin-top: clamp(2.5rem, 4.5vw, 3.5rem);
    padding-top: $space-3;

    &--projects {
      margin-top: clamp(2.75rem, 5.5vw, 4.25rem);
      padding-top: $space-4;
    }

    &--experience {
      margin-bottom: $space-4;
    }

    &--split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: $space-6;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
  }

  &__section-title {
    font-size: $text-xs;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $color-ink;
    padding-bottom: $space-2;
    margin-top: 0;
    margin-bottom: $space-4;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__body {
    font-size: $text-sm;
    color: #d1d3d8;
    line-height: 1.65;
    margin: 0;

    &--summary {
      font-size: 0.92rem;
    }

    &--compact {
      font-size: $text-xs;
      color: $color-muted;
      margin-top: $space-1;
    }
  }

  &__entries {
    display: flex;
    flex-direction: column;
    gap: $space-6;
    margin-bottom: $space-5;
    padding-bottom: $space-2;
  }

  &__entry {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__entry-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: $space-2;
  }

  &__entry-role {
    font-size: 0.95rem;
    font-weight: 600;
    color: $color-ink;
    margin: 0;
  }

  &__entry-company {
    font-weight: 400;
    color: $color-muted;
  }

  &__entry-sub {
    font-size: $text-xs;
    color: $color-muted;
    margin: 0;
  }

  &__entry-period {
    font-size: $text-xs;
    color: $color-muted;
  }

  &__entry-summary {
    font-size: $text-xs;
    font-style: italic;
    color: $color-muted;
    margin: 0;
  }

  &__highlights {
    list-style: disc;
    padding-left: $space-4;
    margin: $space-2 0 0 0;
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  &__highlight {
    font-size: 0.85rem;
    color: #cfd2d8;
    line-height: 1.6;
  }

  &__highlight-label {
    color: $color-ink;
    margin-right: 0.35rem;
  }

  &__badge {
    font-size: 0.68rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    border-radius: $radius-pill;
    background: rgba(168, 196, 227, 0.12);
    color: $color-accent;
    border: 1px solid rgba(168, 196, 227, 0.2);
    margin-left: $space-2;
    vertical-align: middle;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $space-2;
    margin-top: $space-1;
  }

  &__tag {
    font-size: 0.72rem;
    font-weight: 500;
    padding: 0.15rem 0.55rem;
    border-radius: $radius-pill;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #bfc3cc;
  }

  &__skills-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $space-4 $space-6;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &__skill-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__skill-title {
    font-size: $text-xs;
    font-weight: 600;
    color: $color-ink;
  }

  &__skill-list {
    font-size: 0.82rem;
    color: #b5b8c0;
    margin: 0;
    line-height: 1.5;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }

  &__list-item {
    font-size: 0.84rem;
    color: #cfd2d8;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $space-2;

    strong {
      color: $color-ink;
    }
  }
}

/* ==============================================================================
   PRINT STYLES (@media print)
   Clean vector output for PDF printing with robust page-break spacing
   ============================================================================== */
@media print {
  @page {
    size: A4 portrait;
    margin: 12mm 14mm 14mm 14mm;
  }

  :global(body) {
    background: #ffffff !important;
    color: #111111 !important;
    font-size: 9.5pt !important;
  }

  :global(.header-rail),
  :global(#hero),
  :global(#skills),
  :global(#contact),
  :global(.site-footer),
  :global(.resume-controls),
  :global(.resume-section__heading),
  .print-hide {
    display: none !important;
  }

  .resume-sheet {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    background: #ffffff !important;
    color: #111111 !important;
    padding: 0 !important;
    margin: 0 !important;
    max-width: 100% !important;

    &__header {
      border-bottom: 1.5pt solid #111111 !important;
      margin-bottom: 10pt !important;
      padding-bottom: 6pt !important;
    }

    &__name {
      color: #000000 !important;
      font-size: 19pt !important;
      margin-bottom: 2pt !important;
    }

    &__tagline {
      color: #222222 !important;
      font-size: 11pt !important;
      font-weight: 600 !important;
      margin-bottom: 4pt !important;
    }

    &__meta,
    &__links {
      color: #333333 !important;
      font-size: 8.5pt !important;
    }

    &__link {
      color: #111111 !important;
      text-decoration: underline !important;
    }

    &__section {
      margin-top: 24pt !important;
      padding-top: 10pt !important;
      margin-bottom: 12pt !important;
      break-inside: auto !important;

      &--projects {
        margin-top: 30pt !important;
        padding-top: 14pt !important;
      }

      &--experience {
        margin-bottom: 20pt !important;
        padding-bottom: 8pt !important;
      }
    }

    &__section-title {
      color: #000000 !important;
      font-size: 10pt !important;
      font-weight: 700 !important;
      border-bottom: 1.4pt solid #222222 !important;
      padding-bottom: 3.5pt !important;
      margin-top: 0 !important;
      margin-bottom: 8pt !important;
      break-after: avoid !important;
      page-break-after: avoid !important;
    }

    &__body {
      color: #222222 !important;
      font-size: 9pt !important;
      line-height: 1.45 !important;
    }

    &__entries {
      display: flex !important;
      flex-direction: column !important;
      gap: 11pt !important;
      margin-bottom: 12pt !important;
      padding-bottom: 6pt !important;
    }

    &__entry {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-bottom: 6pt !important;
      gap: 2pt !important;
    }

    &__entry-role {
      color: #000000 !important;
      font-size: 9.5pt !important;
    }

    &__entry-company {
      color: #333333 !important;
    }

    &__entry-period {
      color: #444444 !important;
      font-size: 8.5pt !important;
    }

    &__highlights {
      padding-left: 14pt !important;
      gap: 3pt !important;
      margin-top: 3pt !important;
      margin-bottom: 6pt !important;
    }

    &__highlight {
      color: #222222 !important;
      font-size: 8.8pt !important;
      line-height: 1.4 !important;
    }

    &__highlight-label {
      color: #000000 !important;
    }

    &__tag {
      background: none !important;
      border: 1px solid #cccccc !important;
      color: #333333 !important;
      font-size: 7.5pt !important;
      padding: 1pt 4pt !important;
    }

    &__skill-title {
      color: #000000 !important;
      font-size: 8.5pt !important;
    }

    &__skill-list {
      color: #222222 !important;
      font-size: 8.5pt !important;
      line-height: 1.35 !important;
    }

    &__list-item {
      color: #222222 !important;
      font-size: 8.8pt !important;
      strong {
        color: #000000 !important;
      }
    }
  }
}
</style>
