<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'

defineProps<{
  revealed: boolean
}>()

const emit = defineEmits<{ reveal: []; reset: [] }>()
</script>

<template>
  <div class="controls">
    <BaseButton
      v-if="!revealed"
      variant="primary"
      type="button"
      @click="emit('reveal')"
    >
      Reveal votes
    </BaseButton>
    <BaseButton
      v-else
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
