---
layout: page
title: NvMobileRadioGroup 单选框
---

<script setup>
import { NvMobileRadioGroup, NvMobileRadioItem } from '@nerv-ui/ui-mobile'
import { ref } from 'vue'

const inspect = ref('std')
const priority = ref('normal')
</script>

<MobileDoc>

<template #phone>

  <section>
    <p class="nv-mdoc-label">基础用法</p>
    <NvMobileRadioGroup v-model="inspect">
      <NvMobileRadioItem value="std">标准全检</NvMobileRadioItem>
      <NvMobileRadioItem value="sample">抽样检验</NvMobileRadioItem>
      <NvMobileRadioItem value="exempt">免检放行</NvMobileRadioItem>
    </NvMobileRadioGroup>
  </section>
  <section>
    <p class="nv-mdoc-label">含禁用项</p>
    <NvMobileRadioGroup v-model="priority">
      <NvMobileRadioItem value="low">低优先级</NvMobileRadioItem>
      <NvMobileRadioItem value="normal">普通</NvMobileRadioItem>
      <NvMobileRadioItem value="high">高优先级</NvMobileRadioItem>
      <NvMobileRadioItem value="urgent" disabled>加急（需主管授权）</NvMobileRadioItem>
    </NvMobileRadioGroup>
  </section>
</template>

# NvMobileRadioGroup 单选框

在一组互斥选项中单选，呈 iOS 设置项样式：标签居左，选中项右侧显示品牌勾选。`NvMobileRadioGroup` 承载选中值，`NvMobileRadioItem` 为每个选项。

## 示例

`NvMobileRadioGroup` 的 `v-model` 绑定当前选中项的 `value`。

```vue
<NvMobileRadioGroup v-model="inspect">
  <NvMobileRadioItem value="std">标准全检</NvMobileRadioItem>
  <NvMobileRadioItem value="sample">抽样检验</NvMobileRadioItem>
  <NvMobileRadioItem value="exempt">免检放行</NvMobileRadioItem>
</NvMobileRadioGroup>
```

单个 `NvMobileRadioItem` 传 `disabled` 即可禁止选择。

```vue
<NvMobileRadioGroup v-model="priority">
  <NvMobileRadioItem value="normal">普通</NvMobileRadioItem>
  <NvMobileRadioItem value="high">高优先级</NvMobileRadioItem>
  <NvMobileRadioItem value="urgent" disabled>加急（需主管授权）</NvMobileRadioItem>
</NvMobileRadioGroup>
```

## API

### NvMobileRadioGroup / NvMobileRadioItem 属性

| 属性       | 说明                                | 类型      | 默认    |
| ---------- | ----------------------------------- | --------- | ------- |
| `v-model`  | 绑定选中值（`NvMobileRadioGroup`）  | `string`  | —       |
| `value`    | 选项值（`NvMobileRadioItem`）       | `string`  | —       |
| `disabled` | 是否禁用该项（`NvMobileRadioItem`） | `boolean` | `false` |

### 插槽

| 插槽                             | 说明         |
| -------------------------------- | ------------ |
| `default`（`NvMobileRadioItem`） | 选项标签内容 |

## 设计说明

方向键沿当前可用选项移动焦点并请求选择；快速松键和选项重排仍使用当前身份。Tab 和程序化聚焦本身不请求选择。宿主更新选中值或把焦点移走时，尚未完成的旧键盘补偿会失效。

当前 workspace 的快速松键兼容依赖固定 Reka 2.10.1 的[局部补丁](../../../../../patches/README.md)。独立安装产物携带补丁的验证由 #11 单列，尚未验收；2026-10-28 已通过真实 Chromium CDP 快速 keydown/keyup、受控更新与转焦取消复验；这是浏览器事件验证，不是物理键盘认证。物理键盘与 CI 仍未验收。

</MobileDoc>
