# R18 可打印详情 recipe

范围 M，一张独立 Draft PR，关联 #36。入口 `/#printable-detail`，桌面可进入并返回。仅应用内组合公开 `@nerv-iip/ui` 的 Dialog、Button、StatusBadge；不增加 Nv 领域组件，不保存、不查询、不接 SDK/auth。两个内存记录是阅读摘记与手作记录。只读详情不禁止打印，关闭按钮始终可用；纸面仅独立目标，不包含 action。

## 来源及处置

T01 固定 SHA `79b1578f2b75f55709765b5e7882aaf33146c603`。完整读取材料 `frontend/apps/business-console/src/components/quality/InspectionRecordDetailSheet.vue`、同目录 `.print.test.ts`、`pages/quality/firstArticleInspection.contract.test.ts`；直接消费者 `pages/quality/inspections.vue` 仅有 import、query 开合编排及末尾挂载，已检查相关段落。来源主体保留 Sheet/只读详情/打印/隐藏动作意图；业务字段、质量查询、SKU join、错误 toast/刷新、组织环境、首件方案与检验结果算法不迁移。firstArticleInspection 合同中只有打印隔离意图适用，其余业务合同不执行；不把来源静态字符串合同冒充生命周期验证。

参考当前 P14 SchedulingDaySchedule.vue/day-print.css 的 body owner、body 直属 Teleport、afterprint/focus/超时/异常/卸载清理。未修改 scheduling、未倒依赖其私有路径。请求 token 在 nextTick 后复核，关闭/替换同步取消，防止旧请求复活。非 owner 仅清自身目标，不能删除别人 body owner。拒绝已存在的 detail/P14 owner。app CSS 进入 app 层，纸面复用既有 print tokens，不新建 token 或框架。

source/reference 原字节未改；其余旧业务实现未深读，不对旧库正确性背书。许可 UNKNOWN。旧应用接入/旧库退出已取消，不计本票门禁。

## Requirement coverage

| Requirement                          | Evidence                                                        |
| ------------------------------------ | --------------------------------------------------------------- |
| 当前详情、纸面无动作、afterprint     | `prints current record without actions and cleans afterprint`   |
| 关闭与替换不复活过期请求             | `close and replacement cancel pending requests without revival` |
| 异常可重试、释放 owner               | `throw releases ownership with retryable error`                 |
| 不重复打印、多实例/非 owner 卸载隔离 | `duplicates and nonowner unmount preserve owner isolation`      |
| 聚焦取消、超时释放                   | `focus cancellation and timeout clean returned requests`        |

RED：缺组件导入失败 exit 1；另将 window.print 改为 void 0，行为 RED exit 1，恢复后 GREEN。首次准备命令路径错误、无测试文件 exit 1，不计有效 RED；另一次文档编辑路径错误保留为准备失败。读取不存在的 status-badge 路径与 DESIGN/README 失败，后按实际 status 路径与 DESIGN/index 定位。非正式测试断言 RED 不等于整票验收完成。

所有 pnpm 命令入口 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`。cwd 均为实际 checkout 下 frontend 或 apps/playground。

| cwd（相对 checkout）     | argv（入口之后）                                                                                                                                                              | 独立 exit |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| frontend/apps/playground | exec vp test run src/PrintableDetailDemo.test.ts（导入 RED/变异 RED/GREEN）                                                                                                   | 1 / 1 / 0 |
| frontend/apps/playground | exec vp test run src/PrintableDetailDemo.test.ts src/App.test.ts src/nvui-imports.contract.test.ts                                                                            | 0         |
| frontend                 | --filter @nerv-iip/playground typecheck                                                                                                                                       | 0         |
| frontend                 | --filter @nerv-iip/playground build                                                                                                                                           | 0         |
| frontend                 | exec vp lint apps/playground/src/PrintableDetailDemo.vue apps/playground/src/RecordDetailBody.vue apps/playground/src/PrintableDetailDemo.test.ts apps/playground/src/App.vue | 0         |

运行日志见外部 handoff 同目录最小日志。jsdom 输出 Could not parse CSS stylesheet，不能据此证明 print media；日志缺结构化 runtime/unhandled 字段为 UNKNOWN，不能记 0。四个 vendor policy skip 是 0 执行，不是通过。浏览器按用户要求 UNRUN，禁止启动服务；真实 print media、系统纸张、视觉、设备、CI、packed、旧消费者、production 均 UNRUN。历史 globalfmt3/docsaliasENOTDIR/mainRAW2/timeout 未修未跑，不用本轮 PASS 覆盖。

base `0072c1cec946b05a5744ae95f54097d608c12ef9`，tree `7dcc5dd72a51f6e96b55964f5ddd2ce14c6551d9`。交付前 fetch integration 与 base 相同。head/tree/clean 和 SHA-256 回读在外部 handoff，避免提交内自引用。保持 Draft、#36 Open，独立 review/ready/merge/验收评论均未做。
