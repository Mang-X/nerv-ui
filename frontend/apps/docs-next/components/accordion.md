---
title: NvAccordion 折叠面板
---

<script setup>
import { ref } from 'vue'
import { NvAccordion, NvAccordionItem } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const single = ref(['quality'])
const multi = ref(['line', 'quality'])
</script>

# NvAccordion 折叠面板

纵向堆叠的可折叠条目，单项或多项展开，支持禁用到条目级。

## 示例

<Demo block>
  <NvAccordion v-model:value="single" collapsible>
    <NvAccordionItem value="basic" title="基本信息">
      记录 REC-1024，类型 NX-220，数量 500 项。
    </NvAccordionItem>
    <NvAccordionItem value="quality" title="校验记录">
      首次校验通过 492 项，修正 8 项；一次通过率 98.4%。
    </NvAccordionItem>
    <NvAccordionItem value="logs" title="变更日志">
      2026-11-18 09:20 调整了第二阶段的处理时间。
    </NvAccordionItem>
  </NvAccordion>
</Demo>

当前展开：{{ single.length ? single.join('、') : '全部收起' }}

<Demo block>
  <NvAccordion v-model:value="multi" multiple>
    <NvAccordionItem value="line" title="分组状态">
      3 号分组运行中，利用率 82%。
    </NvAccordionItem>
    <NvAccordionItem value="quality" title="校验记录">
      当前记录暂无异常记录。
    </NvAccordionItem>
    <NvAccordionItem value="stopped" title="中断记录（禁用）" disabled>
      该条目被禁用，无法展开。
    </NvAccordionItem>
  </NvAccordion>
</Demo>

已展开 {{ multi.length }} 项：{{ multi.join('、') || '无' }}

<Demo block>
  <NvAccordion :default-value="['welcome']" :collapsible="false">
    <NvAccordionItem value="welcome" title="自定义标题插槽">
      <template #trigger>使用触发插槽自定义标题</template>
      展开这一项后当前项不能再次收起，因为 `collapsible` 关闭。
    </NvAccordionItem>
    <NvAccordionItem value="hint" title="默认标题">
      关闭 `collapsible` 后点击另一项会切换到该项。
    </NvAccordionItem>
  </NvAccordion>
</Demo>

<Demo block>
  <NvAccordion disabled>
    <NvAccordionItem value="a" title="整体禁用 A">整组禁用时所有条目都不可操作。</NvAccordionItem>
    <NvAccordionItem value="b" title="整体禁用 B">这是第二个条目。</NvAccordionItem>
  </NvAccordion>
</Demo>

## API

### NvAccordion 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 受控展开项的值数组（`v-model:value`） | `string[]` | — |
| `defaultValue` | 非受控初始展开项 | `string[]` | — |
| `multiple` | 允许多项同时展开 | `boolean` | `false` |
| `collapsible` | 唯一展开项是否可收起 | `boolean` | `true` |
| `disabled` | 禁用整组 | `boolean` | `false` |
| `keepMounted` | 收起时仍保留面板内容 | `boolean` | `false` |
| `hiddenUntilFound` | 使用原生 `hidden="until-found"`，浏览器页内查找可展开命中内容 | `boolean` | `false` |

### NvAccordion 事件

| 事件 | 说明 |
| --- | --- |
| `update:value` | 展开项变化，参数为 `string[]` |

### NvAccordion 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 放置 `NvAccordionItem` |

### NvAccordionItem 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `value` | 唯一标识该条目的值，必填 | `string` | — |
| `title` | 触发按钮文案；`trigger` 插槽优先 | `string` | — |
| `disabled` | 禁用该条目 | `boolean` | `false` |
| `keepMounted` | 收起时仍保留该面板内容 | `boolean` | `false` |

### NvAccordionItem 插槽

| 插槽 | 说明 |
| --- | --- |
| `trigger` | 自定义触发按钮内容 |
| `default` | 展开后的面板内容 |
