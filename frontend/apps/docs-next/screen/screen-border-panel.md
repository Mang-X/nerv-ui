---
title: NvScreenBorderPanel 大屏装饰面板
---

<script setup>
import { NvScreenBorderPanel } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'
</script>

# NvScreenBorderPanel 大屏装饰面板

顶部缺口、四角短标记与可选标题的分区容器。装饰用，正文字径与信息密度交给调用方。

## 示例

<Demo>
  <div class="nv-screen-stage" style="padding: 40px">
    <NvScreenBorderPanel title="今日产量">
      <div style="display: flex; align-items: center; justify-content: center; height: 120px; opacity: 0.7">
        汇总内容
      </div>
    </NvScreenBorderPanel>
  </div>
</Demo>

## API

| 属性 / 插槽 | 说明 |
| --- | --- |
| `title` | 顶部标题，可选。 |
| `title` 插槽 | 需要富文本标题时用插槽，优先于 `title`。 |
| 默认插槽 | 正文。 |
