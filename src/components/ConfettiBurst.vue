<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{ done: [] }>()

const COLORS = ['#16a34a', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0d9488', '#facc15']
const PIECE_COUNT = 90
const DURATION_MS = 2600

interface Piece {
  left: number
  color: string
  delay: number
  duration: number
  width: number
  height: number
  rotation: number
  drift: number
}

const pieces: Piece[] = Array.from({ length: PIECE_COUNT }, () => ({
  left: Math.random() * 100,
  color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
  delay: Math.random() * 0.3,
  duration: 1.8 + Math.random() * 1.2,
  width: 6 + Math.random() * 6,
  height: 3 + Math.random() * 5,
  rotation: 360 + Math.random() * 360,
  drift: (Math.random() - 0.5) * 140,
}))

let timeoutId: ReturnType<typeof setTimeout> | null = null
onMounted(() => {
  timeoutId = setTimeout(() => emit('done'), DURATION_MS)
})
onUnmounted(() => {
  if (timeoutId !== null) clearTimeout(timeoutId)
})
</script>

<template>
  <div
    class="confetti"
    aria-hidden="true"
  >
    <span
      v-for="(piece, index) in pieces"
      :key="index"
      class="piece"
      :style="{
        left: piece.left + '%',
        backgroundColor: piece.color,
        animationDelay: piece.delay + 's',
        animationDuration: piece.duration + 's',
        width: piece.width + 'px',
        height: piece.height + 'px',
        '--rotation': piece.rotation + 'deg',
        '--drift': piece.drift + 'px',
      }"
    />
  </div>
</template>

<style scoped>
.confetti {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 50;
}

.piece {
  position: absolute;
  top: -10px;
  border-radius: 1px;
  opacity: 0;
  animation-name: confetti-fall;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--drift), 105vh) rotate(var(--rotation));
    opacity: 0.9;
  }
}
</style>
