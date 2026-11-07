import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as YAML from 'yaml'
import { generateProfileReadmes } from './profileReadme.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Web root directory (one level up from scripts/)
const WEB_ROOT = path.resolve(__dirname, '..')
const METADATA_DIR = path.resolve(WEB_ROOT, 'metadata')
const SRC_DATA_DIR = path.resolve(WEB_ROOT, 'src/data')
const ROOT_DATA_DIR = path.resolve(WEB_ROOT, 'data')

interface ResolvedFeaturedProject {
  id: string
  name: string
  href: string
  repository?: string
  website?: string
  content: {
    en: {
      name: string
      subtitle: string
      description: string
    }
    'pt-BR': {
      name: string
      subtitle: string
      description: string
    }
  }
}

interface ProjectRecord {
  id: string
  categories?: string[]
  technologies?: string[]
  featured?: boolean
  order?: number
  links?: {
    repository?: string
    website?: string
    [key: string]: string | undefined
  }
  organizationId?: string
  content?: {
    en?: {
      title?: string
      subtitle?: string
      description?: string
      [key: string]: unknown
    }
    'pt-BR'?: {
      title?: string
      subtitle?: string
      description?: string
      [key: string]: unknown
    }
  }
  [key: string]: unknown
}

interface DisciplineRecord {
  id: string
  alias?: string
  technologies?: string[]
  featuredProjectId?: string
  featuredProjects?: Array<string | { id: string; [key: string]: unknown }>
  content?: Record<string, unknown>
  [key: string]: unknown
}

/**
 * Resolves a list of featured project identifiers/objects against projects.yml records.
 */
function resolveFeaturedProjects(
  discipline: DisciplineRecord,
  projectsMap: Map<string, ProjectRecord>,
): ResolvedFeaturedProject[] {
  const rawList: Array<string | { id: string; [key: string]: unknown }> = []

  if (Array.isArray(discipline.featuredProjects) && discipline.featuredProjects.length > 0) {
    rawList.push(...discipline.featuredProjects)
  } else if (discipline.featuredProjectId) {
    rawList.push(discipline.featuredProjectId)
  }

  const resolved: ResolvedFeaturedProject[] = []

  for (const item of rawList) {
    const projectId = typeof item === 'string' ? item : item.id
    if (!projectId) continue

    const project = projectsMap.get(projectId)
    const customObj = typeof item === 'object' ? item : {}

    const enTitle = (customObj.name as string) || project?.content?.en?.title || projectId
    const ptTitle = (customObj.name as string) || project?.content?.['pt-BR']?.title || enTitle
    const href =
      (customObj.href as string) ||
      project?.links?.repository ||
      project?.links?.website ||
      `#projects`

    resolved.push({
      id: projectId,
      name: enTitle,
      href,
      repository: project?.links?.repository,
      website: project?.links?.website,
      content: {
        en: {
          name: enTitle,
          subtitle: project?.content?.en?.subtitle || '',
          description: project?.content?.en?.description || '',
        },
        'pt-BR': {
          name: ptTitle,
          subtitle: project?.content?.['pt-BR']?.subtitle || '',
          description: project?.content?.['pt-BR']?.description || '',
        },
      },
    })
  }

  return resolved
}

async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true })
  } catch {
    // Directory already exists
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export async function convertAllYamlToJson(): Promise<void> {
  const startTime = Date.now()
  console.log(`\n\x1b[36m⚡ [parseYml]\x1b[0m Reading YAML files from \x1b[33mmetadata/\x1b[0m...`)

  await ensureDir(SRC_DATA_DIR)
  await ensureDir(ROOT_DATA_DIR)

  const entries = await fs.readdir(METADATA_DIR, { withFileTypes: true })
  const ymlFiles = entries
    .filter((entry) => entry.isFile() && (entry.name.endsWith('.yml') || entry.name.endsWith('.yaml')))
    .map((entry) => entry.name)
    .sort()

  if (ymlFiles.length === 0) {
    console.warn(`\x1b[33m⚠ [parseYml] No YAML files found in ${METADATA_DIR}\x1b[0m`)
    return
  }

  // Pass 1: Parse all YAML files into memory
  const rawModules = new Map<string, unknown>()
  for (const fileName of ymlFiles) {
    const filePath = path.join(METADATA_DIR, fileName)
    const content = await fs.readFile(filePath, 'utf8')
    try {
      const parsed = YAML.parse(content)
      const baseName = fileName.replace(/\.(yml|yaml)$/, '')
      rawModules.set(baseName, parsed)
    } catch (err) {
      console.error(`\x1b[31m✖ [parseYml] Error parsing ${fileName}:\x1b[0m`, err)
      throw err
    }
  }

  // Index projects for foreign-key resolutions
  const projectsData = rawModules.get('projects') as { projects?: ProjectRecord[] } | ProjectRecord[]
  const projectsList: ProjectRecord[] = Array.isArray(projectsData)
    ? projectsData
    : Array.isArray(projectsData?.projects)
      ? projectsData.projects
      : []

  const projectsMap = new Map<string, ProjectRecord>()
  for (const p of projectsList) {
    if (p.id) projectsMap.set(p.id, p)
  }

  // Pass 2: Enrich disciplines with resolved featured projects
  const disciplinesData = rawModules.get('disciplines') as
    | { disciplines?: DisciplineRecord[] }
    | DisciplineRecord[]

  if (disciplinesData) {
    const list: DisciplineRecord[] = Array.isArray(disciplinesData)
      ? disciplinesData
      : Array.isArray(disciplinesData.disciplines)
        ? disciplinesData.disciplines
        : []

    for (const discipline of list) {
      const resolved = resolveFeaturedProjects(discipline, projectsMap)
      discipline.featuredProjectsResolved = resolved

      // Preserve backwards-compatible single featuredProject
      if (resolved.length > 0) {
        discipline.featuredProject = {
          name: resolved[0]!.name,
          href: resolved[0]!.href,
          repository: resolved[0]!.repository,
          website: resolved[0]!.website,
        }
        discipline.featuredProjectId = resolved[0]!.id
      }
    }
  }

  // Pass 3: Write individual module JSON files to src/data/<baseName>.json
  let totalBytes = 0
  for (const [baseName, data] of rawModules.entries()) {
    const jsonStr = JSON.stringify(data, null, 2) + '\n'
    const outPath = path.join(SRC_DATA_DIR, `${baseName}.json`)
    await fs.writeFile(outPath, jsonStr, 'utf8')
    const size = Buffer.byteLength(jsonStr, 'utf8')
    totalBytes += size
    console.log(
      `  \x1b[32m✔\x1b[0m metadata/${baseName}.yml \x1b[90m→\x1b[0m src/data/${baseName}.json \x1b[90m(${formatBytes(size)})\x1b[0m`,
    )
  }

  // Pass 4: Build consolidated portfolio.json matching legacy schema
  const site = (rawModules.get('site') as Record<string, unknown>) || {}
  const profile = (rawModules.get('profile') as { profile?: unknown })?.profile ?? rawModules.get('profile')
  const sectionsObj = rawModules.get('sections') as { sections?: unknown; navigation?: unknown } | undefined
  const sections = sectionsObj?.sections ?? sectionsObj
  const navigation = sectionsObj?.navigation

  const consolidatedPortfolio: Record<string, unknown> = {
    schemaVersion: site.schemaVersion ?? 1,
    updatedAt: site.updatedAt ?? new Date().toISOString().split('T')[0],
    defaultLocale: site.defaultLocale ?? 'en',
    locales: site.locales ?? ['en', 'pt-BR'],
    assetsBaseUrl: site.assetsBaseUrl ?? '/',
    url: site.url,
    seo: site.seo,
    profile,
    navigation,
    sections,
    disciplines: (rawModules.get('disciplines') as { disciplines?: unknown })?.disciplines ?? rawModules.get('disciplines'),
    organizations: (rawModules.get('organizations') as { organizations?: unknown })?.organizations ?? rawModules.get('organizations'),
    projects: projectsList,
    experience: (rawModules.get('experience') as { experience?: unknown })?.experience ?? rawModules.get('experience'),
    skills: (rawModules.get('skills') as { skills?: unknown })?.skills ?? rawModules.get('skills'),
    education: (rawModules.get('education') as { education?: unknown })?.education ?? rawModules.get('education'),
    courses: (rawModules.get('courses') as { courses?: unknown })?.courses ?? rawModules.get('courses'),
    certifications: (rawModules.get('certifications') as { certifications?: unknown })?.certifications ?? rawModules.get('certifications'),
    resumes: (rawModules.get('resumes') as { resumes?: unknown })?.resumes ?? rawModules.get('resumes'),
    contact: (rawModules.get('contact') as { contact?: unknown })?.contact ?? rawModules.get('contact'),
  }

  const portfolioJsonStr = JSON.stringify(consolidatedPortfolio, null, 2) + '\n'
  const srcPortfolioPath = path.join(SRC_DATA_DIR, 'portfolio.json')
  const rootPortfolioPath = path.join(ROOT_DATA_DIR, 'portfolio.json')

  await fs.writeFile(srcPortfolioPath, portfolioJsonStr, 'utf8')
  await fs.writeFile(rootPortfolioPath, portfolioJsonStr, 'utf8')

  const portfolioSize = Buffer.byteLength(portfolioJsonStr, 'utf8')
  console.log(
    `  \x1b[35m★\x1b[0m Consolidated portfolio \x1b[90m→\x1b[0m src/data/portfolio.json & data/portfolio.json \x1b[90m(${formatBytes(portfolioSize)})\x1b[0m`,
  )

  await generateProfileReadmes(WEB_ROOT)
  console.log('  ✔ Profile READMEs generated from metadata: README.md & README-en.md')

  const elapsed = Date.now() - startTime
  console.log(
    `\x1b[32m✔ [parseYml] Done in ${elapsed}ms!\x1b[0m ${ymlFiles.length} modules processed (${formatBytes(totalBytes + portfolioSize)} written).\n`,
  )
}

// Execute when invoked directly: node scripts/parseYml.ts
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)
if (isMainModule) {
  convertAllYamlToJson().catch((err) => {
    console.error(`\x1b[31m✖ [parseYml] Fatal error:\x1b[0m`, err)
    process.exit(1)
  })
}
