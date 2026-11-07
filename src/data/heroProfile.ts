import { reactive } from 'vue'
import profileData from '@/data/profile.json'
import disciplinesData from '@/data/disciplines.json'
import { currentLocale } from '@/state/locale'

export type DisciplineFocus = 'overview' | 'data' | 'software'

export interface SocialLink {
  name: string
  href: string
  kind: 'github' | 'linkedin' | 'credly'
}

export interface FocusOption {
  key: Exclude<DisciplineFocus, 'overview'>
  label: string
}

export interface FocusContent {
  title: string
  description: string
  stack: string[]
}

const rawProfile =
  (profileData as { profile?: typeof profileData.profile }).profile ?? profileData.profile
const rawDisciplines =
  (disciplinesData as { disciplines?: typeof disciplinesData.disciplines }).disciplines ??
  disciplinesData.disciplines

function resolveDiscipline(id: 'data' | 'software') {
  return rawDisciplines.find((d: { id: string; alias?: string }) => d.id === id || d.alias === id)
}

/**
 * Reactive, localized Hero Profile.
 * Automatically updates its properties whenever `currentLocale` changes.
 */
export const heroProfile = reactive({
  get firstName() {
    return 'Mateus Carniel'
  },
  get lastName() {
    return 'Brambilla'
  },
  get fullName() {
    return rawProfile.name || 'Mateus Carniel Brambilla'
  },
  get handle() {
    return rawProfile.handle || 'matbdev'
  },
  get githubHref() {
    return 'https://github.com/matbdev'
  },
  get role() {
    return currentLocale.value === 'pt-BR'
      ? 'Engenharia de Dados e Software'
      : rawProfile.role || 'Data & Software Engineer'
  },
  get currentRole() {
    const loc = currentLocale.value
    return loc === 'pt-BR'
      ? rawProfile.content?.['pt-BR']?.currentRole || 'Desenvolvedor na Tramontina'
      : rawProfile.content?.en?.currentRole || 'Developer at Tramontina'
  },
  get location() {
    const loc = currentLocale.value
    return loc === 'pt-BR'
      ? rawProfile.content?.['pt-BR']?.location || 'Rio Grande do Sul, Brasil'
      : rawProfile.content?.en?.location || 'Rio Grande do Sul, Brazil'
  },
  get educationLine() {
    const loc = currentLocale.value
    return loc === 'pt-BR'
      ? rawProfile.content?.['pt-BR']?.educationSummary || 'Engenharia de Software · Univates'
      : rawProfile.content?.en?.educationSummary || 'Software Engineering · Univates'
  },
  get description() {
    const loc = currentLocale.value
    return loc === 'pt-BR'
      ? rawProfile.content?.['pt-BR']?.introduction ||
          'Sou desenvolvedor e atuo com engenharia de dados, sistemas backend e IA aplicada. Transformando problemas complexos em soluções úteis e confiáveis.'
      : rawProfile.content?.en?.introduction ||
          'I’m a developer working across data engineering, backend systems and applied AI. Turning complex problems into useful, reliable solutions.'
  },
  get portraitAlt() {
    const loc = currentLocale.value
    return loc === 'pt-BR'
      ? 'Retrato de Mateus Carniel Brambilla'
      : 'Mateus Carniel Brambilla portrait'
  },
  get actions() {
    const loc = currentLocale.value
    return {
      primary: {
        label: loc === 'pt-BR' ? 'Explorar projetos' : 'Explore my work',
        href: '#projects',
      },
      secondary: {
        label: loc === 'pt-BR' ? 'Baixar currículo' : 'Get my résumé',
        href: '#resume',
      },
    }
  },
  get socials(): SocialLink[] {
    return [
      { name: 'GitHub', href: 'https://github.com/matbdev', kind: 'github' },
      {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/in/mateus-carniel-brambilla/',
        kind: 'linkedin',
      },
      {
        name: 'Credly',
        href: 'https://www.credly.com/users/mateus-carniel-brambilla.0c10944d',
        kind: 'credly',
      },
    ]
  },
  get focusOptions(): FocusOption[] {
    const loc = currentLocale.value
    return [
      { key: 'data', label: loc === 'pt-BR' ? 'Engenharia de dados' : 'Data engineering' },
      {
        key: 'software',
        label: loc === 'pt-BR' ? 'Engenharia de software' : 'Software engineering',
      },
    ]
  },
  get focusContent(): Record<DisciplineFocus, FocusContent> {
    const loc = currentLocale.value
    const isPt = loc === 'pt-BR'

    const dataDisc = resolveDiscipline('data')
    const softDisc = resolveDiscipline('software')

    const dataContent = isPt ? dataDisc?.content?.['pt-BR'] : dataDisc?.content?.en
    const softContent = isPt ? softDisc?.content?.['pt-BR'] : softDisc?.content?.en

    return {
      overview: {
        title: isPt ? 'Duas áreas, conectadas.' : 'Two areas, connected.',
        description: isPt
          ? 'Explore as ferramentas e projetos por trás de cada parte do meu trabalho.'
          : 'Explore the tools and projects behind each part of my work.',
        stack: ['Python', 'SQL', 'TypeScript', 'Databricks'],
      },
      data: {
        title:
          dataContent?.title ||
          (isPt ? 'Pipelines, contexto e IA aplicada.' : 'Pipelines, context & applied AI.'),
        description:
          dataContent?.description ||
          (isPt
            ? 'Atuação em produção com Databricks e pipelines, além de projetos geoespaciais.'
            : 'Production work with Databricks and data pipelines, plus geospatial projects.'),
        stack: (dataDisc?.technologies as string[]) || [
          'PySpark',
          'SQL',
          'Databricks',
          'Delta Lake',
        ],
      },
      software: {
        title:
          softContent?.title || (isPt ? 'Backend, APIs e entrega.' : 'Backend, APIs & delivery.'),
        description:
          softContent?.description ||
          (isPt
            ? 'Regras de negócio, integrações entre sistemas e aplicações em containers.'
            : 'Business rules, system integrations and containerized applications.'),
        stack: (softDisc?.technologies as string[]) || ['Python', 'Flask', 'TypeScript', 'Docker'],
      },
    }
  },
})
