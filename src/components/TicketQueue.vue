<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseTextarea from '@/components/base/BaseTextarea.vue'

defineProps<{
  tickets: string[]
  currentTicket: string | null
}>()

const emit = defineEmits<{
  add: [titles: string[]]
  remove: [title: string]
  move: [index: number, direction: 'up' | 'down']
  next: []
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
    <h2>Ticket queue</h2>

    <form
      class="add-form"
      @submit.prevent="handleAdd"
    >
      <BaseTextarea
        v-model="input"
        placeholder="Paste ticket titles, one per line"
        rows="3"
      />
      <BaseButton
        type="submit"
        class="add-button"
      >
        Add to queue
      </BaseButton>
    </form>

    <ul
      v-if="tickets.length"
      class="upcoming"
    >
      <li
        v-for="(ticket, index) in tickets"
        :key="ticket"
      >
        <span>{{ ticket }}</span>
        <div class="ticket-actions">
          <BaseButton
            variant="ghost"
            type="button"
            class="reorder"
            aria-label="Move ticket up"
            :disabled="index === 0"
            @click="emit('move', index, 'up')"
          >
            ↑
          </BaseButton>
          <BaseButton
            variant="ghost"
            type="button"
            class="reorder"
            aria-label="Move ticket down"
            :disabled="index === tickets.length - 1"
            @click="emit('move', index, 'down')"
          >
            ↓
          </BaseButton>
          <BaseButton
            variant="ghost"
            type="button"
            class="remove"
            aria-label="Remove ticket"
            @click="emit('remove', ticket)"
          >
            ✕
          </BaseButton>
        </div>
      </li>
    </ul>

    <BaseButton
      variant="primary"
      type="button"
      class="next"
      :disabled="tickets.length === 0"
      @click="emit('next')"
    >
      {{ currentTicket ? 'Next ticket' : 'Start voting' }}
    </BaseButton>
  </div>
</template>

<style scoped>
.queue {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.queue h2 {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
  margin: 0;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-button,
.next {
  align-self: flex-start;
}

.upcoming {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.upcoming li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
}

.ticket-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.reorder,
.remove {
  opacity: 0.6;
}

.reorder:hover:not(:disabled),
.remove:hover {
  opacity: 1;
}

.reorder:disabled {
  opacity: 0.25;
}
</style>
