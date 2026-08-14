<script setup lang="ts">
import { JOB_ROLE_LABELS } from '@/constants/jobRoles'
import type { JobRole } from '@/types/room'

defineProps<{
  modelValue: JobRole
}>()

const emit = defineEmits<{ 'update:modelValue': [value: JobRole] }>()

const options = Object.entries(JOB_ROLE_LABELS) as [JobRole, string][]
</script>

<template>
  <div
    class="job-role-picker"
    role="radiogroup"
    aria-label="Job role"
  >
    <button
      v-for="[id, label] in options"
      :key="id"
      type="button"
      class="option"
      :class="{ active: modelValue === id }"
      role="radio"
      :aria-checked="modelValue === id"
      @click="emit('update:modelValue', id)"
    >
      {{ label }}
    </button>
  </div>
</template>

<style scoped>
.job-role-picker {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.option {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background-color 0.15s,
    color 0.15s;
}

.option:hover {
  border-color: var(--color-border-hover);
}

.option.active {
  border-color: var(--color-accent, var(--color-heading));
  background: var(--color-accent, var(--color-heading));
  color: var(--color-background);
}
</style>
