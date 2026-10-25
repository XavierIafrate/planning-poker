<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createRoom } from '@/composables/useRoom'
import { isValidRoomCode, normalizeRoomCode } from '@/utils/roomCode'
import { DECK_LABELS, DECKS } from '@/constants/decks'
import type { DeckId } from '@/types/room'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import CardFace from '@/components/CardFace.vue'

const router = useRouter()

const joinCode = ref('')
const joinError = ref('')
const creating = ref(false)
const createError = ref('')
const selectedDeck = ref<DeckId>('fibonacci')

const deckOptions = (Object.entries(DECK_LABELS) as [DeckId, string][]).map(([id, label]) => ({
  id,
  label,
  cards: DECKS[id],
}))

async function handleCreate() {
  creating.value = true
  createError.value = ''
  try {
    const code = await createRoom(selectedDeck.value)
    router.push({ name: 'room', params: { code } })
  } catch (error) {
    createError.value = error instanceof Error ? error.message : 'Something went wrong'
  } finally {
    creating.value = false
  }
}

function handleJoin() {
  const code = normalizeRoomCode(joinCode.value)
  if (!isValidRoomCode(code)) {
    joinError.value = 'That doesn\'t look like a valid room code'
    return
  }
  joinError.value = ''
  router.push({ name: 'room', params: { code } })
}
</script>

<template>
  <main class="home">
    <div class="intro">
      <div class="intro-text">
        <h1>Estimate together,<br>in seconds.</h1>
        <p class="tagline">
          Free, real-time sprint estimation. No accounts, no fuss, no promises about the estimates.
        </p>
      </div>
      <div
        class="fan"
        aria-hidden="true"
      >
        <span class="fan-card left">3</span>
        <span class="fan-card middle">5</span>
        <span class="fan-card right">8</span>
      </div>
    </div>

    <div class="panels">
      <section
        class="panel"
        aria-labelledby="create-heading"
      >
        <h2 id="create-heading">
          Start a room
        </h2>
        <div class="deck-choice">
          <span
            id="deck-label"
            class="field-label"
          >Deck</span>
          <div
            class="deck-options"
            role="radiogroup"
            aria-labelledby="deck-label"
          >
            <button
              v-for="option in deckOptions"
              :key="option.id"
              type="button"
              class="deck-option"
              role="radio"
              :aria-checked="selectedDeck === option.id"
              @click="selectedDeck = option.id"
            >
              <span
                class="radio-dot"
                aria-hidden="true"
              />
              <span class="deck-text">
                <span class="deck-name">{{ option.label }}</span>
                <span
                  class="deck-values"
                  aria-hidden="true"
                >
                  <template
                    v-for="card in option.cards"
                    :key="card"
                  >
                    <CardFace :value="card" />{{ ' ' }}
                  </template>
                </span>
              </span>
            </button>
          </div>
        </div>
        <BaseButton
          variant="primary"
          type="button"
          class="wide"
          :disabled="creating"
          @click="handleCreate"
        >
          {{ creating ? 'Creating…' : 'Create room' }}
        </BaseButton>
        <p
          v-if="createError"
          class="error"
        >
          {{ createError }}
        </p>
      </section>

      <section
        class="panel"
        aria-labelledby="join-heading"
      >
        <h2 id="join-heading">
          Join a room
        </h2>
        <form
          class="join-form"
          @submit.prevent="handleJoin"
        >
          <label
            for="join-code"
            class="field-label"
          >Room code</label>
          <div class="join-row">
            <BaseInput
              id="join-code"
              v-model="joinCode"
              class="join-input"
              type="text"
              placeholder="e.g. AB3XQ9"
              maxlength="6"
              autocapitalize="characters"
              aria-describedby="join-hint"
            />
            <BaseButton
              variant="primary"
              type="submit"
            >
              Join
            </BaseButton>
          </div>
          <p
            id="join-hint"
            class="hint"
          >
            Six letters and numbers, from the host's link.
          </p>
          <p
            v-if="joinError"
            class="error"
          >
            {{ joinError }}
          </p>
        </form>
        <p class="link-note">
          Got a link? Just open it. You'll land straight in the room.
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: 58rem;
  margin: 0 auto;
  padding: 4rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.intro-text {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 3.75rem;
  line-height: 1;
  color: var(--color-heading);
}

.tagline {
  margin: 0;
  font-size: 1.0625rem;
  color: var(--color-text-muted);
}

.fan {
  position: relative;
  flex-shrink: 0;
  width: 12.5rem;
  height: 8rem;
}

.fan-card {
  position: absolute;
  top: 1.25rem;
  width: 4.375rem;
  height: 6.25rem;
  border: 2px solid var(--color-border-hover);
  border-radius: 0.625rem;
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--color-heading);
}

.fan-card.left {
  left: 0.625rem;
  transform: rotate(-14deg);
}

.fan-card.middle {
  left: 4.0625rem;
  top: 0.375rem;
  z-index: 1;
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-background);
  box-shadow: 0 10px 20px -8px var(--color-accent);
}

.fan-card.right {
  left: 7.5rem;
  transform: rotate(14deg);
}

.panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: 1.5rem;
}

.panel {
  border: 1px solid var(--color-border);
  border-radius: 0.875rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-heading);
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-heading);
}

.deck-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.deck-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 3.5rem;
  padding: 0.6875rem 0.9375rem;
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s;
}

.deck-option:hover {
  border-color: var(--color-border-hover);
}

.deck-option[aria-checked='true'] {
  border: 2px solid var(--color-accent);
  padding: 0.625rem 0.875rem;
}

.radio-dot {
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  border: 2px solid var(--color-border-hover);
  border-radius: 50%;
}

.deck-option[aria-checked='true'] .radio-dot {
  border: 5px solid var(--color-accent);
}

.deck-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.deck-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-heading);
}

.deck-values {
  font-family: var(--font-display);
  font-size: 1.25rem;
  line-height: 1.2;
  color: var(--color-text-muted);
}

.wide {
  min-height: 3rem;
  font-size: 1rem;
}

.join-form {
  display: flex;
  flex-direction: column;
}

.join-row {
  display: flex;
  gap: 0.5rem;
}

.join-row :deep(.base-button) {
  min-height: 3rem;
  padding: 0 1.375rem;
}

.join-input {
  flex: 1;
  min-width: 0;
  min-height: 3rem;
  font-family: var(--font-display);
  font-size: 1.625rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.join-input::placeholder {
  text-transform: none;
  letter-spacing: normal;
}

.hint {
  margin: 0.375rem 0 0;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.link-note {
  margin: auto 0 0;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.error {
  color: #d33;
  margin: 0.75rem 0 0;
}

@media (max-width: 40rem) {
  .home {
    padding-top: 2.5rem;
  }

  h1 {
    font-size: 2.75rem;
  }

  .fan {
    display: none;
  }
}
</style>
