<script setup lang="ts">
import { computed } from 'vue'
import type { RoundHistoryEntry } from '@/types/room'
import CardFace from '@/components/CardFace.vue'

const props = defineProps<{ history: RoundHistoryEntry[] }>()

// Newest first: the last ticket is the one people want to check.
const entries = computed(() => [...props.history].reverse())

/** What to show on the score card. Older entries predate saved estimates. */
function score(entry: RoundHistoryEntry): string | null {
  if (entry.estimate !== undefined) return entry.estimate
  if (entry.consensus) return entry.votes.find((v) => v.vote !== null)?.vote ?? null
  return entry.average === null ? null : String(entry.average)
}
</script>

<template>
  <ol class="history">
    <li
      v-for="(entry, index) in entries"
      :key="index"
    >
      <span
        class="score"
        :class="{ none: score(entry) === null }"
      >
        <CardFace
          v-if="score(entry) !== null"
          :value="score(entry)!"
        />
        <template v-else>–</template>
      </span>
      <span class="details">
        <span class="ticket">{{ entry.ticket ?? `Round ${entry.round}` }}</span>
        <span class="meta">
          <template v-if="entry.estimate === null">Voted again · </template>
          <template v-if="entry.consensus">Consensus</template>
          <template v-else>
            <span
              v-for="(vote, voteIndex) in entry.votes"
              :key="voteIndex"
              class="vote"
            >{{ vote.name }} <CardFace :value="vote.vote ?? '–'" /></span>
          </template>
        </span>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.history {
  list-style: none;
  margin: 0;
  padding: 0;
}

.history li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.history li:last-child {
  border-bottom: none;
}

.score {
  flex-shrink: 0;
  width: 2rem;
  height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-border-hover);
  border-radius: 0.375rem;
  font-family: var(--font-display);
  font-size: 1.375rem;
  line-height: 1;
  color: var(--color-heading);
}

.score.none {
  border-style: dashed;
  color: var(--color-text-muted);
}

.score :deep(.face-icon) {
  width: 1.25rem;
  height: 1.25rem;
}

.details {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.ticket {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-heading);
  overflow-wrap: anywhere;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.625rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.vote {
  overflow-wrap: anywhere;
}

.vote :deep(.face-icon) {
  width: 1rem;
  height: 1rem;
  vertical-align: -0.15em;
}
</style>
