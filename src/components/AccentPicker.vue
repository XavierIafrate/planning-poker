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
    role="group"
    aria-label="Accent color"
  >
    <span class="picker-label">Accent</span>
    <button
      v-for="swatch in swatches"
      :key="swatch.id"
      type="button"
      class="swatch"
      :class="{ active: swatch.id === modelValue }"
      :style="{ backgroundColor: swatch.hex }"
      :aria-label="swatch.label"
      :aria-pressed="swatch.id === modelValue"
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
  opacity: 0.8;
  margin-right: 0.125rem;
}

.swatch {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.swatch.active {
  box-shadow: 0 0 0 2px var(--color-background), 0 0 0 4px var(--color-text);
}

.check {
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
}
</style>
