<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  NvAppShellMobile,
  NvNavBar,
  NvScanBar,
  NvPicker,
  NvMobileInput,
  NvMobileButton,
  NvNumberKeyboard,
  NvMobileResult,
  NvMobileTag,
  NvMobileSteps,
} from '@nerv-ui/ui-mobile'
import type { FlowInput } from './flow'
const props = defineProps<{ input: FlowInput }>()
const emit = defineEmits<{ code: [value: string] }>()
const key = ref('')
const quantity = ref('')
const step = ref(0)
const picker = ref(false)
const keyboard = ref(false)
const pending = ref(false)
const error = ref('')
const receipt = ref('')
const selected = computed(() => props.input.candidates.find((c) => c.key === key.value))
const options = computed(() =>
  props.input.candidates.map((c) => ({ value: c.key, label: c.label })),
)
const restriction = computed(() =>
  !selected.value
    ? '请选择一项安排'
    : !selected.value.eligible
      ? selected.value.reason
      : props.input.validate(quantity.value, selected.value),
)
let revision = 0
let controller: AbortController | undefined
function invalidate() {
  revision++
  controller?.abort()
  pending.value = false
  error.value = ''
  receipt.value = ''
  keyboard.value = false
  picker.value = false
}
watch(
  [() => props.input.source, () => props.input.code],
  () => {
    invalidate()
    key.value = ''
    quantity.value = ''
    step.value = 0
  },
  { flush: 'sync' },
)
watch(
  () => JSON.stringify(props.input.candidates),
  () => {
    invalidate()
    if (!selected.value) {
      key.value = ''
      quantity.value = ''
      step.value = 0
    } else if (!selected.value.eligible) step.value = 0
  },
  { flush: 'sync' },
)
watch(
  () => props.input.readonly,
  () => {
    const completed = receipt.value
    invalidate()
    receipt.value = completed
  },
  { flush: 'sync' },
)
watch(
  key,
  () => {
    invalidate()
    quantity.value = ''
    step.value = 0
  },
  { flush: 'sync' },
)
function back() {
  const completed = receipt.value
  invalidate()
  receipt.value = completed
  step.value = 0
}
function scan(code: string) {
  if (!props.input.readonly) emit('code', code)
}
async function execute() {
  if (
    pending.value ||
    props.input.readonly ||
    restriction.value ||
    !selected.value ||
    receipt.value
  )
    return
  const current = ++revision
  const signal = (controller = new AbortController()).signal
  pending.value = true
  error.value = ''
  keyboard.value = false
  try {
    const result = await props.input.execute(
      { code: props.input.code, key: key.value, quantity: quantity.value },
      signal,
    )
    if (current !== revision) return
    if (!result?.receipt?.trim()) {
      error.value = '尚未收到确认，请重试'
      return
    }
    receipt.value = result.receipt
  } catch {
    if (current === revision) error.value = '暂时未能完成，请重试'
  } finally {
    if (current === revision) pending.value = false
  }
}
onBeforeUnmount(invalidate)
</script>
<template>
  <NvAppShellMobile class="relative">
    <template #header><NvNavBar title="收好一份安排" back @back="back" /></template>
    <div class="space-y-5 p-4">
      <a href="#mobile" class="inline-flex min-h-touch items-center text-brand">返回周末随行</a>
      <NvMobileSteps :steps="[{ label: '选择安排' }, { label: '确认数量' }]" :current="step" />
      <label v-if="!input.readonly && step === 0" class="block"
        >安排编码
        <NvScanBar
          :key="input.source + ':' + input.code"
          :active="false"
          placeholder="键入或扫描编码后按回车"
          @scan="scan"
        />
      </label>
      <p aria-label="当前编码" class="font-mono text-xs text-muted-foreground">
        {{ input.code || '尚未选择编码' }}
      </p>
      <NvMobileButton :disabled="input.readonly || !options.length" @click="picker = true"
        >切换安排</NvMobileButton
      >
      <NvPicker v-model="key" v-model:open="picker" :options="options" title="选择安排" />
      <section
        v-if="selected"
        aria-label="安排详情"
        class="space-y-3 rounded-xl border border-border bg-card p-4"
      >
        <h1 class="text-xl font-semibold tracking-tight">{{ selected.label }}</h1>
        <NvMobileTag :variant="selected.status.tone">{{ selected.status.label }}</NvMobileTag>
        <p class="whitespace-pre-wrap break-words">{{ selected.detail }}</p>
        <p class="text-right">
          <span class="tabular-nums">{{
            selected.quantity === null
              ? '尚未确认'
              : selected.quantity.toLocaleString(undefined, { maximumFractionDigits: 3 })
          }}</span
          ><span class="font-normal text-muted-foreground"> {{ selected.unit }}</span>
        </p>
        <p v-if="!selected.eligible" role="status">{{ selected.reason }}</p>
      </section>
      <template v-if="selected && step === 1">
        <label for="flow-quantity">本次数量</label>
        <NvMobileInput
          id="flow-quantity"
          :model-value="quantity"
          readonly
          inputmode="none"
          :disabled="input.readonly || pending || !!receipt"
          class="text-right tabular-nums"
          placeholder="尚未填写"
          @click="keyboard = true"
          @keydown.enter.prevent="keyboard = true"
          @keydown.space.prevent="keyboard = true"
        />
        <NvNumberKeyboard
          v-model="quantity"
          v-model:show="keyboard"
          title="本次数量"
          :maxlength="12"
          @confirm="keyboard = false"
        />
        <p v-if="restriction" role="status">{{ restriction }}</p>
      </template>
      <div v-if="error" role="alert">
        <NvMobileResult status="error" title="暂未完成" :description="error" />
      </div>
      <div v-if="receipt" role="status">
        <NvMobileResult status="success" title="已收到确认" :description="receipt" />
      </div>
    </div>
    <template #footer
      ><div class="flex gap-3 p-4">
        <NvMobileButton
          v-if="step === 0"
          :disabled="!selected || !selected.eligible || input.readonly"
          @click="step = 1"
          >下一步</NvMobileButton
        >
        <NvMobileButton
          v-else
          :disabled="input.readonly || pending || !!restriction || !!receipt"
          :loading="pending"
          @click="execute"
          >{{ error ? '重试' : '确认安排' }}</NvMobileButton
        >
      </div></template
    >
  </NvAppShellMobile>
</template>
