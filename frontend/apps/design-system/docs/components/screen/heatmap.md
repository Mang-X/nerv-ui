---
title: NvScreenHeatmap 分档热力格
---

<script setup>
import { ref } from 'vue'
import { NvScreenHeatmap } from '@nerv-iip/ui'
const cells = ref([{key:'a',label:'周三 08:00',value:0},{key:'b',label:'周三 09:00',value:4.5},{key:'c',label:'周三 10:00',value:null}])
const thresholds = [{min:4,label:'适中',tone:'cyan'},{min:8,label:'充实',tone:'green'}]
</script>

# NvScreenHeatmap 分档热力格

宿主提供数值、分档、单位和时间文本；悬停或 Tab 聚焦查看当前格子的全文提示。独立入口 `/#screen/heatmap` 提供阅读占用 4×6、展厅温度 3×4 两类中性来源，以及替换、未知、空态、网格和分档切换。下列 live 源码是文档接线，未代表本轮实际文档站运行。

<ScreenDemo>
  <div style="width:100%;min-width:0">
    <button type="button" @click="cells = cells.length ? [] : [{key:'a',label:'周三 08:00',value:0}]">切换记录</button>
    <NvScreenHeatmap :cells="cells" :thresholds="thresholds" :below="{label:'从容',tone:'amber'}" :columns="3" unit="小时" axis-start="周三 08:00" axis-end="周三 10:00" />
  </div>
</ScreenDemo>

## 属性

| 属性                    | 类型                                | 默认       | 说明                                   |
| ----------------------- | ----------------------------------- | ---------- | -------------------------------------- |
| `cells`                 | `readonly ScreenHeatmapCell[]`      | 必填       | 按宿主顺序；key 唯一稳定，标签允许重复 |
| `thresholds`            | `readonly ScreenHeatmapThreshold[]` | 必填       | 显式包含下界；排序不修改原数组         |
| `below`                 | `ScreenHeatmapBand`                 | 必填       | 小于最低阈值；空阈值时用于所有有限值   |
| `columns`               | `number`                            | `6`        | 正整数；非法值回退六列，行数自然生成   |
| `unit`                  | `string`                            | `''`       | 追加在有限值后，未知不追加单位         |
| `unknownLabel`          | `string`                            | `未知`     | 未知值或无效阈值的分档标签             |
| `emptyLabel`            | `string`                            | `暂无记录` | 零项时的 status 文本                   |
| `axisStart` / `axisEnd` | `string`                            | `''`       | 宿主纯文本，空串不补时标               |

无事件或插槽。根节点为普通 div，原生 attrs 可透传，不应给 generic div 设置可访问名称；需要命名容器时由宿主使用 section + aria-labelledby。内部两组列表分别命名为分档图例/分档数值；每格 tabindex=0，无按钮动作。提示位于同组件内，aria-describedby 仅指向当前提示并使用实例局部 ID。

主桶同时导出类型：

```ts
interface ScreenHeatmapCell {
  key: string | number
  label: string
  value?: number | null
}
interface ScreenHeatmapBand {
  label: string
  tone: 'cyan' | 'green' | 'amber' | 'red'
}
interface ScreenHeatmapThreshold extends ScreenHeatmapBand {
  min: number
}
```

## 原 OEE 宿主适配

来源 line 页的 `oeeBucket` 按 ≥85、≥70、≥55、<55 分档。库不内置这些业务常量；旧宿主可明确输入：

```ts
const thresholds = [
  { min: 55, label: '55 至不足 70', tone: 'amber' },
  { min: 70, label: '70 至不足 85', tone: 'cyan' },
  { min: 85, label: '至少 85', tone: 'green' },
]
const below = { label: '不足 55', tone: 'red' }
// key、小时文本、起止轴标均来自宿主明确的数据窗口；不使用组件内时钟。
const cells = hourlyRows.map((row) => ({ key: row.id, label: row.hourLabel, value: row.oee }))
```

这只是源语义适配说明，未验证旧应用接入或实际 OEE。中性宿主展示阅读与温度，不代替生产验收。

<!-- @include: ../../../../../DESIGN/components/heatmap.md -->
