# T08/R06 受控通知组合实施记录

范围 M，仅 #24，目标 integration/nerv-ui-extraction。base `f757e9d748948a61592cac558a2e58c71a9018d8` / tree `fee5a8ef6a56776601285d3227af4b7a78947a4e`。最新 fetch 与 base 相同。最终提交/tree 见外部 handoff，避免自引用。

## 来源与处置

固定 source `79b1578f2b75f55709765b5e7882aaf33146c603`。素材前缀 `migration/materials/source/frontend/apps/`，原字节不变：

| 输入 / 直接消费者                                                       | 来源合同                                                                                                      | 新接缝                                                                                |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| console/components/notifications/NotificationMessageList.vue            | messages、title、emptyText、sectionId 必填；pending/showMarkRead/markReadPending 可选；markRead(id)；无 slots | items/title/emptyText/loading/pendingKeys，当前 item 事件；状态 label/tone 由宿主提供 |
| console/components/notifications/NotificationTaskList.vue               | tasks 必填、pending 可选；无事件/slots；任务类型/动作引用/状态/日期                                           | 相同 item 的 title/code/statuses/meta；无 read 时不显示已读动作                       |
| console/pages/notifications/index.vue                                   | 未读/已读/任务三个区，刷新、全部标记、即时 toast                                                              | 宿主可组合三实例及 action/filter slot；批量逻辑留宿主，即时反馈复用现有 toast         |
| business-console/components/notifications/NotificationMessageList.vue   | messages/pending/markReadPending 必填；open/markRead(id)                                                      | 分隔列表、标题打开、未读、独立标记动作                                                |
| business-console/components/notifications/NotificationMessageDetail.vue | message/markReadPending；close/markRead                                                                       | 受控 selectedKey 与 detail slot，完整换行、当前记录身份                               |
| business-console/components/notifications/NotificationInbox.vue         | 无 props/事件/slots；内部查询、筛选、Sheet、refresh、notify                                                   | 无查询面板，filter slot 或受控选项；宿主用既有 Sheet 组合                             |
| business-console/layouts/BusinessLayout.vue                             | 消费 Inbox                                                                                                    | 仅盘点，旧应用接入退出 NOT_PLANNED                                                    |

来源没有显式默认值的可选 boolean 按 Vue false；新件默认文案和公开输入见[组件 API](../../../frontend/apps/design-system/docs/components/desktop/notification-inbox.md)。不引入 DTO、SDK、认证、API、query、poll 或领域算法，不改 shadcn，不升级依赖。已读、打开、筛选结果与异步回执由宿主裁定；同 key 的版本替换使用当前对象，过期服务回执由宿主隔离。

## Requirement | Evidence

| Requirement                                    | Evidence（精确测试名）                                                                                                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 未提供/空/等待/失败与刷新请求                  | `NvNotificationInbox public contract distinguishes absent empty loading and error without inventing success`                                                                       |
| 受控拒绝、已读替换、动作不打开、pending        | `NvNotificationInbox public contract keeps selection and read controlled and action separate from open`                                                                            |
| 稳定 key 重排/删除/同 key 替换，当前详情和动作 | `NvNotificationInbox public contract uses current identity after reorder deletion and same-key replacement`                                                                        |
| 筛选拒绝/替换与 slots                          | `NvNotificationInbox public contract rejects filter changes until host replaces the value and exposes typed slots`                                                                 |
| 两领域宿主、失败不假成功、加载恢复             | `notification hosts controls rejection replacement and asynchronous outcomes in library` / `notification hosts controls rejection replacement and asynchronous outcomes in studio` |

公开入口未导出 RED（red-valid）→ GREEN（green-2）；初次 red/green 是测试 import 路径错误，保留原失败。host 首次 GREEN 后补做模块缺失 RED→恢复 GREEN（host-red/host-restored），不称为先写失败的实现顺序。原始 JSON、stdout、exit 均在 raw。缺 runtime/unhandled 字段为 UNKNOWN，不凑 0；CSS stylesheet 解析警告保留。

## 实际命令与证据

所有 pnpm 命令 cwd 为 frontend，pnpm 11.22.0；无安装升级。定向命令完整参数见 raw/commands.txt。

- final-ui：公开 DOM + naming/primitives/blocks/design-system/doc coverage/layout，290 PASS，exit 0。
- host-final：两宿主 + import hygiene，77 PASS，exit 0。
- UI/host typecheck、playground build-2、scoped lint/fmt 和文档格式/链接结果见 raw。build 初次 FAIL 因模板内多语句经格式化丢分号；改具名函数后通过，原日志保留。
- 本轮不运行完整 UI/宿主全桶，未推断其通过。四 vendor policy lanes 执行 0，不提供 vendor 证据。

浏览器/键盘真实运行/视觉/HTTP/文档 live、CI/packed/device/vendor/APS/生产 UNRUN；商业授权 UNKNOWN。可执行示例源码不等于 live 实跑。历史 main RAW 2、global fmt 3 同 blob 失败、docs alias schedule-model ENOTDIR、parallel timeout 为继承 FAIL，未重跑未修；没有继承 PASS 冒充 fresh。#43/PR122 browser keyboard 仍 UNRUN、draft open，不夹带。来源 consumer 接回/退出 NOT_PLANNED，简单优先排程最后，不动暂停 P15。
