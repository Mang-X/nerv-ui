---
title: NvScreenStatusHero 远距主状态灯
---

<script setup>
import { computed, ref } from 'vue'
import { NvScreenStatusHero } from '@nerv-iip/ui'
const tone = ref('green')
const rhythm = ref('steady')
const label = ref('开放中')
const offline = ref(0)
const viewed = ref(false)
const hint = computed(() => offline.value === null ? '失联数量待确认' : offline.value > 0 ? `${offline.value} 处数据失联` : null)
</script>

# NvScreenStatusHero 远距主状态灯

200px 外圈、158px 核心和完整状态标签用于远距观看。颜色和呼吸节奏分别由宿主选择；低动效时核心静止。独立 playground 的 `/#screen/status-hero` 可切换两类来源、状态与失联说明。

<ScreenDemo>
  <div class="status-hero-doc">
    <label>颜色 <select v-model="tone" aria-label="主灯颜色"><option v-for="item in ['neutral','cyan','green','amber','red']" :key="item">{{ item }}</option></select></label>
    <label>节奏 <select v-model="rhythm" aria-label="主灯节奏"><option v-for="item in ['still','steady','slow','fast']" :key="item">{{ item }}</option></select></label>
    <label>状态 <input v-model="label" aria-label="主灯文字" /></label>
    <button type="button" @click="offline = offline === 0 ? 2 : offline === 2 ? null : 0">切换数据状态</button>
    <NvScreenStatusHero :tone="tone" :rhythm="rhythm" :label="label">
      <template v-if="hint" #auxiliary>
        <p>{{ hint }}</p>
        <button type="button" @click="viewed = true">查看现场说明</button>
      </template>
    </NvScreenStatusHero>
    <p role="status">{{ viewed ? '已查看现场说明' : '现场信息持续更新' }}</p>
  </div>
</ScreenDemo>

## 属性与插槽

| 项          | 类型                                                 | 默认        | 说明                           |
| ----------- | ---------------------------------------------------- | ----------- | ------------------------------ |
| `label`     | `string`                                             | 必填        | 状态全文，由宿主提供；不截断   |
| `tone`      | `'neutral' \| 'cyan' \| 'green' \| 'amber' \| 'red'` | `'neutral'` | 视觉色调；不推导状态           |
| `rhythm`    | `'still' \| 'steady' \| 'slow' \| 'fast'`            | `'still'`   | 静止或 4 / 2.4 / 1.2 秒呼吸    |
| `auxiliary` | slot                                                 | 空          | 宿主生成的辅助说明与可交互内容 |

根元素继承原生 attrs、class 和 style，使用 `role="status"`；组件无自定义事件。系统低动效设置停用呼吸。外层缩放由 `NvScreenScaler` 提供。失联计数、未知处理和行动结果仅属于宿主。

<!-- @include: ../../../../../DESIGN/components/status-hero.md -->

<style>
.status-hero-doc { display: flex; flex-wrap: wrap; align-items: start; gap: 16px; color: var(--nv-scr-text); }
.status-hero-doc label { display: flex; gap: 8px; align-items: center; }
.status-hero-doc .nv-scr-sh { flex-basis: 100%; }
.status-hero-doc input, .status-hero-doc select, .status-hero-doc button { padding: 8px 12px; color: var(--nv-scr-text); background: var(--nv-scr-bg-accent); border: 1px solid var(--nv-scr-line-2); border-radius: var(--nv-scr-radius); }
.status-hero-doc button { cursor: pointer; }
</style>
