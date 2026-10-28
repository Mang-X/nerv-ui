// @vitest-environment jsdom
import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { readFileSync } from 'node:fs'
import * as S from '@nerv-iip/scheduling'
import Facts from './docs/.vitepress/examples/SnapshotFactsExample.vue'
import Comparison from './docs/.vitepress/examples/ScheduleComparisonExample.vue'
const Graph = defineComponent({
  name: 'GraphBoundary',
  props: ['model'],
  emits: ['taskSelect'],
  setup() {
    return () => h('div')
  },
})
let page: ReturnType<typeof mount>
afterEach(() => {
  page?.unmount()
  vi.unstubAllGlobals()
})
function open(component: typeof Facts) {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  page = mount(component, { global: { stubs: { GanttChart: Graph } } })
}
async function click(label: string) {
  const b = page.findAll('button').find((b) => b.text() === label)
  expect(b, label).toBeDefined()
  await b!.trigger('click')
  await flushPromises()
}
it('snapshot live preserves zero unknown expands batch impacts and replaces current activity selection', async () => {
  open(Facts)
  for (const c of [S.MaterialShortageSummary, S.PlanRisks, S.PlanConflicts, S.ResourceLoads])
    expect(page.findComponent(c).exists()).toBe(true)
  expect(page.get('[data-shortage-id="pen"]').text()).toContain('0 支')
  expect(page.get('[data-shortage-id="unknown"]').text()).toContain('— 盒')
  const summary = page.get('[aria-label="物料缺口汇总"] details')
  await summary.get('summary').trigger('click')
  await summary.get('[data-shortage-id="paper"] summary').trigger('click')
  expect(summary.get('[data-shortage-id="paper"]').text()).toContain('晨间共读')
  await click('查看用料关联活动')
  expect(page.get('[aria-label="关联活动详情"]').text()).toContain('晨间共读')
  await click('替换全部记录')
  expect(page.get('[aria-label="关联活动详情"]').text()).toContain('尚未选择活动')
  await click('查看用料关联活动')
  expect(page.get('[aria-label="关联活动详情"]').text()).toContain('午间书谈')
  await click('仅查看记录')
  expect(page.findAll('[data-risk-id] button')).toHaveLength(0)
  await click('查看当前记录')
  expect(page.get('[data-shortage-id="paper"]').text()).toContain('0 张')
  await click('清空记录')
  expect(page.findAll('[data-shortage-id]')).toHaveLength(0)
  expect(page.text()).toContain('不代表当前准备就绪')
})
it('snapshot source options hide stale facts and keep severity and zero load distinct', async () => {
  open(Facts)
  expect(page.get('[data-conflict-severity="error"]').text()).toContain('调整空间')
  expect(page.get('[data-conflict-severity="warning"]').text()).toContain('这是一条预警')
  await click('零负荷')
  expect(page.get('[data-load-resource="quiet"]').text()).toContain('已排 0 / 可用 —')
  await click('负荷未知')
  expect(page.get('[data-load-resource="secondary"]').text()).toContain('已排 — / 可用 —')
  const select = page.get<HTMLSelectElement>('select[aria-label="数据读取状态"]')
  expect([...select.element.options].every((o) => o.textContent?.trim())).toBe(true)
  for (const state of ['unknown', 'missing', 'forbidden', 'unavailable']) {
    await select.setValue(state)
    expect(page.findAll('[data-data-state]')).toHaveLength(4)
    expect(
      page.findAll('[data-shortage-id], [data-risk-id], [data-conflict-id], [data-load-resource]'),
    ).toHaveLength(0)
  }
})
it('comparison pairs semantic keys across assignment IDs and isolates baseline during replacement', async () => {
  open(Comparison)
  const before = page.get('[data-semantic-key="morning"] td:nth-child(3)').text()
  expect(page.get('[data-semantic-key="morning"]').text()).toContain('已调整')
  expect(page.get('[data-semantic-key="noon"]').text()).toContain('待安排')
  expect(page.get('[data-semantic-key="evening"]').text()).toContain('新增')
  expect(page.get('[aria-label="来源指标"]').text()).toContain('— → 0')
  await click('载入另一份候选安排')
  expect(page.get('[data-semantic-key="morning"] td:nth-child(3)').text()).toBe(before)
  expect(
    page.get('[data-semantic-key="morning"] td:nth-child(4) time').attributes('datetime'),
  ).toBe('2026-11-02T06:00:00Z')
  expect(
    page.findComponent(S.SchedulingPreviewResult).findComponent(Graph).props('model').tasks[0]
      .startUtc,
  ).toBe('2026-11-02T06:00:00Z')
  await click('清空候选')
  expect(page.findComponent(S.ChangeSummaryPanel).text()).toContain('候选未提供，原因未说明')
  expect(page.findComponent(S.ChangeSummaryPanel).text()).not.toContain('历史说明仅属基线')
})
it('standalone preview maps current selection and readonly while empty missing metrics and public errors remain visible', async () => {
  open(Comparison)
  const preview = page.findComponent(S.SchedulingPreviewResult)
  preview.findComponent(Graph).vm.$emit('taskSelect', 'candidate-assignment-a')
  await flushPromises()
  expect(page.get('[aria-label="选中活动"]').text()).toContain('晨间共读')
  await click('只读查看')
  expect(preview.props('readOnly')).toBe(true)
  await click('载入另一份候选安排')
  expect(page.get('[aria-label="选中活动"]').text()).toContain('尚未选择活动')
  preview.findComponent(Graph).vm.$emit('taskSelect', 'candidate-assignment-a')
  await flushPromises()
  expect(page.get('[aria-label="选中活动"]').text()).toContain('尚未选择活动')
  await click('清空指标')
  expect(preview.text()).toContain('此来源无指标记录')
  await click('不提供指标')
  expect(preview.text()).toContain('指标未提供')
  await click('查看身份校验提示')
  expect(preview.get('[role="alert"]').text()).toContain('活动身份缺失或重复')
  expect(preview.findComponent(Graph).exists()).toBe(false)
  await click('恢复两侧记录')
  expect(preview.find('[role="alert"]').exists()).toBe(false)
})
it('site connects both live examples without importing playground runtime or removing existing pages', () => {
  const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8')
  const path = '/components/desktop/scheduling-facts'
  expect(read('./docs/.vitepress/config.mts')).toContain(path)
  const live = read('./docs/components/desktop/scheduling-facts.md')
  expect(live).toContain('<SnapshotFactsExample />')
  expect(live).toContain('<ScheduleComparisonExample />')
  expect(read('./docs/components/desktop/scheduling-live.md')).toContain('./scheduling-facts')
  for (const name of [
    'SnapshotFactsExample.vue',
    'ScheduleComparisonExample.vue',
    'snapshotFacts.ts',
    'comparisonFacts.ts',
  ])
    expect(read(`./docs/.vitepress/examples/${name}`)).not.toMatch(/from ['"].*playground/)
})
