---
title: NvScreenStatusWall 状态墙
---

<script setup>
import { ref } from 'vue'
import { NvScreenStatusWall } from '@nerv-ui/screen'
import '@nerv-ui/screen/styles.css'

const picked = ref('尚未选择')

const items = [
  { key: 'a1', label: '总装 A 线', identity: 'L-A01', status: { label: '运行', tone: 'success' }, summary: '达成 95%', group: { key: 'assembly', label: '总装区' } },
  { key: 'a2', label: '总装 B 线', identity: 'L-A02', status: { label: '低效', tone: 'warning' }, summary: '达成 86%', group: { key: 'assembly', label: '总装区' } },
  { key: 'a3', label: '焊装线', identity: 'L-W01', status: { label: '停机', tone: 'danger' }, summary: '停机 18 min', group: { key: 'body', label: '焊装区' } },
  { key: 'a4', label: '涂装线', identity: 'L-P01', status: { label: '运行', tone: 'success' }, summary: '达成 98%', group: { key: 'paint', label: '涂装区' } },
  { key: 'a5', label: '立体库', identity: 'L-WH1', status: { label: '待料', tone: 'default' }, summary: '队列 18', group: { key: 'warehouse', label: '物流区' } },
  { key: 'a6', label: '空压站', identity: 'L-UT1', status: { label: '离线', tone: 'default' }, disabled: true, group: { key: 'utility', label: '动力区' } },
]

function onSelect(item) {
  picked.value = item.identity ?? item.key
}
</script>

# NvScreenStatusWall 状态墙

成组展示大量对象当前状态的方格墙，格子可点击回选，支持平铺与分组两种模式。

## 示例

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenStatusWall
      :items="items"
      label="线体状态墙"
      :columns="3"
      @select="onSelect"
    />
    <span style="font-size: 13px; opacity: 0.7">选中：<span v-text="picked"></span></span>
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage" style="display: flex; flex-direction: column; gap: 16px">
    <NvScreenStatusWall :items="items" label="分组状态墙" mode="grouped" :columns="2" empty-label="暂无状态记录" />
    <NvScreenStatusWall :items="[]" label="空状态墙" />
  </div>
</Demo>

## API

### NvScreenStatusWall 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 墙格数据，必填 | `StatusWallItem[]` | — |
| `label` | 区域的无障碍名称，必填 | `string` | — |
| `mode` | 平铺或按 `group` 分组 | `grid \| grouped` | `grid` |
| `columns` | `grid` 模式每行列数 | `number` | `6` |
| `emptyLabel` | 无数据文案 | `string` | `暂无记录` |

### StatusWallItem

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 稳定标识，与文案和顺序无关 | `string` |
| `label` | 主文案 | `string` |
| `identity` | 次级标识，用于区分重名对象 | `string` |
| `status` | 状态 `{ label, tone }` | `{ label: string; tone: StatusWallTone }` |
| `summary` | 摘要行 | `string \| null` |
| `group` | 分组信息 `{ key, label }` | `{ key: string; label: string }` |
| `disabled` | 禁用该格 | `boolean` |

### NvScreenStatusWall 事件

| 事件 | 说明 |
| --- | --- |
| `select` | 点击可用的格，参数为完整的 `StatusWallItem` |
