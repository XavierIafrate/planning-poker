<script setup lang="ts">
defineProps<{
  cards: readonly string[]
  selected: string | null
  disabled: boolean
}>()

const emit = defineEmits<{ select: [card: string] }>()
</script>

<template>
  <div class="deck">
    <button
      v-for="card in cards"
      :key="card"
      type="button"
      class="card"
      :class="{ active: card === selected }"
      :disabled="disabled"
      @click="emit('select', card)"
    >
      {{ card }}
    </button>
  </div>
</template>

<style scoped>
.deck {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.card {
  width: 3.5rem;
  height: 5rem;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-background);
  font-size: 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.1s,
    border-color 0.1s;
}

.card:hover:not(:disabled) {
  transform: translateY(-4px);
}

.card.active {
  border-color: var(--color-heading);
  background: var(--color-heading);
  color: var(--color-background);
}

.card:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
