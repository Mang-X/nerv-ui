# T07/P13 PR111 R1 返修证据

本轮只处理 [#96](https://github.com/Mang-X/nerv-ui/issues/96) 的中性 host 异步生命周期及同 owner 的预览文案。起点 `251c120577c5300d92dced91e0b083c99d7f4e00` / tree `ca52f1d8337a2c93dd878b61d12ecd001e53bd82`，base `62a3a62ad57b3fb3bd2309e9966d4e2554f67f61` / tree `d510380fb5a2ba7a271e7567c3c2473817c5e938`。四个公开件的受控合同、P11/P12、vendor、锁文件、冻结源与原消费者不在本轮改动面。

## R1 finding 到公开行为

| R1                                                     | 处理与公开测试                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standards P1 / Spec P1：同实例来源变化留下 created job | 来源边沿同步 abort 并清除旧 job、候选、保存状态，使新来源能启动；`same host instance invalidates a created job on source change and accepts a new request`，两个来源的 `source and readonly edges keep ... outside the next request`。                                                                                                                            |
| Spec P1：旧保存确认误报当前页已保存                    | 保存操作捕获 context、request、plan、job、candidate 与操作对象；迟到确认、失败、finally 均核归属；`old save confirmation after source change cannot affect a new save operation`、`a late save failure after changing plans cannot replace the new request state`、`replacing a job while save waits prevents its late confirmation from selecting the new job`。 |
| Spec P2：进入只读不取消在途请求                        | 进入只读撤销进行中的 job 和保存；已完成结果仍可查看，恢复后能启动或重试；`readonly transition cancels a pending result and recovery can start again`、`readonly keeps an already completed result but cancels its pending save`。                                                                                                                                 |
| 非 material：完成但无匹配结果写“预览完成”              | 显示“结果待核对”及原核对提示；`completed insertion without a matching result asks for review instead of claiming preview completion`。                                                                                                                                                                                                                            |

R1 原始公开探针 `public-probe-1.ts` 未改断言：返修前 3/3 RED (`red-original-probe-1.log`)，返修后 3/3 GREEN (`green-original-probe-1.log`)。正式 host 测试先 4 RED/7 PASS (`red-publichost-1.log`)，随后通过；预览文案先 1 RED (`red-preview-copy-1.log`)，后公开组件测试 9/9 PASS (`green-preview-public-1.log`)。测试经 `mount`、同实例 `setProps`、可见按钮和文本检查；`previousSave`/`previousRequest` 仅供可手动推进的内存来源模拟不合作的迟到回调，非 APS 接口或库 API。所有日志位于外部 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t07-p13-context-fix/`，保留各次失败与工具结果。

## 门禁和证据边界

- fresh `TZ=Asia/Shanghai pnpm -C frontend test` exit 0：ui 805、scheduling 325、ui-mobile 144、playground 347，合计 1621 PASS；另有 4 项既有 vendor/stub policy skip。默认 reporter 无 JSON `unhandled` 字段，记字段缺失；`Could not parse CSS stylesheet` 独列警告。
- fresh `pnpm -C frontend build` exit 0，含四 workspace `vue-tsc`；独立 scheduling host `vue-tsc` exit 0；`pnpm -C frontend lint` exit 0，保留已有 warning。构建的 `INVALID_ANNOTATION` 与大 chunk 警告另列。
- 本票从 base 到当前的 21 个 `.vue/.ts/.json/.md` 文件（含本页）独立 fmt PASS；5 份维护 Markdown 的 47 个相对链接均存在。全局 `pnpm -C frontend fmt` exit 1，仍仅为四个未改且与 base blob 相同的旧文件；不顺修。
- dist 浏览器的读书会正常保存待确认→确认，工作坊第 2 页真实 total=11、ETR 到期/恢复、stop、只读理由可见。另用临时 Vue 宿主经公开 `venue` prop 同实例切换，证实来源切换清旧 job、旧结果/保存晚到不覆新操作、只读取消与恢复；探针 HTML 已删除，未写入 PR。浏览器原始日志和可读截图在外部 `t07-p13-context-fix/`。
- fresh dist 实际加载的导航、JS、CSS、字体和 DHTMLX JS/CSS 共 7 个同源 URL，HTTP 200、MIME 正确，body 与该次 dist 对应文件逐字节相同，见外部 `http-dist-byte-compare-1.json`。T3 preview 同一步两次原文 `Preview automation snapshot timed out after 15000ms.`，随后按规则使用 ego-browser；自有 TaskSpace 已结束，服务 PID 已停止。

本轮精确 head/tree/clean、证据文件 SHA 和未运行车道见外部 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t07-p13-context-fix/handoff.md`。本地 fixture、浏览器和真实 APS 分列；政策跳过的 vendor 测试不当成 real vendor PASS。继承的旧 `DraftEditingDemo.test` 默认 5 秒 timeout FAIL、全局 fmt 四个未改 base 同 blob FAIL、历史 main RAW diff exit 2/3570 行与维护 0 均保留，不因后续 PASS 重标。CI、docs #10、packed #11、device、旧 consumer #13/#15、父 #8、真实 APS、生产和原生 zoom 均 UNRUN；商业授权 UNKNOWN。
