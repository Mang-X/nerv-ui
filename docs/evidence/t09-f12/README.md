# T09/F12 只读时间安排导航

#175 / Parent #10，scope:S。仅在既有桌面侧栏“排产 Scheduling”组增加“只读时间安排”，指向现有 `/components/desktop/schedule-timeline`。页面、live、源码、组件与模型合同保持原字节；无重复页面。

Requirement coverage：`links the fixed scheduling sidebar to the existing readonly timeline page` 导入实际 config.mts，验证正确侧栏分组内唯一固定入口、用户文案及真实页面存在。缺入口时 RED（1 failed / 6 passed）；修改后在文档 app cwd 执行固定 pnpm 的 `exec vitest run --config vitest.config.ts`，17 文件 83/83，原 82 用例未改。fresh docs:typecheck、docs:build、scoped lint/fmt、页面/导航保留与 diffcheck 见外部 raw。

基线 `58e0e9a42898a2cdd5583eb5a3959a9dedcd0071` / tree `a03ed25a901d840cee5bbd324031ce0ad69d0e94`，PR #174 已合并。实际基线 179 个 Markdown 页（含前票保留的 178 页和 F11 新页）逐字节保留，旧导航配置只插入一行；构建保留死链检查。

本地测试输出含 jsdom CSS parser 诊断。历史并行 81/82 FAIL 的原因与风险仍 UNKNOWN，本次 PASS 不抹除历史失败。缺失 runtime/unhandled 数字为 UNKNOWN；真实浏览器、HTTP、点击选中反馈、窄屏、键盘交由独立验收，均 UNRUN。CI 空 checks 不代表 PASS；packed/device/production、全 playground/vendor 均 UNRUN；旧应用接入退出 NOT_PLANNED。

本席仅实施 draft，不自审、签署运行验收、ready、merge、close、watch 或修改父票。最小 raw、源码 SHA 回读及外部交接：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f12-implementation-r1/handoff.md`；不归档 dist/deps。
