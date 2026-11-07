export interface ProjectMediaImage {
  type: 'image'
  src: string
  alt: string
  width?: number
  height?: number
}

export interface ProjectMediaConcept {
  type: 'concept'
  variant: string
  label: string
}

export type ProjectMedia = ProjectMediaImage | ProjectMediaConcept

export interface ProjectLinks {
  repository?: string
  website?: string
}

export interface ProjectViewModel {
  id: string
  title: string
  subtitle: string
  context: string
  badge: string
  description: string
  problem: string
  contribution: string
  detailContext?: string
  diagram?: string[]
  categories: string[]
  technologies: string[]
  highlight: boolean
  order: number
  links: ProjectLinks
  media: ProjectMedia
}
