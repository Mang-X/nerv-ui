---
title: NvCheckbox 复选框
---

<script setup>
import { NvCheckbox } from '@nerv-ui/ui'
import { ref } from 'vue'

const agreed = ref(true)
const lockItems = ref(false)
const genOrder = ref(true)
</script>

# NvCheckbox 复选框

在一组选项中多选，或表示单个开关式确认。`NvCheckbox` 复用品牌选中色与聚焦环。

## 示例

<Demo>
  <label style="display:flex;align-items:center;gap:10px;font-size:14px">
    <NvCheckbox v-model="agreed" />
    提交后立即锁定条目并生成清单
  </label>
</Demo>

```vue
<label style="display:flex;align-items:center;gap:10px">
  <NvCheckbox v-model="agreed" />
  提交后立即锁定条目并生成清单
</label>
```

<Demo>
  <div style="display:flex;flex-direction:column;gap:10px;font-size:14px">
    <label style="display:flex;align-items:center;gap:10px">
      <NvCheckbox v-model="lockItems" /> 锁定条目
    </label>
    <label style="display:flex;align-items:center;gap:10px">
      <NvCheckbox v-model="genOrder" /> 生成清单
    </label>
    <label style="display:flex;align-items:center;gap:10px;opacity:.6">
      <NvCheckbox :disabled="true" /> 自动提交（暂不可用）
    </label>
  </div>
</Demo>

```vue
<label><NvCheckbox v-model="lockItems" /> 锁定条目</label>
<label><NvCheckbox v-model="genOrder" /> 生成清单</label>
<label><NvCheckbox disabled /> 自动提交（暂不可用）</label>
```

## API

| 属性       | 说明     | 类型      | 默认    |
| ---------- | -------- | --------- | ------- |
| `v-model`  | 是否选中 | `boolean` | `false` |
| `disabled` | 是否禁用 | `boolean` | `false` |
