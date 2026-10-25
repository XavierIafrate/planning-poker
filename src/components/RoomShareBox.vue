<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'

const props = defineProps<{
  code: string
}>()

const copied = ref(false)

async function copyLink() {
  const url = `${window.location.origin}${window.location.pathname}#/room/${props.code}`
  await navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="share">
    <span class="code">{{ code }}</span>
    <BaseButton
      type="button"
      class="copy"
      @click="copyLink"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      ><rect
        x="9"
        y="9"
        width="12"
        height="12"
        rx="2"
      /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
      {{ copied ? 'Copied!' : 'Copy link' }}
    </BaseButton>
  </div>
</template>

<style scoped>
.share {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.code {
  font-family: var(--font-display);
  font-size: 1.75rem;
  line-height: 1;
  letter-spacing: 0.12em;
  color: var(--color-accent, var(--color-heading));
}

.copy {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
}
</style>
