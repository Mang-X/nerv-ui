<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, shallowRef, watch } from 'vue'
import {
  NvButton,
  NvEntityPicker,
  NvFilterBar,
  NvDataTable,
  NvInput,
  NvSheet,
  NvSheetContent,
  NvSheetHeader,
  NvSheetTitle,
  NvSheetDescription,
  NvTimeline,
  NvStatusBadge,
  displayValue,
  type NvDataTableColumn,
} from '@nerv-ui/ui'
import type { DirectoryFilter, DirectoryHost, DirectoryPage, DirectoryTimeline } from './contract'
const props = defineProps<{ host: DirectoryHost; filter: DirectoryFilter; readonly?: boolean }>()
const emit = defineEmits<{ 'update:filter': [value: DirectoryFilter] }>()
const page = shallowRef(1)
const data = ref<DirectoryPage>({ rows: [], total: 0 })
const loadedPage = shallowRef(1)
const loading = shallowRef(false)
const error = shallowRef('')
const selectedKey = shallowRef<string | null>(null)
const selected = computed(() => data.value.rows.find((row) => row.key === selectedKey.value))
const open = computed({
  get: () => selectedKey.value !== null,
  set: (value: boolean) => {
    if (!value) selectedKey.value = null
  },
})
const timeline = ref<DirectoryTimeline | null>(null)
const timelineLoading = shallowRef(false)
const timelineError = shallowRef('')
const name = shallowRef('')
const creating = shallowRef(false)
const createMessage = shallowRef('')
let queryVersion = 0
let queryController: AbortController | undefined
let timelineVersion = 0
let timelineController: AbortController | undefined
let createVersion = 0
let createController: AbortController | undefined
const entities = computed(() =>
  props.host.entities.filter((item) => !props.filter.parent || item.parent === props.filter.parent),
)
// Preserve membership across intermediate writes of in-place array reorders.
// Replacing the whole options array remains an immediate authority boundary.
const membership = shallowRef(props.host.entities.map(({ value, parent }) => ({ value, parent })))
function syncMembership() {
  membership.value = props.host.entities.map(({ value, parent }) => ({ value, parent }))
}
watch(() => props.host.entities, syncMembership, { flush: 'sync' })
watch(() => props.host.entities.map(({ value, parent }) => [value, parent]), syncMembership)
const effectiveFilter = computed(() => ({
  ...props.filter,
  entity: membership.value.some(
    (item) =>
      item.value === props.filter.entity &&
      (!props.filter.parent || item.parent === props.filter.parent),
  )
    ? props.filter.entity
    : '',
}))
function update(value: Partial<DirectoryFilter>) {
  if (props.readonly) return
  emit('update:filter', { ...effectiveFilter.value, ...value })
}
// NvFilterBar's input maintains a passive local value. Reconcile each proposal
// after the host has synchronously accepted it or left authority unchanged.
const keyword = shallowRef(props.filter.keyword)
watch(
  () => props.filter.keyword,
  (value) => {
    keyword.value = value
  },
  { flush: 'sync' },
)
async function updateKeyword(value: string) {
  keyword.value = value
  update({ keyword: value })
  await nextTick()
  keyword.value = props.filter.keyword
}
function parent(value: string) {
  update({ parent: value, entity: '' })
}
async function load() {
  const version = ++queryVersion
  queryController?.abort()
  const controller = new AbortController()
  queryController = controller
  const request = {
    source: props.host.source,
    filter: { ...effectiveFilter.value },
    page: page.value,
    pageSize: 2,
  }
  loading.value = true
  error.value = ''
  try {
    const result = await props.host.query(request, controller.signal)
    if (version !== queryVersion) return
    data.value = result
    loadedPage.value = request.page
  } catch {
    if (version === queryVersion) error.value = '暂时无法更新目录，请重试。'
  } finally {
    if (version === queryVersion) loading.value = false
  }
}
function invalidateCreate() {
  ++createVersion
  createController?.abort()
  creating.value = false
  createMessage.value = ''
}
watch(
  [
    () => props.host.source,
    () => props.host.query,
    () => props.host.timeline,
    () => props.host.create,
    () => effectiveFilter.value.parent,
    () => effectiveFilter.value.entity,
    () => effectiveFilter.value.keyword,
  ],
  () => {
    invalidateCreate()
    ++queryVersion
    queryController?.abort()
    data.value = { rows: [], total: 0 }
    selectedKey.value = null
    if (page.value !== 1) page.value = 1
    else void load()
  },
  { flush: 'sync', immediate: true },
)
watch(
  page,
  () => {
    invalidateCreate()
    selectedKey.value = null
    void load()
  },
  { flush: 'sync' },
)
watch(
  () => props.readonly,
  () => {
    invalidateCreate()
    selectedKey.value = null
  },
  { flush: 'sync' },
)
watch(
  () => JSON.stringify([props.filter.entity, effectiveFilter.value.entity, !!props.readonly]),
  () => {
    if (props.filter.entity && effectiveFilter.value.entity !== props.filter.entity)
      update({ entity: '' })
  },
  { immediate: true },
)
async function loadTimeline() {
  const version = ++timelineVersion
  timelineController?.abort()
  timeline.value = null
  timelineError.value = ''
  const row = selected.value
  if (!row) {
    timelineLoading.value = false
    return
  }
  const controller = new AbortController()
  timelineController = controller
  timelineLoading.value = true
  try {
    const result = await props.host.timeline({ ...row }, controller.signal)
    if (version === timelineVersion) timeline.value = result
  } catch {
    if (version === timelineVersion) timelineError.value = '暂时无法加载记录，请重试。'
  } finally {
    if (version === timelineVersion) timelineLoading.value = false
  }
}
// Batch array mutations so reorder never observes a transient missing row.
watch(selected, () => void loadTimeline())
async function create() {
  const callback = props.host.create
  if (!callback || props.readonly || creating.value || !name.value.trim() || !props.filter.parent)
    return
  const request = {
    source: props.host.source,
    filter: { ...effectiveFilter.value },
    page: page.value,
  }
  const version = ++createVersion
  function isCurrent() {
    // Read final live membership at commit time, independently of batched
    // rendering: a queued result can run before the membership watcher.
    const entity = props.host.entities.some(
      (item) =>
        item.value === props.filter.entity &&
        (!props.filter.parent || item.parent === props.filter.parent),
    )
      ? props.filter.entity
      : ''
    return (
      version === createVersion &&
      !props.readonly &&
      props.host.create === callback &&
      props.host.source === request.source &&
      page.value === request.page &&
      props.filter.parent === request.filter.parent &&
      props.filter.keyword === request.filter.keyword &&
      entity === request.filter.entity
    )
  }
  const controller = new AbortController()
  createController = controller
  creating.value = true
  createMessage.value = ''
  try {
    const result = await callback(name.value.trim(), props.filter.parent, controller.signal)
    if (!isCurrent()) return
    if (!result.receipt.trim() || !result.row.key) throw new Error('Missing receipt')
    createMessage.value = '条目已添加。'
    name.value = ''
    void load()
  } catch {
    if (isCurrent()) createMessage.value = '暂时无法添加，请重试。'
  } finally {
    if (isCurrent()) creating.value = false
  }
}
onUnmounted(() => {
  ++queryVersion
  ++timelineVersion
  ++createVersion
  queryController?.abort()
  timelineController?.abort()
  createController?.abort()
})
const columns: NvDataTableColumn[] = [
  { key: 'code', header: '编号' },
  { key: 'name', header: '名称' },
  { key: 'quantity', header: '数量', align: 'end' },
  { key: 'actions', header: '操作' },
]
const number = new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 3 })
const detailItems = computed(() =>
  selected.value
    ? [
        { label: '数量', value: selected.value.quantity },
        { label: '说明', value: selected.value.note },
      ].filter((item) => item.value !== null && item.value !== undefined && item.value !== '')
    : [],
)
</script>
<template>
  <section class="grid gap-4" aria-label="目录筛选与详情">
    <div class="grid gap-3 sm:grid-cols-2">
      <NvEntityPicker
        title="选择分区"
        :show-code="false"
        aria-label="分区"
        :model-value="filter.parent"
        :options="host.parents"
        clearable
        :disabled="readonly"
        @update:model-value="parent"
      />
      <NvEntityPicker
        title="选择条目"
        aria-label="条目"
        :model-value="effectiveFilter.entity"
        :options="entities"
        clearable
        :disabled="readonly"
        @update:model-value="update({ entity: $event })"
      />
    </div>
    <NvFilterBar
      :keyword="keyword"
      :inert="readonly || undefined"
      search-placeholder="输入名称或编号"
      aria-label="名称或编号查询"
      @update:keyword="updateKeyword"
      @reset="update({ parent: '', entity: '', keyword: '' })"
    />
    <div v-if="host.create" class="flex flex-wrap gap-3">
      <NvInput
        v-model="name"
        aria-label="新条目名称"
        :disabled="readonly || creating"
        placeholder="新条目名称"
      />
      <NvButton
        variant="brand"
        :disabled="readonly || creating || !name.trim() || !filter.parent"
        @click="create"
        >添加条目</NvButton
      >
      <p v-if="!filter.parent" class="text-sm text-muted-foreground">请先选择分区。</p>
      <p v-if="createMessage" role="status">{{ createMessage }}</p>
    </div>
    <p v-if="error" role="alert">
      {{ error }} <NvButton variant="outline" @click="load">重试目录</NvButton>
    </p>
    <p v-if="loading" role="status">正在更新目录…</p>
    <NvDataTable
      :columns="columns"
      :rows="data.rows"
      row-key="key"
      manual
      :page="loadedPage"
      :page-size="2"
      :total-items="data.total"
      :page-size-options="[2]"
      :searchable="false"
      :client-sort="false"
      :column-settings="false"
      @update:page="page = $event"
    >
      <template #cell-code="{ row }"
        ><span class="font-mono text-xs text-muted-foreground">{{ row.code }}</span></template
      >
      <template #cell-quantity="{ row }"
        ><span class="tabular-nums">{{
          row.quantity === null ? displayValue(null) : number.format(row.quantity)
        }}</span
        ><span class="font-normal text-muted-foreground"> 件</span></template
      >
      <template #cell-actions="{ row }"
        ><NvButton
          variant="ghost"
          :aria-label="`查看${row.name}（${row.code}）`"
          @click="selectedKey = row.key"
          >查看详情</NvButton
        ></template
      >
    </NvDataTable>
    <NvSheet v-model:open="open">
      <NvSheetContent size="lg" class="overflow-y-auto">
        <NvSheetHeader
          ><NvSheetTitle>{{ selected?.name ?? '条目已移除' }}</NvSheetTitle
          ><NvSheetDescription class="font-mono text-xs text-muted-foreground">{{
            selected?.code ?? '请关闭后重新选择目录条目。'
          }}</NvSheetDescription></NvSheetHeader
        >
        <div v-if="selected" class="grid gap-4 p-4">
          <p
            v-if="selected.note"
            class="whitespace-pre-wrap break-anywhere text-sm text-muted-foreground"
          >
            {{ selected.note }}
          </p>
          <dl v-for="item in detailItems" :key="item.label" class="text-sm">
            <dt>{{ item.label }}</dt>
            <dd
              :class="typeof item.value === 'number' ? 'text-right tabular-nums' : ''"
              class="whitespace-pre-wrap break-anywhere"
            >
              {{ typeof item.value === 'number' ? number.format(item.value) : item.value }}
            </dd>
          </dl>
          <NvButton
            :disabled="readonly || !selected.eligible"
            :title="selected.reason"
            @click="emit('update:filter', { ...filter, entity: selected.key })"
            >以此筛选</NvButton
          >
          <p v-if="!selected.eligible" class="text-sm text-muted-foreground">
            {{ selected.reason }}
          </p>
          <p v-if="timelineLoading" role="status">正在加载记录…</p>
          <p v-else-if="timelineError" role="alert">
            {{ timelineError }}
            <NvButton @click="!timelineLoading && loadTimeline()">重试记录</NvButton>
          </p>
          <template v-else-if="timeline?.state === 'ready'"
            ><NvTimeline v-if="timeline.items.length" :items="timeline.items" />
            <p v-else>暂无记录</p></template
          >
          <div v-else-if="timeline" class="grid gap-2">
            <NvStatusBadge
              :tone="timeline.state === 'forbidden' ? 'warning' : 'neutral'"
              :label="timeline.state === 'forbidden' ? '受限' : '未关联'"
            />
            <p>{{ timeline.message }}</p>
          </div>
        </div>
      </NvSheetContent>
    </NvSheet>
  </section>
</template>
