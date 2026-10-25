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
    holdCreate: false,
    holdComplete: false,
    ignoreAbort: false,
    gates: [] as { id: number; stage: 'create' | 'complete'; sessionId: string }[],
  })
  let gateSequence = 0
  const gates = new Map<number, { resolve: () => void; reject: (error: Error) => void }>()
  const attempts: { id: number; sessionId: string; signal?: AbortSignal; settled: boolean }[] = []
  const sessions = new Map<string, FileUploadSession>()
  const pending = new Set<{
    advance: () => void
    fail: () => void
  }>()

  function hold(stage: 'create' | 'complete', sessionId: string) {
    const id = ++gateSequence
    state.gates.push({ id, stage, sessionId })
    state.events.push(`hold ${stage} ${id} ${sessionId}`)
    return new Promise<void>((resolve, reject) => gates.set(id, { resolve, reject }))
  }
  function release(stage: 'create' | 'complete', fail = false, id?: number) {
    for (const gate of [...state.gates].filter(
      (g) => g.stage === stage && (id === undefined || g.id === id),
    )) {
      const operation = gates.get(gate.id)!
      gates.delete(gate.id)
      state.gates.splice(
        state.gates.findIndex((g) => g.id === gate.id),
        1,
      )
      state.events.push(`release ${stage} ${gate.id} ${fail ? 'failure' : 'success'}`)
      if (fail) {
        state.counts.fail++
        operation.reject(new Error(`本地 ${stage} 暂时中断，请重试。`))
      } else operation.resolve()
    }
  }

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
    if (state.holdCreate) await hold('create', id)
    return session
  }

  function transport(context: FileUploadTransportContext): Promise<void> {
    state.counts.transport++
    state.events.push(`transport ${context.session.uploadSessionId} ${context.file.name}`)
    const attempt = {
      id: state.counts.transport,
      sessionId: context.session.uploadSessionId,
      signal: context.signal,
      settled: false,
    }
    attempts.push(attempt)
    const ignoreAbort = state.ignoreAbort
    return new Promise((resolve, reject) => {
      let step = 0
      const cleanup = () => {
        pending.delete(operation)
        state.pending = pending.size
        context.signal?.removeEventListener('abort', abort)
        attempt.settled = true
      }
      const abort = () => {
        state.counts.abort++
        state.events.push(
          `abort ${context.session.uploadSessionId} attempt ${attempt.id}${ignoreAbort ? ' retained' : ''}`,
        )
        if (ignoreAbort) return
        cleanup()
        reject(new DOMException('传输已暂停。', 'AbortError'))
      }
      const operation = {
        advance() {
          const progress = [25, 65, 100][step++]!
          context.onProgress(progress)
          state.events.push(
            `progress ${context.session.uploadSessionId} ${progress} attempt ${attempt.id}`,
          )
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
    if (state.holdComplete) await hold('complete', id)
    return { fileId: session.fileId }
  }

  return {
    state,
    createUploadSession,
    transport,
    completeUploadSession,
    release,
    readback: () => ({
      counts: { ...state.counts },
      pending: state.pending,
      gates: state.gates.map((g) => ({ ...g })),
      events: [...state.events],
      attempts: attempts.map((a) => ({
        id: a.id,
        sessionId: a.sessionId,
        aborted: a.signal?.aborted ?? false,
        settled: a.settled,
      })),
    }),
    advance: () => [...pending].forEach((operation) => operation.advance()),
    fail: () => [...pending].forEach((operation) => operation.fail()),
  }
}
