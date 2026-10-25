import { reactive } from 'vue'
import type {
  FileUploadCreateSessionRequest,
  FileUploadCompleteSessionRequest,
  FileUploadSession,
  FileUploadTransportContext,
} from '@nerv-iip/ui'

/** A host fixture: never fetches, persists files, or interprets opaque owner fields. */
export function createMemoryUpload() {
  const state = reactive({
    counts: { create: 0, transport: 0, complete: 0, abort: 0, fail: 0 },
    pending: 0,
    events: [] as string[],
  })
  const sessions = new Map<string, FileUploadSession>()
  const pending = new Set<{
    advance: () => void
    fail: () => void
  }>()

  async function createUploadSession(request: FileUploadCreateSessionRequest) {
    const id = `memory-${++state.counts.create}`
    const session: FileUploadSession = {
      uploadSessionId: id,
      fileId: `local-${id}`,
      uploadMode: 'server-proxy',
      provider: 'server-proxy',
      expiresAtUtc: new Date(Date.now() + 3_600_000).toISOString(),
      // Opaque sentinel; the injected transport never uses a network endpoint.
      upload: { url: `memory:${id}`, headers: {} },
    }
    sessions.set(id, session)
    state.events.push(`create ${id} ${request.fileName}`)
    return session
  }

  function transport(context: FileUploadTransportContext): Promise<void> {
    state.counts.transport++
    state.events.push(`transport ${context.session.uploadSessionId} ${context.file.name}`)
    return new Promise((resolve, reject) => {
      let step = 0
      const cleanup = () => {
        pending.delete(operation)
        state.pending = pending.size
        context.signal?.removeEventListener('abort', abort)
      }
      const abort = () => {
        cleanup()
        state.counts.abort++
        state.events.push(`abort ${context.session.uploadSessionId}`)
        reject(new DOMException('传输已暂停。', 'AbortError'))
      }
      const operation = {
        advance() {
          const progress = [25, 65, 100][step++]!
          context.onProgress(progress)
          state.events.push(`progress ${context.session.uploadSessionId} ${progress}`)
          if (progress === 100) {
            cleanup()
            resolve()
          }
        },
        fail() {
          cleanup()
          state.counts.fail++
          state.events.push(`fail ${context.session.uploadSessionId}`)
          reject(new Error('本地传输暂时中断，请重试。'))
        },
      }
      pending.add(operation)
      state.pending = pending.size
      if (context.signal?.aborted) abort()
      else context.signal?.addEventListener('abort', abort, { once: true })
    })
  }

  async function completeUploadSession(id: string, request: FileUploadCompleteSessionRequest) {
    const session = sessions.get(id)
    if (!session) throw new Error('本地会话不存在。')
    state.counts.complete++
    state.events.push(`complete ${id} ${request.sizeBytes}`)
    return { fileId: session.fileId }
  }

  return {
    state,
    createUploadSession,
    transport,
    completeUploadSession,
    advance: () => [...pending].forEach((operation) => operation.advance()),
    fail: () => [...pending].forEach((operation) => operation.fail()),
  }
}
