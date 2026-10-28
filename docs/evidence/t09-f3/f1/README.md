# F3 通知真实身份返修

独立 R1 真实最终 dist 确认：首次发送显式 id:undefined，经 vue-sonner@2.0.9 外层与 Observer 两次分配造成返回ID与实际通知不同，关闭失效且重复发送生成两条。原P1、截图及producer摘录保留于外部 t09-f3-acceptance-merger-r1，不以旧67绿灯覆盖。

仅 AppProviderExample 首次 options 省略 id 字段，后续复用真实返回ID；不改库、依赖、Toaster或公共API。

Requirement coverage：`uses the real notification identity for first close repeat update and unmount without dismissing another owner` 使用真实 toast.getToasts 核首次关闭后无本例通知、重复发送只有同一个ID、卸载清理、本例操作不关另一owner。旧实现定向1PASS/1FAIL；修后完整67PASS。替换旧仅比较dismiss参数的弱断言，不将spy相等当实际关闭证据。

真实依赖入口 lib/index.js 已核；原始RED/GREEN与types/build/scoped门禁见外部 t09-f3-toast-id-fix/handoff.md。真实通知DOM消失、重复无倍增和剩余Tooltip延迟/键盘/暗色矩阵留独立R2，不以getToasts测试自签浏览器。

缺runtime/unhandled数保持UNKNOWN；历史FAIL/globalfmt/RAW2/TZtimeout保留。CI/packed/device/production仍UNRUN，授权UNKNOWN，旧四应用接入退出NOT_PLANNED。
