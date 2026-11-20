<script setup lang="ts">
import { shallowRef } from 'vue'
import { NvMobileButton, NvMobileSwitch, NvStepper } from '@nerv-ui/ui-mobile'
const clicks = shallowRef(0)
const checked = shallowRef(false)
const quantity = shallowRef(2)
const updates = shallowRef(0)
function update(value: boolean) {
  checked.value = value
  updates.value++
}
</script>
<template>
  <main class="mx-auto max-w-2xl space-y-4 p-4">
    <h1>公开 class / asChild 兼容</h1>
    <div id="color-reference" class="bg-destructive text-destructive-foreground size-4" />
    <div class="flex flex-wrap items-center gap-3">
      <NvMobileButton data-probe="transparent" size="sm" class="bg-transparent" @click="clicks++"
        >透明</NvMobileButton
      >
      <NvMobileButton
        data-probe="destructive"
        size="sm"
        class="bg-destructive text-destructive-foreground"
        @click="clicks++"
        >危险操作</NvMobileButton
      >
      <NvMobileButton
        data-probe="anchor"
        as-child
        size="sm"
        class="bg-destructive text-destructive-foreground"
        @click="clicks++"
        ><a href="#compat" @click.prevent>链接操作</a></NvMobileButton
      >
    </div>
    <output id="clicks">{{ clicks }}</output>
    <NvStepper
      data-probe="stepper"
      v-model="quantity"
      class="bg-transparent border-0"
      :min="1"
      :max="5"
    />
    <form id="switch-form" class="flex flex-wrap items-center gap-3" @submit.prevent>
      <div class="group" data-state="unchecked">
        <NvMobileSwitch
          data-probe="switch-color"
          :model-value="true"
          class="data-[state=checked]:bg-destructive"
          aria-label="危险提醒"
        />
      </div>
      <NvMobileSwitch
        data-probe="aschild"
        as-child
        tabindex="0"
        :model-value="checked"
        name="reminder"
        value="yes"
        aria-label="公开提醒"
        @update:model-value="update"
      />
      <NvMobileSwitch
        data-probe="aschild-disabled"
        as-child
        tabindex="0"
        disabled
        aria-label="禁用提醒"
        @update:model-value="updates++"
      />
      <input
        aria-label="邻近输入"
        name="neighbor"
        value="independent"
        class="h-11 border border-border"
      />
      <button id="reset" type="button" class="h-11" @click="checked = false">外部复位</button>
    </form>
    <output id="updates">{{ updates }}</output>
    <p>步进值 {{ quantity }}；提醒 {{ checked }}</p>
    <div class="h-[100vh]" aria-hidden="true" />
  </main>
</template>
