import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, it, vi } from 'vitest'
import SavedPlanDemo from './SavedPlanDemo.vue'

it('saved plan source consumer keeps two venues and rejects delayed previous-plan facts', async () => {
  vi.useFakeTimers()
  const Plan = defineComponent({
    name: 'SchedulingSavedPlan',
    props: ['planId', 'model', 'commercial', 'groupBy'],
    template: '<div />',
  })
  const wrapper = mount(SavedPlanDemo, {
    props: { venue: 'library', surface: '#schedule-saved/library' },
    global: { stubs: { SchedulingSavedPlan: Plan } },
  })
  expect(wrapper.text()).toContain('书房共读计划')
  expect(wrapper.text()).toContain('未连接计划服务')
  const buttons = () => wrapper.findAll('button')
  await buttons()
    .find((button) => button.text() === '午后交流')!
    .trigger('click')
  await vi.advanceTimersByTimeAsync(220)
  expect(wrapper.getComponent(Plan).props('commercial').planId).toBe('library-afternoon')
  expect(wrapper.getComponent(Plan).props('model').groupDimensions).toHaveLength(2)
  const old = wrapper.getComponent(Plan).props('model').tasks[0].text
  await buttons()
    .find((button) => button.text() === '更新活动事实')!
    .trigger('click')
  expect(wrapper.getComponent(Plan).props('model').tasks[0].text).not.toBe(old)
  await wrapper.setProps({ venue: 'studio', surface: '#schedule-saved/studio' })
  await vi.advanceTimersByTimeAsync(220)
  expect(wrapper.text()).toContain('创作室活动计划')
  expect(wrapper.getComponent(Plan).props('commercial').planId).toBe('studio-afternoon')
  wrapper.unmount()
  expect(vi.getTimerCount()).toBe(0)
  vi.useRealTimers()
})
