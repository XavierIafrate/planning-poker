<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRoom } from '@/composables/useRoom'
import { useParticipants } from '@/composables/useParticipants'
import { useTheme } from '@/composables/useTheme'
import { useRoundTimer } from '@/composables/useRoundTimer'
import { playSadTrombone } from '@/composables/useRevealSound'
import { DECKS } from '@/constants/decks'
import { ACCENT_COLORS } from '@/constants/theme'
import { hasConsensus } from '@/utils/roundStats'
import NameEntryModal from '@/components/NameEntryModal.vue'
import CardDeck from '@/components/CardDeck.vue'
import ParticipantList from '@/components/ParticipantList.vue'
import HostControls from '@/components/HostControls.vue'
import RevealSummary from '@/components/RevealSummary.vue'
import RoomShareBox from '@/components/RoomShareBox.vue'
import TicketQueue from '@/components/TicketQueue.vue'
import AccentPicker from '@/components/AccentPicker.vue'
import RoundHistory from '@/components/RoundHistory.vue'
import RoundTimer from '@/components/RoundTimer.vue'
import ConfettiBurst from '@/components/ConfettiBurst.vue'
import JobRolePicker from '@/components/JobRolePicker.vue'
import BaseButton from '@/components/base/BaseButton.vue'

const route = useRoute()
const code = computed(() => String(route.params.code))

const {
  room,
  loading: roomLoading,
  revealVotes,
  resetRound,
  addTickets,
  removeTicket,
  moveTicket,
  nextTicket,
  setAccentColor,
} = useRoom(code)
const round = computed(() => room.value?.round)
const {
  participants,
  loading: participantsLoading,
  self,
  joinRoom,
  castVote,
  setRole,
  setJobRole,
} = useParticipants(code, round)

const deck = computed(() => (room.value ? DECKS[room.value.deck] : []))
const isHost = computed(() => !!room.value && !!self.value && room.value.hostUid === self.value.uid)

const { isDark } = useTheme()
const accentHex = computed(() => {
  if (!room.value) return null
  const definition = ACCENT_COLORS[room.value.accentColor]
  return isDark.value ? definition.dark : definition.light
})

const roundStartedAt = computed(() => room.value?.roundStartedAt)
const revealed = computed(() => room.value?.revealed)
const { elapsedSeconds } = useRoundTimer(roundStartedAt, revealed)

// Auto-reveal once every voter (observers excluded) has locked in a vote.
// Debounced: a participant who just joined may not have reached every
// client's Firestore listener yet, so we let the roster settle briefly
// before committing — any roster or vote change resets the wait.
const AUTO_REVEAL_DEBOUNCE_MS = 600
const voters = computed(() => participants.value.filter((p) => p.role === 'voter'))
const allVotersReady = computed(() => voters.value.length > 0 && voters.value.every((p) => p.vote !== null))
let autoRevealTimeoutId: ReturnType<typeof setTimeout> | null = null
watch(voters, () => {
  if (autoRevealTimeoutId !== null) {
    clearTimeout(autoRevealTimeoutId)
    autoRevealTimeoutId = null
  }
  if (!allVotersReady.value) return
  autoRevealTimeoutId = setTimeout(() => {
    autoRevealTimeoutId = null
    if (isHost.value && room.value && !room.value.revealed && allVotersReady.value) {
      revealVotes()
    }
  }, AUTO_REVEAL_DEBOUNCE_MS)
})
onUnmounted(() => {
  if (autoRevealTimeoutId !== null) clearTimeout(autoRevealTimeoutId)
})

// Holds the actual vote reveal back behind a 3-2-1 countdown for suspense.
// On a fresh page load into an already-revealed round we skip the
// countdown — only a live false-to-true transition should play it.
const REVEAL_COUNTDOWN_MS = 3000
const revealReady = ref(false)
const countdownValue = ref<number | null>(null)
let countdownTimeoutIds: ReturnType<typeof setTimeout>[] = []

function clearCountdown() {
  countdownTimeoutIds.forEach((id) => clearTimeout(id))
  countdownTimeoutIds = []
}

watch(revealed, (isRevealed, wasRevealed) => {
  clearCountdown()
  if (isRevealed && wasRevealed === false) {
    revealReady.value = false
    countdownValue.value = 3
    countdownTimeoutIds.push(setTimeout(() => { countdownValue.value = 2 }, 1000))
    countdownTimeoutIds.push(setTimeout(() => { countdownValue.value = 1 }, 2000))
    countdownTimeoutIds.push(
      setTimeout(() => {
        countdownValue.value = null
        revealReady.value = true
      }, REVEAL_COUNTDOWN_MS),
    )
  } else {
    revealReady.value = !!isRevealed
    countdownValue.value = null
  }
})
onUnmounted(clearCountdown)

// Consensus gets confetti; a split decision gets a sad trombone.
const votes = computed(() => participants.value.filter((p) => p.role === 'voter').map((p) => p.vote))
const isConsensus = computed(() => hasConsensus(votes.value))
const showConfetti = ref(false)
const confettiKey = ref(0)
watch(revealReady, (ready) => {
  if (!ready) return
  if (isConsensus.value) {
    confettiKey.value++
    showConfetti.value = true
  } else {
    playSadTrombone()
  }
})
</script>

<template>
  <main
    class="room"
    :style="accentHex ? { '--color-accent': accentHex } : {}"
  >
    <template v-if="roomLoading || participantsLoading">
      <p>Loading…</p>
    </template>
    <template v-else-if="!room">
      <p>Room not found. Double-check the link or code.</p>
    </template>
    <template v-else>
      <NameEntryModal
        v-if="!self"
        @submit="joinRoom"
      />

      <template v-else>
        <ConfettiBurst
          v-if="showConfetti"
          :key="confettiKey"
          @done="showConfetti = false"
        />

        <div class="room-header">
          <RoomShareBox :code="code" />
          <RoundTimer
            :seconds="elapsedSeconds"
            :running="!room.revealed"
          />
          <AccentPicker
            v-if="isHost"
            :model-value="room.accentColor"
            @update:model-value="setAccentColor"
          />
          <HostControls
            v-if="isHost"
            :revealed="room.revealed"
            @reveal="revealVotes"
            @reset="resetRound(participants)"
          />
        </div>

        <TicketQueue
          v-if="isHost"
          :tickets="room.tickets"
          :current-ticket="room.currentTicket"
          @add="addTickets"
          @remove="removeTicket"
          @move="moveTicket"
          @next="nextTicket(participants)"
        />

        <p
          v-if="room.currentTicket"
          class="current-ticket"
        >
          Now estimating: <strong>{{ room.currentTicket }}</strong>
        </p>

        <p
          v-if="countdownValue !== null"
          :key="countdownValue"
          class="countdown"
          aria-live="polite"
        >
          {{ countdownValue }}
        </p>

        <RevealSummary
          v-if="room.revealed && revealReady"
          :participants="participants"
        />

        <section>
          <h2>Participants</h2>
          <ParticipantList
            :participants="participants"
            :revealed="room.revealed && revealReady"
            :self-uid="self.uid"
          />
        </section>

        <section>
          <div class="section-header">
            <h2>Your vote</h2>
            <div class="self-controls">
              <JobRolePicker
                :model-value="self.jobRole"
                @update:model-value="setJobRole"
              />
              <BaseButton
                variant="ghost"
                type="button"
                class="role-toggle"
                @click="setRole(self.role === 'observer' ? 'voter' : 'observer')"
              >
                {{ self.role === 'observer' ? 'Switch to voting' : 'Switch to observing' }}
              </BaseButton>
            </div>
          </div>
          <p
            v-if="self.role === 'observer'"
            class="observing-note"
          >
            You're observing this round — your vote won't be counted.
          </p>
          <CardDeck
            v-else
            :cards="deck"
            :selected="self.vote"
            :disabled="room.revealed"
            @select="castVote"
          />
        </section>

        <section v-if="room.history?.length">
          <h2>Round history</h2>
          <RoundHistory :history="room.history" />
        </section>
      </template>
    </template>
  </main>
</template>

<style scoped>
.room {
  max-width: 56rem;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

h2 {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
  margin-bottom: 0.75rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.section-header h2 {
  margin-bottom: 0;
}

.self-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.observing-note {
  opacity: 0.7;
  font-size: 0.875rem;
}

.current-ticket {
  margin: 0;
}

.current-ticket strong {
  color: var(--color-accent);
}

.countdown {
  margin: 0;
  text-align: center;
  font-family: var(--font-display);
  font-size: 4rem;
  line-height: 1;
  font-weight: 700;
  color: var(--color-accent, var(--color-heading));
  animation: countdown-pop 0.6s ease-out;
}

@keyframes countdown-pop {
  0% {
    transform: scale(1.6);
    opacity: 0;
  }
  60% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
