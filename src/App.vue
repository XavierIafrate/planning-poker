<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink
        to="/"
        class="brand"
      >
        Planning Poker
      </RouterLink>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.brand {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--color-heading);
  text-decoration: none;
}
</style>
