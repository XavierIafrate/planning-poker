<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRoom } from '@/composables/useRoom'
import { useParticipants } from '@/composables/useParticipants'
import { useTheme } from '@/composables/useTheme'
import { useRoundTimer } from '@/composables/useRoundTimer'
import { DECKS } from '@/constants/decks'
import { ACCENT_COLORS } from '@/constants/theme'
import { hasConsensus, suggestEstimate } from '@/utils/roundStats'
import NameEntryModal from '@/components/NameEntryModal.vue'
import RoomNotFound from '@/components/RoomNotFound.vue'
import CardDeck from '@/components/CardDeck.vue'
import ParticipantList from '@/components/ParticipantList.vue'
import TicketHero from '@/components/TicketHero.vue'
import RevealSummary from '@/components/RevealSummary.vue'
import RoomShareBox from '@/components/RoomShareBox.vue'
import RoomSidebar from '@/components/RoomSidebar.vue'
import AccentPicker from '@/components/AccentPicker.vue'
import RoundTimer from '@/components/RoundTimer.vue'
import ConfettiBurst from '@/components/ConfettiBurst.vue'
import SelfMenu from '@/components/SelfMenu.vue'

const route = useRoute()
const code = computed(() => String(route.params.code))

const {
  room,
  loading: roomLoading,
  startVoting,
  revealVotes,
  resetRound,
  addTickets,
  removeTicket,
  moveTicket,
  nextTicket,
  skipTicket,
  finishTicket,
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
  removeParticipant,
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
const revealed = computed(() => room.value?.phase === 'revealed')
const { elapsedSeconds } = useRoundTimer(roundStartedAt, revealed)

// Auto-reveal once every voter (observers and away participants excluded)
// has locked in a vote.
// Debounced: a participant who just joined may not have reached every
// client's Firestore listener yet, so we let the roster settle briefly
// before committing — any roster or vote change resets the wait.
const AUTO_REVEAL_DEBOUNCE_MS = 600
const voters = computed(() => participants.value.filter((p) => p.role === 'voter' && !p.away))
const allVotersReady = computed(() => voters.value.length > 0 && voters.value.every((p) => p.vote !== null))
// Only who's voting and whether they've voted — not the whole participant
// objects, whose heartbeat timestamps change constantly and would keep
// resetting the debounce so it never fires.
const voterReadiness = computed(() => voters.value.map((p) => `${p.uid}:${p.vote !== null}`).join(','))
let autoRevealTimeoutId: ReturnType<typeof setTimeout> | null = null
watch(voterReadiness, () => {
  if (autoRevealTimeoutId !== null) {
    clearTimeout(autoRevealTimeoutId)
    autoRevealTimeoutId = null
  }
  if (!allVotersReady.value) return
  autoRevealTimeoutId = setTimeout(() => {
    autoRevealTimeoutId = null
    if (isHost.value && room.value?.phase === 'voting' && allVotersReady.value) {
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

// Consensus gets confetti.
const votes = computed(() => participants.value.filter((p) => p.role === 'voter').map((p) => p.vote))
const isConsensus = computed(() => hasConsensus(votes.value))
const showConfetti = ref(false)
const confettiKey = ref(0)
watch(revealReady, (ready) => {
  if (!ready) return
  if (isConsensus.value) {
    confettiKey.value++
    showConfetti.value = true
  }
})

const votedCount = computed(() => voters.value.filter((p) => p.vote !== null).length)
const estimate = computed(() => suggestEstimate(votes.value, deck.value))

// "Ticket 2 of 5": tickets already estimated, this one, and what's queued.
const ticketPosition = computed(() => {
  const current = room.value
  if (!current?.currentTicket) return null
  const finished = new Set(
    (current.history ?? [])
      .filter((entry) => entry.ticket && entry.estimate !== null && entry.ticket !== current.currentTicket)
      .map((entry) => entry.ticket),
  )
  const number = finished.size + 1
  return { number, total: number + current.tickets.length }
})

function saveEstimate() {
  if (room.value?.tickets.length) nextTicket(participants.value)
  else finishTicket(participants.value)
}
</script>

<template>
  <main
    class="room"
    :style="accentHex ? { '--color-accent': accentHex } : {}"
  >
    <template v-if="roomLoading || participantsLoading">
      <p>Loading…</p>
    </template>
    <RoomNotFound
      v-else-if="!room"
      :code="code"
    />
    <template v-else>
      <NameEntryModal
        v-if="!self"
        :room-code="code"
        :present="participants.map((p) => p.name)"
        :current-ticket="room.currentTicket"
        @submit="joinRoom"
      />

      <template v-else>
        <ConfettiBurst
          v-if="showConfetti"
          :key="confettiKey"
          @done="showConfetti = false"
        />

        <div class="layout">
          <div class="main">
            <div class="toolbar">
              <RoomShareBox :code="code" />
              <RoundTimer
                v-if="room.phase !== 'lobby'"
                :seconds="elapsedSeconds"
                :running="room.phase === 'discussion' || room.phase === 'voting'"
              />
              <AccentPicker
                v-if="isHost"
                class="accent"
                :model-value="room.accentColor"
                @update:model-value="setAccentColor"
              />
            </div>

            <TicketHero
              :phase="room.phase"
              :ticket="room.currentTicket"
              :position="ticketPosition"
              :is-host="isHost"
              :voted-count="votedCount"
              :voter-count="voters.length"
              :queue-length="room.tickets.length"
              :estimate="estimate"
              @pick-first="nextTicket(participants)"
              @start-voting="startVoting"
              @reveal="revealVotes"
              @skip="skipTicket"
              @vote-again="resetRound(participants)"
              @save="saveEstimate"
            >
              <p
                v-if="countdownValue !== null"
                :key="countdownValue"
                class="countdown"
                aria-live="polite"
              >
                {{ countdownValue }}
              </p>
              <RevealSummary
                v-if="revealed && revealReady"
                :participants="participants"
                :deck="deck"
              />
            </TicketHero>

            <section
              class="table"
              aria-labelledby="table-heading"
            >
              <h2 id="table-heading">
                At the table
              </h2>
              <ParticipantList
                :participants="participants"
                :phase="room.phase"
                :revealed="revealed && revealReady"
                :self-uid="self.uid"
                :host-uid="room.hostUid"
                :can-remove="isHost"
                @remove="removeParticipant"
              />
            </section>

            <section
              class="vote-section"
              aria-labelledby="vote-heading"
            >
              <div class="section-header">
                <h2 id="vote-heading">
                  Your vote
                </h2>
                <SelfMenu
                  :name="self.name"
                  :job-role="self.jobRole"
                  :role="self.role"
                  @update:job-role="setJobRole"
                  @update:role="setRole"
                />
              </div>
              <p
                v-if="self.role === 'observer'"
                class="phase-note"
              >
                You're observing this round. Your opinions will be noted, and not counted.
              </p>
              <p
                v-else-if="room.phase === 'lobby'"
                class="phase-note"
              >
                Voting opens once a ticket is up for discussion.
              </p>
              <p
                v-else-if="room.phase === 'discussion'"
                class="phase-note"
              >
                Discuss the ticket —
                {{ isHost ? 'click "Start voting" when you\'re ready.' : 'the host will open voting shortly.' }}
              </p>
              <CardDeck
                v-else
                :cards="deck"
                :selected="self.vote"
                :disabled="room.phase === 'revealed'"
                @select="castVote"
              />
            </section>
          </div>

          <RoomSidebar
            class="sidebar"
            :room-code="code"
            :tickets="room.tickets"
            :history="room.history ?? []"
            :is-host="isHost"
            @add="addTickets"
            @remove="removeTicket"
            @move="moveTicket"
          />
        </div>
      </template>
    </template>
  </main>
</template>

<style scoped>
.room {
  width: 100%;
  max-width: 76rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.layout {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 2rem;
}

.main {
  flex: 999 1 34rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar {
  flex: 1 1 17rem;
  max-width: 21rem;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
}

.accent {
  margin-left: auto;
}

h2 {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.section-header h2 {
  margin-bottom: 0;
  flex-shrink: 0;
}

.phase-note {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.countdown {
  margin: 0;
  /* Shrink to the digit so the scale-in animation doesn't overflow the page */
  align-self: center;
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

/* Sidebar drops below the main column; let it use the full width */
@media (max-width: 60rem) {
  .sidebar {
    max-width: none;
  }
}

@media (max-width: 40rem) {
  .room {
    padding: 1rem;
  }

  /* Keep the deck within thumb reach while scrolling the table */
  .vote-section {
    position: sticky;
    bottom: 0;
    z-index: 5;
    margin: 0 -1rem;
    padding: 0.75rem 1rem 1rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-background-soft);
    box-shadow: 0 -6px 16px -10px rgba(0, 0, 0, 0.25);
  }
}
</style>
