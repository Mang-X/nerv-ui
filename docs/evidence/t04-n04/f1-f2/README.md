# N04 / #48 / PR #54：R1 的 F1、F2 修复

原交付 `19f0888391e2be27a5a58503724ac8e99706e8c2`（tree `b2890bdd6a39f2dc3f9b4618856913c3eb302704`）被独立 R1 拒绝集成，material 为 F1 新回归、F2 继承验收缺口。原 108 mobile / 66 host / UI 644 和四态浏览器属于原交付实施证据，不覆盖 R1 FAIL。原独立报告和 `final-public.json/log` 在 `r1/` 原样保留；外部原目录未改。此页只记录两项修复；新 exact head/tree 由同一 [PR #54](https://github.com/Mang-X/nerv-ui/pull/54) 与外部 `/tmp/nerv-ui-t04-n04-fix/handoff.md` 固定，避免文档自引用。

工作树 `/Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists`，分支 `feat/t04-n04-mobile-lists`；交付前 fetch/merge `origin/integration/nerv-ui-extraction`，base 仍为 `d730e76ac576baa7c1509a50af4857fd9370a5bd`（Already up to date）。旧源 `79b1578f2b75f55709765b5e7882aaf33146c603` 只读且零改动；migration、shadcn 冻结区和 16 份依赖输入全字节不变，无新配置、API、依赖或 token。

## 公开行为和根因

F1：Swiper 外部 index watcher 更新 offset 后，松手仍拿旧 startOffset 计算拖动，导致 20px 手势混入整页位移。最窄修复同时同步 startOffset 和 startX（使用最后指针位置），外部选页成为当前手势基准；随后移动只计算切页后的距离。外部页更新本身不发 change；短拖松手沿用既有一次 change(当前页)，不额外请求 update:index。后续新手势仍可正反翻一页。未采用取消后完全无 change 的行为，原因是既有公开松手语义和未改外部 probe 都要求一次 change(target)；这不是削弱断言。

F2：PullRefresh loading 变化未撤销 engaged/eligible，松手未查 loading，旧手势可再发 refresh。loading 变化现在复用取消路径，撤销手势并将距离置于 loading 阈值或完成后的 0；松手另有 loading 守卫。中途加载、取消、加载早于松手完成均不重复刷新，完成后可以新拉。F2 的 base/head 原来都 FAIL，明确不称新增回归，也不推给 #35；旧库回传由 #14 评估。

宿主增加中性的“立即更新”按钮，通过既有宿主状态和请求函数启动 loading，使浏览器能公开触发交错；loading 期间按钮 disabled。请求函数没有新增去重 guard，组件若重复发 refresh，计数仍会暴露。无私有 vm、组件内部属性写入或测试专用生产 API。

## Requirement | Evidence

| Requirement                                                   | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1 正反短拖、外部页保留、轨道同步、事件不重复、后续新手势     | `rebases a short drag onto the externally chosen page - external-forward / external-backward`（报告的安全名称带引号）；`raw/f1-red.json/log` 2 FAIL / 5 PASS → `raw/f1-green.json/log` 7 PASS。RED 为误发 index 2 / 0，GREEN 断言轨道 -300px、无 update:index、一次 change(1)，切页后继续移动 50px 仍不翻页，随后一次新手势。额外 `raw/f1-continuation-red.json/log` 暴露中间实现仅同步 startOffset 时的 -370/-230px（应 -350/-250px）；补齐指针坐标原点后 `raw/f1-continuation-green.json/log` 7 PASS。 |
| F2 中途 loading、松手/取消/先完成、loading 视觉、回弹和重新拉 | `revokes an eligible pull when external loading starts - release-during-loading / cancel-during-loading / complete-before-release`；`raw/f2-red.json/log` 3 FAIL / 6 PASS → `raw/f2-green.json/log` 9 PASS。正式 RED 首先失败于旧拖动 112.51px 未收至 loading 56px；原 probe 另直接记录重复 refresh 的 FAIL。                                                                                                                                                                                            |
| 宿主公开外部刷新入口和真实请求计数                            | `keeps a button refresh single when loading interrupts a pull and permits the next pull`；`raw/host-red.json/log` 按钮尚不存在，1 FAIL / 7 PASS；`raw/host-green.json/log` 8 PASS。                                                                                                                                                                                                                                                                                                                      |
| 未改独立 probe 断言，保留原 head/base 对照                    | `raw/probe-byte-identity.json` 四份 test 全字节相等；复制 config 只换 root/output 目录。新跑 `probe-red-corrected` 重现 4 PASS / 4 FAIL；修后当前 head `probe-final-head` 4 PASS。含 base 的 `probe-final-with-base` 7 PASS / 1 FAIL、exit 1，唯一 FAIL 仍是基线 F2；不能称全绿。                                                                                                                                                                                                                        |

正式测试仅用 props、slots、公开 events 与 DOM 输入。jsdom 的 offsetWidth=300 是明确几何 seam；构造 MouseEvent 命名 pointer 的单元输入不称真实触摸。

## Fresh 门禁

所有命令和原生退出码记录在 `raw/*.run.json`；corepack pnpm 11.22.0，task-local PATH 供嵌套脚本。使用已有 node_modules，没有无意义重装。

- mobile 22 文件 / 119 PASS：行为 113、命名/runtime 契约 6；静态 docs 2 PASS。
- UI 43 文件 / 644 PASS；静态 docs 6 PASS。
- host 7 文件 / 67 PASS（43 行为 + 24 导入契约）。
- 三包 vue-tsc 与宿主生产 build PASS；scoped fmt/lint PASS。
- JSON 完整解析，发现数非零、pending/skip/fail 为 0。CSS parser、Vue 既有警告与构建 PURE 注释警告原样保留。
- 16 个 manifest/lock/workspace 文件与 base 逐字节相等；Vue 3.5.39 在三包同 realpath/同模块对象，见 `raw/dependencies.json`。

## Fresh 浏览器与产物身份

新 production dist 在 `127.0.0.1:4186` 提供。T3 先 status/open；首次 about:blank 被 URL parser 拒绝，改用实际 URL 后打开成功。同一 snapshot 步骤连续两次返回 `Preview automation snapshot timed out after 15000ms.`，保留 `raw/t3-preview.json` 后转 ego-browser（TaskSpace 12）。旧交付的 preview/browser07 等工具/产品 FAIL 均仍在原证据目录。

- 中间版本仅同步 startOffset 的四态/定向浏览器结果完整保留于外部 `intermediate-v1/`，不作为最终 head 的 fresh 通过。下列均在最终同步两个原点的新 bundle 上重新执行。
- `browser/target-390-light.json`、`browser/target-844-dark.json`：390×844 浅色 / 844×390 深色，各 5 项，共 10 项。F1 正反 20px 拖动间宿主切页；F2 中途 loading 松手、touchCancel、先完成再松手；每项检查随后新手势正常。
- CDP mouse 输入和 CDP 合成 touch/touchCancel 操作真实 Chromium；宿主外部切页/开始 loading 用公开按钮 `DOM click()` 激活，明确不是第二个物理手指。未读取或写入组件私有状态。
- 原六组相关组合在新 bundle 四态重跑，实际 mouse/wheel/CDP touch、实际 scroll parent/geometry/hit/横溢出、刷新恢复、分页重试结束、有限 DOM/选择身份、轮播生命周期，见 `browser/fresh-*.json/png` 与 raw 日志。物理触控不是本轮执行通道。
- `raw/frontend-source.json` 是最终 frontend 文件内容 fingerprint；`raw/source-bridge.json` 明列相对原 head 变化的六个 frontend 文件，其余路径身份保留。`raw/resources.json` 对实际浏览器加载的 HTML/JS/CSS/字体 HTTP 200 响应逐字节对照最终 dist，并列出全部磁盘产物 SHA256。新 JS 不沿用旧 bundle 的动态通过结论；其余旧证据只保留来源/源码身份，不冒充 fresh。

## Optional、边界与交接

optional 位移表达式去重延后：修复只需局部同步两个原点，提取其它路径会扩大本次职责；VirtualList 底部 resize/清空恢复/重排组合尚无确认公开失败，保留建议，不改生产逻辑或声称补齐组合断言。F1/F2 根因及公开行为无未解决技术异议，独立 R2 仍 **UNRUN**。

本轮不扩 #35/#49/#43/#51；#48/#5/#1 继续 OPEN，#18 仍 draft。不合并、不关票、不 ready、不监控/轮询。CI、clean frozen install 本轮重跑、#11 版本化产物、物理 touch/iOS/Android/PDA/非零安全区、旧库接入和发布 **UNRUN**。旧 clean install 是原交付身份，不变成新 fresh 结论。

工具尝试也保留：外部 probe 首次 CWD 未切到 `/private/tmp`，产生模块未找到；改正 CWD 后才实际复现产品失败。docs fmt 首次使用 `..` 被 runner 拒绝，改绝对路径后通过。扩大 scoped fmt 到原交付材料时，原封保留的 `docs/evidence/t04-n04/source-review.md` 格式检查 exit 1；它是原交付审查原文，逐字节保留，维护源码/人工文档另行排除此冻结附件后检查。

全量 diffcheck 的 exit 2 与 raw 空白事实保留；源码/人工文档的 scoped 检查单独记录，不清洗原始日志装绿。自有浏览器/服务清理及最终 SHA/tree/status 见外部 `handoff.md`、`raw/cleanup.json`；任务工作树留给独立 R2。
