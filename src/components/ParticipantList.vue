<script setup lang="ts">
import { computed } from 'vue'
import type { ParticipantWithId } from '@/composables/useParticipants'
import { JOB_ROLE_LABELS } from '@/constants/jobRoles'
import { hasConsensus, voteSpread } from '@/utils/roundStats'
import type { RoomPhase } from '@/types/room'
import CardFace from '@/components/CardFace.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps<{
  participants: ParticipantWithId[]
  phase: RoomPhase
  /** Votes are face up — false during the reveal countdown. */
  revealed: boolean
  selfUid: string
  hostUid: string
  canRemove: boolean
}>()

const emit = defineEmits<{ remove: [uid: string] }>()

// Cards are on the table from voting until the next round starts.
const cardsDealt = computed(() => props.phase === 'voting' || props.phase === 'revealed')

// Once revealed, the highest and lowest voters are the ones worth hearing
// from — unless they're the majority (5, 5, 13 flags only the 13). On an
// even split, both ends get asked.
const outliers = computed(() => {
  if (!props.revealed) return null
  const votes = props.participants.filter((p) => p.role === 'voter').map((p) => p.vote)
  const spread = voteSpread(votes)
  if (!spread || spread.low === spread.high || hasConsensus(votes)) return null

  const counts = new Map<string, number>()
  for (const vote of votes) if (vote !== null) counts.set(vote, (counts.get(vote) ?? 0) + 1)
  const mostPicked = Math.max(...counts.values())
  const evenSplit = [...counts.values()].every((count) => count === mostPicked)
  const standsOut = (card: string) => evenSplit || counts.get(card)! < mostPicked
  return {
    high: standsOut(spread.high) ? spread.high : null,
    low: standsOut(spread.low) ? spread.low : null,
  }
})

function cardState(participant: ParticipantWithId) {
  if (participant.role === 'observer' || !cardsDealt.value) return 'empty'
  if (!participant.vote) return 'waiting'
  return props.revealed ? 'face-up' : 'face-down'
}

function status(participant: ParticipantWithId): string | null {
  if (!cardsDealt.value) return null
  if (props.revealed) return participant.vote ? null : 'No vote'
  return participant.vote ? 'Voted' : 'Thinking…'
}

function note(participant: ParticipantWithId): string | null {
  if (!outliers.value || !participant.vote) return null
  if (participant.vote === outliers.value.high) return 'Highest — ask why'
  if (participant.vote === outliers.value.low) return 'Lowest — ask why'
  return null
}
</script>

<template>
  <ul class="roster">
    <li
      v-for="participant in participants"
      :key="participant.uid"
      class="participant"
      :class="{ self: participant.uid === selfUid, away: participant.away, observer: participant.role === 'observer' }"
    >
      <span
        class="mini-card"
        :class="cardState(participant)"
        aria-hidden="true"
      >
        <CardFace
          v-if="cardState(participant) === 'face-up'"
          :value="participant.vote!"
        />
      </span>

      <span class="info">
        <span class="name-line">
          <span class="name">{{ participant.name }}</span>
          <span
            v-if="participant.uid === selfUid"
            class="you-badge"
          >You</span>
        </span>
        <span class="meta">
          {{ JOB_ROLE_LABELS[participant.jobRole] }}<template v-if="participant.uid === hostUid"> · Host</template>
          <span
            v-if="participant.away"
            class="away-badge"
          >Away</span>
        </span>
        <span
          v-if="participant.role === 'observer'"
          class="observing"
        >Watching</span>
        <template v-else>
          <span
            v-if="status(participant)"
            class="vote"
            :class="{ done: participant.vote }"
          >{{ status(participant) }}</span>
          <span
            v-if="revealed && participant.vote"
            class="sr-only"
          >Voted <CardFace :value="participant.vote" /></span>
          <span
            v-if="note(participant)"
            class="note"
          >{{ note(participant) }}</span>
        </template>
      </span>

      <BaseButton
        v-if="canRemove && participant.uid !== selfUid"
        variant="ghost"
        type="button"
        class="remove"
        :aria-label="`Remove ${participant.name}`"
        @click="emit('remove', participant.uid)"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        ><path d="M18 6 6 18M6 6l12 12" /></svg>
      </BaseButton>
    </li>
  </ul>
</template>

<style scoped>
.roster {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13.5rem, 1fr));
  gap: 0.75rem;
}

.participant {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
}

.participant.self {
  border: 2px solid var(--color-accent);
  padding: calc(0.75rem - 1px);
}

.participant.observer {
  background: var(--color-background-soft);
}

.participant.away .mini-card,
.participant.away .name {
  opacity: 0.55;
}

.mini-card {
  flex-shrink: 0;
  width: 2.125rem;
  height: 3rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-heading);
}

.mini-card.empty {
  border: 2px solid var(--color-border);
}

.mini-card.waiting {
  border: 2px dashed var(--color-border-hover);
}

/* Card back: accent with an inset border, like a real deck */
.mini-card.face-down {
  background: var(--color-accent);
  box-shadow:
    inset 0 0 0 3px var(--color-background),
    inset 0 0 0 4px var(--color-accent);
}

.mini-card.face-up {
  border: 2px solid var(--color-border-hover);
  background: var(--color-background);
}

.mini-card :deep(.face-icon) {
  width: 1.5rem;
  height: 1.5rem;
}

.info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  /* Room for the remove button */
  padding-right: 1.25rem;
}

.name {
  font-weight: 600;
  color: var(--color-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.you-badge,
.away-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  height: 1.125rem;
  padding: 0 0.375rem;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1;
}

.you-badge {
  background: var(--color-accent);
  color: var(--color-background);
}

.away-badge {
  border: 1px dashed var(--color-border-hover);
  color: var(--color-text-muted);
}

.vote,
.observing {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.vote.done {
  color: var(--color-accent);
}

.note {
  align-self: flex-start;
  margin-top: 0.125rem;
  padding: 0 0.375rem;
  border: 1px solid var(--color-warn-border);
  border-radius: 0.25rem;
  background: var(--color-warn-bg);
  color: var(--color-warn-text);
  font-size: 0.75rem;
  font-weight: 600;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.remove {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  color: var(--color-text-muted);
}

.remove:hover {
  color: var(--color-heading);
}
</style>
