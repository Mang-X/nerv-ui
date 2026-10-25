import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import FilesDemo from './FilesDemo.vue'

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

it('keeps manual selection inert then pauses, resumes, retries and replaces receipt snapshots', async () => {
  wrapper = mount(FilesDemo, { attachTo: document.body })
  const choose = async (name: string) => {
    const input = wrapper!.get('[data-slot="file-upload"] input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [new File(['note'], name, { type: 'text/plain' })],
    })
    await input.trigger('change')
    await flushPromises()
  }
  const click = async (text: string) => {
    await wrapper!
      .findAll('button')
      .find((button) => button.text() === text)!
      .trigger('click')
    await flushPromises()
  }
  await choose('first.txt')
  expect(wrapper.get('[aria-label="传输计数"]').text()).toContain(
    'create 0 · transport 0 · complete 0',
  )
  await click('开始上传')
  await click('推进传输')
  await wrapper.get('[aria-label="暂停 first.txt"]').trigger('click')
  await flushPromises()
  expect(wrapper.get('[aria-label="传输计数"]').text()).toContain('complete 0')
  expect(wrapper.get('[data-status="paused"]').text()).toContain('已暂停')
  await wrapper.get('[aria-label="继续 first.txt"]').trigger('click')
  await flushPromises()
  await click('本次传输失败')
  expect(wrapper.get('[aria-label="成功回执"]').text()).toContain('尚无成功文件')
  await wrapper.get('[aria-label="重试 first.txt"]').trigger('click')
  await flushPromises()
  await click('推进传输')
  await click('推进传输')
  await click('推进传输')
  expect(wrapper.get('[aria-label="成功回执"]').text()).toContain('first.txt')
  await choose('second.txt')
  await click('开始上传')
  await click('推进传输')
  await click('推进传输')
  await click('推进传输')
  expect(wrapper.get('[aria-label="成功回执"]').findAll('li')).toHaveLength(2)
  await wrapper.get('[aria-label="移除 first.txt"]').trigger('click')
  await flushPromises()
  expect(wrapper.get('[aria-label="成功回执"]').text()).not.toContain('first.txt')
  await click('清空文件')
  expect(wrapper.get('[aria-label="成功回执"]').text()).toContain('尚无成功文件')
  expect(wrapper.findAll('[data-slot="file-upload-row"]')).toHaveLength(0)
})

it('owns local preview URLs and only opens a controlled source after a separate host action', async () => {
  let sequence = 0
  const create = vi
    .spyOn(URL, 'createObjectURL')
    .mockImplementation(() => `blob:host-${++sequence}`)
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  const open = vi.spyOn(window, 'open').mockImplementation(() => null)
  wrapper = mount(FilesDemo, { attachTo: document.body })
  const input = wrapper.get('input[aria-label="预览本地图片"]')
  const select = async (name: string) => {
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [new File(['image'], name, { type: 'image/png' })],
    })
    await input.trigger('change')
    await flushPromises()
  }
  await select('first.png')
  expect(create).toHaveBeenCalledTimes(1)
  expect(revoke).not.toHaveBeenCalled()
  await wrapper.get('[data-testid="file-preview-image"]').trigger('load')
  expect(wrapper.get('[aria-label="预览事件"]').text()).toContain('ready image')
  await wrapper.get('[aria-label="打开 first.png"]').trigger('click')
  await flushPromises()
  expect(open).not.toHaveBeenCalled()
  await wrapper
    .findAll('button')
    .find((b) => b.text() === '打开本地原图')!
    .trigger('click')
  expect(open).toHaveBeenCalledWith('blob:host-1', '_blank', 'noopener,noreferrer')
  await select('second.png')
  expect(revoke).toHaveBeenCalledWith('blob:host-1')
  expect(revoke).not.toHaveBeenCalledWith('blob:host-2')
  wrapper.unmount()
  wrapper = undefined
  expect(revoke).toHaveBeenCalledWith('blob:host-2')
})

it('adds the full 48-note collection before presenting a bounded virtual window', async () => {
  wrapper = mount(FilesDemo, { attachTo: document.body })
  await wrapper
    .findAll('button')
    .find((b) => b.text() === '加入 48 份便笺')!
    .trigger('click')
  await flushPromises()
  expect(wrapper.get('[data-slot="file-upload-summary"]').text()).toContain('文件 (48/48)')
  expect(wrapper.find('[data-slot="file-upload-virtual-list"]').exists()).toBe(true)
  expect(wrapper.findAll('[data-slot="file-upload-row"]').length).toBeLessThan(48)
  expect(wrapper.find('[role="alert"]').exists()).toBe(false)
})

it('offers an invalid image URL separately from corrupt bytes for source recovery', async () => {
  wrapper = mount(FilesDemo)
  await wrapper.get('select[aria-label="预览内容"]').setValue('missing')
  await flushPromises()
  expect(wrapper.get('[data-testid="file-preview-image"]').attributes('src')).toBe(
    '/files/missing.png',
  )
})
