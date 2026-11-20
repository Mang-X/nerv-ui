---
title: NvTitleBar 标题栏
---

<script setup>
import { NvTitleBar } from '@nerv-ui/ui'
</script>

# NvTitleBar 标题栏

区块级标题栏:居中标题(可带一行副题),左右各一条渐隐发丝线,内端各收于一颗青色菱形节点。不用面板就给一个分区抬头以分量 —— 菱形是唯一的青色点缀。用来在大屏里切分「分组综合监控」「资源健康」这类版块。

独立运行入口为 playground 的 `/#screen/stage`；[接入说明](../../../../../../docs/screen-standalone.md)列出公共 CSS、返回导航和验收范围。下方 VitePress 预览仍由 #10 单独恢复。

## 示例

### 基础用法

`title` 是居中主标题。

<ScreenDemo>
  <div style="width: 560px">
    <NvTitleBar title="分组综合监控" />
  </div>
</ScreenDemo>

```vue
<NvTitleBar title="分组综合监控" />
```

### 带副题

`sub` 在标题下补一行小字,放说明或时间戳。

<ScreenDemo>
  <div style="width: 560px">
    <NvTitleBar title="资源健康总览" sub="分组 A · 分组 B · 分组 C · 截至 2024-06-12 10:24" />
  </div>
</ScreenDemo>

```vue
<NvTitleBar title="资源健康总览" sub="分组 A · 分组 B · 分组 C · 截至 2024-06-12 10:24" />
```

## API

### NvTitleBar 属性

| 属性    | 说明                       | 类型     | 默认             |
| ------- | -------------------------- | -------- | ---------------- |
| `title` | 居中主标题                 | `string` | `'分组综合监控'` |
| `sub`   | 标题下的副题(为空则不渲染) | `string` | —                |
