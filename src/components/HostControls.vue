<script setup lang="ts">
defineProps<{
  revealed: boolean
}>()

const emit = defineEmits<{ reveal: []; reset: [] }>()
</script>

<template>
  <div class="controls">
    <button
      v-if="!revealed"
      type="button"
      @click="emit('reveal')"
    >
      Reveal votes
    </button>
    <button
      v-else
      type="button"
      @click="emit('reset')"
    >
      New round
    </button>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  font-weight: 600;
}
</style>
