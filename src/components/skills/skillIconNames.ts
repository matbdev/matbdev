const iconAliases = {
  python: 'python',
  pyspark: 'pyspark',
  spark: 'pyspark',
  apachespark: 'pyspark',
  sql: 'sql',
  databricks: 'databricks',
  delta: 'delta-lake',
  deltalake: 'delta-lake',
  unitycatalog: 'unity-catalog',
  flask: 'flask',
  docker: 'docker',
  caddy: 'caddy',
  typescript: 'typescript',
  node: 'nodejs',
  nodejs: 'nodejs',
  express: 'express',
  expressjs: 'express',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  prisma: 'prisma',
  jwt: 'jwt-oauth2',
  oauth2: 'jwt-oauth2',
  jwtoauth2: 'jwt-oauth2',
  snowflake: 'snowflake',
  airflow: 'airflow',
  apacheairflow: 'airflow',
  googlecloud: 'google-cloud',
  googlecloudplatform: 'google-cloud',
  gcp: 'google-cloud',
  geospatial: 'geospatial',
  geospatialmodeling: 'geospatial',
  modelagemgeoespacial: 'geospatial',
  geoespacial: 'geospatial',
  nasaearthdata: 'geospatial',
} as const

export type SkillIconKey = (typeof iconAliases)[keyof typeof iconAliases]

/** Explicit aliases prevent unrelated tool names from matching a brand by substring. */
export function resolveSkillIconKey(name: string): SkillIconKey | undefined {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return Object.hasOwn(iconAliases, normalized)
    ? iconAliases[normalized as keyof typeof iconAliases]
    : undefined
}
