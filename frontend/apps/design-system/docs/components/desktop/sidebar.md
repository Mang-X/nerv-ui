---
title: Sidebar 侧栏
---

<script setup>
import BaseSidebarExample from '../../.vitepress/examples/BaseSidebarExample.vue'
import SidebarPartsExample from '../../.vitepress/examples/SidebarPartsExample.vue'
import { ref } from 'vue'
import {
  SidebarProvider, NvSidebar, SidebarHeader, SidebarContent, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarGroupAction,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuBadge,
  SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
  SidebarSeparator, SidebarInput, SidebarRail, SidebarTrigger, SidebarInset,
  NvSidebarBrand, NvSidebarDot, NvSidebarUser, NvSidebarSub, NvSidebarRail, NvSidebarTrigger,
  TooltipProvider,
} from '@nerv-iip/ui'
import {
  LayoutDashboardIcon, BoxesIcon, ClipboardCheckIcon, WrenchIcon, SettingsIcon,
  FactoryIcon, ChevronRightIcon, PlusIcon, BellIcon, SearchIcon,
  GaugeIcon, ActivityIcon,
} from '@lucide/vue'

// 一级导航选择（点击即切换激活项）
const nav = ref('总览')
// 二级菜单展开 + 选中分组/节点
const press = ref(true)
const weld = ref(false)
const line = ref('L01')
// 待办选中
const todo = ref('待分配任务')
</script>

# Sidebar 侧栏

可折叠的控制台侧栏**原子件**：`SidebarProvider` 提供上下文，`Sidebar` 承载分组导航，配合 `NvSidebarRail` / `NvSidebarTrigger` 折叠。需要开箱即用的整页外壳时用 [NvAppShellInset](/components/desktop/dashboard)，需要自定义结构时用这些原子件自行拼装。

## 示例

工作区品牌头 + 分组导航（计数徽标、在线状态点、品牌强调）+ 用户区。点击任意项即切换激活态；`collapsible="icon"` 折叠为图标条，标题文本隐藏（非压缩），悬停图标时显示文字提示。

<Demo>
<div class="nv-sb nv-nv-scr-collapse nv-nv-scr-tall">
  <TooltipProvider :delay-duration="0">
  <SidebarProvider>
    <NvSidebar collapsible="icon">
      <SidebarHeader>
        <NvSidebarBrand name="Nerv-IIP" sub="Alpha 团队 · 在线" logo="N" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>工作</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton :is-active="nav === '总览'" tooltip="总览" @click="nav = '总览'"><LayoutDashboardIcon /><span>总览</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton :is-active="nav === '任务'" tooltip="任务" @click="nav = '任务'"><BoxesIcon /><span>任务</span></SidebarMenuButton>
              <SidebarMenuBadge>24</SidebarMenuBadge>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton :is-active="nav === '审核'" tooltip="审核" @click="nav = '审核'"><ClipboardCheckIcon /><span>审核</span></SidebarMenuButton>
              <SidebarMenuBadge>3</SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>资源</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton :is-active="nav === '资源'" tooltip="资源 · 在线" @click="nav = '资源'">
                <WrenchIcon /><span>资源</span>
                <NvSidebarDot tone="ok" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton :is-active="nav === '告警'" tooltip="告警 · 2 条未读" @click="nav = '告警'">
                <BellIcon /><span>告警</span>
                <NvSidebarDot tone="warn" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton :is-active="nav === '设置'" tooltip="设置" @click="nav = '设置'"><SettingsIcon /><span>设置</span></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="张伟 · 团队主管">
              <NvSidebarUser name="张伟" role="团队主管 · 值班" initials="张" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <NvSidebarRail />
    </NvSidebar>
    <SidebarInset class="nv-nv-scr-inset">
      <header class="nv-nv-scr-topbar">
        <NvSidebarTrigger />
        <span class="nv-nv-scr-topbar-divider" aria-hidden="true" />
        <span class="text-sm text-muted-foreground">控制台</span>
        <ChevronRightIcon class="size-3.5 text-muted-foreground/50" />
        <span class="text-sm font-medium">{{ nav }}</span>
      </header>
      <div class="nv-nv-scr-body">
        <div class="nv-nv-scr-tiles">
          <div class="nv-nv-scr-tile"><span class="nv-nv-scr-tile-label">今日完成</span><span class="nv-nv-scr-tile-value">412 <small>项</small></span></div>
          <div class="nv-nv-scr-tile"><span class="nv-nv-scr-tile-label">进行中任务</span><span class="nv-nv-scr-tile-value">18</span></div>
          <div class="nv-nv-scr-tile"><span class="nv-nv-scr-tile-label">利用率</span><span class="nv-nv-scr-tile-value nv-nv-scr-tile-ok">78.6 <small>%</small></span></div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
  </TooltipProvider>
</div>
</Demo>

```vue
<NvSidebar collapsible="icon">
  <SidebarHeader>
    <NvSidebarBrand name="Nerv-IIP" sub="Alpha 团队 · 在线" logo="N" />
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>工作</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton :is-active="nav === '总览'" tooltip="总览" @click="nav = '总览'">
            <LayoutDashboardIcon /><span>总览</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="资源">
            <WrenchIcon /><span>资源</span><NvSidebarDot tone="ok" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  </SidebarContent>
  <SidebarFooter>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <NvSidebarUser name="张伟" role="团队主管 · 值班" initials="张" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarFooter>
</NvSidebar>
```

`SidebarMenuSub` 承载二级菜单（展开状态用你自己的 `ref` 驱动，并配合高度过渡动画）；二级项缩进并带导引线；`SidebarMenuBadge` 显示计数；`SidebarMenuAction` 是仅在悬停时浮现的行内操作；`SidebarGroupAction` 是分组级操作。

<Demo>
<div class="nv-sb">
  <SidebarProvider>
    <NvSidebar collapsible="none">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>区域</SidebarGroupLabel>
          <SidebarGroupAction title="新增区域"><PlusIcon /></SidebarGroupAction>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton @click="press = !press">
                <FactoryIcon /><span>Alpha 区域</span>
                <ChevronRightIcon class="nv-nv-scr-chevron ml-auto" :class="press && 'rotate-90'" />
              </SidebarMenuButton>
              <NvSidebarSub :open="press">
                <SidebarMenuSub>
                  <SidebarMenuSubItem><SidebarMenuSubButton :is-active="line === 'L01'" @click="line = 'L01'">L01 分组</SidebarMenuSubButton></SidebarMenuSubItem>
                  <SidebarMenuSubItem><SidebarMenuSubButton :is-active="line === 'L02'" @click="line = 'L02'">L02 分组</SidebarMenuSubButton></SidebarMenuSubItem>
                  <SidebarMenuSubItem><SidebarMenuSubButton :is-active="line === 'L03'" @click="line = 'L03'">L03 分组</SidebarMenuSubButton></SidebarMenuSubItem>
                </SidebarMenuSub>
              </NvSidebarSub>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton @click="weld = !weld">
                <FactoryIcon /><span>Beta 区域</span>
                <ChevronRightIcon class="nv-nv-scr-chevron ml-auto" :class="weld && 'rotate-90'" />
              </SidebarMenuButton>
              <NvSidebarSub :open="weld">
                <SidebarMenuSub>
                  <SidebarMenuSubItem><SidebarMenuSubButton :is-active="line === 'W01'" @click="line = 'W01'">W01 节点</SidebarMenuSubButton></SidebarMenuSubItem>
                  <SidebarMenuSubItem><SidebarMenuSubButton :is-active="line === 'W02'" @click="line = 'W02'">W02 节点</SidebarMenuSubButton></SidebarMenuSubItem>
                </SidebarMenuSub>
              </NvSidebarSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>待办</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton :is-active="todo === '待分配任务'" @click="todo = '待分配任务'"><BoxesIcon /><span>待分配任务</span></SidebarMenuButton>
              <SidebarMenuBadge>12</SidebarMenuBadge>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton :is-active="todo === '指标异常'" @click="todo = '指标异常'"><GaugeIcon /><span>指标异常</span></SidebarMenuButton>
              <SidebarMenuBadge>3</SidebarMenuBadge>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton :is-active="todo === '告警'" @click="todo = '告警'"><BellIcon /><span>告警</span></SidebarMenuButton>
              <SidebarMenuAction title="全部标记已读" show-on-hover><PlusIcon /></SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </NvSidebar>
    <main class="nv-nv-scr-main">
      <span class="nv-nv-scr-hint"><ActivityIcon class="size-4" />点击区域展开 / 收起，二级带高度动画</span>
    </main>
  </SidebarProvider>
</div>
</Demo>

```vue
<SidebarMenuItem>
  <SidebarMenuButton :is-active="open" @click="open = !open">
    <FactoryIcon /><span>Alpha 区域</span>
    <ChevronRightIcon class="ml-auto transition-transform" :class="open && 'rotate-90'" />
  </SidebarMenuButton>
  <!-- NvSidebarSub 内置 grid-rows 0fr→1fr 高度动画 + 缩进导引线，无需手写 CSS -->
  <NvSidebarSub :open="open">
    <SidebarMenuSub>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton :is-active="line === 'L01'" @click="line = 'L01'">L01 分组</SidebarMenuSubButton>
      </SidebarMenuSubItem>
    </SidebarMenuSub>
  </NvSidebarSub>
</SidebarMenuItem>
```

`SidebarInput` 是侧栏内的输入框样式，常置于 `SidebarHeader` 做快速过滤。

<Demo>
<div class="nv-sb nv-nv-scr-short">
  <SidebarProvider>
    <NvSidebar collapsible="none">
      <SidebarHeader>
        <div class="relative">
          <SearchIcon class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput placeholder="搜索记录 / 节点…" class="pl-8" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>最近</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton :is-active="todo === 'a'" @click="todo = 'a'"><BoxesIcon /><span>REC-2406-0413</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton :is-active="todo === 'b'" @click="todo = 'b'"><BoxesIcon /><span>REC-2406-0421</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton :is-active="todo === 'c'" @click="todo = 'c'"><WrenchIcon /><span>节点 RES-07</span></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </NvSidebar>
    <main class="nv-nv-scr-main">
      <span class="nv-nv-scr-hint"><SearchIcon class="size-4" />输入即过滤记录 / 节点</span>
    </main>
  </SidebarProvider>
</div>
</Demo>

局部组合消费 `SidebarGroupContent` 与 `SidebarMenuSkeleton`，无需整页侧栏或新增 provider。分组内容承载等待占位和本页菜单，等待期间不提供可点击导航；上方状态文字说明等待含义。

<Demo>
  <ClientOnly>
    <SidebarPartsExample />
  </ClientOnly>
</Demo>

<<< ../../.vitepress/examples/SidebarPartsExample.vue

「显示图标」可切换 `showIcon` 两态；「显示本页菜单」结束等待。选择收藏或阅读记录后，上方反馈当前菜单；再次等待再恢复时保留选择。所有操作仅改变本页内存状态，刷新重置，无网络请求。标准按钮支持 Tab 聚焦及 Enter/Space 激活。

`SidebarMenuSkeleton` 的宽度由 producer 的 `Math.random` 产生；本例通过文档消费侧 `ClientOnly` 避免服务端与客户端随机宽度不一致，不改基础组件。

原版 `Sidebar` 与上面的 `NvSidebar` 分开演示。选择「固定侧栏」走 `collapsible="none"`，在移动宽度也保持固定；选择「可折叠侧栏」在桌面走 `icon` 分支，点击切换按钮折叠/展开，在 390px 走移动 Sheet。两种模式共用当前菜单记录，不穷举全部变体。

<Demo><BaseSidebarExample /></Demo>

<<< @/.vitepress/examples/BaseSidebarExample.vue

`SidebarProvider` 的真实判断是 `useMediaQuery('(max-width: 768px)')`；`open` 控制桌面状态，`openMobile` 属于 context，不是 Provider 的根 v-model prop。主桶公开 `useSidebar`，也可由 Provider 内的宿主子组件使用；本例直接在 slot 使用公开 `SidebarTrigger` 切换移动状态，`aria-label` 经真实 fallthrough 覆盖按钮的可访问名称。

原版移动内容隐藏了内置关闭按钮，本例额外提供「关闭阅读导航」按钮和可见说明；`NvSidebar` 的中文内置关闭和 header 留白属于品牌增强，不能归给原版。原版默认 `Toggle Sidebar`、`Sidebar`、`Displays the mobile sidebar.` 历史合同不改。Esc 关闭由当前 Sheet producer 处理；本例 opener 是 context Trigger 而非 SheetTrigger，真实键盘回焦与 resize 必须独立验证，不能从 DOM 模拟推定。

## API

### NvSidebar

| 属性          | 说明     | 类型                                 | 默认          |
| ------------- | -------- | ------------------------------------ | ------------- |
| `side`        | 停靠侧   | `'left' \| 'right'`                  | `'left'`      |
| `variant`     | 形态     | `'sidebar' \| 'floating' \| 'inset'` | `'sidebar'`   |
| `collapsible` | 折叠方式 | `'offcanvas' \| 'icon' \| 'none'`    | `'offcanvas'` |

### SidebarMenuButton

| 属性        | 说明           | 类型                        | 默认        |
| ----------- | -------------- | --------------------------- | ----------- |
| `isActive`  | 激活态         | `boolean`                   | `false`     |
| `tooltip`   | 折叠时悬浮标签 | `string \| Component`       | —           |
| `size`      | 尺寸           | `'default' \| 'sm' \| 'lg'` | `'default'` |

### SidebarMenuAction

| 属性          | 说明         | 类型      | 默认    |
| ------------- | ------------ | --------- | ------- |
| `showOnHover` | 仅悬停浮现   | `boolean` | `false` |

### SidebarProvider

| 属性          | 说明     | 类型      | 默认   |
| ------------- | -------- | --------- | ------ |
| `defaultOpen` | 初始展开 | `boolean` | `true` |

> 折叠为图标条时，`SidebarMenuButton` 会自动只留图标；放在 Header / Footer 的**自定义内容**需自行加 `group-data-[collapsible=icon]:hidden` 隐藏文字，避免被压缩。

## 设计说明

- `SidebarProvider` — 提供开合状态（`useSidebar()`）、快捷键与 Cookie 持久化；外层容器。
- `NvSidebar` — 产品侧栏本体，移动抽屉以中文说明导航用途并提供「关闭」按钮；`side` 左/右、`variant` `sidebar`/`floating`/`inset`、`collapsible` `offcanvas`/`icon`/`none`。
- `SidebarHeader` / `SidebarFooter` — 顶部 / 底部固定区。
- `SidebarContent` — 可滚动主体。
- `SidebarGroup` / `SidebarGroupLabel` / `SidebarGroupContent` / `SidebarGroupAction` — 分组、分组标题与分组级操作。
- `SidebarMenu` / `SidebarMenuItem` / `SidebarMenuButton` — 列表、单项与可点按钮（`isActive`、`tooltip` 折叠时悬浮显示、`as` 可换 `a` / router-link）。
- `SidebarMenuAction` / `SidebarMenuBadge` — 行内操作（`showOnHover`）与计数徽标。
- `SidebarMenuSub` / `SidebarMenuSubItem` / `SidebarMenuSubButton` — 二级菜单（展开状态自管理）。
- `SidebarSeparator` / `SidebarInput` — 分隔线与侧栏输入框。
- `SidebarRail` / `SidebarTrigger` — 原版折叠条与折叠按钮，读屏名称是英文 `Toggle Sidebar`；产品界面改用下方的 `NvSidebarRail` / `NvSidebarTrigger`。

品牌 Pro 件（高级化封装，配合上面的原子件）：

- `NvSidebarBrand` — 工作区品牌锁头（渐变 logo + 名称 + 副标题），放 `SidebarHeader`；折叠为图标条时文字/箭头自动隐藏。属性：`name`、`sub?`、`logo?`、`caret?`。
- `NvSidebarDot` — 行尾状态点（`tone` `ok` / `warn` / `danger`），作 `SidebarMenuButton` 末位子节点。
- `NvSidebarUser` — 底栏用户行（首字头像 + 在线点 + 名称/角色），放页脚的 `SidebarMenuButton size="lg"`。属性：`name`、`role?`、`initials?`、`online?`、`caret?`。
- `NvSidebarRail` — 右缘可点的折叠条；`NvSidebarTrigger` — 折叠按钮（放任意处）。二者与原版同形，读屏名称与悬停提示为中文「展开或收起侧栏」。
- `NvSidebarSub` — 二级菜单高度动画外壳（`grid-rows 0fr→1fr` + 缩进导引线），`open` 用你自己的 `ref` 驱动，内裹 `SidebarMenuSub`。
- 统一**选中态**（中性高起填充 + 品牌色图标）已是系统默认（`theme.css` 全局），无需额外样式即对所有侧栏生效。

<!-- @include: ../../../../../DESIGN/components/sidebar.md -->

<style>
/* 有界预览框收纳整页外壳。 */
.nv-sb {
  height: 400px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--background);
}
.nv-sb.nv-nv-scr-short { height: 300px; }
.nv-sb.nv-nv-scr-tall { height: 460px; }
.nv-sb [data-slot='sidebar-wrapper'],
.nv-sb .group\/sidebar-wrapper { min-height: 0 !important; height: 100% !important; }
.nv-nv-scr-collapse { transform: translateZ(0); }
.nv-nv-scr-collapse [data-slot='nv-sidebar-container'] { height: 100% !important; }

/* ── rhythm: give first-level items the same breathing room as sub-items ── */
.nv-sb [data-slot='sidebar-menu'] { gap: 0.1875rem; }
.nv-sb [data-slot='sidebar-menu'] :is(a, button) {
  transition: background-color 0.15s ease, color 0.15s ease;
}
/* hover: clean neutral wash — white-over-dark, no hue, so it never reads muddy */
.nv-sb [data-slot='sidebar-menu'] :is(a, button):hover {
  background: color-mix(in oklch, var(--sidebar-foreground) 6%, transparent);
}

/* ── ONE unified selected state (Linear / Vercel form) ────────────────────
   Clean NEUTRAL elevated fill (white-over-dark, no hue — a tinted dark fill is
   what read as muddy/诡异 at any accent hue), near-white text, and the glyph in
   the brand accent: that single accent touch carries identity without coloring
   the surface. Matches [data-active] in any sidebar-menu so level-1, sub, and
   tooltip-wrapped rows are identical, and out-specifies the primitive gray default.
   The :hover twin keeps the active fill from reverting when hovered. */
.nv-sb [data-slot='sidebar-menu'] [data-active='true'],
.nv-sb [data-slot='sidebar-menu'] [data-active='true']:hover {
  background: color-mix(in oklch, var(--sidebar-foreground) 12%, transparent);
  color: var(--sidebar-foreground);
  font-weight: 500;
}
.nv-sb [data-slot='sidebar-menu'] [data-active='true'] svg {
  color: var(--nv-brand-strong);
}

/* Brand lockup / status dots / footer user / animated submenu now live in the
   NvSidebar* components — NvSidebarBrand / NvSidebarDot / NvSidebarUser /
   NvSidebarSub — so this demo composes them instead of re-styling locally. */

/* ── inset canvas (top bar + KPI tiles) ────────────────────────────────── */
.nv-nv-scr-inset { display: flex; min-width: 0; flex: 1; flex-direction: column; }
.nv-nv-scr-topbar {
  display: flex;
  height: 3.25rem;
  flex-shrink: 0;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border);
  padding-inline: 0.875rem;
}
.nv-nv-scr-topbar-divider { width: 1px; height: 1rem; background: var(--border); margin-inline: 0.125rem; }
.nv-nv-scr-body { flex: 1; min-height: 0; padding: 1rem; }
.nv-nv-scr-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.625rem; }
.nv-nv-scr-tile {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  background: var(--card);
  padding: 0.75rem;
}
.nv-nv-scr-tile-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.6875rem; color: var(--muted-foreground); }
.nv-nv-scr-tile-value { white-space: nowrap; font-size: 1.25rem; font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1; }
.nv-nv-scr-tile-value small { font-size: 0.75rem; font-weight: 500; color: var(--muted-foreground); }
.nv-nv-scr-tile-ok { color: oklch(0.74 0.16 152); }

.nv-nv-scr-chevron {
  width: 1rem;
  height: 1rem;
  /* Tailwind v4 `rotate-90` animates the `rotate` property (not `transform`), so
     transition `rotate` — transitioning `transform` here would never fire. */
  transition: rotate 0.2s var(--nv-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1));
}
@media (prefers-reduced-motion: reduce) {
  .nv-nv-scr-chevron, .nv-nv-scr-sub { transition: none; }
}
</style>
