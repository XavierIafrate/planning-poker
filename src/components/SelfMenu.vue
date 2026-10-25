<script setup lang="ts">
import { onBeforeUnmount, ref, useId, watch } from 'vue'
import { JOB_ROLE_LABELS } from '@/constants/jobRoles'
import JobRolePicker from '@/components/JobRolePicker.vue'
import type { JobRole, ParticipantRole } from '@/types/room'

defineProps<{
  name: string
  jobRole: JobRole
  role: ParticipantRole
}>()

const emit = defineEmits<{
  'update:jobRole': [value: JobRole]
  'update:role': [value: ParticipantRole]
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const panelId = useId()

function close(returnFocus = false) {
  open.value = false
  if (returnFocus) trigger.value?.focus()
}

function onPointerDown(event: PointerEvent) {
  if (root.value && !root.value.contains(event.target as Node)) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close(true)
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeydown)
  } else {
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('keydown', onKeydown)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div
    ref="root"
    class="self-menu"
  >
    <button
      ref="trigger"
      type="button"
      class="trigger"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="open = !open"
    >
      <span class="summary">{{ name }} · {{ JOB_ROLE_LABELS[jobRole] }} · {{ role === 'observer' ? 'Watching' : 'Voting' }}</span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      ><path d="m6 9 6 6 6-6" /></svg>
    </button>

    <div
      v-show="open"
      :id="panelId"
      class="panel"
    >
      <div class="group">
        <span
          :id="`${panelId}-role`"
          class="label"
        >Your role</span>
        <JobRolePicker
          :model-value="jobRole"
          @update:model-value="emit('update:jobRole', $event)"
        />
      </div>
      <div class="group">
        <span
          :id="`${panelId}-mode`"
          class="label"
        >This round</span>
        <div
          class="mode"
          role="radiogroup"
          :aria-labelledby="`${panelId}-mode`"
        >
          <button
            type="button"
            role="radio"
            :aria-checked="role === 'voter'"
            @click="emit('update:role', 'voter')"
          >
            Vote
          </button>
          <button
            type="button"
            role="radio"
            :aria-checked="role === 'observer'"
            @click="emit('update:role', 'observer')"
          >
            Just watch
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.self-menu {
  position: relative;
  min-width: 0;
}

.trigger {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  max-width: 100%;
  min-height: 2.25rem;
  padding: 0 0.625rem 0 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-background);
  color: var(--color-text);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
}

.trigger:hover {
  border-color: var(--color-border-hover);
}

.summary {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.panel {
  position: absolute;
  right: 0;
  top: calc(100% + 0.375rem);
  z-index: 10;
  width: max-content;
  max-width: min(20rem, calc(100vw - 2rem));
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  background: var(--color-background);
  box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

/* Bottom of the screen on phones, so open it upwards */
@media (max-width: 40rem) {
  .panel {
    top: auto;
    bottom: calc(100% + 0.375rem);
  }
}

.group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.mode {
  display: inline-flex;
  padding: 0.1875rem;
  border-radius: 0.5rem;
  background: var(--color-background-mute);
}

.mode button {
  flex: 1;
  min-height: 2rem;
  padding: 0 0.75rem;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--color-text-muted);
  font: inherit;
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.mode button[aria-checked='true'] {
  background: var(--color-background);
  color: var(--color-heading);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}
</style>
