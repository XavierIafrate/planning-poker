<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'

defineProps<{
  tickets: string[]
  /** Hosts can add, reorder and remove; everyone else just sees what's coming. */
  editable: boolean
}>()

const emit = defineEmits<{
  add: [titles: string[]]
  remove: [title: string]
  move: [index: number, direction: 'up' | 'down']
}>()

const input = ref('')

function handleAdd() {
  const titles = input.value.split('\n')
  if (!titles.some((title) => title.trim())) return
  emit('add', titles)
  input.value = ''
}
</script>

<template>
  <div class="queue">
    <ol
      v-if="tickets.length"
      class="upcoming"
    >
      <li
        v-for="(ticket, index) in tickets"
        :key="ticket"
      >
        <span class="title">{{ ticket }}</span>
        <div
          v-if="editable"
          class="ticket-actions"
        >
          <BaseButton
            variant="ghost"
            type="button"
            class="icon-button"
            aria-label="Move ticket up"
            :disabled="index === 0"
            @click="emit('move', index, 'up')"
          >
            ↑
          </BaseButton>
          <BaseButton
            variant="ghost"
            type="button"
            class="icon-button"
            aria-label="Move ticket down"
            :disabled="index === tickets.length - 1"
            @click="emit('move', index, 'down')"
          >
            ↓
          </BaseButton>
          <BaseButton
            variant="ghost"
            type="button"
            class="icon-button"
            aria-label="Remove ticket"
            @click="emit('remove', ticket)"
          >
            ✕
          </BaseButton>
        </div>
      </li>
    </ol>
    <p
      v-else
      class="empty"
    >
      Nothing queued.
    </p>

    <form
      v-if="editable"
      class="add-form"
      @submit.prevent="handleAdd"
    >
      <label
        for="add-tickets"
        class="add-label"
      >Add tickets</label>
      <BaseTextarea
        id="add-tickets"
        v-model="input"
        placeholder="Paste ticket titles, one per line"
        rows="3"
      />
      <BaseButton type="submit">
        Add to queue
      </BaseButton>
    </form>
  </div>
</template>

<style scoped>
.queue {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upcoming {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upcoming li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.375rem 0.5rem 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.title {
  flex: 1;
  min-width: 0;
  padding-top: 0.125rem;
  overflow-wrap: anywhere;
}

.ticket-actions {
  display: flex;
  flex-shrink: 0;
}

.icon-button {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  color: var(--color-text-muted);
}

.icon-button:hover:not(:disabled) {
  color: var(--color-heading);
}

.empty {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-heading);
}
</style>
