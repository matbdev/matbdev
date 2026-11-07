import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import experienceData from '../src/data/experience.json' with { type: 'json' }
import educationData from '../src/data/education.json' with { type: 'json' }
import certificationsData from '../src/data/certifications.json' with { type: 'json' }
import coursesData from '../src/data/courses.json' with { type: 'json' }
import sectionsData from '../src/data/sections.json' with { type: 'json' }

describe('Experience and Education Data Modules', () => {
  it('loads experience entries in order with complete bilingual content', () => {
    assert.equal(experienceData.experience.length, 2)
    const [developer, trainee] = experienceData.experience

    assert.ok(developer)
    assert.equal(developer.id, 'developer')
    assert.equal(developer.current, true)
    assert.equal(developer.company, 'Tramontina Multi S.A.')
    assert.ok(developer.technologies?.includes('PySpark'))
    assert.ok(developer.technologies?.includes('Databricks'))
    assert.ok(developer.content.en.title.includes('Developer'))
    assert.ok(developer.content['pt-BR']?.title.includes('Desenvolvedor'))
    assert.equal(developer.content.en.details?.length, 3)
    assert.equal(developer.content['pt-BR']?.details?.length, 3)

    assert.ok(trainee)
    assert.equal(trainee.id, 'trainee')
    assert.equal(trainee.current, false)
    assert.ok(trainee.content.en.title.includes('Trainee'))
    assert.ok(trainee.content['pt-BR']?.title.includes('Aprendiz'))
  })

  it('loads education degree with expected completion and description', () => {
    assert.equal(educationData.education.length, 1)
    const [degree] = educationData.education

    assert.ok(degree)
    assert.equal(degree.institution, 'Univates')
    assert.equal(degree.status, 'in-progress')
    assert.ok(degree.content.en.degree.includes('Software Engineering'))
    assert.ok(degree.content['pt-BR']?.degree.includes('Engenharia de Software'))
  })

  it('loads certifications with valid Credly links and tech stacks', () => {
    assert.equal(certificationsData.certifications.length, 2)
    const [gcp, airflow] = certificationsData.certifications

    assert.ok(gcp)
    assert.equal(gcp.id, 'google-cloud-ace')
    assert.equal(gcp.issuer, 'Google Cloud')
    assert.ok(gcp.credentialUrl.startsWith('https://www.credly.com/'))
    assert.ok(gcp.technologies.includes('Google Cloud'))

    assert.ok(airflow)
    assert.equal(airflow.id, 'airflow-3-fundamentals')
    assert.equal(airflow.issuer, 'Astronomer')
    assert.ok(airflow.credentialUrl.startsWith('https://www.credly.com/'))
    assert.ok(airflow.technologies.includes('Apache Airflow'))
  })

  it('loads coursework entries with valid providers and types', () => {
    assert.equal(coursesData.courses.length, 4)
    const providers = coursesData.courses.map((c) => c.content.en.provider)
    assert.ok(providers.some((p) => p.includes('Cisco')))
    assert.ok(providers.some((p) => p.includes('Red Hat')))
    assert.ok(providers.some((p) => p.includes('HackerRank')))
    assert.ok(providers.some((p) => p.includes('Databricks')))
  })

  it('contains bilingual copy for experience and learning sections', () => {
    const exp = sectionsData.sections.experience.content
    assert.ok(exp.en.title)
    assert.ok(exp['pt-BR']?.title)
    assert.ok(exp.en.introduction)
    assert.ok(exp['pt-BR']?.introduction)

    const learn = sectionsData.sections.learning.content
    assert.ok(learn.en.title)
    assert.ok(learn['pt-BR']?.title)
    assert.ok(learn.en.introduction)
    assert.ok(learn['pt-BR']?.introduction)
  })
})
