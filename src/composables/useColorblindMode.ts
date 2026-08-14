import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'planning-poker-colorblind-mode'

const enabled = ref(localStorage.getItem(STORAGE_KEY) === 'true')

watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, String(enabled.value))
})

export function useColorblindMode() {
  function toggle() {
    enabled.value = !enabled.value
  }
  return { enabled, toggle }
}
