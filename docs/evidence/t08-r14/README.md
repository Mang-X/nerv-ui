# T08/R14 #32 实施证据

本票仅在 `feat/t08-r14-search-multiselect` 增加 `NvEntityMultiPicker` 的中性数组接缝与两个宿主示例。基线为 integration `6921408cafd961b81b7c4c0e6dd56d683de391a6`、tree `9dc8fc2b9d96e4644a4342f5d4efb2cb56ec7cc1`。候选提交、tree 和最终工作区状态以 durable `2026-10-27/t08-r14-implementation-r1/handoff.md` 为准；本页不预写自引用的提交号。

PR118 R1 三项返修的固定对象、逐项 RED/GREEN、真实浏览器和未运行边界另见 durable `2026-10-27/t08-r14-label-identity-fix/handoff.md`；此索引保留原 R1 实施记录，不覆盖早期 FAIL。

## 来源与边界

- T01 固定来源 `79b1578f2b75f55709765b5e7882aaf33146c603`。原 `EntityMultiPicker.vue` 在 `migration/t01/provenance.jsonl:319` 映射至只读素材，SHA-256 `6e028242723d2972430e71cb1ec375a1500f27055c95dbd0baabdf7354ac9eff`；原测试在第 318 行，SHA-256 `029d906038921b6b1a9680bcec9f6307050c6874fc732df1f09d79d362fec2ac`。来源文件未改。
- 只读消费者为旧 `master-data/tooling.vue` 两处、`maintenance/availability.vue` 与 `erp/procurement/rfqs.vue` 一处；它们仍以逗号字段和自身搜索/请求管理调用旧件。本票不迁这些页面，逗号转换在新宿主示例完成。
- 公共组件复用 `NvEntityPicker` 的下拉搜索、键盘列表和分页事件。数组值由宿主拥有；已选 label 只在组件挂载期间、值仍被选中时缓存，同 key 新结果刷新，移除后清退。未知值原样可见，不推断状态或资格。无 SDK、认证、路由、DTO、内置 fetch 或领域计算。命名复评见 [A4 映射](../../../frontend/DESIGN/nvui-naming-map.md)，设计判定见[当前决策](../../../frontend/DESIGN/components/entity-multi-picker.md)，公开 API 与 live 示例见[文档页](../../../frontend/apps/design-system/docs/components/desktop/entity-multi-picker.md)。

## Fresh 执行

| 车道       | 本轮结果                                                                                                                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RED        | 公开入口首测 exit 1：`NvEntityMultiPicker` 尚未导出，1/1 失败。缓存测试曾揭示同一次 props 替换的旧 label 回填；搜索活动行新增断言 RED（1 failed、7 skipped）后修正。两处测试选择器错误单列为测试本身失败，不充当产品 RED。                                                                                       |
| GREEN      | `pnpm@11.22.0 --filter @nerv-iip/ui exec vp test run` 定向 `EntityPicker.test.ts`、`EntityMultiPicker.test.ts`、命名与三份文档契约：6 files、286 tests passed、exit 0。控制台的 `Could not parse CSS stylesheet` 是 jsdom 样式解析提示；该命令未输出结构化 skipped/todo/unhandled-error 字段，字段记为缺失。     |
| 类型与构建 | 全活动 workspace `vue-tsc`、playground `vp build` 将在候选冻结后以 durable 精确命令/退出码回读。既有 vendor `crypto` externalization、PURE 注释和大 chunk 提示保留。                                                                                                                                             |
| 样式与文档 | 本票仅使用现有语义类和 token，无新增 token/font/全局样式；scoped fmt/lint、相对链接检查与 `git diff --check` 的最终结果见 durable。                                                                                                                                                                              |
| 浏览器     | 真实 Chromium 的 `/#entity-multi-picker` 已操作两种宿主：选入、跨搜索页保 label、同 key 更新、未知值、分页滚动、移除、宿主替换、disabled、invalid、卸载重挂与键盘 Enter。390×844 实测 `scrollWidth=390`；移除触点 44×44。明暗及窄屏截图在 durable `screenshots/`，均已目视。文档 live 页独立打开并完成一次选择。 |

T3 preview `preview_status` 无可复用 tab；两次 `preview_open` 均原样返回 `Too many server browser tabs are open. Close one with t3_preview_close, or reuse a tabId from preview_status tabs.`，转 ego-browser。文档站使用临时工具目录和可清理依赖链接，仅核目标 dev/live 页；完整站点构建仍属 #10，**UNRUN**。浏览器 HTTP 响应与 fresh dist 的字节核验在 durable 记录，限于核过的入口文件，不等于发布包或旧消费者验收。

## 继承与未运行

全局 3 项 base fmt FAIL、main raw 2 项 FAIL 为历史继承，未在本票重标 PASS；四条真实 vendor policy 车道执行数为 0，授权仍 UNKNOWN。CI、版本化 packed 消费、原应用接入、真实设备、生产、父 #9 与规格 #1 组合验收均 **UNRUN**。#12–#16 按规格 v2 为 **NOT_PLANNED**，不是本票范围。PR 保持 draft、仅向 integration 提交，交父席独立复审；本席不 ready、merge、close 或启动后继票。
