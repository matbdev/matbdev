import { ArrowUpRight, Award, ExternalLink, FolderGit2, Globe } from 'lucide-vue-next'
import type { HighlightLinkKind } from '@/data/skills/types'

const linkIcons = {
  repository: FolderGit2,
  organization: FolderGit2,
  website: Globe,
  credential: Award,
  linkedin: ExternalLink,
} satisfies Record<HighlightLinkKind, typeof ArrowUpRight>

export function resolveHighlightLinkIcon(kind: HighlightLinkKind) {
  return linkIcons[kind] ?? ArrowUpRight
}
