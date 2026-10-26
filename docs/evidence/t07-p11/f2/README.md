# P11 / PR109 R2 批次技术值排版返修（F2）

范围仅为 #94 的 R2 新增 Standards P3：`MaterialShortageSummary` 由 legacy `materialLotId` 得到的可见批次编号须用 `font-mono text-xs text-muted-foreground`。固定 base `c0f6e41421da5aaeb38e07474413a06b78c2ea0c` / tree `d914c0d1668d786ff587ded0f0af89428b862b42`；开工 HEAD `26cecd0087143d439b30a5b0eb453ec1104530f6` / tree `8466915915ac5054223ce051e01d7c22a98ba1d2`，clean。最终对象和外部回读见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t07-p11-batch-type-fix/handoff.md`，避免在提交中自引用 SHA。

## 修复与公开回归

`snapshot.ts` 已将 legacy `materialLotId` 原样映为 `batch`。本轮只在 `display` 未提供、且 legacy 批次有值时给可见批次行技术值类；显式 `display.batch` 可为宿主自然语言标签，不根据其字面形状猜测技术码。`批次 LOT-9`、`批次 秋日一批`、数量、单位、影响活动、props、事件及输入均未改写。

| 需求                          | 精确测试与本轮结果                                                                                                                                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| legacy `LOT-9` 技术值字体     | R2 原字节 `uses technical value typography for a visible legacy batch code`：返修前 0/1 FAIL，返修后 1/1 PASS；原 probe 仅临时复制运行后移除，原 R2 FAIL 仍在 `t07-p11-review-r2/technical-value-probe.json`。                                      |
| legacy 样式与宿主自然语言边界 | 正式公开测试 `styles a legacy lot code as a technical value without recasting a host batch label`：先 RED，修后所在 `snapshot.test.ts` 14/14 PASS；`display` 替换后“秋日一批”不被统一套等宽/小号。正式 RED 的另外 13 项是筛选未运行，不表述为失败。 |
| 原展示与展开                  | 既有 `keeps batch units and every affected activity behind two disclosure levels without inventing missing counts` 随同文件 14/14 PASS；真实浏览器另核。                                                                                            |

本轮 JSON 在外部 `t07-p11-batch-type-fix/`：`technical-red/green.json`、`formal-red/green.json`。命令 exit 分别 1/0/1/0；Vitest JSON 均**缺少** `unhandledErrors` 字段，不能填作 0 或 null。测试控制台另有 `Could not parse CSS stylesheet` 提示，测试 JSON、退出码与实际浏览器分别核对，不把此提示隐去。

## 浏览器、HTTP 与门禁

- T3 preview status/open 后，同一步 snapshot 两次原文均为 `Preview automation snapshot timed out after 15000ms.`；按浏览器规则转 ego-browser。工具超时不计产品 FAIL。
- 因既有中性 demo 不含 `LOT-9`，临时公开消费页直接从 `@nerv-iip/scheduling` 主桶渲染 legacy `shortages` 与宿主 `display`，随后移除。真实 Chromium 中 `批次 LOT-9` 计算字体为 monospace、12px；`批次 秋日一批` 为原 sans、14px。展开看到 `ORDER-7 · OP-2`、`3 张`；390 CSS px 无文档横向溢出。[临时消费页 390px](browser-legacy-390.png)。既有 library 深链展开仍显示 `3 张 / 20 本 / 100 枚 / 0 支 / — 盒` 与“晨间共读”等两项活动，390 CSS px 无文档横向溢出。外部 `browser-legacy-390.json`、`browser-library-390.json` 保留逐项观测；临时页面和脚本不在候选树。
- playground fresh `vp build` exit 0，构建原有依赖提示见外部 `playground-build.log`。对最终 fresh dist 的 HTML、主 JS、runtime JS、主 CSS 实际 GET 均 200，MIME 为 HTML/JS/JS/CSS，四份 body 与各自 dist 文件逐字节相同；路径、大小、SHA-256 及响应体在外部 `http/`。这只支持当前源码宿主与对应 dist，不等于 packed 或旧消费者。
- scheduling 定向公开测试、两包 `vue-tsc --noEmit -p tsconfig.json`、目标两源码 `vp fmt --check` 和 `vp lint` 均 exit 0。未无故重跑 scheduling/playground 全矩阵；R2 的 300 pass / 4 vendor stub skip 与 323 pass 是**继承证据**，4 skip 为 0 执行。本轮临时原 probe 与正式测试计数见上表。

## 边界和历史

锁 base/候选同 blob `8db34ddd72b1df0c29f0a029f9184643becc60da`，fresh 解析 5 importers / 973 packages / 973 snapshots；两宿主 Vue realpath 同一 `vue@3.5.39_typescript@6.0.3`。R1 的 16 个工程输入逐项核对属继承，本轮受影响 diff 不含 package/lock/vite/tsconfig。冻结 migration、DHTMLX 9.1.4 Evaluation JS/CSS、水印及版权未改，商业授权 UNKNOWN；`review-r1/artifacts/dist-nested` 不还原或删除。

R1 三项 Standards 与一项 Spec 在 R2 回执已关闭，本轮不重判。R1 要求直接露 `newCapacityRule` 的原字节 probe 仍 FAIL，R2 已裁决该断言不适用当前 AC；独立合理原因 probe PASS，两份证据并存。活动/动作重复代码的 P3 建议继续延后，无行为分歧证据，不扩重构。全历史 `main...HEAD --check` RAW exit 2 / 3570 行属继承；本票维护 diff-check 独立记录，不覆盖旧失败。

CI、docs #10、packed #11、device、旧消费者 #13/#15、父 #8 组合、真实 APS、生产、商业发布、原生 zoom 均 UNRUN；不以源码测试或本轮浏览器观测替代这些车道。PR 保持 draft，由父席安排后续独立审核；本席不 ready、merge、close 或 watch。
