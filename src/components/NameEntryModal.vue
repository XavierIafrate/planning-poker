<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ submit: [name: string] }>()

const name = ref('')
const error = ref('')

function handleSubmit() {
  const trimmed = name.value.trim()
  if (!trimmed) {
    error.value = 'Enter a name so others can see who you are'
    return
  }
  if (trimmed.length > 40) {
    error.value = 'Keep it under 40 characters'
    return
  }
  emit('submit', trimmed)
}
</script>

<template>
  <div class="overlay">
    <form
      class="modal"
      @submit.prevent="handleSubmit"
    >
      <h2>Join this room</h2>
      <label for="name">Your name</label>
      <input
        id="name"
        v-model="name"
        type="text"
        autofocus
        maxlength="40"
      >
      <p
        v-if="error"
        class="error"
      >
        {{ error }}
      </p>
      <button type="submit">
        Join
      </button>
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
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

input {
  padding: 0.5rem 0.75rem;
}

button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.error {
  color: #d33;
  margin: 0;
  font-size: 0.875rem;
}
</style>
