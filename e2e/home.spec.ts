import { expect, test } from '@playwright/test'
import { createRoom, joinAs, newPerson } from './support'

test('a room made with the modified deck deals those cards, raccoon included', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('radio', { name: 'Fibonacci (modified)', exact: true }).click()
  await expect(page.getByRole('radio', { name: 'Fibonacci (modified)', exact: true })).toHaveAttribute('aria-checked', 'true')
  await page.getByRole('button', { name: 'Create room' }).click()
  await joinAs(page, 'Host')

  await page.getByPlaceholder('Paste ticket titles, one per line').fill('TICKET-1')
  await page.getByRole('button', { name: 'Add to queue' }).click()
  await page.getByRole('button', { name: 'Pick first ticket' }).click()
  await page.getByRole('button', { name: 'Start voting' }).click()

  const deck = page.locator('.deck')
  for (const card of ['20', '40', '100', '?']) {
    await expect(deck.getByRole('button', { name: card, exact: true })).toBeVisible()
  }
  await expect(deck.getByRole('button', { name: 'raccoon (taking a break)' })).toBeVisible()
  await expect(deck.getByRole('button', { name: '21', exact: true })).toHaveCount(0)
})

test('a room code typed on the home page is uppercased and opens the room', async ({ browser }) => {
  const { host } = await createRoom(browser)
  const code = host.page.url().split('/').pop()!

  const guest = await newPerson(browser)
  await guest.page.goto('./')
  await guest.page.getByLabel('Room code').fill(code.toLowerCase())
  await guest.page.getByRole('button', { name: 'Join', exact: true }).click()
  await expect(guest.page).toHaveURL(new RegExp(`#/room/${code}$`))
  await expect(guest.page.getByText(`You're invited to room ${code}`)).toBeVisible()
  await expect(guest.page.getByText('Host is here')).toBeVisible()
})

test('a malformed room code is rejected before leaving the home page', async ({ page }) => {
  await page.goto('./')
  // 0 and O are left out of room codes because they're easy to confuse.
  await page.getByLabel('Room code').fill('AB0XQ9')
  await page.getByRole('button', { name: 'Join', exact: true }).click()
  await expect(page.getByText('That doesn\'t look like a valid room code')).toBeVisible()
  await expect(page).not.toHaveURL(/#\/room\//)
})

test('a room that does not exist offers another code or a fresh room', async ({ page }) => {
  await page.goto('./#/room/ZZZZZ9')
  await expect(page.getByRole('heading', { name: 'No room at ZZZZZ9' })).toBeVisible()

  await page.getByLabel('Try another code').fill('nope')
  await page.getByRole('button', { name: 'Join', exact: true }).click()
  await expect(page.getByText('That doesn\'t look like a valid room code')).toBeVisible()

  await page.getByLabel('Try another code').fill('yyyyy9')
  await page.getByRole('button', { name: 'Join', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'No room at YYYYY9' })).toBeVisible()

  await page.getByRole('link', { name: 'Start a new room' }).click()
  await expect(page.getByRole('heading', { name: 'Start a room' })).toBeVisible()
})

test('the theme choice sticks across a reload', async ({ page }) => {
  await page.goto('./')
  const html = page.locator('html')
  await expect(html).not.toHaveAttribute('data-theme', /.*/)

  await page.getByRole('group', { name: 'Theme' }).getByRole('button', { name: 'Dark' }).click()
  await expect(html).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(html).toHaveAttribute('data-theme', 'dark')

  await page.getByRole('group', { name: 'Theme' }).getByRole('button', { name: 'System' }).click()
  await expect(html).not.toHaveAttribute('data-theme', /.*/)
  await page.reload()
  await expect(html).not.toHaveAttribute('data-theme', /.*/)
})
