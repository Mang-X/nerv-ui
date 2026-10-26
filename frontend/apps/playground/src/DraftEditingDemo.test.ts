import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { GanttChart, ResourceSchedulerBoard, SchedulingDraftBoard } from '@nerv-iip/scheduling'
import DraftEditingDemo from './DraftEditingDemo.vue'
let w: ReturnType<typeof mount> | undefined
afterEach(() => {
  w?.unmount()
  localStorage.clear()
  vi.unstubAllGlobals()
})
async function click(text: string) {
  await w!
    .findAll('button')
    .find((b) => b.text() === text)!
    .trigger('click')
  await flushPromises()
}
function open(venue: 'library' | 'studio' = 'library') {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  w = mount(DraftEditingDemo, { props: { venue }, attachTo: document.body })
  return w
}
it.each(['library', 'studio'] as const)(
  'neutral %s host maps accepted space assignment to the current room across table detail graphs saved copy and undo',
  async (venue) => {
    const page = open(venue)
    const name = venue === 'library' ? '晨间共读' : '晨间创作'
    const place = venue === 'library' ? '林间书屋' : '陶艺工坊'
    const authority = () => page.findComponent(SchedulingDraftBoard).props('model')!
    const task = () => authority().tasks.find((t) => t.id === 'activity-0')!
    await click('资源安排图')
    page.findComponent(ResourceSchedulerBoard).vm.$emit('taskDragEnd', {
      taskId: 'activity-0',
      kind: 'reassign',
      resourceId: 'room-0',
      startUtc: '2026-10-25T03:00:00Z',
      endUtc: '2026-10-25T05:00:00Z',
      assignment: { dimension: 'workCenter', id: 'place-1', label: place },
    })
    await flushPromises()
    expect(task().resourceId).toBe('room-1')
    expect(task().workCenterId).toBe('place-1')
    expect(task().dimensions!.workCenter).toEqual({ id: 'place-1', label: place })
    expect(task().dimensions!.team!.id).toBe('team-0')
    expect(task().startUtc).toBe('2026-10-25T03:00:00Z')
    expect(task().endUtc).toBe('2026-10-25T05:00:00Z')
    expect(task().facts).toEqual([{ label: '位置', value: place }])
    expect(page.findComponent(ResourceSchedulerBoard).props('model')!.tasks[0]!.resourceId).toBe(
      'room-1',
    )
    await click('表格编辑')
    await click(name)
    const resource = () =>
      page.get(`select[aria-label="${name} 的资源"]`).element as HTMLSelectElement
    expect(resource().value).toBe('room-1')
    expect(resource().selectedOptions[0]!.textContent).toBe(place)
    expect(page.get('[data-draft-detail]').text()).toContain(place)
    expect(page.get('[data-draft-records]').text()).toContain(
      `${place} · 2026-10-25 11:00:00 至 2026-10-25 13:00:00`,
    )
    await click('活动时间图')
    expect(page.findComponent(GanttChart).props('model')!.tasks[0]!.resourceId).toBe('room-1')
    await click('保存草案')
    expect(page.get('[data-saved-arrangement]').text()).toContain(place)
    await click('撤销')
    expect(task().resourceId).toBe('room-0')
    expect(task().workCenterId).toBe('place-0')
    expect(page.get('[data-saved-arrangement]').text()).toContain(place)
    await click('重做')
    expect(task().resourceId).toBe('room-1')
    await page.get('select[aria-label="调整处理"]').setValue('reject')
    await click('资源安排图')
    page.findComponent(ResourceSchedulerBoard).vm.$emit('taskDragEnd', {
      taskId: 'activity-0',
      kind: 'reassign',
      resourceId: 'room-1',
      startUtc: '2026-10-25T04:00:00Z',
      endUtc: '2026-10-25T06:00:00Z',
      assignment: { dimension: 'workCenter', id: 'place-2', label: '另一空间' },
    })
    await flushPromises()
    expect(task().resourceId).toBe('room-1')
    expect(task().workCenterId).toBe('place-1')
    expect(task().startUtc).toBe('2026-10-25T03:00:00Z')
    expect(page.get('[data-draft-detail]').text()).toContain(place)
    expect(page.get('[data-draft-records]').text()).toContain('保留原安排')
    await click('表格编辑')
    expect(resource().value).toBe('room-1')
  },
)
it.each(['library', 'studio'] as const)(
  'neutral %s host keeps non-space assignments independent and maps space clear table resource and replacement in both directions',
  async (venue) => {
    const page = open(venue)
    const name = venue === 'library' ? '晨间共读' : '晨间创作'
    const room2 = venue === 'library' ? '河畔阅览室' : '留白空间'
    const task = () => page.findComponent(SchedulingDraftBoard).props('model')!.tasks[0]!
    await click('表格编辑')
    await click(name)
    const resource = () => page.get('[data-draft-task="activity-0"] select')
    await resource().setValue('room-2')
    expect(task().resourceId).toBe('room-2')
    expect(task().workCenterId).toBe('place-2')
    expect(task().dimensions!.workCenter).toEqual({ id: 'place-2', label: room2 })
    expect(page.get('[data-draft-detail]').text()).toContain(room2)
    await click('资源安排图')
    const assign = async (dimension: string, id: string | null, label: string) => {
      page.findComponent(ResourceSchedulerBoard).vm.$emit('taskDragEnd', {
        taskId: 'activity-0',
        kind: 'reassign',
        resourceId: task().resourceId,
        startUtc: task().startUtc,
        endUtc: task().endUtc,
        assignment: { dimension, id, label },
      })
      await flushPromises()
    }
    await assign('team', 'team-1', '分享小组')
    expect(task().dimensions!.team).toEqual({ id: 'team-1', label: '分享小组' })
    expect(task().resourceId).toBe('room-2')
    expect(task().workCenterId).toBe('place-2')
    expect(task().display!.resourceLabel).toBe(room2)
    await assign('team', null, '未分配')
    expect(task().dimensions!.team).toBeUndefined()
    expect(task().resourceId).toBe('room-2')
    expect(task().dimensions!.workCenter!.id).toBe('place-2')
    await assign('other', 'room-0', '独立维度')
    expect(task().dimensions!.other!.id).toBe('room-0')
    expect(task().resourceId).toBe('room-2')
    await assign('other', null, '未分配')
    expect(task().dimensions!.other).toBeUndefined()
    expect(task().resourceId).toBe('room-2')
    await assign('workCenter', null, '未分配')
    expect(task().resourceId).toBeUndefined()
    expect(task().workCenterId).toBeUndefined()
    expect(task().dimensions!.workCenter).toBeUndefined()
    expect(task().display!.resourceLabel).toBe('未分配')
    expect(task().facts).toEqual([{ label: '位置', value: '未分配' }])
    await click('表格编辑')
    expect((resource().element as HTMLSelectElement).value).toBe('')
    expect(page.get('[data-draft-detail]').text()).toContain('未分配')
    await click('撤销')
    expect((resource().element as HTMLSelectElement).value).toBe('room-2')
    await resource().setValue('')
    expect(task().resourceId).toBeUndefined()
    expect(task().workCenterId).toBeUndefined()
    expect(task().dimensions!.workCenter).toBeUndefined()
    await click('换一份安排')
    expect(task().text).toContain('新安排')
    expect(task().resourceId).toBe('room-0')
    expect(task().dimensions!.team!.id).toBe('team-0')
    expect(page.get('[data-saved-arrangement]').text()).toContain('尚未保存')
    await click('资源安排图')
    await assign('workCenter', 'place-2', room2)
    expect(task().resourceId).toBe('room-2')
    expect(task().workCenterId).toBe('place-2')
    expect(task().startUtc).toBe('2026-10-25T05:00:00Z')
    await click('活动时间图')
    expect(page.findComponent(GanttChart).props('model')!.tasks[0]!.resourceId).toBe('room-2')
    await click('表格编辑')
    expect((resource().element as HTMLSelectElement).value).toBe('room-2')
    await click('撤销')
    expect((resource().element as HTMLSelectElement).value).toBe('room-0')
  },
)
it('neutral draft host accepts and rejects table edits then visibly undoes and redoes without saving', async () => {
  const page = open()
  await click('表格编辑')
  const input = page.get('input[aria-label="晨间共读 的开始时间"]')
  await input.setValue('2026-10-25T11:00')
  await flushPromises()
  expect(page.get('[data-current-arrangement]').text()).toContain('11:00')
  expect(page.get('[data-saved-arrangement]').text()).toContain('尚未保存')
  await click('撤销')
  expect(page.get('[data-current-arrangement]').text()).toContain('10:00')
  await click('重做')
  expect(page.get('[data-current-arrangement]').text()).toContain('11:00')
  await page.get('select[aria-label="调整处理"]').setValue('reject')
  await input.setValue('2026-10-25T12:00')
  await flushPromises()
  expect((input.element as HTMLInputElement).value).toBe('2026-10-25T11:00')
  expect(page.get('[data-current-arrangement]').text()).toContain('11:00')
})

it.each(['library', 'studio'] as const)(
  'neutral %s draft shares resource lock pending restore and undo across table detail and both public boards',
  async (venue) => {
    const page = open(venue),
      name = venue === 'library' ? '晨间共读' : '晨间创作'
    await click('表格编辑')
    await click(name)
    const row = () => page.get('[data-draft-task="activity-0"]')
    await row().get('select').setValue('room-2')
    await flushPromises()
    expect(page.get('[data-current-arrangement]').text()).toContain(
      venue === 'library' ? '河畔阅览室' : '留白空间',
    )
    await row()
      .findAll('button')
      .find((b) => b.text() === '锁定')!
      .trigger('click')
    await flushPromises()
    expect(row().get('input').attributes('disabled')).toBeDefined()
    expect(page.get('[data-draft-detail]').text()).toContain('已锁定')
    await click('解锁活动')
    expect(row().get('input').attributes('disabled')).toBeUndefined()
    await row()
      .findAll('button')
      .find((b) => b.text() === '移回待排')!
      .trigger('click')
    await flushPromises()
    expect(page.find('[data-draft-task="activity-0"]').exists()).toBe(false)
    expect(page.get('[data-testid="operation-pending-pool"]').text()).toContain(name)
    expect(page.get('[data-draft-detail]').text()).toContain('尚未选择活动')
    await click('恢复')
    expect(row().text()).toContain(name)
    await click('撤销')
    expect(page.find('[data-draft-task="activity-0"]').exists()).toBe(false)
    await click('重做')
    expect(row().text()).toContain(name)
    await click('活动时间图')
    await flushPromises()
    expect(
      page
        .findComponent(GanttChart)
        .props('model')!
        .tasks.find((t) => t.id === 'activity-0')!.display!.resourceLabel,
    ).toBe(venue === 'library' ? '河畔阅览室' : '留白空间')
    await click('资源安排图')
    await flushPromises()
    expect(
      page
        .findComponent(ResourceSchedulerBoard)
        .props('model')!
        .tasks.find((t) => t.id === 'activity-0')!.display!.resourceLabel,
    ).toBe(venue === 'library' ? '河畔阅览室' : '留白空间')
    await click('换一份安排')
    expect(page.get('[data-current-arrangement]').text()).toContain('新安排')
    expect(
      page
        .findAll('button')
        .find((b) => b.text() === '撤销')!
        .attributes('disabled'),
    ).toBeDefined()
    expect(page.get('[data-draft-detail]').text()).toContain('尚未选择活动')
    expect(page.text()).not.toMatch(/operationId|taskId|rawJSON|host接线|验收缓存/)
  },
)
it('neutral save stores a separate copy while local undo and external plan replacement retain their own meaning', async () => {
  const page = open()
  await click('表格编辑')
  await page.get('input[aria-label="晨间共读 的开始时间"]').setValue('2026-10-25T11:00')
  await flushPromises()
  await click('保存草案')
  expect(page.get('[data-saved-arrangement]').text()).toContain('11:00')
  await click('撤销')
  expect(page.get('[data-current-arrangement]').text()).toContain('10:00')
  expect(page.get('[data-saved-arrangement]').text()).toContain('11:00')
  await click('换一份安排')
  expect(page.get('[data-saved-arrangement]').text()).toContain('尚未保存')
})

it('neutral host applies public drag assignment and null membership without changing resource identity then rejects a later proposal', async () => {
  const page = open()
  page.findComponent(GanttChart).vm.$emit('taskDragEnd', {
    taskId: 'activity-0',
    kind: 'move',
    startUtc: '2026-10-25T03:00:00Z',
    endUtc: '2026-10-25T05:00:00Z',
  })
  await flushPromises()
  await click('资源安排图')
  const board = page.findComponent(ResourceSchedulerBoard)
  board.vm.$emit('taskDragEnd', {
    taskId: 'activity-0',
    kind: 'reassign',
    startUtc: '2026-10-25T03:00:00Z',
    endUtc: '2026-10-25T05:00:00Z',
    assignment: { dimension: 'team', id: 'team-1', label: '分享小组' },
  })
  await flushPromises()
  let t = board.props('model')!.tasks.find((t) => t.id === 'activity-0')!
  expect(t.resourceId).toBe('room-0')
  expect(t.dimensions!.team!.label).toBe('分享小组')
  board.vm.$emit('taskDragEnd', {
    taskId: 'activity-0',
    kind: 'reassign',
    startUtc: '2026-10-25T03:00:00Z',
    endUtc: '2026-10-25T05:00:00Z',
    assignment: { dimension: 'team', id: null, label: '未分配' },
  })
  await flushPromises()
  t = board.props('model')!.tasks.find((t) => t.id === 'activity-0')!
  expect(t.dimensions!.team).toBeUndefined()
  expect(t.resourceId).toBe('room-0')
  await page.get('select[aria-label="调整处理"]').setValue('reject')
  board.vm.$emit('taskDragEnd', {
    taskId: 'activity-0',
    kind: 'move',
    startUtc: '2026-10-25T06:00:00Z',
    endUtc: '2026-10-25T08:00:00Z',
  })
  await flushPromises()
  await click('表格编辑')
  expect(
    (page.get('input[aria-label="晨间共读 的开始时间"]').element as HTMLInputElement).value,
  ).toBe('2026-10-25T11:00')
  expect(page.get('[data-draft-records]').text()).toContain('保留原安排')
})

it('neutral clear failure keeps the same dialog open and a successful retry resets local draft only', async () => {
  const page = open('studio')
  await click('表格编辑')
  await page.get('input[aria-label="晨间创作 的开始时间"]').setValue('2026-10-25T11:00')
  await page.get('select[aria-label="清空处理"]').setValue('retry')
  await click('清空草案')
  const confirm = () =>
    document.body.querySelector<HTMLButtonElement>('[data-clear-confirm]')!.click()
  confirm()
  await flushPromises()
  expect(document.body.querySelector('[role="alertdialog"]')?.textContent).toContain('未能清空')
  expect(page.get('[data-current-arrangement]').text()).toContain('11:00')
  confirm()
  await flushPromises()
  expect(document.body.querySelector('[role="alertdialog"]')).toBeNull()
  expect(page.get('[data-current-arrangement]').text()).toContain('10:00')
  expect(page.get('[data-saved-arrangement]').text()).toContain('尚未保存')
})
