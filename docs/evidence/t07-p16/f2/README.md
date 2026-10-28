# P16 运行 R1 返修：窄屏视图导航

独立运行 R1 确认三个视图 tab 与图例同排时，375px 图例右部裁切，320px 整个按钮移出可点击范围。页面没有横向滚动，不能通过滚动找回按钮。原 FAIL、实际截图与 rect/命中证据留在仓外 `2026-10-29/t07-p16-runtime-r1/`。

本次仅允许 Workbench tabs/图例组合行 flex-wrap。空间不足时图例换行，保留三个 tab 与按钮本身、宽屏排列、全部 API 和交互，不修改 primitive 或隐藏溢出。此布局变化由独立运行席在 320/375/390 及宽屏验证视觉、真实点击与键盘可达；不添加只检查类名的镜像测试，不以 jsdom 结果证明布局 GREEN。

组件两文件 28/28 用于行为回归；当前构建、类型及 scoped 检查见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t07-p16-tabs-wrap-fix/handoff.md`。真实修复后的窄屏 GREEN 尚待独立复验。运行 R1 已通过的 13 入口、历史过滤分页、快照隔离和实际 CSV 下载按未受影响输入有界继承；剩余异步、键盘及 native 组合仍待补验，不宣称整票通过。

历史 FAIL、runtime/unhandled UNKNOWN、Evaluation 授权 UNKNOWN 及 CI/packed/device/APS/生产 UNRUN 保留；旧应用接入与旧库退出 NOT_PLANNED。
