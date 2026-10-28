# R10 R1 返修：Dialog 实例成组层叠

仅 #28 / PR136。base `0072c1cec946b05a5744ae95f54097d608c12ef9`；R1 受审 head `4fd97bd6e36305328075dcfd5b1625445cd4611b`。原 Spec P2：所有 mask z60、content z61，多个实例直接挂 body，较晚实例的遮罩不能盖住较早内容。原 R1 诊断与 DOM 归档保留。

## Requirement coverage

`Dialog_GroupsEachMaskAndContentByActualOpeningOrderAndRemovesClosedLayers`：旧实现 7 PASS / 1 FAIL，修后整份 8 PASS。先创建甲再创建乙，但先打开乙再打开甲；分别为长、短内容。断言每层直属 body、各自恰有一个遮罩和内容，打开顺序为乙→甲；关闭甲只留乙、重开甲回到最上层、关闭较早层不影响较晚层，最终无关闭层残留。

实现：只在 open 时创建 DialogPortal，每实例用 fixed/inset0/z60/isolation:isolate 的 wrapper 成组；层内 mask0、content1。portal 随打开创建，避免关闭状态占位或按组件创建顺序锁死 portal 层序。外框不加 transform，内容仍用 viewport CSS px；mask/Esc、焦点和受控 open 继续由真实 Reka 管理，不引入全局层序框架或手写 Esc。拒绝关闭、焦点进入/返回和双实例 Esc 的原正式回归仍通过。

Optional：宿主说明及文档 live 文案改为“示例观察记录”，不再向使用者显示“内存／本宿主”等实现术语。仍明确示例不自动更新，不声称接入真实数据。

## 证据边界

这是结构回归，不是像素层叠或命中认证。R1 原 probe 是确认旧缺陷的诊断（断言四节点直接挂 body），并写入原 R1 固定路径；本轮没有重跑它覆盖旧归档，也没有改其断言来伪装修后 PASS。新的正向回归与静态 stacking-context 规则共同核对，真实浏览器仍需验遮罩绘制、不同尺寸/缩放/命中。

完整 argv/cwd/独立 exit、RED/GREEN JSON、fresh 最终门禁及 SHA 回读在 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/t08-r10-layer-fix/`。使用 pnpm11.22.0，无安装/依赖升级；Parameter/Sparkline、原素材和其它候选未改。runtime/unhandled 结构化字段缺失保持 UNKNOWN，CSS 解析与构建 warning 原样保留。历史失败和 R1 拒绝不由新 PASS 擦除。

UNRUN：browser、真实缩放/portal/层叠/焦点/命中/视觉、HTTP、CI、packed、device、旧 consumer、production。旧应用接入/旧库退出 NOT_PLANNED，排程最后。PR 仍 Draft、#28 Open，交独立 R2；不 ready/merge/close/watch，不签整票。
