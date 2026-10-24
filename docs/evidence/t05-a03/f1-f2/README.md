# T05/A03：独立 R1 的 F1/F2 修复

PR [#67](https://github.com/Mang-X/nerv-ui/pull/67)，关联 [#60](https://github.com/Mang-X/nerv-ui/issues/60)。本轮只修复 R1 两项 P2，并处理 O1 文案；独立 R2 尚未取得，不合并、不关闭 tracker。

## 固定对象与边界

- 工作树 `/Users/mang/Project/nerv-ui-worktrees/t05-a03-screen-indicators`，分支 `feat/t05-a03-screen-indicators`；所有 shell 均显式指定这个 workdir。
- integration base `9f53a679b2854a34d661a17c70ac530cc57a4826`，tree `b1fd21648cd03a424977c0a46be6a1ee5623f603`。交付前 fetch/merge 最新 integration，结果 Already up to date。
- **R1 受拒对象** `84d57b43798dceb4bc02a21231d885bf729e1926`，tree `5afdbba964359809c33c793137ca36e0397faaea`；R1 material 2（F1 新增、F2 继承），optional 1（O1 新增）。原拒绝没有被后续绿色门禁覆盖。
- **修复代码对象** `276c526fa042a6a7c02676594d6776e25a392300`，tree `23e4c444f0ea81b6e0e5809213bf9e7072508cbd`，frontend tree `643d0e42a5aa65e2235ba94f4295851cdbf22869`。后续仅补本证据与图片；最终 PR head/tree 在外部 `handoff.md` / `final-identity.json`，其 frontend tree 必须与本对象相同。
- 旧源 `79b1578f2b75f55709765b5e7882aaf33146c603` 只读、clean。root integration 仍在上述 base、clean；不写默认旧 Nerv-IIP worktree。

F1 留在文档宿主：`v-model.number` 的空字符串或非有限数字显示“比例未知”，停止挂载数字环；真实 0 仍挂载。没有扩大 RingGauge 的 number API，也没有把未知转换成 0。

F2 从 JS number 的最短表示分离尾数和指数，小数位为 `max(0, 尾数小数位 - 指数)`。0–20 位保持原 Intl 分组；21–100 位用 toFixed 并只给整数部分分组；超过 100 位保留最短科学计数法，例如 `1e-101`、`5e-324`。没有新依赖或任意精度库，NaN/无穷不是有效数字。动画采用有限端点加权，避免正负 MAX_VALUE 相减溢出，结束时直接采用目标，避免极小端点被相消成 0；字符串原样、动态低动效和 RAF 清理保留。

O1 已处理：“内存示例 · 无业务服务”改为“阅读、到访与预订”。没有扩业务能力。七件导出、props/default、主桶、CSS、冻结素材和 A01/A02 owner 不变；#61–64/T08/#43/#51 不顺修。

## Requirement | Evidence

原始 JSON、日志和下列脚本位于 `/tmp/nerv-ui-t05-a03-fix/handoff`，持久副本 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t05-a03-fix/handoff`。表中 `raw/` 相对该目录。

| Requirement                                       | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1 实际文档绑定的输入清空与恢复                   | 正式 `ring documentation input clears to unknown and recovers finite zero decimal negative and overflow readings`，从当前 Markdown 抽出 script 和 ScreenDemo 内完整模板，原 Vue compiler 编译，真实 mount/input.setValue：空、溢出输入 `1e309`、非法输入均未知；恢复 0、12.25、-12.3、125.25。独立阅读比例 0 不消失。`red-f1.json` 1 FAIL → `green-f1.json` 1 PASS；最终 `ui-final.json` 同名 PASS。                                                                                                                                                                 |
| F2 正负指数小数首屏与更新                         | 正式 `digital flop preserves scientific decimal %s on initial render and reduced updates`，参数 `1e-7/-1e-7/1.25e-7/-1.25e-7`，可见和 aria 分别精确为 `±0.0000001` / `±0.000000125`，经 0 再更新。`red-f2.json` 4 FAIL → `green-f2.json` 4 PASS；按名过滤时其余 11 是 pending，不冒称全套。最终 UI 无 pending。                                                                                                                                                                                                                                                      |
| 精度边界、分组、字符串                            | `digital flop safely formats finite precision boundary %s and keeps strings literal`：0、12.25、-1234.5、1.25e3、1.25e21、1e-20、1.25e-20、1e-100、1e-101、-1.25e-100、MIN_VALUE；精确字符串往返。`digital flop keeps grouped intermediate readings beyond portable Intl precision` 验证动画中 `1,234.5000000000000000000000`，最终 `0.0000000000000000000125`；`red-f2-grouping.json` FAIL → `ui-final.json` PASS。                                                                                                                                                 |
| 极端 finite 动画安全与精确端点                    | `digital flop reaches finite extreme and subnormal targets without overflow or endpoint cancellation`：MAX_VALUE → -MAX_VALUE → MIN_VALUE，中间无 Infinity/NaN，终点 `5e-324`；`red-f2-extreme.json` 实际 `-∞` FAIL → 最终 PASS。没有扩 NaN/Infinity 的输入合同。                                                                                                                                                                                                                                                                                                    |
| 快速减值、normal/reduced、number/string、卸载重挂 | `digital flop settles tiny rapid decreasing targets across normal reduced literal and remount transitions`，推进公开 RAF 回调，长运行时间下替换为负极小数，双向真实媒体事件、原样文字、卸载无帧、重挂精度。原 R1 `direct-probe.mjs` 三项原断言新跑全部 PASS：`public retarget after long uptime preserves signed decimal and clears every scheduled frame`、`literal replacement reduced toggle return to normal and remount never revive stale targets`、`zero timestamp first frame settles after observed next frame plus duration`；见 `raw/direct-probe.json`。 |
| R1 原 9 条 FAIL 保留与对照                        | `raw/r1/material-probe.mjs/json`、`direct-probe.mjs/json`、`review-receipt.md` 原样保留；原脚本 exit0 表示反例成立，不是产品 PASS。新 `probe-compare.mjs` 使用原 F2 观察流程：新代码 4 PASS、固定 base 4 FAIL，见 `material-probe-compare.json`；F1 原 FAIL 与上述实际 Markdown 正式 RED/GREEN 并列，不修改原反例文件来冒绿。                                                                                                                                                                                                                                        |
| 浏览器极小读数与实际文档输入                      | 新 production-built 临时公开组件/文档示例宿主 `/probe/`，不是完整 docs #10。`browser-02.mjs` / `raw/browser/harness.json`：首屏三个极小读数，可见/aria一致；正常动画与快速减值，CDP 真实 reduce/no-preference 媒体切换，number/string/极小数往返，卸载清 RAF，实际文档 input 清空→0/小数/负数/125.25恢复。1920×1080 / 960×540 多读数无裁切，错误列表空。                                                                                                                                                                                                             |
| 正式新生产 bundle 的来源、动效、主题与清理        | `browser-03..07.mjs` 全部 exit0。`source-identities-final.json` 五组公开 fixture、双环/双 SVG fragment、area/color；`motion-themes.json` 正常最终2474.5、179次RAF注册后pending0，低动效2574.5立即到达、pending0；四外层主题中screen固定深色。`routes-lifecycle.json` 九路由退出、本组RAF/interval/MediaQueryList清理、重挂复位与深链刷新。`production-geometry.json` 1920/960×light/dark，原值和胶囊可读、原生纵滚到七态。                                                                                                                                           |
| 产物身份与所有权                                  | `raw/identity.json` / `audit.mjs`：16份依赖输入全部字节等于base；三个活动包同Vue3.5.39 realpath/模块对象；除DigitalFlop外六个指标实现与受拒head逐字节相同；主桶/CSS/冻结/A01A02等受保护路径与base相同。正式和临时宿主的HTTP200响应分别与各自dist逐字节相同，见两个resources报告。                                                                                                                                                                                                                                                                                    |

## Fresh 命令与结果

所有命令的显式 workdir 为上述目标树。pnpm 使用已有 `/tmp/nerv-ui-t05-a03/bin/pnpm` Corepack shim，task-local PATH，实际11.22.0；Node24.18.0。未 reinstall、未运行 Python。

```sh
PATH="/tmp/nerv-ui-t05-a03/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui exec vp test run src/components/screen/ScreenIndicatorDocs.test.ts --reporter=json --outputFile=/tmp/nerv-ui-t05-a03-fix/handoff/raw/red-f1.json
PATH="/tmp/nerv-ui-t05-a03/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui exec vp test run src/components/screen/ScreenIndicators.test.ts -t 'preserves scientific decimal' --reporter=json --outputFile=/tmp/nerv-ui-t05-a03-fix/handoff/raw/red-f2.json
node /tmp/nerv-ui-t05-a03-fix/handoff/gates.mjs
PATH="/tmp/nerv-ui-t05-a03/bin:$PATH" pnpm -C frontend build
PATH="/tmp/nerv-ui-t05-a03/bin:$PATH" pnpm -C frontend --filter @nerv-iip/ui test --reporter=json --outputFile=/tmp/nerv-ui-t05-a03-fix/handoff/raw/ui-final.json
node /tmp/nerv-ui-t05-a03-fix/handoff/probe-compare.mjs
node /tmp/nerv-ui-t05-a03-fix/handoff/maintenance.mjs
node /tmp/nerv-ui-t05-a03-fix/handoff/audit.mjs
```

- UI **48文件/703**、mobile **27/144**、host **12/101**，静态docs UI **6** / mobile **2**，均exit0、success=true、failed0、pending0。完整控制台无unhandled error；`ui-final.json` 为两处测试类型修正后的fresh完整UI重跑。mobile/host/docs在相同生产源码上本轮fresh执行。
- 三包vue-tsc及正式生产build exit0；PURE/INVALID_ANNOTATION/chunk/CSS提示保留。构建第一次发现新增测试 `get().exists()` 类型和可选属性错误，保留 `build-types-fail.log`，修正后重跑成功。后续formatter仅换行，不改变验证语义。
- 维护范围19文本fmt、10源码lint、scoped diff-check exit0，精确文件列表见 `raw/maintenance.json`；不清洗历史raw或冻结素材。
- 两项P2已实施并有上述公开证据；实施者未发现未解决的R1 material异议。此结论不代替独立R2。

## 浏览器对象、图像与资源

T3 status/open成功（最初about:blank参数被拒后更正），navigate到正式产物成功；snapshot同一步两次均为 `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`。保留 `t3-preview-failures.json`，然后按技能切换ego，单TaskSpace12，最终finish keep[]。没有以工具超时冒称产品失败。

已实际查看[极小数1920](harness-1920.png)、[极小数960](harness-960.png)、[正式宿主1920浅色外壳](production-1920-light.png)、[正式宿主960深色外壳](production-960-dark.png)、[输入清空与独立零值](document-empty.png)。最后一图来自未固定viewport的截图，仅证明清空视觉状态，不作960几何证据；原raw文件名含960是误标，真实尺寸由 `raw/browser/image-metadata.json` 记录。1920/960的接缝尺寸以各自JSON和前四图为准。

| 正式实际响应                           |  Bytes | SHA256                                                             |
| -------------------------------------- | -----: | ------------------------------------------------------------------ |
| HTML                                   |    427 | `f64298b33dfce2f7636d80a490ceae7a55e737a6adee456dbc502190f8c77d29` |
| index-BmJj6-ws.js                      | 562836 | `7fcaab951e4be960f0381089f5bcea8c059dbf336aad8a8d4c57960653c3f409` |
| index-BUUYIt-1.css                     | 271654 | `6bf86029820405b2ac05832b312824e6750fb4d09f061aec994c26df89277fc4` |
| inter-latin-wght-normal-Dx4kXJAl.woff2 |  48256 | `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62` |

`raw/browser/resources/final-responses.json` 保存正式产物实际响应；`raw/browser/harness-resources/responses.json` 保存另外构建的公开harness响应，不混作正式宿主bundle。中文字体为系统PingFang SC，数字为自托管Inter；请求均为本地4193。临时harness完整源码和配置在handoff，未新增项目框架或依赖。

## 历史 FAIL、继承与 UNRUN

- R1 原9条产品FAIL与本轮有效RED均保留。固定base的4条科学计数FAIL继续成立，不因head修复改写。
- 本轮harness失败：`f1-harness-fail.json/log` 是测试环境把import.meta.url解析为非file；改为包内cwd解析后得有效RED。临时构建曾因root的Vue不可解析、/tmp与/private/tmp非canonical根导致失败，分别保留harness-build-resolve-fail、harness-build-realpath-fail日志；修正宿主解析和realpath后exit0。首次维护fmt因测试类型修正的长行FAIL，保留maintenance-fmt-first-fail后格式化闭合；不扩格式化范围。
- [原实施记录](../README.md) 和持久 `t05-a03/handoff` 全部保留：browser round09 **整轮FAIL**，round12 **clean exit0**；原RED、早期harness/CSS/PURE、历史raw diffcheck2、冻结fmt1均保持原身份。R1拒绝在 `t05-a03-review-r1/review-receipt.md`。本轮不重写历史证据。
- 继承只指旧对象 `84d57b4` / tree `5afdbba…` / frontend `7fe6078a6a1127618e9e63c0e05cea3c4cb29a2e` 的原历史记录（如1366、精确半缩放与长KPI原生键盘横滚），不将旧JS `index-nEeNSBBy.js` 当本轮fresh。新源码对应的新bundle相关行为由本轮fresh覆盖；主CSS源与owner字节核验另列。
- **UNRUN**：CI（未取得）、packed/versioned #11、完整文档站 #10、物理设备/模拟器、旧库消费者接入/发布、父#6最终跨组组合、native125% zoom。未使用移动包/旧组件/样例输入站替代这些验收。
- 自有browser/service清理后保留任务worktree供独立R2；最终clean、push、PR线上对象以外部交接回执为准。不merge/关闭#60/#6/#1、不ready#18、不监控。
