<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, shallowRef, watch } from 'vue'
import { NvButton, NvCheckbox, NvInput } from '@nerv-iip/ui'
import SchedulingCandidatePicker from './SchedulingCandidatePicker.vue'
import SchedulingHorizonFields from './SchedulingHorizonFields.vue'
import type {
  SchedulingHorizonInput,
  SchedulingHorizonPreset,
  SchedulingHorizonValidation,
  SchedulingRequestItem,
  SchedulingRequestReceipt,
  SchedulingRequestSourceState,
  SchedulingSingleRequest,
} from './types'

const props = defineProps<{
  open: boolean
  sourceKey: string
  contextKey: string
  contextLabel?: string
  fixedItem?: SchedulingRequestItem | null
  initialKeyword?: string
  candidateState: SchedulingRequestSourceState
  candidateMessage?: string
  candidates: readonly SchedulingRequestItem[]
  initialHorizon: SchedulingHorizonInput
  presets: readonly SchedulingHorizonPreset[]
  timezoneLabel?: string
  validateHorizon?: (
    input: Readonly<SchedulingHorizonInput>,
    contextKey: string,
  ) => SchedulingHorizonValidation
  plans?: readonly { readonly key: string; readonly label: string }[]
  readOnly?: boolean
  disabledReason?: string
  submit?: (request: SchedulingSingleRequest) => Promise<SchedulingRequestReceipt | false>
}>()
const emit = defineEmits<{
  'update:open': [open: boolean]
  'retry:candidates': []
  scheduled: [receipt: SchedulingRequestReceipt, request: SchedulingSingleRequest]
}>()
const mode = ref<'new' | 'insert'>('new')
const selectedKey = ref('')
const keyword = ref('')
const horizon = ref<SchedulingHorizonInput>({ ...props.initialHorizon })
const priority = ref<number | null>(null)
const isRush = ref(false)
const planKey = ref('')
const pending = ref(false)
const feedback = ref('')
const receipt = shallowRef<SchedulingRequestReceipt>()
const dismissed = ref(false)
const dialog = ref<HTMLElement>()
let previousFocus: HTMLElement | null = null
let epoch = 0
const visible = computed(() => props.open && !dismissed.value)
const item = computed(
  () =>
    props.fixedItem ?? props.candidates.find((candidate) => candidate.key === selectedKey.value),
)
const validation = computed(
  () =>
    props.validateHorizon?.(horizon.value, props.contextKey) ?? {
      valid: false,
      message: '尚未提供时间范围校验。',
    },
)
const reason = computed(() => {
  if (props.readOnly) return props.disabledReason || '当前为只读'
  if (props.disabledReason) return props.disabledReason
  if (!item.value) return props.fixedItem ? '目标项目不可用。' : '请先选择项目。'
  if (item.value.disabledReason) return item.value.disabledReason
  if (mode.value === 'new' && priority.value == null) return '请填写优先级。'
  if (mode.value === 'insert' && !planKey.value) return '请先选择现有安排。'
  if (!validation.value.valid) return validation.value.message
  if (!props.submit) return '未提供提交方式。'
  return ''
})
function invalidate(clearResult = true) {
  epoch++
  pending.value = false
  feedback.value = ''
  if (clearResult) receipt.value = undefined
}
function reset() {
  invalidate()
  dismissed.value = false
  mode.value = 'new'
  selectedKey.value = ''
  keyword.value = props.initialKeyword ?? ''
  horizon.value = { ...props.initialHorizon }
  priority.value = props.fixedItem?.priority ?? null
  isRush.value = props.fixedItem?.isRush ?? false
  planKey.value = ''
}
function close() {
  invalidate(false)
  dismissed.value = true
  emit('update:open', false)
}
function trapTab(event: KeyboardEvent) {
  const controls = [
    ...(dialog.value?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
    ) ?? []),
  ]
  const first = controls[0]
  const last = controls.at(-1)
  if (!first || !last) return
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === dialog.value)
  ) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
function changeMode(next: 'new' | 'insert') {
  if (pending.value || mode.value === next) return
  invalidate()
  mode.value = next
}
function choose(key: string) {
  if (pending.value || selectedKey.value === key) return
  invalidate()
  selectedKey.value = key
  const next = props.candidates.find((candidate) => candidate.key === key)
  priority.value = next?.priority ?? null
  isRush.value = next?.isRush ?? false
}
function changeHorizon(value: SchedulingHorizonInput) {
  if (pending.value) return
  invalidate()
  horizon.value = value
}
function changePlan(key: string) {
  if (pending.value || props.readOnly) return
  invalidate()
  planKey.value = key
}
function changePriority(value: string | number) {
  const raw = String(value).trim()
  const next = Number(raw)
  priority.value = raw && Number.isFinite(next) ? next : null
}
async function submit() {
  if (pending.value || reason.value || !props.submit || !item.value) return
  const chosen = item.value
  const request: SchedulingSingleRequest = {
    sourceKey: props.sourceKey,
    contextKey: props.contextKey,
    itemKey: chosen.key,
    mode: mode.value,
    horizon: { ...horizon.value },
    ...(mode.value === 'insert' ? { planKey: planKey.value } : {}),
    priority: priority.value,
    isRush: isRush.value,
  }
  const ticket = ++epoch
  pending.value = true
  feedback.value = ''
  receipt.value = undefined
  try {
    const result = await props.submit(request)
    if (!current(ticket, request, chosen)) return
    if (result === false || !result?.key) {
      feedback.value = '请求未确认，请检查后重试。'
      return
    }
    receipt.value = result
    feedback.value = '本次请求已由来源确认。'
    emit('scheduled', result, request)
  } catch {
    if (current(ticket, request, chosen)) feedback.value = '请求失败，请检查后重试。'
  } finally {
    if (ticket === epoch) pending.value = false
  }
}
function current(ticket: number, request: SchedulingSingleRequest, chosen: SchedulingRequestItem) {
  return (
    ticket === epoch &&
    visible.value &&
    !props.readOnly &&
    props.sourceKey === request.sourceKey &&
    props.contextKey === request.contextKey &&
    mode.value === request.mode &&
    item.value === chosen &&
    horizon.value.mode === request.horizon.mode &&
    horizon.value.presetKey === request.horizon.presetKey &&
    horizon.value.startLocal === request.horizon.startLocal &&
    horizon.value.endLocal === request.horizon.endLocal &&
    (request.mode !== 'insert' || planKey.value === request.planKey)
  )
}
watch(
  () =>
    [props.open, props.sourceKey, props.contextKey, props.fixedItem, props.initialKeyword] as const,
  (next, previous) => {
    if (!props.open) {
      invalidate(false)
      dismissed.value = false
      return
    }
    if (!previous || next.some((value, index) => value !== previous[index])) reset()
  },
  { immediate: true, flush: 'sync' },
)
watch(
  () => props.readOnly,
  () => {
    invalidate(false)
  },
  { flush: 'sync' },
)
watch(
  () => props.candidates,
  (next) => {
    if (props.fixedItem || !selectedKey.value) return
    const selected = next.find((candidate) => candidate.key === selectedKey.value)
    if (!selected) {
      invalidate()
      selectedKey.value = ''
    } else invalidate()
  },
  { flush: 'sync' },
)
watch(
  () => props.plans,
  (next) => {
    if (mode.value !== 'insert') return
    invalidate()
    if (planKey.value && !next?.some((plan) => plan.key === planKey.value)) planKey.value = ''
  },
  { flush: 'sync' },
)
watch(
  () => [props.initialHorizon, props.submit] as const,
  () => {
    if (visible.value) invalidate()
  },
  { flush: 'sync' },
)
watch(
  visible,
  async (isVisible) => {
    if (typeof document === 'undefined') return
    if (isVisible) {
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      await nextTick()
      if (visible.value) dialog.value?.focus()
    } else if (previousFocus) {
      await nextTick()
      previousFocus.focus()
      previousFocus = null
    }
  },
  { immediate: true },
)
onUnmounted(() => {
  epoch++
})
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm"
    data-request-overlay
  >
    <section
      ref="dialog"
      role="dialog"
      aria-modal="true"
      aria-label="安排单项"
      tabindex="-1"
      class="grid max-h-[90vh] w-full max-w-3xl gap-4 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg"
      @keydown.esc.prevent="close"
      @keydown.tab="trapTab"
    >
      <header class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold">安排单项</h2>
          <p class="text-sm text-muted-foreground">
            {{ contextLabel || '当前安排' }} · 选择新安排或加入现有安排。
          </p>
        </div>
        <NvButton type="button" variant="ghost" aria-label="关闭安排窗口" @click="close"
          >关闭</NvButton
        >
      </header>
      <div class="flex gap-2" aria-label="安排方式">
        <NvButton
          type="button"
          :variant="mode === 'new' ? 'default' : 'outline'"
          :aria-pressed="mode === 'new'"
          :disabled="pending"
          data-action="new"
          @click="changeMode('new')"
          >新建安排</NvButton
        >
        <NvButton
          type="button"
          :variant="mode === 'insert' ? 'default' : 'outline'"
          :aria-pressed="mode === 'insert'"
          :disabled="pending"
          data-action="insert"
          @click="changeMode('insert')"
          >加入现有安排</NvButton
        >
      </div>
      <p
        v-if="mode === 'new'"
        role="status"
        class="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm"
      >
        新建安排仅包含所选项目；现有安排保持原样。
      </p>
      <p v-if="fixedItem" class="text-sm">
        目标项目：<strong>{{ fixedItem.label }}</strong
        ><span class="ml-2 font-mono text-xs text-muted-foreground">{{ fixedItem.key }}</span>
      </p>
      <SchedulingCandidatePicker
        v-else
        :source-key="sourceKey"
        :state="candidateState"
        :state-message="candidateMessage"
        :items="candidates"
        :selected-key="selectedKey"
        :keyword="keyword"
        :read-only="readOnly || pending"
        @update:keyword="keyword = $event"
        @update:selected-key="choose"
        @retry="emit('retry:candidates')"
      />
      <SchedulingHorizonFields
        :model-value="horizon"
        :presets="presets"
        :validation="validation"
        :timezone-label="timezoneLabel"
        :disabled="readOnly || pending"
        id-prefix="single-request"
        @update:model-value="changeHorizon"
      />
      <div v-if="mode === 'new'" class="flex flex-wrap gap-4 text-sm">
        <label class="grid gap-1"
          >优先级<NvInput
            type="number"
            :model-value="priority == null ? '' : String(priority)"
            :disabled="readOnly || pending"
            placeholder="—"
            aria-label="本次优先级"
            @update:model-value="changePriority($event)"
        /></label>
        <label class="flex items-center gap-2"
          ><NvCheckbox
            :model-value="isRush"
            :disabled="readOnly || pending"
            aria-label="本次加急"
            @update:model-value="isRush = Boolean($event)"
          />加急</label
        >
      </div>
      <div v-else class="grid gap-2 text-sm">
        <h3 class="font-medium">现有安排</h3>
        <p v-if="plans === undefined" role="status">现有安排由来源提供，当前尚未读取。</p>
        <p v-else-if="plans.length === 0" role="status">暂无可加入的安排。</p>
        <div
          v-for="plan in plans"
          :key="plan.key"
          class="flex items-center justify-between rounded-md border border-border p-2"
        >
          <span>{{ plan.label }}</span
          ><NvButton
            type="button"
            size="sm"
            variant="outline"
            :aria-pressed="planKey === plan.key"
            :disabled="readOnly || pending"
            :data-plan="plan.key"
            @click="changePlan(plan.key)"
            >{{ planKey === plan.key ? '已选择' : '选择' }}</NvButton
          >
        </div>
        <slot name="insertion-result" :item-key="item?.key" :plan-key="planKey" />
      </div>
      <p v-if="feedback" :role="receipt ? 'status' : 'alert'" class="text-sm">{{ feedback }}</p>
      <p v-if="receipt" class="text-sm">
        确认结果：{{ receipt.label
        }}<span class="ml-2 font-mono text-xs text-muted-foreground">{{ receipt.key }}</span>
      </p>
      <footer class="flex flex-wrap items-center justify-end gap-2">
        <NvButton type="button" variant="outline" @click="close">取消并关闭</NvButton
        ><NvButton
          type="button"
          data-action="submit-request"
          :disabled="Boolean(reason) || pending"
          :title="reason || (pending ? '请求进行中' : undefined)"
          @click="submit"
          >{{ pending ? '确认中…' : mode === 'new' ? '请求新建安排' : '请求加入安排' }}</NvButton
        >
      </footer>
      <p v-if="reason" role="status" class="text-sm text-muted-foreground">{{ reason }}</p>
    </section>
  </div>
</template>
