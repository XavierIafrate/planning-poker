<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  tickets: string[]
  currentTicket: string | null
}>()

const emit = defineEmits<{
  add: [titles: string[]]
  remove: [title: string]
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
      <textarea
        v-model="input"
        placeholder="Paste ticket titles, one per line"
        rows="3"
      />
      <button type="submit">
        Add to queue
      </button>
    </form>

    <ul
      v-if="tickets.length"
      class="upcoming"
    >
      <li
        v-for="ticket in tickets"
        :key="ticket"
      >
        <span>{{ ticket }}</span>
        <button
          type="button"
          class="remove"
          aria-label="Remove ticket"
          @click="emit('remove', ticket)"
        >
          ✕
        </button>
      </li>
    </ul>

    <button
      type="button"
      class="next"
      :disabled="tickets.length === 0"
      @click="emit('next')"
    >
      {{ currentTicket ? 'Next ticket' : 'Start voting' }}
    </button>
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

textarea {
  padding: 0.5rem 0.75rem;
  font-family: inherit;
  resize: vertical;
}

.add-form button,
.next {
  padding: 0.5rem 1rem;
  cursor: pointer;
  align-self: flex-start;
}

.next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.remove {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
  padding: 0 0.25rem;
}

.remove:hover {
  opacity: 1;
}
</style>
