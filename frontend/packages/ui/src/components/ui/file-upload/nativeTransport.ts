import type { FileUploadSession, FileUploadTransportContext } from './types'

const tusVersion = '1.0.0'
const defaultChunkSizeBytes = 1024 * 1024

export async function uploadWithNativeFileStorageTransport(context: FileUploadTransportContext) {
  context.signal?.throwIfAborted()
  if (isTusSession(context.session)) {
    await uploadWithTus(context)
    return
  }

  if (isServerProxySession(context.session)) {
    await uploadWithServerProxy(context)
    return
  }

  throw new Error(
    `Unsupported upload mode/provider: ${context.session.uploadMode}/${context.session.provider}`,
  )
}

async function uploadWithTus({ file, session, onProgress, signal }: FileUploadTransportContext) {
  let offset = await readTusOffset(session, file.size, signal)
  onProgress(toProgress(offset, file.size))

  while (offset < file.size) {
    signal?.throwIfAborted()
    const chunk = file.slice(offset, Math.min(offset + defaultChunkSizeBytes, file.size))
    const response = await fetch(session.upload.url, {
      method: 'PATCH',
      headers: {
        ...session.upload.headers,
        'Tus-Resumable': tusVersion,
        'Upload-Offset': String(offset),
        'Content-Type': 'application/offset+octet-stream',
      },
      body: chunk,
      signal,
    })

    signal?.throwIfAborted()
    if (!response.ok) {
      throw new Error(toTusError(response.status))
    }

    const nextOffset = readOffset(response, file.size, 'PATCH')
    if (nextOffset !== offset + chunk.size) {
      throw new Error('Tus PATCH did not confirm the complete chunk Upload-Offset.')
    }
    offset = nextOffset
    onProgress(toProgress(offset, file.size))
  }
}

async function readTusOffset(session: FileUploadSession, size: number, signal?: AbortSignal) {
  const response = await fetch(session.upload.url, {
    method: 'HEAD',
    headers: {
      ...session.upload.headers,
      'Tus-Resumable': tusVersion,
    },
    signal,
  })

  signal?.throwIfAborted()
  if (!response.ok) {
    throw new Error(toTusError(response.status))
  }

  return readOffset(response, size, 'HEAD')
}

async function uploadWithServerProxy({
  file,
  session,
  onProgress,
  signal,
}: FileUploadTransportContext) {
  const response = await fetch(session.upload.url, {
    method: 'PUT',
    headers: {
      ...session.upload.headers,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
    signal,
  })

  signal?.throwIfAborted()
  if (!response.ok) {
    throw new Error(`Server-proxy upload failed with HTTP ${response.status}.`)
  }

  onProgress(100)
}

function isTusSession(session: FileUploadSession) {
  return session.uploadMode === 'tus' && session.provider === 'tus'
}

function isServerProxySession(session: FileUploadSession) {
  return session.uploadMode === 'server-proxy' && session.provider === 'server-proxy'
}

function toProgress(offset: number, size: number) {
  return size === 0 ? 100 : (offset / size) * 100
}

function toTusError(status: number) {
  if (status === 409) {
    return 'Upload offset changed. Please retry the upload.'
  }

  if (status === 412) {
    return 'Upload session is expired or not resumable.'
  }

  if (status === 413) {
    return 'Upload is larger than the session allows.'
  }

  if (status === 460) {
    return 'Upload checksum did not match.'
  }

  return `Upload failed with HTTP ${status}.`
}

function readOffset(response: Response, size: number, method: string) {
  const raw = response.headers.get('Upload-Offset')
  const offset = raw === null || !/^\d+$/.test(raw) ? NaN : Number(raw)
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > size) {
    throw new Error(`Invalid tus ${method} Upload-Offset: ${raw ?? 'missing'}.`)
  }
  return offset
}
