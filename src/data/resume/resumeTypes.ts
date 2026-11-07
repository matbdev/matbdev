export type ResumeDiscipline = 'data' | 'software'
export type ResumeLocale = 'en' | 'pt-BR'

export interface ResumeHeaderLink {
  label: string
  href: string
}

export interface ResumeHeader {
  name: string
  tagline: string
  location: string
  email: string
  englishLevel: string
  links: ResumeHeaderLink[]
}

export interface ResumeExperienceHighlight {
  label?: string
  text: string
}

export interface ResumeExperienceItem {
  id: string
  role: string
  company: string
  period: string
  summary?: string
  highlights: ResumeExperienceHighlight[]
}

export interface ResumeProjectItem {
  id: string
  name: string
  badge?: string
  description: string
  technologies: string[]
  repositoryUrl?: string
}

export interface ResumeSkillGroup {
  group: string
  items: string[]
}

export interface ResumeEducationItem {
  id: string
  degree: string
  institution: string
  period: string
  description?: string
}

export interface ResumeCertificationItem {
  id: string
  name: string
  issuer: string
  topic?: string
  verifyUrl?: string
}

export interface ResumeCourseItem {
  id: string
  name: string
  provider: string
}

export interface ResumeDocument {
  discipline: ResumeDiscipline
  locale: ResumeLocale
  header: ResumeHeader
  summary: string
  experience: ResumeExperienceItem[]
  projects: ResumeProjectItem[]
  skills: ResumeSkillGroup[]
  education: ResumeEducationItem[]
  certifications: ResumeCertificationItem[]
  courses: ResumeCourseItem[]
  staticPdfUrl: string
}

export interface ResumeUI {
  discipline: string
  data: string
  dataSubtitle: string
  software: string
  softwareSubtitle: string
  language: string
  previewAction: string
  downloadAction: string
  copyAction: string
  copiedSuccess: string
  closeModal: string
  summaryHeading: string
  experienceHeading: string
  projectsHeading: string
  skillsHeading: string
  educationHeading: string
  certificationsHeading: string
  present: string
  expected: string
  verified: string
  englishLevel: string
}
