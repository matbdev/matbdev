<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowUpRight, Award, Calendar, CheckCircle2, GraduationCap, X } from 'lucide-vue-next'
import { useModalDialog } from '@/composables/useModalDialog'
import { resolveImageAsset } from '@/data/imageAssets'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import { isPt } from '@/state/locale'
import type { CertificationViewModel, EducationDegreeViewModel } from './types'

const props = defineProps<{
  open: boolean
  item: EducationDegreeViewModel | CertificationViewModel | null
  type: 'degree' | 'certification' | null
}>()

const emit = defineEmits<{
  close: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const closeBtnRef = ref<HTMLButtonElement | null>(null)

useModalDialog(
  () => props.open,
  dialogRef,
  closeBtnRef,
  () => emit('close'),
)

const degreeItem = computed<EducationDegreeViewModel | null>(() =>
  props.type === 'degree' && props.item ? (props.item as EducationDegreeViewModel) : null,
)

const certItem = computed<CertificationViewModel | null>(() =>
  props.type === 'certification' && props.item ? (props.item as CertificationViewModel) : null,
)

const resolvedBadgeImage = computed(() => {
  if (!certItem.value?.image) return undefined
  return resolveImageAsset(certItem.value.image)
})

const certSyllabus = computed(() => {
  if (!certItem.value) return []
  if (certItem.value.id === 'google-cloud-ace') {
    return isPt.value
      ? [
          'Planejamento, dimensionamento e implantação de soluções corporativas na nuvem Google Cloud.',
          'Configuração e gerenciamento de Google Compute Engine e clusters Google Kubernetes Engine (GKE).',
          'Implementação de redes VPC, regras de firewall, rotas e conectividade híbrida.',
          'Segurança, governança e conformidade com IAM (gerenciamento de identidades e privilégios mínimos).',
          'Armazenamento, bancos de dados em nuvem e monitoramento contínuo com Cloud Monitoring e Cloud Logging.',
        ]
      : [
          'Planning, sizing, and deploying scalable solutions on Google Cloud Platform.',
          'Configuring and administering Google Compute Engine and Google Kubernetes Engine (GKE) clusters.',
          'Setting up VPC networking, firewall rules, routing, and hybrid connectivity.',
          'Identity, governance, and least-privilege security management via Cloud IAM.',
          'Storage, database management, and operational monitoring with Cloud Logging and Monitoring.',
        ]
  }

  if (certItem.value.id === 'airflow-3-fundamentals') {
    return isPt.value
      ? [
          'Arquitetura do Apache Airflow 3, componentes centrais (Scheduler, Webserver, Triggerer, Workers).',
          'Autoria de DAGs modernas com TaskFlow API, decoradores e boas práticas de código limpo.',
          'Mapeamento dinâmico de tarefas (Dynamic Task Mapping) para escalabilidade dinâmica.',
          'Gestão de conexões, variáveis seguras, hooks, operadores customizados e sensores.',
          'Padrões de produção para agendamento resiliente, tratamento de falhas e SLAs de engenharia de dados.',
        ]
      : [
          'Apache Airflow 3 architecture and core components (Scheduler, Webserver, Triggerer, Workers).',
          'Modern DAG authoring with the TaskFlow API, decorators, and clean pipeline patterns.',
          'Dynamic Task Mapping for runtime fan-out and scalable data parallel processing.',
          'Secure connection handling, variables, hooks, custom operators, and resilient sensors.',
          'Production orchestration best practices, SLA handling, and automated retry policies.',
        ]
  }

  return []
})

const degreePillars = computed(() => {
  return isPt.value
    ? [
        {
          title: 'Arquitetura de Software e Sistemas Distribuídos',
          description:
            'Microsserviços, mensageria, padrões arquiteturais (Clean Architecture, DDD) e escalabilidade.',
        },
        {
          title: 'Engenharia de Dados e Bancos de Dados',
          description:
            'Modelagem relacional e dimensional, processamento distribuído, pipelines analíticos e SQL avançado.',
        },
        {
          title: 'Algoritmos, Estruturas de Dados e Qualidade',
          description:
            'Complexidade computacional, testes automatizados, refatoração e otimização de performance.',
        },
        {
          title: 'Metodologias Ágeis e Projetos em Equipe',
          description:
            'Desenvolvimento colaborativo com Git, CI/CD, code review e entrega contínua (ex: projeto Deadlock).',
        },
      ]
    : [
        {
          title: 'Software Architecture & Distributed Systems',
          description:
            'Microservices, messaging, architectural patterns (Clean Architecture, DDD), and scalability.',
        },
        {
          title: 'Data Engineering & Database Systems',
          description:
            'Relational & dimensional modeling, distributed processing, analytical pipelines, and advanced SQL.',
        },
        {
          title: 'Algorithms, Data Structures & Software Quality',
          description:
            'Computational complexity, automated testing, refactoring, and performance optimization.',
        },
        {
          title: 'Collaborative Engineering & DevOps',
          description:
            'Collaborative development with Git, CI/CD, code reviews, and continuous delivery (e.g., Deadlock).',
        },
      ]
})

const verifyButtonLabel = computed(() =>
  isPt.value ? 'Verificar credencial oficial no Credly' : 'Verify official credential on Credly',
)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open && item"
        class="education-modal-overlay"
        role="presentation"
        @click.self="emit('close')"
        @wheel.self.prevent
        @touchmove.self.prevent
      >
        <div
          ref="dialogRef"
          class="education-modal"
          role="dialog"
          tabindex="-1"
          aria-modal="true"
          :aria-labelledby="`education-modal-title`"
          @wheel.stop
        >
          <!-- Header Bar with Close Button -->
          <div class="education-modal__header">
            <div class="education-modal__eyebrow">
              <span v-if="type === 'degree'" class="education-modal__type-pill">
                {{ isPt ? 'Formação acadêmica' : 'Academic degree' }}
              </span>
              <span v-else class="education-modal__type-pill">
                {{ isPt ? 'Certificação oficial' : 'Official certification' }}
              </span>
            </div>

            <button
              ref="closeBtnRef"
              type="button"
              class="education-modal__close-btn"
              :aria-label="isPt ? 'Fechar modal' : 'Close modal'"
              @click="emit('close')"
            >
              <X class="education-modal__close-icon" aria-hidden="true" />
            </button>
          </div>

          <!-- Body: Academic Degree View -->
          <div v-if="degreeItem" class="education-modal__body">
            <div class="education-modal__hero">
              <div class="education-modal__hero-icon" aria-hidden="true">
                <GraduationCap class="education-modal__icon-svg" />
              </div>

              <div class="education-modal__hero-meta">
                <div class="education-modal__tags-row">
                  <span class="education-modal__inst-pill">{{ degreeItem.institution }}</span>
                  <span class="education-modal__status-pill">
                    <span class="education-modal__status-dot" aria-hidden="true" />
                    <span>{{ isPt ? 'Em andamento' : 'In progress' }}</span>
                  </span>
                </div>

                <h3 id="education-modal-title" class="education-modal__title">
                  {{ degreeItem.degree }}
                </h3>

                <div class="education-modal__period">
                  <Calendar class="education-modal__period-icon" aria-hidden="true" />
                  <time>{{ degreeItem.period }}</time>
                </div>
              </div>
            </div>

            <p class="education-modal__overview">
              {{ degreeItem.description }}
            </p>

            <div class="education-modal__section">
              <h4 class="education-modal__section-title">
                {{ isPt ? 'Eixos de aprofundamento na Univates' : 'Focus areas & curriculum' }}
              </h4>

              <div class="education-modal__pillars-grid">
                <div
                  v-for="pillar in degreePillars"
                  :key="pillar.title"
                  class="education-modal__pillar-card"
                  @pointermove="onSpotMove"
                >
                  <div class="education-modal__pillar-head">
                    <CheckCircle2 class="education-modal__check-icon" aria-hidden="true" />
                    <h5 class="education-modal__pillar-title">{{ pillar.title }}</h5>
                  </div>
                  <p class="education-modal__pillar-text">{{ pillar.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Body: Certification View -->
          <div v-else-if="certItem" class="education-modal__body">
            <div class="education-modal__hero education-modal__hero--cert">
              <div class="education-modal__badge-wrap">
                <img
                  v-if="resolvedBadgeImage"
                  :src="resolvedBadgeImage"
                  :alt="`${certItem.issuer} — ${certItem.name}`"
                  width="112"
                  height="112"
                  class="education-modal__badge-img"
                />
              </div>

              <div class="education-modal__hero-meta">
                <div class="education-modal__tags-row">
                  <span class="education-modal__issuer-pill">{{ certItem.issuer }}</span>
                  <span class="education-modal__verified-pill">
                    <Award class="education-modal__verified-icon" aria-hidden="true" />
                    <span>{{ isPt ? 'Credly Verificado' : 'Credly Verified' }}</span>
                  </span>
                </div>

                <h3 id="education-modal-title" class="education-modal__title">
                  {{ certItem.name }}
                </h3>

                <p class="education-modal__topic">
                  {{ certItem.topic }}
                </p>

                <ul class="education-modal__tech-list" role="list">
                  <li
                    v-for="tech in certItem.technologies"
                    :key="tech"
                    class="education-modal__tech-tag"
                    @pointermove="onSpotMove"
                  >
                    {{ tech }}
                  </li>
                </ul>
              </div>
            </div>

            <div v-if="certSyllabus.length > 0" class="education-modal__section">
              <h4 class="education-modal__section-title">
                {{ isPt ? 'Competências e escopo validado' : 'Validated skills & scope' }}
              </h4>

              <ul class="education-modal__syllabus-list" role="list">
                <li
                  v-for="(itemText, idx) in certSyllabus"
                  :key="idx"
                  class="education-modal__syllabus-item"
                >
                  <CheckCircle2 class="education-modal__check-icon" aria-hidden="true" />
                  <span>{{ itemText }}</span>
                </li>
              </ul>
            </div>

            <div class="education-modal__actions">
              <a
                :href="certItem.credentialUrl"
                target="_blank"
                rel="noreferrer noopener"
                class="education-modal__verify-btn"
              >
                <span>{{ verifyButtonLabel }}</span>
                <ArrowUpRight class="education-modal__btn-arrow" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.education-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 3vw, 2.5rem);
  background: rgba(8, 9, 12, 0.78);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  overflow-y: auto;
}

.education-modal {
  position: relative;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: $radius-lg;
  background:
    radial-gradient(ellipse 75% 55% at 50% 0%, rgba(255, 176, 96, 0.05) 0%, transparent 70%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0.008) 100%), #13161d;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(255, 176, 96, 0.06);
  padding: clamp(1.5rem, 3.5vw, 2.25rem);
  display: flex;
  flex-direction: column;
  gap: $space-5;
  color: $color-ink;

  &:focus {
    outline: none;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: $space-3;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__type-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    border-radius: $radius-pill;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #a8c4e3;
    background: rgba(168, 196, 227, 0.08);
    border: 1px solid rgba(168, 196, 227, 0.2);
  }

  &__close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #c4c8d2;
    cursor: pointer;
    transition:
      color $transition-fast,
      background-color $transition-fast,
      border-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
      background-color: $color-interaction-soft;
      border-color: $color-interaction-border;
    }

    &:focus-visible {
      outline: 2px solid $color-focus;
      outline-offset: 2px;
    }
  }

  &__close-icon {
    width: 16px;
    height: 16px;
  }

  // Hero section
  &__hero {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;

    &--cert {
      align-items: center;
    }
  }

  &__hero-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: $radius-md;
    background: rgba(168, 196, 227, 0.1);
    border: 1px solid rgba(168, 196, 227, 0.25);
    color: #a8c4e3;
    flex-shrink: 0;
  }

  &__icon-svg {
    width: 26px;
    height: 26px;
  }

  &__badge-wrap {
    width: 112px;
    height: 112px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__badge-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.5));
  }

  &__hero-meta {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  &__tags-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  &__inst-pill,
  &__issuer-pill {
    font-size: 0.74rem;
    font-weight: 600;
    color: #cbd5e1;
    padding: 0.2rem 0.55rem;
    border-radius: $radius-pill;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.55rem;
    border-radius: $radius-pill;
    font-size: 0.7rem;
    font-weight: 600;
    color: #4ade80;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.25);
  }

  &__status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px rgba(74, 222, 128, 0.8);
  }

  &__verified-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.55rem;
    border-radius: $radius-pill;
    font-size: 0.7rem;
    font-weight: 600;
    color: #ffb060;
    background: rgba(255, 176, 96, 0.1);
    border: 1px solid rgba(255, 176, 96, 0.3);
  }

  &__verified-icon {
    width: 12px;
    height: 12px;
  }

  &__title {
    font-size: clamp(1.35rem, 2.5vw, 1.75rem);
    font-weight: 600;
    line-height: 1.25;
    color: #f8fafc;
    margin: 0;
    letter-spacing: -0.02em;
  }

  &__period {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    color: #94a3b8;
  }

  &__period-icon {
    width: 13px;
    height: 13px;
  }

  &__topic {
    font-size: 0.88rem;
    color: #a8c4e3;
    margin: 0;
  }

  &__tech-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    list-style: none;
    padding: 0;
    margin: 0.25rem 0 0;
  }

  &__tech-tag {
    @include amber-spot(46px, 52px);
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.58rem;
    border-radius: $radius-pill;
    font-size: 0.72rem;
    font-weight: 550;
    color: #c4c8d2;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__overview {
    font-size: clamp(0.92rem, 1.4vw, 1.02rem);
    line-height: 1.7;
    color: #d1d5db;
    margin: $space-3 0 0;
  }

  // Section details
  &__section {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    margin-top: $space-4;
    padding-top: $space-4;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__section-title {
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #94a3b8;
    margin: 0;
  }

  // Pillars grid
  &__pillars-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.75rem;
  }

  &__pillar-card {
    @include amber-spot(80px, 90px);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.95rem 1.05rem;
    border-radius: $radius-md;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition:
      border-color $transition-fast,
      background-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      border-color: $color-interaction-border;
      background: rgba(255, 176, 96, 0.035);
    }
  }

  &__pillar-head {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  &__check-icon {
    width: 14px;
    height: 14px;
    color: #ffb060;
    flex-shrink: 0;
  }

  &__pillar-title {
    font-size: 0.82rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0;
  }

  &__pillar-text {
    font-size: 0.78rem;
    line-height: 1.55;
    color: #94a3b8;
    margin: 0;
  }

  // Syllabus list
  &__syllabus-list {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__syllabus-item {
    display: flex;
    align-items: flex-start;
    gap: 0.65rem;
    font-size: 0.85rem;
    line-height: 1.6;
    color: #cbd5e1;
  }

  // Action buttons
  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: $space-4;
    padding-top: $space-4;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__verify-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.65rem 1.25rem;
    border-radius: $radius-pill;
    font-size: 0.82rem;
    font-weight: 600;
    color: #0b0d11;
    background: #ffb060;
    text-decoration: none;
    box-shadow: 0 4px 14px rgba(255, 176, 96, 0.35);
    transition:
      background-color $transition-fast,
      transform $transition-fast,
      box-shadow $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      background: #ffc478;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(255, 176, 96, 0.5);
    }

    &:focus-visible {
      outline: 2px solid $color-focus;
      outline-offset: 2px;
    }
  }

  &__btn-arrow {
    width: 14px;
    height: 14px;
  }

  @media (max-width: 640px) {
    padding: 1.25rem;
    gap: $space-4;

    &__hero {
      flex-direction: column;
      gap: 1rem;
    }

    &__badge-wrap {
      width: 80px;
      height: 80px;
    }

    &__pillars-grid {
      grid-template-columns: 1fr;
    }
  }
}

// Fade transition
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 220ms ease;

  .education-modal {
    transition:
      transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
      opacity 220ms ease;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .education-modal {
    transform: scale(0.96) translateY(8px);
    opacity: 0;
  }
}
</style>
