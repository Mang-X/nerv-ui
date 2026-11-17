---
title: NvScreenFusionBg 等距节点与有向流
---

<script setup lang="ts">
import FusionDemo from '../../../../playground/src/screen/FusionDemo.vue'
</script>

# NvScreenFusionBg 等距节点与有向流

通过主桶 `@nerv-iip/ui` 导入 `NvScreenFusionBg`、`FusionNode`、`FusionEdge`。独立宿主入口 `/#screen/backgrounds`。

## 示例

<ScreenDemo wide><FusionDemo /></ScreenDemo>

## API

### NvScreenFusionBg 属性

| 属性    | 类型           | 默认 |
| ------- | -------------- | ---- |
| `nodes` | `FusionNode[]` | `[]` |
| `edges` | `FusionEdge[]` | `[]` |
| `cell`  | `number`       | `34` |

## 设计说明

节点为 `{ id, sx, sy, w, d, h, label, caption?, icon?, tone }`；tone 显式为 cyan/green/amber/indigo。图标是可信 Vue 显示组件，不接收业务记录；label/caption 使用文本插值。完整长名称在宿主图下重复提供可读文本。

边为 `{ id, source, target, bend? }`，bend 是曲线控制点的有符号法向偏移，默认 -40；0 为直线。方向从 source 顶面中心到 target 顶面中心，负 dashoffset 变化沿该方向显示流动。缺任一端点时不显示该边，不推断替代节点。

id 在各自集合内唯一且稳定；同 id 更新、重排、替换与清空即时重算。几何使用有限、合理范围数值；sx/sy 接受零和负坐标，w/d/h 非负，cell 正数。默认 viewBox 为 0 0 1440 810，可通过 SVG 属性设置负坐标视区；宿主负责留出文字空间。

根 SVG 是 aria-hidden 装饰层，图标没有交互；根及子元素 pointer-events 为 none。语义与交互放在独立宿主层。本件无 events/slots，无 timer/observer/RAF/随机粒子；低动效通过 CSS animation:none 保留静态图。DOM 声明测试不能替代真实动画/指针视觉验证。

本件没有 SVG defs/id/use/href/marker/gradient，所以跨独立 Vue app 根没有内部引用冲突。若组合 `NvScreenLayout` 等有定义的组件，SSR 水合前各宿主必须配置不同 `app.config.idPrefix`，服务端与客户端一致；useId 只保证单 app 内稳定。

来源固定 Nerv-IIP 79b1578f2b75f55709765b5e7882aaf33146c603 的 FusionBg.vue；保留三面投影、顶部图标、双行文字、二次曲线及沿线流动。原素材和 reference 不变；无直接 consumer。原应用接入 NOT_PLANNED。

<!-- @include: ../../../../../DESIGN/components/screen-fusion-background.md -->
