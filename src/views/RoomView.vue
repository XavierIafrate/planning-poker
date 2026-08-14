<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRoom } from '@/composables/useRoom'
import { useParticipants } from '@/composables/useParticipants'
import { useTheme } from '@/composables/useTheme'
import { DECKS } from '@/constants/decks'
import { ACCENT_COLORS } from '@/constants/theme'
import NameEntryModal from '@/components/NameEntryModal.vue'
import CardDeck from '@/components/CardDeck.vue'
import ParticipantList from '@/components/ParticipantList.vue'
import HostControls from '@/components/HostControls.vue'
import RevealSummary from '@/components/RevealSummary.vue'
import RoomShareBox from '@/components/RoomShareBox.vue'
import TicketQueue from '@/components/TicketQueue.vue'
import AccentPicker from '@/components/AccentPicker.vue'
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
} = useParticipants(code, round)

const deck = computed(() => (room.value ? DECKS[room.value.deck] : []))
const isHost = computed(() => !!room.value && !!self.value && room.value.hostUid === self.value.uid)

const { isDark } = useTheme()
const accentHex = computed(() => {
  if (!room.value) return null
  const definition = ACCENT_COLORS[room.value.accentColor]
  return isDark.value ? definition.dark : definition.light
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
        <div class="room-header">
          <RoomShareBox :code="code" />
          <AccentPicker
            v-if="isHost"
            :model-value="room.accentColor"
            @update:model-value="setAccentColor"
          />
          <HostControls
            v-if="isHost"
            :revealed="room.revealed"
            @reveal="revealVotes"
            @reset="resetRound"
          />
        </div>

        <TicketQueue
          v-if="isHost"
          :tickets="room.tickets"
          :current-ticket="room.currentTicket"
          @add="addTickets"
          @remove="removeTicket"
          @move="moveTicket"
          @next="nextTicket"
        />

        <p
          v-if="room.currentTicket"
          class="current-ticket"
        >
          Now estimating: <strong>{{ room.currentTicket }}</strong>
        </p>

        <RevealSummary
          v-if="room.revealed"
          :participants="participants"
        />

        <section>
          <h2>Participants</h2>
          <ParticipantList
            :participants="participants"
            :revealed="room.revealed"
          />
        </section>

        <section>
          <div class="section-header">
            <h2>Your vote</h2>
            <BaseButton
              variant="ghost"
              type="button"
              class="role-toggle"
              @click="setRole(self.role === 'observer' ? 'voter' : 'observer')"
            >
              {{ self.role === 'observer' ? 'Switch to voting' : 'Switch to observing' }}
            </BaseButton>
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
</style>
