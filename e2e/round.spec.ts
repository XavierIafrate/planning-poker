// The page.evaluate callbacks run in the browser, so they need DOM types.
/// <reference lib="dom" />
import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { createRoom, joinAs, newPerson, queue, queueTickets, queueTitles, row, startVotingRoom, stat, vote } from './support'

const RACCOON = 'raccoon (taking a break)'

test('the host curates the queue and guests see it without the controls', async ({ browser }) => {
  const { host, guests: [alice] } = await createRoom(browser, ['Alice'])

  // Blank lines and stray whitespace are dropped.
  await queueTickets(host.page, ['  A-1 Signup  ', '', 'A-2 Billing', 'A-3 Search'])
  await expect(queueTitles(host.page)).toHaveText(['A-1 Signup', 'A-2 Billing', 'A-3 Search'])
  await expect(host.page.getByRole('tab', { name: 'Up next · 3' })).toBeVisible()

  await queue(host.page).filter({ hasText: 'A-3 Search' }).getByRole('button', { name: 'Move ticket up' }).click()
  await expect(queueTitles(host.page)).toHaveText(['A-1 Signup', 'A-3 Search', 'A-2 Billing'])
  await queue(host.page).filter({ hasText: 'A-1 Signup' }).getByRole('button', { name: 'Remove ticket' }).click()
  await expect(queueTitles(host.page)).toHaveText(['A-3 Search', 'A-2 Billing'])
  await expect(queue(host.page).first().getByRole('button', { name: 'Move ticket up' })).toBeDisabled()
  await expect(queue(host.page).last().getByRole('button', { name: 'Move ticket down' })).toBeDisabled()

  await expect(queueTitles(alice!.page)).toHaveText(['A-3 Search', 'A-2 Billing'])
  await expect(alice!.page.getByRole('button', { name: /^(Move ticket|Remove ticket)/ })).toHaveCount(0)
  await expect(alice!.page.getByRole('button', { name: 'Add to queue' })).toHaveCount(0)
  await expect(alice!.page.getByRole('heading', { name: 'Waiting for the host to pick a ticket' })).toBeVisible()
})

test('skipping a ticket sends it to the back of the queue', async ({ browser }) => {
  const { host, guests: [alice] } = await createRoom(browser, ['Alice'])
  await queueTickets(host.page, ['B-1', 'B-2', 'B-3'])
  await host.page.getByRole('button', { name: 'Pick first ticket' }).click()
  await expect(alice!.page.getByRole('heading', { name: 'B-1' })).toBeVisible()
  await expect(alice!.page.getByText('Ticket 1 of 3')).toBeVisible()

  await host.page.getByRole('button', { name: 'Skip ticket' }).click()
  await expect(alice!.page.getByRole('heading', { name: 'B-2' })).toBeVisible()
  await expect(queueTitles(alice!.page)).toHaveText(['B-3', 'B-1'])
})

test('a full session: reveal, save estimates, and export the history', async ({ browser }) => {
  const { host, guests: [alice, bob] } = await startVotingRoom(browser, ['Alice', 'Bob'], ['C-1 Login', 'C-2 Logout'])

  await vote(host.page, '3')
  await expect(host.page.getByText('1 of 3 voted')).toBeVisible()
  await expect(row(alice!.page, 'Host').locator('.vote')).toHaveText('Voted')
  await vote(alice!.page, '8')
  await vote(bob!.page, RACCOON)

  // Everyone's in, so it reveals by itself. The raccoon doesn't count
  // towards the numbers: average 5.5, nearest card 5.
  await expect(stat(host.page, 'Average')).toHaveText('5.5')
  await expect(stat(host.page, 'Suggested')).toHaveText('5')
  await expect(stat(host.page, 'Spread')).toHaveText('3–8')
  const bars = host.page.getByRole('list', { name: 'Votes by card' }).getByRole('listitem')
  await expect(bars).toHaveCount(3)
  await expect(bars.filter({ has: host.page.getByRole('img', { name: RACCOON }) })).toContainText('Bob')
  await expect(stat(bob!.page, 'Average')).toHaveText('5.5')
  await expect(bob!.page.locator('.deck .card').first()).toBeDisabled()

  await host.page.getByRole('button', { name: 'Save 5 & next ticket' }).click()
  await expect(alice!.page.getByRole('heading', { name: 'C-2 Logout' })).toBeVisible()
  await expect(row(alice!.page, 'Host').locator('.vote')).toHaveCount(0)

  await host.page.getByRole('button', { name: 'Start voting' }).click()
  for (const person of [host, alice!, bob!]) await vote(person.page, '2')
  await expect(alice!.page.getByText('Consensus — everyone picked 2')).toBeVisible()
  await host.page.getByRole('button', { name: 'Save 2', exact: true }).click()

  // Out of tickets: back to the lobby, with both rounds in the history.
  await expect(host.page.getByRole('heading', { name: 'Add a ticket to get started' })).toBeVisible()
  await alice!.page.getByRole('tab', { name: 'History · 2' }).click()
  const history = alice!.page.getByRole('tabpanel', { name: /History/ }).getByRole('listitem')
  await expect(history).toHaveCount(2)
  await expect(history.filter({ hasText: 'C-1 Login' })).toContainText('Alice 8')
  await expect(history.filter({ hasText: 'C-2 Logout' })).toContainText('Consensus')

  const [download] = await Promise.all([
    alice!.page.waitForEvent('download'),
    alice!.page.getByRole('button', { name: 'Export CSV' }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/^planning-poker-[A-Z0-9]{6}\.csv$/)
  const csv = (await readFile(await download.path(), 'utf8')).split('\n')
  expect(csv[0]).toBe('Ticket,Round,Estimate,Average,Consensus,Votes')
  expect(csv).toHaveLength(3)
  const first = csv.find((line) => line.startsWith('C-1 Login'))!
  expect(first).toContain(',5,5.5,no,')
  // Votes are listed in roster order, not voting order.
  expect(first.split(',').at(-1)!.split('; ').sort()).toEqual(['Alice: 8', 'Bob: raccoon', 'Host: 3'])
  expect(csv.find((line) => line.startsWith('C-2 Logout'))).toContain(',2,2,yes,')
})

test('observers are left out of the vote, and can switch to voting', async ({ browser }) => {
  const { host } = await startVotingRoom(browser, [])
  const watcher = await newPerson(browser)
  await watcher.page.goto(host.page.url())
  await watcher.page.getByLabel('Your name').fill('Watcher')
  await watcher.page.getByRole('button', { name: 'Just watch' }).click()

  await expect(watcher.page.getByText('You\'re observing this round.')).toBeVisible()
  await expect(watcher.page.locator('.deck')).toHaveCount(0)
  await expect(row(host.page, 'Watcher')).toContainText('Watching')
  await expect(host.page.getByText('0 of 1 voted')).toBeVisible()

  await watcher.page.getByRole('button', { name: /Watcher · Dev · Watching/ }).click()
  await watcher.page.getByRole('radio', { name: 'Vote' }).click()
  await expect(host.page.getByText('0 of 2 voted')).toBeVisible()
  await vote(watcher.page, '13')
  await vote(host.page, '13')
  await expect(host.page.getByText('Consensus — everyone picked 13')).toBeVisible()
})

test('a guest who joins mid-round sees the ticket being discussed', async ({ browser }) => {
  const { host } = await startVotingRoom(browser, [], ['D-1 Reports'])
  const late = await newPerson(browser)
  await late.page.goto(host.page.url())
  await expect(late.page.getByText('Discussing D-1 Reports')).toBeVisible()
  await joinAs(late.page, 'Late')
  await expect(late.page.getByText('0 of 2 voted')).toBeVisible()
  await expect(late.page.getByRole('button', { name: '5', exact: true })).toBeEnabled()
})

test('the copy button puts the room link on the clipboard', async ({ browser, browserName }) => {
  const { host } = await createRoom(browser)
  const url = host.page.url()
  // Headless Chromium refuses clipboard writes without the permission, where
  // the real browser allows them on a click. Firefox needs no help.
  if (browserName === 'chromium') await host.context.grantPermissions(['clipboard-read', 'clipboard-write'])

  await host.page.getByRole('button', { name: 'Copy link' }).click()
  await expect(host.page.getByRole('button', { name: 'Copied!' })).toBeVisible()
  await expect(host.page.getByRole('button', { name: 'Copy link' })).toBeVisible({ timeout: 4000 })

  // Only Chromium lets a test read the clipboard back; elsewhere, the button
  // flipping to "Copied!" shows that writeText resolved.
  if (browserName === 'chromium') {
    expect(await host.page.evaluate(() => navigator.clipboard.readText())).toBe(url)
  }
})

test('the host\'s accent colour reaches everyone in the room', async ({ browser }) => {
  const { host, guests: [alice] } = await createRoom(browser, ['Alice'])
  const accent = () =>
    alice!.page.locator('main.room').evaluate((el) => getComputedStyle(el).getPropertyValue('--color-accent').trim())

  await expect(alice!.page.getByRole('radiogroup', { name: 'Accent color' })).toHaveCount(0)
  await host.page.getByRole('radio', { name: 'Purple' }).click()
  await expect(host.page.getByRole('radio', { name: 'Purple' })).toHaveAttribute('aria-checked', 'true')
  await expect.poll(accent).toBe('#6d28d9')
})
