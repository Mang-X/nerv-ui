---
title: NvScreenDonut 环形占比
---

<script setup>
import { NvScreenDonut } from '@nerv-iip/ui'

const load = [
  { label: '排队', value: 38, color: 'rgba(160, 200, 245, 0.45)' },
  { label: '执行中', value: 29, color: '#4aa6ee' },
  { label: '失败', value: 4, color: '#ef5a63' },
]
const states = [
  { label: '运行', value: 52, color: '#45d089' },
  { label: '待机', value: 6, color: '#f2c14e' },
  { label: '停机', value: 3, color: 'rgba(200, 214, 235, 0.4)' },
  { label: '报警', value: 1, color: '#ef5a63' },
]
</script>

# NvScreenDonut 环形占比

环形占比图——**状态构成 / 分布**类数据的正确形态:发丝底环 + 语义色弧段(段间留缝),中心 slot 放主数字,右侧内置图例(色点 + 名 + 值)。弧段 `dashoffset` 缓动(轮询更新平滑再分配),静态不发光。基于独立的 `--nv-scr-*` 令牌。

## 基础用法

`segments` 传 `{ label, value, color }[]`,默认插槽放中心主数字。

<ScreenDemo>
  <NvScreenDonut :segments="load">
    <b style="font-size: 22px; font-weight: 800; color: var(--nv-scr-text); font-variant-numeric: tabular-nums">532</b>
    <span style="margin-top: 4px; font-size: 11px; color: var(--nv-scr-muted)">今日完成</span>
  </NvScreenDonut>
</ScreenDemo>

```vue
<template>
  <!-- 环 = 当前链路负载构成，中心 = 今日吞吐 -->
  <NvScreenDonut
    :segments="[
      { label: '排队', value: 38, color: 'rgba(160, 200, 245, 0.45)' },
      { label: '执行中', value: 29, color: '#4aa6ee' },
      { label: '失败', value: 4, color: '#ef5a63' },
    ]"
  >
    <b class="num">532</b>
    <span class="cap">今日完成</span>
  </NvScreenDonut>
</template>
```

## 资源状态分布

多段构成 + 自定义尺寸/厚度。

<ScreenDemo>
  <NvScreenDonut :segments="states" :size="132" :thickness="13">
    <b style="font-size: 24px; font-weight: 800; color: var(--nv-scr-text)">62</b>
    <span style="margin-top: 4px; font-size: 11px; color: var(--nv-scr-muted)">资源总数</span>
  </NvScreenDonut>
</ScreenDemo>

```vue
<NvScreenDonut :segments="resourceStates" :size="132" :thickness="13">
  <b class="num">62</b>
  <span class="cap">资源总数</span>
</NvScreenDonut>
```

## 关闭内置图例

`legend=false` 时只渲染环体,图例自行排版。

<ScreenDemo>
  <NvScreenDonut :segments="load" :legend="false" :size="96">
    <b style="font-size: 19px; font-weight: 800; color: var(--nv-scr-text)">71</b>
  </NvScreenDonut>
</ScreenDemo>

```vue
<NvScreenDonut :segments="segments" :legend="false" :size="96" />
```

## API

| Prop        | 类型                        | 默认   | 说明                          |
| ----------- | --------------------------- | ------ | ----------------------------- |
| `segments`  | `{ label, value, color }[]` | —      | 占比段(value 为 0 的段不占缝) |
| `size`      | `number`                    | `118`  | 环直径(px)                    |
| `thickness` | `number`                    | `11`   | 环厚(px)                      |
| `legend`    | `boolean`                   | `true` | 右侧内置图例                  |
| 默认插槽    | —                           | —      | 环中心内容(主数字 + 说明)     |

## 独立内容来源（T05/A05）

segments 是有限、非负的数量；label 为唯一身份，顺序由宿主提供。零值段无可见弧，空数组只保留底环和宿主 center slot。单个正值段占满圆（包括 0.2 这类小于 1 的数量），多个正值按输入比例分配并留原有段间缝。计算先按最大段归一化后求和，两个 `1e308` 的有限输入仍各占一半。负数或非有限值不定义为环形份额，不把它们转换为业务状态；未收紧现有 number 类型。

legend 默认 true，关闭后 center slot 保留。图例保留完整标签并允许换行；替换/重排 segments 后弧与图例一起更新。中心合计、单位与领域口径由宿主提供，组件不请求 API、不替宿主决定汇总。

```vue
<NvScreenDonut
  :segments="[
    { label: '阅读', value: 53, color: 'var(--nv-scr-cyan)' },
    { label: '影像', value: 27, color: 'var(--nv-scr-indigo)' },
  ]"
>
  <b>80</b><span>内容到访</span>
</NvScreenDonut>
```

`/#screen/charts` 提供多类、单类、零值、替换与 legend 开关，验证记录见 `docs/evidence/t05-a05/README.md`。
