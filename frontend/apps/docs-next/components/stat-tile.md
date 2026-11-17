---
title: NvStatTile 指标卡
---

<script setup>
import { NvStatTile } from '@nerv-ui/pad'
import '@nerv-ui/pad/styles.css'
</script>

# NvStatTile 指标卡

站点平板上展示单个关键指标的卡片，可强调或标记为激活态。

## 示例

<Demo>
  <NvStatTile label="今日产出" value="1,240" unit="件" hint="较昨日 +6.3%" />
  <NvStatTile label="一次合格率" value="98.2" unit="%" hint="目标 98%" tone="brand" />
  <NvStatTile label="待处理异常" value="7" unit="条" hint="其中 2 条为资源报警" tone="danger" />
  <NvStatTile label="当前站点" value="ST-04" hint="运行中" active />
</Demo>

<Demo>
  <NvStatTile label="今日产出" value="1,240" unit="件">
    <template #icon>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19h16M7 15l3-4 3 2 4-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </template>
    <template #hint>图表入口示例</template>
  </NvStatTile>
</Demo>

## API

### NvStatTile 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `label` | 指标名称，必填 | `string` | — |
| `value` | 指标值，必填 | `string \| number` | — |
| `unit` | 数值单位 | `string` | — |
| `hint` | 辅助说明 | `string` | — |
| `tone` | 数值语义色 | `default \| brand \| danger` | `default` |
| `active` | 激活态强调 | `boolean` | `false` |

### 插槽

| 插槽 | 说明 |
| --- | --- |
| `icon` | 标题行右侧图标 |
| `hint` | 自定义辅助说明 |
| `default` | 卡片底部附加内容 |
