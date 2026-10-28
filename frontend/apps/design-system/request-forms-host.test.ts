// @vitest-environment jsdom
import { beforeEach, afterEach, vi } from 'vitest'
import { config } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  config.global.stubs.GanttChart = defineComponent({
    name: 'GraphBoundary',
    setup: () => () => h('div'),
  })
})
afterEach(() => {
  vi.unstubAllGlobals()
  delete config.global.stubs.GanttChart
})
import { flushPromises, mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import RequestFormsDemo from './docs/.vitepress/examples/RequestFormsExample.vue'

it('two neutral request routes expose four entry paths and memory-only notice', async () => {
  for (const venue of ['library', 'studio'] as const) {
    const page = mount(RequestFormsDemo, { props: { venue } })
    expect(page.text()).toContain('未连接实际排程计算或后端保存')
    expect(page.findAll('[data-entry]')).toHaveLength(4)
    expect(page.get('select[aria-label="活动来源"]').text()).toContain('工作坊')
    await page.get('[data-entry="related"]').trigger('click')
    expect(page.get('[role="dialog"]').text()).toContain('选择项目')
    await page.get('[aria-label="关闭安排窗口"]').trigger('click')
    page.unmount()
  }
})

it('neutral host offers failure retry, pending cancellation, and insert with explicit plan', async () => {
  const page = mount(RequestFormsDemo, { props: { venue: 'library' } })
  await page.get('[data-response="reject"]').trigger('click')
  await page.get('[data-entry="list"]').trigger('click')
  await page.get('[aria-label="本次优先级"]').setValue('0')
  await page.get('[data-action="submit-request"]').trigger('click')
  await flushPromises()
  expect(page.get('[role="dialog"]').text()).toContain('请求未确认')
  await page.get('[data-response="accept"]').trigger('click')
  await page.get('[data-action="insert"]').trigger('click')
  await page.get('[data-plan="existing-a"]').trigger('click')
  const inside = page.get('[aria-label="本次来源响应"]')
  await inside
    .findAll('button')
    .find((b) => b.text() === '等待本次确认')!
    .trigger('click')
  await page.get('[data-action="submit-request"]').trigger('click')
  expect(page.get('[data-action="submit-request"]').attributes('disabled')).toBeDefined()
  await inside
    .findAll('button')
    .find((b) => b.text() === '接收等待中的确认')!
    .trigger('click')
  await flushPromises()
  expect(page.get('[role="dialog"]').text()).toContain('加入安排 · 晨间共读')
  await page.get('[aria-label="关闭安排窗口"]').trigger('click')
  await page.get('[data-response="hold"]').trigger('click')
  await page.get('[data-entry="detail"]').trigger('click')
  await page.get('[data-action="submit-request"]').trigger('click')
  expect(page.get('[data-action="submit-request"]').attributes('disabled')).toBeDefined()
  await page.get('[aria-label="关闭安排窗口"]').trigger('click')
  await page.get('[data-entry="suggestion"]').trigger('click')
  await page.get('[data-action="confirm-pending"]').trigger('click')
  await flushPromises()
  expect(page.get('[role="dialog"]').text()).not.toContain('午后交流')
  expect(page.get('[role="dialog"]').text()).toContain('夜间工作坊')
  page.unmount()
})

it('neutral host shows a valid custom window without developer handoff or verified timezone claims', async () => {
  const page = mount(RequestFormsDemo, { props: { venue: 'library' } })
  await page.get('[data-entry="list"]').trigger('click')
  await page.get('[aria-label="本次优先级"]').setValue('0')
  await page.get('[data-action="custom"]').trigger('click')
  await page.get('#single-request-start').setValue('2026-11-01T09:30')
  await page.get('#single-request-end').setValue('2026-11-02T10:30')
  const dialog = page.get('[role="dialog"]')
  expect(dialog.text()).toContain('本页已核对日历跨度')
  expect(dialog.text()).toContain('请再确认场地时区及夏令时对所选时间的影响')
  expect(dialog.text()).not.toContain('接入方')
  expect(dialog.text()).not.toContain('已核对时区')
  page.unmount()
})

it('docs pool distinguishes six source states and bulk selection uses only current visible keys', async () => {
  const page = mount(RequestFormsDemo)
  const click = async (label: string) => {
    await page
      .findAll('button')
      .find((b) => b.text() === label)!
      .trigger('click')
  }
  for (const [state, text] of [
    ['unready', '尚未读取项目'],
    ['loading', '正在读取候选项目'],
    ['error', '读取失败'],
  ] as const) {
    await page.get(`[data-state="${state}"]`).trigger('click')
    expect(page.text()).toContain(text)
  }
  await click('重试')
  expect(page.text()).toContain('正在读取候选项目')
  await page.get('[data-state="ready"]').trigger('click')
  expect(page.text()).toContain('晨间共读')
  await page.get('[aria-label="搜索候选项目"]').setValue('午后')
  await page.get('[data-action="include-visible"]').trigger('click')
  expect(page.text()).toContain('已选编号：session-b')
  await page.get('[aria-label="搜索候选项目"]').setValue('不存在')
  expect(page.text()).toContain('没有匹配')
  await click('显示空结果')
  expect(page.text()).toContain('暂无可选项目')
  await click('恢复项目')
  await click('只读查看')
  expect(page.get('[data-action="include-visible"]').attributes('disabled')).toBeDefined()
  expect(page.text()).toContain('当前为只读')
  page.unmount()
})
it('docs priority keeps null and zero distinct and failed row confirmation can retry', async () => {
  const page = mount(RequestFormsDemo)
  expect(page.get<HTMLInputElement>('[aria-label="优先级 session-a"]').element.value).toBe('')
  expect(page.get<HTMLInputElement>('[aria-label="优先级 session-b"]').element.value).toBe('0')
  await page.get('[data-response="throw"]').trigger('click')
  await page.get('[aria-label="优先级 session-a"]').setValue('0')
  await page.get('[data-save="session-a"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('保存失败，草稿仍可重试')
  await page.get('[data-response="accept"]').trigger('click')
  await page.get('[data-save="session-a"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('已确认；新值以来源更新为准')
  await new Promise((resolve) => setTimeout(resolve, 10))
  expect(page.get<HTMLInputElement>('[aria-label="优先级 session-a"]').element.value).toBe('0')
  page.unmount()
})
it('docs single request validates raw window and requires complete receipt before success', async () => {
  const page = mount(RequestFormsDemo)
  await page.get('[data-entry="list"]').trigger('click')
  await page.get('[aria-label="本次优先级"]').setValue('0')
  await page.get('[data-action="custom"]').trigger('click')
  await page.get('#single-request-start').setValue('2026-11-01T09:30')
  await page.get('#single-request-end').setValue('2026-10-31T10:30')
  expect(page.get('[data-action="submit-request"]').attributes('disabled')).toBeDefined()
  await page.get('#single-request-end').setValue('2026-11-02T10:30')
  const S = await import('@nerv-iip/scheduling')
  const dialog = page.findComponent(S.SchedulingSingleOrderDialog)
  await page.get('[data-response="incomplete"]').trigger('click')
  await page.get('[data-action="submit-request"]').trigger('click')
  await flushPromises()
  expect(dialog.text()).toContain('请求未确认')
  expect(dialog.text()).not.toContain('确认结果：')
  await page.get('[data-response="accept"]').trigger('click')
  await page.get('[data-action="submit-request"]').trigger('click')
  await flushPromises()
  expect(dialog.text()).toContain('新安排 · 晨间共读')
  expect(dialog.emitted('scheduled')?.[0]?.[1]).toMatchObject({
    priority: 0,
    horizon: { startLocal: '2026-11-01T09:30', endLocal: '2026-11-02T10:30' },
  })
  expect(page.findComponent(S.SchedulingHorizonFields).exists()).toBe(true)
  page.unmount()
})
it('docs source and readonly transitions reject old single and row receipts', async () => {
  const page = mount(RequestFormsDemo)
  await page.get('[data-response="hold"]').trigger('click')
  await page.get('[data-entry="detail"]').trigger('click')
  await page.get('[data-action="submit-request"]').trigger('click')
  await page.get('select[aria-label="活动来源"]').setValue('studio')
  await page.get('[data-action="confirm-pending"]').trigger('click')
  await flushPromises()
  expect(page.find('[role="dialog"]').exists()).toBe(false)
  expect(page.text()).toContain('陶艺入门')
  await page.get('[aria-label="优先级 session-a"]').setValue('0')
  await page.get('[data-save="session-a"]').trigger('click')
  await page
    .findAll('button')
    .find((b) => b.text() === '只读查看')!
    .trigger('click')
  await page
    .findAll('button')
    .find((b) => b.text() === '允许操作')!
    .trigger('click')
  await page.get('[data-action="confirm-pending"]').trigger('click')
  await flushPromises()
  expect(page.text()).not.toContain('更改已在本页内存中确认')
  expect(page.get<HTMLInputElement>('[aria-label="优先级 session-a"]').element.value).toBe('0')
  page.unmount()
})

it('docs linked page shares internal picker and horizon without playground imports', async () => {
  const { readFileSync } = await import('node:fs')
  const read = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8')
  expect(read('./docs/.vitepress/config.mts')).toContain('/components/desktop/scheduling-requests')
  expect(read('./docs/components/desktop/scheduling-live.md')).toContain('./scheduling-requests')
  const live = read('./docs/components/desktop/scheduling-requests.md')
  expect(live).toContain('<RequestFormsExample />')
  expect(live).toContain('<AsyncCandidatesExample />')
  for (const file of ['RequestFormsExample', 'AsyncCandidatesExample'])
    expect(read(`./docs/.vitepress/examples/${file}.vue`)).not.toMatch(/from ['"].*playground/)
  const page = mount(RequestFormsDemo)
  await page.get('[data-entry="related"]').trigger('click')
  const S = await import('@nerv-iip/scheduling')
  expect(page.findComponent(S.SchedulingCandidatePicker).exists()).toBe(true)
  await page.get('[data-item="session-b"]').trigger('click')
  expect(page.findComponent(S.SchedulingCandidatePicker).props('selectedKey')).toBe('session-b')
  expect(page.findComponent(S.SchedulingHorizonFields).exists()).toBe(true)
  page.unmount()
})
