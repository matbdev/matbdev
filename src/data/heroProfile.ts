import { reactive } from 'vue'
import profileData from '@/data/profile.json'
import disciplinesData from '@/data/disciplines.json'
import { currentLocale } from '@/state/locale'

export type DisciplineFocus = 'overview' | 'data' | 'software'

export interface FocusContent {
  title: string
  description: string
  stack: string[]
}

const { profile } = profileData
const { disciplines } = disciplinesData
const nameParts = profile.name.split(' ')
const lastName = nameParts.length > 1 ? (nameParts.pop() ?? '') : ''

function resolveFocus(id: 'data' | 'software'): FocusContent {
  const discipline = disciplines.find((item) => item.id === id)
  if (!discipline) throw new Error(`Missing portfolio discipline: ${id}`)
  const { title, description } = discipline.content[currentLocale.value]
  return { title, description, stack: discipline.technologies }
}

export const heroProfile = reactive({
  firstName: nameParts.join(' '),
  lastName,
  fullName: profile.name,
  handle: profile.handle,
  get role() {
    const hero = profile.content[currentLocale.value].hero
    return 'role' in hero ? hero.role : profile.role
  },
  get location() {
    return profile.content[currentLocale.value].location
  },
  get description() {
    return profile.content[currentLocale.value].introduction
  },
  get portraitAlt() {
    return profile.portrait.alt[currentLocale.value]
  },
  get actions() {
    const hero = profile.content[currentLocale.value].hero
    return {
      primary: { label: hero.projectsAction, href: '#projects' },
      secondary: { label: hero.resumeAction, href: '#resume' },
    }
  },
  get socials() {
    return profile.heroSocials.flatMap((name) => {
      const social = profile.socials.find((item) => item.name === name)
      return social
        ? [
            {
              name: social.name,
              href: social.href,
              kind: social.icon === 'award' ? 'credly' : social.icon,
            },
          ]
        : []
    })
  },
  get focusContent(): Record<DisciplineFocus, FocusContent> {
    const hero = profile.content[currentLocale.value].hero
    return {
      overview: {
        title: hero.overviewTitle,
        description: hero.overviewDescription,
        stack: profile.heroTechnologies,
      },
      data: resolveFocus('data'),
      software: resolveFocus('software'),
    }
  },
})
