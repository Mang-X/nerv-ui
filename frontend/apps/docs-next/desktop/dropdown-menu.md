---
title: NvDropdownMenu 下拉菜单
---

<script setup>
import { ref } from 'vue'
import {
  NvDropdownMenu,
  NvDropdownMenuTrigger,
  NvDropdownMenuContent,
  NvDropdownMenuItem,
  NvDropdownMenuCheckboxItem,
  NvDropdownMenuRadioGroup,
  NvDropdownMenuRadioItem,
  NvDropdownMenuGroup,
  NvDropdownMenuLabel,
  NvDropdownMenuSeparator,
  NvDropdownMenuSub,
  NvDropdownMenuSubTrigger,
  NvDropdownMenuSubContent,
  NvButton,
} from '@nerv-ui-next/desktop'
import '@nerv-ui-next/desktop/styles.css'

const showGrid = ref([true])
const density = ref('comfortable')
const lastAction = ref('—')
</script>

# NvDropdownMenu 下拉菜单

从按钮或右键展开的动作列表。打开/关闭、键盘导航、子菜单悬停延时与关闭后的焦点归还全部由 `@ui-sdk/vue/menu` 原语承担——这里只负责外观。

## 示例

### 基础菜单

<Demo>
  <NvDropdownMenu>
    <NvDropdownMenuTrigger>
      <NvButton variant="outline">操作</NvButton>
    </NvDropdownMenuTrigger>
    <NvDropdownMenuContent>
      <NvDropdownMenuLabel>记录</NvDropdownMenuLabel>
      <NvDropdownMenuItem shortcut="⌘E" @select="lastAction = '编辑'">编辑</NvDropdownMenuItem>
      <NvDropdownMenuItem shortcut="⌘D" @select="lastAction = '复制'">复制</NvDropdownMenuItem>
      <NvDropdownMenuSeparator />
      <NvDropdownMenuItem destructive shortcut="⌫" @select="lastAction = '删除'">删除</NvDropdownMenuItem>
    </NvDropdownMenuContent>
  </NvDropdownMenu>
</Demo>

最后动作：{{ lastAction }}

### 子菜单

用 `NvDropdownMenuSub` 嵌套第二层。方向键右进左出，指针悬停有原语给的延时。

<Demo>
  <NvDropdownMenu>
    <NvDropdownMenuTrigger>
      <NvButton variant="outline">导出为</NvButton>
    </NvDropdownMenuTrigger>
    <NvDropdownMenuContent>
      <NvDropdownMenuSub>
        <NvDropdownMenuSubTrigger>表格</NvDropdownMenuSubTrigger>
        <NvDropdownMenuSubContent>
          <NvDropdownMenuItem>CSV</NvDropdownMenuItem>
          <NvDropdownMenuItem>XLSX</NvDropdownMenuItem>
        </NvDropdownMenuSubContent>
      </NvDropdownMenuSub>
      <NvDropdownMenuSub>
        <NvDropdownMenuSubTrigger>文档</NvDropdownMenuSubTrigger>
        <NvDropdownMenuSubContent>
          <NvDropdownMenuItem>PDF</NvDropdownMenuItem>
          <NvDropdownMenuItem>DOCX</NvDropdownMenuItem>
        </NvDropdownMenuSubContent>
      </NvDropdownMenuSub>
    </NvDropdownMenuContent>
  </NvDropdownMenu>
</Demo>

### 可勾选项

<Demo>
  <NvDropdownMenu>
    <NvDropdownMenuTrigger>
      <NvButton variant="outline">视图</NvButton>
    </NvDropdownMenuTrigger>
    <NvDropdownMenuContent>
      <NvDropdownMenuGroup>
        <NvDropdownMenuCheckboxItem value="grid" v-model:checked="showGrid[0]">
          显示网格
        </NvDropdownMenuCheckboxItem>
      </NvDropdownMenuGroup>
    </NvDropdownMenuContent>
  </NvDropdownMenu>
</Demo>

网格：{{ showGrid[0] ? '开' : '关' }}

### 单选组

<Demo>
  <NvDropdownMenu>
    <NvDropdownMenuTrigger>
      <NvButton variant="outline">密度</NvButton>
    </NvDropdownMenuTrigger>
    <NvDropdownMenuContent>
      <NvDropdownMenuRadioGroup v-model:value="density">
        <NvDropdownMenuRadioItem value="compact">紧凑</NvDropdownMenuRadioItem>
        <NvDropdownMenuRadioItem value="comfortable">舒适</NvDropdownMenuRadioItem>
        <NvDropdownMenuRadioItem value="spacious">宽松</NvDropdownMenuRadioItem>
      </NvDropdownMenuRadioGroup>
    </NvDropdownMenuContent>
  </NvDropdownMenu>
</Demo>

当前密度：{{ density }}

## API

| 部件 | 说明 |
| --- | --- |
| `NvDropdownMenu` | 根。接 `v-model:open` 时受控，不给就自管理。 |
| `NvDropdownMenuTrigger` | 触发器。不自带外观，把按钮放进来即可。 |
| `NvDropdownMenuContent` | 弹层。`side` / `align` / `sideOffset` / `minWidth`。 |
| `NvDropdownMenuItem` | 选项。`shortcut` 只作展示，不绑定按键；`destructive` 用警示色。 |
| `NvDropdownMenuCheckboxItem` | 可勾选项，`value` 必填，`v-model:checked` 受控。 |
| `NvDropdownMenuRadioGroup` / `NvDropdownMenuRadioItem` | 单选组与单选选项。 |
| `NvDropdownMenuGroup` / `NvDropdownMenuLabel` | 分组与分组标题。 |
| `NvDropdownMenuSeparator` | 分隔线。 |
| `NvDropdownMenuSub` / `SubTrigger` / `SubContent` | 二级菜单。 |

## 键盘与读屏

| 行为 | 承担方 |
| --- | --- |
| <kbd>↑</kbd> <kbd>↓</kbd> 在条目间移动 | 原语（roving highlight） |
| <kbd>→</kbd> 进入子菜单，<kbd>←</kbd> 返回 | 原语 |
| <kbd>Enter</kbd> / <kbd>Space</kbd> 选中 | 原语 |
| <kbd>Esc</kbd> 关闭并把焦点还给触发器 | 原语 |
| 指针离开子菜单的延时关闭 | 原语（`delay`） |

条目高亮来自原语写的 `data-highlighted`，所以键盘导航与鼠标悬停共用同一份状态——自己监听 `mouseenter` 只会在键盘操作时漏掉高亮。
