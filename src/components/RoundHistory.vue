<script setup lang="ts">
import type { RoundHistoryEntry } from '@/types/room'
import CardFace from '@/components/CardFace.vue'

defineProps<{ history: RoundHistoryEntry[] }>()

function consensusValue(entry: RoundHistoryEntry): string | null {
  return entry.consensus ? (entry.votes.find((v) => v.vote !== null)?.vote ?? null) : null
}
</script>

<template>
  <div class="table-wrap">
    <table class="history">
      <thead>
        <tr>
          <th>Ticket</th>
          <th>Votes</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(entry, index) in history"
          :key="index"
        >
          <td>{{ entry.ticket ?? `Round ${entry.round}` }}</td>
          <td class="votes">
            <span
              v-for="vote in entry.votes"
              :key="vote.name"
              class="vote-chip"
            >
              {{ vote.name }}: <CardFace :value="vote.vote ?? '—'" />
            </span>
          </td>
          <td>
            <span
              v-if="entry.consensus"
              class="consensus"
            >
              🎉 <CardFace :value="consensusValue(entry)!" />
            </span>
            <span v-else-if="entry.average !== null">{{ entry.average }}</span>
            <span
              v-else
              class="muted"
            >—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

.history {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.history th {
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
  font-weight: 600;
  padding: 0.375rem 0.5rem;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.history td {
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  vertical-align: top;
}

.history tr:last-child td {
  border-bottom: none;
}

.votes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  opacity: 0.75;
}

.vote-chip {
  white-space: nowrap;
}

.consensus {
  font-weight: 600;
}

.muted {
  opacity: 0.5;
}
</style>
