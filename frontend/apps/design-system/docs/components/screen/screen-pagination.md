---
title: NvScreenPagination 分页
---

<script setup>
import { NvScreenPagination, NvScreenPanel } from '@nerv-iip/ui'
import { ref } from 'vue'

const page = ref(1)
const page2 = ref(6)
</script>

# NvScreenPagination 分页

大屏数据表格的分页器:总数 + 当前区间读数、上一页 / 下一页、带省略号的页码窗口(`1 … p-1 p p+1 … N`)。当前页青色填充,控件按下纯缩放、无位移。`v-model:page` 驱动当前页,`total` + `pageSize` 推算页数。

## 基础用法

<ScreenDemo wide>
  <NvScreenPanel>
    <NvScreenPagination v-model:page="page" :total="248" :page-size="10" />
  </NvScreenPanel>
</ScreenDemo>

```vue
<NvScreenPagination v-model:page="page" :total="248" :page-size="10" />
```

## 省略号窗口

页数较多时,中间区段用省略号收起,首尾页常驻。

<ScreenDemo wide>
  <NvScreenPanel>
    <NvScreenPagination v-model:page="page2" :total="1280" :page-size="20" />
  </NvScreenPanel>
</ScreenDemo>

## 属性

| 属性           | 说明     | 类型     | 默认 |
| -------------- | -------- | -------- | ---- |
| `v-model:page` | 当前页   | `number` | `1`  |
| `total`        | 总条数   | `number` | —    |
| `pageSize`     | 每页条数 | `number` | `10` |

## 受控与输入责任

`total` 为已知、有限、非负整数；`pageSize` 应为有限正整数，`page` 是宿主维护的有效页号（1 起）。空列表 `total=0` 显示「共 0 条 · 0」，保留禁用前后按钮的第 1 页。未知总数不传假 0：宿主显示「总数未知」并隐藏此分页器。

组件只在用户请求另一有效页时发出一次 `update:page`，当前页与省略号不发事件；不会切 `rows`、查库或监听 total 自动改 page。宿主在替换、筛选、清空或总数缩小时，同次更新将 page 置 1（或自行限制到有效页），再 slice 当前行；这次宿主重置不产生分页事件。不要只更新分页读数而保留旧行。

```vue
<script setup>
import { ref, computed } from 'vue'
const page = ref(1)
const rows = ref([])
const visibleRows = computed(() => rows.value.slice((page.value - 1) * 10, page.value * 10))
function replaceRows(next) {
  rows.value = next
  page.value = 1
}
</script>
```

兼容安全回退：`pageSize=0`、负值、NaN、Infinity 使用旧默认 10，避免 Infinity 页码/无效区间。此回退不改变宿主的数据切片；宿主仍须使用同一有效尺寸。小数 pageSize/page、非有限/负 total 不在推荐输入合同内，不新增抛错或业务校验规则。

按钮保留原生 Tab、Enter、Space 与 focus-visible；非循环分页，首末页禁用边界。真实数据分页与清空/恢复见 playground `/#screen/tables`。
