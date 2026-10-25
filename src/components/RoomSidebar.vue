<script setup lang="ts">
import { ref, useId } from 'vue'
import type { RoundHistoryEntry } from '@/types/room'
import { downloadCsv, historyToCsv } from '@/utils/historyCsv'
import TicketQueue from '@/components/TicketQueue.vue'
import RoundHistory from '@/components/RoundHistory.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps<{
  roomCode: string
  tickets: string[]
  history: RoundHistoryEntry[]
  isHost: boolean
}>()

const emit = defineEmits<{
  add: [titles: string[]]
  remove: [title: string]
  move: [index: number, direction: 'up' | 'down']
}>()

type Tab = 'queue' | 'history'
const tab = ref<Tab>('queue')
const id = useId()

// Arrow keys move between tabs, per the WAI-ARIA tabs pattern.
function onTabKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  tab.value = tab.value === 'queue' ? 'history' : 'queue'
  document.getElementById(`${id}-${tab.value}-tab`)?.focus()
}

function exportHistory() {
  downloadCsv(`planning-poker-${props.roomCode}.csv`, historyToCsv(props.history))
}
</script>

<template>
  <aside
    class="sidebar"
    aria-label="Tickets"
  >
    <div
      class="tabs"
      role="tablist"
      @keydown="onTabKeydown"
    >
      <button
        :id="`${id}-queue-tab`"
        type="button"
        role="tab"
        :aria-selected="tab === 'queue'"
        :aria-controls="`${id}-queue`"
        :tabindex="tab === 'queue' ? 0 : -1"
        @click="tab = 'queue'"
      >
        Up next · {{ tickets.length }}
      </button>
      <button
        :id="`${id}-history-tab`"
        type="button"
        role="tab"
        :aria-selected="tab === 'history'"
        :aria-controls="`${id}-history`"
        :tabindex="tab === 'history' ? 0 : -1"
        @click="tab = 'history'"
      >
        History · {{ history.length }}
      </button>
    </div>

    <div
      v-show="tab === 'queue'"
      :id="`${id}-queue`"
      role="tabpanel"
      :aria-labelledby="`${id}-queue-tab`"
    >
      <TicketQueue
        :tickets="tickets"
        :editable="isHost"
        @add="emit('add', $event)"
        @remove="emit('remove', $event)"
        @move="(index, direction) => emit('move', index, direction)"
      />
    </div>

    <div
      v-show="tab === 'history'"
      :id="`${id}-history`"
      role="tabpanel"
      :aria-labelledby="`${id}-history-tab`"
      class="history-panel"
    >
      <RoundHistory
        v-if="history.length"
        :history="history"
      />
      <p
        v-else
        class="empty"
      >
        No rounds yet.
      </p>
      <BaseButton
        v-if="history.length"
        type="button"
        @click="exportHistory"
      >
        Export CSV
      </BaseButton>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.1875rem;
  border-radius: 0.5rem;
  background: var(--color-background-mute);
}

.tabs button {
  flex: 1;
  min-height: 2.25rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-text-muted);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
}

.tabs button[aria-selected='true'] {
  background: var(--color-background);
  color: var(--color-heading);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}

.history-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
</style>
