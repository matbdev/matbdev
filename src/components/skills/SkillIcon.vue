<script setup lang="ts">
import { computed, ref } from 'vue'
import { CodeXml } from 'lucide-vue-next'
import airflowIcon from '@/assets/tool-icons/airflow.webp?no-inline'
import caddyIcon from '@/assets/tool-icons/caddy.webp?no-inline'
import databricksIcon from '@/assets/tool-icons/databricks.webp?no-inline'
import deltaLakeIcon from '@/assets/tool-icons/delta-lake.webp?no-inline'
import dockerIcon from '@/assets/tool-icons/docker.webp?no-inline'
import expressIcon from '@/assets/tool-icons/express.webp?no-inline'
import flaskIcon from '@/assets/tool-icons/flask.webp?no-inline'
import geospatialIcon from '@/assets/tool-icons/geospatial.webp?no-inline'
import googleCloudIcon from '@/assets/tool-icons/google-cloud.webp?no-inline'
import jwtIcon from '@/assets/tool-icons/jwt-oauth2.webp?no-inline'
import nodejsIcon from '@/assets/tool-icons/nodejs.webp?no-inline'
import postgresqlIcon from '@/assets/tool-icons/postgresql.webp?no-inline'
import prismaIcon from '@/assets/tool-icons/prisma.webp?no-inline'
import pysparkIcon from '@/assets/tool-icons/pyspark.webp?no-inline'
import pythonIcon from '@/assets/tool-icons/python.webp?no-inline'
import snowflakeIcon from '@/assets/tool-icons/snowflake.webp?no-inline'
import sqlIcon from '@/assets/tool-icons/sql.webp?no-inline'
import typescriptIcon from '@/assets/tool-icons/typescript.webp?no-inline'
import unityCatalogIcon from '@/assets/tool-icons/unity-catalog.webp?no-inline'
import { resolveSkillIconKey, type SkillIconKey } from './skillIconNames'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
  }>(),
  { size: 16 },
)

const artwork = {
  airflow: airflowIcon,
  caddy: caddyIcon,
  databricks: databricksIcon,
  'delta-lake': deltaLakeIcon,
  docker: dockerIcon,
  express: expressIcon,
  flask: flaskIcon,
  geospatial: geospatialIcon,
  'google-cloud': googleCloudIcon,
  'jwt-oauth2': jwtIcon,
  nodejs: nodejsIcon,
  postgresql: postgresqlIcon,
  prisma: prismaIcon,
  pyspark: pysparkIcon,
  python: pythonIcon,
  snowflake: snowflakeIcon,
  sql: sqlIcon,
  typescript: typescriptIcon,
  'unity-catalog': unityCatalogIcon,
} satisfies Record<SkillIconKey, string>

const iconKey = computed(() => resolveSkillIconKey(props.name))
const imageSource = computed(() => (iconKey.value ? artwork[iconKey.value] : undefined))
const failedSource = ref<string>()
const sizePx = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <span class="skill-icon" :style="{ width: sizePx, height: sizePx }" aria-hidden="true">
    <img
      v-if="imageSource && imageSource !== failedSource"
      :src="imageSource"
      width="64"
      height="64"
      alt=""
      decoding="async"
      :draggable="false"
      @error="failedSource = imageSource"
    />
    <CodeXml v-else />
  </span>
</template>

<style scoped lang="scss">
.skill-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  vertical-align: middle;
  line-height: 0;

  img,
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  img {
    object-fit: contain;
    user-select: none;
  }
}
</style>
