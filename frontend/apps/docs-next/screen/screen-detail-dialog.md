---
title: NvScreenDetailDialog 详情弹层
---

<script setup>
import { ref } from 'vue'
import { NvScreenDetailDialog } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const open = ref(false)
</script>

# NvScreenDetailDialog 详情弹层

打开/关闭、焦点锁定、Esc 与关闭后的焦点归还都由 `@ui-sdk/vue/dialog` 承担。标题与描述用 `DialogTitle` / `DialogDescription`，原语据此挂 `aria-labelledby` / `aria-describedby`。

## 示例

<Demo>
  <div class="nv-screen-stage" style="padding: 40px">
    <button @click="open = true">查看详情</button>
    <NvScreenDetailDialog
      :open="open"
      title="工单 #4417"
      description="焊接线 A · 14:05 开始"
      state="data"
      @update:open="open = $event"
    >
      <p>正文内容由调用方决定，弹层只负责容器与状态。</p>
    </NvScreenDetailDialog>
  </div>
</Demo>

## API

| 属性 / 插槽 | 说明 |
| --- | --- |
| `open` | 受控打开态（`v-model:open`）。 |
| `title` | 弹层标题，同时作为 `aria-labelledby` 的来源。 |
| `description` | 描述，同时作为 `aria-describedby` 的来源。 |
| `state` | `data` / `pending` / `error` / `empty`。只有 `data` 渲染正文。 |
| `statusText` | 覆盖非 `data` 状态的说明文案。 |
| `trigger` 插槽 | 触发器。 |
| 默认插槽 | `state="data"` 时的正文。 |
| `footer` 插槽 | 底部操作区。 |
