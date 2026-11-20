---
title: NvTimeline 时间线
---

<script setup>
import { NvTimeline, NvTimelineItem } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'
</script>

# NvTimeline 时间线

按时间顺序展示事件轨迹：`status` 标记事件在流程中的位置，`tone` 单独表达警示色；方向键在事件之间移动，整条时间线只有一个 Tab 停点。

## 示例

<Demo block>
  <div style="max-width: 520px; width: 100%">
    <NvTimeline label="记录流转">
      <NvTimelineItem
        time="11-18 08:12"
        datetime="2026-11-18T08:12"
        title="记录创建"
        description="计划模块下发处理任务，关联文件项已预留。"
        status="complete"
      />
      <NvTimelineItem
        time="11-18 08:40"
        datetime="2026-11-18T08:40"
        title="资料就绪"
        description="流程文件与校验标准已下发到第三分组。"
        status="complete"
      />
      <NvTimelineItem
        time="11-18 09:05"
        datetime="2026-11-18T09:05"
        title="开始处理"
        description="处理人扫码开始，首次校验已通过。"
        status="current"
      />
      <NvTimelineItem
        time="11-18 10:21"
        datetime="2026-11-18T10:21"
        title="指标预警"
        description="第 120 条数据接近上限，已通知分组负责人复核。"
        status="current"
        tone="danger"
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
        title="查看上一条记录"
        href="#"
        description="跳转到记录 REC-1028 的完整内容。"
      />
      <NvTimelineItem
        time="11-17 16:05"
        datetime="2026-11-17T16:05"
        title="补充校验结果"
        description="复核通过，异常项已备注。"
        status="current"
      />
    </NvTimeline>
  </div>
</Demo>

## API

### NvTimeline 属性

| 属性    | 说明               | 类型     | 默认     |
| ------- | ------------------ | -------- | -------- |
| `label` | 时间线的无障碍名称 | `string` | `时间线` |

### NvTimelineItem 属性

| 属性          | 说明                                                                       | 类型                              | 默认      |
| ------------- | -------------------------------------------------------------------------- | --------------------------------- | --------- |
| `time`        | 时间文案，渲染在 `<time>` 元素内                                           | `string`                          | —         |
| `datetime`    | `<time>` 的机器可读时间                                                    | `string`                          | —         |
| `title`       | 事件标题                                                                   | `string`                          | —         |
| `description` | 事件说明                                                                   | `string`                          | —         |
| `status`      | 事件在流程中的位置（`current` 会带 `aria-current="step"` 并抢到 Tab 停点） | `complete \| current \| upcoming` | —         |
| `tone`        | 标记颜色，与流程状态正交                                                   | `default \| danger`               | `default` |
| `value`       | 事件标识，供 `focus(value)` 与代理定位；缺省时自动生成                     | `string`                          | —         |
| `href`        | 将标题渲染为链接                                                           | `string`                          | —         |

### NvTimelineItem 插槽

| 插槽          | 说明                     |
| ------------- | ------------------------ |
| `time`        | 自定义时间内容           |
| `title`       | 自定义标题内容           |
| `description` | 自定义说明内容           |
| `default`     | 追加在说明之后的任意内容 |
