// @vitest-environment jsdom
import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import * as S from '@nerv-iip/scheduling'
import ResourcePage from './docs/components/desktop/resource-scheduler.md'
import Panels from './docs/.vitepress/examples/SchedulingPanelsExample.vue'
import Draft from './docs/.vitepress/examples/SchedulingDraftExample.vue'
const commands = vi.fn()
const Graph = defineComponent({
  name: 'GraphBoundary',
  props: ['model', 'groupBy', 'laneOrder', 'scale'],
  setup(_, { expose }) {
    expose({ command: commands, engineName: 'dhtmlx' })
    return () => h('div')
  },
})
let page: ReturnType<typeof mount>
afterEach(() => {
  page?.unmount()
  document.body.innerHTML = ''
  vi.useRealTimers()
  commands.mockClear()
})
function open(component: typeof Panels | typeof Draft | typeof ResourcePage) {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  page = mount(component, {
    attachTo: document.body,
    global: { stubs: { GanttChart: Graph, ResourceSchedulerBoard: Graph } },
  })
  return page
}
async function click(text: string) {
  const button = [...document.querySelectorAll('button')].find(
    (b) => b.textContent?.trim() === text,
  )
  expect(button, text).toBeTruthy()
  button!.click()
  await flushPromises()
}
it('current task selection joins real panels facts search graph commands rejection readonly and replacement', async () => {
  open(Panels)
  await page.get('[data-conflict-id="notice-a"]').trigger('click')
  expect(page.findComponent(S.TaskDetailPanel).props('task')!.id).toBe('activity-a')
  expect(page.findComponent(S.TaskDetailPanel).text()).toContain('参与人数')
  expect(page.findComponent(S.TaskDetailPanel).text()).toContain('未知')
  await click('锁定活动')
  expect(page.findComponent(S.TaskDetailPanel).props('task')!.locked).toBe(true)
  await page.findAll('input[type="checkbox"]')[0]!.setValue(false)
  await click('解锁活动')
  expect(page.findComponent(S.TaskDetailPanel).props('task')!.locked).toBe(true)
  await page.findAll('input[type="checkbox"]')[1]!.setValue(true)
  expect(page.findComponent(S.TaskDetailPanel).findAll('button')).toHaveLength(0)
  const toolbar = page.findComponent(S.SchedulingToolbar)
  toolbar.vm.$emit('update:search', '共读')
  await flushPromises()
  expect(toolbar.props('matchCount')).toBe(2)
  toolbar.vm.$emit('searchNext')
  await flushPromises()
  expect(commands).toHaveBeenCalledWith({ kind: 'revealTask', taskId: 'activity-b' })
  toolbar.vm.$emit('update:search', '')
  toolbar.vm.$emit('groupChange', 'team')
  toolbar.vm.$emit('laneOrderChange', 'busiest')
  await flushPromises()
  expect(toolbar.props('matchCount')).toBe(0)
  expect(page.findComponent(S.SchedulingLegend).props()).toMatchObject({
    groupBy: 'team',
    laneOrder: 'busiest',
  })
  expect(page.findComponent(Graph).props()).toMatchObject({ groupBy: 'team', laneOrder: 'busiest' })
  await page.get('[data-change-task="activity-b"]').trigger('click')
  expect(page.findComponent(S.TaskDetailPanel).props('task')!.id).toBe('activity-b')
  await click('替换活动来源')
  expect(page.findComponent(S.TaskDetailPanel).props('task')).toBeUndefined()
  expect(page.findComponent(S.ConflictPanel).props('conflicts')[0].taskId).toBe('new-a')
  expect(page.findComponent(S.UnscheduledPanel).exists()).toBe(true)
})
it('draft public composition rejects edits then accepts and renders feedback with current selection', async () => {
  open(Draft)
  await click('表格编辑')
  await click('晨间共读')
  expect(page.findComponent(S.SchedulingDraftFeedback).text()).toContain('尚未核对活动时间')
  const board = page.findComponent(S.SchedulingDraftBoard)
  await page.get('select[aria-label="调整处理"]').setValue('reject')
  board.vm.$emit('update', 'activity-0', { startUtc: '2026-10-25T03:00:00Z' })
  await flushPromises()
  expect(board.props('model')!.tasks[0]!.startUtc).toBe('2026-10-25T02:00:00Z')
  await page.get('select[aria-label="调整处理"]').setValue('accept')
  board.vm.$emit('update', 'activity-0', { startUtc: '2026-10-25T03:00:00Z' })
  await flushPromises()
  expect(board.props('model')!.tasks[0]!.startUtc).toBe('2026-10-25T03:00:00Z')
  await click('换一份安排')
  expect(board.props('selectedTaskId')).toBe('')
  expect(board.props('model')!.tasks[0]!.startUtc).toBe('2026-10-25T05:00:00Z')
})
it.each(['false', 'failure', 'missing', 'success'])(
  'save receipt %s retains or saves only the current memory snapshot',
  async (mode) => {
    open(Draft)
    await page.get('select[aria-label="保存处理"]').setValue(mode)
    await click('保存草案')
    expect(page.get('[data-saved-arrangement]').text()).toContain(
      mode === 'success' ? '已保存的副本' : '尚未保存独立副本',
    )
    if (mode !== 'success') {
      await page.get('select[aria-label="保存处理"]').setValue('success')
      await click('保存草案')
      expect(page.get('[data-saved-arrangement]').text()).toContain('已保存的副本')
    }
  },
)
it('clear false retries true and cancel keeps the draft unchanged', async () => {
  open(Draft)
  await click('表格编辑')
  await click('晨间共读')
  await click('锁定')
  const board = page.findComponent(S.SchedulingDraftBoard)
  expect(board.props('dirty')).toBe(true)
  await page.get('select[aria-label="清空处理"]').setValue('retry')
  await click('清空草案')
  await click('取消')
  expect(board.props('dirty')).toBe(true)
  await click('清空草案')
  await click('确认清空')
  expect(document.body.textContent).toContain('未能清空')
  expect(board.props('dirty')).toBe(true)
  await click('确认清空')
  expect(board.props('dirty')).toBe(false)
})
it('delayed save and clear receipts cannot overwrite a replacement source', async () => {
  vi.useFakeTimers()
  open(Draft)
  await page.get('select[aria-label="保存处理"]').setValue('delay-failure')
  await click('保存草案')
  await click('换一份安排')
  await vi.advanceTimersByTimeAsync(900)
  await flushPromises()
  expect(page.get('[data-saved-arrangement]').text()).toContain('尚未保存独立副本')
  expect(page.findComponent(S.SchedulingDraftBoard).props('model')!.meta.planId).toBe('library-new')
  await page.get('select[aria-label="清空处理"]').setValue('delay-failure')
  await click('清空草案')
  await click('确认清空')
  await click('换一份安排')
  await vi.advanceTimersByTimeAsync(900)
  await flushPromises()
  expect(document.body.textContent).not.toContain('未能清空')
  expect(page.findComponent(S.SchedulingDraftBoard).props('model')!.meta.planId).toBe(
    'library-first',
  )
})
it('dimension null markers and pure resource unassignment remain separate in the draft host', async () => {
  open(Draft)
  const board = page.findComponent(S.SchedulingDraftBoard)
  const move = {
    taskId: 'activity-0',
    kind: 'reassign',
    resourceId: 'room-0',
    startUtc: '2026-10-25T02:00:00Z',
    endUtc: '2026-10-25T04:00:00Z',
  }
  board.vm.$emit('move', { ...move, assignment: { dimension: 'team', id: null, label: '未分配' } })
  await flushPromises()
  expect(board.props('model')!.tasks[0]).toMatchObject({
    resourceId: 'room-0',
    unassignedDimensions: ['team'],
  })
  expect(board.props('model')!.tasks[0]!.dimensions!.team).toBeUndefined()
  board.vm.$emit('move', {
    ...move,
    assignment: { dimension: 'team', id: 'room-1', label: '同名小组' },
  })
  await flushPromises()
  expect(board.props('model')!.tasks[0]).toMatchObject({
    resourceId: 'room-0',
    unassignedDimensions: [],
    dimensions: { team: { id: 'room-1' } },
  })
  board.vm.$emit('move', { ...move, resourceId: undefined })
  await flushPromises()
  expect(board.props('model')!.tasks[0]!.resourceId).toBeUndefined()
})
it('clear thrown failure preserves edits and safe retry can restore the baseline', async () => {
  open(Draft)
  await click('表格编辑')
  await click('晨间共读')
  await click('锁定')
  await page.get('select[aria-label="清空处理"]').setValue('throw')
  await click('清空草案')
  await click('确认清空')
  expect(page.findComponent(S.SchedulingDraftBoard).props('dirty')).toBe(true)
  expect(document.body.textContent).toContain('本次清空未完成，请重试')
  await click('取消')
  await page.get('select[aria-label="清空处理"]').setValue('success')
  await click('清空草案')
  await click('确认清空')
  expect(page.findComponent(S.SchedulingDraftBoard).props('dirty')).toBe(false)
})

it('existing resource Markdown accepts dimension assignments and unassigned markers without equating IDs', async () => {
  open(ResourcePage)
  const graph = page.findComponent(Graph)
  const task = graph
    .props('model')
    .tasks.find(
      (t: S.ScheduleTask) => t.type === 'operation' && !t.locked && !t.blockKind && !t.isMilestone,
    )
  const payload = {
    taskId: task.id,
    kind: 'reassign',
    resourceId: task.resourceId,
    startUtc: task.startUtc,
    endUtc: task.endUtc,
  }
  graph.vm.$emit('taskDragEnd', {
    ...payload,
    assignment: { dimension: 'team', id: '激光切割-01', label: '独立小组' },
  })
  await flushPromises()
  let current = graph.props('model').tasks.find((t: S.ScheduleTask) => t.id === task.id)
  expect(current.dimensions.team).toEqual({ id: '激光切割-01', label: '独立小组' })
  expect(current.resourceId).toBe(task.resourceId)
  expect(current.workCenterId).toBe(task.workCenterId)
  graph.vm.$emit('taskDragEnd', {
    ...payload,
    assignment: { dimension: 'workCenter', id: null, label: '未分配' },
  })
  await flushPromises()
  current = graph.props('model').tasks.find((t: S.ScheduleTask) => t.id === task.id)
  expect(current.unassignedDimensions).toContain('workCenter')
  expect(current.dimensions.workCenter).toBeUndefined()
  expect(current.resourceId).toBe(task.resourceId)
  graph.vm.$emit('taskDragEnd', { ...payload, resourceId: undefined })
  await flushPromises()
  expect(
    graph.props('model').tasks.find((t: S.ScheduleTask) => t.id === task.id).resourceId,
  ).toBeUndefined()
})
