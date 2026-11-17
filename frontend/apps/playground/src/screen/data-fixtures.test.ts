import { expect, it } from 'vitest'
import { createSpaceFeed } from './data-fixtures'

it('held requests retain captured source and outcome and all complete after a host remount', async () => {
  const feed = createSpaceFeed('reading-a', '书房')
  feed.held.value = true
  const first = feed.fetcher()
  const failure = feed.fetcher(true).catch((error: Error) => error)
  expect(feed.requests.value).toBe(2)
  expect(feed.pending.value).toBe(true)
  feed.release()
  expect(await first).toEqual({ sourceId: 'reading-a', sequence: 1, text: '书房 · reading-a · 1' })
  expect(await failure).toEqual(new Error('书房暂不可用'))
  expect(feed.pending.value).toBe(false)
})
