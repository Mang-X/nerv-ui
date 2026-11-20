---
title: NvMobilePicker 选择器
---

<script setup>
import { ref } from 'vue'
import { NvMobilePicker } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const city = ref(['hz', 'binjiang'])
const size = ref(['m'])
const shown = ref('hz / binjiang')

const cityColumns = [
  {
    ariaLabel: '城市',
    options: [
      { label: '杭州', value: 'hz' },
      { label: '宁波', value: 'nb' },
      { label: '苏州', value: 'sz' },
    ],
  },
  {
    ariaLabel: '区域',
    options: [
      { label: '滨江', value: 'binjiang' },
      { label: '余杭', value: 'yuhang' },
      { label: '北仑', value: 'beilun' },
    ],
  },
]

function onChange(value) {
  shown.value = value.join(' / ')
}
</script>

# NvMobilePicker 选择器

底部滚轮式多列选择器，适合城市、团队、规格等有限枚举值的选择。

## 示例

<Demo>
  <NvMobilePicker
    v-model="city"
    trigger-label="选择城市与区域"
    title="选择地区"
    :columns="cityColumns"
    @change="onChange"
  />
  <span style="font-size: 13px">当前选择：<span v-text="shown"></span></span>
</Demo>

<Demo>
  <NvMobilePicker
    v-model="size"
    title="选择规格"
    :columns="[
      {
        ariaLabel: '规格',
        options: [
          { label: 'S', value: 's' },
          { label: 'M', value: 'm' },
          { label: 'L', value: 'l' },
          { label: 'XL', value: 'xl', disabled: true },
        ],
      },
    ]"
  />
  <span style="font-size: 13px">规格：<span v-text="size[0]"></span></span>
</Demo>

## API

### NvMobilePicker 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `open` | 受控展开状态（`v-model:open`） | `boolean` | — |
| `defaultOpen` | 非受控初始展开状态 | `boolean` | `false` |
| `title` | 标题 | `string` | — |
| `description` | 补充说明 | `string` | — |
| `columns` | 列定义 | `MobilePickerColumn[]` | `[]` |
| `modelValue` | 每列一个值（`v-model`） | `MobilePickerValue[] \| null` | — |
| `defaultValue` | 非受控初始值 | `MobilePickerValue[]` | — |
| `confirmText` | 确认按钮文案 | `string` | `确定` |
| `cancelText` | 取消按钮文案 | `string` | `取消` |
| `showCancel` | 显示取消按钮 | `boolean` | `true` |
| `ariaLabel` | 无标题时的无障碍名称 | `string` | `选择器` |
| `modal` | `true` 锁定焦点并屏蔽页面；`'trap-focus'` 只锁定焦点 | `boolean \| 'trap-focus'` | `true` |
| `dismissible` | 是否允许 Esc 与外部按下关闭 | `boolean` | `true` |
| `closeOnOutsidePress` | 是否允许点击遮罩关闭 | `boolean` | `true` |
| `triggerLabel` | 内建触发按钮文案；不传则由调用方控制 `open` | `string` | — |

### MobilePickerColumn

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `key` | 列的稳定标识 | `string` |
| `ariaLabel` | 列的无障碍名称 | `string` |
| `options` | 该列的可选项 | `MobilePickerOption[]` |
| `defaultValue` | 该列无模型值时的默认值 | `MobilePickerValue` |

### MobilePickerOption

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| `label` | 显示文案 | `string` |
| `value` | 选项值 | `string \| number` |
| `disabled` | 禁用该项 | `boolean` |

### NvMobilePicker 事件

| 事件 | 说明 |
| --- | --- |
| `update:open` | 展开状态变化，参数为 `boolean` |
| `open-change` | 展开状态变化，参数为 `boolean` |
| `update:modelValue` | 确认时回传每列的值数组 |
| `change` | 确认时回传每列的值数组 |
| `confirm` | 确认时回传每列的值数组 |
| `cancel` | 点击取消按钮 |

### NvMobilePicker 插槽

| 插槽 | 说明 |
| --- | --- |
| `trigger` | 替换内建触发按钮内容 |
| `title` | 自定义标题 |
| `description` | 自定义说明 |
| `default` | 滚轮区下方的自定义内容 |
| `cancel` | 自定义取消按钮内容 |
| `confirm` | 自定义确认按钮内容 |
