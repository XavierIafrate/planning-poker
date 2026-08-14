<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
  }>(),
  { variant: 'secondary' },
)
</script>

<template>
  <button
    class="base-button"
    :class="variant"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    opacity 0.15s;
}

.base-button:hover:not(:disabled) {
  border-color: var(--color-border-hover);
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button.primary {
  background: var(--color-accent, var(--color-heading));
  border-color: var(--color-accent, var(--color-heading));
  color: var(--color-background);
}

.base-button.primary:hover:not(:disabled) {
  filter: brightness(1.08);
}

.base-button.ghost {
  padding: 0.375rem 0.5rem;
  background: transparent;
  border-color: transparent;
}

.base-button.ghost:hover:not(:disabled) {
  background: var(--color-background-mute);
}
</style>
