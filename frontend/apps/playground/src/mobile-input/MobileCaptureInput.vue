<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import {
  NvScanBar,
  NvMobileSwitch,
  NvMobileInput,
  NvMobileButton,
  NvNumberKeyboard,
  NvBottomSheet,
  NvMobileDialog,
} from '@nerv-ui/ui-mobile'

const props = defineProps<{ editing: boolean }>()
const enabled = shallowRef(true)
const keyboardOpen = shallowRef(false)
const sheetOpen = shallowRef(false)
const dialogOpen = shallowRef(false)
const active = computed(
  () =>
    enabled.value && !props.editing && !keyboardOpen.value && !sheetOpen.value && !dialogOpen.value,
)
const scanCount = shallowRef(0)
const lastScan = shallowRef('尚无记录')
function scan(value: string) {
  scanCount.value++
  lastScan.value = value
}
const number = shallowRef('')
const mode = shallowRef('decimal')
const extraKey = computed(() => (mode.value === 'decimal' ? '.' : mode.value === 'code' ? 'X' : ''))
const keyEvent = shallowRef('尚未按键')
const confirmed = shallowRef('尚未确认')
const sheetNote = shallowRef('')
const dialogNote = shallowRef('')
const savedNote = shallowRef('尚无备注')
// The sheet owns the lifetime of any keypad it opens, including Escape/gesture closes.
watch(sheetOpen, (open) => {
  if (!open) keyboardOpen.value = false
})
</script>

<template>
  <section
    aria-labelledby="capture-heading"
    class="space-y-4 rounded-2xl border border-border bg-card p-4"
  >
    <h2 id="capture-heading" class="text-lg font-semibold">接住一串灵感</h2>
    <div class="flex min-h-touch items-center justify-between gap-3">
      <label for="scan-enabled">持续接收扫码</label>
      <NvMobileSwitch id="scan-enabled" v-model="enabled" aria-label="持续接收扫码" />
    </div>
    <p aria-label="扫码状态" role="status" class="text-sm text-muted-foreground">
      {{ !enabled ? '扫码已暂停' : active ? '扫码接收中' : '扫码已让出焦点' }}
    </p>
    <label data-scan-region class="block space-y-2">
      <span class="text-sm font-medium">便签编码</span>
      <NvScanBar :active="active" placeholder="键入编码后按回车" @scan="scan" />
    </label>
    <output aria-label="扫码回显" class="block break-all text-sm"
      >{{ scanCount }} 次 · {{ lastScan }}</output
    >
    <p class="text-xs leading-relaxed text-muted-foreground">
      回车收下编码并清空输入。编辑其它输入框时暂停接收，离开后恢复；也可关闭持续接收。
    </p>
    <label for="number-mode" class="block text-sm font-medium">数字键盘模式</label>
    <select
      id="number-mode"
      v-model="mode"
      aria-label="数字键盘模式"
      class="min-h-touch w-full rounded-xl border border-border bg-card px-3 text-sm"
    >
      <option value="decimal">小数与正负号</option>
      <option value="code">数字与 X</option>
      <option value="digits">纯数字</option>
    </select>
    <label for="note-number" class="block text-sm font-medium">记录数值</label>
    <NvMobileInput
      id="note-number"
      :model-value="number"
      readonly
      inputmode="none"
      autocomplete="off"
      placeholder="点此录入"
      @click="keyboardOpen = true"
      @keydown.enter.prevent="keyboardOpen = true"
      @keydown.space.prevent="keyboardOpen = true"
    />
    <p class="text-xs text-muted-foreground">
      保留开头的零，追加输入最多 6 个字符；正负号可独立切换。
    </p>
    <NvMobileButton type="button" variant="outline" aria-label="清空数值" @click="number = ''"
      >清空数值</NvMobileButton
    >
    <output aria-label="键盘按键" class="block text-sm text-muted-foreground">{{
      keyEvent
    }}</output>
    <output aria-label="键盘确认" class="block break-all text-sm">{{ confirmed }}</output>
    <div class="flex flex-wrap gap-3">
      <NvMobileButton
        type="button"
        variant="primary"
        aria-label="打开数值抽屉"
        @click="sheetOpen = true"
        >在抽屉里继续</NvMobileButton
      >
      <NvMobileButton
        type="button"
        variant="outline"
        aria-label="打开记录提示"
        @click="dialogOpen = true"
        >留个提醒</NvMobileButton
      >
    </div>
    <output aria-label="提示回显" class="block text-sm text-muted-foreground">{{
      savedNote
    }}</output>
  </section>
  <NvBottomSheet v-model:open="sheetOpen" title="调整数值" description="写下一点补充，再收下数值。">
    <div class="space-y-4 pt-4">
      <label for="sheet-note" class="block text-sm">补充说明</label>
      <NvMobileInput id="sheet-note" v-model="sheetNote" autocomplete="off" />
      <label for="sheet-number" class="block text-sm">抽屉数值</label>
      <NvMobileInput
        id="sheet-number"
        :model-value="number"
        readonly
        inputmode="none"
        autocomplete="off"
        placeholder="点此录入"
        @click="keyboardOpen = true"
        @keydown.enter.prevent="keyboardOpen = true"
        @keydown.space.prevent="keyboardOpen = true"
      />
      <NvMobileButton type="button" block aria-label="关闭数值抽屉" @click="sheetOpen = false"
        >返回记录</NvMobileButton
      >
    </div>
  </NvBottomSheet>
  <NvMobileDialog
    v-model:open="dialogOpen"
    title="给自己留句话"
    description="写好后，回到手边的记录。"
    confirm-text="返回记录"
    @confirm="savedNote = dialogNote || '空备注'"
  >
    <label for="dialog-note" class="sr-only">提醒备注</label>
    <NvMobileInput
      id="dialog-note"
      v-model="dialogNote"
      autocomplete="off"
      placeholder="稍后想做的事"
    />
  </NvMobileDialog>
  <NvNumberKeyboard
    v-model="number"
    v-model:show="keyboardOpen"
    :title="`记录数值：${number || '空'}`"
    :extra-key="extraKey"
    :sign-toggle="mode === 'decimal'"
    :maxlength="6"
    confirm-text="收下数值"
    @press="keyEvent = `press：${$event}`"
    @confirm="confirmed = `confirm：${number || '空'}`"
  />
</template>
