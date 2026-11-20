<script setup lang="ts">
import { ref } from 'vue'
import { NvScreenLoginStage, NvScreenButton, NvScreenInput } from '@nerv-ui/ui'
import reading from '../assets/login-reading.svg'
import garden from '../assets/login-garden.svg'
const pending = ref(false)
const error = ref('')
const name = ref('')
const props = defineProps<{ garden?: boolean }>()
function submit() {
  pending.value = true
  error.value = ''
}
function finish() {
  pending.value = false
  error.value = '暂时无法继续，请稍后再试。'
}
</script>
<template>
  <div>
    <nav aria-label="空间入口">
      <a href="#screen/login/library">晨光书房</a> · <a href="#screen/login/garden">共享花园</a> ·
      <a href="#screen">返回空间舞台</a>
    </nav>
    <NvScreenLoginStage
      :title="props.garden ? '走进共享花园' : '走进晨光书房'"
      description="留下称呼，开启今天的相遇。"
      :brand="props.garden ? '共享花园' : '晨光书房'"
      :image-src="props.garden ? garden : reading"
      :image-width="1000"
      :image-height="600"
      :glows="[{ x: 30, y: 50, size: 100 }]"
      :pending="pending"
      :error="error"
      :hud="['欢迎来访', '', '美好的一天', '']"
      @submit="submit"
    >
      <label class="text-sm">称呼<NvScreenInput v-model="name" placeholder="怎样称呼你" /></label>
      <NvScreenButton type="submit" :disabled="pending">{{
        pending ? '正在准备' : '继续'
      }}</NvScreenButton>
    </NvScreenLoginStage>
    <NvScreenButton v-if="pending" @click="finish">结束等待</NvScreenButton>
  </div>
</template>
