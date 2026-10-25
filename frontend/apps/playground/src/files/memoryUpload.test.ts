import { expect, it } from 'vitest'
import { createMemoryUpload } from './memoryUpload'

it('advances only explicit transports and records abort, failure and completion separately', async () => {
  const adapter = createMemoryUpload()
  expect(adapter.state.counts).toEqual({ create: 0, transport: 0, complete: 0, abort: 0, fail: 0 })
  const request = {
    organizationId: 'local',
    environmentId: 'memory',
    owner: { ownerService: 'host', ownerType: 'collection', ownerId: 'personal' },
    filePurpose: 'attachment',
    fileName: 'note.txt',
    contentType: 'text/plain',
    expectedSizeBytes: 4,
    checksum: null,
  }
  const session = await adapter.createUploadSession(request)
  const controller = new AbortController()
  const progress: number[] = []
  const paused = adapter.transport({
    session,
    file: new File(['note'], 'note.txt'),
    signal: controller.signal,
    onProgress: (p) => progress.push(p),
  })
  const abortResult = paused.catch((error: Error) => error.name)
  adapter.advance()
  expect(progress).toEqual([25])
  expect(adapter.state.counts.complete).toBe(0)
  controller.abort()
  expect(await abortResult).toBe('AbortError')
  expect(adapter.state.pending).toBe(0)
  const failed = adapter
    .transport({ session, file: new File(['note'], 'note.txt'), onProgress: () => {} })
    .catch((error: Error) => error.message)
  adapter.fail()
  expect(await failed).toBe('本地传输暂时中断，请重试。')
  const resumed = adapter.transport({
    session,
    file: new File(['note'], 'note.txt'),
    onProgress: (p) => progress.push(p),
  })
  adapter.advance()
  adapter.advance()
  adapter.advance()
  await resumed
  const receipt = await adapter.completeUploadSession(session.uploadSessionId, {
    organizationId: 'local',
    environmentId: 'memory',
    filePurpose: 'attachment',
    sizeBytes: 4,
    checksum: null,
  })
  expect(receipt).toEqual({ fileId: session.fileId })
  expect(progress).toEqual([25, 25, 65, 100])
  expect(adapter.state.counts).toEqual({ create: 1, transport: 3, complete: 1, abort: 1, fail: 1 })
})
