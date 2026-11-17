---
title: NvScreenStatusHero 远距主状态灯
---

<script setup>
import { computed, ref } from 'vue'
import {
  NvScreenButton,
  NvScreenInput,
  NvScreenSelect,
  NvScreenStatusHero,
} from '@nerv-iip/ui'
const tone = ref('green')
const rhythm = ref('steady')
const label = ref('开放中')
const offline = ref(0)
const viewed = ref(false)
const hint = computed(() => offline.value === null ? '失联数量待确认' : offline.value > 0 ? `${offline.value} 处数据失联` : null)
const toneOptions = ['neutral', 'cyan', 'green', 'amber', 'red'].map((item) => ({ label: item, value: item }))
const rhythmOptions = ['still', 'steady', 'slow', 'fast'].map((item) => ({ label: item, value: item }))
</script>

# NvScreenStatusHero 远距主状态灯

200px 外圈、158px 核心和完整状态标签用于远距观看。颜色和呼吸节奏分别由宿主选择；低动效时核心静止。独立 playground 的 `/#screen/status-hero` 可切换两类来源、状态与失联说明。

## 示例

<ScreenDemo>
  <div class="status-hero-doc">
    <label class="status-hero-field">颜色 <NvScreenSelect v-model="tone" :options="toneOptions" placeholder="主灯颜色" /></label>
    <label class="status-hero-field">节奏 <NvScreenSelect v-model="rhythm" :options="rhythmOptions" placeholder="主灯节奏" /></label>
    <label class="status-hero-field">状态 <NvScreenInput v-model="label" ariaLabel="主灯文字" /></label>
    <NvScreenButton type="button" variant="secondary" @click="offline = offline === 0 ? 2 : offline === 2 ? null : 0">切换数据状态</NvScreenButton>
    <NvScreenStatusHero :tone="tone" :rhythm="rhythm" :label="label">
      <template v-if="hint" #auxiliary>
        <p>{{ hint }}</p>
        <NvScreenButton type="button" variant="secondary" @click="viewed = true">查看现场说明</NvScreenButton>
      </template>
    </NvScreenStatusHero>
    <p role="status">{{ viewed ? '已查看现场说明' : '现场信息持续更新' }}</p>
  </div>
</ScreenDemo>

## API

### NvScreenStatusHero 属性

| 项          | 类型                                                 | 默认        | 说明                           |
| ----------- | ---------------------------------------------------- | ----------- | ------------------------------ |
| `label`     | `string`                                             | 必填        | 状态全文，由宿主提供；不截断   |
| `tone`      | `'neutral' \| 'cyan' \| 'green' \| 'amber' \| 'red'` | `'neutral'` | 视觉色调；不推导状态           |
| `rhythm`    | `'still' \| 'steady' \| 'slow' \| 'fast'`            | `'still'`   | 静止或 4 / 2.4 / 1.2 秒呼吸    |

### 插槽

| 插槽        | 说明                             |
| ----------- | -------------------------------- |
| `auxiliary` | 宿主生成的辅助说明与可交互内容   |

## 设计说明

根元素继承原生 attrs、class 和 style，使用 `role="status"`；组件无自定义事件。系统低动效设置停用呼吸。外层缩放由 `NvScreenScaler` 提供。失联计数、未知处理和行动结果仅属于宿主。

<!-- @include: ../../../../../DESIGN/components/status-hero.md -->

<style>
.status-hero-doc { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; color: var(--nv-scr-text); }
.status-hero-doc .status-hero-field { display: flex; gap: 8px; align-items: center; }
.status-hero-doc .status-hero-field .nv-scr-sel,
.status-hero-doc .status-hero-field .nv-scr-in { width: 160px; }
.status-hero-doc .nv-scr-sh { flex-basis: 100%; }
</style>
