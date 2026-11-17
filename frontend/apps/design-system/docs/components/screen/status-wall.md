---
title: NvScreenStatusWall 分组状态墙
---

<script setup>
import { ref } from 'vue'
import { NvScreenStatusWall, NvScreenPanel } from '@nerv-iip/ui'
const mode = ref('flat')
const current = ref(null)
const items = [{key:'a',label:'阅读角',identity:'东区 1 号',status:{label:'待确认',tone:'amber'},summary:'0 人',group:{key:'east',label:'东区'}},{key:'b',label:'阅读角',identity:'西区 2 号',status:{label:'开放',tone:'green'},summary:null,group:{key:'west',label:'西区'}}]
</script>

# NvScreenStatusWall 分组状态墙

<ScreenDemo>
  <div style="width:100%">
    <label>排列 <select v-model="mode"><option value="flat">平铺</option><option value="group-grid">分组紧凑格</option><option value="group-chip">分组横条</option></select></label>
    <div style="height:280px"><NvScreenStatusWall :items="items" :mode="mode" label="阅读位置" @preview="current = $event" /></div>
    <NvScreenPanel title="位置概况">{{ current ? current.identity : '悬停或聚焦查看概况' }}</NvScreenPanel>
  </div>
</ScreenDemo>

live 源码仅表示文档接线。本轮未运行文档站或真实浏览器。带 250ms 内存延迟的两个中性宿主从 `/#screen/status-wall` 进入。

| 属性       | 类型                            | 默认/说明                            |
| ---------- | ------------------------------- | ------------------------------------ |
| items      | readonly ScreenStatusWallItem[] | 必填；key 唯一稳定，不使用名称作 key |
| label      | string                          | 必填；命名 region                    |
| mode       | ScreenStatusWallMode            | flat；另有 group-grid、group-chip    |
| emptyLabel | string                          | 暂无记录                             |

```ts
interface ScreenStatusWallItem {
  key: string
  label: string
  identity: string
  status: { label: string; tone: 'cyan' | 'green' | 'amber' | 'red' }
  summary?: string | null
  group?: { key: string; label: string }
  disabled?: boolean
}
type ScreenStatusWallMode = 'flat' | 'group-grid' | 'group-chip'
```

类型和组件均从 `@nerv-iip/ui` 主桶导入。identity 是可辨的人类位置描述；技术 key 不作为默认可见文字。摘要纯文本，真实零不得被空值判断丢弃，null/undefined 显示 —。分组按 key 关联，同名组可独立，未分组与名为 ungrouped 的组互不冲突。

| 事件    | 载荷                         | 行为                                                                |
| ------- | ---------------------------- | ------------------------------------------------------------------- |
| select  | ScreenStatusWallItem         | 原生按钮点击或键盘激活；先关闭预览                                  |
| preview | ScreenStatusWallItem 或 null | hover/focus 打开；离开/失焦/Escape/滚动/items 或 mode 更替/卸载关闭 |
| visible | string[]                     | flat 为虚拟窗口含 overscan；分组为全部输入 key；初始与变更时发出    |

无请求、轮询、缓存或详情 slot。宿主在墙外组合现有面板接收 preview；disabled 项无 hover、focus 或选择动作。按钮原生 title 保留全文，ARIA 名称包括标签、身份、状态。组件固定行几何，不根据摘要自动扩高；宿主提供确定高度和适合六列的宽度。有限 DOM 与 stride 的测试使用受控 clientHeight 和真实 useVirtualList，不能代表真实 resize、命中、视距或视觉通过。

## 来源与适配

来源固定 `79b1578f2b75f55709765b5e7882aaf33146c603` 的 DeviceStatusWall：保留平铺行虚拟、两种分组密度、hover/select/visible 与滚动关闭。去掉设备/工厂/车间 DTO、五态统计、paramColors、fetchDeviceDetail、250ms 防抖和 30 秒缓存；延迟只在示例宿主。完整设备详情及迷你趋势不迁入本墙。旧应用接入和旧库退出已取消，NOT_PLANNED。

<!-- @include: ../../../../../DESIGN/components/status-wall.md -->
