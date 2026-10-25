import { expect, test } from '@playwright/test'
import { row, startVotingRoom, vote } from './support'

test('a vote left behind by someone who closed their tab does not carry into the next round', async ({ browser }) => {
  const { host, guests: [alice, ghost] } = await startVotingRoom(browser, ['Alice', 'Ghost'])

  await vote(ghost!.page, '3')
  await vote(alice!.page, '5')
  await vote(host.page, '5')
  await expect(host.page.getByRole('button', { name: 'Vote again' })).toBeVisible()

  // Ghost leaves with their "3" still saved — their client can't clear it.
  await ghost!.context.close()
  await host.page.getByRole('button', { name: 'Vote again' }).click()
  await host.page.getByRole('button', { name: 'Start voting' }).click()
  await expect(row(host.page, 'Ghost').locator('.vote')).toHaveText('Thinking…')

  await vote(alice!.page, '8')
  await vote(host.page, '8')

  // Revealed with Ghost's stale vote ignored: consensus on 8, Ghost blank.
  // Ghost holds the round open until they're marked away, then the reveal
  // countdown runs, so this needs longer than the default timeout.
  await expect(host.page.getByText('Consensus — everyone picked 8')).toBeVisible({ timeout: 15_000 })
  await expect(row(host.page, 'Ghost').locator('.vote')).toHaveText('No vote')
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
  await expect(host.page.getByRole('button', { name: 'Vote again' })).toBeVisible()
  await expect(host.page.locator('.stat', { hasText: 'Average' })).toContainText('6.5')

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
