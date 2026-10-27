import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import {
  SchedulingOrderPool,
  SchedulingCandidatePicker,
  SchedulingHorizonFields,
  SchedulingSingleOrderDialog,
  type SchedulingRequestItem,
  type SchedulingHorizonInput,
} from '../../index'

const items: SchedulingRequestItem[] = [
  { key: 'a', label: '晨间共读', detail: 'A 组', priority: 20, isRush: false },
  { key: 'b', label: '午后交流', detail: 'B 组', priority: 40, isRush: false },
  { key: 'c', label: '夜间工作坊', detail: 'C 组', priority: 60, isRush: false },
]

it('public pool distinguishes unavailable states and sends only two visible keys', async () => {
  const pool = mount(SchedulingOrderPool, {
    props: { sourceKey: 'library', state: 'unready', items: [], selectedKeys: [] },
  })
  expect(pool.text()).toContain('尚未读取')
  await pool.setProps({ state: 'loading' })
  expect(pool.text()).toContain('正在读取')
  await pool.setProps({ state: 'error' })
  expect(pool.text()).toContain('读取失败')
  await pool.setProps({ state: 'ready' })
  expect(pool.text()).toContain('暂无可选项目')
  await pool.setProps({ items })
  await pool.get('[aria-label="搜索候选项目"]').setValue('午|夜')
  expect(pool.text()).toContain('没有匹配')
  await pool.get('[aria-label="搜索候选项目"]').setValue('组')
  expect(pool.findAll('tbody tr')).toHaveLength(3)
  await pool.get('[aria-label="搜索候选项目"]').setValue('间')
  await pool.get('[data-action="include-visible"]').trigger('click')
  expect(pool.emitted('include')?.at(-1)).toEqual([['a', 'c'], true])
  await pool.get('[aria-label="搜索候选项目"]').setValue('共读')
  await pool.get('[data-action="include-visible"]').trigger('click')
  expect(pool.emitted('include')?.at(-1)).toEqual([['a'], true])
  pool.unmount()
})

it('public pool selection follows stable keys across reorder and explicit filter policy', async () => {
  const pool = mount(SchedulingOrderPool, {
    props: { sourceKey: 'library', state: 'ready', items, selectedKeys: ['a', 'c'] },
  })
  await pool.get('[aria-label="搜索候选项目"]').setValue('午')
  expect(pool.emitted('include')).toBeUndefined()
  await pool.setProps({
    items: [items[2]!, { ...items[1]!, label: '午后交流 · 新名称' }, items[0]!],
  })
  await pool.get('[aria-label="搜索候选项目"]').setValue('间')
  expect(pool.findAll('tbody tr')).toHaveLength(2)
  expect(pool.get('[aria-label="选择 晨间共读"]').attributes('aria-checked')).toBe('true')
  await pool.setProps({ selectionOnFilter: 'clear-hidden' })
  await pool.get('[aria-label="搜索候选项目"]').setValue('午')
  expect(pool.emitted('include')?.at(-1)).toEqual([['a', 'c'], false])
  pool.unmount()
})

it('public pool ignores stale save completion and keeps a retryable draft after throw', async () => {
  let finish: ((value: boolean) => void) | undefined
  const delayed = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve
      }),
  )
  const pool = mount(SchedulingOrderPool, {
    props: { sourceKey: 'library', state: 'ready', items, selectedKeys: [], saveItem: delayed },
  })
  await pool.get('[aria-label="优先级 a"]').setValue('27')
  await pool.get('[data-save="a"]').trigger('click')
  await pool.setProps({ sourceKey: 'studio', items: items.map((item) => ({ ...item })) })
  finish?.(true)
  await flushPromises()
  expect(pool.text()).not.toContain('已确认')
  expect(pool.get('[data-save="a"]').attributes('disabled')).toBeDefined()
  await pool.setProps({
    saveItem: async () => {
      throw new Error('raw secret')
    },
  })
  await pool.get('[aria-label="优先级 a"]').setValue('29')
  await pool.get('[data-save="a"]').trigger('click')
  await flushPromises()
  expect(pool.text()).toContain('保存失败，草稿仍可重试')
  expect(pool.text()).not.toContain('raw secret')
  pool.unmount()
})

it('public picker keeps missing scope, loading, failure, empty and no hit distinct', async () => {
  const picker = mount(SchedulingCandidatePicker, {
    props: { sourceKey: 'library', state: 'unready', items: [], selectedKey: '', keyword: '' },
  })
  expect(picker.text()).toContain('尚未读取')
  await picker.setProps({ state: 'loading' })
  expect(picker.text()).toContain('正在读取')
  await picker.setProps({ state: 'error' })
  expect(picker.text()).toContain('读取失败')
  await picker.get('[data-action="retry"]').trigger('click')
  expect(picker.emitted('retry')).toHaveLength(1)
  await picker.setProps({ state: 'ready' })
  expect(picker.text()).toContain('暂无可选项目')
  await picker.setProps({ items, keyword: '不存在' })
  expect(picker.text()).toContain('没有匹配')
  await picker.setProps({ keyword: '' })
  await picker.get('[data-item="b"]').trigger('click')
  expect(picker.emitted('update:selectedKey')?.at(-1)).toEqual(['b'])
  picker.unmount()
})

it('public horizon preserves wall time and presents host validation for custom range', async () => {
  const value: SchedulingHorizonInput = {
    mode: 'preset',
    presetKey: 'week',
    startLocal: '',
    endLocal: '',
  }
  const horizon = mount(SchedulingHorizonFields, {
    props: {
      modelValue: value,
      presets: [{ key: 'week', label: '接下来一周' }],
      validation: { valid: true, message: '由场地安排方核对' },
      idPrefix: 'a',
    },
  })
  expect(horizon.text()).toContain('接下来一周')
  await horizon.get('[data-action="custom"]').trigger('click')
  const custom = horizon.emitted('update:modelValue')?.at(-1)?.[0] as SchedulingHorizonInput
  await horizon.setProps({
    modelValue: custom,
    validation: { valid: false, message: '结束时间须晚于开始时间' },
  })
  await horizon.get('#a-start').setValue('2026-11-01T09:30')
  expect(horizon.emitted('update:modelValue')?.at(-1)?.[0]).toMatchObject({
    startLocal: '2026-11-01T09:30',
  })
  expect(horizon.get('[role="alert"]').text()).toContain('结束时间须晚于开始时间')
  horizon.unmount()
})

it('public single request requires a real callback receipt and rejects stale close/source results', async () => {
  let finish: ((value: { key: string; label: string }) => void) | undefined
  const submit = vi.fn(
    () =>
      new Promise<{ key: string; label: string }>((resolve) => {
        finish = resolve
      }),
  )
  const dialog = mount(SchedulingSingleOrderDialog, {
    props: {
      open: true,
      sourceKey: 'library',
      contextKey: 'room-a',
      contextLabel: '读书会',
      fixedItem: items[0],
      candidateState: 'ready',
      candidates: items,
      initialHorizon: { mode: 'preset', presetKey: 'week', startLocal: '', endLocal: '' },
      presets: [{ key: 'week', label: '接下来一周' }],
      validateHorizon: () => ({ valid: true, message: '已核对' }),
      submit,
    },
  })
  expect(dialog.text()).toContain('晨间共读')
  await dialog.get('[data-action="submit-request"]').trigger('click')
  expect(submit).toHaveBeenCalledWith(
    expect.objectContaining({
      sourceKey: 'library',
      contextKey: 'room-a',
      itemKey: 'a',
      mode: 'new',
      horizon: expect.objectContaining({ presetKey: 'week' }),
    }),
  )
  await dialog.get('[data-action="submit-request"]').trigger('click')
  expect(submit).toHaveBeenCalledTimes(1)
  await dialog.setProps({ open: false })
  await dialog.setProps({
    open: true,
    sourceKey: 'studio',
    contextKey: 'room-b',
    fixedItem: items[1],
  })
  finish?.({ key: 'old', label: '旧安排' })
  await flushPromises()
  expect(dialog.text()).not.toContain('旧安排')
  expect(dialog.text()).toContain('午后交流')
  expect(dialog.get('[data-action="submit-request"]').attributes('disabled')).toBeUndefined()
  dialog.unmount()
})

it('public dialog keeps a failed request editable and validates every window state from host', async () => {
  const submit = vi
    .fn()
    .mockResolvedValueOnce(false)
    .mockRejectedValueOnce(new Error('raw token'))
    .mockResolvedValueOnce({ key: 'saved', label: '本页已接受' })
  const validate = (input: SchedulingHorizonInput) =>
    !input.startLocal || !input.endLocal
      ? { valid: false, message: '请填写开始和结束时间' }
      : input.endLocal <= input.startLocal
        ? { valid: false, message: '结束时间须晚于开始时间' }
        : input.endLocal > '2026-11-15T00:00'
          ? { valid: false, message: '超过本页来源允许的范围' }
          : { valid: true, message: '范围已核对' }
  const dialog = mount(SchedulingSingleOrderDialog, {
    props: {
      open: true,
      sourceKey: 'library',
      contextKey: 'room-a',
      fixedItem: items[0],
      candidateState: 'ready',
      candidates: items,
      initialHorizon: { mode: 'custom', presetKey: 'week', startLocal: '', endLocal: '' },
      presets: [{ key: 'week', label: '接下来一周' }],
      validateHorizon: validate,
      submit,
    },
  })
  expect(dialog.text()).toContain('请填写开始和结束时间')
  await dialog.get('#single-request-start').setValue('2026-11-01T09:00')
  await dialog.get('#single-request-end').setValue('2026-11-01T08:00')
  expect(dialog.text()).toContain('结束时间须晚于开始时间')
  await dialog.get('#single-request-end').setValue('2026-11-20T09:00')
  expect(dialog.text()).toContain('超过本页来源允许的范围')
  expect(dialog.get('[data-action="submit-request"]').attributes('disabled')).toBeDefined()
  await dialog.get('#single-request-end').setValue('2026-11-03T09:00')
  await dialog.get('[data-action="submit-request"]').trigger('click')
  await flushPromises()
  expect(dialog.text()).toContain('请求未确认')
  await dialog.get('[data-action="submit-request"]').trigger('click')
  await flushPromises()
  expect(dialog.text()).toContain('请求失败')
  expect(dialog.text()).not.toContain('raw token')
  await dialog.get('[data-action="submit-request"]').trigger('click')
  await flushPromises()
  expect(dialog.text()).toContain('本页已接受')
  expect(submit).toHaveBeenCalledTimes(3)
  dialog.unmount()
})

it('public dialog supports picker and insert with captured plan; readonly keeps completed result', async () => {
  const submit = vi.fn(async () => ({ key: 'saved', label: '已确认的安排' }))
  const dialog = mount(SchedulingSingleOrderDialog, {
    props: {
      open: true,
      sourceKey: 'studio',
      contextKey: 'room-b',
      candidateState: 'ready',
      candidates: items,
      initialKeyword: '午',
      initialHorizon: { mode: 'preset', presetKey: 'week', startLocal: '', endLocal: '' },
      presets: [{ key: 'week', label: '接下来一周' }],
      plans: [{ key: 'plan-a', label: '现有场次' }],
      validateHorizon: () => ({ valid: true, message: '已核对' }),
      submit,
    },
  })
  expect(dialog.find('[data-item="a"]').exists()).toBe(false)
  await dialog.get('[data-item="b"]').trigger('click')
  await dialog.get('[data-action="insert"]').trigger('click')
  await dialog.get('[data-plan="plan-a"]').trigger('click')
  await dialog.get('[data-action="submit-request"]').trigger('click')
  await flushPromises()
  expect(submit).toHaveBeenCalledWith(
    expect.objectContaining({
      sourceKey: 'studio',
      contextKey: 'room-b',
      itemKey: 'b',
      mode: 'insert',
      planKey: 'plan-a',
    }),
  )
  expect(dialog.text()).toContain('已确认的安排')
  await dialog.setProps({ readOnly: true })
  expect(dialog.text()).toContain('已确认的安排')
  expect(dialog.get('[data-action="submit-request"]').attributes('disabled')).toBeDefined()
  dialog.unmount()
})

it('public dialog without submit callback cannot show a confirmation', async () => {
  const dialog = mount(SchedulingSingleOrderDialog, {
    props: {
      open: true,
      sourceKey: 'library',
      contextKey: 'room-a',
      fixedItem: items[0],
      candidateState: 'ready',
      candidates: items,
      initialHorizon: { mode: 'preset', presetKey: 'week', startLocal: '', endLocal: '' },
      presets: [{ key: 'week', label: '接下来一周' }],
      validateHorizon: () => ({ valid: true, message: '已核对' }),
    },
  })
  expect(dialog.get('[data-action="submit-request"]').attributes('disabled')).toBeDefined()
  expect(dialog.text()).toContain('未提供提交方式')
  expect(dialog.text()).not.toContain('确认结果')
  dialog.unmount()
})

it('public pool keeps a failed priority draft and retries the same values', async () => {
  const save = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true)
  const pool = mount(SchedulingOrderPool, {
    props: { sourceKey: 'library', state: 'ready', items, selectedKeys: [], saveItem: save },
  })
  await pool.get('[aria-label="优先级 a"]').setValue('25')
  await pool.get('[data-save="a"]').trigger('click')
  await flushPromises()
  expect(pool.text()).toContain('保存未确认')
  expect((pool.get('[aria-label="优先级 a"]').element as HTMLInputElement).value).toBe('25')
  await pool.get('[data-save="a"]').trigger('click')
  await flushPromises()
  expect(save).toHaveBeenNthCalledWith(2, 'a', { priority: 25, isRush: false })
  expect(pool.text()).toContain('已确认')
  pool.unmount()
})

it('public pool keeps a rush draft without callback and sends it only after retry is available', async () => {
  const save = vi.fn(async () => true)
  const pool = mount(SchedulingOrderPool, {
    props: { sourceKey: 'library', state: 'ready', items, selectedKeys: [] },
  })
  await pool.get('[aria-label="加急 a"]').trigger('click')
  await pool.get('[data-save="a"]').trigger('click')
  expect(pool.text()).toContain('未提供保存方式')
  await pool.setProps({ saveItem: save })
  await pool.get('[data-save="a"]').trigger('click')
  await flushPromises()
  expect(save).toHaveBeenCalledWith('a', { priority: 20, isRush: true })
  pool.unmount()
})

it('public forms keep missing priority unknown instead of inventing zero', () => {
  const unknown = { key: 'unknown', label: '待核对活动' }
  const pool = mount(SchedulingOrderPool, {
    props: { sourceKey: 'library', state: 'ready', items: [unknown], selectedKeys: [] },
  })
  expect((pool.get('[aria-label="优先级 unknown"]').element as HTMLInputElement).value).toBe('')
  pool.unmount()
  const dialog = mount(SchedulingSingleOrderDialog, {
    props: {
      open: true,
      sourceKey: 'library',
      contextKey: 'room-a',
      fixedItem: unknown,
      candidateState: 'ready',
      candidates: [unknown],
      initialHorizon: { mode: 'preset', presetKey: 'week', startLocal: '', endLocal: '' },
      presets: [{ key: 'week', label: '接下来一周' }],
      validateHorizon: () => ({ valid: true, message: '已核对' }),
      submit: async () => ({ key: 'x', label: '不应调用' }),
    },
  })
  expect(dialog.text()).toContain('请填写优先级')
  expect(dialog.get('[data-action="submit-request"]').attributes('disabled')).toBeDefined()
  dialog.unmount()
})

it('public pool explains disabled editing while readonly', () => {
  const pool = mount(SchedulingOrderPool, {
    props: { sourceKey: 'library', state: 'ready', items, selectedKeys: [], readOnly: true },
  })
  expect(pool.text()).toContain('当前为只读，选择与保存不可用')
  expect(pool.get('[data-action="include-visible"]').attributes('disabled')).toBeDefined()
  expect(pool.get('[aria-label="优先级 a"]').attributes('title')).toBe('当前为只读')
  pool.unmount()
})
