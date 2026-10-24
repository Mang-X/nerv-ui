import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useScreenData, type UseScreenDataReturn } from './useScreenData'

// flush 微任务 + 到期定时器
function flush() {
  return vi.advanceTimersByTimeAsync(0)
}

describe('useScreenData', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('immediate 时挂载立即取一次并写入 data', async () => {
    const fetcher = vi.fn().mockResolvedValue('A')
    const scope = effectScope()
    let api!: UseScreenDataReturn<string>
    scope.run(() => {
      api = useScreenData(fetcher, { intervalMs: 1000 })
    })
    expect(fetcher).toHaveBeenCalledTimes(1)
    await flush()
    expect(api.data.value).toBe('A')
    expect(api.isStale.value).toBe(false)
    expect(api.lastUpdated.value).toBeTypeOf('number')
    scope.stop()
  })

  it('按 intervalMs 周期性轮询', async () => {
    const fetcher = vi.fn().mockResolvedValue('A')
    const scope = effectScope()
    scope.run(() => useScreenData(fetcher, { intervalMs: 1000 }))
    await flush()
    expect(fetcher).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1000)
    expect(fetcher).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(1000)
    expect(fetcher).toHaveBeenCalledTimes(3)
    scope.stop()
  })

  it('失败保活：保留上次数据并标记 stale，不抛错', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce('A').mockRejectedValueOnce(new Error('boom'))
    const scope = effectScope()
    let api!: UseScreenDataReturn<string>
    scope.run(() => {
      api = useScreenData(fetcher, { intervalMs: 1000 })
    })
    await flush()
    expect(api.data.value).toBe('A')

    await vi.advanceTimersByTimeAsync(1000)
    expect(api.data.value).toBe('A') // 旧数据保留
    expect(api.isStale.value).toBe(true)
    expect(api.error.value).toBeInstanceOf(Error)
    scope.stop()
  })

  it('stop 后停止轮询', async () => {
    const fetcher = vi.fn().mockResolvedValue('A')
    const scope = effectScope()
    let api!: UseScreenDataReturn<string>
    scope.run(() => {
      api = useScreenData(fetcher, { intervalMs: 1000 })
    })
    await flush()
    api.stop()
    await vi.advanceTimersByTimeAsync(3000)
    expect(fetcher).toHaveBeenCalledTimes(1)
    scope.stop()
  })

  it('scope dispose 自动停止轮询', async () => {
    const fetcher = vi.fn().mockResolvedValue('A')
    const scope = effectScope()
    scope.run(() => useScreenData(fetcher, { intervalMs: 1000 }))
    await flush()
    scope.stop() // 触发 onScopeDispose -> stop
    await vi.advanceTimersByTimeAsync(3000)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('immediate=false 时挂载不取数，start 后才取', async () => {
    const fetcher = vi.fn().mockResolvedValue('A')
    const scope = effectScope()
    let api!: UseScreenDataReturn<string>
    scope.run(() => {
      api = useScreenData(fetcher, { intervalMs: 1000, immediate: false })
    })
    expect(fetcher).toHaveBeenCalledTimes(0)
    await vi.advanceTimersByTimeAsync(1000)
    expect(fetcher).toHaveBeenCalledTimes(1)
    scope.stop()
  })
})

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

describe('useScreenData public lifecycle edges', () => {
  const scopes: ReturnType<typeof effectScope>[] = []
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(10_000)
  })
  afterEach(() => {
    scopes.splice(0).forEach((scope) => scope.stop())
    vi.useRealTimers()
    vi.restoreAllMocks()
  })
  function create<T>(fetcher: () => Promise<T>, options = {}) {
    const scope = effectScope()
    scopes.push(scope)
    const api = scope.run(() => useScreenData(fetcher, options))!
    return { api, scope }
  }

  it('first failure has no invented data or success time and recovery clears error and stale', async () => {
    const failure = new Error('离线')
    const fetcher = vi.fn().mockRejectedValueOnce(failure).mockResolvedValueOnce('恢复')
    const { api } = create(fetcher)
    expect(api.loading.value).toBe(true)
    await flush()
    expect(api.data.value).toBeUndefined()
    expect(api.lastUpdated.value).toBeUndefined()
    expect(api.isStale.value).toBe(false)
    expect(api.error.value).toBe(failure)
    expect(api.loading.value).toBe(false)
    await api.refresh()
    expect(api.data.value).toBe('恢复')
    expect(api.lastUpdated.value).toBe(10_000)
    expect(api.error.value).toBeUndefined()
    expect(api.isStale.value).toBe(false)
  })

  it('failed refresh preserves data and last success time then recovery advances it', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(0)
      .mockRejectedValueOnce('失败')
      .mockResolvedValueOnce(2)
    const { api } = create(fetcher)
    await flush()
    vi.setSystemTime(11_000)
    await api.refresh()
    expect(api.data.value).toBe(0)
    expect(api.lastUpdated.value).toBe(10_000)
    expect(api.error.value).toBe('失败')
    expect(api.isStale.value).toBe(true)
    vi.setSystemTime(12_000)
    await api.refresh()
    expect(api.data.value).toBe(2)
    expect(api.lastUpdated.value).toBe(12_000)
    expect(api.error.value).toBeUndefined()
    expect(api.isStale.value).toBe(false)
  })

  it('initialData zero is retained on failure without pretending to have succeeded', async () => {
    const { api } = create(vi.fn().mockRejectedValue('失败'), { initialData: 0, immediate: false })
    expect(api.data.value).toBe(0)
    expect(api.lastUpdated.value).toBeUndefined()
    expect(api.isStale.value).toBe(false)
    await api.refresh()
    expect(api.data.value).toBe(0)
    expect(api.lastUpdated.value).toBeUndefined()
    expect(api.isStale.value).toBe(true)
  })

  it('manual refresh and polling do not reenter a pending fetcher and the default tick is fifteen seconds', async () => {
    const pending = deferred<string>()
    const fetcher = vi.fn().mockReturnValueOnce(pending.promise).mockResolvedValue('第二轮')
    const { api } = create(fetcher)
    await api.refresh()
    await api.refresh()
    await vi.advanceTimersByTimeAsync(14_999)
    expect(fetcher).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(api.loading.value).toBe(true)
    pending.resolve('第一轮')
    await flush()
    expect(api.data.value).toBe('第一轮')
    await vi.advanceTimersByTimeAsync(15_000)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(api.data.value).toBe('第二轮')
  })

  it('hidden ticks skip requests and visible resumes once while stop restart and dispose clean listeners', async () => {
    let hidden = true
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const fetcher = vi.fn().mockResolvedValue('可见')
    const { api, scope } = create(fetcher, { intervalMs: 1000, immediate: false })
    await vi.advanceTimersByTimeAsync(2000)
    expect(fetcher).not.toHaveBeenCalled()
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    await flush()
    expect(fetcher).toHaveBeenCalledTimes(1)
    api.start()
    api.start()
    await vi.advanceTimersByTimeAsync(1000)
    expect(fetcher).toHaveBeenCalledTimes(2)
    api.stop()
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(2000)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(vi.getTimerCount()).toBe(0)
    api.start()
    await vi.advanceTimersByTimeAsync(1000)
    expect(fetcher).toHaveBeenCalledTimes(3)
    scope.stop()
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(2000)
    expect(fetcher).toHaveBeenCalledTimes(3)
    expect(vi.getTimerCount()).toBe(0)
    const adds = add.mock.calls.filter(([name]) => name === 'visibilitychange')
    expect(adds).toHaveLength(2)
    for (const [, listener] of adds)
      expect(remove).toHaveBeenCalledWith('visibilitychange', listener)
  })

  it.each(['stop', 'dispose'])(
    '%s does not abort or freeze an in flight result and does not reschedule it',
    async (action) => {
      const pending = deferred<string>()
      const fetcher = vi.fn(() => pending.promise)
      const { api, scope } = create(fetcher, { intervalMs: 1000 })
      if (action === 'stop') api.stop()
      else scope.stop()
      pending.resolve('晚回')
      await flush()
      expect(api.data.value).toBe('晚回')
      expect(api.lastUpdated.value).toBe(10_000)
      expect(api.loading.value).toBe(false)
      await vi.advanceTimersByTimeAsync(5000)
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(vi.getTimerCount()).toBe(0)
    },
  )
})
