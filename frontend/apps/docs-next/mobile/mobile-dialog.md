---
title: NvMobileDialog 对话框
---

<script setup>
import { ref } from 'vue'
import { NvMobileButton, NvMobileDialog } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const open = ref(false)
const confirmed = ref(0)
const canceled = ref(0)
const customOpen = ref(false)
</script>

# NvMobileDialog 对话框

移动端的模态确认层，默认锁定焦点、点遮罩或按 Esc 关闭，底部可内建确认与取消按钮。

## 示例

<Demo>
  <NvMobileDialog
    v-model:open="open"
    trigger-label="打开对话框"
    title="提交记录"
    description="提交后将锁定本条记录的数据，无法继续编辑。"
    confirm-text="提交"
    cancel-text="取消"
    @confirm="confirmed++"
    @cancel="canceled++"
  >
    <p style="margin: 0">这里是正文区，可以放表单、说明或只读摘要。</p>
  </NvMobileDialog>
  <span style="font-size: 13px">
    确认 <span v-text="confirmed"></span> 次，取消 <span v-text="canceled"></span> 次
  </span>
</Demo>

<Demo>
  <NvMobileButton variant="secondary" @click="customOpen = true">自定义页脚</NvMobileButton>
  <NvMobileDialog v-model:open="customOpen" title="选择处理方式" :show-close="false">
    <p style="margin: 0">页脚插槽会完全替换内建的确认 / 取消按钮。</p>
    <template #footer>
      <NvMobileButton variant="ghost" @click="customOpen = false">稍后处理</NvMobileButton>
      <NvMobileButton variant="primary" @click="customOpen = false">立即处理</NvMobileButton>
    </template>
  </NvMobileDialog>
</Demo>

## API

### NvMobileDialog 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | `false` |
| `title` | 标题 | `string` | — |
| `description` | 补充说明 | `string` | — |
| `ariaLabel` | 无标题时的无障碍名称 | `string` | `对话框` |
| `modal` | `true` 锁定焦点并屏蔽页面；`'trap-focus'` 只锁定焦点 | `boolean \| 'trap-focus'` | `true` |
| `dismissible` | 是否允许 Esc 与外部按下关闭 | `boolean` | `true` |
| `closeOnOutsidePress` | 是否允许点击遮罩关闭 | `boolean` | `true` |
| `showClose` | 显示右上角关闭按钮 | `boolean` | `true` |
| `closeLabel` | 关闭按钮的无障碍标签 | `string` | `关闭` |
| `confirmText` | 内建确认按钮文案；不传则不渲染 | `string` | — |
| `cancelText` | 内建取消按钮文案；不传则不渲染 | `string` | — |
| `confirmLoading` | 确认按钮加载中并禁用 | `boolean` | `false` |
| `confirmDisabled` | 禁用确认按钮 | `boolean` | `false` |
| `triggerLabel` | 内建触发按钮文案；不传则由调用方控制 `open` | `string` | — |

### NvMobileDialog 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 展开状态变化，参数为 `boolean` |
| `open-change` | 展开状态变化，参数为 `boolean` |
| `confirm` | 点击内建确认按钮 |
| `cancel` | 点击内建取消按钮 |

### NvMobileDialog 插槽

| 插槽 | 说明 |
| --- | --- |
| `trigger` | 替换内建触发按钮内容 |
| `title` | 自定义标题 |
| `description` | 自定义说明 |
| `default` | 正文内容 |
| `footer` | 替换整个页脚按钮组 |
