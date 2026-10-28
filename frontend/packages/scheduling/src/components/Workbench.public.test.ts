import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import * as api from '../index'
import type { SchedulingHistoryInput } from './history-types'
const input = (): SchedulingHistoryInput => ({
  source: 'library',
  revision: '1',
  state: 'ready',
  entries: ['晨间共读', '午后交流', '傍晚分享'].map((label, i) => ({
    key: `p${i}`,
    label,
    status: { key: i ? 'saved' : 'new', label: i ? '已保存' : '待确认', tone: 'neutral' },
    quantity: i ? null : 0,
    createdAt: '2026-10-29T00:00:00Z',
    timezone: 'Asia/Shanghai',
    confirmation: { label: '采用安排', description: '仅更新本地选择。' },
  })),
})
function deferred() {
  let resolve!: (v: boolean) => void
  let reject!: (v: unknown) => void
  const promise = new Promise<boolean>((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}
const create = (extra = {}) =>
  mount(api.SchedulingHistory, { props: { input: input(), pageSize: 1, ...extra } })
async function click(w: ReturnType<typeof create>, text: string) {
  const b = w.findAll('button').find((b) => b.text() === text)
  expect(b, text).toBeDefined()
  await b!.trigger('click')
}
it('exports original workbench and neutral history through public barrel', () => {
  expect(api.SchedulingWorkbench).toBeDefined()
  expect(api.SchedulingHistory).toBeDefined()
})
it('filters and pages history while open detail remains the selected snapshot', async () => {
  const w = create()
  await click(w, '明细 · 晨间共读')
  await click(w, '下一页')
  expect(w.get('[aria-label="历史明细"]').text()).toContain('晨间共读')
  expect(w.get('tbody').text()).toContain('午后交流')
  expect(w.get('tbody').text()).toContain('—')
  await w.get('[aria-label="搜索安排"]').setValue('傍晚')
  expect(w.get('tbody').text()).toContain('傍晚分享')
  await w.get('[aria-label="历史状态"]').setValue('new')
  expect(w.text()).toContain('没有符合条件')
  await click(w, '清空筛选')
  expect(w.get('tbody').text()).toContain('0')
  expect(w.text()).toContain('08:00 · Asia/Shanghai')
  w.unmount()
})
it('awaits host confirmation and retains safe retry after error', async () => {
  const d = deferred()
  const confirm = vi.fn((..._args: unknown[]) => d.promise)
  const w = create({ confirm })
  await click(w, '明细 · 晨间共读')
  await click(w, '采用安排')
  await click(w, '确认操作')
  expect((confirm.mock.calls[0]![0] as { key: string }).key).toBe('p0')
  expect(w.text()).toContain('正在确认')
  d.reject(new Error('HTTP 500 {host}'))
  await flushPromises()
  expect(w.text()).toContain('未能完成，请稍后重试')
  expect(w.text()).not.toContain('HTTP')
  expect(w.find('[aria-label="确认操作"]').exists()).toBe(true)
  w.unmount()
})
it.each(['readonly', 'replace', 'cancel', 'unmount', 'callback'] as const)(
  'discards delayed download receipts at %s edge',
  async (edge) => {
    const d = deferred()
    const download = vi.fn((..._args: unknown[]) => d.promise)
    const w = create({ download })
    await click(w, '明细 · 晨间共读')
    await click(w, '下载安排')
    expect(w.text()).toContain('正在准备下载')
    const control = download.mock.calls[0]![1] as { signal: AbortSignal }
    if (edge === 'readonly') await w.setProps({ readOnly: true })
    if (edge === 'replace') await w.setProps({ input: { ...input(), source: 'studio' } })
    if (edge === 'callback') await w.setProps({ download: async () => true })
    if (edge === 'cancel') await click(w, '取消等待')
    if (edge === 'unmount') w.unmount()
    expect(control.signal.aborted).toBe(true)
    d.resolve(true)
    await flushPromises()
    if (edge !== 'unmount') {
      expect(w.text()).not.toContain('下载已准备')
      w.unmount()
    }
  },
)
it('reports download false and success and removes unreadable detail', async () => {
  const download = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
  const w = create({ download })
  await click(w, '明细 · 晨间共读')
  await click(w, '下载安排')
  await flushPromises()
  expect(w.text()).toContain('未能完成，请重试')
  await click(w, '下载安排')
  await flushPromises()
  expect(w.text()).toContain('下载已准备')
  await w.setProps({ input: { ...input(), state: 'error' } })
  expect(w.text()).toContain('暂时无法读取')
  expect(w.find('tbody').exists()).toBe(false)
  expect(w.find('[aria-label="历史明细"]').exists()).toBe(false)
  w.unmount()
})
it.each(['confirm', 'download'] as const)(
  'accepts only boolean true for the %s receipt',
  async (kind) => {
    const action = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce(true)
    const w = create({ [kind]: action })
    await click(w, '明细 · 晨间共读')
    if (kind === 'confirm') await click(w, '采用安排')
    const label = kind === 'confirm' ? '确认操作' : '下载安排'
    await click(w, label)
    await flushPromises()
    expect(w.text()).toContain('未能完成，请重试')
    expect(w.text()).not.toContain(kind === 'confirm' ? '操作已确认' : '下载已准备')
    await click(w, label)
    await flushPromises()
    expect(w.text()).toContain(kind === 'confirm' ? '操作已确认' : '下载已准备')
    w.unmount()
  },
)
it.each(['readonly', 'replace', 'cancel', 'unmount', 'callback'] as const)(
  'discards delayed confirmation receipts at %s edge',
  async (edge) => {
    const d = deferred()
    const confirm = vi.fn((..._args: unknown[]) => d.promise)
    const w = create({ confirm })
    await click(w, '明细 · 晨间共读')
    await click(w, '采用安排')
    await click(w, '确认操作')
    const control = confirm.mock.calls[0]![1] as { signal: AbortSignal }
    if (edge === 'readonly') await w.setProps({ readOnly: true })
    if (edge === 'replace') await w.setProps({ input: { ...input(), revision: '2' } })
    if (edge === 'callback') await w.setProps({ confirm: async () => true })
    if (edge === 'cancel') await click(w, '取消操作')
    if (edge === 'unmount') w.unmount()
    expect(control.signal.aborted).toBe(true)
    d.resolve(true)
    await flushPromises()
    if (edge !== 'unmount') {
      expect(w.text()).not.toContain('操作已确认')
      w.unmount()
    }
  },
)
it('uses explicit local date, distinguishes loading and empty, and disables absent callbacks', async () => {
  const w = create()
  await w.get('[aria-label="记录日"]').setValue('2026-10-30')
  expect(w.text()).toContain('没有符合条件')
  await click(w, '清空筛选')
  await click(w, '明细 · 晨间共读')
  expect(
    w
      .findAll('button')
      .find((b) => b.text() === '下载安排')!
      .attributes('disabled'),
  ).toBeDefined()
  await w.setProps({ input: { ...input(), state: 'loading' } })
  expect(w.text()).toContain('正在读取历史')
  expect(w.find('tbody').exists()).toBe(false)
  await w.setProps({ input: { ...input(), entries: [] } })
  expect(w.text()).toContain('没有符合条件')
  w.unmount()
})

it('isolates stale catch and finally from a newer busy request and resets replacement pagination', async () => {
  const a = deferred()
  const b = deferred()
  const download = vi.fn().mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise)
  const w = create({ download })
  await click(w, '明细 · 晨间共读')
  await click(w, '下载安排')
  await click(w, '取消等待')
  await click(w, '下载安排')
  a.reject(new Error('stale HTTP'))
  await flushPromises()
  expect(w.text()).toContain('正在准备下载')
  expect(w.text()).not.toContain('未能完成')
  b.resolve(true)
  await flushPromises()
  expect(w.text()).toContain('下载已准备')
  await click(w, '下一页')
  await w.setProps({ input: { ...input(), entries: [input().entries[0]!] } })
  expect(w.get('tbody').text()).toContain('晨间共读')
  expect(w.text()).toContain('1 / 1')
  w.unmount()
})
