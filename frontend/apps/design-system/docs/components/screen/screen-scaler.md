---
title: NvScreenScaler 舞台缩放
---

# NvScreenScaler 舞台缩放

默认 fixed 全屏、1920×1080、fit，按实际容器缩放内容。独立运行入口为 playground 的 `/#screen` 或可刷新深链 `/#screen/stage`；[接入与溢出说明](../../../../../../docs/screen-standalone.md)。不依赖旧大屏应用或 VitePress wrapper。

```vue
<script setup lang="ts">
import { NvScreenScaler, NvScreenHeader } from '@nerv-iip/ui'
</script>

<template>
  <NvScreenScaler :design-width="1920" :design-height="1080" mode="fit">
    <NvScreenHeader
      title="城市文化空间"
      time="10:24:36"
      date="星期日"
      line="全城空间"
      screen="城市客厅 01"
    />
    <!-- 按设计尺寸组织内容；数据与时间由宿主提供 -->
  </NvScreenScaler>
</template>
```

## 缩放与定位

| mode          | 行为                                             |
| ------------- | ------------------------------------------------ |
| `fit`（默认） | 等比取较小边，实体边界居中留边，整屏完整显示     |
| `width`       | 按宽等比、从顶端开始，根原生滚动可到达溢出的底部 |
| `stretch`     | 宽高独立拉伸，改变长宽比                         |

默认根 `position:fixed;inset:0`。保留宿主导航时，在明确有尺寸的相对定位容器中通过 class/style 设置 Scaler 为 `position:absolute`；ResizeObserver 及 resize 测量根 clientWidth/clientHeight。不要直接塞进无尺寸 Card。缩放后的 bounds 提供真实滚动范围，装饰与固定层随组件卸载。

## API

| Prop           | 类型                            | 默认    | 说明                                   |
| -------------- | ------------------------------- | ------- | -------------------------------------- |
| `designWidth`  | `number`                        | `1920`  | 正有限设计宽度；非法输入按轴回退到默认 |
| `designHeight` | `number`                        | `1080`  | 正有限设计高度；非法输入按轴回退到默认 |
| `mode`         | `'fit' \| 'width' \| 'stretch'` | `'fit'` | 缩放方式                               |
| 默认插槽       | —                               | —       | 按设计尺寸组织的内容                   |

主桶亦导出 `computeScale(viewportW, viewportH, designW, designH, mode)` 和类型 `ScaleMode` / `Scale`。纯函数对任一非有限或非正尺寸返回 `{ x: 1, y: 1 }`；正常比例合同不变。实际几何、原生滚动和 browser zoom 另以真实浏览器验收，不由纯函数测试替代。
