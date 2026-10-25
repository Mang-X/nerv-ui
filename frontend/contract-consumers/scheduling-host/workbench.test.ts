import { mount, flushPromises } from '@vue/test-utils'
import { it, expect, vi } from 'vitest'
import { toast } from '@nerv-iip/ui'
import { readingPlan } from './models'
// Only isolate the not-yet-restored P04 renderer; this verifies Workbench parameters, not vendor.
vi.mock('../../packages/scheduling/src/components/GanttChart.vue', () => ({
  default: { template: '<div />' },
}))
vi.mock('../../packages/scheduling/src/components/ResourceSchedulerBoard.vue', () => ({
  default: { template: '<div />' },
}))
import Workbench from '../../packages/scheduling/src/components/SchedulingWorkbench.vue'
import Toolbar from '../../packages/scheduling/src/components/panels/SchedulingToolbar.vue'
it('Workbench reads replaced callbacks and ignores a cancelled completion without success toast', async () => {
  const original = readingPlan(),
    before = JSON.stringify(original)
  const success = vi.spyOn(toast, 'success').mockImplementation(() => 0)
  const first = vi.fn(async () => readingPlan('first'))
  const wrapper = mount(Workbench, {
    props: { model: original, context: { key: 'A' }, preview: first },
  })
  let finish!: (model: ReturnType<typeof readingPlan>) => void
  const second = vi.fn(
    () =>
      new Promise<ReturnType<typeof readingPlan>>((resolve) => {
        finish = resolve
      }),
  )
  await wrapper.setProps({ preview: second })
  wrapper.getComponent(Toolbar).vm.$emit('repreview')
  await flushPromises()
  expect(first).not.toHaveBeenCalled()
  expect(second).toHaveBeenCalledTimes(1)
  expect(second.mock.calls[0]).toMatchObject([
    { meta: { planId: 'reading' } },
    { context: { key: 'A' }, signal: { aborted: false } },
  ])
  await wrapper.setProps({ context: { key: 'B' }, model: readingPlan('B') })
  finish(readingPlan('late'))
  await flushPromises()
  expect(success).not.toHaveBeenCalled()
  expect(JSON.stringify(original)).toBe(before)
  expect(wrapper.getComponent(Toolbar).props('dirty')).toBe(false)
  await wrapper.setProps({ preview: undefined, release: undefined, model: undefined })
  expect(wrapper.getComponent(Toolbar).props('canRepreview')).toBe(false)
  expect(wrapper.getComponent(Toolbar).props('canRelease')).toBe(false)
  wrapper.unmount()
  success.mockRestore()
})
it('Workbench reports only successful injected preview and readOnly blocks action emission', async () => {
  const success = vi.spyOn(toast, 'success').mockImplementation(() => 0)
  const preview = vi.fn(async () => readingPlan('accepted'))
  const wrapper = mount(Workbench, { props: { model: readingPlan(), preview, readOnly: true } })
  wrapper.getComponent(Toolbar).vm.$emit('repreview')
  await flushPromises()
  expect(preview).not.toHaveBeenCalled()
  await wrapper.setProps({ readOnly: false })
  wrapper.getComponent(Toolbar).vm.$emit('repreview')
  await flushPromises()
  expect(success).toHaveBeenCalledWith('已按锁定项重新排程')
  wrapper.unmount()
  success.mockRestore()
})
