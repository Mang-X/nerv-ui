import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import {
  FileUpload,
  useFileUpload,
  type FileUploadExpose,
  type FileUploadCreateSessionRequest,
  type FileUploadSession,
  type FileUploadTransportContext,
} from '@nerv-iip/ui'

function gate<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function session(id: string, expired = false): FileUploadSession {
  return {
    uploadSessionId: id,
    fileId: `file-${id}`,
    uploadMode: 'server-proxy',
    provider: 'server-proxy',
    expiresAtUtc: expired ? '2000-01-01T00:00:00Z' : '2099-01-01T00:00:00Z',
    upload: { url: `memory:${id}`, headers: {} },
  }
}
const file = (name = 'note.txt') => new File(['note'], name, { type: 'text/plain' })
function fixture() {
  const creates: ReturnType<typeof gate<FileUploadSession>>[] = []
  const transfers: { context: FileUploadTransportContext; gate: ReturnType<typeof gate<void>> }[] =
    []
  const completes: ReturnType<typeof gate<{ fileId: string }>>[] = []
  const options = {
    purpose: 'attachment',
    ownerService: 'host',
    ownerType: 'collection',
    ownerId: 'local',
    organizationId: 'local',
    environmentId: 'memory',
    acceptedContentTypes: ['.txt'],
    maxFiles: 5,
    autoUpload: false,
    createUploadSession: vi.fn((_request: FileUploadCreateSessionRequest) => {
      const g = gate<FileUploadSession>()
      creates.push(g)
      return g.promise
    }),
    transport: vi.fn((context: FileUploadTransportContext) => {
      const g = gate<void>()
      transfers.push({ context, gate: g })
      return g.promise
    }),
    completeUploadSession: vi.fn(() => {
      const g = gate<{ fileId: string }>()
      completes.push(g)
      return g.promise
    }),
    onCompleted: vi.fn(),
    onRejected: vi.fn(),
    onFailed: vi.fn(),
  }
  return { creates, transfers, completes, options }
}
const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => {
  wrappers.splice(0).forEach((w) => w.unmount())
  vi.restoreAllMocks()
})

it('pause during create prevents a late session from starting transport', async () => {
  const f = fixture(),
    upload = useFileUpload(f.options)
  await upload.addFiles([file()])
  const task = upload.uploadQueued()
  upload.pauseRow(upload.rows[0]!.id)
  f.creates[0]!.resolve(session('old'))
  await flushPromises()
  expect(f.options.transport).not.toHaveBeenCalled()
  expect(upload.rows[0]).toMatchObject({ status: 'paused', uploadSession: null, error: null })
  expect(f.options.onCompleted).not.toHaveBeenCalled()
  await task
})

it('resume isolates old progress failure and finally from the current attempt', async () => {
  const f = fixture(),
    upload = useFileUpload(f.options)
  await upload.addFiles([file()])
  const old = upload.uploadQueued()
  f.creates[0]!.resolve(session('shared'))
  await flushPromises()
  const id = upload.rows[0]!.id
  upload.pauseRow(id)
  expect(f.transfers[0]!.context.signal?.aborted).toBe(true)
  const current = upload.resumeRow(id)
  await flushPromises()
  f.transfers[1]!.context.onProgress(42)
  f.transfers[0]!.context.onProgress(99)
  f.transfers[0]!.gate.reject(new Error('late old failure'))
  await old
  expect(upload.rows[0]).toMatchObject({ status: 'uploading', progress: 42, error: null })
  expect(f.options.onFailed).not.toHaveBeenCalled()
  upload.pauseAll()
  expect(f.transfers[1]!.context.signal?.aborted).toBe(true)
  f.transfers[1]!.gate.resolve()
  await current
  expect(f.options.completeUploadSession).not.toHaveBeenCalled()
  expect(upload.rows[0]!.status).toBe('paused')
})

const cancellations = (['create', 'transport', 'complete'] as const).flatMap((stage) =>
  (['pause', 'remove', 'clear', 'unmount', 'replace'] as const).flatMap((action) =>
    (['success', 'failure'] as const).map((outcome) => ({ stage, action, outcome })),
  ),
)
it.each(cancellations)(
  '$action during $stage isolates late $outcome and preserves a new selection',
  async ({ action, stage, outcome }) => {
    const f = fixture()
    const w = mount(FileUpload, {
      props: { ...f.options, variant: action === 'replace' ? 'avatar' : 'queue' },
    })
    wrappers.push(w)
    const api = w.vm as unknown as FileUploadExpose
    await api.addFiles([file('old.txt')])
    const task = api.uploadQueued()
    if (stage !== 'create') {
      f.creates[0]!.resolve(session('old'))
      await flushPromises()
      if (stage === 'complete') {
        f.transfers[0]!.gate.resolve()
        await flushPromises()
      }
    }
    if (action === 'pause') api.pauseAll()
    else if (action === 'remove') await w.get('[aria-label="移除 old.txt"]').trigger('click')
    else if (action === 'clear') api.clear()
    else if (action === 'unmount') w.unmount()
    else {
      const input = w.get('input[type="file"]')
      Object.defineProperty(input.element, 'files', {
        configurable: true,
        value: [file('new.txt')],
      })
      await input.trigger('change')
    }
    if (stage !== 'create') {
      expect(f.transfers[0]!.context.signal?.aborted).toBe(true)
      f.transfers[0]!.context.onProgress(99)
    }
    if (outcome === 'failure') {
      const oldGate =
        stage === 'create'
          ? f.creates[0]!
          : stage === 'transport'
            ? f.transfers[0]!.gate
            : f.completes[0]!
      oldGate.reject(new Error(`late ${stage} failure`))
    } else if (stage === 'create') f.creates[0]!.resolve(session('old'))
    else if (stage === 'transport') f.transfers[0]!.gate.resolve()
    else f.completes[0]!.resolve({ fileId: 'stale-receipt' })
    await task
    await flushPromises()
    expect(w.emitted('completed')).toBeUndefined()
    expect(w.emitted('failed')).toBeUndefined()
    expect(f.options.transport).toHaveBeenCalledTimes(stage === 'create' ? 0 : 1)
    expect(f.options.completeUploadSession).toHaveBeenCalledTimes(stage === 'complete' ? 1 : 0)
    if (action === 'replace') {
      expect(api.hasQueuedRows).toBe(true)
      const next = api.uploadQueued()
      expect(f.options.createUploadSession.mock.calls[1]?.[0]).toMatchObject({
        fileName: 'new.txt',
      })
      f.creates[1]!.resolve(session('new'))
      await flushPromises()
      f.transfers[stage === 'create' ? 0 : 1]!.gate.resolve()
      await flushPromises()
      f.completes[stage === 'complete' ? 1 : 0]!.resolve({ fileId: 'current-receipt' })
      await next
      expect(w.emitted('completed')).toEqual([
        [[{ fileId: 'current-receipt', fileName: 'new.txt' }]],
      ])
    }
    expect(f.options.createUploadSession).toHaveBeenCalledTimes(action === 'replace' ? 2 : 1)
  },
)

it.each(['single', 'bulk'] as const)(
  '%s retry replaces an expired failed session and retains the failure reason',
  async (mode) => {
    const f = fixture(),
      upload = useFileUpload(f.options)
    await upload.addFiles([file()])
    const first = upload.uploadQueued()
    f.creates[0]!.resolve(session('expired', true))
    await flushPromises()
    f.transfers[0]!.gate.reject(new Error('session expired at server'))
    await first
    expect(upload.rows[0]).toMatchObject({ status: 'failed', error: 'session expired at server' })
    expect(f.options.onFailed).toHaveBeenCalledTimes(1)
    expect(upload.completedFiles.value).toEqual([])
    const retry = mode === 'single' ? upload.retryRow(upload.rows[0]!.id) : upload.retryFailed()
    expect(f.options.createUploadSession).toHaveBeenCalledTimes(2)
    f.creates[1]!.resolve(session('fresh'))
    await flushPromises()
    expect(f.transfers[1]!.context.session.uploadSessionId).toBe('fresh')
    f.transfers[1]!.gate.resolve()
    await flushPromises()
    f.completes[0]!.resolve({ fileId: 'fresh-file' })
    await retry
    expect(upload.completedFiles.value).toEqual([{ fileId: 'fresh-file', fileName: 'note.txt' }])
  },
)

it('clear during a batch create prevents not-yet-started rows from creating sessions', async () => {
  const f = fixture(),
    upload = useFileUpload(f.options)
  f.options.createUploadSession.mockImplementationOnce(() => {
    upload.clear()
    return Promise.resolve(session('cancelled'))
  })
  await upload.addFiles([file('one.txt'), file('two.txt')])
  const task = upload.uploadQueued()
  await flushPromises()
  expect(f.options.createUploadSession).toHaveBeenCalledTimes(1)
  expect(f.options.transport).not.toHaveBeenCalled()
  expect(upload.hasRows.value).toBe(false)
  await task
})

it.each(['create', 'transport', 'complete'] as const)(
  'scope disposal during %s blocks late failure and subsequent actions',
  async (stage) => {
    const f = fixture(),
      scope = effectScope()
    const upload = scope.run(() => useFileUpload(f.options))!
    await upload.addFiles([file()])
    const task = upload.uploadQueued()
    if (stage !== 'create') {
      f.creates[0]!.resolve(session('old'))
      await flushPromises()
      if (stage === 'complete') {
        f.transfers[0]!.gate.resolve()
        await flushPromises()
      }
    }
    scope.stop()
    if (stage === 'create') f.creates[0]!.reject(new Error('late create error'))
    else {
      expect(f.transfers[0]!.context.signal?.aborted).toBe(true)
      f.transfers[0]!.context.onProgress(99)
      if (stage === 'transport') f.transfers[0]!.gate.reject(new Error('late transport error'))
      else f.completes[0]!.reject(new Error('late complete error'))
    }
    await task
    await upload.addFiles([file('after-dispose.txt')])
    await upload.uploadQueued()
    expect(upload.rows).toHaveLength(0)
    expect(f.options.createUploadSession).toHaveBeenCalledTimes(1)
    expect(f.options.onFailed).not.toHaveBeenCalled()
    expect(f.options.onCompleted).not.toHaveBeenCalled()
    expect(f.options.completeUploadSession).toHaveBeenCalledTimes(stage === 'complete' ? 1 : 0)
  },
)

it.each(['remove', 'clear', 'pause'] as const)(
  '%s while transport waits ignores late progress and success without completing',
  async (action) => {
    const f = fixture(),
      upload = useFileUpload(f.options)
    await upload.addFiles([file()])
    const task = upload.uploadQueued()
    f.creates[0]!.resolve(session('old'))
    await flushPromises()
    const row = upload.rows[0]!
    if (action === 'remove') upload.removeRow(row.id)
    else if (action === 'clear') upload.clear()
    else upload.pauseRow(row.id)
    f.transfers[0]!.context.onProgress(95)
    f.transfers[0]!.gate.resolve()
    await task
    expect(row.progress).toBe(1)
    expect(f.transfers[0]!.context.signal?.aborted).toBe(true)
    expect(f.options.completeUploadSession).not.toHaveBeenCalled()
    expect(f.options.onCompleted).not.toHaveBeenCalled()
  },
)

it('parallel batch operations keep one current attempt per row and pause every signal', async () => {
  const f = fixture(),
    upload = useFileUpload(f.options)
  await upload.addFiles([file('one.txt'), file('two.txt'), file('three.txt')])
  const first = upload.uploadQueued(),
    duplicate = upload.uploadQueued()
  expect(f.creates).toHaveLength(3)
  f.creates.forEach((g, i) => g.resolve(session(String(i))))
  await flushPromises()
  expect(f.transfers).toHaveLength(3)
  upload.pauseAll()
  expect(f.transfers.every((t) => t.context.signal?.aborted)).toBe(true)
  const resumed = upload.resumeAll(),
    again = upload.resumeAll()
  await flushPromises()
  expect(f.transfers).toHaveLength(6)
  f.transfers.slice(0, 3).forEach((t) => t.gate.resolve())
  await first
  expect(f.options.completeUploadSession).not.toHaveBeenCalled()
  upload.clear()
  f.transfers.slice(3).forEach((t) => {
    expect(t.context.signal?.aborted).toBe(true)
    t.gate.reject(new DOMException('paused', 'AbortError'))
  })
  await Promise.all([duplicate, resumed, again])
  expect(f.options.onFailed).not.toHaveBeenCalled()
  expect(f.options.onCompleted).not.toHaveBeenCalled()
})

it('out-of-order completions emit only current queued successes and removal updates the snapshot', async () => {
  const f = fixture(),
    upload = useFileUpload(f.options)
  await upload.addFiles([file('one.txt'), file('two.txt'), file('three.txt')])
  const task = upload.uploadQueued()
  f.creates.forEach((g, i) => g.resolve(session(String(i))))
  await flushPromises()
  f.transfers[1]!.gate.resolve()
  await flushPromises()
  f.completes[0]!.resolve({ fileId: 'two' })
  await flushPromises()
  expect(f.options.onCompleted.mock.calls).toEqual([[[{ fileId: 'two', fileName: 'two.txt' }]]])
  upload.removeRow(upload.rows[1]!.id)
  expect(f.options.onCompleted.mock.calls[1]).toEqual([[]])
  f.transfers[2]!.gate.reject(new Error('genuine failure'))
  f.transfers[0]!.gate.resolve()
  await flushPromises()
  f.completes[1]!.resolve({ fileId: 'one' })
  await task
  expect(upload.completedFiles.value).toEqual([{ fileId: 'one', fileName: 'one.txt' }])
  expect(f.options.onCompleted.mock.calls[2]).toEqual([[{ fileId: 'one', fileName: 'one.txt' }]])
  upload.clear()
  expect(f.options.onCompleted).toHaveBeenCalledTimes(3)
})

it('active AbortError remains a real failure while pause cancellation is silent', async () => {
  const f = fixture(),
    upload = useFileUpload(f.options)
  await upload.addFiles([file()])
  const task = upload.uploadQueued()
  f.creates[0]!.reject(new DOMException('host aborted create', 'AbortError'))
  await task
  expect(upload.rows[0]).toMatchObject({ status: 'failed', error: 'host aborted create' })
  expect(f.options.onFailed).toHaveBeenCalledTimes(1)
  const retry = upload.retryRow(upload.rows[0]!.id),
    duplicate = upload.retryFailed()
  expect(f.creates).toHaveLength(2)
  upload.pauseAll()
  f.creates[1]!.reject(new DOMException('cancelled', 'AbortError'))
  await Promise.all([retry, duplicate])
  expect(upload.rows[0]).toMatchObject({ status: 'paused', error: null })
  expect(f.options.onFailed).toHaveBeenCalledTimes(1)
})

it.each(['create', 'complete'] as const)(
  'new attempt completes before the old %s settles without losing its receipt',
  async (stage) => {
    const f = fixture(),
      upload = useFileUpload(f.options)
    await upload.addFiles([file()])
    const old = upload.uploadQueued()
    if (stage === 'complete') {
      f.creates[0]!.resolve(session('shared'))
      await flushPromises()
      f.transfers[0]!.gate.resolve()
      await flushPromises()
    }
    upload.pauseAll()
    const current = upload.resumeAll()
    if (stage === 'create') f.creates[1]!.resolve(session('new'))
    await flushPromises()
    f.transfers[stage === 'create' ? 0 : 1]!.gate.resolve()
    await flushPromises()
    f.completes[stage === 'create' ? 0 : 1]!.resolve({ fileId: 'current-file' })
    await current
    if (stage === 'create') f.creates[0]!.resolve(session('old'))
    else f.completes[0]!.resolve({ fileId: 'old-file' })
    await old
    expect(upload.rows[0]).toMatchObject({
      status: 'completed',
      fileId: 'current-file',
      error: null,
    })
    expect(f.options.onCompleted.mock.calls).toEqual([
      [[{ fileId: 'current-file', fileName: 'note.txt' }]],
    ])
    expect(f.options.onFailed).not.toHaveBeenCalled()
  },
)

it('maxFiles keeps the existing failed-slot policy without limiting retry transport concurrency', async () => {
  const f = fixture(),
    upload = useFileUpload({ ...f.options, maxFiles: 1 })
  await upload.addFiles([file('failed.txt')])
  const first = upload.uploadQueued()
  f.creates[0]!.resolve(session('failed'))
  await flushPromises()
  f.transfers[0]!.gate.reject(new Error('retryable'))
  await first
  await upload.addFiles([file('queued.txt')])
  expect(upload.rows.map((r) => r.status)).toEqual(['failed', 'queued'])
  const retry = upload.retryFailed(),
    queued = upload.uploadQueued()
  f.creates[1]!.resolve(session('queued'))
  await flushPromises()
  expect(f.transfers).toHaveLength(3)
  expect(f.transfers.slice(1).every((t) => !t.context.signal?.aborted)).toBe(true)
  expect(upload.rows.map((r) => r.status)).toEqual(['uploading', 'uploading'])
  upload.pauseAll()
  f.transfers.slice(1).forEach((t) => t.gate.resolve())
  await Promise.all([retry, queued])
  expect(f.options.onCompleted).not.toHaveBeenCalled()
})

it('retry completes while an older paused attempt still awaits transport', async () => {
  const f = fixture(),
    upload = useFileUpload(f.options)
  await upload.addFiles([file()])
  const old = upload.uploadQueued()
  f.creates[0]!.resolve(session('shared'))
  await flushPromises()
  upload.pauseAll()
  const resumed = upload.resumeAll()
  await flushPromises()
  f.transfers[1]!.gate.reject(new Error('current retryable error'))
  await resumed
  expect(upload.rows[0]!.error).toBe('current retryable error')
  const retried = upload.retryFailed()
  f.transfers[2]!.gate.resolve()
  await flushPromises()
  f.completes[0]!.resolve({ fileId: 'retried-file' })
  await retried
  f.transfers[0]!.context.onProgress(9)
  f.transfers[0]!.gate.resolve()
  await old
  expect(upload.rows[0]).toMatchObject({
    status: 'completed',
    fileId: 'retried-file',
    progress: 100,
    error: null,
  })
  expect(f.options.completeUploadSession).toHaveBeenCalledTimes(1)
  expect(f.options.onCompleted.mock.calls).toEqual([
    [[{ fileId: 'retried-file', fileName: 'note.txt' }]],
  ])
  expect(f.options.onFailed).toHaveBeenCalledTimes(1)
})
