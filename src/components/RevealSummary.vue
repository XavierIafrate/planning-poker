<script setup lang="ts">
import { computed } from 'vue'
import { computeAverage, hasConsensus } from '@/utils/roundStats'
import type { ParticipantWithId } from '@/composables/useParticipants'
import CardFace from '@/components/CardFace.vue'

const props = defineProps<{
  participants: ParticipantWithId[]
}>()

const votes = computed(() =>
  props.participants.filter((p) => p.role === 'voter').map((p) => p.vote),
)

const average = computed(() => computeAverage(votes.value))
const consensus = computed(() => hasConsensus(votes.value))
const consensusValue = computed(() => votes.value.find((v) => v !== null) ?? null)
</script>

<template>
  <div class="summary">
    <p
      v-if="consensus"
      class="consensus"
    >
      🎉 Consensus — everyone picked <CardFace :value="consensusValue!" />
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
