import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { SchedulingOrderPool, SchedulingSingleOrderDialog } from '../../index'

const item = { key: 'a', label: 'Alpha', priority: 1, isRush: false }
const dialogProps = {
  open: true,
  sourceKey: 'source',
  contextKey: 'context',
  candidateState: 'ready' as const,
  candidates: [item],
  initialHorizon: { mode: 'preset' as const, presetKey: 'week', startLocal: '', endLocal: '' },
  presets: [{ key: 'week', label: '一周' }],
  validateHorizon: () => ({ valid: true, message: '已核对' }),
}

it('public selected request waits for a ready source and can retry after it recovers', async () => {
  const submit = vi.fn(async () => ({ key: 'receipt', label: '已确认' }))
  const dialog = mount(SchedulingSingleOrderDialog, { props: { ...dialogProps, submit } })
  await dialog.get('[data-item="a"]').trigger('click')
  for (const state of ['unready', 'loading', 'error'] as const) {
    await dialog.setProps({ candidateState: state })
    expect(dialog.get('[data-action="submit-request"]').attributes('disabled')).toBeDefined()
    expect(dialog.get('[role="status"]').text()).not.toBe('')
    await dialog.get('[data-action="submit-request"]').trigger('click')
    expect(submit).not.toHaveBeenCalled()
  }
  await dialog.setProps({ candidateState: 'ready' })
  expect(dialog.get('[data-action="submit-request"]').attributes('disabled')).toBeUndefined()
  await dialog.get('[data-action="submit-request"]').trigger('click')
  await flushPromises()
  expect(submit).toHaveBeenCalledTimes(1)
  expect(dialog.emitted('scheduled')).toHaveLength(1)
  dialog.unmount()
})

it('public pending request loses its receipt when the selected source leaves ready', async () => {
  let finish!: (value: { key: string; label: string }) => void
  const submit = vi.fn(
    () =>
      new Promise<{ key: string; label: string }>((resolve) => {
        finish = resolve
      }),
  )
  const dialog = mount(SchedulingSingleOrderDialog, { props: { ...dialogProps, submit } })
  await dialog.get('[data-item="a"]').trigger('click')
  await dialog.get('[data-action="submit-request"]').trigger('click')
  await dialog.setProps({ candidateState: 'loading' })
  finish({ key: 'old', label: '旧确认' })
  await flushPromises()
  expect(dialog.emitted('scheduled')).toBeUndefined()
  expect(dialog.text()).not.toContain('旧确认')
  expect(dialog.get('[data-action="submit-request"]').text()).not.toContain('确认中')
  await dialog.setProps({ candidateState: 'ready' })
  await dialog.get('[data-action="submit-request"]').trigger('click')
  finish({ key: 'new', label: '新确认' })
  await flushPromises()
  expect(submit).toHaveBeenCalledTimes(2)
  expect(dialog.emitted('scheduled')?.[0]?.[0]).toEqual({ key: 'new', label: '新确认' })
  dialog.unmount()
})

it('public stale failure and finally cannot settle a newer selected request', async () => {
  const pending: Array<{
    resolve: (value: { key: string; label: string }) => void
    reject: (error: Error) => void
  }> = []
  const submit = vi.fn(
    () =>
      new Promise<{ key: string; label: string }>((resolve, reject) => {
        pending.push({ resolve, reject })
      }),
  )
  const dialog = mount(SchedulingSingleOrderDialog, { props: { ...dialogProps, submit } })
  await dialog.get('[data-item="a"]').trigger('click')
  await dialog.get('[data-action="submit-request"]').trigger('click')
  await dialog.setProps({ candidateState: 'loading' })
  await dialog.setProps({ candidateState: 'ready' })
  await dialog.get('[data-action="submit-request"]').trigger('click')
  pending[0]!.reject(new Error('private failure'))
  await flushPromises()
  expect(dialog.get('[data-action="submit-request"]').text()).toContain('确认中')
  expect(dialog.text()).not.toContain('private failure')
  expect(dialog.emitted('scheduled')).toBeUndefined()
  pending[1]!.resolve({ key: 'new', label: '新确认' })
  await flushPromises()
  expect(dialog.emitted('scheduled')?.[0]?.[0]).toEqual({ key: 'new', label: '新确认' })
  dialog.unmount()
})

it('public fixed target keeps its own eligibility while the unrelated picker loads', async () => {
  const submit = vi.fn(async () => ({ key: 'fixed', label: '固定目标确认' }))
  const dialog = mount(SchedulingSingleOrderDialog, {
    props: { ...dialogProps, fixedItem: item, candidateState: 'loading', submit },
  })
  expect(dialog.find('[data-item="a"]').exists()).toBe(false)
  await dialog.get('[data-action="submit-request"]').trigger('click')
  await flushPromises()
  expect(submit).toHaveBeenCalledTimes(1)
  expect(dialog.emitted('scheduled')).toHaveLength(1)
  dialog.unmount()
})

it('public clear-hidden requests a controlled removal when row text changes under the filter', async () => {
  const pool = mount(SchedulingOrderPool, {
    props: {
      sourceKey: 'source',
      state: 'ready',
      selectedKeys: ['a'],
      selectionOnFilter: 'clear-hidden',
      items: [item, { key: 'b', label: 'Beta' }],
    },
  })
  await pool.get('[aria-label="搜索候选项目"]').setValue('Alpha')
  await pool.setProps({
    items: [
      { ...item, label: 'Z' },
      { key: 'b', label: 'Beta' },
    ],
  })
  expect(pool.text()).toContain('没有匹配')
  expect(pool.emitted('include')?.at(-1)).toEqual([['a'], false])
  expect(pool.props('selectedKeys')).toEqual(['a'])
  const count = pool.emitted('include')?.length
  await pool.setProps({
    items: [
      { key: 'b', label: 'Beta' },
      { ...item, label: 'Z' },
    ],
  })
  expect(pool.emitted('include')?.length).toBe(count)
  await pool.setProps({ selectedKeys: [] })
  expect(pool.emitted('include')?.length).toBe(count)
  pool.unmount()
})

it('public priority distinguishes clearing from real zero across a failed retry', async () => {
  const saveItem = vi
    .fn()
    .mockResolvedValueOnce(false)
    .mockResolvedValueOnce(true)
    .mockResolvedValueOnce(true)
  const pool = mount(SchedulingOrderPool, {
    props: { sourceKey: 'source', state: 'ready', items: [item], selectedKeys: [], saveItem },
  })
  await pool.get('[aria-label="优先级 a"]').setValue('')
  await pool.get('[data-save="a"]').trigger('click')
  await flushPromises()
  expect(saveItem).toHaveBeenLastCalledWith('a', { priority: null, isRush: false })
  expect(pool.text()).toContain('草稿仍可重试')
  await pool.get('[data-save="a"]').trigger('click')
  await flushPromises()
  expect(saveItem).toHaveBeenLastCalledWith('a', { priority: null, isRush: false })
  await pool.get('[aria-label="优先级 a"]').setValue('0')
  await pool.get('[data-save="a"]').trigger('click')
  await flushPromises()
  expect(saveItem).toHaveBeenLastCalledWith('a', { priority: 0, isRush: false })
  pool.unmount()
})

it('public receipt requires nonblank string key and label before confirmation', async () => {
  const submit = vi
    .fn()
    .mockResolvedValueOnce({ key: 'receipt' })
    .mockResolvedValueOnce({ key: 'receipt', label: '  ' })
    .mockResolvedValueOnce({ key: 42, label: '已确认' })
    .mockResolvedValueOnce({ key: ' opaque: 01 ', label: '已确认' })
  const dialog = mount(SchedulingSingleOrderDialog, {
    props: { ...dialogProps, fixedItem: item, submit },
  })
  for (let attempt = 0; attempt < 3; attempt++) {
    await dialog.get('[data-action="submit-request"]').trigger('click')
    await flushPromises()
    expect(dialog.emitted('scheduled')).toBeUndefined()
    expect(dialog.text()).toContain('请求未确认')
    expect(dialog.get('[data-action="submit-request"]').attributes('disabled')).toBeUndefined()
  }
  await dialog.get('[data-action="submit-request"]').trigger('click')
  await flushPromises()
  expect(dialog.emitted('scheduled')?.[0]?.[0]).toEqual({ key: ' opaque: 01 ', label: '已确认' })
  dialog.unmount()
})
