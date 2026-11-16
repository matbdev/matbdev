import { createRequire } from 'node:module'
import { Readable } from 'node:stream'
import PDFDocument from 'pdfkit'
import {
  buildResumeDocument,
  formatResumeSkillGroup,
  resolveResumeUI,
} from '../src/data/resume/buildResumeDocument.ts'
import type { ResumeDocument, ResumeExperienceHighlight } from '../src/data/resume/resumeTypes.ts'
import resumesData from '../src/data/resumes.json' with { type: 'json' }

const require = createRequire(import.meta.url)
const margin = 72
const bulletInset = 36
const linkColor = '#1155cc'

async function renderResume(document: ResumeDocument): Promise<Buffer> {
  const ui = resolveResumeUI(document.locale)
  const { header } = document
  const pdf = new PDFDocument({
    size: 'A4',
    margin,
    tagged: true,
    pdfVersion: '1.7',
    lang: document.locale,
    info: {
      Title: `${header.name} — ${header.tagline}`,
      Author: header.name,
      CreationDate: new Date(0),
    },
  })
  pdf
    .registerFont('Body', require.resolve('@fontsource/arimo/files/arimo-latin-400-normal.woff'))
    .registerFont('Bold', require.resolve('@fontsource/arimo/files/arimo-latin-700-normal.woff'))
    .font('Body')
    .fontSize(12)
    .lineGap(2.1)

  const structure = pdf.struct('Document')
  pdf.addStructure(structure)

  function write(tag: 'H1' | 'H2' | 'H3' | 'P', content: () => void) {
    structure.add(pdf.struct(tag, {}, content))
  }

  function keepLines(count: number) {
    const remaining = pdf.page.height - margin - pdf.y
    if (remaining < (pdf.currentLineHeight(true) + 2.1) * count) pdf.addPage()
  }

  function heading(title: string) {
    keepLines(4)
    pdf.moveDown(0.75)
    write('H2', () => pdf.font('Bold').text(title.toUpperCase()).font('Body'))
  }

  function bullet(entry: ResumeExperienceHighlight, inset = bulletInset, url?: string) {
    keepLines(2)
    write('P', () => {
      const x = margin + inset
      const width = pdf.page.width - margin - x
      pdf.circle(x - 15, pdf.y + 7, inset === bulletInset ? 2.35 : 1.6).fill()
      const options = { width, align: 'justify' as const }
      if (entry.label) {
        pdf.font('Bold').text(`${entry.label}: `, x, pdf.y, { ...options, continued: true })
        pdf.font('Body')
        if (url) pdf.fillColor(linkColor)
        pdf.text(entry.text, { ...options, continued: false, link: url })
      } else {
        if (url) pdf.fillColor(linkColor)
        pdf.text(entry.text, x, pdf.y, { ...options, link: url })
      }
      pdf.fillColor('#000000')
      pdf.x = margin
    })
  }

  write('H1', () => pdf.font('Bold').text(header.name.toUpperCase()))
  write('P', () => {
    pdf.font('Bold').text(header.tagline).font('Body')
    pdf.text([header.location, header.englishLevel].filter(Boolean).join(' | '))
    pdf.fillColor(linkColor).text(header.email, { link: `mailto:${header.email}` })
    header.links.forEach(({ label, href }, i) => {
      if (i) pdf.fillColor('#000000').text(' | ', { link: null, continued: true })
      pdf.fillColor(linkColor).text(label, {
        link: href,
        continued: i < header.links.length - 1,
      })
    })
    pdf.fillColor('#000000')
  })

  if (document.summary) {
    heading(ui.summaryHeading)
    write('P', () => pdf.text(document.summary, { align: 'justify', indent: bulletInset }))
  }
  if (document.education.length) {
    heading(ui.educationHeading)
    for (const item of document.education) {
      bullet({ text: `${item.degree} — ${item.institution} | ${item.period}` })
    }
  }
  if (document.certifications.length || document.courses.length) {
    heading(ui.certificationsHeading)
    for (const item of document.certifications) {
      bullet({ text: `${item.issuer} — ${item.name}` }, bulletInset, item.verifyUrl)
    }
    for (const item of document.courses) {
      bullet({ text: `${item.provider} — ${item.name}` })
    }
  }
  if (document.experience.length) {
    heading(ui.experienceHeading)
    for (const [i, item] of document.experience.entries()) {
      keepLines(4)
      if (i) pdf.moveDown(0.5)
      write('H3', () =>
        pdf.font('Bold').text(`${item.company} — ${item.role} | ${item.period}`).font('Body'),
      )
      for (const highlight of item.highlights) bullet(highlight)
    }
  }
  if (document.projects.length) {
    heading(ui.projectsHeading)
    for (const item of document.projects) {
      bullet({ label: item.name, text: item.description })
      for (const highlight of item.highlights ?? []) bullet(highlight, bulletInset + 18)
    }
  }
  if (document.skills.length) {
    heading(ui.skillsHeading)
    for (const group of document.skills) {
      const text = formatResumeSkillGroup(group)
      if (text) bullet({ label: group.group, text: text.endsWith('.') ? text : `${text}.` })
    }
  }
  if (document.awards.length) {
    heading(ui.awardsHeading)
    for (const item of document.awards) bullet(item)
  }

  pdf.end()
  return Buffer.concat(await (pdf as Readable).toArray())
}

export async function createResumePdfs(): Promise<Map<string, Buffer>> {
  const files = new Map<string, Buffer>()
  for (const discipline of ['data', 'software'] as const) {
    for (const locale of ['en', 'pt-BR'] as const) {
      const document = buildResumeDocument(discipline, locale)
      if (!/^\/assets\/resumes\/[\w-]+\.pdf$/u.test(document.pdfUrl)) {
        throw new Error(`Invalid résumé PDF path: ${document.pdfUrl}`)
      }
      if (files.has(document.pdfUrl))
        throw new Error(`Duplicate résumé PDF path: ${document.pdfUrl}`)
      files.set(document.pdfUrl, await renderResume(document))
    }
  }
  if (files.size !== resumesData.resumes.length) {
    throw new Error(
      'The résumé metadata must provide one PDF path per supported discipline and language',
    )
  }
  return files
}
