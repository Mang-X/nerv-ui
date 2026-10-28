import { afterEach, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { NvPicker, NvNumberKeyboard } from '@nerv-iip/ui-mobile'
import Recipe from './MobileFlowRecipe.vue'
import type { FlowInput } from './flow'
let w: VueWrapper
const row = {
  key: 'a',
  label: '共读',
  detail: '完整说明',
  quantity: 0,
  unit: '本',
  eligible: true,
  reason: '',
  status: { label: '可安排', tone: 'success' as const },
}
const make = (extra: Partial<FlowInput> = {}): FlowInput => ({
  source: 'one',
  code: 'BOOK',
  candidates: [row],
  readonly: false,
  validate: (q) => (q === '' ? '请填写数量' : null),
  execute: async () => ({ receipt: '确认一' }),
  ...extra,
})
async function click(text: string) {
  const b = w.findAll('button').find((b) => b.text() === text)
  expect(b, text).toBeTruthy()
  await b!.trigger('click')
  await flushPromises()
}
async function choose() {
  w.findComponent(NvPicker).vm.$emit('update:modelValue', 'a')
  await flushPromises()
}
async function draft() {
  await choose()
  await click('下一步')
  await w.get('#flow-quantity').trigger('click')
  await flushPromises()
  w.findComponent(NvNumberKeyboard).vm.$emit('update:modelValue', '0')
  await flushPromises()
}
afterEach(() => {
  w?.unmount()
  document.body.innerHTML = ''
})
it('scan and external clear reset controls detail and quantity', async () => {
  w = mount(Recipe, { props: { input: make() } })
  await w.get('input').setValue('NEW')
  await w.get('input').trigger('keydown.enter')
  expect(w.emitted('code')).toEqual([['NEW']])
  await draft()
  expect(w.get<HTMLInputElement>('#flow-quantity').element.value).toBe('0')
  await w.setProps({ input: make({ code: '', candidates: [] }) })
  expect(w.find('[aria-label="安排详情"]').exists()).toBe(false)
  expect(w.find('#flow-quantity').exists()).toBe(false)
  expect(w.get<HTMLInputElement>('input').element.value).toBe('')
})
it('stable key reorder replacement rejection and deletion use current authority', async () => {
  w = mount(Recipe, { props: { input: make() } })
  await choose()
  await w.setProps({
    input: make({
      candidates: [
        { ...row, key: 'b' },
        { ...row, label: '新共读', eligible: false, reason: '已满' },
      ],
    }),
  })
  expect(w.get('[aria-label="安排详情"]').text()).toContain('新共读')
  expect(w.text()).toContain('已满')
  expect(
    w
      .findAll('button')
      .find((b) => b.text() === '下一步')!
      .attributes('disabled'),
  ).toBeDefined()
  await w.setProps({ input: make({ candidates: [] }) })
  expect(w.find('[aria-label="安排详情"]').exists()).toBe(false)
})
it('zero differs from unknown and failed draft retries with explicit receipt', async () => {
  const execute = vi
    .fn()
    .mockRejectedValueOnce(new Error('稍后再试'))
    .mockResolvedValueOnce({ receipt: '确认二' })
  w = mount(Recipe, { props: { input: make({ execute }) } })
  await choose()
  expect(w.get('[aria-label="安排详情"]').text()).toContain('0')
  await w.setProps({ input: make({ execute, candidates: [{ ...row, quantity: null }] }) })
  expect(w.text()).toContain('尚未确认')
  await draft()
  await click('确认安排')
  expect(w.get('[role="alert"]').text()).toContain('稍后再试')
  expect(w.get<HTMLInputElement>('#flow-quantity').element.value).toBe('0')
  await click('重试')
  expect(w.text()).toContain('确认二')
  await w.setProps({ input: { ...(w.props() as { input: FlowInput }).input, readonly: true } })
  expect(w.text()).toContain('确认二')
  expect(w.text()).toContain('完整说明')
})
it.each(
  ['source', 'clear', 'replace', 'readonly', 'back', 'unmount'].flatMap((action) => [
    { action, fail: false },
    { action, fail: true },
  ]),
)('late completion is isolated after $action failure=$fail', async ({ action, fail }) => {
  let resolve!: (r: { receipt: string }) => void
  let reject!: (e: Error) => void
  const execute = vi.fn(
    (_draft, _signal) =>
      new Promise<{ receipt: string }>((r, j) => {
        resolve = r
        reject = j
      }),
  )
  w = mount(Recipe, { props: { input: make({ execute }) } })
  await draft()
  await click('确认安排')
  await click('确认安排')
  expect(execute).toHaveBeenCalledTimes(1)
  if (action === 'back') await w.get('[aria-label="返回"]').trigger('click')
  else if (action === 'unmount') w.unmount()
  else
    await w.setProps({
      input: make({
        execute,
        ...(action === 'source'
          ? { source: 'two' }
          : action === 'clear'
            ? { code: '', candidates: [] }
            : action === 'replace'
              ? { candidates: [{ ...row, detail: '新详情' }] }
              : { readonly: true }),
      }),
    })
  expect(execute.mock.calls[0]![1].aborted).toBe(true)
  if (fail) reject(new Error('旧错误'))
  else resolve({ receipt: '旧确认' })
  await flushPromises()
  expect(w.text()).not.toContain('旧确认')
  expect(w.text()).not.toContain('旧错误')
})
it('missing receipt never becomes success', async () => {
  w = mount(Recipe, { props: { input: make({ execute: async () => ({ receipt: '' }) }) } })
  await draft()
  await click('确认安排')
  expect(w.find('[data-status="success"]').exists()).toBe(false)
  expect(w.text()).toContain('尚未收到确认')
})

it('public keypad buttons enter zero and shell retains safe area footer', async () => {
  w = mount(Recipe, { props: { input: make() }, attachTo: document.body })
  await choose()
  await click('下一步')
  expect(w.get<HTMLInputElement>('#flow-quantity').element.value).toBe('')
  await w.get('#flow-quantity').trigger('click')
  await flushPromises()
  const zero = Array.from(document.querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === '0',
  )
  expect(zero).toBeTruthy()
  zero!.click()
  await flushPromises()
  expect(w.get<HTMLInputElement>('#flow-quantity').element.value).toBe('0')
  expect(w.get('[data-shell="footer"]').classes()).toContain('pb-safe')
  expect(w.get('[data-shell="header"]').classes()).toContain('pt-safe')
})
