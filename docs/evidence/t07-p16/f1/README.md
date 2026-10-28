# P16 R1 返修：读取期间取消操作

独立 R1 的 Spec P2 是 Workbench loading 后旧预览仍可写入显示模型。组合现在同步监听 loading 并调用既有 cancel，同时清选中；读取期间图面、锁定、拖动、撤销重做、重预览、发布及待排操作不能提交。没有重写 useSchedulingEdits 或引擎。恢复 ready 可重试，旧 success/error/finally 不得改写新的等待或模型。

Requirement coverage：`loading cancels old preview receipts and blocks edits until ready retry` 与对应 release 测试先 8 PASS/2 FAIL，再 10/10 PASS。断言覆盖 signal abort、读取期间拒绝新动作、ready 重试、旧失败不清新 busy、当前完成及旧成功不写入模型。

Optional 加固：确认和下载只接受 boolean true；`accepts only boolean true for the confirm receipt` 与 download 由 16 PASS/2 FAIL 转为 PASS。对非法对象不提示成功；合法 true 重试仍通过。示例按钮改用“暂停处理”“查看最新安排”“刷新历史记录”，保留原操作能力。

最终组件两文件 28/28、宿主三项 3/3、R1 原字节探针 22/22。一次探针临时放错相对目录造成加载失败（0 执行）；改放正确 components 目录后才得到 22/22，不改探针断言，失败原件保留。图子件 stub 与真实 vendor/native 分列，不能以本次 DOM 结果签浏览器。

四包类型与 playground build、受影响 lint/fmt、文档格式及增量 diff-check 通过。运行期间一次补跑临时探针与构建发生重叠；未用此事声明串行完整执行，后续不再并行重型命令。原始构建和全部测试结果分别保留。JSON 缺 runtime/unhandled 数字，UNKNOWN。

原 R1 FAIL、历史 RAW2/global fmt/docs alias 等仍留原归档；CI、packed、真实 vendor/native、浏览器、设备、APS 和生产仍 UNRUN。详情与命令见仓外 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t07-p16-loading-fix/handoff.md`。独立 R2 与运行验收尚未执行，不宣布整票通过。
