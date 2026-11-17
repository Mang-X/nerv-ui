---
title: NvCarousel 轮播
---

<script setup>
import { ref } from 'vue'
import { NvCarousel, NvCarouselItem } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const page = ref(1)
const slides = [
  { title: '当日产量', value: '1,284 件' },
  { title: '一次通过率', value: '98.2%' },
  { title: '设备利用率', value: '82%' },
  { title: '在制批次', value: '17 个' },
]
</script>

# NvCarousel 轮播

逐屏浏览一组内容，支持按钮与圆点换页、键盘方向键、拖拽和自动轮播。

## 示例

<Demo block>
  <NvCarousel v-model:page="page" label="生产概览">
    <NvCarouselItem v-for="slide in slides" :key="slide.title" :label="slide.title">
      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 170px;
          border-radius: 10px;
          background: var(--vp-c-bg-soft);
          color: var(--vp-c-text-1);
        "
      >
        <div style="font-size: 13px; color: var(--vp-c-text-2)">{{ slide.title }}</div>
        <div style="font-size: 24px; font-weight: 600">{{ slide.value }}</div>
      </div>
    </NvCarouselItem>
  </NvCarousel>
  <p style="margin: 10px 0 0; font-size: 13px; color: var(--vp-c-text-2)">
    当前第 {{ page }} 页，共 {{ slides.length }} 页
  </p>
</Demo>

<Demo block>
  <NvCarousel :default-page="2" loop drag label="循环浏览">
    <NvCarouselItem v-for="slide in slides" :key="slide.title" :label="slide.title">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 140px;
          border-radius: 10px;
          background: var(--vp-c-bg-soft);
          font-size: 18px;
        "
      >
        {{ slide.title }} · {{ slide.value }}
      </div>
    </NvCarouselItem>
  </NvCarousel>
</Demo>

<Demo block>
  <NvCarousel :slides-per-page="2" label="每页两项">
    <NvCarouselItem
      v-for="slide in slides"
      :key="slide.title"
      :label="slide.title"
      basis="calc(50% - 6px)"
    >
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 120px;
          border-radius: 10px;
          background: var(--vp-c-bg-soft);
          font-size: 15px;
        "
      >
        {{ slide.title }}
      </div>
    </NvCarouselItem>
  </NvCarousel>
</Demo>

## API

### NvCarousel 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `page` | 受控页码，从 1 开始（`v-model:page`） | `number` | — |
| `defaultPage` | 非受控初始页码 | `number` | — |
| `orientation` | 轮播方向 | `horizontal \| vertical` | `horizontal` |
| `align` | 页面在视口中的对齐位置 | `start \| center \| end` | `start` |
| `slidesPerPage` | 每页容纳的幻灯片数量，`auto` 按视口宽度自适应 | `number \| 'auto'` | `1` |
| `loop` | 首尾循环 | `boolean` | — |
| `drag` | 允许指针拖拽换页 | `boolean` | — |
| `dragFree` | 拖拽后不吸附到整页 | `boolean` | — |
| `skipSnaps` | 拖拽时跳过吸附点 | `boolean` | — |
| `interval` | 自动轮播间隔，单位毫秒 | `number` | — |
| `playing` | 受控自动轮播状态（`v-model:playing`） | `boolean` | — |
| `defaultPlaying` | 非受控初始自动轮播状态 | `boolean` | — |
| `controls` | 显示上一页、下一页按钮 | `boolean` | `true` |
| `indicators` | 显示页码圆点 | `boolean` | `true` |
| `label` | 轮播的无障碍名称 | `string` | `轮播` |

### NvCarousel 事件

| 事件 | 说明 |
| --- | --- |
| `update:page` | 页码变化，参数为 `number` |
| `update:playing` | 自动轮播状态变化，参数为 `boolean` |

### NvCarouselItem 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `label` | 该页的无障碍名称，缺省为「第 N 页，共 M 页」 | `string` | — |
| `basis` | 幻灯片宽度，整页为 `100%`，多页时可用 `calc()` 分摊间距 | `string` | `100%` |
