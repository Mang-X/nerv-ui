---
title: NvScreenHeatmap 热力分档图
---

<script setup>
import { NvScreenHeatmap } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const thresholds = [
  { label: '正常', tone: 'success', min: 0 },
  { label: '关注', tone: 'warning', min: 60 },
  { label: '超标', tone: 'danger', min: 85 },
]
const below = { label: '无数据', tone: 'accent', min: -1 }

const cells = [
  { key: 'w1', label: '岗位 01', value: 48 },
  { key: 'w2', label: '岗位 02', value: 72 },
  { key: 'w3', label: '岗位 03', value: 91 },
  { key: 'w4', label: '岗位 04', value: 55 },
  { key: 'w5', label: '岗位 05', value: 88 },
  { key: 'w6', label: '岗位 06', value: 63 },
  { key: 'w7', label: '岗位 07', value: null },
  { key: 'w8', label: '岗位 08', value: 77 },
  { key: 'w9', label: '岗位 09', value: 42 },
  { key: 'w10', label: '岗位 10', value: 96 },
  { key: 'w11', label: '岗位 11', value: 58 },
  { key: 'w12', label: '岗位 12', value: 69 },
]
</script>

# NvScreenHeatmap 热力分档图

按阈值把数值分档着色的方格矩阵，适合岗位、资源、区域的负载或评分总览。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenHeatmap
      :cells="cells"
      :thresholds="thresholds"
      :below="below"
      :columns="6"
      unit="%"
      axis-start="低负载"
      axis-end="高负载"
      aria-label="岗位负载分档"
    />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenHeatmap
      :cells="cells.slice(0, 4)"
      :thresholds="thresholds"
      :below="below"
      :columns="2"
      aria-label="四岗位分档"
    />
    <NvScreenHeatmap
      :cells="[]"
      :thresholds="thresholds"
      :below="below"
      empty-label="暂无岗位记录"
    />
  </div>
</Demo>

## API

### NvScreenHeatmap 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `cells` | 方格数据，必填；`key` 需在网格内唯一 | `ScreenHeatmapCell[]` | — |
| `thresholds` | 分档阈值，必填；按 `min` 升序解释 | `ScreenHeatmapBand[]` | — |
| `below` | 低于最低阈值及数值未知时的档位 | `ScreenHeatmapBand` | — |
| `columns` | 每行列数 | `number` | `6` |
| `unit` | 数值单位 | `string` | `''` |
| `unknownLabel` | 未知数值的档位文案 | `string` | `未知` |
| `emptyLabel` | 无数据文案 | `string` | `暂无记录` |
| `axisStart` | 轴首说明 | `string` | `''` |
| `axisEnd` | 轴尾说明 | `string` | `''` |
| `ariaLabel` | 网格的无障碍名称 | `string` | `分档数值` |

### ScreenHeatmapBand

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `label` | 档位名 | `string` |
| `tone` | 档位语义色 | `'accent' \| 'success' \| 'warning' \| 'danger'` |
| `min` | 含该值的下界；下一个更大的 `min` 为排他上界 | `number` |

### ScreenHeatmapCell

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 网格内唯一且稳定的标识 | `string \| number` |
| `label` | 方格文案 | `string` |
| `value` | 数值；缺失或非有限值按未知处理 | `number \| null` |

### 说明

阈值重复、非有限或顺序非法时，整个刻度视为无效，所有方格按未知档位渲染，不会猜测。
