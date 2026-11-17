---
title: NvBorderPanel 描边面板
---

<script setup>
import { NvBorderPanel } from '@nerv-iip/ui'
</script>

# NvBorderPanel 描边面板

带装饰描边的容器:四角各一道发光短角线,顶边正中一个亮色缺口。克制胜于霓虹 —— 角标都是单层短线。给一块内容一点「仪表盘外壳」的分量,又不喧宾夺主。可选 `title` 与顶边缺口同处一行。

独立运行入口为 playground 的 `/#screen/stage`；[接入说明](../../../../../../docs/screen-standalone.md)列出公共 CSS、返回导航和验收范围。下方 VitePress 预览仍由 #10 单独恢复。

## 示例

### 基础用法

传 `title` 在顶边缺口处带出居中标题,默认插槽放内容。

<ScreenDemo>
  <NvBorderPanel title="分组 A · 班次概览" style="width: 380px">
    <div style="display:flex;flex-direction:column;gap:8px;font-size:14px">
      <div style="display:flex;justify-content:space-between"><span style="color:var(--nv-scr-muted)">当前记录</span><span>REC-2406-0312</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--nv-scr-muted)">利用率</span><span style="color:var(--nv-scr-cyan)">86.5%</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--nv-scr-muted)">节奏</span><span>42.0 s / 条</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--nv-scr-muted)">合格率</span><span>99.2%</span></div>
    </div>
  </NvBorderPanel>
</ScreenDemo>

```vue
<NvBorderPanel title="分组 A · 班次概览">
  <!-- 分组明细 -->
</NvBorderPanel>
```

### 无标题

不传 `title` 时只剩纯描边外壳,角标与顶边缺口仍在,适合包一段不需要抬头的内容。

<ScreenDemo>
  <NvBorderPanel style="width: 320px">
    <div style="text-align:center">
      <div style="font-size:13px;color:var(--nv-scr-muted)">分组 C · 在制数量</div>
      <div style="font-size:40px;font-weight:600;color:var(--nv-scr-cyan);margin-top:6px">128</div>
      <div style="font-size:12px;color:var(--nv-scr-muted);margin-top:4px">截至 2024-06-12 10:24</div>
    </div>
  </NvBorderPanel>
</ScreenDemo>

```vue
<NvBorderPanel>
  <!-- 居中大数字 -->
</NvBorderPanel>
```

## API

### NvBorderPanel 属性

| 属性    | 说明         | 类型     | 默认 |
| ------- | ------------ | -------- | ---- |
| `title` | 顶边居中标题 | `string` | —    |

### 插槽

| 插槽    | 说明                            |
| ------- | ------------------------------- |
| 默认    | 面板主体内容                    |
| `title` | 自定义标题区(覆盖 `title` 属性) |
