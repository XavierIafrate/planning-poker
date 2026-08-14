<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import type { ParticipantRole } from '@/types/room'

const emit = defineEmits<{ submit: [name: string, role: ParticipantRole] }>()

const name = ref('')
const error = ref('')

function handleSubmit(role: ParticipantRole = 'voter') {
  const trimmed = name.value.trim()
  if (!trimmed) {
    error.value = 'Enter a name so others can see who you are'
    return
  }
  if (trimmed.length > 40) {
    error.value = 'Keep it under 40 characters'
    return
  }
  emit('submit', trimmed, role)
}
</script>

<template>
  <div class="overlay">
    <form
      class="modal"
      @submit.prevent="handleSubmit()"
    >
      <h2>Join this room</h2>
      <label for="name">Your name</label>
      <BaseInput
        id="name"
        v-model="name"
        type="text"
        autofocus
        maxlength="40"
      />
      <p
        v-if="error"
        class="error"
      >
        {{ error }}
      </p>
      <div class="actions">
        <BaseButton
          variant="primary"
          type="submit"
          class="submit-button"
        >
          Join to vote
        </BaseButton>
        <BaseButton
          variant="ghost"
          type="button"
          class="observer-button"
          @click="handleSubmit('observer')"
        >
          Join as observer
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: var(--color-background);
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 20rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.modal h2 {
  font-family: var(--font-display);
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  letter-spacing: 0.02em;
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.error {
  color: #d33;
  margin: 0;
  font-size: 0.875rem;
}
</style>
