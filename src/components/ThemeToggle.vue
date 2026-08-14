<script setup lang="ts">
import { useTheme, type ThemePreference } from '@/composables/useTheme'

const { theme, setTheme } = useTheme()

const options: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]
</script>

<template>
  <div
    class="theme-toggle"
    role="group"
    aria-label="Theme"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="{ active: theme === option.value }"
      @click="setTheme(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  overflow: hidden;
}

.theme-toggle button {
  padding: 0.25rem 0.625rem;
  font-size: 0.8125rem;
  cursor: pointer;
  background: transparent;
  color: var(--color-text);
  border: none;
}

.theme-toggle button + button {
  border-left: 1px solid var(--color-border);
}

.theme-toggle button.active {
  background: var(--color-background-mute);
  font-weight: 600;
}
</style>
