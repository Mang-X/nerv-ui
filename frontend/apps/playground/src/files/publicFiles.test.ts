import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import {
  FileUpload,
  useFileUpload,
  getFilePreviewKind,
  isFilePreviewSupported,
  formatFilePreviewSize,
  type FileUploadExpose,
  type FileUploadVariant,
} from '@nerv-ui/ui'
import { FilePreview } from '@nerv-ui/ui/file-preview'
import { createMemoryUpload } from './memoryUpload'

const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => {
  wrappers.splice(0).forEach((w) => w.unmount())
  vi.restoreAllMocks()
})
function options(overrides = {}) {
  const adapter = createMemoryUpload()
  const completed = vi.fn(),
    rejected = vi.fn(),
    failed = vi.fn()
  return {
    adapter,
    completed,
    rejected,
    failed,
    props: {
      purpose: 'attachment',
      ownerService: 'host',
      ownerType: 'collection',
      ownerId: 'personal',
      organizationId: 'local',
      environmentId: 'memory',
      acceptedContentTypes: ['.txt'],
      maxFiles: 2,
      maxFileSizeBytes: 4,
      autoUpload: false,
      variant: 'queue' as FileUploadVariant,
      createUploadSession: adapter.createUploadSession,
      completeUploadSession: adapter.completeUploadSession,
      transport: adapter.transport,
      onCompleted: completed,
      onRejected: rejected,
      onFailed: failed,
      ...overrides,
    },
  }
}
const file = (name: string, type = 'text/plain', size = 4) =>
  new File(['x'.repeat(size)], name, { type })

it.each([
  ['no-extension', ' IMAGE/PNG ; charset=utf-8 ', 'image'],
  ['photo.PNG', '', 'image'],
  ['report.PDF', 'image/png', 'pdf'],
  ['photo.png', 'application/pdf; version=1.7', 'pdf'],
  ['note.docx', 'image/png', 'office-docx'],
  [
    'note',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'office-docx',
  ],
  ['table.xlsx', '', 'office-xlsx'],
  ['slides.pptx', '', 'office-pptx'],
  ['legacy.doc', '', 'unsupported'],
  ['legacy.xls', '', 'unsupported'],
  ['legacy.ppt', '', 'unsupported'],
  ['data.csv', 'text/csv', 'unsupported'],
  ['note.txt', 'text/plain', 'unsupported'],
  ['data.json', 'application/json', 'unsupported'],
  ['audio.mp3', 'audio/mpeg', 'unsupported'],
  ['movie.mp4', 'video/mp4', 'unsupported'],
  ['files.zip', 'application/zip', 'unsupported'],
  ['unknown', '', 'unsupported'],
])('classifies %s with %s through the stable root helper as %s', (name, mime, expected) => {
  expect(getFilePreviewKind(name, mime)).toBe(expected)
  expect(isFilePreviewSupported(name, mime)).toBe(expected !== 'unsupported')
})
it('formats absent, zero and binary size boundaries through the root helper', () => {
  expect(formatFilePreviewSize(undefined)).toBe('')
  expect(formatFilePreviewSize(0)).toBe('0 B')
  expect(formatFilePreviewSize(1023)).toBe('1023 B')
  expect(formatFilePreviewSize(1024)).toBe('1.0 KB')
})

it.each([
  ['.TXT', 'first.TXT', 'application/octet-stream'],
  ['text/plain', 'no-extension', 'text/plain'],
  ['image/*', 'no-extension', 'image/jpeg'],
  ['', 'anything.bin', 'application/octet-stream'],
])(
  'validates extension MIME wildcard and empty policy %s through picker and drop',
  async (accept, name, mime) => {
    const { props, adapter, rejected } = options({ acceptedContentTypes: accept ? [accept] : [] })
    const w = mount(FileUpload, { props })
    wrappers.push(w)
    const input = w.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { configurable: true, value: [file(name, mime)] })
    await input.trigger('change')
    await flushPromises()
    expect((input.element as HTMLInputElement).value).toBe('')
    expect(w.findAll('[data-slot="file-upload-row"][data-status="queued"]')).toHaveLength(1)
    await w
      .get('[data-slot="file-upload-dropzone"]')
      .trigger('drop', { dataTransfer: { files: [file(name, mime)] } })
    expect(w.findAll('[data-slot="file-upload-row"][data-status="queued"]')).toHaveLength(2)
    expect(rejected).not.toHaveBeenCalled()
    expect(adapter.state.counts).toEqual({
      create: 0,
      transport: 0,
      complete: 0,
      abort: 0,
      fail: 0,
    })
  },
)

it('rejects adjacent size, wrong type and excess count without creating successful receipts', async () => {
  const { props, adapter, completed, rejected } = options()
  const w = mount(FileUpload, { props })
  wrappers.push(w)
  const api = w.vm as unknown as FileUploadExpose
  await api.addFiles([
    file('oversize.txt', 'text/plain', 5),
    file('wrong.png', 'image/png'),
    file('at-boundary.txt'),
    file('second.txt'),
    file('excess.txt'),
  ])
  expect(rejected.mock.calls[0]![0]).toEqual([
    { fileName: 'oversize.txt', reason: '文件超过最大大小限制。' },
    { fileName: 'wrong.png', reason: '文件类型不符合要求。' },
    { fileName: 'excess.txt', reason: '已达到最大文件数量限制。' },
  ])
  expect(w.findAll('[data-slot="file-upload-row"][data-status="queued"]')).toHaveLength(2)
  expect(w.findAll('[data-slot="file-upload-row"][data-status="rejected"]')).toHaveLength(2)
  expect(completed).not.toHaveBeenCalled()
  expect(adapter.state.counts.create).toBe(0)
})

it('disabled guards picker browse and drop while the explicit ref and composable keep host authority', async () => {
  const { props, adapter } = options({ disabled: true })
  const w = mount(FileUpload, { props })
  wrappers.push(w)
  const api = w.vm as unknown as FileUploadExpose
  const picker = w.get('input[type="file"]')
  const clicked = vi.spyOn(picker.element as HTMLInputElement, 'click')
  api.browse()
  expect(clicked).not.toHaveBeenCalled()
  expect(picker.attributes('disabled')).toBeDefined()
  await w
    .get('[data-slot="file-upload-dropzone"]')
    .trigger('drop', { dataTransfer: { files: [file('ignored.txt')] } })
  expect(api.hasRows).toBe(false)
  await api.addFiles([file('explicit.txt')])
  expect(api.hasRows).toBe(true)
  expect(api.hasQueuedRows).toBe(true)
  expect(adapter.state.counts.create).toBe(0)
  const o = options()
  const publicUpload = useFileUpload({
    ...o.props,
    onCompleted: o.completed,
    onRejected: o.rejected,
    onFailed: o.failed,
  })
  await publicUpload.addFiles([file('direct.txt')])
  expect(publicUpload.rows[0]?.status).toBe('queued')
  expect(publicUpload.completedFiles.value).toEqual([])
  publicUpload.clear()
  expect(publicUpload.hasRows.value).toBe(false)
})

it.each<FileUploadVariant>(['default', 'queue', 'compact', 'avatar', 'gallery', 'table', 'image'])(
  'renders the public %s variant and releases library thumbnails on removal or clear',
  async (variant) => {
    let sequence = 0
    const create = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation(() => `blob:thumbnail-${++sequence}`)
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const { props } = options({ variant, acceptedContentTypes: ['image/*'] })
    const w = mount(FileUpload, { props })
    wrappers.push(w)
    const api = w.vm as unknown as FileUploadExpose
    await api.addFiles([file('photo.png', 'image/png')])
    await flushPromises()
    expect(w.get('[data-slot="file-upload"]').attributes('data-variant')).toBe(variant)
    expect(w.get('img').attributes('alt')).toBe('photo.png')
    expect(create).toHaveBeenCalledTimes(1)
    expect(revoke).not.toHaveBeenCalled()
    api.clear()
    await flushPromises()
    expect(revoke).toHaveBeenCalledWith('blob:thumbnail-1')
  },
)

it('subpath preview distinguishes empty loading error unsupported and image ready without opening a window', async () => {
  const open = vi.spyOn(window, 'open').mockImplementation(() => null)
  const w = mount(FilePreview, { props: { fileName: 'note.txt' } })
  wrappers.push(w)
  expect(w.text()).toContain('还没有可用的预览源')
  await w.setProps({ src: '/files/notes.txt' })
  await flushPromises()
  expect(w.text()).toContain('暂不支持预览')
  await w.get('[aria-label="打开 note.txt"]').trigger('click')
  expect(w.emitted('openSource')).toEqual([['/files/notes.txt']])
  expect(open).not.toHaveBeenCalled()
  expect(w.emitted('ready')).toBeUndefined()
  await w.setProps({ loading: true })
  await flushPromises()
  expect(w.find('[data-slot="skeleton"]').exists()).toBe(true)
  await w.setProps({ loading: false, error: '不可用' })
  await flushPromises()
  expect(w.get('[data-slot="file-preview-error"]').text()).toContain('不可用')
  await w.setProps({
    error: null,
    fileName: 'good.png',
    contentType: 'image/png',
    src: '/files/garden.png',
  })
  await flushPromises()
  await w.get('img').trigger('load')
  expect(w.emitted('ready')).toEqual([['image']])
  await w.get('img').trigger('error')
  await flushPromises()
  expect(w.emitted('error')?.[0]).toEqual(['无法加载 good.png。'])
  await w.setProps({ src: '/files/coast.jpg', fileName: 'coast.jpg' })
  await flushPromises()
  expect(w.find('[data-slot="file-preview-error"]').exists()).toBe(false)
  await w.get('img').trigger('load')
  expect(w.emitted('ready')).toHaveLength(2)
})

it('clamps image zoom to 20–300 percent and rotates both directions through public controls', async () => {
  const w = mount(FilePreview, { props: { src: '/files/garden.png', fileName: 'garden.png' } })
  wrappers.push(w)
  for (let i = 0; i < 12; i++) await w.get('[aria-label="缩小 garden.png"]').trigger('click')
  expect(w.get('[data-slot="file-preview-zoom"]').text()).toBe('20%')
  for (let i = 0; i < 32; i++) await w.get('[aria-label="放大 garden.png"]').trigger('click')
  expect(w.get('[data-slot="file-preview-zoom"]').text()).toBe('300%')
  await w.get('[aria-label="向右旋转 garden.png"]').trigger('click')
  expect(w.get('img').attributes('style')).toContain('rotate(90deg)')
  await w.get('[aria-label="向左旋转 garden.png"]').trigger('click')
  await w.get('[aria-label="向左旋转 garden.png"]').trigger('click')
  expect(w.get('img').attributes('style')).toContain('rotate(-90deg)')
})
