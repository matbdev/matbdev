export interface EducationDegreeViewModel {
  id: string
  institution: string
  degree: string
  period: string
  status: string
  description: string
}

export interface CertificationViewModel {
  id: string
  name: string
  issuer: string
  image?: string
  credentialUrl: string
  topic: string
  technologies: string[]
}

export interface CourseViewModel {
  id: string
  name: string
  provider: string
  type: string
  courseCount?: number
}
