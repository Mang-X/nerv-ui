<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { NvButton, NvCheckbox, NvInput } from '@nerv-iip/ui'
import type {
  SchedulingPriorityDraft,
  SchedulingRequestItem,
  SchedulingRequestSourceState,
} from './types'

const props = defineProps<{
  sourceKey: string
  state: SchedulingRequestSourceState
  items: readonly SchedulingRequestItem[]
  selectedKeys: readonly string[]
  stateMessage?: string
  readOnly?: boolean
  editDisabledReason?: string
  /** The host decides whether hidden selections persist. Default: retain. */
  selectionOnFilter?: 'retain' | 'clear-hidden'
  saveItem?: (key: string, draft: SchedulingPriorityDraft) => Promise<boolean>
}>()
const emit = defineEmits<{
  include: [keys: string[], included: boolean]
  retry: []
}>()
const search = ref('')
const drafts = reactive(new Map<string, SchedulingPriorityDraft>())
const feedback = reactive(new Map<string, string>())
const saving = ref('')
let epoch = 0
const filtered = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  if (!query) return props.items
  return props.items.filter((item) =>
    [item.key, item.label, item.detail, ...(item.searchTerms ?? [])].some((part) =>
      part?.toLocaleLowerCase().includes(query),
    ),
  )
})
const visibleKeys = computed(() => filtered.value.map((item) => item.key))
const selected = computed(() => new Set(props.selectedKeys))
const anyVisible = computed(() => props.state === 'ready' && visibleKeys.value.length > 0)
const hiddenSelectedKeys = computed(() => {
  if (props.selectionOnFilter !== 'clear-hidden' || props.state !== 'ready' || !search.value.trim())
    return []
  const visible = new Set(visibleKeys.value)
  return [...new Set(props.selectedKeys.filter((key) => !visible.has(key)))].sort()
})
const requestedHidden = new Set<string>()
let requestedSource = props.sourceKey
function reason(item?: SchedulingRequestItem) {
  return props.readOnly ? '当前为只读' : item?.disabledReason || props.editDisabledReason || ''
}
function values(item: SchedulingRequestItem): SchedulingPriorityDraft {
  return drafts.get(item.key) ?? { priority: item.priority ?? null, isRush: item.isRush ?? false }
}
function edit(item: SchedulingRequestItem, patch: Partial<SchedulingPriorityDraft>) {
  if (reason(item) || saving.value) return
  drafts.set(item.key, { ...values(item), ...patch })
  feedback.delete(item.key)
}
function changePriority(item: SchedulingRequestItem, input: string | number) {
  const raw = String(input).trim()
  if (!raw) {
    edit(item, { priority: null })
    return
  }
  const priority = Number(raw)
  if (Number.isFinite(priority)) edit(item, { priority })
}
function include(keys: readonly string[], included: boolean) {
  if (props.readOnly || props.state !== 'ready') return
  const visible = new Set(visibleKeys.value)
  const eligible = keys.filter(
    (key) => visible.has(key) && !props.items.find((item) => item.key === key)?.disabledReason,
  )
  if (eligible.length) emit('include', [...eligible], included)
}
async function save(item: SchedulingRequestItem) {
  if (reason(item) || saving.value || !drafts.has(item.key)) return
  if (!props.saveItem) {
    feedback.set(item.key, '未提供保存方式，草稿仍在本页。')
    return
  }
  const ticket = ++epoch
  const source = props.sourceKey
  const row = item
  const draft = { ...values(item) }
  saving.value = item.key
  try {
    const confirmed = await props.saveItem(item.key, draft)
    if (
      ticket !== epoch ||
      source !== props.sourceKey ||
      props.readOnly ||
      !props.items.includes(row)
    )
      return
    if (confirmed === true) {
      drafts.delete(item.key)
      feedback.set(item.key, '已确认；新值以来源更新为准。')
    } else feedback.set(item.key, '保存未确认，草稿仍可重试。')
  } catch {
    if (ticket === epoch) feedback.set(item.key, '保存失败，草稿仍可重试。')
  } finally {
    if (ticket === epoch) saving.value = ''
  }
}
watch(
  () => [props.sourceKey, props.readOnly] as const,
  () => {
    epoch++
    saving.value = ''
    if (props.readOnly) feedback.clear()
  },
)
watch(
  () => props.sourceKey,
  () => {
    search.value = ''
    drafts.clear()
    feedback.clear()
  },
)
watch(
  () => props.items,
  (next, previous) => {
    if (next === previous) return
    epoch++
    saving.value = ''
    const keys = new Set(next.map((item) => item.key))
    for (const key of drafts.keys()) if (!keys.has(key)) drafts.delete(key)
    for (const key of feedback.keys()) if (!keys.has(key)) feedback.delete(key)
  },
)
watch(
  () => JSON.stringify([props.sourceKey, props.readOnly, hiddenSelectedKeys.value]),
  () => {
    if (requestedSource !== props.sourceKey) {
      requestedHidden.clear()
      requestedSource = props.sourceKey
    }
    if (props.readOnly) {
      requestedHidden.clear()
      return
    }
    const hidden = new Set(hiddenSelectedKeys.value)
    for (const key of requestedHidden) if (!hidden.has(key)) requestedHidden.delete(key)
    const newlyHidden = hiddenSelectedKeys.value.filter((key) => !requestedHidden.has(key))
    for (const key of newlyHidden) requestedHidden.add(key)
    if (newlyHidden.length) emit('include', newlyHidden, false)
  },
  { flush: 'sync' },
)
onUnmounted(() => {
  epoch++
})
</script>

<template>
  <section class="grid gap-3 rounded-lg border border-border bg-card p-4" aria-label="候选项目池">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="font-semibold">候选项目池</h2>
        <p class="text-sm text-muted-foreground">
          已选 <span class="tabular-nums">{{ selectedKeys.length }}</span> 项；筛选外选择{{
            selectionOnFilter === 'clear-hidden' ? '清除' : '保留'
          }}。
        </p>
      </div>
      <slot name="scope" />
    </header>
    <p v-if="readOnly || editDisabledReason" role="status" class="text-sm text-muted-foreground">
      {{ readOnly ? '当前为只读，选择与保存不可用。' : editDisabledReason }}
    </p>
    <p
      v-if="state === 'unready'"
      role="status"
      class="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm"
    >
      {{ stateMessage || '范围尚未就绪，尚未读取候选项目。' }}
    </p>
    <p v-else-if="state === 'loading'" role="status" class="p-3 text-sm text-muted-foreground">
      正在读取候选项目…
    </p>
    <div
      v-else-if="state === 'error'"
      role="alert"
      class="rounded-md border border-destructive/30 p-3 text-sm"
    >
      <p>{{ stateMessage || '候选项目读取失败，当前无法判断可选项目。' }}</p>
      <NvButton type="button" size="sm" variant="outline" @click="emit('retry')">重试</NvButton>
    </div>
    <p v-else-if="items.length === 0" role="status" class="p-3 text-sm text-muted-foreground">
      暂无可选项目。
    </p>
    <template v-else>
      <div class="flex flex-wrap items-center gap-2">
        <NvInput
          v-model="search"
          type="text"
          aria-label="搜索候选项目"
          placeholder="搜索名称或编号"
          class="max-w-64"
          @keydown.esc.prevent="search = ''"
        />
        <NvButton v-if="search" type="button" variant="ghost" @click="search = ''"
          >清空搜索</NvButton
        >
        <span class="text-sm text-muted-foreground tabular-nums"
          >{{ filtered.length }} / {{ items.length }}</span
        >
        <NvButton
          type="button"
          size="sm"
          variant="outline"
          data-action="include-visible"
          :disabled="!anyVisible || readOnly"
          :title="readOnly ? '当前为只读' : '仅加入当前显示的项目'"
          @click="include(visibleKeys, true)"
          >加入当前显示项</NvButton
        >
        <NvButton
          type="button"
          size="sm"
          variant="ghost"
          data-action="exclude-visible"
          :disabled="!anyVisible || readOnly"
          :title="readOnly ? '当前为只读' : '仅移出当前显示的项目'"
          @click="include(visibleKeys, false)"
          >移出当前显示项</NvButton
        >
      </div>
      <p v-if="filtered.length === 0" role="status" class="p-3 text-sm text-muted-foreground">
        没有匹配「{{ search.trim() }}」的项目。
      </p>
      <p v-if="filtered.length" class="text-xs text-muted-foreground sm:hidden">
        左右滑动可查看项目的全部信息与操作。
      </p>
      <div v-if="filtered.length" class="max-h-80 overflow-auto rounded-md border border-border">
        <table class="w-full text-sm" style="min-width: 900px">
          <thead class="bg-muted text-left">
            <tr>
              <th class="p-2">选择</th>
              <th class="p-2">项目</th>
              <th class="p-2">详情</th>
              <th class="p-2">期望时间</th>
              <th class="p-2">紧迫度</th>
              <th class="p-2">优先级</th>
              <th class="p-2">加急</th>
              <th class="p-2">确认</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filtered" :key="item.key" class="border-t border-border">
              <td class="p-2">
                <NvCheckbox
                  :model-value="selected.has(item.key)"
                  :disabled="readOnly || Boolean(item.disabledReason)"
                  :title="reason(item)"
                  :aria-label="`选择 ${item.label}`"
                  @update:model-value="include([item.key], Boolean($event))"
                />
              </td>
              <td class="p-2 font-medium">
                {{ item.label
                }}<span class="block font-mono text-xs text-muted-foreground">{{ item.key }}</span>
              </td>
              <td class="p-2">{{ item.detail || '—' }}</td>
              <td class="p-2">{{ item.dueDisplay || '—' }}</td>
              <td class="p-2">{{ item.urgencyDisplay || '—' }}</td>
              <td class="p-2">
                <NvInput
                  type="number"
                  class="w-24 text-right tabular-nums"
                  :aria-label="`优先级 ${item.key}`"
                  :model-value="values(item).priority == null ? '' : String(values(item).priority)"
                  placeholder="—"
                  :disabled="Boolean(reason(item)) || Boolean(saving)"
                  :title="reason(item) || (saving ? '正在确认其他草稿' : undefined)"
                  @update:model-value="changePriority(item, $event)"
                />
              </td>
              <td class="p-2">
                <NvCheckbox
                  :model-value="values(item).isRush"
                  :aria-label="`加急 ${item.key}`"
                  :disabled="Boolean(reason(item)) || Boolean(saving)"
                  :title="reason(item) || (saving ? '正在确认其他草稿' : undefined)"
                  @update:model-value="edit(item, { isRush: Boolean($event) })"
                />
              </td>
              <td class="p-2">
                <NvButton
                  type="button"
                  size="sm"
                  variant="outline"
                  :data-save="item.key"
                  :disabled="Boolean(reason(item)) || Boolean(saving) || !drafts.has(item.key)"
                  :title="reason(item) || (saveItem ? '确认本行草稿' : '未提供保存方式')"
                  @click="save(item)"
                  >{{ saving === item.key ? '确认中…' : '保存' }}</NvButton
                >
                <p v-if="feedback.get(item.key)" role="status" class="text-xs">
                  {{ feedback.get(item.key) }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>
