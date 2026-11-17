# T09-B R2 返修：保存/清空模式选项

独立 R2 在完整构建后的页面复现两个空 select，真实鼠标/键盘和重载均无法选 false 等模式。旧 jsdom 合同 19/19 仍通过；生产产物将两组各 5 项 options 编为 static HTML fragment，是定位线索而非已证明的底层根因。原生产 FAIL、DOM、截图和编译片段留在 `2026-10-29/t09-b-review-runtime-r2/`，不将其归咎为 scheduling 生产包缺陷。

本次只把这两个示例控件改为显式数据集合与 keyed v-for option，使当前构建链按节点生成选项，不升级 Vue/VitePress、不改库或全站编译配置。保留原五种保存/五种清空的值、文字和回调语义。

新增 `offers five named save and clear modes that remain selectable` 断言两组五项非空文字、完整值集合及逐项选择。A6+B14 共 20/20，保留原 failure/retry/延迟取消等行为断言。本 DOM 测试也不能单独复现旧生产 static fragment 故障，不冒称新的单位测试 RED；真实 RED 来自 R2，修复后的生产 DOM/真实选择仍待独立 R3。

types、完整 build、scoped lint/fmt 与命令原件见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-b-mode-options-fix/handoff.md`。不重跑或冒称已完成 R2 停止的真实清空对话框/pending/native或全部B矩阵。历史 FAIL/UNKNOWN/独立 UNRUN 边界与 Evaluation 授权 UNKNOWN 保留，父 #10 C–H 后续不提前验收。
