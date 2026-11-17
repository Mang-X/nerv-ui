<script setup lang="ts">
import { shallowRef, watch, onBeforeUnmount } from 'vue'
import { NvButton } from '@nerv-iip/ui'
import LoginRecipe from './LoginRecipe.vue'
import type { LoginDraft, LoginMode, LoginSurface, LoginReceipt } from './contract'
const props = withDefaults(defineProps<{ space?: 'library' | 'studio' }>(), { space: 'library' })
const surface = shallowRef<LoginSurface>('console')
const mode = shallowRef<LoginMode>('login')
const readonly = shallowRef(false)
const disabled = shallowRef(false)
const notice = shallowRef<'failed' | 'timed-out' | ''>('')
const draft = shallowRef<LoginDraft>({
  loginName: '',
  password: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const waiting = shallowRef(false)
const destination = shallowRef('')
let settle: ((receipt: LoginReceipt) => void) | undefined
function finish(accepted: boolean) {
  const done = settle
  settle = undefined
  waiting.value = false
  done?.({ accepted })
}
function submit() {
  finish(false)
  waiting.value = true
  return new Promise<LoginReceipt>((resolve) => {
    settle = resolve
  })
}
function invalidate() {
  finish(false)
  destination.value = ''
}
watch(
  () => [props.space, surface.value, mode.value, readonly.value, disabled.value, draft.value],
  invalidate,
  { flush: 'sync' },
)
onBeforeUnmount(invalidate)
</script>
<template>
  <main>
    <nav class="flex flex-wrap gap-3 p-4" aria-label="空间入口">
      <slot name="navigation">
        <a href="#login/library">晨光书房</a><a href="#login/studio">周末画室</a
        ><a href="#">返回首页</a>
      </slot>
    </nav>
    <div class="flex flex-wrap items-center gap-3 p-4">
      <label
        >入口形态
        <select v-model="surface">
          <option value="console">桌面入口</option>
          <option value="business-console">卡片入口</option>
          <option value="pda">手持入口</option>
          <option value="screen">大屏入口</option>
        </select></label
      >
      <label
        >操作
        <select v-model="mode">
          <option value="login">登录</option>
          <option value="change-password">修改密码</option>
        </select></label
      >
      <label><input v-model="readonly" type="checkbox" />只读</label>
      <label><input v-model="disabled" type="checkbox" />暂停提交</label>
      <label v-if="surface === 'pda'"
        >退出结果
        <select v-model="notice">
          <option value="">无提示</option>
          <option value="failed">撤销失败</option>
          <option value="timed-out">撤销超时</option>
        </select></label
      >
    </div>
    <div v-if="waiting" class="flex gap-3 p-4" role="status">
      等待演示确认；不会连接账号服务。
      <NvButton data-accept @click="finish(true)">确认本次演示</NvButton>
      <NvButton data-reject variant="outline" @click="finish(false)">暂不继续</NvButton>
    </div>
    <p v-if="destination" class="p-4" role="status">{{ destination }}</p>
    <LoginRecipe
      v-model="draft"
      :surface="surface"
      :mode="mode"
      :context="props.space"
      :brand="props.space === 'studio' ? '周末画室' : '晨光书房'"
      :submit="submit"
      :readonly="readonly"
      :disabled="disabled"
      :logout-notice="notice"
      @cancel="invalidate"
      @confirmed="
        destination =
          mode === 'login'
            ? '已确认前往空间的演示请求；仍停留在本页。'
            : '已确认改密演示；密码未保存。'
      "
    >
      <template #hint><p class="text-sm">请勿输入真实密码。取消可结束等待并保留草稿。</p></template>
    </LoginRecipe>
  </main>
</template>
