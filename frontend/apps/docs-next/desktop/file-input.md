---
title: NvFileInput 文件上传
---

<script setup>
import { ref } from 'vue'
import { NvFileInput } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const files = ref([])
const lastReject = ref(null)
const images = ref([])
</script>

# NvFileInput 文件上传

拖放或点击选择文件，内置类型、大小、数量校验，并列出已选文件。

## 示例

<Demo block>
  <NvFileInput v-model:value="files" multiple :max-files="5" hint="拖放最多 5 个文件到此，或点击选择" />
  已选 {{ files.length }} 个文件
</Demo>

<Demo block>
  <NvFileInput
    v-model:value="images"
    accept="image/*,.pdf"
    multiple
    :max-size="2 * 1024 * 1024"
    hint="仅接受图片或 PDF，单个不超过 2 MB"
    @reject="lastReject = $event"
  />
  <div style="margin-top: 8px; font-size: 13px; color: var(--vp-c-text-2)">
    最近一次拒绝原因：{{ lastReject ?? '—' }}
  </div>
</Demo>

<Demo block>
  <NvFileInput :dropzone="false" :show-list="false" trigger-label="仅触发按钮" />
</Demo>

<Demo block>
  <NvFileInput disabled hint="禁用状态不接受拖放与点击" />
  <NvFileInput :multiple="false" :max-files="1" hint="单文件模式" />
</Demo>

## API

### NvFileInput 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 受控文件列表（`v-model:value`） | `File[]` | — |
| `defaultValue` | 非受控初始文件 | `File[]` | — |
| `accept` | 接受的文件：MIME、通配符与扩展名 | `string \| readonly string[]` | — |
| `multiple` | 允许一次多选 | `boolean` | — |
| `maxFiles` | 一次最多接受的文件数 | `number` | — |
| `maxSize` | 单个文件的大小上限（字节） | `number` | — |
| `minSize` | 单个文件的大小下限（字节） | `number` | — |
| `validate` | 额外校验；返回原因字符串即拒绝 | `(file) => string \| null \| undefined \| void` | — |
| `name` | 提交时的字段名 | `string` | — |
| `form` | 关联表单 id | `string` | — |
| `required` | 必填 | `boolean` | — |
| `disabled` | 禁用 | `boolean` | — |
| `triggerLabel` | 打开系统选择器按钮的文案 | `string` | `选择文件` |
| `hint` | 拖放区内上方提示行 | `string` | `将文件拖放到此处，或点击选择` |
| `dropzone` | 显示拖放区；关闭后只留触发按钮 | `boolean` | `true` |
| `showList` | 在拖放区下方列出已选文件 | `boolean` | `true` |
| `listLabel` | 文件列表的无障碍名称 | `string` | `已选文件` |
| `rejectReason` | 大小、类型或数量校验失败时生成拒绝说明 | `(reasons: string[]) => string` | — |

### NvFileInput 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 文件列表变化，参数为 `File[]` |
| `reject` | 文件未通过校验，参数为拒绝原因数组 |

### NvFileInput 插槽

无插槽；拖放区、触发按钮与文件列表由组件内置。
