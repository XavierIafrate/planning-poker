<script setup lang="ts">
import type { ParticipantWithId } from '@/composables/useParticipants'
import { JOB_ROLE_LABELS } from '@/constants/jobRoles'
import CardFace from '@/components/CardFace.vue'

defineProps<{
  participants: ParticipantWithId[]
  revealed: boolean
  selfUid: string
}>()
</script>

<template>
  <ul class="roster">
    <li
      v-for="participant in participants"
      :key="participant.uid"
      class="participant"
      :class="{ self: participant.uid === selfUid }"
    >
      <span class="identity">
        <span class="name-wrap">
          <span class="name">{{ participant.name }}</span>
          <span
            v-if="participant.uid === selfUid"
            class="you-badge"
          >You</span>
        </span>
        <span class="job-role-badge">{{ JOB_ROLE_LABELS[participant.jobRole] }}</span>
      </span>
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

.participant.self {
  border-color: var(--color-accent, var(--color-border));
}

.identity {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.name-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 8rem;
}

.you-badge,
.job-role-badge {
  display: inline-flex;
  align-items: center;
  height: 1.125rem;
  padding: 0 0.375rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1;
}

.you-badge {
  background: var(--color-accent, var(--color-heading));
  color: var(--color-background);
  font-weight: 700;
}

.job-role-badge {
  border-color: var(--color-border);
  font-weight: 600;
  opacity: 0.7;
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
