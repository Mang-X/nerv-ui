---
title: NvScreenHeader 大屏页头
---

<script setup>
import { NvScreenHeader } from '@nerv-ui/ui'
</script>

# NvScreenHeader 大屏页头

大屏顶部的页头横条:左侧标题,右侧一组工具(时钟 / 星期 / 分组筛选 / 大屏名,各为一枚 lucide 图标加短标签,末尾收一个菜单图标),坐在一条底部发丝线上。纯属性驱动；图标仅作标签装饰，不具备筛选或菜单动作。未传属性保留兼容默认值，传空串才隐去对应项；时钟、日期、区域和屏幕名均由宿主输入，组件不计时。

独立运行入口为 playground 的 `/#screen/stage`；[接入说明](../../../../../../docs/screen-standalone.md)列出公共 CSS、返回导航和验收范围。下方 VitePress 预览仍由 #10 单独恢复。

## 示例

### 基础用法

横向占满整列,填入真实标题与挂钟时间。

<ScreenDemo wide>
  <NvScreenHeader
    title="实时运营总览"
    time="2024-06-12 10:24:36"
    date="星期三"
    line="全部分组"
    screen="中央大屏 01"
  />
</ScreenDemo>

```vue
<NvScreenHeader
  title="实时运营总览"
  time="2024-06-12 10:24:36"
  date="星期三"
  line="全部分组"
  screen="中央大屏 01"
/>
```

### 精简工具区

按需传空串隐去不需要的工具 —— 这里只保留时间与当前分组。

<ScreenDemo wide>
  <NvScreenHeader
    title="分组 A · 实时监控"
    time="2024-06-12 10:24:36"
    line="分组 A"
    date=""
    screen=""
  />
</ScreenDemo>

```vue
<!-- date / screen 传空串即隐去对应工具 -->
<NvScreenHeader
  title="分组 A · 实时监控"
  time="2024-06-12 10:24:36"
  line="分组 A"
  date=""
  screen=""
/>
```

## API

### NvScreenHeader 属性

| 属性     | 说明                         | 类型     | 默认                      |
| -------- | ---------------------------- | -------- | ------------------------- |
| `title`  | 页头标题                     | `string` | `'实时运营总览'`           |
| `time`   | 挂钟时间(传空串则隐去该工具) | `string` | `'2024-06-12 10:24:36'`   |
| `date`   | 日期 / 星期(传空串则隐去)    | `string` | `'星期三'`                |
| `line`   | 当前分组筛选(传空串则隐去)   | `string` | `'全部分组'`              |
| `screen` | 大屏 / 区域名(传空串则隐去)  | `string` | `'中央大屏 01'`           |
