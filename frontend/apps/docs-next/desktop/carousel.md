---
title: NvCarousel 轮播
---

<script setup>
import { ref } from 'vue'
import { NvCarousel, NvCarouselItem } from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const stats = [
  { title: '当日数量', value: '1,284 项', note: '较昨日 +36' },
  { title: '任务完成率', value: '98.2%', note: '目标 95%' },
  { title: '资源利用率', value: '82%', note: '高于基线 6 点' },
  { title: '进行中任务', value: '17 项', note: '无超期' },
]

const cards = [
  { title: 'A 线 · 焊接', value: '624', unit: '件' },
  { title: 'B 线 · 装配', value: '312', unit: '件' },
  { title: 'C 线 · 涂装', value: '198', unit: '件' },
  { title: 'D 线 · 检测', value: '150', unit: '件' },
  { title: 'E 线 · 包装', value: '96', unit: '件' },
]

const page = ref(1)
const playing = ref(false)
</script>

# NvCarousel 轮播

逐屏浏览一组内容：箭头、圆点与计数三种导航形态，拖拽、键盘方向键、循环和自动轮播，全部来自 `@ui-sdk/vue` 的轮播原语。

## 示例

### 基础用法：箭头 + 圆点

<Demo block>
  <NvCarousel v-model:page="page" label="项目概览">
    <NvCarouselItem v-for="slide in stats" :key="slide.title" :label="slide.title">
      <div
        style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 4px;
          height: 170px;
          padding: 0 48px;
          border-radius: 10px;
          background: var(--vp-c-bg-soft);
        "
      >
        <div style="font-size: 13px; color: var(--vp-c-text-2)">{{ slide.title }}</div>
        <div style="font-size: 28px; font-weight: 600; font-variant-numeric: tabular-nums">{{ slide.value }}</div>
        <div style="font-size: 12px; color: var(--vp-c-text-3)">{{ slide.note }}</div>
      </div>
    </NvCarouselItem>
  </NvCarousel>
  <p style="margin: 10px 0 0; font-size: 13px; color: var(--vp-c-text-2)">
    当前第 {{ page }} 页，共 {{ stats.length }} 页
  </p>
</Demo>

### 悬停才浮现的箭头

箭头默认常显。内容本身已经很满时（大图、视频封面）可以让它只在鼠标移入或键盘聚焦时才出现，静息态完全让给内容。触屏上没有悬停，箭头保持常显。

<Demo block>
  <NvCarousel arrow-visibility="hover" label="悬停浮现箭头">
    <NvCarouselItem v-for="slide in stats" :key="slide.title" :label="slide.title">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 150px;
          border-radius: 10px;
          background: var(--vp-c-bg-soft);
          font-size: 18px;
          font-weight: 500;
        "
      >
        {{ slide.title }} · {{ slide.value }}
      </div>
    </NvCarouselItem>
  </NvCarousel>
</Demo>

### 计数与自动轮播

`indicatorType="number"` 把圆点换成「2 / 5」计数，适合页数多、圆点会排成一条的场合。`playToggle` 给出一枚播放/暂停按钮——自动轮播遇到键盘焦点移入、切走标签页、滚出视口都会自己暂停，这枚按钮让用户能重新掌控。

<Demo block>
  <NvCarousel
    v-model:playing="playing"
    :interval="3000"
    indicator-type="number"
    play-toggle
    loop
    label="自动轮播的计数"
  >
    <NvCarouselItem v-for="slide in cards" :key="slide.title" :label="slide.title">
      <div
        style="
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 6px;
          height: 150px;
          border-radius: 10px;
          background: var(--vp-c-bg-soft);
        "
      >
        <span style="font-size: 15px; color: var(--vp-c-text-2)">{{ slide.title }}</span>
        <span style="font-size: 26px; font-weight: 600; font-variant-numeric: tabular-nums">{{ slide.value }}</span>
        <span style="font-size: 13px; color: var(--vp-c-text-3)">{{ slide.unit }}</span>
      </div>
    </NvCarouselItem>
  </NvCarousel>
</Demo>

### 自动轮播时圆点即进度

自动轮播进行中，选中的那条胶囊改当进度槽，品牌色从左扫满、扫满即翻页。悬停会暂停，进度条也跟着停——不会出现「槽已经满了却还要再等一整个间隔」的错觉。系统开启「减弱动效」时不扫动，直接保持品牌实心。

<Demo block>
  <NvCarousel :default-playing="true" :interval="2500" loop label="圆点充当进度">
    <NvCarouselItem v-for="slide in cards" :key="slide.title" :label="slide.title">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 130px;
          border-radius: 10px;
          background: var(--vp-c-bg-soft);
          font-size: 17px;
        "
      >
        {{ slide.title }} · {{ slide.value }} · {{ slide.note }}
      </div>
    </NvCarouselItem>
  </NvCarousel>
</Demo>

### 每屏多张：宽度自动分摊

`slidesPerPage` 与 `gap` 一起决定每张幻灯片的宽度。幻灯片不用再自己算 `calc(50% - 6px)`——那个 6 是间距的一半，改一次间距就要把所有 `basis` 跟着改一遍。多张并排时内容贴边，配合 `arrowVisibility="hover"` 让箭头只在悬停时出现。

<Demo block>
  <NvCarousel :slides-per-page="3" :gap="12" arrow-visibility="hover" label="每屏三张">
    <NvCarouselItem v-for="slide in cards" :key="slide.title" :label="slide.title">
      <div
        style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 2px;
          height: 110px;
          padding: 0 14px;
          border-radius: 10px;
          background: var(--vp-c-bg-soft);
        "
      >
        <span style="font-size: 13px; color: var(--vp-c-text-2)">{{ slide.title }}</span>
        <span style="font-size: 20px; font-weight: 600">{{ slide.value }}</span>
      </div>
    </NvCarouselItem>
  </NvCarousel>
</Demo>

### 露出下一张的一角

给 `basis` 写一个小于每屏份额的百分比，下一张就会从右边露出来，提示「还有更多」。`loop` 打开后组尾也一样。

<Demo block>
  <NvCarousel :slides-per-page="2" loop label="露边">
    <!-- 2 张/屏、间距 12：整份额是 calc((100% - 12px) / 2)，写 70% 让它比份额窄 -->
    <NvCarouselItem v-for="slide in cards" :key="slide.title" :label="slide.title" basis="65%">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 130px;
          border-radius: 10px;
          background: var(--vp-c-bg-soft);
          font-size: 16px;
        "
      >
        {{ slide.title }}
      </div>
    </NvCarouselItem>
  </NvCarousel>
</Demo>

### 竖向轮播

`orientation="vertical"` 换成上下滚动、上下方向键翻页；一对箭头落到底栏右侧——竖向内容本身是满宽的，箭头压在边上必然盖字。竖向轮播要给定高度，否则视口会被所有幻灯片一起撑开、一次全露出来。

<Demo block>
  <div style="max-width: 360px; height: 240px">
    <NvCarousel orientation="vertical" label="竖向轮播">
      <NvCarouselItem
        v-for="slide in stats"
        :key="slide.title"
        :label="slide.title"
        basis="96px"
      >
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
            height: 96px;
            padding-bottom: 8px;
            padding-inline: 16px;
            border-radius: 10px;
            background: var(--vp-c-bg-soft);
          "
        >
          <span style="font-size: 14px; color: var(--vp-c-text-2)">{{ slide.title }}</span>
          <span style="font-size: 20px; font-weight: 600">{{ slide.value }}</span>
        </div>
      </NvCarouselItem>
    </NvCarousel>
  </div>
</Demo>

### 细线指示器

`indicatorType="line"` 用分段细线替代圆点，横向排开更像「进度刻度」，适合大屏看板。

<Demo block>
  <NvCarousel indicator-type="line" :default-page="2" loop label="细线指示器">
    <NvCarouselItem v-for="slide in cards" :key="slide.title" :label="slide.title">
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 120px;
          border-radius: 10px;
          background: var(--vp-c-bg-soft);
          font-size: 16px;
        "
      >
        {{ slide.title }}
      </div>
    </NvCarouselItem>
  </NvCarousel>
</Demo>

## API

### NvCarousel 属性

| 属性              | 说明                                          | 类型                     | 默认         |
| ----------------- | --------------------------------------------- | ------------------------ | ------------ |
| `page`            | 受控页码，从 1 开始（`v-model:page`）         | `number`                 | —            |
| `defaultPage`     | 非受控初始页码                                | `number`                 | —            |
| `orientation`     | 轮播方向                                      | `horizontal \| vertical` | `horizontal` |
| `align`           | 页面在视口中的对齐位置                        | `start \| center \| end` | `start`      |
| `slidesPerPage`   | 每页容纳的幻灯片数量，`auto` 按视口宽度自适应 | `number \| 'auto'`       | `1`          |
| `gap`             | 幻灯片之间的间距（px）                        | `number`                 | `12`         |
| `loop`            | 首尾循环                                      | `boolean`                | —            |
| `drag`            | 允许指针拖拽换页                              | `boolean`                | `true`       |
| `dragFree`        | 拖拽后不吸附到整页                            | `boolean`                | —            |
| `skipSnaps`       | 拖拽时跳过吸附点                              | `boolean`                | —            |
| `interval`        | 自动轮播间隔，单位毫秒                        | `number`                 | `5000`       |
| `playing`         | 受控自动轮播状态（`v-model:playing`）         | `boolean`                | —            |
| `defaultPlaying`  | 非受控初始自动轮播状态                        | `boolean`                | `false`      |
| `controls`        | 显示上一页、下一页按钮                        | `boolean`                | `true`       |
| `arrowVisibility` | 箭头常显还是悬停/聚焦才浮现                   | `always \| hover`        | `always`     |
| `indicators`      | 显示页码指示                                  | `boolean`                | `true`       |
| `indicatorType`   | 指示器形态                                    | `dot \| line \| number`  | `dot`        |
| `playToggle`      | 显示播放 / 暂停按钮                           | `boolean`                | `false`      |
| `label`           | 轮播的无障碍名称                              | `string`                 | `轮播`       |

### NvCarousel 事件

| 事件             | 说明                               |
| ---------------- | ---------------------------------- |
| `update:page`    | 页码变化，参数为 `number`          |
| `update:playing` | 自动轮播状态变化，参数为 `boolean` |

### NvCarouselItem 属性

| 属性    | 说明                                                   | 类型     | 默认     |
| ------- | ------------------------------------------------------ | -------- | -------- |
| `label` | 该页的无障碍名称，缺省为「第 N 页，共 M 页」           | `string` | —        |
| `basis` | 幻灯片宽度；不写则按 `slidesPerPage` 与 `gap` 自动分摊 | `string` | 自动分摊 |

## 行为说明

- **拖拽**：`drag` 默认开启，鼠标与触控板都能拖动轨道；触屏原生滑动始终可用。指在链接或按钮上时不会误拖。
- **键盘**：方向键翻页（竖向轮播用上下键），`Home` / `End` 跳到首尾；页指示器是一组 roving tab，方向键在其中移动。
- **自动轮播**：鼠标悬停、键盘焦点进入、切到别的标签页、轮播滚出视口都会暂停；离开后恢复，并从完整间隔重新计时。
- **减弱动效**：系统开启 `prefers-reduced-motion` 时，`defaultPlaying` 不自动开始（播放按钮仍可手动开），圆点进度条不扫动。
- **无障碍**：轮播是一个 `role="region"`，读作 carousel；每页带 `aria-roledescription="slide"`；移出视口的幻灯片退出 Tab 序与读屏树；自动轮播时内容区 `aria-live` 关闭，避免整屏反复朗读。计数形态另附读屏文本「第 N 页，共 M 页」，视觉上只显示 `N / M`。
