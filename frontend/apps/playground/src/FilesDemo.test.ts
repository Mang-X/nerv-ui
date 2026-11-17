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

it('keeps native mode and known fixture selection inert until explicit upload and waits for endpoint completion receipt', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
  vi.stubGlobal('fetch', fetcher)
  try {
    wrapper = mount(FilesDemo)
    await wrapper.get('[aria-label="传输方式"]').setValue('native')
    await flushPromises()
    expect(fetcher).not.toHaveBeenCalled()
    await wrapper
      .findAll('button')
      .find((b) => b.text() === '加入已知二进制夹具')!
      .trigger('click')
    await flushPromises()
    expect(fetcher).not.toHaveBeenCalled()
    expect(wrapper.get('[data-slot="file-upload-row"]').text()).toContain('native-fixture.bin')
    let confirm!: (r: Response) => void
    fetcher
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            uploadSessionId: 'fixture-1',
            fileId: 'fixture-1',
            uploadMode: 'server-proxy',
            provider: 'server-proxy',
            expiresAtUtc: '2099-01-01',
            upload: {
              url: '/__native-fixture/fixture-1',
              headers: { 'X-Fixture-Session': 'fixture-1' },
            },
          }),
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockImplementationOnce(
        () =>
          new Promise<Response>((r) => {
            confirm = r
          }),
      )
    await wrapper
      .findAll('button')
      .find((b) => b.text() === '开始原生上传')!
      .trigger('click')
    await flushPromises()
    expect(fetcher.mock.calls.map((c) => c[1].method)).toEqual(['POST', 'PUT', 'POST'])
    expect(wrapper.get('[aria-label="本机成功回执"]').text()).toBe('尚无本机成功回执')
    confirm(new Response(JSON.stringify({ fileId: 'confirmed-fixture' })))
    await flushPromises()
    expect(wrapper.get('[aria-label="本机成功回执"]').text()).toContain('confirmed-fixture')
    await wrapper.get('[aria-label="传输方式"]').setValue('memory')
    await flushPromises()
    expect(wrapper.get('[aria-label="传输计数"]').text()).toContain('create 0')
    expect(fetcher).toHaveBeenCalledTimes(3)
  } finally {
    vi.unstubAllGlobals()
  }
})

it('offers local PDF fixtures and owns a local PDF URL without upload writes', async () => {
  const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:local-pdf')
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  const fetcher = vi.fn()
  vi.stubGlobal('fetch', fetcher)
  try {
    wrapper = mount(FilesDemo, {
      global: {
        stubs: {
          FilePreview: {
            props: ['src', 'fileName', 'contentType'],
            template:
              '<div data-testid="preview-source">{{ src }} {{ fileName }} {{ contentType }}</div>',
          },
        },
      },
    })
    await wrapper.get('select[aria-label="预览内容"]').setValue('pdf-pages')
    expect(wrapper.get('[data-testid="preview-source"]').text()).toContain(
      '/files/reading-journey.pdf',
    )
    const input = wrapper.get('input[aria-label="预览本地图片"]')
    Object.defineProperty(input.element, 'files', {
      configurable: true,
      value: [new File(['%PDF'], 'local.pdf', { type: 'application/pdf' })],
    })
    await input.trigger('change')
    await flushPromises()
    expect(create).toHaveBeenCalledOnce()
    expect(wrapper.get('[data-testid="preview-source"]').text()).toContain(
      'blob:local-pdf local.pdf application/pdf',
    )
    expect(fetcher).not.toHaveBeenCalled()
    wrapper.unmount()
    wrapper = undefined
    expect(revoke).toHaveBeenCalledWith('blob:local-pdf')
  } finally {
    vi.unstubAllGlobals()
  }
})
