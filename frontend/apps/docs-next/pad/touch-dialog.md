---
title: NvTouchDialog 触屏对话框
---

<script setup>
import { ref } from 'vue'
import { NvTouchButton, NvTouchDialog } from '@nerv-ui-next/pad'
import '@nerv-ui-next/pad/styles.css'

const open = ref(false)
const lockedOpen = ref(false)
const compactOpen = ref(false)
</script>

# NvTouchDialog 触屏对话框

平板端的模态面板，默认锁定焦点并允许 Esc 与外部按下关闭，内容区可滚动。

## 示例

<Demo>
  <NvTouchButton variant="primary" @click="open = true">打开对话框</NvTouchButton>
  <NvTouchDialog
    v-model:open="open"
    title="编辑记录"
    description="调整记录所属分组与备注。"
    size="lg"
  >
    <p style="margin: 0">
      面板打开后会锁定焦点；按 Esc、点击外部或使用右上角关闭按钮都能退出。
    </p>
    <template #footer>
      <NvTouchButton variant="secondary" @click="open = false">取消</NvTouchButton>
      <NvTouchButton variant="primary" @click="open = false">保存</NvTouchButton>
    </template>
  </NvTouchDialog>
</Demo>

<Demo>
  <NvTouchButton variant="secondary" @click="lockedOpen = true">打开不可关闭对话框</NvTouchButton>
  <NvTouchDialog
    v-model:open="lockedOpen"
    title="需要确认"
    description="遮罩与 Esc 都不会关闭，必须使用底部按钮。"
    :dismissible="false"
    :close-on-outside-press="false"
    :closable="false"
  >
    <p style="margin: 0">用于必须完成确认或取消的流程。</p>
    <template #footer>
      <NvTouchButton variant="primary" @click="lockedOpen = false">我知道了</NvTouchButton>
    </template>
  </NvTouchDialog>
</Demo>

<Demo>
  <NvTouchDialog
    v-model:open="compactOpen"
    title="窄屏面板"
    description="使用 trigger 插槽时，触发器会渲染为按钮。"
    size="md"
  >
    <template #trigger>打开中号面板</template>
    内容区域较窄，适合单列表单与简短确认。
  </NvTouchDialog>
</Demo>

## API

### NvTouchDialog 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控时的初始展开状态 | `boolean` | `false` |
| `modal` | `true` 锁定焦点并使页面不可交互；`trap-focus` 只锁定焦点 | `boolean \| 'trap-focus'` | `true` |
| `dismissible` | 是否允许 Esc 与外部按下关闭 | `boolean` | `true` |
| `closeOnOutsidePress` | 是否允许点击外部关闭 | `boolean` | `true` |
| `keepMounted` | 关闭时保留内容节点，便于自定义退场动画 | `boolean` | `false` |
| `title` | 命名对话框的标题 | `string` | — |
| `description` | 标题下方的补充说明 | `string` | — |
| `closable` | 显示内建的头部关闭按钮 | `boolean` | `true` |
| `closeLabel` | 关闭按钮的无障碍名称 | `string` | `关闭` |
| `size` | 面板最大宽度：`md` 为 480px，`lg` 为 640px | `md \| lg` | `lg` |

### 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 展开状态变化，参数为 `boolean` |
| `openChange` | 展开状态变化，参数为 `boolean` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `trigger` | 内建触发器内容，渲染为按钮 |
| `title` | 自定义标题 |
| `description` | 自定义补充说明 |
| `default` | 面板正文 |
| `footer` | 面板底部操作区 |
