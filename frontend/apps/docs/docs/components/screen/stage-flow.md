---
title: NvScreenStageFlow 阶段数量流
---

<script setup>
import { ref } from 'vue'
import { NvScreenButton, NvScreenStageFlow } from '@nerv-iip/ui'
const stages = ref([
  { key: 'register', label: '报名', value: 24 },
  { key: 'prepare', label: '资料准备', value: 0, status: { label: '等待确认', tone: 'amber' } },
  { key: 'arrive', label: '到场', value: null },
])
</script>

# NvScreenStageFlow 阶段数量流

只读展示宿主阶段、数量、状态与相邻连接符。独立 playground 深链 `/#screen/stage-flow` 可切换阅读活动/展览布置、替换、重排、清空、恢复、长文字和窄幅显示。

## 示例

<ScreenDemo>
  <div style="width:100%;min-width:0">
    <NvScreenButton type="button" variant="secondary" @click="stages = [...stages].reverse()">反转顺序</NvScreenButton>
    <NvScreenStageFlow :stages="stages" aria-label="阅读活动各阶段数量" />
  </div>
</ScreenDemo>

## API

### NvScreenStageFlow 属性

| 属性        | 类型                     | 默认 | 说明                                     |
| ----------- | ------------------------ | ---- | ---------------------------------------- |
| `stages`    | `readonly ScreenStage[]` | 必填 | 按宿主顺序显示；空数组不生成阶段或连接符 |
| `connector` | `string`                 | `›`  | 相邻阶段装饰，空串隐藏；不推导关系       |

公共类型 `ScreenStage` 从主桶导出：

```ts
interface ScreenStage {
  key: string | number
  label: string
  value?: number | null
  status?: {
    label: string
    tone: 'cyan' | 'green' | 'amber' | 'red'
  }
}
```

## 设计说明

根节点继承原生 attrs，使用 `role="group"`；宿主提供可访问名称。无事件或插槽。key 必须在本组唯一稳定，名称可以重复。有限 number 使用 `zh-CN` 数量格式、最多三位小数，仅改变显示；0 显示 0，负值保持负号，未知或非数显示 —。状态仅在宿主提供 `status` 时出现，标签不由 tone 或 value 生成。

<!-- @include: ../../../../../DESIGN/components/stage-flow.md -->
