import { computed, ref } from 'vue'
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth'
import { auth } from '@/firebase/client'

const user = ref<User | null>(null)
const ready = ref(false)

let resolveUser: (user: User) => void
const userPromise = new Promise<User>((resolve) => {
  resolveUser = resolve
})

onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    user.value = firebaseUser
    ready.value = true
    resolveUser(firebaseUser)
  } else {
    signInAnonymously(auth).catch((error: unknown) => {
      console.error('Anonymous sign-in failed', error)
    })
  }
})

export function useAuth() {
  const uid = computed(() => user.value?.uid ?? null)
  // Sign-in happens asynchronously on page load; callers that need a uid
  // right away (e.g. creating/joining a room from a fresh page load) should
  // await this instead of reading `user.value` synchronously.
  const waitForUser = () => (user.value ? Promise.resolve(user.value) : userPromise)
  return { user, uid, ready, waitForUser }
}
