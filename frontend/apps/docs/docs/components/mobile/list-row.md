---
layout: page
title: NvListRow 列表行
---

<script setup>
import { NvListRow } from '@nerv-iip/ui-mobile'
</script>

<MobileDoc>

<template #phone>

  <section>
    <p class="nv-mdoc-label">基础用法</p>
    <div class="overflow-hidden border-y border-border">
      <NvListRow title="季度回顾草稿" subtitle="REC-2406-0421 · 320 条" />
      <NvListRow title="设计评审纪要" subtitle="REC-2406-0426 · 640 条" />
      <NvListRow title="发布检查清单" subtitle="REC-2406-0430 · 1,200 条" />
    </div>
  </section>
  <section>
    <p class="nv-mdoc-label">非交互行</p>
    <div class="overflow-hidden border-y border-border">
      <NvListRow title="团队" subtitle="Alpha 组 · 张伟" :interactive="false" />
    </div>
  </section>
</template>

# NvListRow 列表行

可点击的列表行：主标题 + 可选副标题，尾部箭头表示可进入。适合记录、条目等列表场景。

## 示例

可点击行尾部显示箭头，点击或回车触发 `@select`。

```vue
<NvListRow title="季度回顾草稿" subtitle="REC-2406-0421 · 320 条" @select="open('REC-2406-0421')" />
```

传 `:interactive="false"` 隐藏箭头并禁用点击，用于纯展示行。

```vue
<NvListRow title="团队" subtitle="Alpha 组 · 张伟" :interactive="false" />
```

## API

### NvListRow 属性

| 属性          | 说明                 | 类型      | 默认   |
| ------------- | -------------------- | --------- | ------ |
| `title`       | 主标题               | `string`  | —      |
| `subtitle`    | 副标题               | `string`  | —      |
| `interactive` | 可点击并显示尾部箭头 | `boolean` | `true` |

### 事件

| 事件     | 说明                                     | 回调参数 |
| -------- | ---------------------------------------- | -------- |
| `select` | 点击或回车（仅在 `interactive` 为真时） | —        |

### 插槽

| 插槽       | 说明             |
| ---------- | ---------------- |
| `meta`     | 标题下方附加内容 |
| `trailing` | 尾部自定义内容   |

</MobileDoc>
