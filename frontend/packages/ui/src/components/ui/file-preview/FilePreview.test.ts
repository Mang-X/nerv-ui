import { flushPromises, mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { computed, defineComponent, h, onMounted, shallowRef } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FilePreview, getFilePreviewKindMeta } from '.'
import { NvSelect } from '../../pc/select'
import OfficePreview from './OfficePreview.vue'
import PdfPreview from './PdfPreview.vue'
import PdfPreviewDocument from './PdfPreviewDocument.vue'

const officeViewerMocks = vi.hoisted(() => ({
  docxOptions: [] as Array<{ width?: number }>,
  pptxOptions: [] as Array<{ width?: number }>,
  xlsxOptions: [] as Array<{ showZoomSlider?: boolean }>,
  docxRenderWidths: [] as number[],
  pptxRenderWidths: [] as number[],
}))

const pdfEngineMocks = vi.hoisted(() => ({
  engine: {} as Record<string, unknown> | null,
  isLoading: false,
  active: true,
  documentStatus: 'loaded',
  documentError: null as string | null,
  error: null as Error | null,
  pending: null as Promise<unknown> | null,
  initialize: false,
  openBuffer: vi.fn(),
}))

const pdfRenderMocks = vi.hoisted(() => ({
  pending: false,
  tasks: [] as Array<{ resolve: (blob: Blob) => void; abort: (reason: unknown) => void }>,
}))

const pdfRenderScale = shallowRef(1)
const pdfPageCount = shallowRef(1)
const pdfPageChange = shallowRef({ isChanging: false, targetPage: 1 })

const pdfScrollMocks = vi.hoisted(() => ({
  currentPage: 1,
  totalPages: 3,
  scrollToPage: vi.fn(),
  scrollToPreviousPage: vi.fn(),
  scrollToNextPage: vi.fn(),
}))

vi.mock('@embedpdf/core', () => ({
  createPluginRegistration: (pluginPackage: unknown, config?: unknown) => ({
    pluginPackage,
    config,
  }),
}))

vi.mock('@embedpdf/engines/pdfium-direct-engine', () => ({
  createPdfiumEngine: () => {
    if (pdfEngineMocks.pending) return pdfEngineMocks.pending
    if (pdfEngineMocks.error) return Promise.reject(pdfEngineMocks.error)
    if (pdfEngineMocks.isLoading) return new Promise(() => {})
    return Promise.resolve(pdfEngineMocks.engine)
  },
}))

vi.mock('@embedpdf/core/vue', () => ({
  EmbedPDF: defineComponent({
    name: 'EmbedPDF',
    props: ['engine', 'plugins', 'onInitialized'],
    setup(props, { slots }) {
      onMounted(() => {
        if (pdfEngineMocks.initialize)
          props.onInitialized?.({
            destroy: () => Promise.resolve(),
            getPlugin: () => ({
              provides: () => ({ openDocumentBuffer: pdfEngineMocks.openBuffer }),
            }),
          })
      })
      return () =>
        h(
          'div',
          { 'data-testid': 'embedpdf-provider' },
          slots.default?.({ activeDocumentId: pdfEngineMocks.active ? 'test-document' : null }),
        )
    },
  }),
  useDocumentState: () =>
    computed(() => ({
      scale: pdfRenderScale.value,
      pageRefreshVersions: {},
      status: pdfEngineMocks.documentStatus,
      error: pdfEngineMocks.documentError,
    })),
}))

vi.mock('@embedpdf/plugin-document-manager/vue', () => ({
  DocumentManagerPluginPackage: {},
  DocumentContent: defineComponent({
    name: 'DocumentContent',
    props: ['documentId'],
    setup(_props, { slots }) {
      const documentState = { status: 'loaded', error: null }

      return () =>
        h(
          'div',
          { 'data-testid': 'embedpdf-document-content' },
          slots.default?.({
            documentState,
            isLoading: false,
            isError: false,
            isLoaded: true,
          }),
        )
    },
  }),
}))

const viewportMock = vi.hoisted(() => ({
  register: vi.fn(),
  unregister: vi.fn(),
  resize: vi.fn(),
  scroll: vi.fn(),
  unsubscribe: vi.fn(),
  subscribe: vi.fn(),
}))
vi.mock('@embedpdf/plugin-viewport/vue', () => ({
  useIsViewportGated: () => shallowRef(false),
  useViewportCapability: () => ({ provides: shallowRef({ getViewportGap: () => 10 }) }),
  useViewportPlugin: () => ({
    plugin: shallowRef({
      registerViewport: viewportMock.register,
      unregisterViewport: viewportMock.unregister,
      setViewportResizeMetrics: viewportMock.resize,
      setViewportScrollMetrics: viewportMock.scroll,
      onScrollRequest: viewportMock.subscribe,
    }),
  }),
  ViewportPluginPackage: {},
  Viewport: defineComponent({
    name: 'Viewport',
    props: ['documentId'],
    setup(_props, { slots }) {
      return () => h('div', { 'data-testid': 'embedpdf-viewport' }, slots.default?.())
    },
  }),
}))

vi.mock('@embedpdf/plugin-scroll/vue', () => ({
  ScrollPluginPackage: {},
  ScrollStrategy: { Vertical: 'vertical' },
  Scroller: defineComponent({
    name: 'Scroller',
    props: ['documentId'],
    setup(_props, { slots }) {
      return () =>
        h(
          'div',
          { 'data-testid': 'embedpdf-scroller' },
          Array.from({ length: pdfPageCount.value }, (_, pageIndex) =>
            slots.default?.({
              page: {
                pageIndex,
                width: 320,
                height: 420,
              },
            }),
          ),
        )
    },
  }),
  useScroll: () => ({
    provides: computed(() => ({
      scrollToPage: pdfScrollMocks.scrollToPage,
      scrollToPreviousPage: pdfScrollMocks.scrollToPreviousPage,
      scrollToNextPage: pdfScrollMocks.scrollToNextPage,
      getPageChangeState: () => pdfPageChange.value,
    })),
    state: computed(() => ({
      currentPage: pdfScrollMocks.currentPage,
      totalPages: pdfScrollMocks.totalPages,
    })),
  }),
}))

vi.mock('@embedpdf/plugin-render/vue', () => ({
  RenderPluginPackage: {},
  useRenderCapability: () => ({
    provides: shallowRef({
      forDocument: () => ({
        renderPage: () => ({
          wait(resolve: (blob: Blob) => void) {
            const task = { resolve, abort: vi.fn() }
            pdfRenderMocks.tasks.push(task)
            if (!pdfRenderMocks.pending) resolve(new Blob(['bitmap'], { type: 'image/png' }))
          },
          abort(reason: unknown) {
            pdfRenderMocks.tasks.at(-1)?.abort(reason)
          },
        }),
      }),
    }),
  }),
}))

vi.mock('@embedpdf/plugin-zoom/vue', () => ({
  ZoomMode: { FitWidth: 'fit-width' },
  ZoomPluginPackage: {},
  useZoom: () => ({
    provides: computed(() => ({
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      requestZoom: vi.fn(),
    })),
    state: shallowRef({
      currentZoomLevel: 1,
    }),
  }),
}))

vi.mock('@silurus/ooxml/docx', () => ({
  DocxViewer: class {
    pageCount = 2
    _opts: { width?: number; onPageChange?: (index: number, count: number) => void }

    constructor(
      public canvas: HTMLCanvasElement,
      private options: { width?: number; onPageChange?: (index: number, count: number) => void },
    ) {
      this._opts = options
      officeViewerMocks.docxOptions.push(options)
    }

    async load() {
      this.options.onPageChange?.(0, this.pageCount)
    }

    async nextPage() {}

    async prevPage() {}

    async goToPage(index: number) {
      this.options.onPageChange?.(index, this.pageCount)
    }

    async _render() {
      officeViewerMocks.docxRenderWidths.push(this._opts.width ?? 0)
    }

    destroy() {}
  },
}))

vi.mock('@silurus/ooxml/pptx', () => ({
  PptxViewer: class {
    slideCount = 3
    opts: { width?: number; onSlideChange?: (index: number, count: number) => void }

    constructor(
      public canvas: HTMLCanvasElement,
      private options: { width?: number; onSlideChange?: (index: number, count: number) => void },
    ) {
      this.opts = options
      officeViewerMocks.pptxOptions.push(options)
    }

    async load() {
      this.options.onSlideChange?.(0, this.slideCount)
    }

    async nextSlide() {}

    async prevSlide() {}

    async goToSlide(index: number) {
      this.options.onSlideChange?.(index, this.slideCount)
    }

    async renderCurrentSlide() {
      officeViewerMocks.pptxRenderWidths.push(this.opts.width ?? 0)
    }

    destroy() {}
  },
}))

vi.mock('@silurus/ooxml/xlsx', () => ({
  XlsxViewer: class {
    sheetNames = ['Summary', 'Details']
    sheetCount = 2

    constructor(
      public container: HTMLElement,
      private options: {
        showZoomSlider?: boolean
        onReady?: (names: string[]) => void
        onSheetChange?: (index: number, count: number) => void
      },
    ) {
      officeViewerMocks.xlsxOptions.push(options)
    }

    async load() {
      this.options.onReady?.(this.sheetNames)
      this.options.onSheetChange?.(0, this.sheetCount)
    }

    async goToSheet(index: number) {
      this.options.onSheetChange?.(index, this.sheetCount)
    }

    destroy() {}
  },
}))

vi.mock('motion-v', () => {
  const passthrough = (testId: string) =>
    defineComponent({
      name: testId,
      props: ['initial', 'animate', 'exit', 'transition', 'reducedMotion', 'mode'],
      setup(_props, { slots }) {
        return () => h('div', { 'data-testid': testId }, slots.default?.())
      },
    })

  return {
    AnimatePresence: passthrough('animate-presence'),
    MotionConfig: passthrough('motion-config'),
    motion: {
      div: passthrough('motion-div'),
      img: defineComponent({
        name: 'motion-img',
        props: ['src', 'alt', 'initial', 'animate', 'transition', 'style'],
        setup(props, { attrs }) {
          return () =>
            h('img', {
              ...attrs,
              alt: props.alt,
              src: props.src,
              style: props.style,
            })
        },
      }),
    },
  }
})

describe('FilePreview', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    pdfRenderScale.value = 1
    pdfPageCount.value = 1
    pdfPageChange.value = { isChanging: false, targetPage: 1 }
    pdfRenderMocks.pending = false
    pdfRenderMocks.tasks = []
    let bitmap = 0
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL = vi.fn(() => 'blob:bitmap-' + ++bitmap)
        static revokeObjectURL = vi.fn()
      },
    )
    for (const mock of Object.values(viewportMock)) mock.mockClear()
    viewportMock.subscribe.mockImplementation(() => viewportMock.unsubscribe)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => new Uint8Array([0x50, 0x4b, 3, 4]).buffer,
      })),
    )
    officeViewerMocks.docxOptions = []
    officeViewerMocks.pptxOptions = []
    officeViewerMocks.xlsxOptions = []
    officeViewerMocks.docxRenderWidths = []
    officeViewerMocks.pptxRenderWidths = []
    pdfEngineMocks.engine = {
      closeAllDocuments: () => ({ wait: (done: () => void) => done() }),
      destroy: vi.fn(),
    }
    pdfEngineMocks.initialize = false
    pdfEngineMocks.openBuffer.mockReset()
    pdfEngineMocks.isLoading = false
    pdfEngineMocks.pending = null
    pdfEngineMocks.error = null
    pdfEngineMocks.active = true
    pdfEngineMocks.documentStatus = 'loaded'
    pdfEngineMocks.documentError = null
    pdfScrollMocks.currentPage = 1
    pdfScrollMocks.totalPages = 3
    pdfScrollMocks.scrollToPage.mockClear()
    pdfScrollMocks.scrollToPreviousPage.mockClear()
    pdfScrollMocks.scrollToNextPage.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('recognizes PDF files without storage coupling', async () => {
    const wrapper = mount(FilePreview, {
      props: {
        src: '/files/inspection.pdf',
        fileName: 'inspection.pdf',
        contentType: 'application/pdf',
      },
    })

    expect(wrapper.text()).toContain('PDF')
    expect(Object.keys(wrapper.props())).not.toContain('fileId')
    expect(Object.keys(wrapper.props())).not.toContain('downloadFile')
    expect(Object.keys(wrapper.props())).not.toContain('apiClient')
  })

  it('assigns distinguishable color accents by preview kind', () => {
    expect(getFilePreviewKindMeta('pdf').iconClass).toContain('text-red')
    expect(getFilePreviewKindMeta('office-docx').iconClass).toContain('text-blue')
    expect(getFilePreviewKindMeta('office-xlsx').iconClass).toContain('text-emerald')
    expect(getFilePreviewKindMeta('office-pptx').iconClass).toContain('text-orange')
    expect(getFilePreviewKindMeta('image').iconClass).toContain('text-violet')
    expect(getFilePreviewKindMeta('pdf').icon).not.toBe(getFilePreviewKindMeta('office-docx').icon)
  })

  it('renders PDF with headless embedpdf layers and the unified toolbar', async () => {
    const wrapper = mount(PdfPreview, {
      props: {
        src: '/files/inspection.pdf',
      },
    })

    await flushPromises()
    expect(wrapper.get('[data-slot="file-preview-pdf-toolbar"]')).toBeTruthy()
    expect(wrapper.get('button[aria-label="上一页"]')).toBeTruthy()
    expect(wrapper.get('button[aria-label="下一页"]')).toBeTruthy()
    expect(wrapper.get('button[aria-label="放大 PDF"]')).toBeTruthy()
    expect(wrapper.get('button[aria-label="缩小 PDF"]')).toBeTruthy()
    expect(wrapper.get('button[aria-label="适应 PDF 宽度"]')).toBeTruthy()
    expect(wrapper.get('[data-slot="file-preview-pdf-page"] img').attributes('src')).toBe(
      'blob:bitmap-1',
    )
    expect(wrapper.get('[data-slot="file-preview-pdf-zoom"]').text()).toBe('100%')
    expect(wrapper.find('[data-testid="embedpdf-viewer"]').exists()).toBe(false)
  })

  it('allows jumping PDF pages from the unified toolbar', async () => {
    const wrapper = mount(PdfPreview, {
      props: {
        src: '/files/inspection.pdf',
      },
    })

    await flushPromises()
    const pageSelect = wrapper.getComponent(NvSelect)
    pageSelect.vm.$emit('update:modelValue', '3')
    await flushPromises()

    expect(pdfScrollMocks.scrollToPage).toHaveBeenCalledWith({
      pageNumber: 3,
      behavior: 'smooth',
    })
    expect(pdfScrollMocks.scrollToNextPage).not.toHaveBeenCalled()
    expect(pdfScrollMocks.scrollToPreviousPage).not.toHaveBeenCalled()
  })

  it('reports PDF initialization failure instead of indefinite loading', async () => {
    pdfEngineMocks.engine = null
    pdfEngineMocks.error = new Error('WASM unavailable')
    const wrapper = mount(PdfPreview, { props: { src: '/files/inspection.pdf' } })
    await flushPromises()
    expect(wrapper.text()).toContain('WASM unavailable')
    expect(wrapper.text()).not.toContain('正在加载 PDF 预览')
    expect(wrapper.emitted('error')?.[0]?.[0]).toBe('WASM unavailable')
    expect(wrapper.emitted('ready')).toBeUndefined()
    wrapper.unmount()
  })

  it('reports PDF document failure before activation', async () => {
    pdfEngineMocks.active = false
    pdfEngineMocks.documentStatus = 'error'
    pdfEngineMocks.documentError = 'Invalid PDF bytes'
    const wrapper = mount(PdfPreview, { props: { src: '/files/broken.pdf' } })
    await flushPromises()
    expect(wrapper.emitted('error')?.[0]?.[0]).toBe('Invalid PDF bytes')
    expect(wrapper.emitted('ready')).toBeUndefined()
    wrapper.unmount()
  })

  it('ignores obsolete PDF status while switching sources', async () => {
    const wrapper = mount(FilePreview, { props: { src: '/files/old.pdf', fileName: 'report.pdf' } })
    await flushPromises()
    await wrapper.setProps({ src: '/files/current.pdf' })
    await flushPromises()
    const readyCount = wrapper.emitted('ready')?.length ?? 0
    const pdf = wrapper.getComponent(PdfPreview)
    // Simulate retained async renderer notifications tagged with their originating source.
    pdf.vm.$emit('ready', '/files/old.pdf')
    pdf.vm.$emit('error', 'obsolete document failure', '/files/old.pdf')
    await flushPromises()
    expect(wrapper.emitted('ready')?.length ?? 0).toBe(readyCount)
    expect(wrapper.emitted('error')).toBeUndefined()
    expect(wrapper.text()).not.toContain('obsolete document failure')
    wrapper.unmount()
  })

  it('disposes a PDF engine that resolves after unmount without late events', async () => {
    let resolve!: (value: unknown) => void
    pdfEngineMocks.pending = new Promise((done) => {
      resolve = done
    })
    const engine = {
      closeAllDocuments: vi.fn(() => ({ wait: (done: () => void) => done() })),
      destroy: vi.fn(),
    }
    const wrapper = mount(PdfPreview, { props: { src: '/files/slow.pdf' } })
    await flushPromises()
    wrapper.unmount()
    resolve(engine)
    await flushPromises()
    expect(engine.closeAllDocuments).toHaveBeenCalledOnce()
    expect(engine.destroy).toHaveBeenCalledOnce()
    expect(wrapper.emitted('ready')).toBeUndefined()
    expect(wrapper.emitted('error')).toBeUndefined()
  })

  it('cancels a PDF body read on unmount without allocating a late document', async () => {
    pdfEngineMocks.initialize = true
    let finishBody!: (value: ArrayBuffer) => void
    const body = new Promise<ArrayBuffer>((resolve) => {
      finishBody = resolve
    })
    const arrayBuffer = vi.fn(() => body)
    const fetcher = vi.fn(async () => ({ ok: true, arrayBuffer }))
    vi.stubGlobal('fetch', fetcher)
    const wrapper = mount(FilePreview, { props: { src: '/files/slow.pdf', fileName: 'slow.pdf' } })
    await flushPromises()
    expect(arrayBuffer).toHaveBeenCalledOnce()
    const signal = (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].signal!
    wrapper.unmount()
    expect(signal.aborted).toBe(true)
    finishBody(new ArrayBuffer(1129))
    await flushPromises()
    expect(pdfEngineMocks.openBuffer).not.toHaveBeenCalled()
    expect(wrapper.emitted('error')).toBeUndefined()
  })

  it('releases the PDF page jump timer on unmount and disables page boundaries', async () => {
    const wrapper = mount(PdfPreview, { props: { src: '/files/inspection.pdf' } })
    await flushPromises()
    expect(wrapper.get('button[aria-label="上一页"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="下一页"]').attributes('disabled')).toBeUndefined()
    vi.useFakeTimers()
    wrapper.getComponent(NvSelect).vm.$emit('update:modelValue', '3')
    expect(vi.getTimerCount()).toBe(1)
    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
    vi.useRealTimers()
    pdfScrollMocks.currentPage = 3
    const last = mount(PdfPreview, { props: { src: '/files/inspection.pdf' } })
    await flushPromises()
    expect(last.get('button[aria-label="下一页"]').attributes('disabled')).toBeDefined()
    expect(last.get('button[aria-label="上一页"]').attributes('disabled')).toBeUndefined()
    last.unmount()
  })

  it('keeps the first PDF next page visible when pending fit requests change its layout', async () => {
    pdfPageCount.value = 3
    const frames = new Map<number, FrameRequestCallback>()
    let nextFrame = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback)
      return nextFrame
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
    let request: (position: { x: number; y: number; behavior: ScrollBehavior }) => void
    viewportMock.subscribe.mockImplementation((_id, listener) => {
      request = listener
      return viewportMock.unsubscribe
    })
    const wrapper = mount(FilePreview, {
      props: { src: '/files/reading-journey.pdf', fileName: 'reading-journey.pdf' },
    })
    await flushPromises()
    const viewport = wrapper.get('[data-slot="file-preview-pdf-viewport"]').element as HTMLElement
    // jsdom has no layout or scrolling. Model a three-page document at the DOM boundary.
    const rect = (top: number) => ({ top, left: 0, width: 320, height: 400 }) as DOMRect
    vi.spyOn(viewport, 'getBoundingClientRect').mockImplementation(() => rect(100))
    Object.defineProperty(viewport, 'scrollTo', {
      value: ({ top }: ScrollToOptions) => {
        viewport.scrollTop = top ?? 0
      },
    })
    for (const page of wrapper.findAll<HTMLElement>('[data-page-number]')) {
      vi.spyOn(page.element, 'getBoundingClientRect').mockImplementation(() =>
        rect(
          110 +
            (Number(page.attributes('data-page-number')) - 1) * 800 * pdfRenderScale.value -
            viewport.scrollTop,
        ),
      )
    }
    pdfScrollMocks.scrollToNextPage.mockImplementationOnce(() => {
      pdfPageChange.value = { isChanging: true, targetPage: 2 }
      request({ x: 10, y: 810, behavior: 'smooth' })
      // The external fit plugin updates scale then requests its old top position.
      pdfRenderScale.value = 0.9
      request({ x: 0, y: 0.5, behavior: 'instant' as ScrollBehavior })
    })
    await wrapper.get('button[aria-label="下一页"]').trigger('click')
    for (const [id, callback] of frames) {
      frames.delete(id)
      callback(0)
    }
    const second = wrapper.get('[data-page-number="2"]').element
    expect(second.getBoundingClientRect().top - viewport.getBoundingClientRect().top).toBe(0)
    expect(viewport.scrollTop).toBe(730)
    wrapper.unmount()
    expect(frames.size).toBe(0)
  })

  it('disconnects the PDF viewport observer and scroll subscription on unmount', async () => {
    const disconnect = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect = disconnect
      },
    )
    const wrapper = mount(PdfPreviewDocument, { props: { documentId: 'viewport-document' } })
    await flushPromises()
    wrapper.unmount()
    expect(disconnect).toHaveBeenCalledOnce()
    expect(viewportMock.unregister).toHaveBeenCalledWith('viewport-document')
    expect(viewportMock.unsubscribe).toHaveBeenCalledOnce()
  })

  it('honors ordinary PDF zoom scroll requests outside a page transition', async () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      frames.push(callback),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    let request: (position: { x: number; y: number }) => void
    viewportMock.subscribe.mockImplementation((_id, listener) => {
      request = listener
      return viewportMock.unsubscribe
    })
    const wrapper = mount(FilePreview, {
      props: { src: '/files/reading-journey.pdf', fileName: 'reading-journey.pdf' },
    })
    await flushPromises()
    const viewport = wrapper.get('[data-slot="file-preview-pdf-viewport"]').element as HTMLElement
    const scrollTo = vi.fn(({ left, top }: ScrollToOptions) => {
      viewport.scrollLeft = left ?? 0
      viewport.scrollTop = top ?? 0
    })
    Object.defineProperty(viewport, 'scrollTo', { value: scrollTo })
    request!({ x: 25, y: 140 })
    for (const callback of frames) callback(0)
    expect(viewport.scrollLeft).toBe(25)
    expect(viewport.scrollTop).toBe(140)
    wrapper.unmount()
  })

  it('cancels pending PDF navigation frames when its source is replaced', async () => {
    const frames = new Map<number, FrameRequestCallback>()
    let nextFrame = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback)
      return nextFrame
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
    let request: (position: { x: number; y: number }) => void
    viewportMock.subscribe.mockImplementation((_id, listener) => {
      request = listener
      return viewportMock.unsubscribe
    })
    const wrapper = mount(FilePreview, {
      props: { src: '/files/reading-journey.pdf', fileName: 'reading-journey.pdf' },
    })
    await flushPromises()
    request!({ x: 0, y: 800 })
    expect(frames.size).toBe(1)
    await wrapper.setProps({ src: '/files/garden.png', fileName: 'garden.png' })
    await flushPromises()
    expect(frames.size).toBe(0)
    expect(viewportMock.unsubscribe).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('releases the PDF bitmap URL when leaving before image load', async () => {
    const wrapper = mount(FilePreview, {
      props: { src: '/files/inspection.pdf', fileName: 'inspection.pdf' },
    })
    await flushPromises()
    const url = wrapper.get('[data-slot="file-preview-pdf-page"] img').attributes('src')
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(url)
    wrapper.unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(url)
  })

  it('keeps a loaded PDF bitmap alive until its owner unmounts', async () => {
    const wrapper = mount(FilePreview, {
      props: { src: '/files/inspection.pdf', fileName: 'inspection.pdf' },
    })
    await flushPromises()
    const image = wrapper.get('[data-slot="file-preview-pdf-page"] img')
    const url = image.attributes('src')
    await image.trigger('load')
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(url)
    wrapper.unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith(url)
  })

  it('releases undecoded PDF bitmaps on rapid zoom and source replacement', async () => {
    const wrapper = mount(FilePreview, {
      props: { src: '/files/inspection.pdf', fileName: 'inspection.pdf' },
    })
    await flushPromises()
    const first = wrapper.get('[data-slot="file-preview-pdf-page"] img').attributes('src')
    pdfRenderScale.value = 2
    await flushPromises()
    const second = wrapper.get('[data-slot="file-preview-pdf-page"] img').attributes('src')
    expect(second).not.toBe(first)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(first)
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(second)
    await wrapper.setProps({ src: '/files/current.pdf' })
    await flushPromises()
    const third = wrapper.get('[data-slot="file-preview-pdf-page"] img').attributes('src')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(second)
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(third)
    wrapper.unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(third)
  })

  it('aborts a pending PDF render and ignores its late bitmap after unmount', async () => {
    pdfRenderMocks.pending = true
    const wrapper = mount(FilePreview, {
      props: { src: '/files/inspection.pdf', fileName: 'inspection.pdf' },
    })
    await flushPromises()
    const task = pdfRenderMocks.tasks.at(-1)!
    expect(task).toBeDefined()
    wrapper.unmount()
    expect(task.abort).toHaveBeenCalledOnce()
    const allocationsBeforeLateBitmap = vi.mocked(URL.createObjectURL).mock.calls.length
    task.resolve(new Blob(['late bitmap'], { type: 'image/png' }))
    await flushPromises()
    expect(URL.createObjectURL).toHaveBeenCalledTimes(allocationsBeforeLateBitmap)
  })

  it('cancels an obsolete PDF fetch and keeps the current source active', async () => {
    pdfEngineMocks.initialize = true
    let finishFetch!: (response: unknown) => void
    const oldFetch = new Promise((resolve) => {
      finishFetch = resolve
    })
    const oldBody = vi.fn(async () => new ArrayBuffer(1129))
    const fetcher = vi.fn((source: string) =>
      source.includes('old')
        ? oldFetch
        : Promise.resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(2048) }),
    )
    vi.stubGlobal('fetch', fetcher)
    pdfEngineMocks.openBuffer.mockReturnValue({
      toPromise: async () => ({ task: { toPromise: async () => ({ id: 'current' }) } }),
    })
    const wrapper = mount(FilePreview, { props: { src: '/files/old.pdf', fileName: 'report.pdf' } })
    await flushPromises()
    const signal = (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].signal!
    await wrapper.setProps({ src: '/files/current.pdf' })
    await flushPromises()
    expect(signal.aborted).toBe(true)
    expect(pdfEngineMocks.openBuffer).toHaveBeenCalledOnce()
    expect(pdfEngineMocks.openBuffer.mock.calls[0]?.[0].buffer.byteLength).toBe(2048)
    finishFetch({ ok: true, arrayBuffer: oldBody })
    await flushPromises()
    expect(oldBody).not.toHaveBeenCalled()
    expect(pdfEngineMocks.openBuffer).toHaveBeenCalledOnce()
    expect(wrapper.emitted('error')).toBeUndefined()
    wrapper.unmount()
  })

  it('closes a queued PDF open that completes after unmount before destroying the engine', async () => {
    pdfEngineMocks.initialize = true
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(1129) })),
    )
    let finishOpen!: (doc: { id: string }) => void
    const opening = new Promise<{ id: string }>((resolve) => {
      finishOpen = resolve
    })
    pdfEngineMocks.openBuffer.mockReturnValue({
      toPromise: async () => ({ task: { toPromise: () => opening } }),
    })
    const closeDocument = vi.fn(() => ({ toPromise: async () => true }))
    const destroy = vi.fn()
    pdfEngineMocks.engine = {
      closeDocument,
      destroy,
      closeAllDocuments: () => ({ wait: (done: () => void) => done() }),
    }
    const wrapper = mount(FilePreview, {
      props: { src: '/files/inspection.pdf', fileName: 'inspection.pdf' },
    })
    await flushPromises()
    expect(pdfEngineMocks.openBuffer).toHaveBeenCalledOnce()
    wrapper.unmount()
    await flushPromises()
    expect(destroy).not.toHaveBeenCalled()
    const doc = { id: 'late document' }
    finishOpen(doc)
    await flushPromises()
    expect(closeDocument).toHaveBeenCalledExactlyOnceWith(doc)
    expect(destroy).toHaveBeenCalledOnce()
    expect(wrapper.emitted('error')).toBeUndefined()
  })

  it('uses localized PDF loading copy', () => {
    pdfEngineMocks.engine = null
    pdfEngineMocks.isLoading = true

    const wrapper = mount(PdfPreview, {
      props: {
        src: '/files/inspection.pdf',
      },
    })

    expect(wrapper.text()).toContain('正在加载 PDF 预览')
    expect(wrapper.text()).not.toContain('Loading PDF preview')
  })

  it('renders a self-contained image preview with direct zoom controls', async () => {
    const wrapper = mount(FilePreview, {
      props: {
        src: '/files/evidence.png',
        fileName: 'evidence.png',
        contentType: 'image/png',
      },
    })

    expect(wrapper.get('[data-testid="file-preview-image"]').attributes('src')).toBe(
      '/files/evidence.png',
    )
    expect(wrapper.get('button[aria-label="放大 evidence.png"]')).toBeTruthy()
    expect(wrapper.get('button[aria-label="缩小 evidence.png"]')).toBeTruthy()
    expect(wrapper.get('button[aria-label="向左旋转 evidence.png"]')).toBeTruthy()
    expect(wrapper.get('button[aria-label="向右旋转 evidence.png"]')).toBeTruthy()

    await wrapper.get('button[aria-label="放大 evidence.png"]').trigger('click')

    expect(wrapper.get('[data-slot="file-preview-zoom"]').text()).toBe('110%')
  })

  it('emits source and ready events from the unified wrapper', async () => {
    const wrapper = mount(FilePreview, {
      props: {
        src: '/files/evidence.png',
        fileName: 'evidence.png',
        contentType: 'image/png',
      },
    })

    expect(wrapper.emitted('ready')).toBeUndefined()

    await wrapper.get('[data-testid="file-preview-image"]').trigger('load')
    await wrapper.get('button[aria-label="打开 evidence.png"]').trigger('click')

    expect(wrapper.emitted('ready')?.[0]).toEqual(['image'])
    expect(wrapper.emitted('openSource')?.[0]).toEqual(['/files/evidence.png'])
  })

  it('surfaces image load errors through the unified error state', async () => {
    const wrapper = mount(FilePreview, {
      props: {
        src: '/files/missing.png',
        fileName: 'missing.png',
        contentType: 'image/png',
      },
    })

    await wrapper.get('[data-testid="file-preview-image"]').trigger('error')

    expect(wrapper.emitted('error')?.[0]).toEqual(['无法加载 missing.png。'])
    expect(wrapper.text()).toContain('预览失败')
    expect(wrapper.text()).toContain('无法加载 missing.png。')
  })

  it('clears child preview errors when the same source is retried', async () => {
    const wrapper = mount(FilePreview, {
      props: {
        src: '/files/missing.png',
        fileName: 'missing.png',
        contentType: 'image/png',
      },
    })

    await wrapper.get('[data-testid="file-preview-image"]').trigger('error')
    expect(wrapper.text()).toContain('预览失败')

    await wrapper.setProps({ loading: true })
    await wrapper.setProps({ loading: false })
    await flushPromises()

    expect(wrapper.text()).not.toContain('预览失败')
    expect(wrapper.find('[data-testid="file-preview-image"]').exists()).toBe(true)
  })

  it('uses a distinct empty-source state', () => {
    const wrapper = mount(FilePreview, {
      props: {
        fileName: 'work-instruction.pdf',
        contentType: 'application/pdf',
      },
    })

    expect(wrapper.text()).toContain('还没有可用的预览源')
    expect(wrapper.find('button[aria-label="打开 work-instruction.pdf"]').exists()).toBe(false)
  })

  it('uses an unsupported state with a Chinese source action for unpreviewable files', async () => {
    const wrapper = mount(FilePreview, {
      props: {
        src: '/files/legacy.doc',
        fileName: 'legacy.doc',
        contentType: 'application/msword',
      },
    })

    expect(wrapper.text()).toContain('暂不支持预览')
    expect(wrapper.text()).toContain('legacy.doc')
    await wrapper
      .get('[data-slot="file-preview-unsupported"] button[aria-label="打开 legacy.doc"]')
      .trigger('click')
    expect(wrapper.emitted('openSource')?.[0]).toEqual(['/files/legacy.doc'])
  })

  it('keeps office canvas stable when reloading a canvas-backed document', async () => {
    const wrapper = mount(OfficePreview, {
      props: {
        src: '/files/work-instruction.docx',
        kind: 'office-docx',
      },
    })

    await flushPromises()
    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(wrapper.get('button[aria-label="缩小文档"]')).toBeTruthy()
    expect(wrapper.get('button[aria-label="上一页"]')).toBeTruthy()
    expect(wrapper.get('button[aria-label="下一页"]')).toBeTruthy()

    await wrapper.setProps({ src: '/files/work-instruction-v2.docx' })
    await flushPromises()

    expect(wrapper.find('canvas').exists()).toBe(true)
    expect(wrapper.emitted('error')).toBeUndefined()
  })

  it('does not compress canvas-backed office documents with CSS', async () => {
    const wrapper = mount(OfficePreview, {
      props: {
        src: '/files/work-instruction.docx',
        kind: 'office-docx',
      },
    })

    await flushPromises()

    const canvas = wrapper.get('canvas')
    expect(canvas.classes()).toContain('max-w-none')
    expect(canvas.classes()).not.toContain('max-w-full')
  })

  it('fits canvas-backed office documents to the available viewer width', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(640)

    mount(OfficePreview, {
      props: {
        src: '/files/work-instruction.docx',
        kind: 'office-docx',
      },
    })
    mount(OfficePreview, {
      props: {
        src: '/files/review.pptx',
        kind: 'office-pptx',
      },
    })

    await flushPromises()
    await flushPromises()

    expect(officeViewerMocks.docxOptions.at(-1)?.width).toBe(640)
    expect(officeViewerMocks.pptxOptions.at(-1)?.width).toBe(640)
  })

  it('rerenders canvas-backed office documents on resize without reloading the viewer', async () => {
    vi.useFakeTimers()

    let resizeCallback: ResizeObserverCallback | undefined
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resizeCallback = callback
        }

        observe() {}

        disconnect() {}
      },
    )
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    let measuredWidth = 640
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => measuredWidth)

    mount(OfficePreview, {
      props: {
        src: '/files/review.pptx',
        kind: 'office-pptx',
      },
    })

    await flushPromises()

    measuredWidth = 720
    resizeCallback?.([], {} as ResizeObserver)
    await vi.advanceTimersByTimeAsync(200)
    await flushPromises()

    expect(officeViewerMocks.pptxOptions).toHaveLength(1)
    expect(officeViewerMocks.pptxRenderWidths).toEqual([720])
  })

  it('zooms canvas-backed office documents without reloading the viewer', async () => {
    vi.useFakeTimers()
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(640)

    const wrapper = mount(OfficePreview, {
      props: {
        src: '/files/work-instruction.docx',
        kind: 'office-docx',
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('100%')

    await wrapper.get('button[aria-label="放大文档"]').trigger('click')
    await vi.advanceTimersByTimeAsync(200)
    await flushPromises()

    expect(wrapper.text()).toContain('110%')
    expect(officeViewerMocks.docxOptions).toHaveLength(1)
    expect(officeViewerMocks.docxRenderWidths).toEqual([704])

    await wrapper.get('button[aria-label="重置文档缩放"]').trigger('click')
    await vi.advanceTimersByTimeAsync(200)
    await flushPromises()

    expect(wrapper.text()).toContain('100%')
    expect(officeViewerMocks.docxOptions).toHaveLength(1)
    expect(officeViewerMocks.docxRenderWidths).toEqual([704, 640])
  })

  it('FilePreview renders a true 50 percent canvas at a narrow office width', async () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400)
    const wrapper = mount(FilePreview, { props: { src: '/narrow.docx', fileName: 'narrow.docx' } })
    await vi.waitFor(() => expect(wrapper.emitted('ready')).toEqual([['office-docx']]))
    vi.useFakeTimers()
    for (let index = 0; index < 5; index += 1)
      await wrapper.get('button[aria-label="缩小文档"]').trigger('click')
    await vi.advanceTimersByTimeAsync(200)
    await flushPromises()
    expect(wrapper.get('button[aria-label="重置文档缩放"]').text()).toBe('50%')
    expect(officeViewerMocks.docxRenderWidths.at(-1)).toBe(200)
    expect(wrapper.get('button[aria-label="缩小文档"]').attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })

  it('documents every file preview demo with code examples and localized state labels', () => {
    const docs = readFileSync(
      resolve(process.cwd(), '../../apps/design-system/docs/components/desktop/file-preview.md'),
      'utf8',
    )

    for (const title of [
      '图片预览',
      'PDF 预览',
      'Word / DOCX 预览',
      'Excel / XLSX 预览',
      'PowerPoint / PPTX 预览',
      '状态示例',
    ]) {
      expect(docs, `${title} needs a VitePress outline heading`).toContain(`### ${title}`)

      const sectionStart = docs.indexOf(`<Demo title="${title}"`)
      expect(sectionStart, `${title} demo is missing`).toBeGreaterThanOrEqual(0)

      const nextSectionStart = docs.indexOf('<Demo title=', sectionStart + 1)
      const section = docs.slice(
        sectionStart,
        nextSectionStart === -1 ? undefined : nextSectionStart,
      )
      expect(section, `${title} demo needs a Vue code example`).toContain('```vue')
    }

    expect(docs).toContain('待上传预览源')
    expect(docs).toContain('图片加载失败')
    expect(docs).toContain('不支持的图纸格式')
    expect(docs).toContain('包含 `Inspection / Trend / Summary` 3 个工作表')
    expect(docs).not.toContain('pending-preview.pdf')
    expect(docs).not.toContain('missing-image.png')
  })

  it('labels office navigation by document unit', async () => {
    const pptx = mount(OfficePreview, {
      props: {
        src: '/files/review.pptx',
        kind: 'office-pptx',
      },
    })
    const xlsx = mount(OfficePreview, {
      props: {
        src: '/files/schedule.xlsx',
        kind: 'office-xlsx',
      },
    })

    await flushPromises()

    expect(pptx.get('button[aria-label="上一张幻灯片"]')).toBeTruthy()
    expect(pptx.get('button[aria-label="下一张幻灯片"]')).toBeTruthy()
    expect(xlsx.get('button[aria-label="上一个工作表"]')).toBeTruthy()
    expect(xlsx.get('button[aria-label="下一个工作表"]')).toBeTruthy()
  })

  it('allows jumping Word pages from the toolbar', async () => {
    const wrapper = mount(OfficePreview, {
      props: {
        src: '/files/work-instruction.docx',
        kind: 'office-docx',
      },
    })

    await flushPromises()

    const pageSelect = wrapper.getComponent(NvSelect)
    pageSelect.vm.$emit('update:modelValue', '1')
    await flushPromises()

    expect(wrapper.text()).toContain('2/2')
  })

  it('allows jumping PowerPoint slides from the toolbar', async () => {
    const wrapper = mount(OfficePreview, {
      props: {
        src: '/files/review.pptx',
        kind: 'office-pptx',
      },
    })

    await flushPromises()

    const slideSelect = wrapper.getComponent(NvSelect)
    slideSelect.vm.$emit('update:modelValue', '2')
    await flushPromises()

    expect(wrapper.text()).toContain('3/3')
  })

  it('allows jumping Excel worksheets from the toolbar', async () => {
    const wrapper = mount(OfficePreview, {
      props: {
        src: '/files/schedule.xlsx',
        kind: 'office-xlsx',
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Summary · 1/2')

    const sheetSelect = wrapper.getComponent(NvSelect)
    sheetSelect.vm.$emit('update:modelValue', '1')
    await flushPromises()

    expect(wrapper.text()).toContain('Details · 2/2')
  })

  it('keeps spreadsheet preview chrome inside the unified toolbar', async () => {
    const wrapper = mount(OfficePreview, {
      props: {
        src: '/files/schedule.xlsx',
        kind: 'office-xlsx',
      },
    })

    await flushPromises()

    expect(officeViewerMocks.xlsxOptions.at(-1)?.showZoomSlider).toBe(false)
    expect(wrapper.get('[data-slot="file-preview-spreadsheet-host"]').classes()).toContain(
      'file-preview-spreadsheet-host',
    )
  })
})
