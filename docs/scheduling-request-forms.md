# 候选项目与单项请求表单（P10）

[P10 / #93](https://github.com/Mang-X/nerv-ui/issues/93) 从 `@nerv-iip/scheduling` 主桶导出 `SchedulingOrderPool`、`SchedulingCandidatePicker`、`SchedulingHorizonFields`、`SchedulingSingleOrderDialog` 和对应类型。中性页面可从 `/#schedule-request/library` 与 `/#schedule-request/studio` 打开。组件只表达来源状态、选择、草稿、窗口和请求确认；查询、资格、权限、限制、时区解析、计算、持久化均由宿主提供。

旧私有文件名对应的 `SingleOrderSchedulingDialog` 也是同一组件的公开别名，便于消费者逐处改接；两个名字共享完全相同的输入和事件。

## 公共合同

- 池与候选器的 `state` 显式为 `unready | loading | error | ready`。`unready` 表示范围尚未就绪，未发查询；`error` 带安全文案和 `retry`；`ready` 空数组才是空结果；非空数组经关键词过滤为空时显示无命中。`items` 是当前来源已加载的行，不代表未加载的页。`sourceKey` 标识当前来源。
- 池的 `include(keys, included)` 仅发送当前显示且允许选择的稳定 `key`，批量按钮不枚举隐藏或其他页。`selectedKeys` 由宿主回写。默认 `selectionOnFilter="retain"` 保留筛选外选择；`clear-hidden` 会在筛选时请求移出隐藏 key；只读期间筛选、行替换和受控选择变化都不发选择变更请求，恢复编辑后可按当前隐藏集合重新请求。重排和同 key 改文案沿用稳定身份，来源更换时宿主应清除不再适用的选择。
- `clear-hidden` 的请求随筛选结果变化而更新，包括宿主替换或改写 `items` 后同 key 不再匹配的情形；组件只发 `include(keys, false)`，不私自改受控 `selectedKeys`。同一隐藏集合的重排不重复请求。优先级输入清空为 `null`（未知），输入 `0` 保留真实零值；非有限输入不写入草稿。
- `saveItem(key, { priority, isRush })` 是可选的异步回调，**仅返回 `true` 才确认**；缺失、`false`、异常都保留草稿并给出可重试提示。来源切换、只读、行消失或替换、卸载使旧回执失效。来源在确认后回写最新 `items`；草稿不会进入排程撤销栈。
- 窗口的 `modelValue` 保留 `presetKey` 和 `datetime-local` 原始 `startLocal/endLocal`。`presets`、`validation.valid/message` 由宿主提供；组件既不转换成 UTC，也不内置预设天数、最大跨度或业务容量。宿主必须根据自己的时区与夏令时规则核对后再提交。控件 `idPrefix` 允许同页多实例。
- 弹窗的 `fixedItem` 存在时不挂候选器；否则传入候选 `state/items` 和 `initialKeyword`，用户选择 `key`。词只是检索起点，不推断关联。`new` 与 `insert` 均捕获 `sourceKey/contextKey/itemKey/mode/horizon`，插入还捕获 `planKey`；现有安排由 `plans` 输入，`insertion-result` slot 可放 P13 的只读受控预览。`submit(request)` 返回有 `key/label` 的明确回执才触发 `scheduled(receipt, request)`；缺失、`false`、异常无成功态。关闭、来源/上下文/目标/模式/窗口/方案变化、只读或卸载使旧异步结果与 `finally` 失效。只读时已确认结果仍可查看，进行中的请求会失效。
- 非固定目标只有候选来源 `ready` 才可提交；切到未就绪、加载或失败会使进行中的请求失效，恢复 `ready` 后可重新请求。固定目标的提交资格由固定项及宿主输入决定，不受无关候选来源状态影响。回执的 `key` 和 `label` 在运行时都必须是非空白字符串；合法 opaque key 的原字节保持不变。

## 旧私有能力与责任

| 冻结文件                          | 既有公开面与分支                                                                                                                                                                                            | 本票接缝 / 宿主责任                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `SchedulingOrderPool.vue`         | `candidates/draftOrders/loading/readOnly/canEditPriority/saveOrder/error/scopeReady/scopeMessage`；`include/retry`；`scope` slot；范围未就绪、失败、加载、空、搜索无命中；批量/行内选中；priority/rush 草稿 | 中性 `items/state/selectedKeys/saveItem`、可见 keys 与 `scope` slot；SKU 名称、需求变更、紧迫度、资格与首版容量留宿主 |
| `SchedulingCandidatePicker.vue`   | `initialKeyword/disabled`、必填 `v-model`；惰性 MES 查询；范围未就绪/失败重试/空；radio 选择                                                                                                                | `keyword/selectedKey` 受控事件，`state/items/retry` 输入；候选查询、资格过滤与无稳定关联解释留宿主                    |
| `SchedulingHorizonFields.vue`     | `idPrefix/disabled`、必填 `v-model`；preset/custom、起止输入、错误摘要                                                                                                                                      | 原样 wall time 与宿主 `presets/validation`；旧 7/30 天、180 天、UTC 转换不提升为通用规则                              |
| `SingleOrderSchedulingDialog.vue` | `workOrderId/contextLabel/initialKeyword`、必填 `v-model:open`、`scheduled(planId)`；固定/选择目标、new/insert、取消、pending、生成结果                                                                     | `fixedItem` 或候选输入、`new/insert`、`submit` 回执、`insertion-result` slot；组织/环境、权限、查询、生成与保存留宿主 |

旧直接消费者：`pages/scheduling.vue` 使用池和窗口；`pages/mes/work-orders/index.vue`、`[workOrderId].vue`、`components/planning/PlanningWorkbench.vue` 和 `components/fulfillment/FulfillmentTimelineSheet.vue` 使用单项弹窗。后四处的清单、详情、建议和相关记录入口在两个中性页面中可操作，业务页面本体与 SDK 不迁入。旧 `SchedulingInsertionPreview` 的历史查询、P13 异步候选、实际 APS 结果仍由宿主接线。

组件展示用的期望时间、紧迫度和单位由宿主传入可读文本。技术 key 使用弱化等宽字；数量右对齐且最多三位小数由宿主格式化。中性页面的本地数据与回执只为可见合同，不是 APS 或后端保存证据。验证与未运行边界见 [P10 证据](evidence/t07-p10/README.md)。
