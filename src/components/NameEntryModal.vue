<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import JobRolePicker from '@/components/JobRolePicker.vue'
import { DEFAULT_JOB_ROLE } from '@/constants/jobRoles'
import type { JobRole, ParticipantRole } from '@/types/room'

const props = defineProps<{
  roomCode: string
  /** Names of people already in the room. */
  present: string[]
  currentTicket: string | null
}>()

const emit = defineEmits<{ submit: [name: string, role: ParticipantRole, jobRole: JobRole] }>()

const name = ref('')
const jobRole = ref<JobRole>(DEFAULT_JOB_ROLE)
const error = ref('')

const initials = computed(() =>
  props.present.slice(0, 3).map((person) =>
    person
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]!.toUpperCase())
      .join(''),
  ),
)

const whoIsHere = computed(() => {
  const names = props.present
  if (names.length === 0) return "Nobody's here yet. You're early."
  if (names.length === 1) return `${names[0]} is here`
  if (names.length <= 3) return `${names.slice(0, -1).join(', ')} and ${names.at(-1)} are here`
  return `${names.slice(0, 2).join(', ')} and ${names.length - 2} others are here`
})

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
  emit('submit', trimmed, role, jobRole.value)
}
</script>

<template>
  <div class="overlay">
    <form
      class="modal"
      aria-labelledby="join-title"
      @submit.prevent="handleSubmit()"
    >
      <div class="heading">
        <p class="invite">
          You're invited to room <span class="code">{{ roomCode }}</span>
        </p>
        <h2 id="join-title">
          Take a seat
        </h2>
      </div>

      <div class="context">
        <div
          v-if="initials.length"
          class="avatars"
          aria-hidden="true"
        >
          <span
            v-for="(letters, index) in initials"
            :key="index"
            class="avatar"
          >{{ letters }}</span>
        </div>
        <div class="context-text">
          <span class="who">{{ whoIsHere }}</span>
          <span class="what">{{ currentTicket ? `Discussing ${currentTicket}` : 'No ticket picked yet' }}</span>
        </div>
      </div>

      <div class="field">
        <label for="name">Your name</label>
        <BaseInput
          id="name"
          v-model="name"
          type="text"
          autocomplete="nickname"
          placeholder="How the table will see you"
          autofocus
          maxlength="40"
        />
        <p
          v-if="error"
          class="error"
        >
          {{ error }}
        </p>
      </div>

      <div class="field">
        <span aria-hidden="true">Your role</span>
        <JobRolePicker v-model="jobRole" />
      </div>

      <div class="actions">
        <BaseButton
          variant="primary"
          type="submit"
        >
          Join and vote
        </BaseButton>
        <BaseButton
          type="button"
          @click="handleSubmit('observer')"
        >
          Just watch
        </BaseButton>
        <p class="footnote">
          No account needed. Your name is only shown in this room.
        </p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  background: var(--color-background);
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 24rem;
  max-height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.heading {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.invite {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.code {
  font-family: var(--font-display);
  font-size: 1.25rem;
  letter-spacing: 0.1em;
  color: var(--color-accent);
}

h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.5rem;
  line-height: 1;
  color: var(--color-heading);
}

.context {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  background: var(--color-background-soft);
}

.avatars {
  display: flex;
  flex-shrink: 0;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid var(--color-background-soft);
  background: var(--color-background-mute);
  color: var(--color-heading);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
}

.avatar + .avatar {
  margin-left: -0.5rem;
}

.context-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.who {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-heading);
}

.what {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field > label,
.field > span {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-heading);
}

.field :deep(.base-input) {
  min-height: 2.75rem;
  font-size: 1rem;
}

.actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
}

.actions :deep(.base-button) {
  min-height: 2.75rem;
}

.footnote {
  margin: 0.25rem 0 0;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.error {
  color: #d33;
  margin: 0;
  font-size: 0.875rem;
}
</style>
