# T07/P13 PR111 R2 用户文案返修证据

本轮仅处理 [#96](https://github.com/Mang-X/nerv-ui/issues/96) / [Draft PR111](https://github.com/Mang-X/nerv-ui/pull/111) 的 R2 Standards P2：两个候选深链的 host 可见文案。固定 base 为 `62a3a62ad57b3fb3bd2309e9966d4e2554f67f61` / tree `d510380fb5a2ba7a271e7567c3c2473817c5e938`；本轮起点为 `295c1d41d29755f635e314b2a0d111d6f1a1d28e` / tree `8154bc6b49975cbeab79b9aa34cf5345047fcc7e`。最终 head/tree 与 clean 读回见外部 `t07-p13-user-copy-fix/handoff.md`。

## Finding 与改动

R2 回执指出原页将“内存来源演示”“演示来源控制”“让上一请求晚到”“确认保存成功”等夹具语言直接显示给用户，与 `frontend/DESIGN/governance.md` 的可见文案清单不符。现将页名改为“候选安排”，控制区改为“状态设置”，11 个按钮按本轮/上轮结果与保存响应命名。页首明确写明：结果和保存响应仅在本页内存中生成，未连接实际排程计算或后端保存；页面的“已保存”只代表当前页面确认，刷新后不保留。控制区帮助语也说明按钮只调整本页结果与响应。原 `data-fixture` 公开测试接缝和全部按钮行为均保留。

R2 Spec material 0；本轮没有改引擎、回调时序、状态归属、业务 API 或四个公开组件。R2 两条 docs #10 optional（空 stop 处理器、侧栏入口）与 Rush completed 无三元匹配标题 optional 留在原 owner 边界，不夹入文案返修。

## Requirement coverage

| Requirement                                  | Evidence                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 用户可见来源与保存语义准确，默认页不误报完成 | `host explains its local result and save responses through user-facing state controls`：旧页 1 RED / 348 总测试中的其余 347 PASS；改后聚焦 host 18/18 PASS，playground 348/348 PASS。逐个检查 11 个按钮文案与原动作接缝对应，并断言默认页无“候选计算完成”。                                                                                      |
| 迟到结果、旧保存确认与当前保存分离           | 原 R1 `public-probe-1.ts` 3/3 与 R2 `independent-probe.ts` 3/3 按原字节复制到正确 host 测试目录，本轮 6/6 PASS；正式 `host keeps an older completed response outside the new job and accepts only the current result`、`old save confirmation after source change cannot affect a new save operation` 等仍在 host 18/18 内。原 R1 RED 历史不改。 |
| 三元身份过滤                                 | 原 R1 `public-probe-2.ts` 按原字节复制到公开组件同目录，本轮 1/1 PASS。复制时两次放错相对目录导致 import 解析 FAIL/0 test，原失败日志保留；改用正确目录后 PASS，临时文件均清理。                                                                                                                                                                 |
| 只读与恢复、失败重试、分页和 ETR             | 正式 host 18/18 与 fresh dist 浏览器：工作坊 11 个方案第 2 页、ETR 到期/恢复、失败后手动重试、完成结果只读保留；读书会旧结果/保存确认晚到不覆当前，当前保存等待后才由本页确认。                                                                                                                                                                  |

## Fresh 门禁与浏览器

- `TZ=Asia/Shanghai` 聚焦 host 18/18、playground 348/348 PASS；原字节探针 host 6/6、公开组件 1/1 PASS。默认 reporter 的 `unhandled` JSON 字段缺失，不能写成 0 或 null；`Could not parse CSS stylesheet` 是独立警告。R2 全库 1621 PASS / 4 policy-skipped 是同 producer 未改范围内的继承证据，不作为本轮 fresh 全库运行或真实 vendor PASS。
- `pnpm -C frontend build` exit 0，包含四个 workspace `vue-tsc`；`pnpm -C frontend lint` exit 0，有旧路径 warning。构建仍有 `INVALID_ANNOTATION` 与大 chunk warning。受影响格式与本票 Markdown 链接门禁的最终数字见外部 handoff。全局 fmt 四个 base 同 blob 文件的既有 FAIL 保留，不报全局 PASS。
- fresh dist 两域浏览器截图与原始日志位于外部 `t07-p13-user-copy-fix/`。T3 preview 在同一步两次返回 `Preview automation snapshot timed out after 15000ms.`，随后按规则使用 ego-browser。工作坊首次浏览器脚本误找“重试”，页面实际为“手动重试”；该定位 FAIL 保留，按快照改定位后完成。浏览器实际加载的导航、主 JS/CSS、runtime JS、字体、DHTMLX JS/CSS 共 7 个 HTTP URL 均 200、MIME 匹配且 body 与本轮 dist 对应文件逐字节相同；只支持这 7 项。

## 继承与未运行

R1 来源切换、旧保存晚回、只读 pending 三项原 FAIL 与返修后的合同均保留；本轮只改 host 模板文案及其正式定位断言。锁文件、5 份 package manifests、Vue 单例、vendor 9.1.4 Professional Evaluation、迁移冻结源、P11/P12 producer 对 base 无改动；vendor 商业授权 **UNKNOWN**。原无 TZ 全测 FAIL、原生 `tsc` 误用 Vue/CSS consumer FAIL、旧 `DraftEditingDemo.test` 5 秒 timeout FAIL、历史 main RAW diff exit 2 / 维护 0 与全局 fmt FAIL 仅引用旧证据，不被本轮 PASS 抹去。

CI、docs #10 全站、packed #11、device、旧 consumer #13/#15、父 #8 组合、真实 APS、生产、原生 zoom 和合并后验证均 **UNRUN**。source 不代表 packed，内存 host 不代表 APS，浏览器 UI 不代表生产。Draft PR111 不 ready、不合并、不关闭、不 watch；独立 R3 由父席安排。
