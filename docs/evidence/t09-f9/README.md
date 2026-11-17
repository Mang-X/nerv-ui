# T09/F9 表单分节与分组选择

范围：#169，scope:M，一个 integration draft PR。仅 Select 页追加组合与共源学习代码，原例、导航、178 页保留；不改 producer。父 #10 的其它 F/G/H 另验，旧四应用接入退出 NOT_PLANNED。

## 合同与消费链

入口为 `frontend/apps/design-system/docs/components/desktop/select.md`，live 与源码均引用 `localFormSectionExample.vue`。以下是本票一次性 source 证明，不是永久导出注册表。

| 公开项                 | producer 与本例消费                                                                                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NvFormSection          | `frontend/packages/ui/src/components/pc/form-section/NvFormSection.vue`；title 必填，description 可选、columns 默认 2；默认/actions 插槽，无 emits。本例 2/1/3 列、长说明、重置 actions |
| NvSelectGroup          | `frontend/packages/ui/src/components/pc/select/index.ts` 命名浅拷贝 Reka SelectGroup；区域两组实际组合，不借基础 Group 的名字推定覆盖                                                   |
| Select                 | `frontend/packages/ui/src/components/ui/select/Select.vue`；公开 Reka props/emits 与 scoped slot；活动受控根                                                                            |
| SelectTrigger          | 同目录 `SelectTrigger.vue`；真实活动触发器，id 与 label 关联                                                                                                                            |
| SelectContent          | 同目录 `SelectContent.vue`；Portal → Content → ScrollUp / Viewport(default slot) / ScrollDown；默认 item-aligned、center，与品牌 popper/start/6 不同                                    |
| SelectItem             | 同目录 `SelectItem.vue`；活动二十项，内部 ItemText/Indicator；默认插槽与 indicator-icon 可选插槽，本例默认                                                                              |
| SelectGroup            | 同目录 `SelectGroup.vue`；活动两组真实组合，props 委托 Reka                                                                                                                             |
| SelectLabel            | 同目录 `SelectLabel.vue`；区域和活动的可见组名，default slot；公开 props 以当前 producer 为准                                                                                           |
| SelectSeparator        | 同目录 `SelectSeparator.vue`；两族组间真实组合                                                                                                                                          |
| SelectScrollUpButton   | 同目录 `SelectScrollUpButton.vue` → Reka SelectScrollUpButton；由基础 Content 内部实例化，Reka viewport.scrollTop > 0 才 render                                                         |
| SelectScrollDownButton | 同目录 `SelectScrollDownButton.vue` → Reka SelectScrollDownButton；由基础 Content 内部实例化，ceil(scrollTop) < scrollHeight-clientHeight 才 render                                     |

上述基础目录 barrel 及主桶 `frontend/packages/ui/src/index.ts` 均公开导出；两族 Item/Trigger/Content 分别消费，不能以品牌同名组件替代基础合同。每族二十项提供溢出输入；source 条件证明不冒充浏览器按钮可达。品牌 Content 自身 overflow 滚动，没有基础按钮。Reka 版本以当前安装 2.10.1 为准，没有改依赖或 vendor。

## 验收映射

| AC                                                        | 精确测试/证据                                                                            |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 分节 1/2/3 列公开 props、两族真实触发器及 label           | `renders three public section column contracts and labelled independent select families` |
| 两族公开事件更新当前 host、安全插值、多实例 ID 与重置隔离 | `reflects both public model updates safely and resets only this instance`                |
| 原合同保留                                                | design-system 局部完整桶原 76 加本票 2；无 stub，无 keyboard 通过声明                    |
| 页面与链接                                                | docs 完整 types/build；178 页集合、旧例前缀保留；外部 raw 报告                           |

首次 RED 为缺示例文件的准备 FAIL；行为 RED 将重置区域暂改为南岸，精确反馈断言失败，恢复后 GREEN。原始记录均保留。jsdom 有 CSS parser 诊断；公开事件注入只证明 host wiring，未证明真实用户选项选择、键盘或布局。

独立席 UNRUN：最终 dist/HTTP、1440/390 亮暗、Tab/方向键/Enter/Escape、焦点、选项滚动按钮及长说明/actions 无裁剪重叠。runtime unhandled 数 UNKNOWN。CI/packed/device/production UNRUN，授权 UNKNOWN；vendor policy skip，0 执行，不记 PASS。历史 global fmt RAW2/TZ timeout/RED 准备 FAIL 不被本票局部门禁覆盖。

外部交接：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f9-implementation-r1/handoff.md`，含 raw、最小 patch 与逐 SHA 回读；不含 dist/deps。不启动 review/runtime/merger，不 ready/merge/close/watch。
