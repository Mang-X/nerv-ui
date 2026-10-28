import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { expect, it, vi } from 'vitest'
import { SchedulingSavedPlan, type ScheduleModel, type SavedPlanOrdersInput, type SavedPlanCommercial, SchedulingToolbar } from '../../index'
import { sampleModel } from '../../test-fixtures/models'

const Board = defineComponent({
  name: 'ResourceSchedulerBoard',
  props: ['model', 'groupBy', 'readOnly'],
  emits: ['taskSelect'],
  setup(_props, { expose }) {
    expose({ engineName: 'dhtmlx', command: vi.fn() })
  },
  template: '<button data-action="graph-select" @click="$emit(\'taskSelect\', \'a1\')">图中活动</button>',
})
const model = (planId = 'reading'): ScheduleModel => ({ ...sampleModel, meta: { ...sampleModel.meta, planId } })
const orders = (planId = 'reading'): SavedPlanOrdersInput => ({
  planId,
  rows: [
    { orderId: 'WO-001', label: '共读约定', progress: { state: 'known', completed: 0, planned: 3 }, taskRefs: [
      { taskId: 'a1', orderId: 'WO-001', operationId: 'op-10' },
      { taskId: 'a2', orderId: 'WO-001', operationId: 'op-20' },
      { taskId: 'order:WO-001', orderId: 'WO-001', operationId: 'op-10' },
    ] },
  ],
})
const commercial = (planId = 'reading'): SavedPlanCommercial => ({
  planId,
  state: 'ready',
  groups: [{ key: 'sales-7', label: '阅读邀请', orderIds: ['WO-001'], target: '/invitations/7' }],
})
function host(extra: Record<string, unknown> = {}) {
  return mount(SchedulingSavedPlan, {
    props: { planId: 'reading', model: model(), orders: orders(), commercial: commercial(), groupBy: 'workCenter', selectedTaskId: null, ...extra },
    global: { stubs: { ResourceSchedulerBoard: Board } },
  })
}

it('keeps graph, order table and detail on one authoritative task and exact task reference', async () => {
  const wrapper = host()
  expect(wrapper.text()).toContain('阅读邀请')
  expect(wrapper.text()).toContain('共读约定')
  expect(wrapper.find('[data-task-id="order:WO-001"]').exists()).toBe(false)
  await wrapper.get('[data-action="graph-select"]').trigger('click')
  expect(wrapper.emitted('update:selectedTaskId')?.at(-1)).toEqual(['a1'])
  expect(wrapper.find('[data-testid="saved-plan-detail"]').exists()).toBe(false)
  await wrapper.setProps({ selectedTaskId: 'a1' })
  expect(wrapper.get('[data-testid="saved-plan-detail"]').text()).toContain('共读第一章')
  expect(wrapper.get('[data-task-id="a1"] button').attributes('aria-pressed')).toBe('true')
  await wrapper.setProps({ planId: 'other', model: model('other'), orders: orders('reading'), commercial: commercial('reading') })
  expect(wrapper.find('[data-testid="saved-plan-detail"]').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('阅读邀请')
  expect(wrapper.text()).not.toContain('共读约定')
})

it('rejects a false legacy pair join and clears removed task without retaining old facts', async () => {
  const wrapper = host({ selectedTaskId: 'a1', orders: { planId: 'reading', rows: [{ orderId: 'WO-001', label: '共读约定', taskRefs: [{ taskId: 'a2', orderId: 'WO-001', operationId: 'op-10' }] }] } })
  expect(wrapper.find('[data-task-id="a2"]').exists()).toBe(false)
  await wrapper.setProps({ model: { ...model(), tasks: sampleModel.tasks.filter((task) => task.id !== 'a1') } })
  expect(wrapper.find('[data-testid="saved-plan-detail"]').exists()).toBe(false)
  expect(wrapper.emitted('update:selectedTaskId')?.at(-1)).toEqual([null])
})

it('keeps grouping controlled, reports commercial authority and sends exact task/group navigation requests', async () => {
  const navigate = vi.fn()
  const wrapper = host({ onNavigate: navigate, links: { planId: 'reading', items: [{ orderId: 'WO-001', target: '/orders/WO-001' }] } })
  await wrapper.get('[data-action="group-link"]').trigger('click')
  expect(navigate).toHaveBeenLastCalledWith({ kind: 'group', planId: 'reading', groupKey: 'sales-7', target: '/invitations/7' })
  await wrapper.get('[data-action="task-link"]').trigger('click')
  expect(navigate).toHaveBeenLastCalledWith({ kind: 'task', planId: 'reading', taskId: 'a1', orderId: 'WO-001', target: '/orders/WO-001' })
  wrapper.findComponent(SchedulingToolbar).vm.$emit('groupChange', 'team')
  expect(wrapper.emitted('update:groupBy')?.at(-1)).toEqual(['team'])
  expect(wrapper.get('[data-testid="saved-plan-board"]').attributes('data-group')).toBe('workCenter')
  await wrapper.setProps({ groupBy: 'team', commercial: { planId: 'reading', state: 'forbidden' } })
  expect(wrapper.get('[data-testid="saved-plan-board"]').attributes('data-group')).toBe('team')
  expect(wrapper.text()).toContain('无权读取关联分组')
  await wrapper.setProps({ commercial: { planId: 'reading', state: 'unavailable' } })
  expect(wrapper.text()).toContain('关联分组暂不可读取')
  await wrapper.setProps({ commercial: { planId: 'reading', state: 'ready', groups: [] } })
  expect(wrapper.text()).toContain('未关联分组')
  await wrapper.setProps({ onNavigate: undefined })
  expect(wrapper.find('[data-action="group-link"]').exists()).toBe(false)
  await nextTick()
  wrapper.unmount()
})

it('search and side re-entry follow accepted selection, while a rejected parent remains authoritative', async () => {
  const wrapper = host()
  await wrapper.get('input[aria-label="搜索工序"]').setValue('共读第一章')
  expect(wrapper.emitted('update:selectedTaskId')?.at(-1)).toEqual(['a1'])
  expect(wrapper.find('[data-testid="saved-plan-detail"]').exists()).toBe(false)
  await wrapper.setProps({ selectedTaskId: 'a1' })
  expect(wrapper.text()).toContain('1/1')
  await wrapper.get('[data-action="toggle-side"]').trigger('click')
  expect(wrapper.find('aside[aria-label="计划工单与活动"]').exists()).toBe(false)
  expect(wrapper.get('[data-testid="saved-plan-detail"]').text()).toContain('共读第一章')
  await wrapper.get('[data-action="toggle-side"]').trigger('click')
  expect(wrapper.get('[data-task-id="a1"] button').attributes('aria-pressed')).toBe('true')
  await wrapper.setProps({ model: { ...model(), tasks: sampleModel.tasks.map(task => task.id === 'a1' ? { ...task, text: '新版第一章', facts: [{ label: '事实', value: '新事实' }] } : task) } })
  expect(wrapper.get('[data-testid="saved-plan-detail"]').text()).toContain('新版第一章')
  expect(wrapper.get('[data-testid="saved-plan-detail"]').text()).toContain('新事实')
  expect(wrapper.get('[data-testid="saved-plan-detail"]').text()).not.toContain('共读第一章')
})

it('keeps delayed old-plan commercial and link responses out of the new plan', async () => {
  const navigate = vi.fn()
  const wrapper = host({ onNavigate: navigate, selectedTaskId: 'a1', links: { planId: 'reading', items: [{ orderId: 'WO-001', target: '/old' }] } })
  await wrapper.setProps({ planId: 'other', model: model('other'), orders: orders('other'), commercial: commercial('reading') })
  expect(wrapper.text()).toContain('关联分组未知')
  expect(wrapper.find('[data-action="task-link"]').exists()).toBe(false)
  expect(wrapper.find('[data-testid="saved-plan-detail"]').exists()).toBe(false)
  await wrapper.setProps({ commercial: commercial('other'), links: { planId: 'other', items: [{ orderId: 'WO-001', target: '/new' }] } })
  await wrapper.get('[data-action="task-link"]').trigger('click')
  expect(navigate).toHaveBeenCalledWith({ kind: 'task', planId: 'other', taskId: 'a1', orderId: 'WO-001', target: '/new' })
})
