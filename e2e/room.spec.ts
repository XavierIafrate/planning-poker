import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'

// Each person gets their own browser context, so they sign in as a separate
// anonymous user — just like separate people on separate machines.
interface Person {
  context: BrowserContext
  page: Page
}

async function newPerson(browser: Browser): Promise<Person> {
  const context = await browser.newContext()
  return { context, page: await context.newPage() }
}

async function joinAs(page: Page, name: string) {
  await page.getByLabel('Your name').fill(name)
  await page.getByRole('button', { name: 'Join to vote' }).click()
  await expect(page.getByRole('heading', { name: 'Participants' })).toBeVisible()
}

/** Host creates a room, everyone joins, and voting opens on one ticket. */
async function startVotingRoom(browser: Browser, guestNames: string[]) {
  const host = await newPerson(browser)
  await host.page.goto('./')
  await host.page.getByRole('button', { name: 'Create room' }).click()
  await host.page.waitForURL(/#\/room\/[A-Z0-9]{6}$/)
  await joinAs(host.page, 'Host')

  const guests: Person[] = []
  for (const name of guestNames) {
    const guest = await newPerson(browser)
    await guest.page.goto(host.page.url())
    await joinAs(guest.page, name)
    guests.push(guest)
  }

  await host.page.getByPlaceholder('Paste ticket titles, one per line').fill('TICKET-1 Login page')
  await host.page.getByRole('button', { name: 'Add to queue' }).click()
  await host.page.getByRole('button', { name: 'Pick first ticket' }).click()
  await host.page.getByRole('button', { name: 'Start voting' }).click()

  return { host, guests }
}

function vote(page: Page, card: string) {
  return page.getByRole('button', { name: card, exact: true }).click()
}

function row(page: Page, name: string) {
  return page.locator('.participant', { hasText: name })
}

test('a vote left behind by someone who closed their tab does not carry into the next round', async ({ browser }) => {
  const { host, guests: [alice, ghost] } = await startVotingRoom(browser, ['Alice', 'Ghost'])

  await vote(ghost!.page, '3')
  await vote(alice!.page, '5')
  await vote(host.page, '5')
  await expect(host.page.getByRole('button', { name: 'New round' })).toBeVisible()

  // Ghost leaves with their "3" still saved — their client can't clear it.
  await ghost!.context.close()
  await host.page.getByRole('button', { name: 'New round' }).click()
  await host.page.getByRole('button', { name: 'Start voting' }).click()
  await expect(row(host.page, 'Ghost').locator('.vote')).toHaveText('…')

  await vote(alice!.page, '8')
  await vote(host.page, '8')

  // Revealed with Ghost's stale vote ignored: consensus on 8, Ghost blank.
  // Ghost holds the round open until they're marked away, then the reveal
  // countdown runs, so this needs longer than the default timeout.
  await expect(host.page.getByText('Consensus — everyone picked 8')).toBeVisible({ timeout: 15_000 })
  await expect(row(host.page, 'Ghost').locator('.vote')).toHaveText('—')
})

test('someone who goes away stops blocking auto-reveal, and the host can remove them', async ({ browser }) => {
  const { host, guests: [alice, ghost] } = await startVotingRoom(browser, ['Alice', 'Ghost'])

  await vote(alice!.page, '5')
  await vote(host.page, '8')

  // Ghost is still here and hasn't voted, so the round must stay open.
  await host.page.waitForTimeout(1500)
  await expect(host.page.getByRole('button', { name: 'Reveal votes' })).toBeVisible()
  await expect(row(host.page, 'Ghost').getByText('Away')).toBeHidden()

  // Once Ghost's heartbeats stop, they're marked away and the round reveals.
  await ghost!.context.close()
  await expect(row(host.page, 'Ghost').getByText('Away')).toBeVisible()
  await expect(row(alice!.page, 'Ghost').getByText('Away')).toBeVisible()
  await expect(host.page.getByRole('button', { name: 'New round' })).toBeVisible()
  await expect(host.page.getByText('Average (numeric votes): 6.5')).toBeVisible()

  // Only the host gets remove buttons.
  await expect(alice!.page.getByRole('button', { name: /^Remove / })).toHaveCount(0)
  await host.page.getByRole('button', { name: 'Remove Ghost' }).click()
  await expect(row(host.page, 'Ghost')).toHaveCount(0)
  await expect(row(alice!.page, 'Ghost')).toHaveCount(0)
})

test('people who are still connected are never marked away', async ({ browser }) => {
  const { host, guests: [alice] } = await startVotingRoom(browser, ['Alice'])

  // Well past the away threshold: steady heartbeats keep both people present.
  await host.page.waitForTimeout(6000)
  await expect(host.page.getByText('Away')).toBeHidden()
  await expect(alice!.page.getByText('Away')).toBeHidden()

  await vote(alice!.page, '3')
  await vote(host.page, '3')
  await expect(alice!.page.getByText('Consensus — everyone picked 3')).toBeVisible()
})
