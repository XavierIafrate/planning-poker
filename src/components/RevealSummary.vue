<script setup lang="ts">
import { computed } from 'vue'
import { computeAverage, hasConsensus, suggestEstimate, voteSpread } from '@/utils/roundStats'
import type { ParticipantWithId } from '@/composables/useParticipants'
import CardFace from '@/components/CardFace.vue'

const props = defineProps<{
  participants: ParticipantWithId[]
  deck: readonly string[]
}>()

const voters = computed(() => props.participants.filter((p) => p.role === 'voter'))
const votes = computed(() => voters.value.map((p) => p.vote))

const average = computed(() => computeAverage(votes.value))
const consensus = computed(() => hasConsensus(votes.value))
const consensusValue = computed(() => votes.value.find((v) => v !== null) ?? null)
const estimate = computed(() => suggestEstimate(votes.value, props.deck))
const spread = computed(() => voteSpread(votes.value))

// One bar per card that was played, in deck order.
const bars = computed(() => {
  const cast = voters.value.filter((p) => p.vote !== null)
  return props.deck
    .map((card) => {
      const names = cast.filter((p) => p.vote === card).map((p) => p.name)
      return { card, names, share: cast.length ? names.length / cast.length : 0 }
    })
    .filter((bar) => bar.names.length > 0)
})
</script>

<template>
  <div class="summary">
    <p
      v-if="consensus"
      class="consensus"
    >
      🎉 Consensus — everyone picked <CardFace :value="consensusValue!" />. Remarkable.
    </p>
    <p
      v-else-if="average === null"
      class="no-numbers"
    >
      No numeric votes to average. Everyone's hedging.
    </p>

    <div class="results">
      <dl class="stats">
        <div class="stat">
          <dt>Suggested</dt>
          <dd class="suggested">
            {{ estimate ?? '–' }}
          </dd>
        </div>
        <div class="stat">
          <dt>Average</dt>
          <dd>{{ average ?? '–' }}</dd>
        </div>
        <div class="stat">
          <dt>Spread</dt>
          <dd>
            <template v-if="!spread">
              –
            </template>
            <template v-else-if="spread.low === spread.high">
              {{ spread.low }}
            </template>
            <template v-else>
              {{ spread.low }}–{{ spread.high }}
            </template>
          </dd>
        </div>
      </dl>

      <ul
        class="bars"
        aria-label="Votes by card"
      >
        <li
          v-for="bar in bars"
          :key="bar.card"
        >
          <span class="bar-card"><CardFace :value="bar.card" /></span>
          <span
            class="track"
            aria-hidden="true"
          >
            <span
              class="fill"
              :class="{ top: bar.card === estimate }"
              :style="{ width: `${bar.share * 100}%` }"
            />
          </span>
          <span class="who">{{ bar.names.join(', ') }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-border);
}

.summary p {
  margin: 0;
}

.consensus {
  font-weight: 600;
  color: var(--color-heading);
}

.no-numbers {
  color: var(--color-text-muted);
}

.results {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem 2rem;
}

.stats {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  flex: 0 1 22rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

dt {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.75rem;
  line-height: 1;
  color: var(--color-heading);
}

dd.suggested {
  color: var(--color-accent);
}

.bars {
  flex: 1 1 18rem;
  min-width: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bars li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
}

.bar-card {
  width: 2rem;
  flex-shrink: 0;
  text-align: right;
  font-family: var(--font-display);
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-heading);
}

.bar-card :deep(.face-icon) {
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: middle;
}

.track {
  flex: 1 1 6rem;
  height: 1.5rem;
  border-radius: 0.25rem;
  background: var(--color-background-mute);
  overflow: hidden;
  display: flex;
}

.fill {
  background: var(--color-text-muted);
}

.fill.top {
  background: var(--color-accent);
}

.who {
  flex: 1 1 8rem;
  min-width: 0;
  color: var(--color-text-muted);
  overflow-wrap: anywhere;
}
</style>
