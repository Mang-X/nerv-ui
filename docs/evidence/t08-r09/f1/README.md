# R09 R1 样式返修

仅 #27 / PR135，base `0072c1cec946b05a5744ae95f54097d608c12ef9`；R1 受审 head `3f26af2f216c8b8bfd6f87b9bae85f823811119f`。原 Standards 两项 P2（局部字号、缺少按压反馈）与 optional P3（命名依据说明）全部保留原审查记录。

## Requirement coverage

- S1：删除 StatusWall 四处 scoped `font-size`，根节点使用统一 `text-sm`；分组数量也显式使用 `text-sm`，避免 small 的浏览器默认缩小。标题、身份、摘要继承统一尺度；不改六列、122px 行高和12px间隔。
- S2：三个模式的 enabled button 共用 `:active:not(:disabled)`、`scale(0.985)`；未引入位移、过渡或新缓动。`prefers-reduced-motion: reduce` 中取消该 transform。禁用按钮不获得此反馈。
- P3：命名 map 将伪 R1–R4 判据改为真实 R5 Status 家族；去 Device 领域词仅作为适配说明。最终公开名称、barrel 和42件计数未变。

这是明确样式规则的窄修，不新增镜像 CSS 字符串的形式测试，不伪造行为 RED。原行为 RED/FAIL、R1 来源8/8及独立probe证据保留。真实字体、按压、低动效与远距可读性均仍需浏览器验收；本轮只静态核对规则和构建，不将 DOM 通过当作视觉通过。

## 验证边界

原公开行为用例仍运行：`bounds flat DOM with real virtual rows and reaches both ends at the rendered stride`、`preserves identity selection zero unknown groups and closes preview for scroll replacement mode and disabled hover`、`invalidates same key new content and isolates two instances and unmount`、`keeps group namespaces separate and updates keyed content through reorder deletion and short flat replacement`。宿主两用例继续验证当前异步预览归属。完整计数、命令 argv/cwd/独立 exit、script 同字节证明见外部 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/t08-r09-standards-fix/`；脚本同字节只支持继承范围，不等于重新运行全部历史证据。

正式命令使用 pnpm11.22.0；未改测试断言、依赖、lock、source/reference、其他候选或排程。runtime/unhandled 报告字段缺失仍 UNKNOWN，CSS 解析及第三方构建 warning 保留。全段 raw diff-check 因已有原始日志空白仍 FAIL，当前返修与限定源码检查分列，不清洗原日志。

UNRUN：浏览器、真实 resize/几何/命中/字体/低动效/按压视觉、HTTP、CI、packed、设备、旧消费者、生产。旧应用接入/旧库退出 NOT_PLANNED，#28/排程未推进。PR 保持 Draft、#27 Open，交独立 R2，不 ready/merge/close/watch，不签整票完成。
