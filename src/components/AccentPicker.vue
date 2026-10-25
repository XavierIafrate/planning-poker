<script setup lang="ts">
import { computed } from 'vue'
import { ACCENT_COLORS } from '@/constants/theme'
import { useTheme } from '@/composables/useTheme'
import type { AccentColorId } from '@/types/room'

defineProps<{
  modelValue: AccentColorId
}>()

const emit = defineEmits<{ 'update:modelValue': [color: AccentColorId] }>()

const { isDark } = useTheme()

const swatches = computed(() =>
  (Object.entries(ACCENT_COLORS) as [AccentColorId, (typeof ACCENT_COLORS)[AccentColorId]][]).map(
    ([id, definition]) => ({
      id,
      label: definition.label,
      hex: isDark.value ? definition.dark : definition.light,
    }),
  ),
)
</script>

<template>
  <div
    class="accent-picker"
    role="radiogroup"
    aria-label="Accent color"
  >
    <span
      class="picker-label"
      aria-hidden="true"
    >Accent</span>
    <button
      v-for="swatch in swatches"
      :key="swatch.id"
      type="button"
      class="swatch"
      :class="{ active: swatch.id === modelValue }"
      :style="{ backgroundColor: swatch.hex, '--swatch': swatch.hex }"
      role="radio"
      :aria-label="swatch.label"
      :aria-checked="swatch.id === modelValue"
      :title="swatch.label"
      @click="emit('update:modelValue', swatch.id)"
    >
      <span
        v-if="swatch.id === modelValue"
        class="check"
        aria-hidden="true"
      >✓</span>
    </button>
  </div>
</template>

<style scoped>
.accent-picker {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.picker-label {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin-right: 0.125rem;
}

.swatch {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.swatch.active {
  box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--swatch);
}

.check {
  /* White on the dark light-mode shades, near-black on the pale dark-mode ones */
  color: var(--color-background);
  font-size: 0.75rem;
  font-weight: 700;
}
</style>
