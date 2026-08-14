<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <textarea
    class="base-textarea"
    v-bind="$attrs"
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

<style scoped>
.base-textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
  resize: vertical;
}

.base-textarea::placeholder {
  color: var(--color-text);
  opacity: 0.5;
}

.base-textarea:focus-visible {
  outline: 2px solid var(--color-accent, var(--color-heading));
  outline-offset: 1px;
}
</style>
