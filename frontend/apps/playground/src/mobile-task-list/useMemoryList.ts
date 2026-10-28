import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
export interface MemoryRow {
  id: string
  title: string
}
export interface MemoryPage {
  rows: MemoryRow[]
  next: number | null
}
export interface MemoryRequest {
  source: string
  filter: string
  cursor: number
  signal: AbortSignal
}
/** Demo-host coordinator; deliberately not a public paging framework. */
export function useMemoryList(options: {
  source: () => string
  filter: () => string
  paused: () => boolean
  read?: (request: MemoryRequest) => Promise<MemoryPage>
  diagnostic?: (error: unknown) => void
}) {
  const rows = shallowRef<MemoryRow[]>([])
  const state = shallowRef<'unknown' | 'ready'>('unknown')
  const pending = shallowRef<'initial' | 'refresh' | 'append' | null>(null)
  const cursor = shallowRef<number | null>(0)
  const revision = shallowRef(0)
  const errorMessage = shallowRef<string>()
  const appendErrorMessage = shallowRef<string>()
  let controller: AbortController | undefined
  let alive = true
  function cancel() {
    controller?.abort()
    controller = undefined
    pending.value = null
  }
  function reset() {
    cancel()
    rows.value = []
    cursor.value = 0
    revision.value++
    state.value = 'unknown'
    errorMessage.value = undefined
    appendErrorMessage.value = undefined
    if (!options.paused()) void request(false)
  }
  async function request(append = false) {
    if (!options.read || options.paused() || pending.value || (append && cursor.value === null))
      return
    const source = options.source(),
      filter = options.filter()
    const current = new AbortController()
    controller = current
    const valid = () =>
      alive &&
      controller === current &&
      !current.signal.aborted &&
      !options.paused() &&
      options.source() === source &&
      options.filter() === filter
    const offset = append ? cursor.value! : 0
    pending.value = append ? 'append' : rows.value.length ? 'refresh' : 'initial'
    if (append) appendErrorMessage.value = undefined
    else errorMessage.value = undefined
    try {
      const page = await options.read({ source, filter, cursor: offset, signal: current.signal })
      if (!valid()) return
      const merged = new Map((append ? rows.value : []).map((row) => [row.id, row]))
      for (const row of page.rows) merged.set(row.id, row)
      rows.value = [...merged.values()]
      cursor.value = page.next
      revision.value++
      state.value = 'ready'
      errorMessage.value = undefined
      appendErrorMessage.value = undefined
    } catch (error) {
      if (!valid()) return
      options.diagnostic?.(error)
      if (append) appendErrorMessage.value = '后续内容暂时无法加载，原内容已保留。'
      else errorMessage.value = '暂时无法更新，请稍后重试。'
    } finally {
      if (valid()) {
        pending.value = null
        controller = undefined
      }
    }
  }
  watch(() => [options.source(), options.filter()], reset, { immediate: true })
  watch(
    options.paused,
    (paused) => {
      if (paused) cancel()
      else if (state.value === 'unknown') void request()
    },
    { flush: 'sync' },
  )
  onBeforeUnmount(() => {
    alive = false
    cancel()
  })
  return {
    rows,
    state,
    pending,
    revision,
    errorMessage,
    appendErrorMessage,
    hasMore: computed(() => (state.value === 'unknown' ? null : cursor.value !== null)),
    request,
  }
}
