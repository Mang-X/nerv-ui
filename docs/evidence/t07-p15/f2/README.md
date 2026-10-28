# P15 运行 R2 返修：根网格收缩

独立运行 R2 在真实 vendor 从 1440/1280 缩到 390 后确认页面宽仍为 1420，计划明细按钮落在屏外。单变量诊断证明隐式 auto 网格列被图表最小内容宽度撑开。原 FAIL 和诊断截图保留于仓外 `2026-10-29/t07-p15-runtime-r2/`；诊断临时样式不算正式候选通过。

本次仅为组合根 grid 增加 `grid-cols-1`，生成 `minmax(0, 1fr)`，约束列宽并保留时间轴内部滚动；不隐藏 body 溢出、不改 vendor 或引擎。无 API、事件或业务逻辑变化。

公开 14 项回归用于确认组合行为未改变，不证明 CSS 实际布局；不添加只检查类名的同义测试。持续 resize、页面无横溢、明细按钮可达及资源图局部滚动须由独立运行席在新候选上复验，尚未声明 GREEN。其余未完成 AC 与真实竞态、双实例清理边界仍保留，不据本次窄修宣布整票通过。

最终命令与固定对象记录于 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t07-p15-grid-fix/handoff.md`。历史 FAIL、缺失 runtime/unhandled 数字 UNKNOWN、vendor 授权 UNKNOWN 和 CI/packed/设备/APS/生产 UNRUN 均不改写。
