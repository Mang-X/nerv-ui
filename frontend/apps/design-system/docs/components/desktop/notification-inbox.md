---
title: NvNotificationInbox 通知收件箱
---

<script setup>
import { NvNotificationInbox } from '@nerv-iip/ui'
import { ref } from 'vue'
const selected = ref(null)
const items = ref([{ key: 'book', title: '预约书籍可以领取', summary: '请到服务台领取。', read: false, statuses: [{ label: '待领取', tone: 'info' }] }])
function mark(item) { items.value = items.value.map(current => current.key === item.key ? { ...current, read: true } : current) }
const refreshCount = ref(0)
function refresh() {
  items.value = items.value.map(item => ({ ...item }))
  refreshCount.value += 1
}
</script>

# NvNotificationInbox 通知收件箱

## 示例

<Demo>
  <NvNotificationInbox title="阅读消息" :items="items" v-model:selected-key="selected" @mark-read="mark" @refresh="refresh" />
  <p role="status" class="w-full text-sm text-muted-foreground">
    {{ refreshCount ? `阅读消息已刷新（第 ${refreshCount} 次）。` : '阅读消息已就绪。' }}
  </p>
</Demo>

此例是同步内存宿主；刷新重新读取当前内存快照，保留已读状态与所选详情，并显示本页刷新次数，不请求后台。异步接入须由宿主确认结果后更新记录。完整双领域示例源码为 `frontend/apps/playground/src/NotificationInboxDemo.vue`，入口 `/#notifications/library`、`/#notifications/studio`。

## API

| 输入                                  | 类型 / 默认                           | 合同                                                    |
| ------------------------------------- | ------------------------------------- | ------------------------------------------------------- |
| title                                 | string，必填                          | 区域名称                                                |
| items                                 | readonly NvNotificationItem[]，未提供 | 未提供与 [] 空态区分；稳定唯一 key                      |
| selectedKey                           | string 或 null                        | 受控详情身份；删除后不显示详情，同 key 替换读取当前版本 |
| filter / filters                      | string / readonly {value,label}[]     | 当前过滤值及选项；宿主提供过滤结果                      |
| loading                               | boolean，false                        | 等待时隐藏列表/详情，禁用刷新                           |
| pendingKeys                           | readonly string[]                     | 对应记录禁用标记；不自动变成已读                        |
| error                                 | string                                | 用户可读错误；允许保留列表，不显示空态                  |
| emptyText / missingText / loadingText | string                                | 默认「暂无通知。」「尚未提供通知。」「正在加载通知…」   |
| filterLabel                           | string                                | 默认「通知类型」                                        |

`NvNotificationItem`：`key/title` 必填，`summary/code/meta/read/statuses` 可选；statuses 为 `{label: string, tone: StatusTone}[]`。不从文字推断状态；read 未提供不显示读状态和标记动作。summary 保留换行；code 使用等宽小字。

### 事件

| 事件               | 参数               | 说明                               |
| ------------------ | ------------------ | ---------------------------------- |
| update:selectedKey | string 或 null     | 打开/收起请求，拒绝不改变详情      |
| open               | NvNotificationItem | 点击标题，使用当前记录，不隐式标记 |
| markRead           | NvNotificationItem | 列表/详情标记请求，无本地成功状态  |
| refresh            | 无                 | 刷新请求，无自动清错               |
| update:filter      | string             | 请求新筛选，宿主拒绝时保留原值     |

### 插槽

| Slot   | 类型                                                            | 用途                         |
| ------ | --------------------------------------------------------------- | ---------------------------- |
| meta   | { item: NvNotificationItem }                                    | 资源、日期、状态补充         |
| action | { item: NvNotificationItem, pending: boolean }                  | 宿主动作，不嵌套在打开按钮内 |
| detail | { item: NvNotificationItem, pending: boolean }                  | 详情内容                     |
| filter | { value: string 或 undefined, change: (value: string) => void } | 自定义受控筛选               |

<!-- @include: ../../../../../DESIGN/components/notification-inbox.md -->
