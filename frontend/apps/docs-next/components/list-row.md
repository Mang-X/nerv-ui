---
title: NvListRow 列表行
---

<script setup>
import { ref } from 'vue'
import { NvListRow } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'

const selected = ref('')
</script>

# NvListRow 列表行

用于任务、消息等可滚动列表中的信息行，比单元格更强调标题与辅助信息的层级。

## 示例

<Demo>
  <div style="width: 100%">
    <NvListRow
      title="新增任务 2026-11-18-01"
      description="文件项 A-1001 · 数量 240"
      meta="10:12"
      clickable
      @click="selected = '新增任务'"
    />
    <NvListRow
      title="审核异常待处理"
      description="终端 ST-04 上报格式异常"
      meta="3 条"
      clickable
      @click="selected = '审核异常'"
    />
    <NvListRow
      title="已归档记录"
      description="不可操作的历史记录"
      disabled
    />
    <NvListRow title="无分隔线的行" :divider="false" description="divider=false 时隐藏底部分隔线" />
  </div>
</Demo>

<Demo>
  <div style="width: 100%">
    <NvListRow clickable title="带前导与尾部插槽" description="整行可点击">
      <template #leading>
        <span
          style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: #e8efff; color: #2b5bd7; font-weight: 600"
        >JD</span>
      </template>
      <template #trailing>
        <span style="font-size: 12px; color: #2b5bd7">查看</span>
      </template>
    </NvListRow>
    <NvListRow title="两行正文" description="描述文本会换行显示">
      正文插槽内容
    </NvListRow>
  </div>
</Demo>

点击结果：{{ selected || '—' }}

## API

### NvListRow 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `title` | 主标题 | `string` | — |
| `description` | 副标题 | `string` | — |
| `meta` | 标题行右侧的次要信息 | `string` | — |
| `to` | 链接地址，有值时整行渲染为 `a` | `string` | — |
| `clickable` | 可点击，渲染为 `button` | `boolean` | `false` |
| `disabled` | 禁用 | `boolean` | `false` |
| `divider` | 显示底部分隔线 | `boolean` | `true` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `leading` | 行首内容，如头像或图标 |
| `title` | 主标题 |
| `meta` | 标题行右侧信息 |
| `description` | 副标题 |
| `default` | 标题与描述之后的正文 |
| `trailing` | 行尾内容 |
