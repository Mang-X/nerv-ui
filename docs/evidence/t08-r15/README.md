# 受控层级树实施记录

范围 M，仅 #33；目标 integration/nerv-ui-extraction。base `2f73190c18c507e0e104653c7d5bc8e0b1b153ff`，tree `48b019c373fedfe9857d746b682191374144688c`。最终提交与 tree 见外部 handoff，避免自引用。旧应用接入及退出为 NOT_PLANNED；简单优先排程最后，本票不涉及排程。

## 来源与接缝

固定来源 SHA `79b1578f2b75f55709765b5e7882aaf33146c603`，素材 `migration/materials/source/frontend/apps/business-console/src/components/masterData/MasterDataTreeNode.vue`。直接消费者 facilities.vue、organization.vue 和递归自身只盘点、不改动。保留缩进、展开、单选、code、停用删除线与创建入口；移除 ResourceItem、type/code 拼 key、childLabelOf 业务映射。新增唯一公共组件 NvTree，内部扁平可见层级支持键盘与 ARIA；主桶及组件目录导出同步严格 Nv 集合（210 → 211），不放宽断言。无既有公开 tree，复用 NvStatusBadge 与语义工具类，无新 token/shadcn 修改。

## Requirement | Evidence

| Requirement                    | Evidence                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 权威选中与展开                 | `NvTree public DOM keeps selection and expansion authoritative when requests are rejected`：公开入口缺失 RED，GREEN                  |
| 停用、禁用、动作隔离           | `NvTree public DOM shows inactive separately from disabled and isolates create actions`：RED → GREEN                                 |
| key 替换、重排、隐藏选中、空树 | `NvTree public DOM tracks stable keys through replacement, nested mutation, collapse and empty trees`：RED → GREEN                   |
| 原地嵌套与折叠焦点             | `NvTree public DOM reacts to nested in-place edits and restores focus to a collapsed ancestor`：补充 GREEN，无独立 RED               |
| 基础键盘与焦点                 | `NvTree public DOM moves focus with arrows and Home/End without selecting`：RED → GREEN，真实浏览器 UNRUN                            |
| 两类宿主决定创建               | `Tree hosts accepts selection and creation in library` / `Tree hosts accepts selection and creation in studio`：模块缺失 RED → GREEN |

停用只改变展示；disabled 禁止选择但不阻止浏览展开和独立动作。动作展示及可创建类型由 slot 决定。折叠不清除隐藏的选中；父拒绝请求时不乐观高亮。

## 执行证据与边界

Node v24.18.0；frontend workspace pnpm 11.22.0（checkout 根默认 pnpm 12.0.0，门禁均在 frontend 执行）。沿用现有依赖，未安装或升级。定向公开 DOM + naming/primitives/design-system/doc coverage；宿主 TreeDemo + import hygiene；UI/host typecheck、playground build、源码 lint/fmt、文档格式/链接、diffcheck 见外部 handoff 原始日志与命令。

保留初次错误路径的 no-test-files、命名缺目录 barrel 的 282 PASS/1 FAIL，后续通过不覆盖原失败。测试 stdout 的 CSS stylesheet 解析警告保留；JSON 缺 runtime/unhandled 字段为 UNKNOWN，不能记 0。四个 vendor policy skip 执行 0，本轮不提供 vendor 证据。

历史全局 fmt 三个同 blob 文件、main RAW exit 2、docs alias schedule-model ENOTDIR、默认并行 DraftEditingDemo timeout 均为继承 FAIL，未重跑未顺修。无继承 PASS 冒充 fresh。浏览器/视觉/HTTP/文档 live、CI/packed/device/真实 vendor/APS/生产 UNRUN；商业授权 UNKNOWN。旧应用接入退出 NOT_PLANNED。#43/PR122 仍 draft open、真实 browser keyboard UNRUN，不夹带。

完整最小交接位于 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/t08-r15-implementation-r1/handoff.md`。不自审、不 ready/merge/close/watch、不启动后继或子代理；提交 draft 后由父安排独立审查。
