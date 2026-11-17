---
title: NvCard 卡片
---

<script setup>
import { NvCard, NvCardHeader, NvCardContent, NvCardFooter, NvButton } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'
</script>

# NvCard 卡片

把相关信息聚合成一块表面，内置页头、内容与页脚三段结构，提供描边、实底与透明三种形态。

## 示例

<Demo>
  <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); width: 100%">
    <NvCard>
      <NvCardHeader>描边卡片</NvCardHeader>
      <NvCardContent>工单 WO-1024 已进入精加工工序，预计今日 16:00 完成。</NvCardContent>
      <NvCardFooter>
        <NvButton size="sm">查看详情</NvButton>
      </NvCardFooter>
    </NvCard>
    <NvCard variant="solid">
      <NvCardHeader>实底卡片</NvCardHeader>
      <NvCardContent>当前班次产出 1,284 件，一次通过率 98.2%。</NvCardContent>
      <NvCardFooter>
        <NvButton size="sm" variant="outline">导出报表</NvButton>
      </NvCardFooter>
    </NvCard>
    <NvCard variant="ghost">
      <NvCardHeader>幽灵卡片</NvCardHeader>
      <NvCardContent>无边框、无背景，适合嵌在已有面板内部。</NvCardContent>
      <NvCardFooter>
        <NvButton size="sm" variant="ghost">忽略</NvButton>
      </NvCardFooter>
    </NvCard>
  </div>
</Demo>

<Demo>
  <NvCard style="width: 100%">
    <NvCardContent>
      只有内容段：也可以直接放任意内容，不强制使用页头或页脚。
    </NvCardContent>
  </NvCard>
</Demo>

## API

### NvCard 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `variant` | `outline` 保留细边框；`solid` 使用抬升表面色；`ghost` 完全透明 | `outline \| solid \| ghost` | `outline` |

### NvCard 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 卡片内容，通常放 `NvCardHeader`、`NvCardContent`、`NvCardFooter` |

### NvCardHeader / NvCardContent / NvCardFooter

三段容器均无自有属性，会透传未列出的属性；各自提供 `default` 插槽放置内容。
