import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import App from './App.vue'
import WorkbenchDemo from './WorkbenchDemo.vue'
import { SchedulingHistory, SchedulingWorkbench } from '@nerv-iip/scheduling'

it('navigates every scheduling entry and returns through the persistent public navigation', async () => {
  window.location.hash = '#schedule-workbench/library'
  const w = shallowMount(App)
  const entries: Record<string, string> = {
    '#schedule': 'schedule-demo-stub',
    '#schedule-gantt': 'real-gantt-demo-stub',
    '#schedule-resources/library': 'resource-schedule-demo-stub',
    '#schedule-edit/library': 'order-editing-demo-stub',
    '#schedule-resource-edit/library': 'resource-editing-demo-stub',
    '#schedule-panels/library': 'schedule-panels-demo-stub',
    '#schedule-draft/library': 'draft-editing-demo-stub',
    '#schedule-request/library': 'request-forms-demo-stub',
    '#schedule-snapshot/library': 'snapshot-risk-demo-stub',
    '#schedule-compare/library': 'schedule-comparison-demo-stub',
    '#schedule-async/library': 'async-candidate-demo-stub',
    '#schedule-day/library': 'day-print-demo-stub',
    '#schedule-saved/library': 'saved-plan-demo-stub',
  }
  for (const [href, tag] of Object.entries(entries)) {
    expect(w.find(`[aria-label="排程全部入口"] a[href="${href}"]`).exists()).toBe(true)
    window.location.hash = href
    window.dispatchEvent(new Event('hashchange'))
    await flushPromises()
    expect(w.find(tag).exists(), href).toBe(true)
    window.location.hash = '#schedule-workbench/library'
    window.dispatchEvent(new Event('hashchange'))
    await flushPromises()
    expect(w.find('workbench-demo-stub').exists()).toBe(true)
  }
  w.unmount()
  window.location.hash = ''
})
it.each(['library', 'studio'] as const)(
  'composes independently owned current facts and saved history in %s',
  async (venue) => {
    const w = mount(WorkbenchDemo, {
      props: { venue },
      global: { stubs: { SchedulingWorkbench: true, SchedulingSavedPlan: true } },
    })
    const click = async (text: string) => {
      await w
        .findAll('button')
        .find((b) => b.text() === text)!
        .trigger('click')
    }
    const original = w.getComponent(SchedulingWorkbench).props('model')!
    await click('历史安排')
    const history = w.getComponent(SchedulingHistory).props('input')
    await click('工作台')
    expect(w.text()).not.toMatch(/中性内存示例|模拟操作失败|替换当前事实|替换历史来源/)
    await click('查看最新安排')
    expect(w.getComponent(SchedulingWorkbench).props('model')!.tasks[0]!.id).not.toBe(
      original.tasks[0]!.id,
    )
    await click('历史安排')
    expect(w.getComponent(SchedulingHistory).props('input').entries[0]!.model!.tasks[0]!.id).toBe(
      history.entries[0]!.model!.tasks[0]!.id,
    )
    await click(`明细 · ${venue === 'library' ? '共读' : '创作'}安排 1`)
    await click('采用此安排')
    await click('确认操作')
    await flushPromises()
    expect(w.text()).toContain('操作已确认')
    await click('暂停处理')
    await click('采用此安排')
    await click('确认操作')
    await flushPromises()
    expect(w.text()).toContain('未能完成，请稍后重试')
    w.unmount()
  },
)
