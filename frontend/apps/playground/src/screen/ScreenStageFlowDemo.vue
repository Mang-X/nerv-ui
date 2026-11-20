<script setup lang="ts">
import { ref } from 'vue'
import { NvScreenStageFlow, type ScreenStage } from '@nerv-ui/ui'

const domain = ref('阅读活动')
const narrow = ref(false)
const stages = ref<ScreenStage[]>([])
function restore() {
  stages.value =
    domain.value === '阅读活动'
      ? [
          { key: 'register', label: '报名', value: 24 },
          {
            key: 'prepare',
            label: '资料准备',
            value: 0,
            status: { label: '等待确认', tone: 'amber' },
          },
          { key: 'arrive', label: '到场', value: null },
        ]
      : [
          { key: 'pack', label: '装箱', value: 12.5 },
          { key: 'move', label: '运输', value: 8, status: { label: '需要关注', tone: 'red' } },
          { key: 'place', label: '布置', value: 0 },
        ]
}
function select(value: string) {
  domain.value = value
  restore()
}
function replace() {
  stages.value = [
    { key: 'new-a', label: '收集', value: 0 },
    { key: 'new-b', label: '调整', value: -1.25 },
    { key: 'new-c', label: '核对', value: null, status: { label: '待确认', tone: 'cyan' } },
  ]
}
function longText() {
  stages.value = [
    {
      key: 'long',
      label: '为周末开放活动整理跨区域的阅读与展览资料',
      value: 1234.5678,
      status: { label: '等待场地与资料共同确认', tone: 'amber' },
    },
    ...stages.value.slice(1),
  ]
}
restore()
</script>

<template>
  <main class="stage-flow-demo">
    <header>
      <h1>一步一步，留住进展</h1>
      <p>查看各阶段的来源数量。0 表示真实零，— 表示尚未确认；显示最多三位小数。</p>
    </header>
    <div class="stage-flow-tools" role="group" aria-label="阶段来源与显示">
      <button
        v-for="item in ['阅读活动', '展览布置']"
        :key="item"
        type="button"
        :aria-pressed="domain === item"
        @click="select(item)"
      >
        {{ item }}
      </button>
      <button type="button" @click="replace">替换记录</button>
      <button type="button" @click="stages = [...stages].reverse()">反转顺序</button>
      <button type="button" @click="stages = []">清空</button>
      <button type="button" @click="restore">恢复记录</button>
      <button type="button" @click="longText">长文字</button>
      <button type="button" :aria-pressed="narrow" @click="narrow = !narrow">窄幅显示</button>
    </div>
    <section class="stage-flow-panel" :class="{ narrow }" aria-labelledby="stage-flow-title">
      <h2 id="stage-flow-title">{{ domain }}</h2>
      <NvScreenStageFlow :stages="stages" :aria-label="`${domain}各阶段数量`" />
      <p v-if="!stages.length" role="status">当前没有阶段记录</p>
    </section>
  </main>
</template>

<style scoped>
@layer app {
  .stage-flow-demo {
    padding: 48px;
    color: var(--nv-scr-text);
    font-family: var(--font-sans);
  }
  .stage-flow-demo h1 {
    font-size: 36px;
  }
  .stage-flow-demo header p {
    color: var(--nv-scr-muted);
  }
  .stage-flow-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 28px 0;
  }
  .stage-flow-tools button {
    min-height: 44px;
    padding: 8px 16px;
    color: var(--nv-scr-text);
    background: var(--nv-scr-bg-accent);
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
  }
  .stage-flow-tools [aria-pressed='true'] {
    border-color: var(--nv-scr-cyan);
  }
  .stage-flow-tools button:focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 3px;
  }
  .stage-flow-panel {
    padding: 24px;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    max-width: 100%;
    background: var(--nv-scr-bg);
  }
  .stage-flow-panel.narrow {
    width: 280px;
  }
  .stage-flow-panel h2 {
    margin: 0 0 24px;
    font-size: 24px;
  }
}
</style>
