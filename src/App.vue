<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ThemeToggle from '@/components/ThemeToggle.vue'
import raccoonIcon from '@/assets/icons/raccoon.svg'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink
        to="/"
        class="brand"
      >
        <span
          class="brand-card"
          aria-hidden="true"
        >
          <img
            :src="raccoonIcon"
            alt=""
          >
        </span>
        <span class="brand-name">Planning Poker</span>
      </RouterLink>
      <div class="header-controls">
        <ThemeToggle />
      </div>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  font-family: var(--font-display);
  font-size: 1.75rem;
  letter-spacing: 0.02em;
  color: var(--color-heading);
  text-decoration: none;
  white-space: nowrap;
}

/* The raccoon joker card doubles as the logo */
.brand-card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.625rem;
  height: 2.25rem;
  border: 2px solid var(--color-accent);
  border-radius: 0.3rem;
  background: var(--color-background);
  transform: rotate(-8deg);
  transition: transform 0.2s ease;
}

.brand:hover .brand-card {
  transform: rotate(4deg) translateY(-2px);
}

.brand-card img {
  width: 1.25rem;
  height: 1.25rem;
}

/* On narrow phones the card alone is the logo; keep the name for screen readers */
@media (max-width: 26rem) {
  .brand-name {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
