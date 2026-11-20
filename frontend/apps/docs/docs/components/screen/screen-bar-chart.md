---
title: NvScreenBarChart 柱状图
---

<script setup>
import { NvScreenBarChart } from '@nerv-ui/ui'

const inbound = [4, 9, 14, 18, 17, 21, 16, 19, 15, 12, 8, 3]
const outbound = [2, 5, 9, 13, 16, 19, 21, 18, 20, 17, 11, 6]
const hours = Array.from({ length: 12 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`)
</script>

# NvScreenBarChart 柱状图

纵向柱状图——小时流量 / 日产量这类**离散量**的正确形态("一段一个数",柱比面积曲线诚实)。支持 1–2 条序列并排对比;柱体语义色**上实下消**渐隐(与数字强调线同源语言,静态不发光);悬停整列高亮 + HTML 信息卡逐序列读数(文字层不随 SVG 拉伸变形)。基于独立的 `--nv-scr-*` 令牌。

## 示例

### 基础用法

`series` 传 `{ label, color, data }[]`;高度由外层容器决定。

<ScreenDemo>
  <div style="height: 150px">
    <NvScreenBarChart
      :series="[{ label: '入库行', color: '#4aa6ee', data: inbound }]"
      :hover-labels="hours"
      :x-labels="[hours[0], hours[6], '现在']"
    />
  </div>
</ScreenDemo>

```vue
<template>
  <div style="height: 150px">
    <NvScreenBarChart
      :series="[{ label: '入库行', color: '#4aa6ee', data: hourly }]"
      :hover-labels="hourLabels"
      :x-labels="[hourLabels[0], hourLabels[6], '现在']"
    />
  </div>
</template>
```

### 双序列对比

两条序列按组并排(如出入库对照)。

<ScreenDemo>
  <div style="height: 170px">
    <NvScreenBarChart
      :series="[
        { label: '入库行', color: '#4aa6ee', data: inbound },
        { label: '出库行', color: '#8b9be6', data: outbound },
      ]"
      :hover-labels="hours"
      :x-labels="[hours[0], hours[6], hours[11]]"
    />
  </div>
</ScreenDemo>

```vue
<NvScreenBarChart
  :series="[
    { label: '入库行', color: '#4aa6ee', data: inbound },
    { label: '出库行', color: '#8b9be6', data: outbound },
  ]"
  :hover-labels="hourLabels"
/>
```

### 自动巡显

`autoplay` 开启后信息卡逐列自动巡显(挂墙无人操作也能读到每一格的数);鼠标悬停即暂停、移出恢复。`prefers-reduced-motion` 下不自动巡显。

<ScreenDemo>
  <div style="height: 150px">
    <NvScreenBarChart
      :series="[{ label: '出库行', color: '#8b9be6', data: outbound }]"
      :hover-labels="hours"
      autoplay
      :autoplay-ms="2000"
    />
  </div>
</ScreenDemo>

```vue
<NvScreenBarChart :series="series" :hover-labels="hourLabels" autoplay :autoplay-ms="2400" />
```

## API

### NvScreenBarChart 属性

| Prop          | 类型                       | 默认    | 说明                                |
| ------------- | -------------------------- | ------- | ----------------------------------- |
| `series`      | `{ label, color, data }[]` | —       | 1–2 条序列(并排分组柱),`data` 等长  |
| `xLabels`     | `string[]`                 | `[]`    | X 轴下标签(可稀疏,均匀分布)         |
| `hoverLabels` | `string[]`                 | —       | 悬停标签(与 `data` 等长;缺省用序号) |
| `autoplay`    | `boolean`                  | `false` | 信息卡自动巡显(用户悬停时暂停)      |
| `autoplayMs`  | `number`                   | `2400`  | 巡显间隔(毫秒)                      |

## 设计说明

保持原 props/default/主桶导出。`series[].data` 按索引共用最长通道的槽位，建议等长；短数组末尾缺测在信息卡中显示 `—`，真实零值显示 `0` 且柱高为零。空数据没有巡显卡片；缩短、重排或替换来源后，悬停按当前横坐标重新选槽，文字来自当前序列。series label 应唯一，hoverLabels 应逐点表达当前来源身份；xLabels 仍可稀疏等距显示。

数量展示使用有限值，不支持用 null/NaN/Infinity 表达缺测。现有 number 类型不收紧；本组件仍是零基线数量柱图，不新增负数坐标轴模型。几何先除 peak 再乘画布高度，有限的大数不会因中间乘法变 Infinity。

`autoplay` 默认 false，`autoplayMs` 默认 2400（传正的有限毫秒数）。启用后经过第一完整间隔才显示第一列，随后逐列步进；鼠标悬停优先并暂停步进，移出后继续。动态关闭会撤下巡显并清 timer，数据点数或间隔变化重新开始。`prefers-reduced-motion: reduce` 禁止自动巡显并撤下自动卡片，手动悬停仍可取值；媒体偏好变化和卸载均清理 timer/listener。

```vue
<NvScreenBarChart
  :series="[
    { label: '现场到访', color: 'var(--nv-scr-cyan)', data: [0, 37, 157] },
    { label: '预约参考', color: 'var(--nv-scr-indigo)', data: [19] },
  ]"
  :x-labels="['书房/p1', '书房/p2', '书房/p3']"
  :hover-labels="['书房/p1', '书房/p2', '书房/p3']"
  autoplay
/>
```

独立演示：`/#screen/charts`。两实例各自持有 SVG gradient 与交互状态；长标签卡片在图内折行，左右半区翻转。真实缩放/坐标证据与 mock mousemove 的逻辑边界分别记录在 `docs/evidence/t05-a05/README.md`。

信息卡边界：卡片最大宽度为图宽的一半减去内边距余量；槽中心在右半区（>50%）时向左打开，正中点仍向右，10px 间隔计入可用半区。长 hover label 保留全文并自然折行，读数保持当前槽的全部序列值，不按标签长度裁字。

卡片保留自然内容高度，不加省略、行数上限或内部滚动。高度仍由宿主提供；对 `overflow:hidden` 的宿主，应给折行后的 label、所有序列行和顶部 4px 留足高度，必要时增高图表容器。本轮实测 100 个 W、两序列在 600×180，三序列在 400×240 下完整可读；这不是任意长度标签和任意小容器都可容纳的保证。真实 `getBoundingClientRect`、文本行 Range 和读数可见性见 [F1 证据](../../../../../../docs/evidence/t05-a05/f1/README.md)。
