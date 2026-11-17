---
title: NvNavigationMenu 导航菜单
---

<script setup>
import { ref } from 'vue'
import {
  NvNavigationMenu,
  NvNavigationMenuList,
  NvNavigationMenuItem,
  NvNavigationMenuTrigger,
  NvNavigationMenuContent,
  NvNavigationMenuLink,
} from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const openPanel = ref(null)
</script>

# NvNavigationMenu 导航菜单

顶部或侧边的层级导航；触发器悬停或点击展开面板，面板内放置链接。

## 示例

<Demo>
  <NvNavigationMenu v-model:value="openPanel">
    <NvNavigationMenuList>
      <NvNavigationMenuItem value="orders">
        <NvNavigationMenuTrigger>生产管理</NvNavigationMenuTrigger>
        <NvNavigationMenuContent>
          <NvNavigationMenuLink href="#/orders">生产记录</NvNavigationMenuLink>
          <NvNavigationMenuLink href="#/schedule">计划计划</NvNavigationMenuLink>
          <NvNavigationMenuLink href="#/reports">生产报表</NvNavigationMenuLink>
        </NvNavigationMenuContent>
      </NvNavigationMenuItem>
      <NvNavigationMenuItem value="devices">
        <NvNavigationMenuTrigger>资源</NvNavigationMenuTrigger>
        <NvNavigationMenuContent>
          <NvNavigationMenuLink href="#/devices">资源台账</NvNavigationMenuLink>
          <NvNavigationMenuLink href="#/monitor">实时监控</NvNavigationMenuLink>
          <NvNavigationMenuLink href="#/maintenance">保养计划</NvNavigationMenuLink>
        </NvNavigationMenuContent>
      </NvNavigationMenuItem>
      <NvNavigationMenuItem value="quality">
        <NvNavigationMenuTrigger>质量</NvNavigationMenuTrigger>
        <NvNavigationMenuContent>
          <NvNavigationMenuLink href="#/inspection">检验记录</NvNavigationMenuLink>
          <NvNavigationMenuLink href="#/spc">SPC 分析</NvNavigationMenuLink>
        </NvNavigationMenuContent>
      </NvNavigationMenuItem>
    </NvNavigationMenuList>
  </NvNavigationMenu>
</Demo>

当前展开：{{ openPanel || '无' }}

<Demo>
  <NvNavigationMenu :delay="0" :close-delay="0" :open-on-hover="false">
    <NvNavigationMenuList>
      <NvNavigationMenuItem value="click">
        <NvNavigationMenuTrigger>点击才展开</NvNavigationMenuTrigger>
        <NvNavigationMenuContent>
          <NvNavigationMenuLink href="#/a">菜单项 A</NvNavigationMenuLink>
          <NvNavigationMenuLink href="#/b">菜单项 B</NvNavigationMenuLink>
        </NvNavigationMenuContent>
      </NvNavigationMenuItem>
      <NvNavigationMenuItem>
        <NvNavigationMenuLink href="#/help">帮助中心</NvNavigationMenuLink>
      </NvNavigationMenuItem>
    </NvNavigationMenuList>
  </NvNavigationMenu>
</Demo>

<Demo block>
  <div style="height: 220px; width: 100%">
    <NvNavigationMenu orientation="vertical" :open-on-hover="false" label="侧边导航">
      <NvNavigationMenuList>
        <NvNavigationMenuItem value="v1">
          <NvNavigationMenuTrigger>纵向菜单项</NvNavigationMenuTrigger>
          <NvNavigationMenuContent side="right" align="start">
            <NvNavigationMenuLink href="#/v1">子项一</NvNavigationMenuLink>
            <NvNavigationMenuLink href="#/v2">子项二</NvNavigationMenuLink>
          </NvNavigationMenuContent>
        </NvNavigationMenuItem>
        <NvNavigationMenuItem>
          <NvNavigationMenuLink href="#/v3">纵向直达链接</NvNavigationMenuLink>
        </NvNavigationMenuItem>
      </NvNavigationMenuList>
    </NvNavigationMenu>
  </div>
</Demo>

## API

### NvNavigationMenu 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 受控展开项的值（`v-model:value`）；`null` 表示全部收起 | `string \| null` | — |
| `defaultValue` | 非受控初始展开项 | `string \| null` | — |
| `delay` | 指针停留多少毫秒后展开面板 | `number` | `50` |
| `closeDelay` | 关闭面板的延迟毫秒数 | `number` | `50` |
| `openOnHover` | 指针悬停在触发器上时展开 | `boolean` | `true` |
| `closeOnSelect` | 选中链接后关闭面板 | `boolean` | `true` |
| `orientation` | 排列方向 | `horizontal \| vertical` | `horizontal` |
| `label` | 导航地标的无障碍名称 | `string` | `主导航` |

### NvNavigationMenu 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 展开项变化，参数为 `string \| null` |

### NvNavigationMenu 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置 `NvNavigationMenuList` |

### NvNavigationMenuItem 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 标识条目的值，省略时自动生成 | `string` | — |

### NvNavigationMenuTrigger 属性 / 插槽

| 属性 / 插槽 | 说明 | 类型 |
| --- | --- | --- |
| `disabled` | 禁用触发器 | `boolean` |
| `default`（插槽） | 触发器文案，组件自动追加箭头图标 | — |

### NvNavigationMenuContent 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `side` | 弹层相对触发器的方向 | `top \| right \| bottom \| left` | `bottom` |
| `align` | 弹层对齐方式 | `start \| center \| end` | `start` |
| `sideOffset` | 与触发器的间距（px） | `number` | `6` |
| `keepMounted` | 关闭后仍保留内容 | `boolean` | `false` |

### NvNavigationMenuLink 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `href` | 链接地址 | `string` | — |
| `current` | 标记为当前页面 | `boolean` | `false` |
| `closeOnSelect` | 选中后关闭面板，覆盖菜单级设置 | `boolean` | — |

### NvNavigationMenuLink / Content 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 链接文本 / 面板内容 |
