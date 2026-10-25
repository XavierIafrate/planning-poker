<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { isValidRoomCode, normalizeRoomCode } from '@/utils/roomCode'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'

defineProps<{ code: string }>()

const router = useRouter()
const retryCode = ref('')
const error = ref('')

function handleRetry() {
  const code = normalizeRoomCode(retryCode.value)
  if (!isValidRoomCode(code)) {
    error.value = 'That doesn\'t look like a valid room code'
    return
  }
  error.value = ''
  retryCode.value = ''
  router.push({ name: 'room', params: { code } })
}
</script>

<template>
  <div class="not-found">
    <div
      class="cards"
      aria-hidden="true"
    >
      <span class="ghost-card" />
      <span class="card">?</span>
    </div>

    <div class="copy">
      <h1>No room at {{ code }}</h1>
      <p>The code may have a typo, or everyone's gone to put the kettle on.</p>
    </div>

    <form
      class="retry"
      @submit.prevent="handleRetry"
    >
      <label for="retry-code">Try another code</label>
      <div class="row">
        <BaseInput
          id="retry-code"
          v-model="retryCode"
          class="code-input"
          type="text"
          placeholder="e.g. AB3XQ9"
          maxlength="6"
          autocapitalize="characters"
        />
        <BaseButton
          variant="primary"
          type="submit"
        >
          Join
        </BaseButton>
      </div>
      <p
        v-if="error"
        class="error"
      >
        {{ error }}
      </p>
    </form>

    <div
      class="divider"
      aria-hidden="true"
    >
      or
    </div>

    <RouterLink
      to="/"
      class="new-room"
    >
      Start a new room
    </RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  width: 100%;
  max-width: 24rem;
  margin: 2rem auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.cards {
  position: relative;
  width: 7.5rem;
  height: 7rem;
}

.ghost-card,
.card {
  position: absolute;
  width: 3.75rem;
  height: 5.5rem;
  border-radius: 0.6rem;
}

.ghost-card {
  left: 0.875rem;
  top: 0.5rem;
  border: 2px dashed var(--color-border-hover);
  transform: rotate(-10deg);
}

.card {
  left: 2.875rem;
  top: 0.25rem;
  border: 2px solid var(--color-border-hover);
  background: var(--color-background);
  transform: rotate(8deg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 2.25rem;
  color: var(--color-heading);
}

.copy {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.25rem;
  line-height: 1.1;
  color: var(--color-heading);
  overflow-wrap: anywhere;
}

.copy p {
  margin: 0;
  color: var(--color-text-muted);
}

.retry {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  text-align: left;
}

.retry label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-heading);
}

.row {
  display: flex;
  gap: 0.5rem;
}

.code-input {
  flex: 1;
  min-width: 0;
  min-height: 2.75rem;
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.code-input::placeholder {
  text-transform: none;
  letter-spacing: normal;
}

.row :deep(.base-button) {
  min-height: 2.75rem;
}

.error {
  margin: 0.25rem 0 0;
  color: #d33;
  font-size: 0.875rem;
}

.divider {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.new-room {
  width: 100%;
  min-height: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  color: var(--color-heading);
  font-weight: 600;
  text-decoration: none;
}

.new-room:hover {
  border-color: var(--color-border-hover);
}
</style>
