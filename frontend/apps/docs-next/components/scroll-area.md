---
title: NvScrollArea 滚动区域
---

<style>
.nv-sa-demo { height: 220px; }
.nv-sa-demo-short { height: 72px; }
.nv-sa-demo-wide { height: 180px; }
</style>

<script setup>
import { NvScrollArea } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const rows = Array.from({ length: 24 }, (_, index) => `记录 REC-${1040 + index}`)
const tags = [
  '下料',
  '车削',
  '钻孔',
  '铰孔',
  '去毛刺',
  '清洗',
  '烘干',
  '首检',
  '巡检',
  '终检',
  '包装',
  '入库',
]
</script>

# NvScrollArea 滚动区域

为受限区域提供自绘滚动条，滚轮、触屏与键盘滚动仍由浏览器原生处理。

## 示例

<Demo block>
  <NvScrollArea class="nv-sa-demo" label="记录列表">
    <div style="padding: 12px">
      <strong style="display: block; margin-bottom: 8px; font-size: 14px">今日记录</strong>
      <ul style="margin: 0; padding: 0; list-style: none; font-size: 13px">
        <li
          v-for="row in rows"
          :key="row"
          style="padding: 6px 0; border-bottom: 1px solid var(--vp-c-divider)"
        >
          {{ row }}
        </li>
      </ul>
    </div>
  </NvScrollArea>
</Demo>

<Demo block>
  <NvScrollArea orientation="horizontal" class="nv-sa-demo-short" label="工序标签">
    <div style="display: flex; gap: 8px; padding: 16px; white-space: nowrap">
      <span
        v-for="tag in tags"
        :key="tag"
        style="
          padding: 4px 10px;
          border: 1px solid var(--vp-c-divider);
          border-radius: 999px;
          font-size: 13px;
        "
      >
        {{ tag }}
      </span>
    </div>
  </NvScrollArea>
</Demo>

<Demo block>
  <NvScrollArea
    virtual
    :item-count="5000"
    :item-size="36"
    class="nv-sa-demo"
    label="虚拟滚动列表"
  >
    <template #item="{ index }">
      <div
        style="
          display: flex;
          align-items: center;
          height: 100%;
          padding: 0 12px;
          font-size: 13px;
          border-bottom: 1px solid var(--vp-c-divider);
        "
      >
        第 {{ index + 1 }} 行 · 工单 WO-{{ 100000 + index }}
      </div>
    </template>
  </NvScrollArea>
  <p style="margin: 10px 0 0; font-size: 13px; color: var(--vp-c-text-2)">
    5,000 行只渲染可视窗口（约 10 行）与缓冲区，DOM 节点数恒定。
  </p>
</Demo>

<Demo block>
  <NvScrollArea orientation="both" type="always" class="nv-sa-demo-wide" label="双向滚动">
    <div style="width: 900px; padding: 16px; font-size: 13px; line-height: 1.8">
      <strong>工艺说明全文</strong>
      <p style="margin: 8px 0 0">
        本工序共 12 道步骤，每道步骤均有对应的检验要求与记录字段。内容宽度超出容器时可横向滚动，
        高度超出时出现纵向滚动条。滚动条常驻展示，便于定位当前位置。
      </p>
    </div>
  </NvScrollArea>
</Demo>

## API

### NvScrollArea 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `orientation` | 渲染哪些方向的滚动条 | `vertical \| horizontal \| both` | `vertical` |
| `type` | 滚动条何时显示 | `auto \| always \| scroll \| hover` | `auto` |
| `scrollHideDelay` | 滚动条停止使用后保持的时长，单位毫秒 | `number` | — |
| `stickToEnd` | 内容增长时保持末尾可见 | `boolean` | — |
| `height` | 滚动区域的固定高度 | `number \| string` | — |
| `maxHeight` | 滚动区域的最大高度 | `number \| string` | — |
| `label` | 滚动区域的无障碍名称，设置后渲染为 `region` | `string` | — |
| `virtual` | 只渲染可视窗口内的行（需同时给 `itemCount`、`itemSize`） | `boolean` | `false` |
| `itemCount` | 虚拟模式的总行数 | `number` | `0` |
| `itemSize` | 虚拟模式的固定行高（px） | `number` | `32` |
| `overscan` | 窗口上下额外渲染的行数 | `number` | `4` |

`height` 与 `maxHeight` 传入数字时按像素处理，传入字符串时按原值使用。

### NvScrollArea 插槽

| 插槽 | 说明 |
| --- | --- |
| `default` | 滚动内容（非虚拟模式） |
| `item` | 虚拟模式的行内容，参数为 `{ index }` |
