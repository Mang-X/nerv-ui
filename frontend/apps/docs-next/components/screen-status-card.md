---
title: NvScreenStatusCard 状态卡片
---

<script setup>
import { NvScreenStatusCard } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const metrics = [
  { label: '节奏', value: '58', unit: 's' },
  { label: '在制品', value: '24', unit: '件', tone: 'accent' },
  { label: '停机', value: '6', unit: 'min', tone: 'warning' },
]
</script>

# NvScreenStatusCard 状态卡片

大屏上的资源 / 线体状态卡，用大号状态词承载当前状态，并附指标与进度条。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">
    <NvScreenStatusCard
      title="总装 A 线"
      subtitle="站点 12 · 晨班"
      state="运行中"
      value="95.3"
      unit="%"
      hint="达成率 · 较昨日 +1.2%"
      tone="success"
      :metrics="metrics"
      :progress="82"
      progress-label="班次进度"
      footer-label="班长"
      footer-value="陈明"
    />
    <NvScreenStatusCard
      title="焊装线"
      state="待机"
      hint="等待上游来料"
      tone="warning"
      :metrics="[{ label: '在制品', value: '3', unit: '件' }]"
      :progress="12"
    />
    <NvScreenStatusCard
      title="涂装线"
      state="报警"
      hint="烘干炉温度偏低"
      tone="danger"
      :metrics="[{ label: '报警数', value: '2', tone: 'danger' }]"
      :progress="64"
      footer-label="处理人"
      footer-value="李静"
    />
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">
    <NvScreenStatusCard title="立体库" state="正常" tone="default" footer-label="库存周转" footer-value="4.2 次/日" />
    <NvScreenStatusCard title="空压站" state="离线" tone="default">
      <template #actions><span style="font-size: 12px; opacity: 0.7">最后心跳 10:01</span></template>
    </NvScreenStatusCard>
  </div>
</Demo>

## API

### NvScreenStatusCard 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `title` | 卡片标题，必填 | `string` | — |
| `subtitle` | 副标题 | `string` | — |
| `state` | 大号状态词，必填 | `string` | — |
| `stateLabel` | 状态词上方的小标题 | `string` | `当前状态` |
| `value` | 状态词旁的数值 | `string \| number` | — |
| `unit` | 数值单位 | `string` | — |
| `hint` | 状态下方的补充说明 | `string` | — |
| `tone` | 语义色 | `default \| accent \| success \| warning \| danger` | `default` |
| `metrics` | 指标列表 | `StatusCardMetric[]` | `[]` |
| `progress` | 0–100 进度；非有限值不渲染 | `number \| null` | `null` |
| `progressLabel` | 进度条标题 | `string` | `进度` |
| `footerLabel` | 页脚标签 | `string` | — |
| `footerValue` | 页脚值 | `string \| number` | — |
| `label` | 卡片区域的无障碍名称 | `string` | `状态卡` |

### StatusCardMetric

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 稳定标识 | `string \| number` |
| `label` | 指标名 | `string` |
| `value` | 指标值 | `string \| number` |
| `unit` | 指标单位 | `string` |
| `tone` | 指标语义色 | `'default' \| 'accent' \| 'success' \| 'warning' \| 'danger'` |

### NvScreenStatusCard 插槽

| 插槽 | 说明 |
| --- | --- |
| `actions` | 标题行右侧操作区 |
| `badge` | 标题与状态之间的标记区 |
| `default` | 指标与进度之间追加的内容 |
| `footer` | 替换整个页脚 |
