# T08/R16 · PR115 R2 空态长文案返修

对象为 #34 的 draft PR115，输入 head `8df6ae5844b1a50f97e1627f385ef77448424f5f` / tree `4d6cc798b89863365f301213d9e0cdd1dad08150`；base `f01b079c1ef333141a08247758c39593f2bd32aa` / tree `7d093f7e78c162577c2581e9f68ff7be5e470597`。R2 Standards 1 / Spec 1 是同一 P2：显式 `empty/count=0` 的长 `emptyHint` 被 `line-clamp-2` 永久截断。本轮只移除这处钳制，并在 playground 与目标文档页留下可滚动的中性长文案实例；没有增加 API、修改 `NvCard` 或提高 19rem 卡高。

## 公开行为 RED → GREEN

- RED：375×820 的 fresh dist、`state='empty'`、`count=0`、三行以上 `emptyHint`，卡高 304px，hint `scrollHeight=96/clientHeight=48`、`-webkit-line-clamp=2`，内容区 `scrollHeight=clientHeight=174`，末句不可取回。浏览器脚本按预期 exit 1；截图和原始读数见外部 handoff。
- GREEN：同一公共状态改用更长的阅读说明，使卡内必须滚动。375px playground 卡 343×304px，hint `216/216`、内容区 `272/174`、滚动 `98px`；末句 bottom `851.5`、内容区及 CTA top `871`，全文可读。底部 action 的鼠标与 Enter 各触发一次宿主事件。目标 VitePress live 页在 375px 卡 277×304px，hint `264/264`、内容区 `320/150`、滚动 `170px`；末句 bottom `497.68`、内容区及 CTA top `517.18`，同样可读，两种输入各触发一次 action。1280px 的浅色文档页与深色 playground 也目视核对卡高 304px、末句和出口。
- 首次移除钳制后的检查仍以仅 96px 的文案强制要求滚动，实际全文已经放得下，脚本 exit 1；这是断言前提不足，不是代码回退。延长公开实例后滚动合同通过。文档页首次移动截图赶上侧栏响应式过渡，遮住卡片；等待侧栏退出后重新截图并读回，早期遮挡截图未用作通过证据。

## 同类文案与门禁

- `pending` 是骨架，没有状态标题或说明；`error` 的标题、说明在内部滚动区且没有 clamp，retry 留在独立出口；`unavailable` 的标题、说明以及 `empty` 的标题、说明都在外层可滚动内容区且没有 clamp；`data` 的预览主副行允许 ellipsis，零预览仅显示中性占位。头部 `title` 单行截断、`description` 两行钳制、底部 `actionLabel` 单行截断是固定卡既有紧凑展示，三者没有状态全文承诺；action 的完整标签仍是 `aria-label`。本轮不扩展任意文本布局框架。
- 375px playground 五态均保持 304px 高；`error` retry bottom `543`、CTA top `551`，间隔 8px。目标文档页错误态 retry bottom `509.18`、CTA top `517.18`，间隔 8px；retry 与 action 均以鼠标和 Enter 各触发一次。R1 的 `data/count=3/items=[]` 与 R02 静态严格命名合同由下列聚焦测试保留。
- `packages/ui` 聚焦 5 文件 263/263、exit 0；`apps/playground` 聚焦 2 文件 68/68、exit 0。两处 `vue-tsc --noEmit` 各 exit 0；playground `vp build` exit 0（5623 modules）；本轮三个前端改动文件 scoped fmt、两件 Vue scoped lint、`git diff --check` 均 exit 0。Vitest 仍打印 `Could not parse CSS stylesheet`；构建的 crypto externalized、Rolldown annotation 与大 chunk 提示保留。CLI 未产 JSON reporter，unhandled-error/report 字段**缺失**。
- 最终 fresh dist 的 HTTP 200 `index.html`、主 JS `index-RnqUY1Ie.js`、主 CSS `index-BG84VMuW.css` 与磁盘逐字节相同，SHA-256 依次为 `2e5044a08cbc38bd83b82f8fbccf559feb82de332532a6e1b3e14f24978925fd`、`1c5239720ce8bf9c61066c4d03f12637615ccf6010152560555b38c540c5a263`、`2c3307d6d8b83f8a9a737de857cf28c760192710e536b8e38b5a4da1531fe2cb`。身份仅覆盖这三个响应。目标文档页 dev 运行不等于全站 build/typecheck。

R1 原 P2、旧 246/247 FAIL、实施轮设计站 typecheck exit 2、base 全局 fmt 三个同 blob FAIL、main raw diff 两项仍是历史事实；R02 新严格合同 247/247 包含于上述 263/263。设计站全站 build/typecheck、CI、全仓门禁、真实 vendor、packed/legacy consumer、设备、父 #9 组合、生产均 **UNRUN**；既有 `@nerv-iip/ui/schedule-model` alias ENOTDIR 属 #10，不在本票修。四条 vendor policy skip 为零执行，第三方授权 **UNKNOWN**；#12–#16 旧应用接入/退出已 NOT_PLANNED。

浏览器首选 T3 preview 的同一 snapshot 步骤两次返回 `Preview automation snapshot timed out after 15000ms.`，随后按运行规则用 ego-browser；截图与精确命令/身份见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t08-r16-empty-overflow-fix/handoff.md`。PR115 保持 draft/open，交独立 R3；未自审、ready、merge、close、watch 或启动后继。
