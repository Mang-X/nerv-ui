# N04 / #48 / PR #54 独立 merger R2：拒绝集成

审查对象：https://github.com/Mang-X/nerv-ui/pull/54；验收：https://github.com/Mang-X/nerv-ui/issues/48。

- base：d730e76ac576baa7c1509a50af4857fd9370a5bd；tree：15e1a96428c55ee33a85331feefef25f247a7d13。
- head：f809e6be554062d3e1cc15b364c793c4c53802f0；tree：77f681b1ff56f973f63cec0c1c04d6c2018bfcef。
- frontend tree：b9e18f0fa69236d69ab225b6df972ef5c0d0d9ee，与494552b已运行版本相等。
- 完整diff：git diff d730e76ac576baa7c1509a50af4857fd9370a5bd...f809e6be554062d3e1cc15b364c793c4c53802f0；再重点审19f0888→494552b→f809e6b。
- 本轮不改源码、不提交、不push。发现material后停止合并；未执行gh pr merge、root同步、GitHub评论或关票。merge SHA不存在。

## Material（1，继承、新发现；新增回归0）

### F3 / P2：下拉撤回起点或起点上方后松手仍刷新

定位：frontend/packages/ui-mobile/src/components/pull-refresh/PullRefresh.vue:53–62（尤其57），关联80–83。

公开输入：modelValue=false，内部滚动区顶端，pointerdown(y=10) → pointermove(y=260) → pointermove(y=0) → pointerup(y=0)。撤回到y=10亦同。初次下拉距离250px，越过阈值；撤回后相对起手距离为-10或0，预期回弹且不发refresh/update:modelValue。实际保留translateY(112.51303712598072px)，松手发refresh一次、update:modelValue(true)，吸附到56px并显示loading。邻接对照撤回到y=11（dy=1）可正确减为0.7px，松手回0且无事件。

根因：onMove在dy<=0直接return，未消除前次distance；onUp按残留越阈值distance决定刷新。该分支base/head均存在，明确不是本PR新增回归。当前#48要求刷新受控/滚动状态，源码及文档承诺“松手越过阈值即触发”，回撤属于当前刷新资格，不是#35高层列表恢复。Owner为ui-mobile/PullRefresh；旧库回传仍归#14。

本席fresh公开DOM probe：6执行，base/head各2FAIL＋1PASS，共4FAIL/2PASS，pending0，原生exit1；失败均为应无refresh却收到[[]]。只有props、事件、DOM与MouseEvent合成pointer输入，无私有vm；不称真实browser或物理触控。

精确测试名：does not refresh after pulling back below the threshold - head/base - 'above-start' / 'at-start'；相邻通过：'below-start-control'。代码与原始结果：probe/m1-retract.test.ts，raw/m1-retract.json、.log、.run.json。

复现（tool workdir为任务树；runner显式将外部Vitest子进程cwd设为/private/tmp/nerv-ui-t04-n04-merger-r2-20261024/probe）：

    node /tmp/nerv-ui-t04-n04-merger-r2-20261024/run.mjs m1-retract /Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists/frontend/node_modules/.bin/vitest run --config /tmp/nerv-ui-t04-n04-merger-r2-20261024/probe/m1.config.mjs

不改断言装绿；此FAIL阻断本轮验收。修复后应保留原F1/F2通过和该反例，再由新独立轮次复审。

## 原发现与回应核验

原R1对象19f0888391e2be27a5a58503724ac8e99706e8c2/tree b2890bdd6a39f2dc3f9b4618856913c3eb302704。直接读取完整原receipt、raw/final-public.json/log和四probe，未以摘要代替。原8执行4PASS/4FAIL及正式6+5未覆盖的边界永久保留；仓内r1副本逐字节相等。

- F1/P2（原新增）：activewatch只改offset，旧startOffset使20px短拖夹外部0→1时错发2，反向2→1时错发0；base两PASS、原head两FAIL。修复lastX并同时重设startOffset/startX，保留外部轨道同步。直接审原连续50px的中间RED（-370/-230应-350/-250）及最终GREEN，正式7PASS，本席原probe双向也PASS；没有回退基线外部index不更新轨道的缺陷。
- F2/P2（原继承）：loading midgesture时仍refresh。修复loadingwatch调用onCancel撤销eligible/engaged/dragging且保持loading阈值，onUp再守卫；宿主“立即更新”公开触发外部loading，无请求去重guard掩盖。正式9PASS及宿主8PASS，本席原probe/新loading起落反例通过。
- 修复交接称无未解决技术异议，本席对两项修复有效无异议；另发现F3，不能把F1/F2通过等同整体无material。

## Requirement | Evidence

| Requirement | Evidence |
| --- | --- |
| F1外部页同步、连续50px和后续手势 | official-swiper 7PASS；rebases a short drag onto the externally chosen page - 'external-forward' / 'external-backward'；原swiper-public两PASS |
| F1同值外部更新不抹真实拖距，连续两次外部切页后仅计最后一段 | preserves real drag distance across same-value host update - 'forward' / 'backward'；uses only the last external page origin and retains next gesture events - 'forward-short' / 'backward-short' / 'forward-long' / 'backward-long'；本席6PASS |
| F2松手/取消/先完成，loading视觉和复用 | revokes an eligible pull when external loading starts - 'release-during-loading' / 'cancel-during-loading' / 'complete-before-release'；正式9PASS |
| F2多次loading起落后旧手势不复活、两次新手势单发 | does not revive a revoked pull after repeated loading transitions and allows reuse - 'release-while-loading' / 'cancel-while-loading' / 'release-after-completion' / 'cancel-after-completion'；本席4PASS |
| 宿主公开外部loading、计数不掩盖重复事件 | keeps a button refresh single when loading interrupts a pull and permits the next pull；正式宿主文件8PASS |
| 原probe断言不变并保留baselineFAIL | 四test与R1/fix/仓内副本逐字节相等；最终head4PASS；含base7PASS/1FAIL、exit1，唯一FAIL为base F2 |
| 当前刷新回撤到阈值以下应取消 | does not refresh after pulling back below the threshold - head/base - 'above-start' / 'at-start'：4FAIL；邻接'below-start-control'两PASS，F3阻断 |
| 六件中性接缝/旧入口/稳定包与CSS | 全量源码diff、在线#48/#5、宿主67PASS（43行为＋24导入）；没有新增公开API、SDK或依赖升级，五旧入口保留 |
| 完整受影响门禁 | mobile119=113行为＋6命名；UI644；host67；静态docs2+6，完整JSON解析，fail/pending/skip0；三包vue-tsc及build exit0 |
| 配置、依赖、冻结及Vue身份 | raw/identity-audit.json：43份完整配置逐字节相等，包含16依赖输入与完整lock；migration/shadcn/styles零changed；三包Vue3.5.39同realpath/对象 |

所有fresh命令、cwd、退出码和原始stdout/stderr见raw/*.run.json/log。corepack pnpm11.22.0＋task-local PATH shim；没有重装未变依赖。外部probe先遇到Cannot find module '/swiper-public.test.ts'等CWD解析错误，保留public-base-head.log/run.json；修正子进程cwd后原断言实际执行。报告未把首次0断言harness失败当产品FAIL。

## Optional（2，R1既有延后；本轮新增0）

1. P3：Swiper位移表达式重复；判断性维护建议，无公开失败，不混入当前手势修复。
2. P3：VirtualList底部resize→清空恢复→重排后的可见窗口/身份组合断言。未确认产品失败，不升级为material。

## Fresh / inherited / FAIL / UNRUN

- Fresh：固定对象、在线#48/#5/PR、完整base→head源码和fixdelta、正式7/9/8、原probe、10个额外交错反例、F3边界反例、完整mobile/UI/host/docs、type/build、28文件fmt、scopedlint、完整配置/冻结/Vue、228项Git blob manifest、状态/产物身份审计。
- Inherited：修复席最终bundle的10个targeted和四态24组browser、34截图、五旧入口/定时器清理。审原脚本及8个最终run exit0、几何/滚动/hit记录；两张截图人工查看。独立freshbuild的10磁盘产物与原SHA一致；4个实际HTTP200加载响应的保存二进制全字节等于本席freshdist（HTML/JS/CSS/font）。这是继承支持，不是本席freshbrowser。JS index-CpPDP0xj.js SHA256 dbe4dd7355733370095ba3f06826d8f418e78b6554e0226dbcbff96672f88e5a；CSS index-AkcvTVWR.css SHA256 00365aa7cd1ed74b9f8c41eed98b4187c3a952b82ef3200b254969149eb678b0。
- FAIL：新F3 4FAIL/2PASS、固定base原F2仍FAIL；原R1四FAIL及中间续拖RED保持历史身份。全量git diff --check exit2，91项均为docs/evidence原始日志空白；维护范围scoped exit0。冻结source-review附件fmt1继承保留，未清洗raw、CSS/PURE/Vue警告，不称全仓绿。
- UNRUN：本席browser交互/设备/CI、clean frozen install重跑、#11 packed/versioned产物、物理touch/iOS/Android/PDA/非零安全区、旧库接入与发布。未启动浏览器，未调用preview或其它浏览器系统；产物桥接是读已存实际响应。

## 集成、状态与清理

本轮决定拒绝集成，PR54仍OPEN、head固定、base integration、MERGEABLE/CLEAN，mergeCommit=null；未执行保护合并，merge SHA/tree无。root未ff，仍base d730e76ac576baa7c1509a50af4857fd9370a5bd/tree15e1a96428c55ee33a85331feefef25f247a7d13。

任务worktree仍feat/t04-n04-mobile-lists/f809e6be，tree77f681b1ff56f973f63cec0c1c04d6c2018bfcef、clean；留给父controller修复/归档，不删除。root clean；main仍599031a688496679e300458f56a1896d41ac8f81。旧源HEAD79b1578f2b75f55709765b5e7882aaf33146c603/tree58e30c637acb7efdd393af291e570288b03b5aa9、status空，main ecb7626378e446dcc361cfc4f3c43227ba7e8364保持原值。

最终tracker：#48/#5/#1/#43/#49/#51 OPEN，#18 OPEN/draft。无GitHub验收追加、关票或ready，符合material停止条件。PR已立即link，最后list回读#54/watching=false；没有监控/轮询。

自有测试runner与两个只读审查席均已退出；本轮未启动服务/浏览器/设备，无自有服务需清理。外部probe wrapper均finally unmount。归档不含node_modules、cleancheckout或运行缓存。

独立回执：/tmp/nerv-ui-t04-n04-merger-r2-20261024/review-receipt.md。
归档：/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-24/t04-n04-review-r2。

## Standards（独立席原文）

# PR54/#48：R2 Standards

固定 base：d730e76ac576baa7c1509a50af4857fd9370a5bd；head：f809e6be554062d3e1cc15b364c793c4c53802f0；tree：77f681b1ff56f973f63cec0c1c04d6c2018bfcef。完整审查 git diff d730e76ac576baa7c1509a50af4857fd9370a5bd...f809e6be554062d3e1cc15b364c793c4c53802f0，再复核 19f0888→494552b→f809e6b。

已读根 AGENTS.md、README.md、DESIGN.md、两包 AGENTS.md、frontend/DESIGN/governance.md、docs/mobile-standalone.md；未找到 CODING_STANDARDS/CONTRIBUTING。仓规优先，工具强制项不重复报。

Material：新增 **0**；既有未解决 **0**。

F1（原新增 P2）：frontend/packages/ui-mobile/src/components/swiper/Swiper.vue:167–171 同步两个原点。20px短拖→外部选1→继续50px→松手，正反应为-350/-250px，保留页1且仅一次change；源码与连续移动 RED→GREEN原始日志一致。

F2（原继承 P2）：frontend/packages/ui-mobile/src/components/pull-refresh/PullRefresh.vue:64–83、110 撤销旧手势并守卫松手；外部loading中松手/取消/先完成均不应重复refresh。宿主 frontend/apps/playground/src/mobile-lists/RefreshList.vue:12–27 无去重掩盖。

直接读取原始/tmp/nerv-ui-t04-n04-merger-r1-20261024/review-receipt.md、final-public.json/log及四probe、修复handoff和仓内证据页；字节核对一致。最终归档head四PASS，含base七PASS/一FAIL仍是base F2；不是本席重跑。

Optional（均为N04新增位置，R1已提出，非硬违反）：

- P3 / possible Duplicated Code：上述Swiper:168与61、153重复位移公式；修改换算策略需同步三处，可后续集中。无公开行为反例，勿把手势重基准混入普通resize路径。
- P3 / 覆盖建议：frontend/packages/ui-mobile/src/components/virtual-list/VirtualList.test.ts:36–41、63–69 仅顶端resize，清空后直接卸载；补底部resize→重排→清空恢复后的窗口内容断言。未确认产品反例，不升级material。

公开API/裸包/CSS边界无新增违反；冻结素材零改动、16依赖输入不变、228清单匹配Git blob；最终frontend tree与494552b一致。Fowler其余项未见具体发现。

本席fresh仅只读源码/字节/收据核对；测试、安装、build、浏览器、CI与物理设备均UNRUN。未改仓库、启动服务、监控、合并或发布评论。


## Spec（独立席原文；F3已由本席fresh再现）

PR54/#48 独立 R2 Spec：需修订。material：新增0、既有1；optional：1（延续R1）。

base：d730e76ac576baa7c1509a50af4857fd9370a5bd
head：f809e6be554062d3e1cc15b364c793c4c53802f0
tree：77f681b1ff56f973f63cec0c1c04d6c2018bfcef
diff：git diff d730e76ac576baa7c1509a50af4857fd9370a5bd...f809e6be554062d3e1cc15b364c793c4c53802f0
已审全差异及19f0888→494552b→f809e6b修复增量，在线读[#48](https://github.com/Mang-X/nerv-ui/issues/48)/[#5](https://github.com/Mang-X/nerv-ui/issues/5)。

U＝frontend/packages/ui-mobile/src/components/。

- **M1／P2／既有，新发现**：U`pull-refresh/PullRefresh.vue:53–57,80–83`。#48要求“验证受控事件…滚动状态”；组件:9–10约定松手越阈值才刷新。顶端loading=false，pointerdown(y10)→move(260)→move(0)→up(0)。预期回弹且不refresh；实际refresh一次、translateY(56px)。dy≤0直接return，残留越阈值distance。真实源码内存编译＋Vue/jsdom公开DOM输入，base/head均复现；属于N04当前刷新资格，不转#35/#14。
- **O1／P3／延续R1**：U`virtual-list/VirtualList.test.ts:35–41,63–69`。#48要求“有限DOM与滚动状态”。resize仅测顶端，底部清空后直接卸载；缺底部resize→清空恢复→重排组合。建议断言恢复后的可见身份/有限DOM；未确认产品失败，不阻塞。

F1双向续拖50px、下一手势、同值外部index事件，以及F2 loading起落后的松手/取消/复用，本席轻量核验通过。宿主立即更新无去重掩盖。原四probe字节相等；已读原receipt、final-public.json/log、四probe、fix/handoff及仓内f1-f2/README。实施收据head4PASS、含base7PASS/1FAIL（baseF2）保留来源，未冒充重跑；原R1 FAIL保留。

六件/中性路由/旧五入口/公共CSS已核对；未见API、依赖、SDK、冻结素材越界。原位移去重属Standards，本轴不计。未扩#35/#49/#43/#51或旧库同步。本席全套测试、build、浏览器、CI、物理设备UNRUN；未改仓库、启动服务、监控或合并。


双轴合计：Standards material0/optional2（其中1项是同一Spec覆盖建议）；Spec material1/optional1。去重后material1（继承、新发现P2），optional2（均R1既有）。最严重分别无硬违反 / P2回撤后误刷新。独立R2结论：拒绝集成。

归档工具说明：首次清单遍历发现Vitest在外部probe生成node_modules/.vite缓存，校验主动失败并停止，未生成归档；随后统一过滤缓存目录重试。缓存不作证据，测试原始日志与FAIL不改。
