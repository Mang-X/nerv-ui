---
title: NvCell 单元格
---

<script setup>
import { ref } from 'vue'
import { NvCell, NvCellGroup } from '@nerv-ui-next/mobile'
import '@nerv-ui-next/mobile/styles.css'

const tapped = ref('—')
</script>

# NvCell 单元格

移动端设置页与详情页的基础信息行，配合 `NvCellGroup` 分组展示。

## 示例

<Demo>
  <div style="width: 100%">
    <NvCellGroup title="账户">
      <NvCell
        title="个人资料"
        description="头像、昵称与联系方式"
        clickable
        @click="tapped = '个人资料'"
      />
      <NvCell title="消息通知" value="已开启" clickable />
      <NvCell title="收货地址" value="3 个" clickable />
      <NvCell title="已停用项" description="不可点击" disabled />
    </NvCellGroup>
    <span style="display: block; padding: 8px 16px; font-size: 12px; opacity: 0.7">
      最近点击：{{ tapped }}
    </span>
  </div>
</Demo>

<Demo>
  <div style="width: 100%">
    <NvCellGroup title="快捷入口">
      <NvCell title="扫码" description="扫描文件项或终端码" clickable>
        <template #icon>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-6v-2h4z" fill="none" stroke="currentColor" stroke-width="1.6" />
          </svg>
        </template>
      </NvCell>
      <NvCell title="外链文档" to="https://example.com" description="点击跳转" />
    </NvCellGroup>
  </div>
</Demo>

## API

### NvCell 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `title` | 主标题 | `string` | — |
| `description` | 副标题 | `string` | — |
| `value` | 右侧值 | `string` | — |
| `to` | 链接地址，有值时整行渲染为 `a` | `string` | — |
| `clickable` | 可点击，渲染为 `button` | `boolean` | `false` |
| `disabled` | 禁用 | `boolean` | `false` |
| `arrow` | 可点击时显示右箭头 | `boolean` | `true` |

### NvCell 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 左侧图标 |
| `title` | 主标题 |
| `description` | 副标题 |
| `value` | 右侧值 |
| `extra` | 右箭头的附加内容 |
| `arrow` | 自定义右箭头 |

### NvCellGroup 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `title` | 分组标题 | `string` | — |

### NvCellGroup 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 分组内的单元格 |
| `title` | 自定义分组标题 |
