import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import PreviewPanel from './PreviewPanel.vue'

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

it.each([
  { name: 'root PNG', base: '/', sample: 'png', src: '/files/garden.png' },
  { name: 'root JPEG', base: '/', sample: 'jpeg', src: '/files/coast.jpg' },
  {
    name: 'nested PNG',
    base: '/parent-proof/',
    sample: 'png',
    src: '/parent-proof/files/garden.png',
  },
  {
    name: 'nested JPEG',
    base: '/parent-proof/',
    sample: 'jpeg',
    src: '/parent-proof/files/coast.jpg',
  },
])(
  'previews $name at the public base URL and recovers after image failure',
  async ({ base, sample, src }) => {
    vi.stubEnv('BASE_URL', base)
    wrapper = mount(PreviewPanel)
    const select = wrapper.get('[aria-label="预览内容"]')
    await select.setValue(sample)
    await flushPromises()
    expect(wrapper.get('img').attributes('src')).toBe(src)
    await wrapper.get('img').trigger('load')
    expect(wrapper.get('[aria-label="预览事件"]').text()).toContain('ready image')
    await select.setValue('missing')
    await flushPromises()
    expect(wrapper.get('img').attributes('src')).toBe(base + 'files/missing.png')
    await wrapper.get('img').trigger('error')
    await flushPromises()
    expect(wrapper.get('[data-slot="file-preview-error"]').text()).toContain(
      '无法加载 missing.png。',
    )
    expect(wrapper.get('[aria-label="预览事件"]').text()).toContain('error 无法加载 missing.png。')
    await select.setValue(sample)
    await flushPromises()
    expect(wrapper.get('img').attributes('src')).toBe(src)
    expect(wrapper.find('[data-slot="file-preview-error"]').exists()).toBe(false)
    await wrapper.get('img').trigger('load')
    expect(wrapper.get('[aria-label="预览事件"]').text()).toContain('ready image')
  },
)

it('keeps nested SVG and corrupt-image fixtures distinct and recovers from a host source error', async () => {
  vi.stubEnv('BASE_URL', '/parent-proof/')
  wrapper = mount(PreviewPanel)
  expect(wrapper.get('img').attributes('src')).toBe('/parent-proof/files/quality-evidence.svg')
  await wrapper.get('[aria-label="预览内容"]').setValue('broken')
  await flushPromises()
  expect(wrapper.get('img').attributes('src')).toBe('/parent-proof/files/broken.png')
  await wrapper.get('img').trigger('error')
  await flushPromises()
  expect(wrapper.get('[data-slot="file-preview-error"]').text()).toContain('无法加载 broken.png。')
  await wrapper.get('[aria-label="预览内容"]').setValue('png')
  await flushPromises()
  const unavailable = wrapper.findAll('input[type="checkbox"]')[1]!
  await unavailable.setValue(true)
  expect(wrapper.get('[data-slot="file-preview-error"]').text()).toContain('来源暂不可用')
  await unavailable.setValue(false)
  await flushPromises()
  expect(wrapper.get('img').attributes('src')).toBe('/parent-proof/files/garden.png')
  await wrapper.get('img').trigger('load')
  expect(wrapper.get('[aria-label="预览事件"]').text()).toContain('ready image')
})

it.each([
  { name: 'text', sample: 'text', fileName: 'notes.txt' },
  { name: 'legacy', sample: 'legacy', fileName: 'legacy.doc' },
  { name: 'media', sample: 'media', fileName: 'recording.mp4' },
  { name: 'archive', sample: 'archive', fileName: 'collection.zip' },
])(
  'keeps the nested $name fixture unsupported and opens only the controlled base URL',
  async ({ sample, fileName }) => {
    vi.stubEnv('BASE_URL', '/parent-proof/')
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    wrapper = mount(PreviewPanel)
    await wrapper.get('[aria-label="预览内容"]').setValue(sample)
    await flushPromises()
    expect(wrapper.text()).toContain('暂不支持预览')
    expect(wrapper.find('img').exists()).toBe(false)
    await wrapper.get(`[aria-label="打开 ${fileName}"]`).trigger('click')
    expect(open).not.toHaveBeenCalled()
    await wrapper
      .findAll('button')
      .find((button) => button.text() === '打开本地原图')!
      .trigger('click')
    expect(open).toHaveBeenCalledWith(
      '/parent-proof/files/notes.txt',
      '_blank',
      'noopener,noreferrer',
    )
  },
)

it('keeps a local Blob URL unprefixed under the nested base and releases it on fixture replacement', async () => {
  vi.stubEnv('BASE_URL', '/parent-proof/')
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:known-local-image')
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  wrapper = mount(PreviewPanel)
  const input = wrapper.get('[aria-label="预览本地图片"]')
  Object.defineProperty(input.element, 'files', {
    configurable: true,
    value: [new File(['known image'], 'local.png', { type: 'image/png' })],
  })
  await input.trigger('change')
  await flushPromises()
  expect(wrapper.get('img').attributes('src')).toBe('blob:known-local-image')
  expect(revoke).not.toHaveBeenCalled()
  await wrapper.get('img').trigger('load')
  expect(wrapper.get('[aria-label="预览事件"]').text()).toContain('ready image')
  await wrapper.get('[aria-label="预览内容"]').setValue('jpeg')
  await flushPromises()
  expect(wrapper.get('img').attributes('src')).toBe('/parent-proof/files/coast.jpg')
  expect(revoke).toHaveBeenCalledWith('blob:known-local-image')
})
