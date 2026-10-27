---
title: 大屏 / 控制室
---

<script setup>
import { NvOeeHero, NvScreenPanel, NvRingGauge, NvScreenStatusTag, NvScreenStatusLight } from '@nerv-iip/ui'
</script>

# 大屏 / 控制室组件

面向公共空间、展馆、运营中心与控制室等远距显示表面的组件层。与桌面 PC、PDA 移动两层**完全解耦**:独立的 `--nv-scr-*` 深色工业蓝令牌(无亮色模式),只遵循统一的设计哲学 —— 克制、去装饰、动效减速无回弹。

独立 playground 从 `/#screen` 或 `/#screen/stage` 进入 A01 的 7 件基础外壳舞台；[独立大屏接入](../../../../../../docs/screen-standalone.md)说明范围。当前 39 件具名组件导出以包内 `screen/index.ts` 为准；各组 fresh 验收以对应证据为准，下方历史总览不代表全组 fresh 验收。

<ScreenDemo>
  <NvScreenPanel style="width: 360px">
    <NvOeeHero label="设备综合效率 OEE" :value="92.4" unit="%" delta="较昨日 +2.7%" />
  </NvScreenPanel>
  <NvRingGauge :value="78" label="稼动率" />
  <div style="display:flex;flex-direction:column;gap:12px">
    <NvScreenStatusTag tone="run">运行中</NvScreenStatusTag>
    <NvScreenStatusTag tone="idle">待机</NvScreenStatusTag>
    <NvScreenStatusTag tone="alarm">报警</NvScreenStatusTag>
  </div>
</ScreenDemo>

[流线与等距块体装饰背景](./decorative-backgrounds.md)由 #20 单独导出，可在 `/#screen/backgrounds` 查看双实例、主题和缩放。

[种子氛围布局](./screen-layout.md)组合固定 1920×1080 背景、现有页头与内容插槽；独立宿主入口 `/#screen/layout` 支持缩放与交互。

[远距主状态灯](./status-hero.md)保留主灯体量，颜色与节奏由宿主分别输入；独立宿主入口 `/#screen/status-hero` 展示两类来源和零、非零、未知失联说明。

## 为什么独立一层

大屏的观看距离(数米外)、环境(公共展示空间或控制室)、硬件(高亮 LED)都和近场的 PC / PDA 不同。强行复用浅色令牌会过曝、对比不足。因此这一层:

- **固定深色**:深藏青底 + 青色主辉光,不跟随亮/暗切换;
- **更大的字号与发光**:远距离可读,关键数字带 `text-shadow` 辉光;
- **独立令牌前缀 `--nv-scr-*`**:`--nv-scr-bg / --nv-scr-cyan / --nv-scr-green / --nv-scr-amber / --nv-scr-red / --nv-scr-panel-* …`,与共享层的 `--*` 不冲突;
- **数据驱动**:每个组件零 props 即可渲染示例,接真实数据只需传值。

## 组件分类

| 分类         | 组件                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 容器 / 外壳  | `NvScreenPanel` · `NvBorderPanel` · `NvTechFrame` · `NvTitleBar` · `NvScreenHeader` · `NvGlowDivider`                                                               |
| 指标 / 图表  | `NvOeeHero` · `NvRingGauge` · `NvCapsuleBar` · `NvDigitalFlop` · `NvSparkline` · `NvScreenTrendChart` · `NvTaktGantt`                                               |
| 数据 / 状态  | `NvScreenStatusCard` · `NvScreenFreshness` · `NvKpiBar` · `NvAlarmTable` · `NvScreenStatusLight` · `NvScreenStatusHero` · `NvScreenStatusTag` · `NvScreenStageFlow` |
| 控件(大屏化) | `NvScreenButton` · `NvScreenInput` · `NvScreenSelect` · `NvScreenSearch` · `NvScreenTable` · `NvScreenTabs` · `NvScreenSegmented` · `NvScreenSwitch`                |

从左侧目录进入任一组件查看用法与属性。

[阶段数量流](stage-flow.md)展示显式阶段数量、状态与连接符，窄容器换行；中性宿主见 `/#screen/stage-flow`。

[分档热力格](./heatmap.md)展示显式数值、图例与宿主时标；独立双来源见 `/#screen/heatmap`。
