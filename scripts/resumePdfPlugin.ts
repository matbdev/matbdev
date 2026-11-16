import type { Plugin } from 'vite'
import { createResumePdfs } from './resumePdf.ts'

export function resumePdfPlugin(): Plugin {
  return {
    name: 'portfolio-resume-pdfs',
    async configureServer(server) {
      const files = await createResumePdfs()
      server.middlewares.use((request, response, next) => {
        if (request.method !== 'GET' && request.method !== 'HEAD') return next()
        const path = request.url?.split('?')[0]
        const file = path ? files.get(path) : undefined
        if (!file) return next()
        response.setHeader('Content-Type', 'application/pdf')
        response.setHeader('Content-Length', file.length)
        response.end(request.method === 'HEAD' ? undefined : file)
      })
    },
    async generateBundle() {
      for (const [url, source] of await createResumePdfs()) {
        this.emitFile({ type: 'asset', fileName: url.slice(1), source })
      }
    },
  }
}
