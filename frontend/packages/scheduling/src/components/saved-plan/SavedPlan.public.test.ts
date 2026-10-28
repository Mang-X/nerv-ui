import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { expect, it, vi } from 'vitest'
import {
  SchedulingSavedPlan,
  SavedPlanOrders,
  SavedPlanWorkOrderLink,
  type ScheduleModel,
  type SavedPlanOrdersInput,
  type SavedPlanCommercial,
  SchedulingToolbar,
} from '../../index'
import { sampleModel } from '../../test-fixtures/models'

const boardCommands = vi.fn()
const Board = defineComponent({
  name: 'ResourceSchedulerBoard',
  props: ['model', 'groupBy', 'readOnly'],
  emits: ['taskSelect'],
  setup(_props, { expose }) {
    expose({ engineName: 'dhtmlx', command: boardCommands })
  },
  template:
    '<button data-action="graph-select" @click="$emit(\'taskSelect\', \'a1\')">图中活动</button>',
})
const model = (planId = 'reading'): ScheduleModel => ({
  ...sampleModel,
  meta: { ...sampleModel.meta, planId },
})
const orders = (planId = 'reading'): SavedPlanOrdersInput => ({
  planId,
  rows: [
    {
      orderId: 'WO-001',
      label: '共读约定',
      progress: { state: 'known', completed: 0, planned: 3 },
      taskRefs: [
        { taskId: 'a1', orderId: 'WO-001', operationId: 'op-10' },
        { taskId: 'a2', orderId: 'WO-001', operationId: 'op-20' },
        { taskId: 'order:WO-001', orderId: 'WO-001', operationId: 'op-10' },
      ],
    },
  ],
})
const commercial = (planId = 'reading'): SavedPlanCommercial => ({
  planId,
  state: 'ready',
  groups: [{ key: 'sales-7', label: '阅读邀请', orderIds: ['WO-001'], target: '/invitations/7' }],
})
function host(extra: Record<string, unknown> = {}) {
  return mount(SchedulingSavedPlan, {
    props: {
      planId: 'reading',
      model: model(),
      orders: orders(),
      commercial: commercial(),
      groupBy: 'workCenter',
      selectedTaskId: null,
      ...extra,
    },
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
  await wrapper.setProps({
    planId: 'other',
    model: model('other'),
    orders: orders('reading'),
    commercial: commercial('reading'),
  })
  expect(wrapper.find('[data-testid="saved-plan-detail"]').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('阅读邀请')
  expect(wrapper.text()).not.toContain('共读约定')
})

it('rejects a false legacy pair join and clears removed task without retaining old facts', async () => {
  const wrapper = host({
    selectedTaskId: 'a1',
    orders: {
      planId: 'reading',
      rows: [
        {
          orderId: 'WO-001',
          label: '共读约定',
          taskRefs: [{ taskId: 'a2', orderId: 'WO-001', operationId: 'op-10' }],
        },
      ],
    },
  })
  expect(wrapper.find('[data-task-id="a2"]').exists()).toBe(false)
  await wrapper.setProps({
    model: { ...model(), tasks: sampleModel.tasks.filter((task) => task.id !== 'a1') },
  })
  expect(wrapper.find('[data-testid="saved-plan-detail"]').exists()).toBe(false)
  expect(wrapper.emitted('update:selectedTaskId')?.at(-1)).toEqual([null])
})

it('keeps grouping controlled, reports commercial authority and sends exact task/group navigation requests', async () => {
  const navigate = vi.fn()
  const wrapper = host({
    onNavigate: navigate,
    links: { planId: 'reading', items: [{ orderId: 'WO-001', target: '/orders/WO-001' }] },
  })
  await wrapper.get('[data-action="group-link"]').trigger('click')
  expect(navigate).toHaveBeenLastCalledWith({
    kind: 'group',
    planId: 'reading',
    groupKey: 'sales-7',
    target: '/invitations/7',
  })
  await wrapper.get('[data-action="task-link"]').trigger('click')
  expect(navigate).toHaveBeenLastCalledWith({
    kind: 'task',
    planId: 'reading',
    taskId: 'a1',
    orderId: 'WO-001',
    target: '/orders/WO-001',
  })
  wrapper.findComponent(SchedulingToolbar).vm.$emit('groupChange', 'team')
  expect(wrapper.emitted('update:groupBy')?.at(-1)).toEqual(['team'])
  expect(wrapper.get('[data-testid="saved-plan-board"]').attributes('data-group')).toBe(
    'workCenter',
  )
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
  await wrapper.setProps({
    model: {
      ...model(),
      tasks: sampleModel.tasks.map((task) =>
        task.id === 'a1'
          ? { ...task, text: '新版第一章', facts: [{ label: '事实', value: '新事实' }] }
          : task,
      ),
    },
  })
  expect(wrapper.get('[data-testid="saved-plan-detail"]').text()).toContain('新版第一章')
  expect(wrapper.get('[data-testid="saved-plan-detail"]').text()).toContain('新事实')
  expect(wrapper.get('[data-testid="saved-plan-detail"]').text()).not.toContain('共读第一章')
})

it('keeps delayed old-plan commercial and link responses out of the new plan', async () => {
  const navigate = vi.fn()
  const wrapper = host({
    onNavigate: navigate,
    selectedTaskId: 'a1',
    links: { planId: 'reading', items: [{ orderId: 'WO-001', target: '/old' }] },
  })
  await wrapper.setProps({
    planId: 'other',
    model: model('other'),
    orders: orders('other'),
    commercial: commercial('reading'),
  })
  expect(wrapper.text()).toContain('关联分组未知')
  expect(wrapper.find('[data-action="task-link"]').exists()).toBe(false)
  expect(wrapper.find('[data-testid="saved-plan-detail"]').exists()).toBe(false)
  await wrapper.setProps({
    commercial: commercial('other'),
    links: { planId: 'other', items: [{ orderId: 'WO-001', target: '/new' }] },
  })
  await wrapper.get('[data-action="task-link"]').trigger('click')
  expect(navigate).toHaveBeenCalledWith({
    kind: 'task',
    planId: 'other',
    taskId: 'a1',
    orderId: 'WO-001',
    target: '/new',
  })
})

it('does not resurrect a removed selection when the same assignment later returns', async () => {
  const wrapper = host({ selectedTaskId: 'a1' })
  await wrapper.setProps({ model: { ...model(), tasks: [] } })
  await wrapper.setProps({ model: model() })
  expect(wrapper.find('[data-testid="saved-plan-detail"]').exists()).toBe(false)
  expect(wrapper.get('[data-task-id="a1"] button').attributes('aria-pressed')).toBe('false')
  wrapper.unmount()
})

it('public order table rejects a model from another plan even when task keys collide', () => {
  const wrapper = mount(SavedPlanOrders, {
    props: { planId: 'other', model: model(), orders: orders('other') },
  })
  expect(wrapper.find('[data-task-id="a1"]').exists()).toBe(false)
  wrapper.unmount()
})

it('link catches navigation rejection and discards an old receipt after context replacement', async () => {
  let reject!: (reason: Error) => void
  const navigate = vi.fn(
    () =>
      new Promise<void>((_resolve, fail) => {
        reject = fail
      }),
  )
  const wrapper = mount(SavedPlanWorkOrderLink, {
    props: {
      label: '打开',
      action: 'task-link',
      target: '/old',
      request: { kind: 'task', planId: 'reading', taskId: 'a1', orderId: 'WO-001' },
      navigate,
    },
  })
  await wrapper.get('button').trigger('click')
  expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  await wrapper.setProps({
    target: '/new',
    request: { kind: 'task', planId: 'other', taskId: 'a1', orderId: 'WO-001' },
  })
  reject(new Error('HTTP 403 private payload'))
  await flushPromises()
  expect(wrapper.text()).not.toContain('HTTP')
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  await wrapper.setProps({
    navigate: () => {
      throw new Error('HTTP 500 secret')
    },
  })
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(wrapper.get('[role="alert"]').text()).toBe('暂时无法打开，请稍后重试')
  expect(wrapper.text()).not.toContain('secret')
  wrapper.unmount()
})

it('keeps zero progress distinct from unknown and plan authority distinct from empty commercial facts', async () => {
  const wrapper = host()
  expect(wrapper.text()).toContain('0 / 3')
  await wrapper.setProps({
    orders: { planId: 'reading', rows: [{ ...orders().rows[0]!, progress: { state: 'unknown' } }] },
    commercial: undefined,
  })
  expect(wrapper.text()).toContain('进度未知')
  expect(wrapper.text()).toContain('关联分组未知')
  await wrapper.setProps({ state: 'forbidden' })
  expect(wrapper.text()).toBe('无权读取该计划')
  await wrapper.setProps({ state: 'unavailable' })
  expect(wrapper.text()).toBe('计划暂不可读取')
  await wrapper.setProps({ state: 'loading' })
  expect(wrapper.text()).toBe('正在读取已保存计划')
  await wrapper.setProps({
    state: 'ready',
    model: { ...model(), tasks: [] },
    commercial: { planId: 'reading', state: 'ready', groups: [] },
  })
  expect(wrapper.text()).toContain('未关联分组')
  expect(wrapper.find('[data-task-id]').exists()).toBe(false)
  wrapper.unmount()
})

it('group navigation uses stable keys even when display labels collide and missing targets stay text', async () => {
  const navigate = vi.fn()
  const wrapper = host({
    onNavigate: navigate,
    commercial: {
      planId: 'reading',
      state: 'ready',
      groups: [
        { key: 'first', label: '相同名称', orderIds: [], target: '/first' },
        { key: 'second', label: '相同名称', orderIds: [], target: '/second' },
        { key: 'no-target', label: '只有名称', orderIds: [] },
      ],
    },
  })
  await wrapper.findAll('[data-action="group-link"]')[1]!.trigger('click')
  expect(navigate).toHaveBeenCalledWith({
    kind: 'group',
    planId: 'reading',
    groupKey: 'second',
    target: '/second',
  })
  expect(wrapper.findAll('[data-action="group-link"]')).toHaveLength(2)
  expect(wrapper.text()).toContain('只有名称')
  wrapper.unmount()
})

it('shows host summary zero unknown notices and actions without inventing a release policy', async () => {
  const wrapper = mount(SchedulingSavedPlan, {
    props: {
      planId: 'reading',
      model: model(),
      groupBy: 'workCenter',
      summary: {
        planId: 'reading',
        facts: [
          { label: '实际数', value: 0 },
          { label: '待核对数', value: null },
        ],
        notices: ['部分活动需在明细核对'],
      },
    },
    slots: { actions: '<button disabled>宿主禁止发布</button>' },
    global: { stubs: { ResourceSchedulerBoard: Board } },
  })
  expect(wrapper.get('dl').text()).toContain('实际数0')
  expect(wrapper.get('dl').text()).toContain('待核对数—')
  expect(wrapper.text()).toContain('部分活动需在明细核对')
  expect(
    wrapper
      .findAll('button')
      .find((button) => button.text() === '宿主禁止发布')!
      .attributes('disabled'),
  ).toBeDefined()
  await wrapper.setProps({ planId: 'other', model: model('other') })
  expect(wrapper.text()).not.toContain('部分活动需在明细核对')
  wrapper.unmount()
})

it('accepted regroup and reorder reveal the same selected assignment while search can clear and miss', async () => {
  const wrapper = host({ selectedTaskId: 'a1' })
  await nextTick()
  boardCommands.mockClear()
  await wrapper.setProps({ groupBy: 'team', laneOrder: 'name' })
  await nextTick()
  expect(boardCommands).toHaveBeenCalledWith({ kind: 'revealTask', taskId: 'a1' })
  expect(wrapper.get('[data-task-id="a1"] button').attributes('aria-pressed')).toBe('true')
  await wrapper.get('input[aria-label="搜索工序"]').setValue('不存在的活动')
  expect(wrapper.text()).toContain('无匹配')
  await wrapper.get('input[aria-label="搜索工序"]').setValue('')
  expect(boardCommands).toHaveBeenCalledWith({ kind: 'setSearchHighlight', taskIds: [] })
  expect(wrapper.get('[data-testid="saved-plan-detail"]').text()).toContain('共读第一章')
  wrapper.unmount()
})
