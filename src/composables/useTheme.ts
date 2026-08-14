import { computed, ref, watchEffect } from 'vue'

export type ThemePreference = 'system' | 'light' | 'dark'

const STORAGE_KEY = 'planning-poker-theme'

function readStoredTheme(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : 'system'
}

const theme = ref<ThemePreference>(readStoredTheme())

const systemPrefersDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (event) => (systemPrefersDark.value = event.matches))

const isDark = computed(() =>
  theme.value === 'system' ? systemPrefersDark.value : theme.value === 'dark',
)

watchEffect(() => {
  if (theme.value === 'system') {
    document.documentElement.removeAttribute('data-theme')
    localStorage.removeItem(STORAGE_KEY)
  } else {
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem(STORAGE_KEY, theme.value)
  }
})

export function useTheme() {
  function setTheme(next: ThemePreference) {
    theme.value = next
  }
  return { theme, isDark, setTheme }
}
