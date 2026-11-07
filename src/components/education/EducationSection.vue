<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowUpRight, Award, BookOpen, GraduationCap } from 'lucide-vue-next'
import certificationsData from '@/data/certifications.json'
import coursesData from '@/data/courses.json'
import educationData from '@/data/education.json'
import profileData from '@/data/profile.json'
import sectionsData from '@/data/sections.json'
import { currentLocale, isPt } from '@/state/locale'
import EducationCertificationCard from './EducationCertificationCard.vue'
import EducationCourseCard from './EducationCourseCard.vue'
import EducationDegreeCard from './EducationDegreeCard.vue'
import EducationDetailModal from './EducationDetailModal.vue'
import type { CertificationViewModel, CourseViewModel, EducationDegreeViewModel } from './types'

const sectionCopy = computed(() => {
  const content = sectionsData.sections.learning.content
  return currentLocale.value === 'pt-BR' ? content['pt-BR'] : content.en
})

const cleanTitle = computed(() => sectionCopy.value.title.replace(/\.+$/, ''))

// Modal state
const isModalOpen = ref(false)
const selectedItem = ref<EducationDegreeViewModel | CertificationViewModel | null>(null)
const selectedType = ref<'degree' | 'certification' | null>(null)

function openDegreeModal(deg: EducationDegreeViewModel) {
  selectedItem.value = deg
  selectedType.value = 'degree'
  isModalOpen.value = true
}

function openCertModal(cert: CertificationViewModel) {
  selectedItem.value = cert
  selectedType.value = 'certification'
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedItem.value = null
  selectedType.value = null
}

const degree = computed<EducationDegreeViewModel>(() => {
  const loc = currentLocale.value === 'pt-BR' ? 'pt-BR' : 'en'
  const first = educationData.education[0]
  if (!first) {
    return {
      id: 'univates',
      institution: 'Univates',
      degree: 'Software Engineering',
      period: '2025 — 2028',
      status: 'in-progress',
      description: '',
    }
  }

  const content = first.content[loc] ?? first.content.en
  return {
    id: first.id,
    institution: first.institution,
    degree: content.degree,
    period: content.period,
    status: first.status,
    description: content.description,
  }
})

const certifications = computed<CertificationViewModel[]>(() => {
  const loc = currentLocale.value === 'pt-BR' ? 'pt-BR' : 'en'
  return certificationsData.certifications.map((item) => {
    const content = item.content[loc] ?? item.content.en
    return {
      id: item.id,
      name: item.name,
      issuer: item.issuer,
      image: item.image,
      credentialUrl: item.credentialUrl,
      topic: content.topic,
      technologies: item.technologies,
    }
  })
})

const courses = computed<CourseViewModel[]>(() => {
  const loc = currentLocale.value === 'pt-BR' ? 'pt-BR' : 'en'
  return coursesData.courses.map((item) => {
    const content = item.content[loc] ?? item.content.en
    return {
      id: item.id,
      name: content.name,
      provider: content.provider,
      type: item.type,
      courseCount:
        'courseCount' in item && typeof item.courseCount === 'number'
          ? item.courseCount
          : undefined,
    }
  })
})

const credlyProfileUrl = computed(() => {
  const credly = profileData.profile.socials.find((s) => s.name === 'Credly')
  return credly ? credly.href : 'https://www.credly.com/users/mateus-carniel-brambilla.0c10944d'
})

const credlyLabel = computed(() => (isPt.value ? 'Perfil no Credly' : 'Credly profile'))
const coursesSectionTitle = computed(() =>
  isPt.value ? 'Cursos complementares e avaliações' : 'Continuous coursework & assessments',
)
const certificationsHeading = computed(() =>
  isPt.value ? 'Certificações da indústria' : 'Industry certifications',
)
const academicHeading = computed(() => (isPt.value ? 'Formação acadêmica' : 'Academic degree'))
</script>

<template>
  <section id="education" class="education-section" aria-labelledby="education-title">
    <div class="education-section__shell">
      <header class="education-section__heading">
        <h2 id="education-title" class="education-section__title">
          {{ cleanTitle }}<span class="education-section__period">.</span>
        </h2>

        <p class="education-section__intro">
          {{ sectionCopy.introduction }}
        </p>
      </header>

      <!-- Primary Grid: Academic Foundation & Industry Certifications -->
      <div class="education-section__primary-grid">
        <!-- Academic Column -->
        <div class="education-section__col">
          <div class="education-section__col-head">
            <GraduationCap class="education-section__col-icon" aria-hidden="true" />
            <h3 class="education-section__col-title">{{ academicHeading }}</h3>
          </div>
          <EducationDegreeCard
            :degree="degree"
            class="education-section__degree-card"
            @select="openDegreeModal"
          />
        </div>

        <!-- Certifications Column -->
        <div class="education-section__col">
          <!-- Certifications Header with Credly Link aligned via flex -->
          <div class="education-section__col-head education-section__col-head--between">
            <div class="education-section__col-title-group">
              <Award class="education-section__col-icon" aria-hidden="true" />
              <h3 class="education-section__col-title">{{ certificationsHeading }}</h3>
            </div>

            <a
              :href="credlyProfileUrl"
              target="_blank"
              rel="noreferrer noopener"
              class="education-section__credly-link"
              :aria-label="`${credlyLabel} (${isPt ? 'abre em nova aba' : 'opens in new tab'})`"
            >
              <Award class="education-section__credly-icon" aria-hidden="true" />
              <span>{{ credlyLabel }}</span>
              <ArrowUpRight class="education-section__credly-arrow" aria-hidden="true" />
            </a>
          </div>

          <div class="education-section__certs-list">
            <EducationCertificationCard
              v-for="cert in certifications"
              :key="cert.id"
              :certification="cert"
              @select="openCertModal"
            />
          </div>
        </div>
      </div>

      <!-- Coursework & Assessments Subsection -->
      <div class="education-section__courses-wrap">
        <div class="education-section__col-head">
          <BookOpen class="education-section__col-icon" aria-hidden="true" />
          <h3 class="education-section__col-title">{{ coursesSectionTitle }}</h3>
        </div>

        <div class="education-section__courses-grid">
          <EducationCourseCard v-for="course in courses" :key="course.id" :course="course" />
        </div>
      </div>
    </div>

    <!-- Educational & Certification Detail Modal Dialog -->
    <EducationDetailModal
      :open="isModalOpen"
      :item="selectedItem"
      :type="selectedType"
      @close="closeModal"
    />
  </section>
</template>

<style scoped lang="scss">
.education-section {
  position: relative;
  background-color: #0b0d11;
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

  &__primary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: stretch;
    gap: clamp(1.75rem, 3.5vw, 2.75rem);
  }

  &__col {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
  }

  &__col-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 36px;

    &--between {
      justify-content: space-between;
      gap: 0.75rem;
    }
  }

  &__col-title-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__col-icon {
    width: 16px;
    height: 16px;
    color: #ffb060;
  }

  &__col-title {
    font-size: 0.88rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #c4c8d4;
    margin: 0;
  }

  &__degree-card {
    height: 100%;
    flex: 1;
  }

  &__certs-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 100%;
    flex: 1;
  }

  &__credly-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    font-weight: 550;
    color: #c4c8d2;
    text-decoration: none;
    padding: 0.25rem 0.65rem;
    border-radius: $radius-pill;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      border-color: $color-interaction-border;
      background: rgba(255, 176, 96, 0.08);
    }

    &:focus-visible {
      outline: 2px solid $color-focus;
      outline-offset: 2px;
    }
  }

  &__credly-icon {
    width: 13px;
    height: 13px;
    color: #ffb060;
  }

  &__credly-arrow {
    width: 12px;
    height: 12px;
  }

  // Coursework subsection
  &__courses-wrap {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding-top: $space-4;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 960px) {
    &__primary-grid {
      grid-template-columns: 1fr;
    }

    &__col {
      height: auto;
    }

    &__degree-card {
      height: auto;
      flex: none;
    }

    &__certs-list {
      height: auto;
      flex: none;
    }
  }

  @media (max-width: 640px) {
    &__shell {
      gap: $space-4;
    }

    &__courses-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
