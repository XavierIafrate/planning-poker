import { defineConfig, devices } from '@playwright/test'

const PORT = 5299

// End-to-end tests run against the Firebase emulators, never a real project.
// `npm run test:e2e` starts them via `firebase emulators:exec`, which waits
// until every emulator is ready and shuts them all down afterwards. They use
// their own ports (firebase.e2e.json), so tests can run while the dev
// emulators are up. To use `playwright test --ui` instead, start them with
// `npm run emulators:e2e` in another terminal.
// Every test creates its own room, so tests don't interfere with each other.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  // Every reveal sits behind the auto-reveal debounce plus the 3-2-1
  // countdown, which leaves the default 5s too little headroom.
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${PORT}/planning-poker/`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Every major browser except Safari. Edge runs the installed Microsoft Edge
  // (not a Playwright build), and installing it needs root, so locally it's
  // opt-in: `npx playwright install msedge`, then set E2E_EDGE=1.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    ...(process.env.CI || process.env.E2E_EDGE
      ? [{ name: 'msedge', use: { ...devices['Desktop Edge'], channel: 'msedge' } }]
      : []),
  ],
  webServer: {
    // A dedicated port, so an ordinary `npm run dev` pointed at the real
    // project is never mistaken for the test server. Vite is launched
    // directly rather than through an npm/npx wrapper, which can leave it
    // orphaned on shutdown.
    command: `node node_modules/vite/bin/vite.js --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/planning-poker/`,
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    env: {
      VITE_USE_FIREBASE_EMULATORS: 'true',
      VITE_AUTH_EMULATOR_PORT: '9199',
      VITE_FIRESTORE_EMULATOR_PORT: '8180',
      VITE_PRESENCE_HEARTBEAT_MS: '1000',
      VITE_PRESENCE_AWAY_AFTER_MS: '4000',
    },
  },
})
