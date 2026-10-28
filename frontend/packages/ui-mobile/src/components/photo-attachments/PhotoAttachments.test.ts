import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as mobile from '../../index'
import type { PhotoAttachment } from './types'
const mounted: { unmount: () => void }[] = []
afterEach(() => mounted.splice(0).forEach((w) => w.unmount()))
const receipt = { key: 'one', name: '同名.jpg', description: '第一张' }
function setup(extra: Record<string, unknown> = {}, controlled = true) {
  const w = mount(mobile.NvPhotoAttachments, {
    props: {
      attachments: [],
      contextKey: 'a',
      purpose: 'album',
      accept: 'image/jpeg,image/png',
      hint: '请选择照片',
      upload: vi.fn(async () => receipt),
      ...extra,
      'onUpdate:attachments': (attachments: PhotoAttachment[]) => {
        if (controlled) void w.setProps({ attachments })
      },
    },
  })
  mounted.push(w)
  return w
}
type Wrapper = ReturnType<typeof setup>
const file = new File(['photo'], '同名.jpg', { type: 'image/jpeg' })
async function select(w: Wrapper, selected: File | null = file) {
  const input = w.get('input').element as HTMLInputElement
  // jsdom DOM boundary injection; real File, not camera/FileList evidence.
  Object.defineProperty(input, 'files', { configurable: true, value: selected ? [selected] : [] })
  let value = 'C:\\fakepath\\photo.jpg'
  const clear = vi.fn((next: string) => {
    value = next
  })
  Object.defineProperty(input, 'value', { configurable: true, get: () => value, set: clear })
  input.dispatchEvent(new Event('change', { bubbles: true }))
  await nextTick()
  expect(clear).toHaveBeenCalledWith('')
  await flushPromises()
  expect(input.value).toBe('')
}
function deferred() {
  let resolve!: (v: unknown) => void
  let reject!: (e: unknown) => void
  const promise = new Promise((r, j) => {
    resolve = r
    reject = j
  })
  return { promise, resolve, reject }
}
describe('NvPhotoAttachments public DOM', () => {
  it('opens environment input and passes the same File again only after a valid receipt', async () => {
    const d = deferred()
    const upload = vi
      .fn()
      .mockReturnValueOnce(d.promise)
      .mockResolvedValue({ ...receipt, key: 'two' })
    const w = setup({ upload })
    const click = vi.spyOn(w.get('input').element, 'click')
    await w.get('[data-action="capture"]').trigger('click')
    expect(click).toHaveBeenCalledOnce()
    expect(w.get('input').attributes()).toMatchObject({
      capture: 'environment',
      accept: 'image/jpeg,image/png',
    })
    await select(w)
    expect(upload.mock.calls[0][0]).toBe(file)
    expect(w.findAll('li')).toHaveLength(0)
    await select(w)
    expect(upload).toHaveBeenCalledOnce()
    d.resolve(receipt)
    await flushPromises()
    expect(w.findAll('li')).toHaveLength(1)
    await select(w)
    expect(upload).toHaveBeenCalledTimes(2)
    expect(w.findAll('li')).toHaveLength(2)
  })
  it.each([undefined, null, {}, { key: '', name: 'x' }, { key: 'x', name: '' }])(
    'rejects malformed receipt %j without success',
    async (bad) => {
      const w = setup({ upload: async () => bad })
      await select(w)
      expect(w.findAll('li')).toHaveLength(0)
      expect(w.get('[role="alert"]').text()).toContain('未能添加')
    },
  )
  it('preserves success on failure, hides diagnostics and retries', async () => {
    const error = new Error('HTTP 500 secret JSON')
    const upload = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue({ ...receipt, key: 'two' })
    const w = setup({ attachments: [receipt], upload, errorMessage: '稍后再试。' })
    await select(w)
    expect(w.findAll('li')).toHaveLength(1)
    expect(w.get('[role="alert"]').text()).toBe('稍后再试。')
    expect(w.text()).not.toContain(error.message)
    expect(w.emitted('diagnostic')?.[0]).toEqual([error])
    await select(w)
    expect(w.findAll('li')).toHaveLength(2)
  })
  it('does not invent success without callback or a selection', async () => {
    const w = setup({ upload: undefined })
    await select(w)
    expect(w.emitted('update:attachments')).toBeUndefined()
    expect(w.get('[data-action="capture"]').attributes('disabled')).toBeDefined()
    const upload = vi.fn()
    const other = setup({ upload })
    await select(other, null)
    expect(upload).not.toHaveBeenCalled()
  })
  it('removes current stable key after reorder and respects rejected controlled updates', async () => {
    const two = { ...receipt, key: 'two', description: '第二张' }
    const w = setup({ attachments: [receipt, two] }, false)
    await w.setProps({ attachments: [two, receipt] })
    await w.get('[data-key="one"] button').trigger('click')
    expect(w.emitted('update:attachments')?.[0]).toEqual([[two]])
    expect(w.findAll('li')).toHaveLength(2)
    expect(w.get('[data-key="two"]').text()).toContain('第二张')
    await w.setProps({ attachments: [two] })
    expect(w.findAll('li')).toHaveLength(1)
  })
  it.each(['disabled', 'contextKey', 'purpose', 'upload', 'attachments', 'accept', 'hint'])(
    'invalidates old success failure finally on %s change',
    async (field) => {
      const d = deferred()
      const w = setup({ upload: () => d.promise })
      await select(w)
      const changes: Record<string, unknown> = {
        disabled: true,
        contextKey: 'b',
        purpose: 'b',
        upload: async () => receipt,
        attachments: [{ ...receipt, description: 'new version' }],
        accept: 'image/png',
        hint: '新限制',
      }
      await w.setProps({ [field]: changes[field] })
      d.resolve(receipt)
      await flushPromises()
      expect(w.emitted('update:attachments')).toBeUndefined()
      expect(w.find('[role="alert"]').exists()).toBe(false)
    },
  )
  it('cancellation and unmount abort signals; old rejection cannot clear a new pending request', async () => {
    const old = deferred()
    const next = deferred()
    const upload = vi.fn().mockReturnValueOnce(old.promise).mockReturnValueOnce(next.promise)
    const w = setup({ upload })
    await select(w)
    const signal = upload.mock.calls[0][1].signal
    await w.get('[data-action="cancel"]').trigger('click')
    expect(signal.aborted).toBe(true)
    await select(w)
    old.reject(new Error('old'))
    await flushPromises()
    expect(w.get('[role="status"]').text()).toContain('正在')
    expect(w.find('[role="alert"]').exists()).toBe(false)
    w.unmount()
    expect(upload.mock.calls[1][1].signal.aborted).toBe(true)
    next.resolve(receipt)
    await flushPromises()
    expect(w.emitted('update:attachments')).toBeUndefined()
  })
  it('rejects duplicate receipt key', async () => {
    const w = setup({ attachments: [receipt] })
    await select(w)
    expect(w.findAll('li')).toHaveLength(1)
    expect(w.find('[role="alert"]').exists()).toBe(true)
  })
  it('isolates in-place same-key versions, clear and stale rejection through a real controlled parent', async () => {
    const rows = ref<PhotoAttachment[]>([{ ...receipt }])
    const d = deferred()
    const w = mount(
      defineComponent({
        setup: () => () =>
          h(mobile.NvPhotoAttachments, {
            attachments: rows.value,
            contextKey: 'a',
            purpose: 'album',
            accept: 'image/jpeg',
            hint: '照片',
            upload: () => d.promise as Promise<PhotoAttachment>,
            'onUpdate:attachments': (value: PhotoAttachment[]) => {
              rows.value = value
            },
          }),
      }),
    )
    mounted.push(w)
    await select(w as Wrapper)
    rows.value[0].description = '新版本'
    d.reject(new Error('stale HTTP payload'))
    await nextTick()
    await flushPromises()
    expect(w.text()).toContain('新版本')
    expect(w.find('[role="alert"]').exists()).toBe(false)
    rows.value = []
    await nextTick()
    expect(w.findAll('li')).toHaveLength(0)
  })
  it('does not optimistically show a receipt rejected by the host', async () => {
    const w = setup({}, false)
    await select(w)
    expect(w.emitted('update:attachments')?.[0]?.[0]).toEqual([receipt])
    expect(w.findAll('li')).toHaveLength(0)
  })
  it('invalidates pending work when an equal empty controlled array is replaced', async () => {
    const d = deferred()
    const w = setup({ upload: () => d.promise })
    await select(w)
    await w.setProps({ attachments: [] })
    d.resolve(receipt)
    await flushPromises()
    expect(w.emitted('update:attachments')).toBeUndefined()
    expect(w.find('[role="status"]').exists()).toBe(false)
  })
})
