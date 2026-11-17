---
title: NvTimeline 时间线
---

<script setup>
import { NvTimeline, NvTimelineItem } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'
</script>

# NvTimeline 时间线

按时间顺序展示事件轨迹，节点状态区分常规、进行中与异常。

## 示例

<Demo block>
  <div style="max-width: 520px; width: 100%">
    <NvTimeline label="记录流转">
      <NvTimelineItem
        time="11-18 08:12"
        datetime="2026-11-18T08:12"
        title="记录创建"
        description="计划模块下发加工任务，关联物料已预占。"
        status="default"
      />
      <NvTimelineItem
        time="11-18 08:40"
        datetime="2026-11-18T08:40"
        title="资料就绪"
        description="工艺文件与检验标准已下发到三号产线。"
        status="default"
      />
      <NvTimelineItem
        time="11-18 09:05"
        datetime="2026-11-18T09:05"
        title="开始加工"
        description="操作员扫码开工，首件检验已通过。"
        status="active"
      />
      <NvTimelineItem
        time="11-18 10:21"
        datetime="2026-11-18T10:21"
        title="尺寸预警"
        description="第 120 件孔径接近上限，已通知班组长复核。"
        status="danger"
      />
    </NvTimeline>
  </div>
</Demo>

<Demo block>
  <div style="max-width: 520px; width: 100%">
    <NvTimeline label="带链接的节点">
      <NvTimelineItem
        time="11-17 14:20"
        datetime="2026-11-17T14:20"
        title="查看上一批次记录"
        href="#"
        description="跳转到批次 REC-1028 的完整记录。"
      />
      <NvTimelineItem
        time="11-17 16:05"
        datetime="2026-11-17T16:05"
        title="补充检验结果"
        description="复检合格，超差项已备注。"
        status="active"
      />
    </NvTimeline>
  </div>
</Demo>

## API

### NvTimeline 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `label` | 时间线的无障碍名称 | `string` | `时间线` |

### NvTimelineItem 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `time` | 时间文案，渲染在 `<time>` 元素内 | `string` | — |
| `datetime` | `<time>` 的机器可读时间 | `string` | — |
| `title` | 事件标题 | `string` | — |
| `description` | 事件说明 | `string` | — |
| `status` | 节点与轨线颜色 | `default \| active \| danger` | `default` |
| `href` | 将标题渲染为链接 | `string` | — |

### NvTimelineItem 插槽

| 插槽 | 说明 |
| --- | --- |
| `time` | 自定义时间内容 |
| `title` | 自定义标题内容 |
| `description` | 自定义说明内容 |
| `default` | 追加在说明之后的任意内容 |
