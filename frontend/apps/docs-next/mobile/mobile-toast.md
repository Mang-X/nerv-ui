---
title: NvMobileToast 轻提示
---

<script setup>
import { createToaster } from '@ui-sdk/vue/toast'
import { NvMobileButton, NvMobileToast } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const toaster = createToaster({ duration: 3000 })
</script>

# NvMobileToast 轻提示

基于 toaster 队列的移动端通知区。组件只负责渲染，消息由 `Toaster` 实例推入。

## 示例

<Demo>
  <NvMobileButton variant="secondary" @click="toaster('已保存草稿')">默认</NvMobileButton>
  <NvMobileButton variant="secondary" @click="toaster.success('提交成功')">成功</NvMobileButton>
  <NvMobileButton variant="secondary" @click="toaster.error('提交失败，请重试')">失败</NvMobileButton>
  <NvMobileButton variant="secondary" @click="toaster.warning('数量不足')">警告</NvMobileButton>
  <NvMobileButton variant="secondary" @click="toaster.loading('正在上传…')">加载中</NvMobileButton>
</Demo>

<NvMobileToast :toaster="toaster" side="bottom" align="center" />

<Demo>
  <NvMobileButton variant="outline" @click="toaster.dismiss()">关闭全部提示</NvMobileButton>
</Demo>

## API

### NvMobileToast 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `toaster` | 要渲染的通知队列，由 `createToaster()` 创建 | `Toaster` | 共享队列 |
| `side` | 贴靠视口的哪一边 | `top \| bottom` | `bottom` |
| `align` | 沿该边的对齐位置 | `start \| center \| end` | `center` |
| `maxVisible` | 同时显示的最大数量 | `number` | `3` |
| `expanded` | 始终展开堆叠 | `boolean` | `false` |
| `closable` | 显示关闭按钮 | `boolean` | `true` |
| `closeLabel` | 关闭按钮的无障碍标签 | `string` | `关闭` |
| `pendingAnnouncement` | 操作按钮等待时的读屏提示 | `string` | `请稍候` |
| `ariaLabel` | 通知区的无障碍标签 | `string` | `通知` |

### 使用说明

`NvMobileToast` 本身不接收消息内容。消息通过 `Toaster` 推入：

```ts
import { createToaster } from '@ui-sdk/vue/toast'

const toaster = createToaster({ duration: 3000 })
toaster.success('提交成功')
toaster.error('提交失败，请重试')
toaster.loading('正在上传…')
```
