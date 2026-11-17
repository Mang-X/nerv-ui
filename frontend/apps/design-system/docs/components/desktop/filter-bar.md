---
title: FilterBar 受控筛选
---

<script setup>
import FilterBarExample from '../../.vitepress/examples/FilterBarExample.vue'
</script>

# FilterBar 受控筛选

按类别、活动日期、日期范围和名称查找活动。结果只来自本页内存，数量单位为场，不发起真实查询或保存。范围边界包含当日；只选起点或终点时仅限制该侧。

## 示例

<Demo>
  <FilterBarExample />
</Demo>

<<< @/.vitepress/examples/FilterBarExample.vue

宿主接纳两个受控更新，以当前值计算结果。组件生成 chips；移除只清对应字段，保留关键词和其它字段。关键词没有 chip。空范围不显示 chip，部分范围以 `…` 显示缺失端点；组件不验证起止顺序。重置同时清空字段与关键词，发出 reset 和 change。外部替换、清空与重排由宿主执行，不伪造组件 change/reset；页面分别显示这些操作反馈和真实事件计数。

## API

从 `@nerv-iip/ui` 导入 `NvFilterBar`、`FilterField` 和 `FilterFieldOption`。

| 属性              | 类型                    | 默认值     |
| ----------------- | ----------------------- | ---------- |
| fields            | FilterField[]           | []         |
| modelValue        | Record<string, any>     | {}         |
| keyword           | string                  | ''         |
| searchPlaceholder | string                  | 搜索关键字 |
| class             | HTMLAttributes['class'] | —          |

`FilterField` 有稳定 `key`、`label`、`type: 'select' \| 'date' \| 'daterange'`，可选 `placeholder`、`options`。select 的 options 为 `{ label: string; value: string }[]`。单日期值为 `YYYY-MM-DD`；范围为 `{ from?: string; to?: string }`，不是数组。字段身份由 key 决定，重排不改变当前值。

### 事件

| 事件              | 载荷与时机                                                    |
| ----------------- | ------------------------------------------------------------- |
| update:modelValue | 字段更新后的完整对象；移除普通字段为 undefined，移除范围为 {} |
| update:keyword    | 更新后的字符串                                                |
| change            | `{ values, keyword }`；字段、关键词、chip 移除和重置时触发    |
| reset             | 无载荷；重置时在两个 update 之后、change 之前触发             |

未提供插槽。日期入口复用公开 NvDatePicker，选择后关闭弹层。
