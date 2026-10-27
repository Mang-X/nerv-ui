# T07/P14 PR113 R1 material 返修

本轮只处理 [#97](https://github.com/Mang-X/nerv-ui/issues/97) 的 day/print owner 三项 material；候选仍为 draft PR113，交独立 R2。起点 `67f0a9a1e4420c38e31a867bca3249a9343d03d3` / tree `0b5100c4a3cfa33c053aa6219b4a3e286f97070d`，开工 clean。最终 head/tree、原始日志和截图索引见外部 `t07-p14-print-boundaries-fix/handoff.md`。[公共合同](../../../scheduling-day-print.md)已同步。

| R1 finding                                  | 返修与公开证据                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standards P2：print media 未分层、直接色值  | 规则收进 `@layer nv-components`；纸张、文字和分隔线从主题语义 token 取值。真实 Chromium CSSOM 显示目标显示规则位于 `nv-components`；深浅主题 print media 均为浅纸深字，目标外 `#app=none`、单目标 `block`、`thead=table-header-group`、目标按钮 0。截图按实际宽度目视，宿主覆盖 `--nv-print-ink` 后计算色随之变化。       |
| Spec P2：非法日期/时区误报空安排            | `entriesOnDay` 未解析返回 `undefined`，Schedule 显示未解析提示且不生成 Sheet/打印目标；有效日期真正无记录才显示空安排。独立 Sheet 的 `entries=[]` 空态不变。`invalid calendar date`、`missing timezone`、`unknown IANA timezone` 三组非空 entries 公开 RED 后 GREEN，并验证恢复、真正空态与输入不变。                     |
| Spec P2：打印中纸面输入和只读替换未清 owner | 同步深层 watch 覆盖日期、group、zone、entries、标题、计划/状态、只读及理由；cleanup 立即撤销本实例目标 active 标记、owner、监听器和 timer。公开替换矩阵、响应式条目深改、权限恢复再打印及第二 owner 边界通过；Chromium 复现 `readOnly=true` 后 owner/目标归零，并核 afterprint、entries/date 替换、取消聚焦、异常、卸载。 |

公开 `DaySchedule.public.test.ts` 首轮 9 FAIL/12 PASS（其中 1 项是前面失败造成的 Teleport 连带错误），原始 `red-public-1.log` 保留；最终 25/25，`public-final-1.log`，另核宿主原 body class 保留。不把历史最初缺导出的 RED 改称本轮 raw。jsdom `Could not parse CSS stylesheet` 警告独列，真实 CSS 层和纸面颜色以 Chromium 计算样式与截图验证。

本轮先运行无 `TZ` 默认全量：UI 805 PASS，scheduling 1 FAIL（既有 snapshot 用例要求 `Asia/Shanghai` 或 `America/New_York`，当前 `TZ` 未设置）；原始 `full-test-1.log` 保留。最终 `TZ=Asia/Shanghai` 根默认全量退出 0：UI 805、scheduling 374 PASS/4 policy-skipped、ui-mobile 144、playground 354。一次误用递归 `vp run -r test` 在根全量完成后又开始重复包套件，已中断，保留退出 130 日志；最终使用 `vp run -w test` 只执行根脚本。4 skip 不代表真实 vendor PASS。默认 reporter 未给 `unhandled` 字段，记字段缺失。此前 `DraftEditingDemo` 5s timeout 历史 FAIL 未抹除。

`build`（含四包 typecheck）、独立 scheduling typecheck、带新增全部纸面 props 的纯类型 consumer `vue-tsc`、host `DayPrintDemo.test.ts` 1/1、`vp lint .` 退出 0；构建的 Rolldown annotation/chunk warning 与 lint 其它路径 warning 保留。真实浏览器 library 宽屏深浅、studio 390px 窄屏、返回首页与打印生命周期已核；打印中 3 个监听器和 300000ms timer 在 afterprint/卸载清理后均为 0。最后实际加载 5 个 HTTP URL 的 status/MIME/body 长度/SHA-256 与 fresh dist 逐字节相等。打印拦截 `window.print` 仅避开 OS 对话框；print media、fake callback、旧 PDF、OS 纸张不是同一证据。

完整 lock YAML 对象和依赖/peer/optional 边与固定 base 相同（5 importers、973 packages、973 snapshots）；16 个工程输入、四包 Vue 3.5.39 同 realpath、三份 DHTMLX 9.1.4 Evaluation vendor 原字节也核对相同。授权范围 **UNKNOWN**。本轮没有安装、升级、改 vendor、改冻结 migration 或旧仓。全局 fmt 旧四文件和历史 main raw diff 状态见外部 handoff；本票 scoped fmt、Markdown 与相对链接单列。

R1 的 optional 演示文案留给独立评审判断，本轮未处理。CI、完整 docs #10、packed #11、device、旧消费者 #13/#15、父 #8 组合、真实 APS/后端、生产、原生 zoom、OS 打印/纸张均 **UNRUN**。没有自审、ready、merge、关票、watch 或后继票。
