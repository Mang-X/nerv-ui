import { afterEach, expect, it, vi } from 'vitest'
import { uploadWithNativeFileStorageTransport, type FileUploadTransportContext } from '@nerv-ui/ui'

const MiB = 1024 * 1024
function context(size = 8, mode = 'tus'): FileUploadTransportContext {
  return {
    file: new File([Uint8Array.from({ length: size }, (_, i) => i % 251)], 'fixture.bin', {
      type: 'application/octet-stream',
    }),
    session: {
      uploadSessionId: 'local-1',
      fileId: 'fixture-1',
      uploadMode: mode as 'tus',
      provider: mode as 'tus',
      expiresAtUtc: '2099-01-01',
      upload: { url: '/__native-fixture/1', headers: { 'X-Fixture-Session': 'local-1' } },
    },
    onProgress: vi.fn(),
  }
}
const response = (offset: string | null, status = 204) =>
  new Response(null, {
    status,
    headers: offset === null ? {} : { 'Upload-Offset': offset },
  })
afterEach(() => vi.unstubAllGlobals())

it.each([null, '', 'NaN', '-1', '0.5', '9'])(
  'rejects invalid HEAD offset %s before any PATCH',
  async (offset) => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response(offset))
      .mockResolvedValue(response('8', 500))
    vi.stubGlobal('fetch', fetcher)
    const ctx = context()
    await expect(uploadWithNativeFileStorageTransport(ctx)).rejects.toThrow(
      'Invalid tus HEAD Upload-Offset',
    )
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(ctx.onProgress).not.toHaveBeenCalled()
  },
)

it.each([null, '', 'NaN', '-1', '0.5', '9', '2', '1', '4'])(
  'rejects unconfirmed PATCH offset %s with bounded requests',
  async (offset) => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response('2'))
      .mockResolvedValueOnce(response(offset))
      .mockResolvedValue(response('8', 500))
    vi.stubGlobal('fetch', fetcher)
    const ctx = context()
    await expect(uploadWithNativeFileStorageTransport(ctx)).rejects.toThrow(
      /Invalid tus PATCH Upload-Offset|did not confirm/,
    )
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(ctx.onProgress).toHaveBeenCalledExactlyOnceWith(25)
  },
)

it.each([
  ['tus', 'server-proxy'],
  ['server-proxy', 'tus'],
  ['unknown', 'tus'],
  ['tus', 'unknown'],
  ['unknown', 'unknown'],
])('rejects mode %s provider %s before fetch', async (mode, provider) => {
  const fetcher = vi.fn().mockResolvedValue(response('8'))
  vi.stubGlobal('fetch', fetcher)
  const ctx = context(8, mode)
  ctx.session.provider = provider as 'tus'
  await expect(uploadWithNativeFileStorageTransport(ctx)).rejects.toThrow(
    'Unsupported upload mode/provider',
  )
  expect(fetcher).not.toHaveBeenCalled()
})

it('aborts before starting and between acknowledged chunks without later PATCH or success', async () => {
  const controller = new AbortController()
  const ctx = context(2 * MiB + 17)
  ctx.signal = controller.signal
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(response('0'))
    .mockImplementationOnce(async () => {
      controller.abort()
      return response(String(MiB))
    })
    .mockResolvedValue(response(String(ctx.file.size)))
  vi.stubGlobal('fetch', fetcher)
  await expect(uploadWithNativeFileStorageTransport(ctx)).rejects.toMatchObject({
    name: 'AbortError',
  })
  expect(fetcher).toHaveBeenCalledTimes(2)
  expect(ctx.onProgress).toHaveBeenCalledExactlyOnceWith(0)
  await expect(uploadWithNativeFileStorageTransport(ctx)).rejects.toMatchObject({
    name: 'AbortError',
  })
  expect(fetcher).toHaveBeenCalledTimes(2)
})

it('resumes from nonzero HEAD with exact binary slices, session headers and 1 MiB chunks', async () => {
  const ctx = context(2 * MiB + 17)
  const controller = new AbortController()
  ctx.signal = controller.signal
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(response('17'))
    .mockResolvedValueOnce(response(String(MiB + 17)))
    .mockResolvedValueOnce(response(String(2 * MiB + 17)))
  vi.stubGlobal('fetch', fetcher)
  await uploadWithNativeFileStorageTransport(ctx)
  expect(fetcher.mock.calls.map((c) => c[1].method)).toEqual(['HEAD', 'PATCH', 'PATCH'])
  expect(fetcher.mock.calls[0]).toEqual([
    '/__native-fixture/1',
    {
      method: 'HEAD',
      headers: { 'X-Fixture-Session': 'local-1', 'Tus-Resumable': '1.0.0' },
      signal: controller.signal,
    },
  ])
  for (const [index, offset] of [
    [1, '17'],
    [2, String(MiB + 17)],
  ] as const) {
    const options = fetcher.mock.calls[index]![1]
    expect(options.headers).toEqual({
      'X-Fixture-Session': 'local-1',
      'Tus-Resumable': '1.0.0',
      'Upload-Offset': offset,
      'Content-Type': 'application/offset+octet-stream',
    })
    expect(options.signal).toBe(controller.signal)
    expect(options.body.size).toBe(MiB)
    expect(options.body).toBeInstanceOf(Blob)
    const bytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(options.body)
    })
    expect([...new Uint8Array(bytes).slice(0, 3)]).toEqual(
      index === 1 ? [17, 18, 19] : [166, 167, 168],
    )
  }
  expect(ctx.onProgress).toHaveBeenLastCalledWith(100)
})

it.each([
  [409, 'offset changed'],
  [412, 'expired or not resumable'],
  [413, 'larger than'],
  [460, 'checksum did not match'],
])('preserves tus HTTP %s reason on HEAD and PATCH', async (status, reason) => {
  for (const method of ['HEAD', 'PATCH']) {
    const fetcher = vi.fn()
    if (method === 'PATCH') fetcher.mockResolvedValueOnce(response('0'))
    fetcher.mockResolvedValue(response(null, status as number))
    vi.stubGlobal('fetch', fetcher)
    await expect(uploadWithNativeFileStorageTransport(context())).rejects.toThrow(reason as string)
    expect(fetcher).toHaveBeenCalledTimes(method === 'HEAD' ? 1 : 2)
  }
})

it('PUT forwards binary File and headers, reports only completion after response, and preserves failures', async () => {
  const ctx = context(8, 'server-proxy')
  let resolve!: (r: Response) => void
  const fetcher = vi.fn().mockImplementation(
    () =>
      new Promise<Response>((r) => {
        resolve = r
      }),
  )
  vi.stubGlobal('fetch', fetcher)
  const pending = uploadWithNativeFileStorageTransport(ctx)
  expect(ctx.onProgress).not.toHaveBeenCalled()
  expect(fetcher).toHaveBeenCalledWith('/__native-fixture/1', {
    method: 'PUT',
    headers: { 'X-Fixture-Session': 'local-1', 'Content-Type': 'application/octet-stream' },
    body: ctx.file,
    signal: undefined,
  })
  resolve(response(null))
  await pending
  expect(ctx.onProgress).toHaveBeenCalledExactlyOnceWith(100)
  for (const status of [403, 500]) {
    fetcher.mockResolvedValue(response(null, status))
    await expect(uploadWithNativeFileStorageTransport(ctx)).rejects.toThrow(`HTTP ${status}`)
  }
  const cause = new TypeError('fixture network disconnected')
  fetcher.mockRejectedValue(cause)
  await expect(uploadWithNativeFileStorageTransport(ctx)).rejects.toBe(cause)
})

it('passes AbortSignal into an in-flight fetch and never reports PUT completion after abort', async () => {
  const controller = new AbortController()
  const ctx = context(8, 'server-proxy')
  ctx.signal = controller.signal
  const fetcher = vi.fn().mockImplementation(
    (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(options.signal.reason), {
          once: true,
        })
      }),
  )
  vi.stubGlobal('fetch', fetcher)
  const result = uploadWithNativeFileStorageTransport(ctx)
  controller.abort()
  await expect(result).rejects.toMatchObject({ name: 'AbortError' })
  expect(fetcher).toHaveBeenCalledTimes(1)
  expect(ctx.onProgress).not.toHaveBeenCalled()
})

it('handles an already-complete or empty tus session with HEAD only', async () => {
  for (const size of [0, 8]) {
    const fetcher = vi.fn().mockResolvedValue(response(String(size)))
    vi.stubGlobal('fetch', fetcher)
    const ctx = context(size)
    await uploadWithNativeFileStorageTransport(ctx)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(ctx.onProgress).toHaveBeenCalledExactlyOnceWith(100)
  }
})
