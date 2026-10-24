# N04 / #48 / PR54：F3 窄修记录

只处理独立 R2 的 F3。验收与公开接缝沿用用户批准的 spec #1 / taskgraph、#48 / #5；不扩到 #35/#49/#43/#51，旧库同步归 #14。整体待新独立 R3，不作合并或父票完成结论。

## 对象与最小修复

- integration base：`d730e76ac576baa7c1509a50af4857fd9370a5bd`；tree `15e1a96428c55ee33a85331feefef25f247a7d13`。
- R2 受拒 head：`f809e6be554062d3e1cc15b364c793c4c53802f0`；tree `77f681b1ff56f973f63cec0c1c04d6c2018bfcef`。
- F3 为继承缺陷：顶端起手 y10→260→0/10→松手，`dy <= 0` 提前返回留下 112.513px 拉距，错误发出 refresh 并 loading。邻接 y11 正确。base/head 各 2 FAIL / 1 PASS，不是新增回归，也不是 #35 高层列表恢复。
- `PullRefresh.vue` 只在该分支添加 `distance.value = 0`，保留当前 eligible/engaged 使同一指针再拉仍有效。loading/cancel 的撤销与松手守卫不改；Swiper F1 双原点同步不改。最终组件 blob：`fc0938aee3d82b603d71fe3b5a357983c2288614`。
- 增量为该组件、现有公开行为回归、当前文档及证据。六件、中性 `/#mobile-lists`、五旧入口、裸包/公共 CSS、公开 API、SDK 与依赖边界不变。

## Requirement | Evidence

| Requirement                                                        | Evidence                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 越阈值后撤回到/越起点不请求，拉距立即消除                          | `does not refresh after retracting a threshold-crossing pull - 'above-start'` / `'at-start'`：正式 RED 2 FAIL / 10 PASS → 同断言 GREEN 12 PASS；邻接 `'below-start-control'` 原本 PASS。`raw/official-f3-red.*`、`official-f3-green.*`。                                         |
| 同一指针撤回后再次拉过阈值，松手单发、loading 期间不重复、完成回弹 | `allows one refresh after retracting and pulling again with the same pointer - 'above-start'` / `'at-start'`；两例补强后最终 PullRefresh 14 PASS。未伪造这两例此前的 RED。`raw/official-pull-formatted.*`。                                                                      |
| F2 loading 起落、松手/取消/先完成与后续复用不回退                  | `revokes an eligible pull when external loading starts - 'release-during-loading'` / `'cancel-during-loading'` / `'complete-before-release'`；`does not revive a revoked pull after repeated loading transitions and allows reuse` 四例；正式及 R2 probe 继续通过。              |
| cancel、非顶端起手与滚动契约不变                                   | `cancels a pull beyond the threshold without requesting refresh`、`does not start a refresh when a gesture began below the scroll top`、`keeps downward touch pulls at the top and restores native vertical panning below it`；正式通过，新 bundle 对应 mouse/touch 场景 fresh。 |
| F1 外部页同步与续拖仅计最后一段不回退                              | `rebases a short drag onto the externally chosen page - 'external-forward'` / `'external-backward'`；原 probe 两例及 R2 同值/两次外部同步六例继续通过。Swiper 正式 7 PASS 包含在 mobile 中。                                                                                     |
| R2 原 F3 probe 断言不改                                            | `probe/m1-retract.test.ts` 与 R2 全字节相等。修前 4 FAIL / 2 PASS；修后 head 3 PASS，base 1 PASS / 2 FAIL，总 4 PASS / 2 FAIL、exit 1。`raw/probe-f3-unchanged-red.*`、`probe-f3-final.*`。                                                                                      |
| R1 原四份 probe 及 base FAIL 保留                                  | 四份 test 与原 R1 字节相等。最终 head 4/4 PASS；含固定 base 为 7 PASS / 1 FAIL、exit 1，唯一 FAIL 为 base F2。`raw/probe-original-head.*`、`probe-original-base-head.*`。原 R1 的 4 PASS / 4 FAIL 在原证据不改。                                                                 |
| R2 其它公开交错                                                    | `probe/r2-swiper.test.ts` 六例、`probe/r2-pull.test.ts` 四例，共 10 PASS；test 与 R2 字节相等。`raw/probe-r2-interleavings.*`。                                                                                                                                                  |

仅使用 props、DOM、事件与现有单元输入；新增测试不访问私有 vm。正式 RED 在修改生产代码前执行；先原样 probe，再正式 RED，再最小修复。

## Fresh 门禁

最终格式化后 mobile 124 PASS（118 行为＋6 命名）；UI 644 PASS；host 67 PASS（43 行为＋24 导入）；静态 docs mobile 2 / UI 6 PASS。所有 JSON 完整解析，预期发现非零，pending/skip/todo/fail 0（上表刻意保留的 RED/base 对照另列）。最终 PullRefresh 14 PASS。三包 vue-tsc 与生产 build exit 0。

corepack pnpm 11.22.0＋`/tmp/nerv-ui-t04-n04-f3/bin` task-local PATH；43 份配置、其中 16 dependency inputs 及完整 lock 均与 base 全字节相等；Vue 3.5.39 为三包同 realpath/对象。没有重装。migration、shadcn、样式源码零 changed。源码身份桥接见 `raw/identity-source-audit.json`；运行源码相对受拒 head 唯一变化为 PullRefresh，原 F1/F2 证据 228 项 hash 全保留。

维护源码/人工文档 scoped fmt 29 文件、lint 21 文件、diffcheck 均 exit 0；结果见 `raw/scoped-*.run.json`；冻结附件不纳入格式化。全量 diffcheck 与历史冻结 fmt 的非绿边界见下节。

## 新 bundle 浏览器与继承边界

真实 Chromium，390×844 浅色与 844×390 深色两态：每态 mouse / CDP 合成 touch 各覆盖 at-start、above-start、repull、loading、cancel、non-top，共 24 个 F3 用例通过。事件 trace 记录 pointerType / isTrusted 与逐段坐标，断言撤回立即归零、松手零请求、再拉仅一次、外部 loading 不复活、取消及非顶端起手不请求。mouse cancel 一例为真实 mouse 加 DOM pointercancel 注入，touchCancel 则由 CDP 触发真实浏览器的 trusted pointercancel，均准确标注，非物理触控。

原 F1/F2 定向浏览器两态各 5 例，合 10 PASS：双向外部切页/50px 续拖/下一新手势，以及 loading 中松手、合成 touchCancel、先完成再松手与复用；按钮由公开 DOM click 触发外部状态，无私有 vm。loading 视觉在同一浏览器回合采样以免 650ms 宿主定时器已完成，原断言保留。最终 22 张截图，其中两张由本席人工查看；browser JSON/脚本/raw 完整保存。

`raw/resources.json` 保留实际加载 URL、浏览器源 HTTP 响应二进制及完整 dist SHA256。HTML/JS/CSS/字体 4 个响应均 HTTP 200、全字节等于新 dist；新 JS `index-BLJiylYt.js`，新 CSS `index-rATJgbff.css`。CSS 非全字节相等：完整比较证明唯一差异为 PullRefresh SFC scope id `data-v-af316c61` → `data-v-6febd5b2`，替换该 id 后整个 CSS 相等（`raw/css-bridge.json`）；字体产物身份保留。

原四态 24 组组合、五旧入口与 timer 清理仍是 f809e6b/F1-F2 的历史证据，不能算本轮新 JS fresh。相同源的其它组件/宿主由源码 hash，视觉规则由上述 scope-id 桥接，字体由产物 hash 承接；本轮不重复整套无关矩阵。**本轮只 fresh 两态，未宣称新 bundle 四态全覆盖。** 原 bundle `index-CpPDP0xj.js` 不冒充新 bundle。

## 历史 FAIL、工具问题与 UNRUN

- R1 拒绝原 head `19f0888391e2be27a5a58503724ac8e99706e8c2`（tree `b2890bdd6a39f2dc3f9b4618856913c3eb302704`），F1 新增/F2 继承，原 4 PASS / 4 FAIL 及 F1 续拖中间 RED 留在 `../f1-f2/`，没有擦除。R2 确认 F1/F2 修复有效后因 F3 拒绝，完整回执冻结在 `r2/review-receipt.md`，与持久归档全字节相等。
- R2 原 F3 4 FAIL / 2 PASS、这次修前原样复现、正式 RED、最终 base F3 两 FAIL/base F2 一 FAIL 原生 exit 1 均保留，不称全绿。
- 全量 diffcheck 历史 exit 2/91 项原始空白、冻结 `source-review.md` fmt exit 1 保持原身份；本轮全量 exit 2，共 111 项（新增 F3 证据 20 项），均为原始证据空白；完整日志仅存外部 `/tmp/nerv-ui-t04-n04-f3/raw/full-diffcheck.log`，仓内 `raw/diffchecks.json` 保存命令/退出码/路径/日志 hash，维护范围另报，未清洗 raw。CSS parser、Vue/PURE 等警告保留。
- T3 先 status/open；最初 about:blank 不支持、服务未就绪 connection-refused 均保留。站点启动后同一步 snapshot 两次原错 `Preview automation snapshot timed out after 15000ms.`，才按授权切换 ego-browser（`raw/t3-preview-errors.json`）。
- ego 首次误把文件路径当 CLI source，exit 2 后改为 `-e import`；首次 fmt check exit 1 后仅格式化新增测试并重跑 14/124。首轮 browser loading 采样在宿主 650ms 完成后才跨调用读取到 0px，原失败/现场/三例 partial 保留；后续把激活与 loading 状态采样置于同一浏览器回合，保留相同断言，最终两态完整通过。原正式/external probe 断言未改。
- UNRUN：独立 R3、CI、本轮 clean frozen install 重跑、#11 packed/versioned 产物、物理 touch/iOS/Android/PDA/非零安全区、旧库接入及发布。浏览器合成触摸不作物理设备认证。

optional 两项继续延后：Swiper 位移表达式去重；VirtualList 底部 resize/清空恢复/重排组合断言。均为 R1 既有非阻断建议，未确认产品失败，本轮不实现、不称完成。对 F3 的技术归因与本票 owner 无未解决异议；该实施结论不代替独立 R3。

## 交接

所有命令 tool workdir 均显式为 `/Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists`，branch `feat/t04-n04-mobile-lists`；外部 probe 子进程 cwd 显式为本目录对应 `/private/tmp/.../probe`。命令、cwd、时间、退出码和原始 stdout/stderr 见每个 `*.run.json` / `.log`。重放时使用实际 target 工作树，勿写 T3 默认旧项目 worktree。

最终 exact head/tree/base、远端与 PR 回读、clean 状态、fetch/merge、资源清理见外部 `/tmp/nerv-ui-t04-n04-f3/handoff.md`；PR54 中文正文明确 R1/R2 拒绝及 F3 待 R3。不 merge、不 close #48/#5/#1、不 ready #18、不监控。root integration 与旧源零改，任务树留给独立 R3。

附件清单 `SHA256SUMS` 覆盖原始证据、脚本及二进制；README/清单不自引用。归档排除 node_modules、cleancheckout 与缓存。原实施证据仍见 `../README.md`、F1/F2 见 `../f1-f2/README.md`。
