import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { FilePreview } from '@nerv-iip/ui/file-preview'

const control = vi.hoisted(() => ({ viewers: [] as any[] }))
// A controllable third-party boundary, deliberately delivers callbacks after destroy.
function fakeViewer() {
  return class {
    pageCount = 3
    slideCount = 3
    sheetCount = 3
    sheetNames = ['Inspection', 'Trend', 'Summary']
    destroy = vi.fn()
    finish!: () => void
    reject!: (error: Error) => void
    constructor(
      _host: unknown,
      public options: any,
    ) {
      control.viewers.push(this)
    }
    load() {
      return new Promise<void>((resolve, reject) => {
        this.finish = () => {
          this.options.onPageChange?.(0, 3)
          this.options.onSlideChange?.(0, 3)
          this.options.onReady?.(this.sheetNames)
          resolve()
        }
        this.reject = reject
      })
    }
  }
}
vi.mock('@silurus/ooxml/docx', () => ({ DocxViewer: fakeViewer() }))
vi.mock('@silurus/ooxml/pptx', () => ({ PptxViewer: fakeViewer() }))
vi.mock('@silurus/ooxml/xlsx', () => ({ XlsxViewer: fakeViewer() }))
vi.mock('motion-v', () => {
  const pass = defineComponent({
    setup(_, { slots }) {
      return () => h('div', slots.default?.())
    },
  })
  return { MotionConfig: pass, AnimatePresence: pass, motion: { div: pass } }
})
let wrapper: ReturnType<typeof mount> | undefined
beforeEach(() => {
  control.viewers = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      arrayBuffer: async () => new Uint8Array([0x50, 0x4b, 3, 4]).buffer,
    })),
  )
})
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
it.each(['docx', 'xlsx', 'pptx'])(
  'FilePreview isolates late %s load and error after a source switch',
  async (ext) => {
    wrapper = mount(FilePreview, { props: { src: '/old.' + ext, fileName: 'old.' + ext } })
    await vi.waitFor(() =>
      expect({ viewers: control.viewers.length, text: wrapper!.text() }).toEqual({
        viewers: 1,
        text: expect.any(String),
      }),
    )
    const old = control.viewers[0]
    expect(old).toBeDefined()
    await wrapper.setProps({ src: '/current.' + ext, fileName: 'current.' + ext })
    await vi.waitFor(() => expect(control.viewers).toHaveLength(2))
    const current = control.viewers[1]
    current.finish()
    await flushPromises()
    expect(wrapper.emitted('ready')).toEqual([['office-' + ext]])
    old.options.onError(new Error('obsolete document'))
    old.finish()
    await flushPromises()
    expect(wrapper.emitted('error')).toBeUndefined()
    expect(wrapper.emitted('ready')).toEqual([['office-' + ext]])
    expect(wrapper.find('[data-slot="file-preview-error"]').exists()).toBe(false)
    wrapper.unmount()
    wrapper = undefined
    expect(old.destroy).toHaveBeenCalledTimes(1)
  },
)
it.each(
  ['docx', 'xlsx', 'pptx'].flatMap((ext) =>
    ['source', 'type', 'leave'].map((change) => [ext, change]),
  ),
)('FilePreview discards a successful late %s source body after %s change', async (ext, change) => {
  let deliver!: (value: ArrayBuffer) => void
  const body = new Promise<ArrayBuffer>((resolve) => {
    deliver = resolve
  })
  const read = vi.fn(async (_url: string, _options: { signal: AbortSignal }) => ({
    ok: true,
    arrayBuffer: () => body,
  }))
  vi.stubGlobal('fetch', read)
  wrapper = mount(FilePreview, { props: { src: '/slow.' + ext, fileName: 'slow.' + ext } })
  await vi.waitFor(() => expect(read).toHaveBeenCalledTimes(1))
  const signal = read.mock.calls[0]?.[1]?.signal as AbortSignal
  expect(signal.aborted).toBe(false)
  if (change === 'leave') {
    wrapper.unmount()
    wrapper = undefined
  } else
    await wrapper.setProps({
      src: change === 'source' ? '/image.png' : '/slow.' + ext,
      fileName: 'image.png',
      contentType: 'image/png',
    })
  await flushPromises()
  expect(signal.aborted).toBe(true)
  deliver(new ArrayBuffer(8))
  await flushPromises()
  expect(control.viewers).toHaveLength(0)
  if (wrapper) {
    expect(wrapper.emitted('ready')).toBeUndefined()
    expect(wrapper.emitted('error')).toBeUndefined()
  }
})
it.each(['docx', 'xlsx', 'pptx'])(
  'FilePreview rejects non-ZIP %s bytes instead of reporting an empty document ready',
  async (ext) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new TextEncoder().encode('broken OOXML').buffer,
      })),
    )
    wrapper = mount(FilePreview, { props: { src: '/broken.' + ext, fileName: 'broken.' + ext } })
    await flushPromises()
    await flushPromises()
    control.viewers.forEach((viewer) => viewer.finish())
    await flushPromises()
    expect(wrapper.emitted('error')?.[0]?.[0]).toContain('有效的 OOXML')
    expect(wrapper.emitted('ready')).toBeUndefined()
  },
)
it.each([
  ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ['pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
])(
  'FilePreview requests %s bytes with a document Accept instead of an HTML fallback',
  async (ext, mime) => {
    wrapper = mount(FilePreview, {
      props: { src: '/document.' + ext, fileName: 'document.' + ext },
    })
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))
    expect(vi.mocked(fetch).mock.calls[0]?.[1]?.headers).toEqual({ Accept: mime })
  },
)
