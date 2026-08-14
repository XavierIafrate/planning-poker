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
      @click="copyLink"
    >
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
  font-family: monospace;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--color-accent, var(--color-heading));
}
</style>
