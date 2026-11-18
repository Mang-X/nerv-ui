---
title: NvMobileCollapse 折叠面板
---

<script setup>
import { NvMobileCollapse } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const logs = [
  '10:02:11 记录已创建',
  '10:05:40 处理人已领取',
  '10:18:02 首次校验通过',
]
</script>

# NvMobileCollapse 折叠面板

移动端可展开的内容块，标题与摘要常驻，展开后显示细节。

## 示例

<Demo block>
  <NvMobileCollapse title="流程说明" description="共 12 个步骤" default-open>
    <p style="margin: 0">先解析后转换，注意每步校验的容错余量不少于 20%。</p>
  </NvMobileCollapse>
  <NvMobileCollapse title="操作日志" description="3 条记录">
    <ul style="margin: 0; padding-left: 18px">
      <li v-for="line in logs" :key="line" v-text="line"></li>
    </ul>
  </NvMobileCollapse>
  <NvMobileCollapse title="已归档记录" description="仅查看" disabled>
    <p style="margin: 0">禁用状态下无法展开。</p>
  </NvMobileCollapse>
  <NvMobileCollapse title="常驻 DOM" description="关闭后仍保留内容" keep-mounted>
    <p style="margin: 0">设置 <code>keepMounted</code> 后关闭状态仍保留内容，便于页面内查找。</p>
  </NvMobileCollapse>
</Demo>

## API

### NvMobileCollapse 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | `false` |
| `title` | 标题 | `string` | — |
| `description` | 标题下方的摘要 | `string` | — |
| `disabled` | 禁用展开 | `boolean` | `false` |
| `keepMounted` | 关闭时保留 DOM，便于退场动画与页内查找 | `boolean` | `false` |
| `icon` | 标题前的图标组件 | `Component` | — |
| `ariaLabel` | 触发器的无障碍名称，缺省用 `title` | `string` | — |

### NvMobileCollapse 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 展开状态变化，参数为 `boolean` |
| `open-change` | 展开状态变化，参数为 `boolean` |

### NvMobileCollapse 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 替换标题前图标 |
| `title` | 自定义标题 |
| `description` | 自定义摘要 |
| `extra` | 标题行右侧、箭头之前的附加内容 |
| `default` | 展开后的内容 |
