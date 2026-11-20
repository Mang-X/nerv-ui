<script setup lang="ts">
import { shallowRef } from 'vue'
import { NvMobileButton, NvMobileSwitch, NvNavBar, NvStepper } from '@nerv-ui/ui-mobile'

const back = shallowRef(0)
const right = shallowRef(0)
const clicks = shallowRef(0)
const quantity = shallowRef(2)
const checked = shallowRef(false)
const busy = shallowRef(false)
function save() {
  clicks.value++
  busy.value = true
}
function reset() {
  checked.value = false
  busy.value = false
  quantity.value = 2
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-4 p-4">
    <NvNavBar back title="独立触点" @back="back++">
      <template #right><button class="size-11" @click="right++">更多</button></template>
    </NvNavBar>
    <output aria-label="导航事件">{{ back }} / {{ right }}</output>
    <form class="space-y-4" @submit.prevent>
      <div class="flex flex-wrap items-center gap-2">
        <NvMobileButton
          v-for="size in ['sm', 'md', 'lg'] as const"
          :key="size"
          :size="size"
          type="button"
          :aria-label="`按钮 ${size}`"
          @click="clicks++"
          >{{ size }}</NvMobileButton
        >
        <NvMobileButton variant="text" type="button" aria-label="短文字" @click="clicks++"
          >字</NvMobileButton
        >
        <NvMobileButton variant="outline" type="button" aria-label="描边按钮" @click="clicks++"
          >描边</NvMobileButton
        >
      </div>
      <NvMobileButton as-child size="sm" block @click="clicks++"
        ><a href="#fixture" aria-label="链接按钮" @click.prevent>查看</a></NvMobileButton
      >
      <NvMobileButton
        type="button"
        :disabled="busy"
        :aria-busy="busy"
        aria-label="保存任务"
        @click="save"
        >{{ busy ? '保存中' : '保存' }}</NvMobileButton
      >
      <NvMobileButton type="button" disabled aria-label="禁用按钮" @click="clicks++"
        >禁用</NvMobileButton
      >
      <output aria-label="按钮事件">{{ clicks }}</output>
      <label class="flex flex-wrap items-center gap-3"
        >独立输入<input aria-label="邻近输入" class="h-11 border border-border"
      /></label>
      <NvStepper v-model="quantity" :min="1" :max="5" />
      <output aria-label="步进值">{{ quantity }}</output>
      <div class="group flex flex-wrap items-center gap-3" data-state="unchecked">
        <NvMobileSwitch v-model="checked" name="reminder" value="yes" aria-label="受控开关" />
        <NvMobileSwitch :model-value="false" disabled aria-label="禁用开关" />
        <NvMobileButton type="button" aria-label="外部复位" @click="reset">复位</NvMobileButton>
      </div>
      <output aria-label="开关值">{{ checked }}</output>
    </form>
    <div class="h-[100vh]" aria-hidden="true" />
    <p>滚动终点</p>
  </div>
</template>
