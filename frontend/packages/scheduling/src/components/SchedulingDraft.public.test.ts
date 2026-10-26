import { shallowRef } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import {
  SchedulingDraftBoard,
  SchedulingDraftClearDialog,
  SchedulingDraftFeedback,
  type ScheduleModel,
} from '@nerv-iip/scheduling'

const initial: ScheduleModel = {
  tasks: [
    {
      id: 'stable-a',
      text: '晨间共读',
      type: 'operation',
      operationSequence: 0,
      orderId: '周末阅读',
      operationId: '阅读',
      startUtc: '2026-10-25T02:00:00Z',
      endUtc: '2026-10-25T04:00:00Z',
      timezone: 'Asia/Shanghai',
      locked: false,
      hasConflict: false,
      resourceId: 'room-a',
      dimensions: { place: { id: 'a', label: '晨光书房' } },
      facts: [],
      display: { groupLabel: '周末阅读', resourceLabel: '晨光书房' },
    },
  ],
  resources: [
    { id: 'room-a', text: '晨光书房' },
    { id: 'room-b', text: '林间书屋' },
  ],
  links: [],
  loads: [],
  conflicts: [],
  changes: [],
  unscheduled: [],
  horizon: { startUtc: '2026-10-25T00:00:00Z', endUtc: '2026-10-26T00:00:00Z' },
  timezones: ['Asia/Shanghai'],
  meta: { planId: 'reading', status: 'preview', algorithmVersion: 'fixture' },
}
let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})
function setup(props: Record<string, unknown> = {}) {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  const page = mount(SchedulingDraftBoard, {
    props: { model: structuredClone(initial), ...props },
    attachTo: document.body,
  })
  wrapper = page
  return page
}
async function click(text: string) {
  await wrapper!
    .findAll('button')
    .find((b) => b.text() === text)!
    .trigger('click')
}
it('draft table requests host patches without mutating input and redraws current authority after accept or reject', async () => {
  const model = structuredClone(initial)
  const page = setup({ model })
  await click('表格编辑')
  const start = page.get('input[aria-label="晨间共读 的开始时间"]')
  await start.setValue('2026-10-25T11:00:00')
  await start.trigger('change')
  expect(page.emitted('update')?.at(-1)).toEqual([
    'stable-a',
    { startUtc: '2026-10-25T03:00:00.000Z' },
  ])
  expect(model.tasks[0]!.startUtc).toBe('2026-10-25T02:00:00Z')
  // Rejection redraws the original authoritative value, rather than keeping a native input edit.
  expect((start.element as HTMLInputElement).value).toBe('2026-10-25T10:00')
  await page.setProps({
    model: { ...model, tasks: [{ ...model.tasks[0]!, startUtc: '2026-10-25T03:00:00Z' }] },
  })
  expect((start.element as HTMLInputElement).value).toBe('2026-10-25T11:00')
  await page.get('select[aria-label="晨间共读 的资源"]').setValue('room-b')
  expect(page.emitted('update')?.at(-1)).toEqual(['stable-a', { resourceId: 'room-b' }])
  expect(model.tasks[0]!.resourceId).toBe('room-a')
})

it('draft save requires explicit callback success and retains editable content after rejection or throw', async () => {
  const page = setup()
  await click('保存草案')
  expect(page.get('[data-draft-save-status]').text()).toContain('尚未提供保存方式')
  const save = vi
    .fn()
    .mockResolvedValueOnce(false)
    .mockRejectedValueOnce(new Error('连接中断'))
    .mockResolvedValueOnce(true)
  await page.setProps({ save })
  await click('保存草案')
  await flushPromises()
  expect(page.get('[data-draft-save-status]').text()).toContain('未能保存')
  await click('保存草案')
  await flushPromises()
  expect(page.get('[data-draft-save-status]').text()).toContain('连接中断')
  expect(page.props('model')!.tasks[0]!.text).toBe('晨间共读')
  await click('保存草案')
  await flushPromises()
  expect(page.get('[data-draft-save-status]').text()).toContain('草案已保存')
  expect(save).toHaveBeenCalledTimes(3)
})

it('clear dialog stays open on false or throw and closes only after explicit success', async () => {
  const clear = vi
    .fn()
    .mockResolvedValueOnce(false)
    .mockRejectedValueOnce(new Error('暂不可用'))
    .mockResolvedValueOnce(true)
  wrapper = mount(SchedulingDraftClearDialog, {
    props: { open: true, clear },
    attachTo: document.body,
  })
  await flushPromises()
  const confirm = () =>
    document.body.querySelector<HTMLButtonElement>('[data-clear-confirm]')!.click()
  confirm()
  await flushPromises()
  expect(document.body.textContent).toContain('未能清空')
  expect(wrapper.emitted('update:open')).toBeUndefined()
  confirm()
  await flushPromises()
  expect(document.body.textContent).toContain('暂不可用')
  confirm()
  await flushPromises()
  expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
  expect(wrapper.emitted('cleared')).toHaveLength(1)
})

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
it('save pending deduplicates clicks and passes a detached snapshot with an abort signal', async () => {
  const result = deferred<boolean>()
  const save = vi.fn((snapshot, control) => {
    snapshot.tasks[0].text = 'callback private copy'
    expect(control.signal.aborted).toBe(false)
    return result.promise
  })
  const page = setup({ save })
  await click('保存草案')
  await click('保存草案')
  expect(save).toHaveBeenCalledTimes(1)
  expect(page.props('model')!.tasks[0]!.text).toBe('晨间共读')
  await click('表格编辑')
  expect(page.get('select[aria-label="晨间共读 的资源"]').attributes('disabled')).toBeDefined()
  result.resolve(true)
  await flushPromises()
  expect(page.get('[data-draft-save-status]').text()).toContain('草案已保存')
  expect(page.get('select[aria-label="晨间共读 的资源"]').attributes('disabled')).toBeUndefined()
})
it.each(['plan', 'deep', 'callback', 'readonly', 'unmount'] as const)(
  'save late response is isolated after %s replacement',
  async (kind) => {
    const result = deferred<boolean>()
    let signal!: AbortSignal
    const save = vi.fn((_snapshot, control) => {
      signal = control.signal
      return result.promise
    })
    const model = shallowRef(structuredClone(initial))
    const page = setup({ model: model.value, save })
    await click('保存草案')
    if (kind === 'plan')
      await page.setProps({
        model: { ...structuredClone(initial), meta: { ...initial.meta, planId: 'other' } },
      })
    if (kind === 'deep') {
      // A reactive input mutated in-place must cancel, just as replacement does.
      const { reactive } = await import('vue')
      const reactiveModel = reactive(structuredClone(initial))
      await page.setProps({ model: reactiveModel })
      await click('保存草案')
      reactiveModel.tasks[0]!.text = '外部改名'
      await flushPromises()
    }
    if (kind === 'callback') await page.setProps({ save: async () => false })
    if (kind === 'readonly') await page.setProps({ readOnly: true })
    if (kind === 'unmount') page.unmount()
    expect(signal.aborted).toBe(true)
    result.resolve(true)
    await flushPromises()
    if (kind !== 'unmount')
      expect(page.get('[data-draft-save-status]').text()).not.toContain('已保存')
  },
)
it('clear pending deduplicates confirm and ignores a late success after switching scope', async () => {
  const result = deferred<boolean>()
  const clear = vi.fn(() => result.promise)
  wrapper = mount(SchedulingDraftClearDialog, {
    props: { open: true, clear, scopeKey: 'first' },
    attachTo: document.body,
  })
  await flushPromises()
  const button = document.body.querySelector<HTMLButtonElement>('[data-clear-confirm]')!
  button.click()
  button.click()
  await flushPromises()
  expect(clear).toHaveBeenCalledTimes(1)
  expect(button.disabled).toBe(true)
  await wrapper.setProps({ scopeKey: 'second' })
  result.resolve(true)
  await flushPromises()
  expect(wrapper.emitted('cleared')).toBeUndefined()
  expect(wrapper.emitted('update:open')).toBeUndefined()
})
it('feedback replaces issues and due input without deriving validation success or zero from missing data', async () => {
  wrapper = mount(SchedulingDraftFeedback, { props: {} })
  expect(wrapper.text()).toContain('尚未提供校验反馈')
  await wrapper.setProps({
    timezone: 'Asia/Shanghai',
    feedback: {
      issues: [{ kind: 'unknown', message: '依据待定' }],
      due: { dueUtc: '2026-10-25T02:00:00Z', status: 'late', deltaMinutes: 30 },
    },
  })
  expect(wrapper.text()).toContain('依据待定')
  expect(wrapper.text()).toContain('延期 30 分钟')
  await wrapper.setProps({
    feedback: { issues: [{ kind: 'calendar', message: '开放时间待确认' }] },
  })
  expect(wrapper.text()).not.toContain('依据待定')
  expect(wrapper.text()).not.toContain('延期 30 分钟')
  expect(wrapper.text()).toContain('开放时间待确认')
  expect(wrapper.text()).toContain('未记录可核对的交期')
  await wrapper.setProps({ feedback: { issues: [] } })
  expect(wrapper.text()).toContain('未记录待核对问题')
  expect(wrapper.text()).not.toContain('未发现问题')
})
it('selection follows stable identity on reorder and readonly reaches table and detail without editable lock actions', async () => {
  const model = structuredClone(initial)
  model.tasks.push({ ...model.tasks[0]!, id: 'stable-b', text: '午间分享' })
  const page = setup({ model })
  await click('表格编辑')
  await click('晨间共读')
  expect(page.get('[data-draft-detail]').text()).toContain('晨间共读')
  await page.setProps({
    model: {
      ...model,
      tasks: [{ ...model.tasks[1]! }, { ...model.tasks[0]!, text: '晨间共读 · 更新' }],
    },
  })
  expect(page.get('[data-draft-detail]').text()).toContain('晨间共读 · 更新')
  await page.setProps({ readOnly: true })
  expect(page.get('[data-draft-detail]').findAll('button')).toHaveLength(0)
  for (const input of page.findAll(
    '[data-draft-view="table"] input, [data-draft-view="table"] select',
  ))
    expect(input.attributes('disabled')).toBeDefined()
  await page.setProps({ model: { ...model, meta: { ...model.meta, planId: 'other' } } })
  expect(page.get('[data-draft-detail]').text()).toContain('尚未选择活动')
})
it('table invalid wall time or inverted interval does not emit a patch and preserves multi-segment display', async () => {
  const page = setup()
  await click('表格编辑')
  await page.get('input[aria-label="晨间共读 的开始时间"]').setValue('2026-10-25T14:00')
  expect(page.emitted('update')).toBeUndefined()
  expect(page.get('[role="alert"]').text()).toContain('结束晚于开始')
  await page.setProps({
    model: {
      ...initial,
      tasks: [
        {
          ...initial.tasks[0]!,
          segments: [
            { startUtc: '2026-10-25T02:00:00Z', endUtc: '2026-10-25T03:00:00Z' },
            { startUtc: '2026-10-25T04:00:00Z', endUtc: '2026-10-25T05:00:00Z' },
          ],
        },
      ],
    },
  })
  expect(page.text()).toContain('第 2 段')
  expect(page.get('input[aria-label="晨间共读 的开始时间"]').attributes('disabled')).toBeDefined()
})

it('clear cancel and missing callback keep the draft and never report success', async () => {
  wrapper = mount(SchedulingDraftClearDialog, { props: { open: true }, attachTo: document.body })
  await flushPromises()
  document.body.querySelector<HTMLButtonElement>('[data-clear-confirm]')!.click()
  await flushPromises()
  expect(document.body.textContent).toContain('尚未提供清空方式')
  expect(wrapper.emitted('cleared')).toBeUndefined()
  const cancel = [...document.body.querySelectorAll('button')].find(
    (b) => b.textContent === '取消',
  )!
  cancel.click()
  await flushPromises()
  expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
})
it('board clear pending disables edits and failure retains dialog before retry applies a host reset', async () => {
  const result = deferred<boolean>()
  const clear = vi.fn().mockReturnValueOnce(result.promise).mockResolvedValueOnce(true)
  const page = setup({ clear })
  await click('清空草案')
  await flushPromises()
  document.body.querySelector<HTMLButtonElement>('[data-clear-confirm]')!.click()
  await flushPromises()
  await click('表格编辑')
  expect(page.get('select[aria-label="晨间共读 的资源"]').attributes('disabled')).toBeDefined()
  expect(
    page
      .findAll('button')
      .find((b) => b.text() === '保存草案')!
      .attributes('disabled'),
  ).toBeDefined()
  result.resolve(false)
  await flushPromises()
  expect(document.body.textContent).toContain('未能清空')
  expect(page.emitted('cleared')).toBeUndefined()
  document.body.querySelector<HTMLButtonElement>('[data-clear-confirm]')!.click()
  await flushPromises()
  expect(page.emitted('cleared')).toHaveLength(1)
  expect(page.props('model')!.tasks[0]!.text).toBe('晨间共读')
})
it.each(['close', 'callback', 'unmount'] as const)(
  'clear late failure is isolated after %s',
  async (kind) => {
    const result = deferred<boolean>()
    let signal!: AbortSignal
    wrapper = mount(SchedulingDraftClearDialog, {
      props: {
        open: true,
        clear: (control: { signal: AbortSignal }) => {
          signal = control.signal
          return result.promise
        },
      },
      attachTo: document.body,
    })
    await flushPromises()
    document.body.querySelector<HTMLButtonElement>('[data-clear-confirm]')!.click()
    await flushPromises()
    if (kind === 'close') await wrapper.setProps({ open: false })
    if (kind === 'callback') await wrapper.setProps({ clear: async () => true })
    if (kind === 'unmount') wrapper.unmount()
    expect(signal.aborted).toBe(true)
    result.reject(new Error('old request'))
    await flushPromises()
    expect(wrapper.emitted('cleared')).toBeUndefined()
    if (kind !== 'unmount') expect(document.body.textContent).not.toContain('old request')
  },
)

it('table end-time and unassigned resource requests retain stable task identity', async () => {
  const page = setup()
  await click('表格编辑')
  await page.get('input[aria-label="晨间共读 的结束时间"]').setValue('2026-10-25T13:00')
  expect(page.emitted('update')?.at(-1)).toEqual([
    'stable-a',
    { endUtc: '2026-10-25T05:00:00.000Z' },
  ])
  await page.get('select[aria-label="晨间共读 的资源"]').setValue('')
  expect(page.emitted('update')?.at(-1)).toEqual(['stable-a', { resourceId: undefined }])
})
