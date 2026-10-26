import { flushPromises, mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import AsyncCandidateDemo from './AsyncCandidateDemo.vue'

it('host explains its local result and save responses through user-facing state controls', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'library' } })
  expect(page.text()).toContain('读书会候选安排')
  expect(page.text()).toContain('候选结果和保存响应仅在本页内存中生成')
  expect(page.text()).toContain('没有连接实际排程计算或后端保存')
  expect(page.get('[aria-label="本页状态设置"]').text()).toContain('状态设置')
  for (const [action, label] of [
    ['start-job', '开始核实'],
    ['running', '显示计算中'],
    ['replace-job', '重新核实当前方案'],
    ['complete-old', '接收上轮结果'],
    ['complete-current', '接收本轮结果'],
    ['fail-current', '本轮结果不可用'],
    ['fail-old', '上轮结果不可用'],
    ['confirm-save', '接收本轮保存确认'],
    ['reject-save', '本轮保存未确认'],
    ['confirm-old-save', '接收上轮保存确认'],
    ['reject-old-save', '上轮保存未确认'],
  ]) {
    expect(page.get(`[data-fixture="${action}"]`).text()).toBe(label)
  }
  expect(page.text()).not.toContain('候选计算完成')
  expect(page.text()).not.toContain('演示来源控制')
  page.unmount()
})

it('host keeps an older completed response outside the new job and accepts only the current result', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'library' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="replace-job"]').trigger('click')
  await page.get('[data-fixture="running"]').trigger('click')
  await page.get('[data-fixture="complete-old"]').trigger('click')
  await flushPromises()
  expect(page.text()).not.toContain('候选计算完成')
  expect(page.text()).toContain('计算中')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('候选计算完成')
  expect(page.text()).toContain('承诺时间未知')
  page.unmount()
})

it('host ignores an older failure and finally while keeping the newer request active', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'library' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="replace-job"]').trigger('click')
  await page.get('[data-fixture="running"]').trigger('click')
  await page.get('[data-fixture="fail-old"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('计算中')
  expect(page.text()).not.toContain('计算失败')
  expect(page.text()).not.toContain('RAW_HTTP_500')
  page.unmount()
})

it('host prevents duplicate start, follows real history total, readonly and ETR controls', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'studio' } })
  expect(page.text()).toContain('共 11 个方案')
  await page.get('[data-action="next-page"]').trigger('click')
  expect(page.text()).toContain('第 2 页')
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="complete-old"]').trigger('click')
  await flushPromises()
  expect(page.text()).not.toContain('候选计算完成')
  await page
    .findAll('button')
    .find((button) => button.text() === '预计时间已过')!
    .trigger('click')
  expect(page.text()).toContain('预计时间已过，仍未恢复')
  await page
    .findAll('button')
    .find((button) => button.text() === '实际已恢复')!
    .trigger('click')
  expect(page.text()).toContain('已恢复')
  await page
    .findAll('button')
    .find((button) => button.text() === '只读查看')!
    .trigger('click')
  expect(page.get('[data-action="start"]').attributes('disabled')).toBeDefined()
  expect(page.text()).toContain('当前为只读')
  page.unmount()
})

it('host cleanup ignores a completion queued immediately before unmount', async () => {
  const target = document.createElement('div')
  document.body.append(target)
  const page = mount(AsyncCandidateDemo, { attachTo: target, props: { venue: 'library' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  page.unmount()
  await flushPromises()
  expect(target.innerHTML).toBe('')
  target.remove()
})

it('host stop, failure, retry and save confirmation stay separate', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'studio' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.findAll('[data-action="stop"]')[0]!.trigger('click')
  expect(page.text()).toContain('已停止')
  await page.get('[data-fixture="complete-old"]').trigger('click')
  await flushPromises()
  expect(page.text()).not.toContain('候选计算完成')
  await page.get('[data-fixture="replace-job"]').trigger('click')
  await page.get('[data-fixture="fail-current"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('计算失败')
  expect(page.text()).not.toContain('RAW_HTTP_500')
  expect(page.text()).toContain('所选方案 · 已保存安排 1')
  await page.findAll('[data-action="retry"]')[0]!.trigger('click')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  await page.get('[data-action="select"]').trigger('click')
  expect(page.text()).toContain('正在保存修订')
  expect(page.text()).not.toContain('候选修订已保存')
  await page.get('[data-fixture="confirm-save"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('候选修订已保存')
  page.unmount()
})

it('host keeps a failed save unconfirmed and allows the same candidate to be saved again', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'library' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  await page.get('[data-action="select"]').trigger('click')
  await page.get('[data-fixture="reject-save"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('修订未保存')
  expect(page.text()).not.toContain('候选修订已保存')
  await page.get('[data-action="select"]').trigger('click')
  await page.get('[data-fixture="confirm-save"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('候选修订已保存')
  page.unmount()
})

it('host switching the selected saved plan cancels the old request and retains the new choice', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'library' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.findAll('[data-action="choose-plan"]')[1]!.trigger('click')
  expect(page.text()).toContain('所选方案 · 已保存安排 2')
  expect(page.find('[aria-label="急单插单候选"]').exists()).toBe(false)
  await page.get('[data-fixture="complete-old"]').trigger('click')
  await flushPromises()
  expect(page.text()).not.toContain('候选计算完成')
  expect(page.text()).toContain('所选方案 · 已保存安排 2')
  page.unmount()
})

it('same host instance invalidates a created job on source change and accepts a new request', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'library' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.setProps({ venue: 'studio' })
  expect(page.text()).toContain('工作坊候选安排')
  expect(page.text()).not.toContain('已受理，等待计算')
  expect(page.find('[aria-label="急单插单候选"]').exists()).toBe(false)
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="complete-old"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('已受理，等待计算')
  expect(page.text()).not.toContain('候选计算完成')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('候选计算完成')
  expect(page.text()).toContain('午后创作')
  expect(page.text()).not.toContain('晨间共读 · 原窗口')
  page.unmount()
})

it('old save confirmation after source change cannot affect a new save operation', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'library' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  await page.get('[data-action="select"]').trigger('click')
  expect(page.text()).toContain('正在保存修订')
  await page.setProps({ venue: 'studio' })
  expect(page.text()).not.toContain('正在保存修订')
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  await page.get('[data-action="select"]').trigger('click')
  await page.get('[data-fixture="confirm-old-save"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('正在保存修订')
  expect(page.text()).not.toContain('候选修订已保存')
  await page.get('[data-fixture="confirm-save"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('候选修订已保存')
  page.unmount()
})

it('readonly transition cancels a pending result and recovery can start again', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'library' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page
    .findAll('button')
    .find((button) => button.text() === '只读查看')!
    .trigger('click')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  expect(page.text()).not.toContain('候选计算完成')
  expect(page.text()).toContain('当前为只读')
  await page
    .findAll('button')
    .find((button) => button.text() === '允许操作')!
    .trigger('click')
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('候选计算完成')
  page.unmount()
})

it('readonly keeps an already completed result but cancels its pending save', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'library' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  await page.get('[data-action="select"]').trigger('click')
  await page
    .findAll('button')
    .find((button) => button.text() === '只读查看')!
    .trigger('click')
  expect(page.text()).toContain('候选计算完成')
  await page.get('[data-fixture="confirm-old-save"]').trigger('click')
  await flushPromises()
  expect(page.text()).not.toContain('候选修订已保存')
  expect(page.text()).not.toContain('正在保存修订')
  await page
    .findAll('button')
    .find((button) => button.text() === '允许操作')!
    .trigger('click')
  await page.get('[data-action="select"]').trigger('click')
  await page.get('[data-fixture="confirm-save"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('候选修订已保存')
  page.unmount()
})

it('a late save failure after changing plans cannot replace the new request state', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'library' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  await page.get('[data-action="select"]').trigger('click')
  await page.findAll('[data-action="choose-plan"]')[1]!.trigger('click')
  expect(page.text()).toContain('所选方案 · 已保存安排 2')
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="reject-old-save"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('已受理，等待计算')
  expect(page.text()).not.toContain('修订未保存')
  expect(page.text()).not.toContain('RAW_SAVE_ERROR')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('候选计算完成')
  page.unmount()
})

it('replacing a job while save waits prevents its late confirmation from selecting the new job', async () => {
  const page = mount(AsyncCandidateDemo, { props: { venue: 'studio' } })
  await page.get('[data-fixture="start-job"]').trigger('click')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  await page.get('[data-action="select"]').trigger('click')
  await page.get('[data-fixture="replace-job"]').trigger('click')
  await page.get('[data-fixture="confirm-old-save"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('已受理，等待计算')
  expect(page.text()).not.toContain('候选修订已保存')
  await page.get('[data-fixture="complete-current"]').trigger('click')
  await flushPromises()
  expect(page.text()).toContain('候选计算完成')
  expect(page.text()).not.toContain('候选修订已保存')
  page.unmount()
})

it.each([
  ['library', 'complete-old'],
  ['library', 'fail-old'],
  ['studio', 'complete-old'],
  ['studio', 'fail-old'],
] as const)(
  '%s source and readonly edges keep %s outside the next request',
  async (venue, lateAction) => {
    const page = mount(AsyncCandidateDemo, { props: { venue } })
    await page.get('[data-fixture="start-job"]').trigger('click')
    await page.get('[data-fixture="running"]').trigger('click')
    const changed = page.setProps({ venue: venue === 'library' ? 'studio' : 'library' })
    const readonly = page
      .findAll('button')
      .find((button) => button.text() === '只读查看')!
      .trigger('click')
    await Promise.all([changed, readonly])
    expect(page.find('[aria-label="急单插单候选"]').exists()).toBe(false)
    await page.get(`[data-fixture="${lateAction}"]`).trigger('click')
    await flushPromises()
    expect(page.text()).not.toContain('候选计算完成')
    expect(page.text()).not.toContain('计算失败')
    await page
      .findAll('button')
      .find((button) => button.text() === '允许操作')!
      .trigger('click')
    await page.get('[data-fixture="start-job"]').trigger('click')
    expect(page.text()).toContain('已受理，等待计算')
    await page.get('[data-fixture="complete-current"]').trigger('click')
    await flushPromises()
    expect(page.text()).toContain('候选计算完成')
    page.unmount()
  },
)
