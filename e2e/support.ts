import { expect, type Browser, type BrowserContext, type Page } from '@playwright/test'

// Each person gets their own browser context, so they sign in as a separate
// anonymous user — just like separate people on separate machines.
export interface Person {
  context: BrowserContext
  page: Page
}

export async function newPerson(browser: Browser): Promise<Person> {
  const context = await browser.newContext()
  return { context, page: await context.newPage() }
}

export async function joinAs(page: Page, name: string) {
  await page.getByLabel('Your name').fill(name)
  await page.getByRole('button', { name: 'Join and vote' }).click()
  await expect(page.getByRole('heading', { name: 'At the table' })).toBeVisible()
}

/** Host creates a room and joins it; guests open the host's link and join. */
export async function createRoom(browser: Browser, guestNames: string[] = []) {
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
  return { host, guests }
}

export async function queueTickets(page: Page, titles: string[]) {
  await page.getByPlaceholder('Paste ticket titles, one per line').fill(titles.join('\n'))
  await page.getByRole('button', { name: 'Add to queue' }).click()
}

/** Host creates a room, everyone joins, and voting opens on one ticket. */
export async function startVotingRoom(browser: Browser, guestNames: string[], tickets = ['TICKET-1 Login page']) {
  const { host, guests } = await createRoom(browser, guestNames)
  await queueTickets(host.page, tickets)
  await host.page.getByRole('button', { name: 'Pick first ticket' }).click()
  await host.page.getByRole('button', { name: 'Start voting' }).click()
  return { host, guests }
}

export function vote(page: Page, card: string) {
  return page.getByRole('button', { name: card, exact: true }).click()
}

export function row(page: Page, name: string) {
  return page.locator('.participant', { hasText: name })
}

export function queue(page: Page) {
  return page.getByRole('tabpanel', { name: /Up next/ }).getByRole('listitem')
}

export function queueTitles(page: Page) {
  return queue(page).locator('.title')
}

export function stat(page: Page, label: string) {
  return page.locator('.stat', { hasText: label }).locator('dd')
}
