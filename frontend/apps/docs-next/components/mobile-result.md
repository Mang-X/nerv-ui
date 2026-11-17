---
title: NvMobileResult 结果页
---

<script setup>
import { ref } from 'vue'
import { NvMobileButton, NvMobileResult } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const acted = ref(0)
</script>

# NvMobileResult 结果页

操作完成后的整页反馈，按成功、失败、警告、信息四种状态切换图标与语义色。

## 示例

<Demo block>
  <NvMobileResult
    status="success"
    title="提交成功"
    description="记录 REC-2026-1138 已进入待审核队列。"
    action-text="查看记录"
    @action="acted++"
  />
</Demo>

<Demo block>
  <NvMobileResult status="error" title="提交失败" description="网络超时，请检查连接后重试。" />
</Demo>

<Demo block>
  <NvMobileResult status="warning" title="部分数据未同步" description="3 条记录将在网络恢复后自动补传。" />
</Demo>

<Demo block>
  <NvMobileResult status="info" title="已进入只读模式" description="当前账号仅可查看，无法编辑记录。" />
</Demo>

<Demo block>
  <NvMobileResult title="自定义操作区" description="默认插槽会替换内建操作按钮。">
    <NvMobileButton variant="secondary" @click="acted++">
      自定义按钮 · <span v-text="acted"></span>
    </NvMobileButton>
  </NvMobileResult>
</Demo>

## API

### NvMobileResult 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `status` | 结果状态 | `success \| error \| warning \| info` | `success` |
| `title` | 标题 | `string` | — |
| `description` | 补充说明 | `string` | — |
| `icon` | 替换默认状态图标 | `Component` | — |
| `actionText` | 操作按钮文案；不传则不渲染 | `string` | — |

### NvMobileResult 事件

| 事件 | 说明 |
| --- | --- |
| `action` | 点击内建操作按钮 |

### NvMobileResult 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 替换状态图标 |
| `title` | 自定义标题 |
| `description` | 自定义说明 |
| `default` | 操作区；提供时替换内建按钮 |
