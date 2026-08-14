<script setup lang="ts">
import { useColorblindMode } from '@/composables/useColorblindMode'
import CardFace from '@/components/CardFace.vue'

defineProps<{
  cards: readonly string[]
  selected: string | null
  disabled: boolean
}>()

const emit = defineEmits<{ select: [card: string] }>()

const { enabled: colorblindMode } = useColorblindMode()

const SUITS = ['♠', '♥', '♦', '♣']
</script>

<template>
  <div
    class="deck"
    :class="{ 'colorblind-mode': colorblindMode }"
  >
    <button
      v-for="(card, index) in cards"
      :key="card"
      type="button"
      class="card"
      :class="{ active: card === selected, tilt: index % 2 === 0 }"
      :disabled="disabled"
      @click="emit('select', card)"
    >
      <span
        class="pip pip-top"
        aria-hidden="true"
      >
        <CardFace :value="card" />
        <i class="suit">{{ SUITS[index % SUITS.length] }}</i>
      </span>
      <span class="value">
        <CardFace :value="card" />
      </span>
      <span
        class="pip pip-bottom"
        aria-hidden="true"
      >
        <CardFace :value="card" />
        <i class="suit">{{ SUITS[index % SUITS.length] }}</i>
      </span>
      <span
        v-if="colorblindMode && card === selected"
        class="check"
        aria-hidden="true"
      >✓</span>
    </button>
  </div>
</template>

<style scoped>
.deck {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.75rem;
  height: 5.5rem;
  border: 2px solid var(--color-border);
  border-radius: 0.6rem;
  background: var(--color-background);
  color: var(--color-heading);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.card:hover:not(:disabled) {
  transform: translateY(-6px) rotate(-2deg);
  border-color: var(--color-accent, var(--color-border-hover));
}

.card.tilt:hover:not(:disabled) {
  transform: translateY(-6px) rotate(2deg);
}

.value {
  font-family: var(--font-display);
  font-size: 1.9rem;
}

.pip {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.05rem;
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 1;
}

.pip-top {
  top: 0.3rem;
  left: 0.35rem;
}

.pip-bottom {
  bottom: 0.3rem;
  right: 0.35rem;
  transform: rotate(180deg);
}

.suit {
  font-size: 0.55rem;
  font-style: normal;
  opacity: 0.7;
}

.card.active {
  border-color: var(--color-accent, var(--color-heading));
  background: var(--color-accent, var(--color-heading));
  color: var(--color-background);
  box-shadow: 0 6px 16px -4px var(--color-accent, rgba(0, 0, 0, 0.3));
  transform: translateY(-4px);
}

.card:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.deck.colorblind-mode .card.active {
  border-width: 3px;
  border-style: dashed;
  border-color: var(--color-background);
}

.check {
  position: absolute;
  top: 0.125rem;
  right: 0.25rem;
  font-size: 0.75rem;
}
</style>
