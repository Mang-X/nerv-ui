# T09/F11 看板与记录卡

#173 / Parent #10，scope:M；独立 draft 示例 PR。新增看板叶页、共源学习示例及固定侧栏入口，178 个既有页与原例保持原字节。未修改组件、公开 API、冻结基础、依赖锁或库历史。

当前 producer 为 `frontend/packages/ui/src/components/pc/kanban/NvKanban.vue` 与 `record-card/NvRecordCard.vue`，均由 `@nerv-iip/ui` 主桶导出。columns 按列 key，itemKey 按记录 ID；item 插槽获取当前记录与列。无拖拽 API。RecordCard 支持 status/meta/progress 和 actions；数值零保留，缺省进度不显示。

| Requirement                                      | Evidence                                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 公开组合、列计数、显式空列、状态、meta、0 与 45% | `renders columns empty state status meta and zero and nonzero progress`                                   |
| 稳定身份、重排/替换后的当前操作与列数、恢复      | `keeps actions and column counts current after reorder replacement and restore`                           |
| 固定导航、live 与学习源码同源                    | config.mts 指向 kanban-record.md，render/include 同一 localKanbanRecordExample.vue；外部 preservation.log |
| 保留全部旧页原例、前票 80 断言                   | 外部 preservation.log；完整 docs 82/82（原 80 不改）                                                      |
| 窄屏/局部横滚/键盘/亮暗                          | 静态 min-w-0/max-w-full、可聚焦 region、原生按钮；独立 browser/HTTP/真实键盘/1440/390 亮暗视觉 UNRUN      |

fresh：局部 docs tests、docs:typecheck/docs:build、范围 lint/fmt、链接和维护 diffcheck 的原始结果见外部 handoff。RED 缺文件与行为 45→44 失败原样保留；准备路径/导航编辑失败与 jsdom CSS parser 诊断保留。后续 GREEN 不抹除历史 FAIL。runtime/unhandled 数字缺失为 UNKNOWN。

本页操作仅在内存，不声称业务保存。CI、packed、设备、production、全 playground/vendor UNRUN；旧应用接入退出 NOT_PLANNED。不签署独立 runtime，不自审/ready/merge/close/watch，不宣称父 #10 完成。

外部证据：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f11-implementation-r1/handoff.md`，含原始日志、最小源码归档及逐 SHA 回读；无 dist/deps。
