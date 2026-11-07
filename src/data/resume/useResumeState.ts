import { computed, ref } from 'vue'
import type { ResumeDiscipline, ResumeDocument, ResumeLocale, ResumeUI } from './resumeTypes'
import { buildResumeDocument, resolveResumeUI } from './buildResumeDocument'
import { resumeToMarkdown } from './resumeToMarkdown'
import { currentLocale } from '@/state/locale'

export function useResumeState() {
  const selectedDiscipline = ref<ResumeDiscipline>('data')
  // The document's language is independent from the website language
  const selectedLocale = ref<ResumeLocale>(currentLocale.value === 'pt-BR' ? 'pt-BR' : 'en')

  // Document itself is resolved using the selected document language and discipline
  const document = computed<ResumeDocument>(() =>
    buildResumeDocument(selectedDiscipline.value, selectedLocale.value),
  )

  // Controls UI strings ALWAYS follow the website language (currentLocale)
  const controlsUi = computed<ResumeUI>(() =>
    resolveResumeUI(currentLocale.value === 'pt-BR' ? 'pt-BR' : 'en'),
  )

  // Document UI strings follow the chosen document language (selectedLocale)
  const docUi = computed<ResumeUI>(() => resolveResumeUI(selectedLocale.value))

  const markdown = computed<string>(() => resumeToMarkdown(document.value, docUi.value))

  const isCopied = ref(false)
  let copiedTimer: ReturnType<typeof setTimeout> | undefined

  async function copyMarkdown() {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(markdown.value)
      isCopied.value = true
      if (copiedTimer) clearTimeout(copiedTimer)
      copiedTimer = setTimeout(() => {
        isCopied.value = false
      }, 2500)
    } catch {
      // Ignore clipboard error
    }
  }

  return {
    selectedDiscipline,
    selectedLocale,
    document,
    controlsUi,
    docUi,
    markdown,
    isCopied,
    copyMarkdown,
  }
}
