export interface ExperienceDetail {
  id: string
  title: string
  text: string
}

export interface ExperienceRoleViewModel {
  id: string
  company: string
  title: string
  period: string
  isCurrent: boolean
  summary: string
  description?: string
  details?: ExperienceDetail[]
  technologies?: string[]
  note?: string
}
