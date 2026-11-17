import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMemoryList, type MemoryRequest, type MemoryPage } from './useMemoryList'
const clean: (() => void)[] = []
afterEach(() => {
  clean.splice(0).forEach((fn) => fn())
  vi.useRealTimers()
})
function setup() {
  const source = ref('a'),
    filter = ref('all'),
    paused = ref(false)
  const jobs: { resolve: (page: MemoryPage) => void; reject: (e: unknown) => void }[] = []
  const read = vi.fn(
    (_request: MemoryRequest) =>
      new Promise<MemoryPage>((resolve, reject) => jobs.push({ resolve, reject })),
  )
  const diagnostic = vi.fn()
  const w = mount(
    defineComponent({
      setup() {
        const l = useMemoryList({
          source: () => source.value,
          filter: () => filter.value,
          paused: () => paused.value,
          read,
          diagnostic,
        })
        return { l }
      },
      render() {
        return h(
          'div',
          this.l.rows.value.map((r) => h('p', { key: r.id }, r.title)),
        )
      },
    }),
  )
  clean.push(() => w.unmount())
  return { w, l: w.vm.l, source, filter, paused, jobs, read, diagnostic }
}
const page = (id: string, next: number | null) => ({ rows: [{ id, title: id }], next })
describe('memory host callback lane', () => {
  it('retries the same failed raw cursor, deduplicates stable keys, retains refresh failure', async () => {
    const x = setup()
    x.jobs[0]!.resolve(page('one', 8))
    await flushPromises()
    void x.l.request(true)
    x.jobs[1]!.reject(new Error('RAW-secret'))
    await flushPromises()
    expect(x.w.text()).toBe('one')
    expect(x.l.appendErrorMessage.value).toContain('已保留')
    expect(x.diagnostic).toHaveBeenCalled()
    void x.l.request(true)
    expect(x.read.mock.calls[2]?.[0]).toMatchObject({ cursor: 8 })
    x.jobs[2]!.resolve({
      rows: [
        { id: 'one', title: 'one' },
        { id: 'two', title: 'two' },
      ],
      next: null,
    })
    await flushPromises()
    expect(x.w.findAll('p')).toHaveLength(2)
    expect(x.l.hasMore.value).toBe(false)
    void x.l.request()
    x.jobs[3]!.reject(new Error('refresh'))
    await flushPromises()
    expect(x.w.text()).toBe('onetwo')
    expect(x.l.errorMessage.value).toBe('暂时无法更新，请稍后重试。')
  })
  it.each(['resolve', 'reject'] as const)(
    'pause cancels late %s and finally cannot clear new pending',
    async (outcome) => {
      const x = setup()
      x.paused.value = true
      x.paused.value = false
      if (outcome === 'resolve') x.jobs[0]!.resolve(page('stale', null))
      else x.jobs[0]!.reject(new Error('stale'))
      await flushPromises()
      expect(x.l.pending.value).toBe('initial')
      expect(x.w.text()).toBe('')
      expect(x.diagnostic).not.toHaveBeenCalled()
      x.jobs[1]!.resolve(page('fresh', null))
      await flushPromises()
      expect(x.w.text()).toBe('fresh')
    },
  )
  it('queued completion checks final identity before batched source/filter watcher', async () => {
    const x = setup()
    x.jobs[0]!.resolve(page('stale', null))
    x.source.value = 'b'
    x.filter.value = 'saved'
    await flushPromises()
    expect(x.w.text()).toBe('')
    expect(x.read).toHaveBeenCalledTimes(2)
    x.jobs[1]!.resolve(page('new', null))
    await flushPromises()
    expect(x.w.text()).toBe('new')
    x.w.unmount()
    expect(x.read.mock.calls[1]?.[0]?.signal.aborted).toBe(false)
  })
})
it('in-place row reverse/splice batches preserve final keys without triggering queries', async () => {
  const x = setup()
  x.jobs[0]!.resolve({
    rows: [
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' },
    ],
    next: null,
  })
  await flushPromises()
  x.l.rows.value.reverse()
  x.l.rows.value.splice(1, 1, { id: 'c', title: 'C' })
  await flushPromises()
  expect(x.l.rows.value.map((r) => r.id)).toEqual(['b', 'c'])
  expect(x.read).toHaveBeenCalledTimes(1)
})
it('omitted host reader remains unknown and never claims success', async () => {
  let list: ReturnType<typeof useMemoryList>
  const w = mount(
    defineComponent({
      setup() {
        list = useMemoryList({ source: () => 'a', filter: () => 'all', paused: () => false })
        return () => h('p', list.state.value)
      },
    }),
  )
  clean.push(() => w.unmount())
  await flushPromises()
  expect(w.text()).toBe('unknown')
  expect(list!.pending.value).toBe(null)
})
it('unmount aborts pending callback and late rejection stays diagnostic-free', async () => {
  const x = setup()
  x.w.unmount()
  expect(x.read.mock.calls[0]?.[0]?.signal.aborted).toBe(true)
  x.jobs[0]!.reject(new Error('late'))
  await flushPromises()
  expect(x.diagnostic).not.toHaveBeenCalled()
  expect(x.l.errorMessage.value).toBeUndefined()
})
