# T09/E 日安排文档根打印画布

独立 R3 的深色 A4 与 compact PDF 确认：正文白底，但四周纸张背景 RGB(18,18,18)。原 PDF、逐页 PNG、参数及 FAIL 保留于外部 t09-e-print-output-r3，不由后续通过覆盖。

只在 DayPrintExample 文档宿主增加 print media 规则：html 存在 body[data-nv-day-print-owner] 时，根画布使用现有 --nv-print-paper，根与该 body 的 color-scheme 为 light。规则位于 nv-components 层，不改公共 producer、主题 token 或全站 Demo。无 owner 时与 screen media 均不生效；无需把主题偏好改成浅色，owner 清理后自动撤销匹配。

有效 RED 为独立真实 PDF，不增加仅镜像 CSS 字符串的测试。既有61合同、docs types/build、scoped lint/fmt 与维护 diff-check 的实际结果见外部 t09-e-paper-canvas-fix/handoff.md；独立 R4 将核新 PDF 四边、目标隔离/分页和清理后的深色屏幕。作者不以本地测试声明纸张 GREEN。

原导航 P1 已由 R2 真实复验闭合，R3 末列可达及正文隔离通过，有界继承而非本轮 fresh。原生打印 UI/OS 事件/实纸、CI/packed/device/APS/production 各 UNRUN；缺 runtime/unhandled 数字 UNKNOWN，历史 FAIL 与授权 UNKNOWN 保留。旧四应用接入退出 NOT_PLANNED。
