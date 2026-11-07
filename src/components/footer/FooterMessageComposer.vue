<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  ArrowUpRight,
  Briefcase,
  Check,
  Code2,
  Copy,
  Layers,
  MessageSquare,
  RotateCcw,
  Send,
} from 'lucide-vue-next'
import contactData from '@/data/contact.json'
import profileData from '@/data/profile.json'
import { onSpotMove } from '@/composables/useAmberSpotlight'
import { isPt } from '@/state/locale'

interface RawIntentContent {
  label: string
  subject: string
  body: string
}

interface RawIntentItem {
  id: string
  icon: string
  content: {
    en: RawIntentContent
    'pt-BR': RawIntentContent
  }
}

const rawProfile =
  (profileData as { profile?: typeof profileData.profile }).profile ?? profileData.profile

const email = rawProfile.email || 'mateus@matbdev.com'
const intents = (contactData.contact.intents || []) as RawIntentItem[]
const defaultIntentId = contactData.contact.defaultIntentId || intents[0]?.id || 'opportunity'

const uiCopy = computed(() => {
  const ui = contactData.contact.ui.content
  return isPt.value ? ui['pt-BR'] : ui.en
})

const selectedIntent = ref<string>(defaultIntentId)
const senderIdentity = ref('')
const messageText = ref('')
const isMessageEdited = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
let textareaResizeObserver: ResizeObserver | null = null

function syncTextareaHeight() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.max(el.scrollHeight + 2, 108)}px`
}

function getIntentById(id: string): RawIntentItem {
  return intents.find((item) => item.id === id) ?? intents[0]!
}

function getIntentCopy(id: string, pt: boolean): RawIntentContent {
  const item = getIntentById(id)
  return pt ? item.content['pt-BR'] : item.content.en
}

// Initialize with default preset from contact.json
messageText.value = getIntentCopy(selectedIntent.value, isPt.value).body

function selectIntent(id: string) {
  selectedIntent.value = id
  if (!isMessageEdited.value) {
    messageText.value = getIntentCopy(id, isPt.value).body
    void nextTick(syncTextareaHeight)
  }
}

function onMessageInput() {
  const defaultBody = getIntentCopy(selectedIntent.value, isPt.value).body
  isMessageEdited.value = messageText.value.trim() !== defaultBody.trim()
  syncTextareaHeight()
}

function resetTemplate() {
  isMessageEdited.value = false
  messageText.value = getIntentCopy(selectedIntent.value, isPt.value).body
  void nextTick(syncTextareaHeight)
}

watch(isPt, (pt) => {
  if (!isMessageEdited.value) {
    messageText.value = getIntentCopy(selectedIntent.value, pt).body
    void nextTick(syncTextareaHeight)
  }
})

const composedSubject = computed(() => {
  const base = getIntentCopy(selectedIntent.value, isPt.value).subject
  const cleanSender = senderIdentity.value.trim()
  return cleanSender ? `${base} — ${cleanSender}` : base
})

const composedBody = computed(() => {
  const fallback = getIntentCopy(selectedIntent.value, isPt.value).body
  const body = messageText.value.trim() || fallback
  const cleanSender = senderIdentity.value.trim()
  if (!cleanSender) return body
  return `${body}\n\n— ${uiCopy.value.senderSignaturePrefix}: ${cleanSender}`
})

const mailtoHref = computed(() => {
  const subject = encodeURIComponent(composedSubject.value)
  const body = encodeURIComponent(composedBody.value)
  return `mailto:${email}?subject=${subject}&body=${body}`
})

const draftCopyState = ref<'idle' | 'copied' | 'failed'>('idle')
let draftCopyTimer: ReturnType<typeof setTimeout> | null = null

async function copyDraft() {
  try {
    await navigator.clipboard.writeText(`${composedSubject.value}\n\n${composedBody.value}`)
    draftCopyState.value = 'copied'
  } catch {
    draftCopyState.value = 'failed'
  }

  if (draftCopyTimer !== null) clearTimeout(draftCopyTimer)
  draftCopyTimer = setTimeout(() => {
    draftCopyState.value = 'idle'
    draftCopyTimer = null
  }, 2200)
}

onMounted(() => {
  syncTextareaHeight()
  if (typeof ResizeObserver !== 'undefined' && textareaRef.value) {
    textareaResizeObserver = new ResizeObserver(() => {
      syncTextareaHeight()
    })
    textareaResizeObserver.observe(textareaRef.value)
  }
})

onUnmounted(() => {
  if (draftCopyTimer !== null) clearTimeout(draftCopyTimer)
  textareaResizeObserver?.disconnect()
})
</script>

<template>
  <form class="composer" @submit.prevent>
    <div class="composer__header">
      <span class="composer__label">
        {{ uiCopy.composerHeader }}
      </span>

      <button v-if="isMessageEdited" type="button" class="composer__reset" @click="resetTemplate">
        <RotateCcw class="composer__reset-icon" aria-hidden="true" />
        <span>{{ uiCopy.resetTemplate }}</span>
      </button>
    </div>

    <!-- Topic Selector Pills (from metadata/contact.yml -> src/data/contact.json) -->
    <div class="composer__intents" role="group" :aria-label="uiCopy.topicGroupAria">
      <button
        v-for="preset in intents"
        :key="preset.id"
        type="button"
        class="composer__intent-btn"
        :aria-pressed="selectedIntent === preset.id"
        @pointermove="onSpotMove"
        @click="selectIntent(preset.id)"
      >
        <Briefcase
          v-if="preset.icon === 'briefcase'"
          class="composer__intent-icon"
          aria-hidden="true"
        />
        <Code2
          v-else-if="preset.icon === 'code'"
          class="composer__intent-icon"
          aria-hidden="true"
        />
        <Layers
          v-else-if="preset.icon === 'layers'"
          class="composer__intent-icon"
          aria-hidden="true"
        />
        <MessageSquare v-else class="composer__intent-icon" aria-hidden="true" />
        <span class="composer__intent-text">
          {{ isPt ? preset.content['pt-BR'].label : preset.content.en.label }}
        </span>
      </button>
    </div>

    <!-- Optional Sender Name / Company -->
    <div class="composer__field">
      <label for="footer-sender" class="composer__field-label">
        {{ uiCopy.senderLabel }}
      </label>
      <input
        id="footer-sender"
        v-model="senderIdentity"
        type="text"
        autocomplete="name"
        :placeholder="uiCopy.senderPlaceholder"
        class="composer__input"
      />
    </div>

    <!-- Auto-populated Editable Message -->
    <div class="composer__field">
      <label for="footer-message" class="composer__field-label">
        <span>{{ uiCopy.messageLabel }}</span>
      </label>
      <textarea
        id="footer-message"
        ref="textareaRef"
        v-model="messageText"
        rows="4"
        class="composer__textarea"
        @input="onMessageInput"
      />
    </div>

    <!-- Composer Actions -->
    <div class="composer__actions">
      <a :href="mailtoHref" target="_blank" rel="noopener noreferrer" class="composer__send-btn">
        <Send class="composer__send-icon" aria-hidden="true" />
        <span class="composer__send-text">
          {{ uiCopy.sendEmailButton }}
        </span>
        <ArrowUpRight class="composer__send-arrow" aria-hidden="true" />
      </a>

      <button
        type="button"
        class="composer__copy-draft"
        :class="{ 'is-copied': draftCopyState === 'copied' }"
        @pointermove="onSpotMove"
        @click="copyDraft"
      >
        <Check v-if="draftCopyState === 'copied'" class="composer__draft-icon" aria-hidden="true" />
        <Copy v-else class="composer__draft-icon" aria-hidden="true" />
        <span class="composer__draft-text">
          <template v-if="draftCopyState === 'copied'">
            {{ uiCopy.copiedDraftButton }}
          </template>
          <template v-else>
            {{ uiCopy.copyDraftButton }}
          </template>
        </span>
      </button>
    </div>

    <span class="composer__sr-status" role="status" aria-live="polite">
      <template v-if="draftCopyState === 'copied'">
        {{ uiCopy.copiedDraftSr }}
      </template>
    </span>
  </form>
</template>

<style scoped lang="scss">
@use '@/assets/spotlight' as *;

.composer {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  padding: $space-5;
  border-radius: $radius-lg;
  background-color: #13161b;
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-2;
    min-height: 20px;
  }

  &__label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: #c8cbd2;
  }

  &__reset {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    padding: 0.14rem 0.48rem;
    border-radius: $radius-pill;
    font-size: 0.65rem;
    font-weight: 500;
    color: #ffb060;
    background-color: rgba(255, 176, 96, 0.1);
    border: 1px solid rgba(255, 176, 96, 0.28);
    transition:
      background-color $transition-fast,
      border-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      background-color: rgba(255, 176, 96, 0.18);
      border-color: $color-interaction-border;
    }
  }

  &__reset-icon {
    width: 11px;
    height: 11px;
  }

  &__intents {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.4rem;
  }

  &__intent-btn {
    @include amber-spot(90px, 102px);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.34rem;
    padding: 0.45rem 0.5rem;
    border-radius: $radius-pill;
    background-color: #181b21;
    border: 1px solid rgba(255, 255, 255, 0.07);
    font-size: 0.68rem;
    font-weight: 500;
    color: #b8bcc4;
    white-space: nowrap;
    transition:
      color $transition-fast,
      background-color $transition-fast,
      border-color $transition-fast,
      box-shadow $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
    }

    &[aria-pressed='true'] {
      color: $color-ink;
      border-color: rgba(255, 212, 136, 0.38);
      background: linear-gradient(
        135deg,
        rgba(255, 196, 112, 0.2) 0%,
        rgba(255, 176, 96, 0.08) 65%,
        rgba(24, 27, 33, 0.95) 100%
      );
      box-shadow: inset 0 1px 0 rgba(255, 246, 216, 0.24);

      .composer__intent-icon {
        color: #ffb060;
      }
    }
  }

  &__intent-icon,
  &__intent-text {
    position: relative;
    z-index: 1;
  }

  &__intent-icon {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    transition: color $transition-fast;
  }

  &__intent-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  &__field-label {
    font-size: 0.67rem;
    color: $color-muted;
  }

  &__input,
  &__textarea {
    width: 100%;
    padding: 0.62rem 0.8rem;
    border-radius: $radius-sm;
    background-color: #0d0f13;
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.76rem;
    line-height: 1.55;
    color: $color-ink;
    transition:
      border-color $transition-fast,
      box-shadow $transition-fast;

    &::placeholder {
      color: #676c75;
    }

    &:focus {
      outline: none;
      border-color: rgba(255, 196, 112, 0.46);
      box-shadow: 0 0 0 3px rgba(255, 176, 96, 0.1);
    }
  }

  &__textarea {
    resize: vertical;
    min-height: 6.75rem;
    overflow-y: hidden;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $space-2;
    margin-top: $space-1;
  }

  &__send-btn {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0.65rem 1.1rem;
    border-radius: $radius-pill;
    font-size: 0.74rem;
    font-weight: 600;
    color: $color-ink;
    border: 1px solid rgba(255, 212, 136, 0.34);
    background: linear-gradient(
      135deg,
      rgba(255, 196, 112, 0.22) 0%,
      rgba(255, 176, 96, 0.1) 60%,
      #181b21 100%
    );
    box-shadow: inset 0 1px 0 rgba(255, 246, 216, 0.24);
    transition:
      border-color $transition-fast,
      transform $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      border-color: $color-interaction-border;

      .composer__send-arrow {
        transform: translate(2px, -2px);
      }
    }
  }

  &__send-icon,
  &__send-text,
  &__send-arrow {
    position: relative;
    z-index: 1;
  }

  &__send-icon {
    width: 13px;
    height: 13px;
    color: #ffb060;
    flex-shrink: 0;
  }

  &__send-arrow {
    width: 13px;
    height: 13px;
    opacity: 0.8;
    transition: transform $transition-fast;
  }

  &__copy-draft {
    @include amber-spot(100px, 112px);

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.38rem;
    padding: 0.65rem 0.95rem;
    border-radius: $radius-pill;
    background-color: #181b21;
    border: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.72rem;
    font-weight: 500;
    color: #c8cbd2;
    white-space: nowrap;
    transition:
      color $transition-fast,
      border-color $transition-fast,
      background-color $transition-fast;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      color: $color-interaction;
    }

    &.is-copied {
      color: $color-ink;
      border-color: rgba(255, 196, 112, 0.42);
      background-color: #221d18;

      .composer__draft-icon {
        color: #ffb060;
      }
    }
  }

  &__draft-icon,
  &__draft-text {
    position: relative;
    z-index: 1;
  }

  &__draft-icon {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  &__sr-status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (max-width: 1180px) and (min-width: 961px) {
    &__intents {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    &__input,
    &__textarea {
      // 16px on mobile/tablet prevents iOS Safari & mobile Chrome from auto-zooming on focus
      font-size: 1rem;
    }
  }

  @media (max-width: 640px) {
    padding: $space-4;

    &__intents {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__intent-btn {
      min-height: 38px;
    }
  }

  @media (max-width: 520px) {
    &__actions {
      flex-direction: column;
      align-items: stretch;
    }

    &__send-btn,
    &__copy-draft {
      min-height: 44px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &__intent-btn,
    &__send-btn,
    &__send-arrow,
    &__copy-draft,
    &__input,
    &__textarea,
    &__reset {
      transition: none;
    }
  }
}
</style>
