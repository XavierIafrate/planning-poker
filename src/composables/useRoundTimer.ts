import { onUnmounted, ref, watch, type Ref } from 'vue'
import type { Timestamp } from 'firebase/firestore'

export function useRoundTimer(roundStartedAt: Ref<Timestamp | undefined>, revealed: Ref<boolean | undefined>) {
  const elapsedSeconds = ref(0)
  let intervalId: ReturnType<typeof setInterval> | null = null

  function tick(startedAt: Timestamp) {
    elapsedSeconds.value = Math.max(0, Math.floor((Date.now() - startedAt.toMillis()) / 1000))
  }

  function stop() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  watch(
    [roundStartedAt, revealed],
    ([startedAt, isRevealed]) => {
      stop()
      if (!startedAt) {
        elapsedSeconds.value = 0
        return
      }
      tick(startedAt)
      if (!isRevealed) {
        intervalId = setInterval(() => tick(startedAt), 1000)
      }
    },
    { immediate: true },
  )

  onUnmounted(stop)

  return { elapsedSeconds }
}
