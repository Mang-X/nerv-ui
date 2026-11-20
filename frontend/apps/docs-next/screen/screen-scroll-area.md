---
title: NvScreenScrollArea 自动滚动区
---

<script setup>
import { NvScreenScrollArea } from '@nerv-ui-next/screen'
import '@nerv-ui-next/screen/styles.css'

const rows = [
  { id: 'REC-1138', line: '第一分组', state: '处理中' },
  { id: 'REC-1139', line: '第二分组', state: '待校验' },
  { id: 'REC-1140', line: '第三分组', state: '已完成' },
  { id: 'REC-1141', line: '第四分组', state: '排队中' },
  { id: 'REC-1142', line: '第五分组', state: '归档中' },
]
</script>

# NvScreenScrollArea 自动滚动区

无缝循环滚动的列表容器，悬停暂停、聚焦转为手动滚动，尊重系统减少动效设置。

## 示例

<Demo>
  <div class="nv-screen-stage">
    <div style="height: 200px">
      <NvScreenScrollArea :items="rows" :speed="24" :row-key="(item) => item.id" aria-label="记录滚动">
        <template #row="{ item }">
          <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid oklch(1 0 0 / 0.12); font-size: 14px">
            <span v-text="item.id"></span>
            <span v-text="item.line" style="opacity: 0.7"></span>
            <span v-text="item.state"></span>
          </div>
        </template>
      </NvScreenScrollArea>
    </div>
  </div>
</Demo>

<Demo>
  <div class="nv-screen-stage">
    <div style="height: 160px">
      <NvScreenScrollArea :items="rows.slice(0, 2)" :speed="0" aria-label="静态列表">
        <template #row="{ item }">
          <div style="padding: 10px 12px; border-bottom: 1px solid oklch(1 0 0 / 0.12); font-size: 14px" v-text="item.id"></div>
        </template>
      </NvScreenScrollArea>
    </div>
  </div>
</Demo>

## API

### NvScreenScrollArea 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `items` | 行数据，必填 | `T[]` | — |
| `speed` | 每秒滚动像素；`0` 保持静止 | `number` | `28` |
| `pauseOnHover` | 悬停时暂停滚动 | `boolean` | `true` |
| `rowKey` | 生成稳定行标识的函数 | `(item, index) => string \| number` | — |
| `ariaLabel` | 滚动区域的无障碍名称 | `string` | `滚动区` |
| `emptyLabel` | 无数据文案 | `string` | `暂无内容` |

### NvScreenScrollArea 事件

| 事件 | 说明 |
| --- | --- |
| `visible` | 测量完成时回传当前可见的行下标数组 |

### NvScreenScrollArea 暴露方法

| 方法 | 说明 |
| --- | --- |
| `measure()` | 重新测量内容高度并刷新循环 |

### NvScreenScrollArea 插槽

| 插槽 | 说明 |
| --- | --- |
| `row` | 单行内容，作用域参数为 `{ item, index }` |
