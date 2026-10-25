/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_USE_FIREBASE_EMULATORS?: string
  readonly VITE_AUTH_EMULATOR_PORT?: string
  readonly VITE_FIRESTORE_EMULATOR_PORT?: string
  readonly VITE_PRESENCE_HEARTBEAT_MS?: string
  readonly VITE_PRESENCE_AWAY_AFTER_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
