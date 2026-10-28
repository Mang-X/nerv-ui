<script setup lang="ts">
import { ref } from 'vue'
import {
  NvScreenDetailDialog,
  NvScreenParameter,
  NvScreenButton,
  NvScreenPanel,
} from '@nerv-iip/ui'
const props = defineProps<{ context: 'library' | 'studio' }>()
const open = ref(true)
const state = ref<'data' | 'pending' | 'error' | 'empty'>('data')
const samples = ref(props.context === 'library' ? [20, 32, 24, 0] : [18, 22, 26, 28])
const value = ref<number | null>(samples.value.at(-1) ?? null)
function replace() {
  samples.value = [3.12567, 0, 8]
  value.value = 8
  state.value = 'data'
}
function missing() {
  samples.value = []
  value.value = null
  state.value = 'data'
}
</script>
<template>
  <main class="nv-scr-parameter-host p-6 text-sm">
    <nav class="flex flex-wrap gap-4">
      <a href="#screen/stage">返回舞台</a
      ><a
        :href="
          context === 'library'
            ? '#screen/parameter-detail/studio'
            : '#screen/parameter-detail/library'
        "
        >切换空间</a
      ><a href="#">返回桌面</a>
    </nav>
    <NvScreenPanel :title="context === 'library' ? '书房观察' : '画室观察'">
      <NvScreenDetailDialog
        v-model:open="open"
        :title="context === 'library' ? '河岸书房' : '晴天画室'"
        description="查看示例观察记录；内容不会自动更新。"
        :state="state"
        :status-text="
          state === 'pending'
            ? '等待新的观测窗口'
            : state === 'error'
              ? '本次读取失败，请返回后重试'
              : '暂无观测记录'
        "
      >
        <template #trigger><NvScreenButton>查看空间详情</NvScreenButton></template>
        <template #info
          ><h3 class="text-lg">基础资料</h3>
          <dl>
            <dt>空间编号</dt>
            <dd class="font-mono">{{ context === 'library' ? 'LIB-01' : 'ART-02' }}</dd>
            <dt>记录时间（本地）</dt>
            <dd>2026-10-28 09:30</dd>
          </dl></template
        >
        <template #parameter
          ><NvScreenParameter
            :label="context === 'library' ? '阅读次数' : '创作时长'"
            :unit="context === 'library' ? '次' : 'min'"
            :value="value"
            range="观察窗口：2026-10-28 09:00–09:30（本地）；展示范围由宿主指定"
            :samples="samples"
        /></template>
        <template #history
          ><h3 class="text-lg">窗口记录</h3>
          <p>
            2026-10-28 09:30（本地） ·
            {{
              context === 'library'
                ? '阅读窗口已记录；零表示观测值。'
                : '自由创作窗口已记录；不推断使用效率。'
            }}
          </p>
          <div class="flex flex-wrap gap-3">
            <NvScreenButton @click="replace">替换窗口</NvScreenButton
            ><NvScreenButton @click="missing">缺测窗口</NvScreenButton
            ><NvScreenButton @click="state = 'pending'">等待</NvScreenButton
            ><NvScreenButton @click="state = 'error'">失败</NvScreenButton
            ><NvScreenButton @click="state = 'empty'">空记录</NvScreenButton>
          </div></template
        >
      </NvScreenDetailDialog>
      <div class="mt-4 flex flex-wrap gap-3">
        <NvScreenButton @click="replace">恢复数据</NvScreenButton
        ><NvScreenButton @click="missing">载入缺测</NvScreenButton
        ><NvScreenButton @click="state = 'pending'">载入等待</NvScreenButton
        ><NvScreenButton @click="state = 'error'">载入失败</NvScreenButton
        ><NvScreenButton @click="state = 'empty'">载入空记录</NvScreenButton>
      </div>
    </NvScreenPanel>
  </main>
</template>
<style scoped>
@layer app {
  .nv-scr-parameter-host {
    min-height: 100dvh;
    background: var(--nv-scr-bg);
    color: var(--nv-scr-text);
  }
}
</style>
