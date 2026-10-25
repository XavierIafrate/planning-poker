<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import type { RoomPhase } from '@/types/room'

const props = defineProps<{
  phase: RoomPhase
  ticket: string | null
  /** "Ticket 2 of 5" — null when there's no current ticket. */
  position: { number: number; total: number } | null
  isHost: boolean
  votedCount: number
  voterCount: number
  queueLength: number
  /** Suggested card to save once revealed; null if there's nothing numeric to save. */
  estimate: string | null
}>()

const emit = defineEmits<{
  'pick-first': []
  'start-voting': []
  reveal: []
  skip: []
  'vote-again': []
  save: []
}>()

const PHASE_LABELS: Record<RoomPhase, string> = {
  lobby: 'Lobby',
  discussion: 'Discussing',
  voting: 'Voting open',
  revealed: 'Revealed',
}

const title = computed(() => {
  if (props.ticket) return props.ticket
  return props.isHost ? 'Add a ticket to get started' : 'Waiting for the host to pick a ticket'
})

const statusLine = computed(() => {
  switch (props.phase) {
    case 'lobby':
      return props.isHost
        ? 'Paste tickets into Up next, then pick the first one.'
        : 'Voting opens once a ticket is up for discussion.'
    case 'discussion':
      return props.isHost ? 'Talk it through, then open voting.' : 'The host will open voting shortly.'
    case 'voting':
      return `${props.votedCount} of ${props.voterCount} voted · reveals automatically when everyone's in`
    default:
      return null
  }
})

const saveLabel = computed(() => {
  const hasNext = props.queueLength > 0
  if (props.estimate === null) return hasNext ? 'Next ticket' : 'Finish ticket'
  return hasNext ? `Save ${props.estimate} & next ticket` : `Save ${props.estimate}`
})
</script>

<template>
  <section
    class="hero"
    aria-labelledby="ticket-title"
  >
    <div class="headline">
      <div class="text">
        <p class="eyebrow">
          <span
            class="phase"
            :class="phase"
          >{{ PHASE_LABELS[phase] }}</span>
          <span v-if="position">Ticket {{ position.number }} of {{ position.total }}</span>
        </p>
        <h1
          id="ticket-title"
          :class="{ placeholder: !ticket }"
        >
          {{ title }}
        </h1>
        <p
          v-if="statusLine"
          class="status"
        >
          {{ statusLine }}
        </p>
      </div>

      <div
        v-if="isHost"
        class="actions"
      >
        <BaseButton
          v-if="phase === 'lobby'"
          variant="primary"
          type="button"
          :disabled="queueLength === 0"
          @click="emit('pick-first')"
        >
          Pick first ticket
        </BaseButton>
        <template v-else-if="phase === 'discussion' || phase === 'voting'">
          <BaseButton
            v-if="queueLength > 0"
            type="button"
            @click="emit('skip')"
          >
            Skip ticket
          </BaseButton>
          <BaseButton
            v-if="phase === 'discussion'"
            variant="primary"
            type="button"
            @click="emit('start-voting')"
          >
            Start voting
          </BaseButton>
          <BaseButton
            v-else
            variant="primary"
            type="button"
            @click="emit('reveal')"
          >
            Reveal votes
          </BaseButton>
        </template>
        <template v-else>
          <BaseButton
            type="button"
            @click="emit('vote-again')"
          >
            Vote again
          </BaseButton>
          <BaseButton
            variant="primary"
            type="button"
            @click="emit('save')"
          >
            {{ saveLabel }}
          </BaseButton>
        </template>
      </div>
    </div>

    <!-- Countdown and results, once votes are revealed -->
    <slot />
  </section>
</template>

<style scoped>
.hero {
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.headline {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
}

.text {
  flex: 999 1 20rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.phase {
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: var(--color-background-mute);
  color: var(--color-heading);
}

.phase.voting {
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  color: var(--color-accent);
}

h1 {
  margin: 0;
  font-size: 1.625rem;
  line-height: 1.25;
  font-weight: 700;
  color: var(--color-heading);
  overflow-wrap: anywhere;
}

h1.placeholder {
  font-weight: 600;
}

.status {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.actions {
  flex: 1 0 auto;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.actions :deep(.base-button) {
  min-height: 2.75rem;
}
</style>
