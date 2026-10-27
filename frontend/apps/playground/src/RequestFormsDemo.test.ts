import { flushPromises, mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import RequestFormsDemo from './RequestFormsDemo.vue'

it('two neutral request routes expose four entry paths and memory-only notice', async () => {
  for (const venue of ['library', 'studio'] as const) {
    const page = mount(RequestFormsDemo, { props: { venue } })
    expect(page.text()).toContain('未连接实际排程计算或后端保存')
    expect(page.findAll('[data-entry]')).toHaveLength(4)
    expect(page.get('[aria-label="页面导航"]').text()).toContain('返回工作空间')
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
  await page.get('[data-action="submit-request"]').trigger('click')
  await flushPromises()
  expect(page.get('[role="dialog"]').text()).toContain('请求未确认')
  await page.get('[data-response="accept"]').trigger('click')
  await page.get('[data-action="insert"]').trigger('click')
  await page.get('[data-plan="existing-a"]').trigger('click')
  await page.get('[data-action="submit-request"]').trigger('click')
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
