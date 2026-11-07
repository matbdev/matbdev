/**
 * Resolves image paths written in the YAML metadata (e.g. `/assets/images/foo.webp`)
 * to the fingerprinted URLs Vite generates for files in `src/assets/images/`.
 *
 * Matching is done by file name, so the folder written in the YAML does not
 * need to mirror the real location of the asset.
 */
const bundledImages = import.meta.glob<string>('@/assets/images/*.{webp,png,jpg,jpeg,svg}', {
  eager: true,
  import: 'default',
})

const imagesByFileName = new Map<string, string>(
  Object.entries(bundledImages).map(([path, url]) => [fileNameOf(path), url]),
)

function fileNameOf(path: string): string {
  return path.split('/').pop() ?? path
}

/** Returns the bundled URL for a metadata image path, or `undefined` when it does not exist. */
export function resolveImageAsset(metadataPath: string | undefined): string | undefined {
  if (!metadataPath) return undefined
  return imagesByFileName.get(fileNameOf(metadataPath))
}
