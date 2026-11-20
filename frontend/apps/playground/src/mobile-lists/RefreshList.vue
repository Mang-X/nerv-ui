<script setup lang="ts">
import { onBeforeUnmount, shallowRef } from 'vue'
import { NvPullRefresh } from '@nerv-ui/ui-mobile'
const loading = shallowRef(false)
const failNext = shallowRef(false)
const requests = shallowRef(0)
const generation = shallowRef(0)
const status = shallowRef('尚未刷新')
const scrollTop = shallowRef(0)
let timer: ReturnType<typeof setTimeout> | undefined
function refresh() {
  loading.value = true
  requests.value++
  status.value = '刷新中'
  const fail = failNext.value
  failNext.value = false
  timer = setTimeout(() => {
    if (fail) status.value = '刷新失败，请重新下拉'
    else {
      generation.value++
      status.value = '已更新'
    }
    loading.value = false
    timer = undefined
  }, 650)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section aria-labelledby="refresh-title" class="space-y-3">
    <h2 id="refresh-title" class="text-lg font-semibold">刷新来信</h2>
    <p class="text-sm text-muted-foreground">在信箱内滚动，回到顶端后向下拉动刷新。</p>
    <label class="flex min-h-touch items-center gap-2 text-sm">
      <input v-model="failNext" type="checkbox" aria-label="下次刷新失败" />下次刷新失败
    </label>
    <button
      type="button"
      :disabled="loading"
      class="min-h-touch rounded-lg border border-border px-4 text-sm disabled:opacity-40"
      @click="refresh"
    >
      立即更新
    </button>
    <output aria-label="刷新状态" class="block text-sm" aria-live="polite"
      >{{ status }} · 请求 {{ requests }} 次</output
    >
    <p class="text-sm text-muted-foreground">信箱滚动 {{ Math.round(scrollTop) }}px</p>
    <NvPullRefresh
      v-model="loading"
      class="h-64 rounded-xl border border-border"
      @refresh="refresh"
      @scroll="scrollTop = $event"
    >
      <div
        v-for="n in 12"
        :key="n"
        data-refresh-row
        class="flex h-14 items-center border-b border-border px-4 text-sm"
      >
        {{ generation ? `第 ${generation} 次来信` : '初次来信' }} {{ n }}
      </div>
    </NvPullRefresh>
  </section>
</template>
