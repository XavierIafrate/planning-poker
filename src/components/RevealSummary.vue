<script setup lang="ts">
import { computed } from 'vue'
import { NUMERIC_VALUES } from '@/constants/decks'
import type { ParticipantWithId } from '@/composables/useParticipants'
import CardFace from '@/components/CardFace.vue'

const props = defineProps<{
  participants: ParticipantWithId[]
}>()

const votes = computed(() => props.participants.map((p) => p.vote).filter((v): v is string => v !== null))

const numericVotes = computed(() =>
  votes.value.filter((v) => NUMERIC_VALUES.has(v)).map(Number),
)

const average = computed(() => {
  if (numericVotes.value.length === 0) return null
  const sum = numericVotes.value.reduce((total, value) => total + value, 0)
  return Math.round((sum / numericVotes.value.length) * 10) / 10
})

const consensus = computed(() => votes.value.length > 0 && new Set(votes.value).size === 1)
</script>

<template>
  <div class="summary">
    <p
      v-if="consensus"
      class="consensus"
    >
      🎉 Consensus — everyone picked <CardFace :value="votes[0]!" />
    </p>
    <p v-else-if="average !== null">
      Average (numeric votes): <strong>{{ average }}</strong>
    </p>
    <p v-else>
      No numeric votes to average.
    </p>
  </div>
</template>

<style scoped>
.summary {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
}

.summary p {
  margin: 0;
}

.consensus {
  font-weight: 600;
}
</style>
