---
title: NvScreenScrollBoard 滚动榜
---

<script setup>
import { NvScreenScrollBoard } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const lines = [
  { no: 'A-01', name: '焊接线 A', qty: 1280 },
  { no: 'A-02', name: '装配线 B', qty: 964 },
  { no: 'A-03', name: 'CNC 线 C', qty: 742 },
  { no: 'A-04', name: '涂装线 D', qty: 615 },
  { no: 'A-05', name: '包装线 E', qty: 508 },
  { no: 'A-06', name: '质检线 F', qty: 431 },
]
</script>

# NvScreenScrollBoard 滚动榜

列表渲染两遍、滚过一半无缝回起点。悬停暂停；滚轮可自由查看；关闭动效或内部获得焦点时切为手动滚动，键盘用户不会被动画抢走目标行。

## 示例

<Demo>
  <div class="nv-screen-stage" style="height: 220px; padding: 24px">
    <NvScreenScrollBoard :items="lines" :row-key="(l) => l.no">
      <template #row="{ item }">
        <div style="display: flex; gap: 12px; padding: 8px 0">
          <span style="opacity: 0.6">{{ item.no }}</span>
          <span style="flex: 1">{{ item.name }}</span>
          <span>{{ item.qty }}</span>
        </div>
      </template>
    </NvScreenScrollBoard>
  </div>
</Demo>

## API

| 属性 / 插槽 | 说明 |
| --- | --- |
| `items` | 列表数据。 |
| `speed` | 滚动速度 px/s，默认 `28`。 |
| `pauseOnHover` | 悬停是否暂停，默认 `true`。 |
| `rowKey` | 行 key 生成函数。 |
| `row` 插槽 | 行渲染，参数 `{ item, index }`。 |
