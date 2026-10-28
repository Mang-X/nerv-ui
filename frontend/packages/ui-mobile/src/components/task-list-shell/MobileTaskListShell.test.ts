import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NvMobileTaskListShell } from '../../index'
const mounted: ReturnType<typeof mount>[] = []
afterEach(() => {
  mounted.splice(0).forEach((w) => w.unmount())
  vi.restoreAllMocks()
})
function setup(extra = {}) {
  const w = mount(NvMobileTaskListShell, {
    props: {
      sourceKey: 'a',
      filterKey: 'all',
      pageKey: 0,
      loaded: 0,
      state: 'unknown',
      hasMore: null,
      ...extra,
    },
    slots: { default: '<p>保留行</p>', filters: '<label>筛选</label>' },
  })
  mounted.push(w)
  return w
}
function dimensions(w: ReturnType<typeof setup>, height: () => number) {
  const el = w.get('.nv-m-pr-scroll').element as HTMLElement
  let top = 0
  Object.defineProperties(el, {
    clientHeight: { configurable: true, get: () => 200 },
    scrollHeight: { configurable: true, get: height },
    scrollTop: {
      configurable: true,
      get: () => top,
      set: (v) => {
        top = Math.min(v, Math.max(0, height() - 200))
      },
    },
  })
  return el
}
describe('NvMobileTaskListShell public DOM (jsdom)', () => {
  it('distinguishes unknown, initial failure and successful empty', async () => {
    const w = setup()
    expect(w.text()).toContain('等待加载')
    expect(w.text()).not.toContain('暂无')
    await w.setProps({ errorMessage: '暂时无法读取，请重试。' })
    expect(w.get('[role="alert"]').text()).toContain('暂时无法读取')
    expect(w.text()).not.toContain('暂无')
    await w.setProps({ errorMessage: undefined, state: 'ready', hasMore: false })
    expect(w.text()).toContain('暂无内容')
  })
  it('retains rows with separate refresh and append errors and disables paused retry', async () => {
    const w = setup({
      loaded: 2,
      state: 'ready',
      hasMore: true,
      errorMessage: '更新失败，原内容保留。',
      appendErrorMessage: '后续内容未能加载。',
    })
    expect(w.findAll('[role="alert"]')).toHaveLength(2)
    expect(w.text()).toContain('保留行')
    await w.get('[data-testid="retry-list"]').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
    await w.setProps({ paused: true })
    expect(w.get('[data-testid="retry-list"]').attributes('disabled')).toBeDefined()
  })
  it('restores through rendered heights, failed append retry and manual scroll wins', async () => {
    const save = vi.fn()
    const w = setup({
      loaded: 2,
      state: 'ready',
      hasMore: true,
      storage: { load: () => ({ filterKey: 'all', scrollTop: 900 }), save },
    })
    let height = 400
    const el = dimensions(w, () => height)
    await flushPromises()
    expect(el.scrollTop).toBe(200)
    expect(w.emitted('loadMore')).toHaveLength(1)
    await w.setProps({ pending: 'append' })
    await w.setProps({ pending: null, appendErrorMessage: '稍后重试。' })
    await flushPromises()
    expect(w.emitted('loadMore')).toHaveLength(1)
    await w.get('[data-testid="retry-list"]').trigger('click')
    expect(w.emitted('retryLoadMore')).toHaveLength(1)
    height = 800
    await w.setProps({ appendErrorMessage: undefined, pending: 'append' })
    await w.setProps({ pageKey: 1, loaded: 4, pending: null })
    await flushPromises()
    expect(el.scrollTop).toBe(600)
    expect(w.emitted('loadMore')).toHaveLength(2)
    height = 1400
    await w.setProps({ pageKey: 2, loaded: 6 })
    await flushPromises()
    expect(el.scrollTop).toBe(900)
    expect(save).toHaveBeenLastCalledWith('a', { filterKey: 'all', scrollTop: 900 })
    el.scrollTop = 80
    await w.get('.nv-m-pr-scroll').trigger('scroll')
    await w.setProps({ pageKey: 3 })
    await flushPromises()
    expect(el.scrollTop).toBe(80)
  })
  it('waits for ready and stops at finished maximum without duplicate pages or optional handler loop', async () => {
    const w = setup({
      storage: { load: () => ({ filterKey: 'all', scrollTop: 900 }), save: vi.fn() },
    })
    const el = dimensions(w, () => 500)
    await flushPromises()
    expect(el.scrollTop).toBe(0)
    await w.setProps({ state: 'ready', loaded: 2, hasMore: true })
    await flushPromises()
    expect(w.emitted('loadMore')).toHaveLength(1)
    await w.setProps({ loaded: 3 })
    await flushPromises()
    expect(w.emitted('loadMore')).toHaveLength(1)
    await w.setProps({ hasMore: false })
    await flushPromises()
    expect(el.scrollTop).toBe(300)
    expect(w.text()).toContain('没有更多了')
  })
  it('refused controlled filter restore never scrolls or loads under speculative filter', async () => {
    const w = setup({
      state: 'ready',
      loaded: 2,
      hasMore: true,
      storage: { load: () => ({ filterKey: 'saved', scrollTop: 900 }), save: vi.fn() },
    })
    const el = dimensions(w, () => 2000)
    await flushPromises()
    expect(w.emitted('restoreFilter')).toEqual([['saved']])
    expect(el.scrollTop).toBe(0)
    expect(w.emitted('loadMore')).toBeUndefined()
  })
  it('cancels queued restore on source storage filter and unmount without writing A into B', async () => {
    const saveA = vi.fn(),
      saveB = vi.fn()
    const w = setup({
      state: 'ready',
      loaded: 2,
      hasMore: true,
      storage: { load: () => ({ filterKey: 'all', scrollTop: 900 }), save: saveA },
    })
    const el = dimensions(w, () => 2000)
    await w.setProps({ sourceKey: 'b', storage: { load: () => undefined, save: saveB } })
    await flushPromises()
    expect(el.scrollTop).toBe(0)
    expect(saveA).not.toHaveBeenCalled()
    el.scrollTop = 40
    await w.get('.nv-m-pr-scroll').trigger('scroll')
    expect(saveB).toHaveBeenLastCalledWith('b', { filterKey: 'all', scrollTop: 40 })
    await w.setProps({ filterKey: 'new' })
    expect(el.scrollTop).toBe(0)
    w.unmount()
    await flushPromises()
    expect(saveA).not.toHaveBeenCalled()
  })
  it('storage load save exceptions are diagnostic only and manual wheel cancels restore', async () => {
    const w = setup({
      storage: {
        load: () => {
          throw new Error('private')
        },
        save: () => {
          throw new Error('save')
        },
      },
    })
    await flushPromises()
    expect(w.emitted('storageError')).toHaveLength(1)
    expect(w.text()).not.toContain('private')
    const el = dimensions(w, () => 500)
    el.scrollTop = 20
    await w.get('.nv-m-pr-scroll').trigger('scroll')
    expect(w.emitted('storageError')).toHaveLength(2)
    await w.setProps({
      storage: { load: () => ({ filterKey: 'all', scrollTop: 900 }), save: vi.fn() },
    })
    await w.get('section').trigger('wheel')
    await w.setProps({ state: 'ready', loaded: 2, hasMore: true })
    await flushPromises()
    expect(w.emitted('loadMore')).toBeUndefined()
  })
})
it('paused shell rejects pull gesture without false refreshing spinner', async () => {
  const w = setup({ paused: true, state: 'ready', loaded: 1, hasMore: true })
  const el = w.get('.nv-m-pr-inner')
  el.element.dispatchEvent(new MouseEvent('pointerdown', { clientY: 0, bubbles: true }))
  el.element.dispatchEvent(
    new MouseEvent('pointermove', { clientY: 200, buttons: 1, bubbles: true }),
  )
  el.element.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
  await flushPromises()
  expect(w.emitted('refresh')).toBeUndefined()
  expect(w.text()).not.toContain('刷新中')
})
it('pause cancels in-flight restore page and resume requests the same committed page', async () => {
  const w = setup({
    loaded: 1,
    state: 'ready',
    hasMore: true,
    storage: { load: () => ({ filterKey: 'all', scrollTop: 900 }), save: vi.fn() },
  })
  dimensions(w, () => 400)
  await flushPromises()
  expect(w.emitted('loadMore')).toHaveLength(1)
  await w.setProps({ pending: 'append' })
  await w.setProps({ paused: true, pending: null })
  await flushPromises()
  expect(w.emitted('loadMore')).toHaveLength(1)
  await w.setProps({ paused: false })
  await flushPromises()
  expect(w.emitted('loadMore')).toHaveLength(2)
})
it('accepted filter restoration uses authority before scrolling; replacement storage cancels the old target', async () => {
  const w = setup({
    loaded: 1,
    state: 'ready',
    hasMore: true,
    storage: { load: () => ({ filterKey: 'saved', scrollTop: 900 }), save: vi.fn() },
  })
  const el = dimensions(w, () => 1400)
  await w.setProps({ filterKey: 'saved' })
  await flushPromises()
  expect(el.scrollTop).toBe(900)
  await w.setProps({
    storage: { load: () => ({ filterKey: 'saved', scrollTop: 100 }), save: vi.fn() },
  })
  await flushPromises()
  expect(el.scrollTop).toBe(100)
})
it('refused pause update leaves authority and load conditions consistent', async () => {
  const w = setup({ loaded: 1, state: 'ready', hasMore: true })
  const pause = w.findAll('button').find((b) => b.text() === '暂停')!
  await pause.trigger('click')
  expect(w.emitted('update:paused')).toEqual([[true]])
  expect(w.text()).not.toContain('已暂停')
  await w
    .findAll('button')
    .find((b) => b.text() === '加载更多')!
    .trigger('click')
  expect(w.emitted('loadMore')).toHaveLength(1)
})
it('persists committed filter immediately even without a scroll', async () => {
  const save = vi.fn()
  const w = setup({ storage: { load: () => undefined, save } })
  await w.setProps({ filterKey: 'saved' })
  expect(save).toHaveBeenLastCalledWith('a', { filterKey: 'saved', scrollTop: 0 })
})
