// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import * as S from '@nerv-iip/scheduling'
import Workbench from './docs/.vitepress/examples/WorkbenchExample.vue'
import Saved from './docs/.vitepress/examples/SavedPlanExample.vue'
import Day from './docs/.vitepress/examples/DayPrintExample.vue'
const Graph = defineComponent({
  name: 'GraphBoundary',
  props: ['model', 'readOnly'],
  setup: (_, { expose }) => {
    expose({ command: vi.fn() })
    return () => h('div')
  },
})
let page: VueWrapper
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
})
afterEach(() => {
  page?.unmount()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
function open(component: Parameters<typeof mount>[0]) {
  page = mount(component, {
    props: { venue: 'library' },
    attachTo: document.body,
    global: { stubs: { GanttChart: Graph, ResourceSchedulerBoard: Graph } },
  })
}
async function click(text: string) {
  const button = page.findAll('button').find((b) => b.text() === text)
  expect(button, text).toBeDefined()
  await button!.trigger(button!.attributes('role') === 'tab' ? 'mousedown' : 'click', { button: 0 })
  await flushPromises()
}
it('workbench preserves three views and current details, preview accept reject and replacement ownership', async () => {
  open(Workbench)
  const graph = page.getComponent(Graph)
  async function edit() {
    const t = graph.props('model').tasks[0]
    graph.vm.$emit('taskDragEnd', {
      taskId: t.id,
      kind: 'move',
      resourceId: t.resourceId,
      startUtc: '2026-11-02T02:00:00Z',
      endUtc: '2026-11-02T05:00:00Z',
    })
    await flushPromises()
  }
  graph.vm.$emit('taskSelect', 'activity-a')
  await flushPromises()
  expect(page.getComponent(S.TaskDetailPanel).props('task')?.id).toBe('activity-a')
  await edit()
  await click('重新排程')
  await click('接收本轮预览')
  expect(page.getComponent(Graph).props('model').tasks[0].text).toContain('本页预览')
  await edit()
  await click('重新排程')
  await click('保留当前安排')
  expect(page.getComponent(Graph).props('model').tasks[0].text).toContain('本页预览')
  await edit()
  await click('重新排程')
  await click('查看最新安排')
  await click('接收本轮预览')
  expect(page.getComponent(Graph).props('model').tasks[0].id).toBe('new-a')
  expect(page.getComponent(S.TaskDetailPanel).props('task')).toBeUndefined()
  await click('资源安排板')
  expect(page.findComponent(S.ResourceSchedulerBoard).exists()).toBe(true)
  await click('活动表格')
  expect(page.findComponent(S.SchedulingDraftBoard).exists()).toBe(true)
  await click('仅可查阅')
  expect(page.getComponent(S.SchedulingWorkbench).props('readOnly')).toBe(true)
})
it('history filters selection and download belong to current revision and release Blob URLs', async () => {
  open(Workbench)
  await click('历史安排')
  await page.get('[aria-label="搜索安排"]').setValue('共读安排 2')
  expect(page.text()).not.toContain('明细 · 共读安排 1')
  await click('明细 · 共读安排 2')
  const create = vi.fn(() => 'blob:local'),
    revoke = vi.fn()
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }))
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  await click('下载安排')
  await click('刷新历史记录')
  await click('接收本轮下载')
  expect(create).not.toHaveBeenCalled()
  expect(page.find('[aria-label="历史明细"]').exists()).toBe(false)
  await click('明细 · 共读安排 2')
  await click('下载安排')
  await click('接收本轮下载')
  expect(create).toHaveBeenCalledTimes(1)
  expect(revoke).toHaveBeenCalledWith('blob:local')
})
it('saved plan uses current facts and selection, pending navigation rejects duplicates and retries locally', async () => {
  open(Saved)
  expect(page.findComponent(S.SavedPlanOrders).exists()).toBe(true)
  await page.get('[data-task-id="shared-id"] button').trigger('click')
  await flushPromises()
  expect(page.get('[data-testid="saved-plan-detail"]').text()).toContain('共读第一章')
  await click('更新活动事实')
  expect(page.get('[data-testid="saved-plan-detail"]').text()).toContain('已更新')
  const link = page.get('[data-action="task-link"]')
  await link.trigger('click')
  expect(link.attributes('disabled')).toBeDefined()
  await click('本次打开失败')
  expect(page.text()).toContain('暂时无法打开')
  await link.trigger('click')
  await click('接收本次打开')
  expect(page.get('[data-local-destination]').text()).toContain('仅本页')
  await link.trigger('click')
  await click('午后交流')
  await click('接收本次打开')
  expect(page.find('[data-local-destination]').exists()).toBe(false)
  expect(page.find('[data-testid="saved-plan-detail"]').exists()).toBe(false)
  expect(window.location.hash).toBe('')
})
it('day separates unresolved and empty, clips half-open days and prints only the current target with cleanup', async () => {
  open(Day)
  const print = vi.spyOn(window, 'print').mockImplementation(() => {})
  expect(page.get('[data-day-sheet]').text()).toContain('夜读')
  expect(page.get('[data-day-sheet]').text()).not.toContain('闭馆整理')
  expect(page.get('[data-day-sheet]').text()).toContain('0 人')
  await page.get('.nv-day-actions select').setValue('room')
  expect(page.get('[data-day-sheet]').text()).not.toContain('夜读')
  await page.get('.nv-day-actions select').setValue('all')
  await click('打印日安排')
  expect(print).toHaveBeenCalledTimes(1)
  expect(document.querySelector('.nv-day-print-target')?.textContent).toContain('夜读')
  await click('接收调整后的安排')
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
  expect(document.querySelector('.nv-day-print-target')).toBeNull()
  await page.get('[aria-label="安排时区"]').setValue('invalid')
  expect(page.text()).toContain('日期或时区未解析')
  expect(page.find('[data-day-sheet]').exists()).toBe(false)
  await page.get('[aria-label="安排时区"]').setValue('Asia/Shanghai')
  await click('日期待核实')
  expect(page.text()).toContain('日期或时区未解析')
  expect(page.find('[data-day-sheet]').exists()).toBe(false)
  await click('查看无安排日期')
  expect(page.text()).toContain('该日与所选分组没有安排')
  await click('返回有安排日期')
  await click('打印日安排')
  window.dispatchEvent(new Event('afterprint'))
  await flushPromises()
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
})

it('workbench accepts dimension null independently from resource and derives selected details from edited model', async () => {
  open(Workbench)
  const graph = page.getComponent(Graph)
  const t = graph.props('model').tasks[0]
  graph.vm.$emit('taskSelect', t.id)
  await flushPromises()
  const move = {
    taskId: t.id,
    kind: 'reassign',
    resourceId: t.resourceId,
    startUtc: t.startUtc,
    endUtc: t.endUtc,
  }
  graph.vm.$emit('taskDragEnd', {
    ...move,
    assignment: { dimension: 'team', id: null, label: '未分配' },
  })
  await flushPromises()
  expect(graph.props('model').tasks[0].unassignedDimensions).toContain('team')
  expect(graph.props('model').tasks[0].resourceId).toBe(t.resourceId)
  expect(page.getComponent(S.TaskDetailPanel).props('task')?.unassignedDimensions).toContain('team')
  graph.vm.$emit('taskDragEnd', {
    ...move,
    assignment: { dimension: 'team', id: t.resourceId, label: '独立小组' },
  })
  await flushPromises()
  expect(graph.props('model').tasks[0].dimensions.team.label).toBe('独立小组')
  expect(graph.props('model').tasks[0].unassignedDimensions).not.toContain('team')
})
it('saved facts preserve zero and unknown and a second day owner cannot steal a pending print', async () => {
  open(Saved)
  expect(page.text()).toContain('确认人数0')
  expect(page.text()).toContain('待核实人数—')
  page.unmount()
  open(Day)
  vi.spyOn(window, 'print').mockImplementation(() => {})
  await click('打印日安排')
  const owner = document.body.getAttribute('data-nv-day-print-owner')
  const second = mount(Day, { props: { venue: 'studio' }, attachTo: document.body })
  try {
    await second.get('[data-action="print-day"]').trigger('click')
    await flushPromises()
    expect(document.body.getAttribute('data-nv-day-print-owner')).toBe(owner)
    second.unmount()
    expect(document.body.getAttribute('data-nv-day-print-owner')).toBe(owner)
  } finally {
    second.unmount()
  }
  page.unmount()
  await flushPromises()
  expect(document.body.hasAttribute('data-nv-day-print-owner')).toBe(false)
  expect(document.querySelector('.nv-day-print-target')).toBeNull()
})

it('seven responsibilities share three live pages with sidebar and local cross links without playground imports', () => {
  const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')
  const config = read('./docs/.vitepress/config.mts')
  for (const [slug, host] of [
    ['workbench', 'WorkbenchExample'],
    ['saved-plan', 'SavedPlanExample'],
    ['day-print', 'DayPrintExample'],
  ]) {
    const page = read(`./docs/components/desktop/scheduling-${slug}.md`)
    expect(config).toContain(`/components/desktop/scheduling-${slug}`)
    expect(page).toContain(`<${host} venue="library" />`)
    const source = read(`./docs/.vitepress/examples/${host}.vue`)
    expect(source).not.toMatch(/from ['"].*playground/)
    for (const target of ['workbench', 'saved-plan', 'day-print'])
      expect(page).toContain(`./scheduling-${target}`)
  }
  expect(read('./docs/components/desktop/scheduling-workbench.md')).toContain(
    '<SchedulingHistory :input="input"',
  )
})
