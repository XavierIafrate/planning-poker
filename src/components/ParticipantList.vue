<script setup lang="ts">
import type { ParticipantWithId } from '@/composables/useParticipants'
import CardFace from '@/components/CardFace.vue'

defineProps<{
  participants: ParticipantWithId[]
  revealed: boolean
}>()
</script>

<template>
  <ul class="roster">
    <li
      v-for="participant in participants"
      :key="participant.uid"
      class="participant"
    >
      <span class="name">{{ participant.name }}</span>
      <span
        v-if="participant.role === 'observer'"
        class="observing"
      >
        Observing
      </span>
      <span
        v-else
        class="vote"
        :class="{ pending: !participant.vote }"
      >
        <template v-if="revealed">
          <CardFace
            v-if="participant.vote"
            :value="participant.vote"
          />
          <template v-else>—</template>
        </template>
        <template v-else>{{ participant.vote ? '✓' : '…' }}</template>
      </span>
    </li>
  </ul>
</template>

<style scoped>
.roster {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.participant {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
}

.vote {
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
}

.vote.pending {
  opacity: 0.4;
}

.observing {
  font-size: 0.8125rem;
  font-style: italic;
  opacity: 0.6;
}
</style>
