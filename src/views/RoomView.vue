<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRoom } from '@/composables/useRoom'
import { useParticipants } from '@/composables/useParticipants'
import { DECKS } from '@/constants/decks'
import NameEntryModal from '@/components/NameEntryModal.vue'
import CardDeck from '@/components/CardDeck.vue'
import ParticipantList from '@/components/ParticipantList.vue'
import HostControls from '@/components/HostControls.vue'
import RevealSummary from '@/components/RevealSummary.vue'
import RoomShareBox from '@/components/RoomShareBox.vue'

const route = useRoute()
const code = computed(() => String(route.params.code))

const { room, loading: roomLoading, revealVotes, resetRound } = useRoom(code)
const round = computed(() => room.value?.round)
const {
  participants,
  loading: participantsLoading,
  self,
  joinRoom,
  castVote,
} = useParticipants(code, round)

const deck = computed(() => (room.value ? DECKS[room.value.deck] : []))
</script>

<template>
  <main class="room">
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
          <HostControls
            :revealed="room.revealed"
            @reveal="revealVotes"
            @reset="resetRound"
          />
        </div>

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
          <h2>Your vote</h2>
          <CardDeck
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
  max-width: 40rem;
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
</style>
