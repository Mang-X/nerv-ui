<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import PullRefresh from '../pull-refresh/PullRefresh.vue'
import InfiniteList from '../infinite-list/InfiniteList.vue'
import Empty from '../empty/Empty.vue'
import ErrorRetry from '../error-retry/ErrorRetry.vue'
import Button from '../button/MobileButton.vue'
import type { MobileListPosition, MobileListStorage } from './types'

const props = defineProps<{
  sourceKey: string
  filterKey: string
  /** Opaque committed cursor/revision; changes only after a successful page. */
  pageKey: string | number
  loaded: number
  state: 'unknown' | 'ready'
  hasMore: boolean | null
  pending?: 'initial' | 'refresh' | 'append' | null
  paused?: boolean
  errorMessage?: string
  appendErrorMessage?: string
  emptyDescription?: string
  storage?: MobileListStorage
}>()
const emit = defineEmits<{
  refresh: []
  loadMore: []
  retry: []
  retryLoadMore: []
  'update:paused': [value: boolean]
  restoreFilter: [filterKey: string]
  storageError: [error: unknown]
}>()
const root = shallowRef<HTMLElement>()
const refreshing = computed(() => props.pending === 'refresh')
const appending = computed(() => props.pending === 'append')
const target = shallowRef<number>()
let requestedFilter: string | undefined
let epoch = 0
let filterEpoch = 0
let active = false
let attempted: string | undefined
let requestedPage: string | number | undefined
let programmaticTop: number | undefined
const blocked = computed(
  () => !!props.pending || !!props.paused || !!props.errorMessage || !!props.appendErrorMessage,
)
const identity = () => [props.sourceKey, props.filterKey, props.storage] as const
let owner = identity()
function current() {
  return (
    active &&
    owner[0] === props.sourceKey &&
    owner[1] === props.filterKey &&
    owner[2] === props.storage
  )
}
function cancel(preserveFilterRequest = false) {
  epoch++
  if (!preserveFilterRequest) filterEpoch++
  target.value = undefined
  attempted = undefined
  requestedPage = undefined
  programmaticTop = undefined
}
function save(top: number) {
  if (!current() || !props.storage) return
  try {
    props.storage.save(owner[0], { filterKey: owner[1], scrollTop: target.value ?? top })
  } catch (error) {
    emit('storageError', error)
  }
}
function loadPosition() {
  cancel()
  requestedFilter = undefined
  owner = identity()
  programmaticTop = 0
  const scroller = root.value?.querySelector<HTMLElement>('.nv-m-pr-scroll')
  if (scroller) scroller.scrollTop = 0
  if (!props.storage) return
  let state: MobileListPosition | undefined
  try {
    state = props.storage.load(props.sourceKey)
  } catch (error) {
    emit('storageError', error)
    return
  }
  if (
    !state ||
    typeof state.filterKey !== 'string' ||
    !Number.isFinite(state.scrollTop) ||
    state.scrollTop < 0
  )
    return
  if (state.filterKey !== props.filterKey) {
    requestedFilter = state.filterKey
    const source = props.sourceKey,
      storage = props.storage
    const ticket = filterEpoch
    emit('restoreFilter', state.filterKey)
    // The host may refuse. Never query or scroll under a speculative filter.
    void nextTick(() => {
      if (
        active &&
        ticket === filterEpoch &&
        props.sourceKey === source &&
        props.storage === storage &&
        props.filterKey === state?.filterKey
      )
        loadPosition()
    })
    return
  }
  target.value = state.scrollTop
  void restore()
}
async function restore() {
  const ticket = epoch
  await nextTick()
  if (
    ticket !== epoch ||
    !current() ||
    blocked.value ||
    target.value === undefined ||
    props.state !== 'ready'
  )
    return
  const scroller = root.value?.querySelector<HTMLElement>('.nv-m-pr-scroll')
  if (!scroller) return
  const top = Math.min(target.value, Math.max(0, scroller.scrollHeight - scroller.clientHeight))
  programmaticTop = top
  scroller.scrollTop = top
  if (scroller.scrollTop >= target.value - 1 || props.hasMore === false) {
    target.value = undefined
    save(scroller.scrollTop)
  } else if (props.hasMore === true && requestedPage !== props.pageKey) {
    requestedPage = props.pageKey
    emit('loadMore')
  }
}
function scroll(top: number) {
  if (!current()) return
  if (top === programmaticTop) {
    programmaticTop = undefined
    return
  }
  cancel()
  save(top)
}
function manual(event: Event) {
  if (event.type !== 'wheel' && (event.target as HTMLElement)?.closest('button, select, input, a'))
    return
  cancel()
}
function request(kind: 'refresh' | 'loadMore' | 'retry' | 'retryLoadMore') {
  if (!current() || props.pending || props.paused) return
  if (kind === 'loadMore' && (props.hasMore !== true || blocked.value)) return
  const key = `${props.pageKey}:${kind}`
  if (attempted === key) return
  attempted = key
  if (kind === 'refresh' || kind === 'retry') cancel()
  if (kind === 'refresh') emit('refresh')
  else if (kind === 'loadMore') emit('loadMore')
  else if (kind === 'retry') emit('retry')
  else emit('retryLoadMore')
}
watch(
  () => [props.sourceKey, props.storage],
  () => {
    if (active) loadPosition()
  },
  { flush: 'sync' },
)
watch(
  () => props.paused,
  (paused) => {
    if (paused) {
      epoch++
      filterEpoch++
      requestedPage = undefined
    }
  },
  { flush: 'sync' },
)
watch(
  () => props.filterKey,
  () => {
    cancel(props.filterKey === requestedFilter)
    owner = identity()
    // Explicit filter changes start at the top, and never reload another filter's position.
    programmaticTop = 0
    const el = root.value?.querySelector<HTMLElement>('.nv-m-pr-scroll')
    if (el) el.scrollTop = 0
    if (props.filterKey !== requestedFilter) save(0)
    requestedFilter = undefined
  },
)
watch(
  () => [props.pageKey, props.pending, props.paused, props.state, props.hasMore, props.loaded],
  () => {
    attempted = undefined
    void restore()
  },
  { flush: 'post' },
)
onMounted(() => {
  active = true
  loadPosition()
})
onBeforeUnmount(() => {
  active = false
  cancel()
})
</script>

<template>
  <section
    ref="root"
    data-slot="nv-mobile-task-list-shell"
    class="nv-m-task-list flex h-full min-h-0 flex-col"
    :aria-busy="!!pending"
    @wheel.passive="manual"
    @pointerdown="manual"
    @keydown="manual"
  >
    <div v-if="$slots.filters" class="shrink-0"><slot name="filters" /></div>
    <div class="flex flex-wrap gap-3 p-3">
      <Button :disabled="!!pending || paused" @click="request('refresh')">刷新</Button>
      <Button @click="emit('update:paused', !paused)">{{ paused ? '继续' : '暂停' }}</Button>
    </div>
    <p v-if="paused" role="status" class="px-3 text-sm text-muted-foreground">已暂停</p>
    <p
      v-else-if="state === 'unknown' && !pending && !errorMessage"
      role="status"
      class="px-3 text-sm text-muted-foreground"
    >
      等待加载
    </p>
    <p v-if="pending === 'initial'" role="status" class="px-3 text-sm text-muted-foreground">
      加载中…
    </p>
    <ErrorRetry
      v-if="errorMessage && loaded === 0"
      :message="errorMessage"
      :pending="!!pending || paused"
      @retry="request('retry')"
    />
    <PullRefresh
      class="min-h-0 flex-1"
      :model-value="refreshing"
      @update:model-value="() => {}"
      @refresh="request('refresh')"
      @scroll="scroll"
    >
      <Empty
        v-if="state === 'ready' && !pending && !errorMessage && loaded === 0"
        :description="emptyDescription ?? '当前筛选下暂无内容。'"
      />
      <slot v-else />
      <ErrorRetry
        v-if="errorMessage && loaded > 0"
        :message="errorMessage"
        :pending="!!pending || paused"
        @retry="request('retry')"
      />
      <ErrorRetry
        v-if="appendErrorMessage"
        :message="appendErrorMessage"
        :pending="!!pending || paused"
        @retry="request('retryLoadMore')"
      />
      <InfiniteList
        v-if="loaded > 0"
        parent-scroll
        :model-value="appending"
        @update:model-value="() => {}"
        :finished="hasMore === false"
        :paused="blocked || hasMore === null || target !== undefined"
        @load="request('loadMore')"
      />
      <Button
        v-if="loaded > 0 && hasMore === true"
        :disabled="blocked || target !== undefined"
        @click="request('loadMore')"
        >加载更多</Button
      >
      <p
        v-if="hasMore === null && state === 'ready'"
        role="status"
        class="p-3 text-sm text-muted-foreground"
      >
        后续内容尚未确认
      </p>
    </PullRefresh>
  </section>
</template>
