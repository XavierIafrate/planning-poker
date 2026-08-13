<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createRoom } from '@/composables/useRoom'
import { isValidRoomCode, normalizeRoomCode } from '@/utils/roomCode'

const router = useRouter()

const joinCode = ref('')
const joinError = ref('')
const creating = ref(false)
const createError = ref('')

async function handleCreate() {
  creating.value = true
  createError.value = ''
  try {
    const code = await createRoom()
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
    <h1>Planning Poker</h1>
    <p class="tagline">
      Free, real-time sprint estimation. No accounts, no fuss.
    </p>

    <section class="panel">
      <h2>Start a new session</h2>
      <button
        type="button"
        :disabled="creating"
        @click="handleCreate"
      >
        {{ creating ? 'Creating…' : 'Create room' }}
      </button>
      <p
        v-if="createError"
        class="error"
      >
        {{ createError }}
      </p>
    </section>

    <section class="panel">
      <h2>Join a session</h2>
      <form @submit.prevent="handleJoin">
        <input
          v-model="joinCode"
          type="text"
          placeholder="Room code, e.g. AB3XQ9"
          maxlength="6"
          autocapitalize="characters"
        >
        <button type="submit">
          Join
        </button>
      </form>
      <p
        v-if="joinError"
        class="error"
      >
        {{ joinError }}
      </p>
    </section>
  </main>
</template>

<style scoped>
.home {
  max-width: 32rem;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.tagline {
  color: var(--color-text);
  opacity: 0.75;
  margin-bottom: 2rem;
}

.panel {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.panel h2 {
  margin-top: 0;
  font-size: 1rem;
}

form {
  display: flex;
  gap: 0.5rem;
}

input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  text-transform: uppercase;
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.error {
  color: #d33;
  margin-bottom: 0;
  margin-top: 0.75rem;
}
</style>
