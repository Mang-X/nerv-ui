# T08/R19 / #41 实施记录

范围 M：中性移动拍照入口与成功附件组合；独立 Draft PR，基于 `integration/nerv-ui-extraction`。不改排程、不接旧应用、不实现相机框架和传输后端。不启动独立审核，不 ready/merge/close，#41 保持 Open。

## 固定对象与来源

唯一实现 cwd：`/Users/mang/Project/nerv-ui-worktrees/t07-p11-snapshot-risk`。分支 `feat/t08-r19-photo-attachments`。初始 clean；base `0072c1cec946b05a5744ae95f54097d608c12ef9`，tree `7dcc5dd72a51f6e96b55964f5ddd2ce14c6551d9`。交付前 fetch 的 integration 仍是此 base，无 delta。最终 head/tree/clean 由提交后的外部 handoff 固定，避免自指 SHA。

T01 来源 `79b1578f2b75f55709765b5e7882aaf33146c603`。完整读 `migration/materials/source/frontend/apps/business-pda/src/pages/mes/components/ShiftHandoverPhotoCapture.vue` 与同名测试；读取 `pages/mes/handover.vue` import/308 组合、`handover.test.ts` 的照片进入 create payload 组合。只读 `api/shift-handover-upload.ts` 的必要交接、complete/offset 与错误边界及对应测试，不迁移业务 composable 结构、用途目录、SDK、tus 或 20 MB 策略。其它业务实现未读，不作全库结论。`source-bytes.json` 比对六个来源文件与 base 原字节，source/reference/provenance 零改。

来源行为保留：原生 accept/capture、选择后立即清 value、完整成功回执才入列、pending/error/移除。中性化：`ShiftHandoverAttachment` 换成宿主适配 `PhotoAttachment`；index 删除换稳定当前 key；领域错误解码换安全 errorMessage 与 diagnostic 分流。原来源的 index/竞态缺口不照搬。

现有公共 `FileUpload`、`useFileUpload` 与 types 已盘点：需要 organization/environment、owner、session/complete/transport；不为简单 callback 暴露复杂 DTO。移动 Button/Tag 直接复用；List/无限分页非此列表用途，Image 无需使用，未创建 objectURL。新 public 名 `NvPhotoAttachments` 按 R1→R2→R3→R3b 未命中、R4 自造组合名确定，A6 严格集合新增一项；barrel 实数 50（含子件）。六件套、导航、README 与主桶同步。

## Requirement coverage

测试均为公开主桶组件＋公开 DOM＋真实 File；files 注入只属于 jsdom 边界，不是 FileList、拍照或设备证据。

| 要求                                                                   | 精确测试名与证据                                                                                                                                     |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| environment/accept、同 File 重选、清 value、pending 禁重复、成功才入列 | `opens environment input and passes the same File again only after a valid receipt`；RED→GREEN                                                       |
| 无 callback、取消选择不假成功                                          | `does not invent success without callback or a selection`；RED→GREEN                                                                                 |
| 空/坏/缺身份回执不成功                                                 | `rejects malformed receipt %j without success`（5 cases）；RED→GREEN                                                                                 |
| 失败保留成功、安全文案/原异常诊断、重试                                | `preserves success on failure, hides diagnostics and retries`；RED→GREEN                                                                             |
| 重排、同名不同 key、父拒绝删除                                         | `removes current stable key after reorder and respects rejected controlled updates`；RED→GREEN                                                       |
| 禁用/来源/用途/callback/受控列表/accept/文案替换失效                   | `invalidates old success failure finally on %s change`（7 cases，实际此组提交 old success；失败/finally 由下两行单独覆盖）；RED→GREEN                |
| 请求取消、新请求、卸载、迟到 reject/finally                            | `cancellation and unmount abort signals; old rejection cannot clear a new pending request`；RED→GREEN                                                |
| 重复 key 无成功                                                        | `rejects duplicate receipt key`；RED→GREEN                                                                                                           |
| 同 key 新版本、清空、迟到错误                                          | `isolates in-place same-key versions, clear and stale rejection through a real controlled parent`；GREEN-only                                        |
| 父拒绝成功回执不能乐观入列                                             | `does not optimistically show a receipt rejected by the host`；GREEN-only                                                                            |
| 等值新空数组仍为新的受控归属                                           | `invalidates pending work when an equal empty controlled array is replaced`；GREEN-only                                                              |
| 两个中性 host、选择/失败/重试/移除/切换/安全说明/返回                  | `%s selects, fails, retries, removes and switches without saving claims`（library/studio）；GREEN-only                                               |
| 传输/限额/用途/complete 在 host                                        | PhotoUpload 只传 File、signal、purpose；两个 host callback 明确返回本页 receipt，检查类型和 5 MB；库无默认限额，无 SDK/auth/算法/private-path import |
| 名称/文档/旧路由                                                       | A6 六项＋文档覆盖两项；host 既有 MobileDemo/import hygiene 95 项；docs 及 build 单列                                                                 |

## Fresh 执行与限制

正式入口：`node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`，所有命令指定实际 cwd，未安装或升级依赖。具体 argv、cwd、独立 exit 与日志 SHA 见外部 `gates.json`、`handoff.md` 与 `SHA256SUMS`。

保留历史尝试：`red.log` 是测试初次放错相对路径的导入 FAIL；纠正位置后的 `red-public.log` 为缺失公开组件的 18 项 RED（exit 1）。`green-first.log` 为测试辅助默认参数误用导致 17/18，exit 1；`mobile-types.log` 为测试 get().exists 的类型 FAIL，exit 2；`mobile-final.log` 为 VTU 对 disabled input 不派发事件，26/28，exit 1。改用原生 dispatchEvent 验证 handler 的 guard，未以延迟输入绕过竞态。首次 docs-links 在 evidence 页创建前失败，保留记录；后续逐条校验。

最终局部门禁结果以外部 handoff 为准；测试报告缺 `numRuntimeErrorTestSuites` / `unhandledErrors` 字段，均 UNKNOWN，不能用绿灯补成零。jsdom 有 `Could not parse CSS stylesheet` 诊断，不将其当浏览器样式验证。policy4vendor0 未执行，不计 PASS。

继承证据：无继承 PASS 作为本票签字。浏览器/文档 live 运行、真实相机、物理设备均 UNRUN（用户禁止 server/preview/Ego/Playwright/替代 browser）；CI、packed、旧 consumer、production、许可审查均 UNRUN；既有许可状态不变。原应用接入/旧库退出 NOT_PLANNED。整票不签设备或浏览器验收，PR Draft，Issue Open。

外部归档：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/t08-r19-implementation-r1/handoff.md`。仅小型日志、JSON、脚本与 SHA；不含 dist/node_modules/cache/full checkout 或历史 raw 大桶。

最终 fresh：移动组件 21 项＋命名/文档合同 8 项 = 29/29；两 host＋既有 MobileDemo/import hygiene = 97/97；文档合同 7/7；路由 11/11；ui-mobile 与 playground typecheck、playground build、scoped fmt/lint 均 exit 0。这些是局部执行结果，runtime/unhandled UNKNOWN 仍保留。新增路由回归 `routes photo deep links and returns to the mobile entry without losing existing routes` 为 GREEN-only，单列 routes.log。根 Markdown 使用 oxfmt stdin，exit 0、输出非空且再次格式化 byte-cmp 相等。
