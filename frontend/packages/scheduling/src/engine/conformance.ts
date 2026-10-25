import { expect, it } from 'vitest'
import type { ScheduleModel } from '../model/types'
import type { SchedulingEngine, SchedulingEngineOptions } from './engine'

// 可复用的引擎契约套件。任意 SchedulingEngine 实现传入工厂即可断言「可替换性」契约。
// 仅断言实现提供的事件/DOM接缝，不能证明真实 vendor 或后端 APS。

const baseOptions = (): SchedulingEngineOptions => ({
  view: 'order',
  readOnly: false,
  scale: 'day',
  locale: 'zh',
  theme: { isDark: true, tokens: { '--brand': 'oklch(0.62 0.17 255)' } },
})

const baseModel = (): ScheduleModel => ({
  tasks: [
    {
      id: 'a1',
      orderId: 'reading',
      operationId: 'chapter',
      operationSequence: 1,
      type: 'operation',
      text: '共读',
      startUtc: '2026-10-25T08:00:00Z',
      endUtc: '2026-10-25T09:00:00Z',
      locked: false,
      hasConflict: false,
      conflictReason: null,
    },
  ],
  links: [],
  resources: [],
  loads: [],
  conflicts: [],
  unscheduled: [],
  changes: [],
  horizon: { startUtc: '2026-10-25T00:00:00Z', endUtc: '2026-10-26T00:00:00Z' },
  meta: { planId: 'reading', status: 'preview', algorithmVersion: 'host-supplied' },
})

export function runEngineConformance(makeEngine: () => SchedulingEngine): void {
  it('mounts, renders one node per task, and exposes state', async () => {
    const el = document.createElement('div')
    const engine = makeEngine()
    await engine.mount(el, baseOptions())
    const model: ScheduleModel = baseModel()
    engine.setData(model)
    expect(el.querySelectorAll('[data-task-id]').length).toBe(model.tasks.length)
    expect(engine.getState().scale).toBe('day')
    engine.destroy()
  })

  it('applies scaleTo command and reports via scaleChanged', async () => {
    const el = document.createElement('div')
    const engine = makeEngine()
    let reported: string | undefined
    await engine.mount(el, baseOptions())
    engine.on('scaleChanged', (p) => {
      reported = p.scale
    })
    engine.setData(baseModel())
    engine.applyCommand({ kind: 'scaleTo', scale: 'week' })
    expect(reported).toBe('week')
    expect(engine.getState().scale).toBe('week')
    engine.destroy()
  })

  it('selectTask command emits taskSelected with normalized id', async () => {
    const el = document.createElement('div')
    const engine = makeEngine()
    let selected: string | undefined
    await engine.mount(el, baseOptions())
    engine.on('taskSelected', (p) => {
      selected = p.taskId
    })
    engine.setData(baseModel())
    engine.applyCommand({ kind: 'selectTask', taskId: 'a1' })
    expect(selected).toBe('a1')
    expect(engine.getState().selectedTaskId).toBe('a1')
    engine.destroy()
  })

  it('destroy cleans the container', async () => {
    const el = document.createElement('div')
    const engine = makeEngine()
    await engine.mount(el, baseOptions())
    engine.setData(baseModel())
    engine.destroy()
    expect(el.children.length).toBe(0)
  })
}
