import { expect, it, vi } from 'vitest'
import { DhtmlxEngine, preloadGantt } from '../../index'
import { __setGanttModuleForTest, type GanttModule } from './loader'

it('releases the real Evaluation interval after a mount destroyed in its creation task', async () => {
  // Deliberately load the preserved bytes, bypassing only the test config's stub.
  // This lane verifies timers in jsdom; real browser geometry has separate evidence.
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] })
  const vendor = await vi.importActual<GanttModule>('../../../vendor/dhtmlx/dhtmlxgantt.es.js')
  // Settle module-level construction before observing this mount's resources.
  await vi.advanceTimersByTimeAsync(1)
  const intervals = vi.spyOn(globalThis, 'setInterval')
  const cleared = vi.spyOn(globalThis, 'clearInterval')
  __setGanttModuleForTest(vendor)
  await preloadGantt()
  const root = document.createElement('div')
  document.body.append(root)
  const engine = new DhtmlxEngine()
  try {
    await engine.mount(root, {
      view: 'order',
      readOnly: true,
      scale: 'hour',
      locale: 'zh',
      theme: { isDark: false, tokens: {} },
    })
    engine.destroy()
    engine.destroy()
    await vi.advanceTimersByTimeAsync(2)
    const created = intervals.mock.results.map((result) => result.value)
    const released = cleared.mock.calls.map(([id]) => id)
    expect(created.length).toBeGreaterThan(0)
    expect(created.filter((id) => !released.includes(id))).toEqual([])
    expect(root.children).toHaveLength(0)
  } finally {
    engine.destroy()
    root.remove()
    vi.clearAllTimers()
    vi.restoreAllMocks()
    vi.useRealTimers()
    __setGanttModuleForTest(null)
  }
})
