# P15 R1 返修：计划明细导航归属

独立 R1 指出组合模板每次重渲染生成新 callback，使 Link 把同一计划的摘要更新误当成上下文变化。现在用 computed 捕获当前 planId 与宿主 callback；两者不变时适配函数保持同一身份，真正替换时继续撤销旧回执。Link 协议、引擎、输入模型与宿主 API 未改。两处标题按 foundation 改为 text-sm。

公开回归 `plan detail stays pending through summary facts and sidebar updates and retains its current failure` 修复前 FAIL，修复后 PASS，核实摘要、活动事实和侧栏重渲染保持等待、防重复及当前失败提示。`plan detail discards prior receipts when the plan or host callback really changes` 核实换计划和 callback 后旧失败不落入当前界面，下一次请求使用当前计划。

最终公开文件 14/14，R1 原字节确认探针 2/2；合计 16/16，exit 0。图板仍为明确 stub，本证据不代表真实 vendor/native。原 RED 为 13 PASS/1 FAIL，独立 R1 的全部 FAIL 原件保留。报告无 runtime/unhandled 数字，保持 UNKNOWN。

命令采用 pnpm 11.22.0、TZ=Asia/Shanghai，包内 `exec vp test run src/components/saved-plan/SavedPlan.public.test.ts src/components/saved-plan/ReviewIndependent.test.ts`。临时探针运行后移出 checkout。完整日志、固定对象及门禁结果见仓外 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t07-p15-navigation-fix/`。

此前整桶、host、来源与锁/vendor 不变结论仅有界继承原交接；本次不重复全桶。真实浏览器、vendor/native、CI、packed、设备、APS 与生产仍 UNRUN。旧应用接入/旧库退出为 NOT_PLANNED。独立 R2 尚未执行，不能宣布整票通过。
