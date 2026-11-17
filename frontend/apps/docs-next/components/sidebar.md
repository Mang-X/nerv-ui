---
title: NvSidebar 侧边栏
---

<script setup>
import { ref } from 'vue'
import {
  NvSidebar,
  NvSidebarHeader,
  NvSidebarGroup,
  NvSidebarItem,
} from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const collapsed = ref(false)
const railCollapsed = ref(true)
</script>

# NvSidebar 侧边栏

纵向导航容器，内置可折叠导轨；收起时隐藏文字但保留图标与无障碍名称。

## 示例

<Demo block>
  <div style="display: flex; height: 340px; border: 1px solid var(--vp-c-divider); border-radius: 10px; overflow: hidden; width: 100%">
    <NvSidebar v-model:collapsed="collapsed" width="220">
      <NvSidebarHeader>NvUI 制造平台</NvSidebarHeader>
      <NvSidebarGroup label="生产">
        <NvSidebarItem label="生产看板" active>
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.55" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.55" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3" />
            </svg>
          </template>
          生产看板
        </NvSidebarItem>
        <NvSidebarItem label="生产记录">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 3h9l4 4v14H6z" fill="none" stroke="currentColor" stroke-width="1.8" />
              <path d="M9 11h7M9 15h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </template>
          生产记录
        </NvSidebarItem>
        <NvSidebarItem label="资源监控">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8" />
              <path d="M12 8v4l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </template>
          资源监控
        </NvSidebarItem>
      </NvSidebarGroup>
      <NvSidebarGroup label="系统">
        <NvSidebarItem label="基础数据" href="#/master-data">基础数据</NvSidebarItem>
        <NvSidebarItem label="暂不可用" disabled>暂不可用</NvSidebarItem>
      </NvSidebarGroup>
    </NvSidebar>
    <div style="flex: 1; padding: 20px; color: var(--vp-c-text-2); font-size: 14px">
      收起状态：{{ collapsed ? '已收起（64px 导轨）' : '已展开（220px）' }}
    </div>
  </div>
</Demo>

<Demo block>
  <div style="display: flex; height: 260px; border: 1px solid var(--vp-c-divider); border-radius: 10px; overflow: hidden; width: 100%">
    <NvSidebar v-model:collapsed="railCollapsed" width="200" collapsed-width="56" collapsible>
      <NvSidebarHeader>控制台</NvSidebarHeader>
      <NvSidebarItem label="总览" active>总览</NvSidebarItem>
      <NvSidebarItem label="报警" href="#/alerts">报警</NvSidebarItem>
      <NvSidebarItem label="计划" href="#/scheduling">计划</NvSidebarItem>
    </NvSidebar>
    <div style="flex: 1; padding: 16px; font-size: 13px; color: var(--vp-c-text-2)">
      点击头部按钮切换窄轨；收起时条目仍保留 title 与 aria-label。
    </div>
  </div>
</Demo>

## API

### NvSidebar 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `collapsed` | 受控收起状态（`v-model:collapsed`） | `boolean` | — |
| `defaultCollapsed` | 非受控初始收起状态 | `boolean` | `false` |
| `collapsible` | 显示内置折叠按钮并允许窄轨 | `boolean` | `true` |
| `width` | 展开宽度，数字按 px 处理 | `number \| string` | `240` |
| `collapsedWidth` | 收起宽度，数字按 px 处理 | `number \| string` | `64` |
| `label` | 导航地标的无障碍名称 | `string` | `侧边栏` |

### NvSidebar 事件

| 事件 | 说明 |
| --- | --- |
| `update:collapsed` | 收起状态变化，参数为 `boolean` |
| `collapsedChange` | 同上，语义化别名 |

### NvSidebar 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置页头、分组与条目 |

### NvSidebarHeader 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 页头内容，收起时隐藏 |
| `toggle` | 替换内置折叠图标 |

### NvSidebarGroup 属性 / 插槽

| 属性 / 插槽 | 说明 | 类型 |
| --- | --- | --- |
| `label` | 分组小标题；`label` 插槽优先 | `string` |
| `label`（插槽） | 自定义分组标题 | — |
| `default`（插槽） | 分组内的条目 | — |

### NvSidebarItem 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `active` | 标记为当前目的地 | `boolean` | `false` |
| `disabled` | 禁用条目 | `boolean` | `false` |
| `href` | 提供后渲染为链接 | `string` | — |
| `label` | 条目文本；收起时同时作为 `aria-label` 与 `title` | `string` | — |

### NvSidebarItem 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 条目图标，收起时仍然显示 |
| `default` | 条目文本，展开时显示 |
