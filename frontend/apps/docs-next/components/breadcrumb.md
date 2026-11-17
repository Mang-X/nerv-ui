---
title: NvBreadcrumb 面包屑
---

<script setup>
import {
  NvBreadcrumb,
  NvBreadcrumbItem,
  NvBreadcrumbLink,
  NvBreadcrumbSeparator,
} from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'
</script>

# NvBreadcrumb 面包屑

显示当前页面在层级中的位置；链接项与当前项自动区分语义。

## 示例

<Demo block>
  <NvBreadcrumb>
    <NvBreadcrumbItem>
      <NvBreadcrumbLink href="#/">首页</NvBreadcrumbLink>
    </NvBreadcrumbItem>
    <NvBreadcrumbSeparator />
    <NvBreadcrumbItem>
      <NvBreadcrumbLink href="#/orders">生产工单</NvBreadcrumbLink>
    </NvBreadcrumbItem>
    <NvBreadcrumbSeparator />
    <NvBreadcrumbItem>
      <NvBreadcrumbLink current>WO-1024 详情</NvBreadcrumbLink>
    </NvBreadcrumbItem>
  </NvBreadcrumb>
</Demo>

<Demo block>
  <NvBreadcrumb label="设备位置">
    <NvBreadcrumbItem>
      <NvBreadcrumbLink href="#/">华东一厂</NvBreadcrumbLink>
    </NvBreadcrumbItem>
    <NvBreadcrumbSeparator />
    <NvBreadcrumbItem>
      <NvBreadcrumbLink href="#/workshop">装配车间</NvBreadcrumbLink>
    </NvBreadcrumbItem>
    <NvBreadcrumbSeparator>
      <span aria-hidden="true">/</span>
    </NvBreadcrumbSeparator>
    <NvBreadcrumbItem>
      <NvBreadcrumbLink>3 号产线</NvBreadcrumbLink>
    </NvBreadcrumbItem>
  </NvBreadcrumb>
</Demo>

<Demo block>
  <NvBreadcrumb>
    <NvBreadcrumbItem>
      <NvBreadcrumbLink href="#/">首页</NvBreadcrumbLink>
    </NvBreadcrumbItem>
    <NvBreadcrumbSeparator />
    <NvBreadcrumbItem>
      <NvBreadcrumbLink current>系统设置</NvBreadcrumbLink>
    </NvBreadcrumbItem>
  </NvBreadcrumb>
</Demo>

## API

### NvBreadcrumb 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `label` | 导航地标的无障碍名称 | `string` | `面包屑` |

### NvBreadcrumb 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置各 `NvBreadcrumbItem` 与分隔符 |

### NvBreadcrumbLink 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `href` | 链接地址；省略时渲染为纯文本 | `string` | — |
| `current` | 标记为当前页面，设置 `aria-current="page"` | `boolean` | `false` |

### NvBreadcrumbLink 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 面包屑文本 |

### NvBreadcrumbItem / NvBreadcrumbSeparator

两者均无自有属性；分隔符默认渲染 `ChevronRight` 图标，可用 `default` 插槽替换。
