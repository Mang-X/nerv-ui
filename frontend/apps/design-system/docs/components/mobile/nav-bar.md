---
layout: page
title: NvNavBar 顶部栏
---

<script setup>
import { NvNavBar, NvMobileButton } from '@nerv-iip/ui-mobile'
import { EllipsisIcon } from '@lucide/vue'
</script>

<MobileDoc>

<template #phone>

  <section>
    <p class="nv-mdoc-label">基础用法</p>
    <div class="border-b border-border bg-card">
      <NvNavBar title="记录详情" />
    </div>
  </section>
  <section>
    <p class="nv-mdoc-label">返回与右侧操作</p>
    <div class="border-b border-border bg-card">
      <NvNavBar title="REC-2406-0413" back>
        <template #right>
          <NvMobileButton variant="text" size="sm" aria-label="更多">
            <EllipsisIcon class="size-5" aria-hidden="true" />
          </NvMobileButton>
        </template>
      </NvNavBar>
    </div>
  </section>
</template>

# NvNavBar 顶部栏

顶部应用栏：标题居中，左侧可选返回，右侧自由放置操作。

## 示例

仅标题居中的最简形态。

```vue
<NvNavBar title="记录详情" />
```

`back` 显示左侧返回按钮，`#right` 插槽放置操作。

```vue
<NvNavBar title="REC-2406-0413" back @back="goBack">
  <template #right>
    <NvMobileButton variant="text" size="sm" aria-label="更多">
      <EllipsisIcon class="size-5" />
    </NvMobileButton>
  </template>
</NvNavBar>
```

## API

### NvNavBar 属性

| 属性    | 说明                       | 类型      | 默认    |
| ------- | -------------------------- | --------- | ------- |
| `title` | 居中标题（也可用默认插槽） | `string`  | —       |
| `back`  | 显示左侧返回按钮           | `boolean` | `false` |

### 事件

| 事件   | 说明         | 回调参数 |
| ------ | ------------ | -------- |
| `back` | 点击返回按钮 | —        |

### 插槽

| 插槽      | 说明     |
| --------- | -------- |
| `default` | 标题区   |
| `left`    | 左侧区域 |
| `right`   | 右侧操作 |

## 设计说明

返回按钮真实占位为 44×44px，内部按压圆面保留 36×36px；图标随新按钮中心向右移动 4px。顶部栏仍为 48px 高，标题与左右插槽保留原接口。

</MobileDoc>
