<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import type { RoomPhase } from '@/types/room'

defineProps<{
  phase: RoomPhase
}>()

const emit = defineEmits<{ 'start-voting': []; reveal: []; reset: [] }>()
</script>

<template>
  <div class="controls">
    <BaseButton
      v-if="phase === 'discussion'"
      variant="primary"
      type="button"
      @click="emit('start-voting')"
    >
      Start voting
    </BaseButton>
    <BaseButton
      v-else-if="phase === 'voting'"
      variant="primary"
      type="button"
      @click="emit('reveal')"
    >
      Reveal votes
    </BaseButton>
    <BaseButton
      v-else-if="phase === 'revealed'"
      variant="primary"
      type="button"
      @click="emit('reset')"
    >
      New round
    </BaseButton>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 0.5rem;
}
</style>
