---
title: NvScreenParameter 指标卡
---

<script setup>
import { NvScreenParameter } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvScreenParameter 指标卡

标题、当前值、可选区间说明，加一条可取样折线。指针移动显示光标，方向键与 Home/End 依次取值。

## 示例

<Demo>
  <div class="nv-screen-stage" style="padding: 40px; width: 320px">
    <NvScreenParameter
      label="主轴温度"
      :value="68.4"
      unit="°C"
      range="正常区间 40–75"
      :samples="[52, 55, 58, 61, 64, 66, 68, 67, 68, 69, 70, 68.4]"
    />
  </div>
</Demo>

## API

| 属性 | 说明 |
| --- | --- |
| `label` | 指标名，同时用作整卡的 `aria-label`。 |
| `value` | 当前值；非有限数显示为「—」。 |
| `unit` | 单位。 |
| `range` | 区间说明，可选。 |
| `samples` | 折线样本；全部为有限数时才绘制。 |
| `sampleLabels` | 每个样本的标签；不给时显示「序号 / 总数」。 |

取样是**读一段序列里的某一格**，不是「一个控件的值」，ui-sdk 没有对应原语，所以这段交互保留手写；焦点、提示与 `role="status"` 都按无障碍约定写足。
