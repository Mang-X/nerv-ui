<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import {
  NvBottomSheet,
  NvMobileButton,
  NvMobileDialog,
  NvMobileInput,
  NvNumberKeyboard,
} from '@nerv-ui/ui-mobile'
const sheetOpen = shallowRef(false)
const keyboardOpen = shallowRef(false)
const note = shallowRef('')
const duration = shallowRef('')
const saved = shallowRef<{ note: string; duration: string }>()
function openSheet() {
  note.value = saved.value?.note ?? ''
  duration.value = saved.value?.duration ?? ''
  sheetOpen.value = true
}
function saveSheet() {
  saved.value = { note: note.value, duration: duration.value }
  sheetOpen.value = false
}
watch(sheetOpen, (open) => {
  if (!open) keyboardOpen.value = false
})
const dialogOpen = shallowRef(false)
const reminder = shallowRef('')
const savedReminder = shallowRef('')
const cancelCount = shallowRef(0)
function openDialog() {
  reminder.value = savedReminder.value
  dialogOpen.value = true
}
</script>

<template>
  <section
    aria-labelledby="panels-heading"
    class="space-y-4 rounded-2xl border border-border bg-card p-4"
  >
    <h2 id="panels-heading" class="text-lg font-semibold">留下一点安排</h2>
    <div class="flex flex-wrap gap-3">
      <NvMobileButton @click="openSheet">写下安排</NvMobileButton>
      <NvMobileButton variant="outline" @click="openDialog">留个提醒</NvMobileButton>
    </div>
    <output aria-label="安排回显" class="block break-all text-sm">{{
      saved ? `${saved.note || '空备注'} · 时长 ${saved.duration || '空'}` : '尚未收下安排'
    }}</output>
    <output aria-label="提醒回显" class="block break-all text-sm"
      >{{ savedReminder || '尚无提醒' }} · 取消 {{ cancelCount }} 次</output
    >
    <p class="text-xs leading-relaxed text-muted-foreground">
      抽屉可拖动把手、点遮罩或按 Escape 放弃。时长键盘单独收起，安排仍待确认。提醒点遮罩保留，取消与
      Escape 均不提交。
    </p>
  </section>
  <NvBottomSheet
    v-model:open="sheetOpen"
    title="写下安排"
    description="备注与时长会在收下安排后一起保存。"
  >
    <div class="space-y-4 pt-4">
      <label for="arrangement-note" class="block text-sm">安排备注</label>
      <NvMobileInput id="arrangement-note" v-model="note" autocomplete="off" />
      <label for="arrangement-duration" class="block text-sm">预留时长</label>
      <NvMobileInput
        id="arrangement-duration"
        :model-value="duration"
        readonly
        inputmode="none"
        autocomplete="off"
        placeholder="点此填写"
        @click="keyboardOpen = true"
        @keydown.enter.prevent="keyboardOpen = true"
        @keydown.space.prevent="keyboardOpen = true"
      />
      <div class="flex flex-wrap gap-3">
        <NvMobileButton variant="outline" @click="sheetOpen = false">放弃安排</NvMobileButton>
        <NvMobileButton variant="primary" @click="saveSheet">收下安排</NvMobileButton>
      </div>
    </div>
  </NvBottomSheet>
  <NvNumberKeyboard
    v-model="duration"
    v-model:show="keyboardOpen"
    :title="`预留时长：${duration || '空'}`"
    extra-key=""
    :maxlength="3"
    confirm-text="完成时长"
  />
  <NvMobileDialog
    v-model:open="dialogOpen"
    title="给自己一个提醒"
    description="确定才记住这句话。"
    confirm-text="记住提醒"
    @confirm="savedReminder = reminder || '空提醒'"
    @cancel="cancelCount++"
  >
    <label for="reminder-note" class="sr-only">提醒内容</label>
    <NvMobileInput
      id="reminder-note"
      v-model="reminder"
      autocomplete="off"
      placeholder="出门前想起的事"
    />
  </NvMobileDialog>
</template>
