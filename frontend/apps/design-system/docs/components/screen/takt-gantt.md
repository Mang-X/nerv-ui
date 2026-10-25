---
title: NvTaktGantt 时间分段
---

<script setup>
import { ref } from 'vue'
import { NvTaktGantt } from '@nerv-iip/ui'
const empty = ref(false)
const rows = [{ name: '书房', segs: [['run', 25], ['idle', 25], ['stop', 25], ['alarm', 25]] }]
const toneLabels = { run: '占用', idle: '开放', stop: '闭馆', alarm: '异常' }
</script>

# NvTaktGantt 时间分段

按宿主给出的百分比和顺序展示各行时间分段。保留 Nv 名称及四个 palette 通道，不计算节拍、日期、时长、资源规则，也不提供拖拽排程。自带 `NvScreenPanel`，直接使用。

## 中性文案与空数据

`toneLabels` 同时控制图例与每个色段的原生 `title` 提示，避免图例中性、悬停仍是工业词。部分映射回落到旧文案。显式空数组不恢复工业样例。

<ScreenDemo wide>
  <div style="width: 100%">
    <button @click="empty = !empty">{{ empty ? '恢复时段' : '清空时段' }}</button>
    <NvTaktGantt title="今日空间使用时段" :rows="empty ? [] : rows"
      :axis="empty ? [] : ['09:00', '12:00', '15:00', '18:00']" :tone-labels="toneLabels" />
  </div>
</ScreenDemo>

```vue
<NvTaktGantt
  title="今日空间使用时段"
  :rows="[
    {
      name: '书房',
      segs: [
        ['run', 25],
        ['idle', 25],
        ['stop', 25],
        ['alarm', 25],
      ],
    },
  ]"
  :axis="['09:00', '12:00', '15:00', '18:00']"
  :tone-labels="{ run: '占用', idle: '开放', stop: '闭馆', alarm: '异常' }"
/>
```

## 输入合同

- 每行 `name` 由宿主保证唯一；它就是现有 row key。无稳定 ID 模型，同名行不受支持；来源切换可替换名称和行顺序。
- `Seg` 为 `['run' | 'idle' | 'stop' | 'alarm', number]`。宽度是有限的 0–100 百分比，每行总和不超过 100；100 填满，少于 100 留尾部空白，0 宽段不占空间，空 segs 保留空行。组件不重算/归一化。
- 负数、非有限数、单段超 100 或总和超 100 属于合同外输入，宿主先验证；旧 CSS 会收缩/裁切这类输入，不能据其视觉效果作为有效时间分配。本票不增加自动修复规则。
- `axis` 仅为均匀摆放的文字，不解析时间或推导段宽。空 axis 隐藏刻度，空 rows 不创建样例。宿主须为标题与图例预留足够宽度；标题继承 Panel 的单行呈现。

## 旧调用

<ScreenDemo wide>
  <NvTaktGantt />
</ScreenDemo>

## 属性

| 属性         | 说明                          | 类型                                                            | 默认                      |
| ------------ | ----------------------------- | --------------------------------------------------------------- | ------------------------- |
| `rows`       | 唯一行名 + 有序百分比段       | `{ name: string; segs: Seg[] }[]`                               | 旧焊接 / 装配 / CNC 三行  |
| `axis`       | 宿主刻度文字                  | `string[]`                                                      | `09:30 … 10:30` 七刻度    |
| `title`      | 面板标题                      | `string`                                                        | `节拍 Takt 58s`           |
| `toneLabels` | 图例与段 title 的统一文案映射 | `Partial<Record<'run' \| 'idle' \| 'stop' \| 'alarm', string>>` | 运行 / 待机 / 停机 / 报警 |

四通道视觉保留：run 青、idle 琥珀、stop 灰、alarm 红；宿主选择各通道的实际含义。
