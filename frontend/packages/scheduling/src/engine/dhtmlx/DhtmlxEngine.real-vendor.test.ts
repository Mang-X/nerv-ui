import { expect, it, vi } from 'vitest'
import { DhtmlxEngine, preloadGantt } from '../../index'
import { firstTask, sampleModel } from '../../test-fixtures/models'
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

it.each(['same task', 'after vendor initialization'])(
  'preserves a reused container through real vendor retirement %s and subsequent updates',
  async (timing) => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] })
    const vendor = await vi.importActual<GanttModule>('../../../vendor/dhtmlx/dhtmlxgantt.es.js')
    await vi.advanceTimersByTimeAsync(1)
    const intervals = vi.spyOn(globalThis, 'setInterval')
    const cleared = vi.spyOn(globalThis, 'clearInterval')
    __setGanttModuleForTest(vendor)
    await preloadGantt()
    const root = document.createElement('div')
    document.body.append(root)
    const a = new DhtmlxEngine()
    const b = new DhtmlxEngine()
    const options = {
      view: 'order',
      readOnly: true,
      scale: 'hour',
      locale: 'zh',
      theme: { isDark: false, tokens: {} },
    } as const
    const model = {
      ...sampleModel,
      tasks: [{ ...firstTask, parentId: undefined, text: 'Current reader B' }],
      links: [],
    }
    try {
      await a.mount(root, options)
      a.setData(sampleModel)
      if (timing === 'after vendor initialization') await vi.advanceTimersByTimeAsync(2)
      a.destroy()
      await b.mount(root, options)
      b.setData(model)
      expect(root.textContent).toContain('Current reader B')
      await vi.advanceTimersByTimeAsync(2)
      a.destroy()
      expect(root.textContent).toContain('Current reader B')
      expect(root.querySelectorAll('.gantt_layout_root')).toHaveLength(1)
      expect(root.classList.contains('nerv-dhx-scope')).toBe(true)
      b.setData({ ...model, tasks: [{ ...model.tasks[0]!, text: 'Reader B updated' }] })
      expect(root.textContent).toContain('Reader B updated')
      b.destroy()
      b.destroy()
      await vi.advanceTimersByTimeAsync(2)
      expect(root.children).toHaveLength(0)
      expect(root.classList.contains('nerv-dhx-scope')).toBe(false)
      const released = cleared.mock.calls.map(([id]) => id)
      expect(intervals.mock.results.length).toBeGreaterThan(0)
      expect(
        intervals.mock.results.map((r) => r.value).filter((id) => !released.includes(id)),
      ).toEqual([])
    } finally {
      a.destroy()
      b.destroy()
      await vi.advanceTimersByTimeAsync(2)
      root.remove()
      vi.clearAllTimers()
      vi.restoreAllMocks()
      vi.useRealTimers()
      __setGanttModuleForTest(null)
    }
  },
)
