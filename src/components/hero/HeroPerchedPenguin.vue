<script setup lang="ts">
import { ref, toRef } from 'vue'
import tuxPeekSrc from '@/assets/images/tux-peek.webp'
import { isPt } from '@/state/locale'
import { usePerchedPenguin } from './usePerchedPenguin'

const props = defineProps<{
  cardEl: HTMLElement | null
}>()

const emit = defineEmits<{
  pickUp: []
}>()

const penguinRef = ref<HTMLButtonElement | null>(null)
const cardRef = toRef(props, 'cardEl')

const {
  isDraggingPenguin,
  isReturningPenguin,
  onPenguinPointerDown,
  onPenguinPointerMove,
  onPenguinPointerUp,
} = usePerchedPenguin(penguinRef, cardRef, () => emit('pickUp'))

defineExpose({
  isDraggingPenguin,
  isReturningPenguin,
})
</script>

<template>
  <!-- Sombra de apoio / marcação sutil do poleiro quando o pinguim é puxado pra longe -->
  <span class="perched-penguin__spot" aria-hidden="true" />

  <!-- Pinguim sentado na borda superior direita do card (arrastável com retorno elástico) -->
  <button
    ref="penguinRef"
    type="button"
    class="perched-penguin"
    :class="{
      'is-dragging': isDraggingPenguin,
      'is-returning': isReturningPenguin,
    }"
    :aria-label="
      isPt
        ? 'Pinguim sentado na borda do card — arraste para brincar'
        : 'Penguin perched on the card edge — drag to play'
    "
    @pointerdown="onPenguinPointerDown"
    @pointermove="onPenguinPointerMove"
    @pointerup="onPenguinPointerUp"
    @pointercancel="onPenguinPointerUp"
  >
    <svg
      class="perched-penguin__panic"
      viewBox="0 0 36 14"
      width="36"
      height="14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 11L3 4M18 9V2M29 11L33 4"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>

    <span class="perched-penguin__bob">
      <img
        :src="tuxPeekSrc"
        alt=""
        width="195"
        height="246"
        decoding="async"
        draggable="false"
        class="perched-penguin__img"
      />
    </span>
  </button>
</template>

<style scoped lang="scss">
.perched-penguin {
  position: absolute;
  top: -47px;
  right: 20px;
  z-index: 6;
  width: 46px;
  height: 58px;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: visible;
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  // Pivota pelo topo/cabecinha quando segurado pelo cursor
  transform-origin: 50% 20%;
  transform: translate3d(var(--tux-x, 0px), var(--tux-y, 0px), 0) rotate(var(--tux-rot, 0deg));

  &__spot {
    position: absolute;
    top: -4px;
    right: 22px;
    width: 42px;
    height: 10px;
    border-radius: 999px;
    pointer-events: none;
    z-index: 4;
    background: radial-gradient(
      ellipse at 50% 50%,
      rgba(0, 0, 0, calc(0.58 * (1 - var(--tux-away, 0)))) 0%,
      transparent 74%
    );

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      border: 1px dashed rgba(255, 196, 112, 0.55);
      background: rgba(255, 196, 112, 0.08);
      opacity: var(--tux-away, 0);
      box-shadow: 0 0 12px rgba(255, 196, 112, 0.25);
    }
  }

  &:hover:not(.is-dragging):not(.is-returning),
  &:focus-visible:not(.is-dragging):not(.is-returning) {
    .perched-penguin__bob {
      transform: translate3d(0, -2.5px, 0) rotate(-3deg);
    }
  }

  &.is-dragging {
    cursor: grabbing;
    z-index: 40;
  }

  &.is-returning {
    z-index: 40;
  }

  &__panic {
    position: absolute;
    top: -11px;
    left: 50%;
    width: 32px;
    height: 12px;
    transform: translateX(-50%);
    color: #ffd89a;
    pointer-events: none;
    opacity: 0;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.7));
  }

  &.is-dragging &__panic {
    opacity: calc(var(--tux-away, 0) * 0.92);
    animation: penguin-panic-flutter 160ms steps(2, end) infinite;
  }

  &__bob {
    display: block;
    width: 100%;
    height: 100%;
    animation: penguin-perch-idle 7.5s ease-in-out infinite;
    transition: transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &.is-dragging &__bob,
  &.is-returning &__bob {
    animation: none;
    transition: none;
  }

  &__img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transform-origin: 50% 50%;
    transform: scale(var(--tux-sx, -1), var(--tux-sy, 1));
    filter: saturate(0.96) contrast(1.02) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.62))
      drop-shadow(0 1px 0 rgba(238, 236, 230, 0.14));
  }

  @media (max-width: 480px) {
    top: -42px;
    right: 16px;
    width: 42px;
    height: 53px;

    &__spot {
      right: 17px;
      width: 38px;
    }
  }
}

@keyframes penguin-perch-idle {
  0%,
  74%,
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg);
  }
  82% {
    transform: translate3d(0, -2.5px, 0) rotate(-2.5deg);
  }
  90% {
    transform: translate3d(0, -1px, 0) rotate(1.5deg);
  }
}

@keyframes penguin-panic-flutter {
  0% {
    transform: translateX(-50%) translateY(0) scale(0.96);
  }
  100% {
    transform: translateX(-50%) translateY(-2px) scale(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .perched-penguin__bob,
  .perched-penguin__panic {
    transition: none;
    animation: none;
  }
}
</style>
