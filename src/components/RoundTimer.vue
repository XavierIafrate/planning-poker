<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  seconds: number
  running: boolean
}>()

const formatted = computed(() => {
  const m = Math.floor(props.seconds / 60)
  const s = props.seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})
</script>

<template>
  <span
    class="round-timer"
    :class="{ running }"
  >
    <span
      class="dot"
      aria-hidden="true"
    />
    {{ formatted }}
  </span>
</template>

<style scoped>
.round-timer {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-variant-numeric: tabular-nums;
  font-size: 0.875rem;
  opacity: 0.75;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.35;
}

.round-timer.running .dot {
  background: var(--color-accent, currentColor);
  opacity: 1;
  animation: round-timer-pulse 1s ease-in-out infinite;
}

@keyframes round-timer-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.35);
    opacity: 0.55;
  }
}
</style>
