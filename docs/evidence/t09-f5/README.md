# T09/F5 Field 内容区实施证据

范围 #161 / Parent #10，scope:S，一个 integration draft PR。旧四应用接入退出 NOT_PLANNED；F/G/H 另验。
基线 `c77d751f0d20e88711920529d245834e1de7d2d8` / tree `4ac101217eba5c496949ec806871c961e5a561bc`。
提交前 fetch 并正常 merge `origin/integration/nerv-ui-extraction`，Already up to date。首次误用远端短名 integration 的 fetch/merge 失败，未改树；未 reset/rebase。

- 语义 AC：`field-content-host.test.ts` → `renders public content around labelled controls and a non-label title with readable separator`。真实主桶 Content 包控件、for/id/description 关联、Title 为 DIV、Separator 文字可读。
- 状态与实例 AC：`keeps ids and safe current-value feedback independent across F4 and F5 instances`。F4/F5 三实例 ID 唯一，当前输入和选择立即反馈，HTML 字符串仅文本，第二实例隔离。
- live/学习代码：原 Field 页追加 FieldContentExample，源码 include 共用；水平和响应式显式传公开 orientation，默认仍 vertical。178 页保留，原 Field/F4 live 与学习代码保留。
- 来源：ui 主桶 → pc/field barrel → NvFieldContent.vue、NvFieldTitle.vue、NvFieldSeparator.vue；Title 实际为 div（与 Label 相同 data-slot 不等同 label）。未改 packages、全局 theme/Demo、依赖锁或 vendor。
- RED：准备阶段 sed 配置写入失败、无测试发现及缺 consumer 导入 FAIL 保留；空 consumer 的行为 RED 为 2 FAIL，完整实现 GREEN 2/2。局部完整 docs suite 12 文件 71/71，原 69 合同保留；JSON success=true、failed=0，未提供 unhandled 数故 UNKNOWN。
- 固定 pnpm 11.22.0；docs:typecheck、docs:build、scoped lint/fmt、Markdown 非空二次 bytecmp、links/原页保留及 diffcheck 记录在外部交接。构建死链检查与既有 links 合同；不以其替代浏览器。

最终 dist/HTTP、1440/390 亮暗、AX/键盘与长文完整/无 overflow 裁切：本席 UNRUN，留父独立验收。runtime unhandled UNKNOWN；CI/packed/device/production UNRUN，授权 UNKNOWN。vendor policy skip，0 执行，非 PASS。
jsdom CSS parse 与 Rollup annotation 原始警告保留；历史 RED 准备/global fmt RAW2/TZ timeout 不洗绿。未启动委派、review/runtime/merger、ready/merge/close/watch。
外部原始报告与 source patch：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f5-implementation-r1/`。
