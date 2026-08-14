<script setup lang="ts">
import raccoonIcon from '@/assets/icons/raccoon.svg'

defineProps<{ value: string }>()
</script>

<template>
  <img
    v-if="value === 'raccoon'"
    :src="raccoonIcon"
    alt="raccoon (taking a break)"
    class="face-icon"
  >
  <template v-else>
    {{ value }}
  </template>
</template>

<style scoped>
.face-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
}
</style>
