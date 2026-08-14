<script setup lang="ts">
import { useColorblindMode } from '@/composables/useColorblindMode'

const { enabled, toggle } = useColorblindMode()
</script>

<template>
  <button
    type="button"
    class="colorblind-toggle"
    role="switch"
    :aria-checked="enabled"
    @click="toggle"
  >
    Colorblind mode: {{ enabled ? 'On' : 'Off' }}
  </button>
</template>

<style scoped>
.colorblind-toggle {
  padding: 0.25rem 0.625rem;
  font-size: 0.8125rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
}

.colorblind-toggle:hover {
  border-color: var(--color-border-hover);
}

.colorblind-toggle[aria-checked='true'] {
  background: var(--color-background-mute);
  font-weight: 600;
}
</style>
