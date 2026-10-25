import { createHash } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

// Generated fixture, never a user file. This state dies with each Vite server.
const fixture = Buffer.from(Uint8Array.from({ length: 2 * 1024 * 1024 + 17 }, (_, i) => i % 251))
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const expectedHash = hash(fixture)
const prefix = '/__native-fixture'
const scenarios = new Set([
  'ok',
  'cancel',
  '409',
  '412',
  '413',
  '460',
  '403',
  '500',
  'network',
  'head-missing',
  'head-nan',
  'head-negative',
  'head-fraction',
  'head-oversize',
  'patch-missing',
  'patch-nan',
  'patch-negative',
  'patch-fraction',
  'patch-oversize',
  'patch-stall',
  'patch-backwards',
])

export function nativeFixture(): Plugin {
  const sessions = new Map<
    string,
    { mode: string; scenario: string; bytes: Buffer; failed: boolean; complete: boolean }
  >()
  const events: Record<string, unknown>[] = []
  let sequence = 0
  let pending = 0
  let aborted = 0

  async function body(req: IncomingMessage, max = fixture.length): Promise<Buffer> {
    const parts: Buffer[] = []
    let count = 0
    for await (const part of req) {
      count += part.length
      if (count > max) throw new Error('Fixture request too large')
      parts.push(Buffer.from(part))
    }
    return Buffer.concat(parts)
  }
  function readback() {
    return {
      expected: { size: fixture.length, sha256: expectedHash, source: 'generated i % 251' },
      pending,
      aborted,
      sessions: [...sessions].map(([id, s]) => ({
        id,
        mode: s.mode,
        scenario: s.scenario,
        offset: s.bytes.length,
        byteCount: s.bytes.length,
        sha256: hash(s.bytes),
        complete: s.complete,
      })),
      events: [...events],
    }
  }
  function middleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (!url.pathname.startsWith(prefix)) return next()
    const host = req.headers.host ?? ''
    if (
      !/^(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/.test(host) ||
      !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress ?? '') ||
      (req.headers.origin && req.headers.origin !== `http://${host}`)
    ) {
      res.writeHead(403).end('Loopback same-origin fixture only')
      return
    }
    // Read-only probes are not pending writes and cannot mutate a session.
    if (url.pathname === `${prefix}/readback` && req.method === 'GET') {
      res
        .writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
        .end(JSON.stringify(readback()))
      return
    }
    if (url.pathname === `${prefix}/reset` && req.method === 'POST') {
      if (pending) {
        res.writeHead(409).end('Pending operations must settle before reset')
        return
      }
      sessions.clear()
      events.length = 0
      aborted = 0
      res.writeHead(204).end()
      return
    }
    pending++
    const event: Record<string, unknown> = {
      method: req.method,
      path: url.pathname,
      headers: { ...req.headers },
    }
    events.push(event)
    if (events.length > 256) events.shift()
    let settled = false
    const settle = () => {
      if (!settled) {
        settled = true
        pending--
      }
    }
    res.once('finish', settle)
    res.once('close', () => {
      if (!res.writableFinished) {
        aborted++
        event.aborted = true
        event.status = 'aborted'
      }
      settle()
    })
    const send = (status: number, data?: unknown, headers: Record<string, string> = {}) => {
      event.status = status
      event.responseHeaders = headers
      event.responseBody = data ?? null
      res.writeHead(status, {
        'Cache-Control': 'no-store',
        ...headers,
        ...(data === undefined ? {} : { 'Content-Type': 'application/json' }),
      })
      res.end(data === undefined ? undefined : JSON.stringify(data))
    }
    void (async () => {
      if (url.pathname === `${prefix}/session` && req.method === 'POST') {
        const input = JSON.parse((await body(req, 1024)).toString())
        if (
          !['tus', 'server-proxy'].includes(input.mode) ||
          !scenarios.has(input.scenario) ||
          sessions.size >= 16
        )
          return send(400, { error: 'Unknown fixture or session limit' })
        const id = `fixture-${++sequence}`
        // Start tus with known nonzero bytes to prove actual resume.
        sessions.set(id, {
          mode: input.mode,
          scenario: input.scenario,
          bytes: input.mode === 'tus' ? Buffer.from(fixture.subarray(0, 17)) : Buffer.alloc(0),
          failed: false,
          complete: false,
        })
        send(201, {
          uploadSessionId: id,
          fileId: id,
          uploadMode: input.mode,
          provider: input.mode,
          expiresAtUtc: new Date(Date.now() + 3600000).toISOString(),
          upload: { url: `${prefix}/${id}`, headers: { 'X-Fixture-Session': id } },
        })
        return
      }
      const [, id, action] = url.pathname.slice(prefix.length).split('/')
      const session = sessions.get(id ?? '')
      if (!session) return send(404, { error: 'Unknown fixture session' })
      if (req.headers['x-fixture-session'] !== id)
        return send(403, { error: 'Missing fixture session header' })
      if (action === 'complete' && req.method === 'POST') {
        if (session.bytes.length !== fixture.length || hash(session.bytes) !== expectedHash)
          return send(409, { error: 'Fixture bytes incomplete' })
        session.complete = true
        return send(200, { fileId: id, size: session.bytes.length, sha256: hash(session.bytes) })
      }
      if (action) return send(404)
      if (session.mode === 'tus' && req.headers['tus-resumable'] !== '1.0.0') return send(412)
      if (req.method === 'HEAD' && session.mode === 'tus') {
        const invalid = invalidOffset(session.scenario, 'head', session.bytes.length)
        return send(200, undefined, {
          'Tus-Resumable': '1.0.0',
          ...(invalid === null ? {} : { 'Upload-Offset': invalid }),
        })
      }
      const method = session.mode === 'tus' ? 'PATCH' : 'PUT'
      if (req.method !== method) return send(405)
      const bytes = await body(req)
      event.body = { byteCount: bytes.length, sha256: hash(bytes) }
      const start = session.mode === 'tus' ? session.bytes.length : 0
      if (
        session.mode === 'tus' &&
        (req.headers['upload-offset'] !== String(start) ||
          req.headers['content-type'] !== 'application/offset+octet-stream' ||
          bytes.length > 1024 * 1024)
      )
        return send(409)
      if (
        !bytes.length ||
        start + bytes.length > fixture.length ||
        !bytes.equals(fixture.subarray(start, start + bytes.length))
      )
        return send(460)
      // Hold the second chunk until the browser actually aborts the request.
      if (session.scenario === 'cancel' && !session.failed && start > 17) {
        session.failed = true
        event.held = true
        await new Promise<void>((resolve) => res.once('close', resolve))
        return
      }
      // Chromium may transparently retry an idempotent PUT after a socket close.
      // Keep this scenario disconnected until explicit reset; never fake recovery.
      if (session.scenario === 'network') {
        event.status = 'network-close'
        res.destroy()
        return
      }
      if (!session.failed && (session.mode !== 'tus' || start > 17)) {
        session.failed = true
        if (/^\d+$/.test(session.scenario))
          return send(Number(session.scenario), { error: `Fixture HTTP ${session.scenario}` })
        if (session.scenario.startsWith('patch-')) {
          const invalid = invalidOffset(session.scenario, 'patch', start)
          return send(204, undefined, {
            'Tus-Resumable': '1.0.0',
            ...(invalid === null ? {} : { 'Upload-Offset': invalid }),
          })
        }
      }
      session.bytes = session.mode === 'tus' ? Buffer.concat([session.bytes, bytes]) : bytes
      send(
        204,
        undefined,
        session.mode === 'tus'
          ? { 'Tus-Resumable': '1.0.0', 'Upload-Offset': String(session.bytes.length) }
          : {},
      )
    })().catch((error: unknown) => {
      if (!res.destroyed && !res.headersSent) send(400, { error: String(error) })
    })
  }
  function invalidOffset(scenario: string, method: string, offset: number): string | null {
    if (!scenario.startsWith(`${method}-`)) return String(offset)
    return (
      {
        missing: null,
        nan: 'NaN',
        negative: '-1',
        fraction: '0.5',
        oversize: String(fixture.length + 1),
        stall: String(offset),
        backwards: String(offset - 1),
      }[scenario.slice(method.length + 1)] ?? (scenario.endsWith('missing') ? null : String(offset))
    )
  }
  return {
    name: 'loopback-native-file-fixture',
    config: () => ({ server: { host: '127.0.0.1' }, preview: { host: '127.0.0.1' } }),
    configResolved(config) {
      if (config.server.host !== '127.0.0.1' || config.preview.host !== '127.0.0.1')
        throw new Error('Native fixture requires 127.0.0.1 binding')
    },
    configureServer: (server) => {
      server.middlewares.use(middleware)
    },
    configurePreviewServer: (server) => {
      server.middlewares.use(middleware)
    },
  }
}
