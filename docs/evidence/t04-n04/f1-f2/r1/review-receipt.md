# N04 / #48 / PR #54 独立 merger R1：拒绝集成

审查对象：https://github.com/Mang-X/nerv-ui/pull/54；验收：https://github.com/Mang-X/nerv-ui/issues/48。

- base / root integration：d730e76ac576baa7c1509a50af4857fd9370a5bd；tree 15e1a96428c55ee33a85331feefef25f247a7d13。
- head：19f0888391e2be27a5a58503724ac8e99706e8c2；tree b2890bdd6a39f2dc3f9b4618856913c3eb302704。
- diff：git diff d730e76ac576baa7c1509a50af4857fd9370a5bd...19f0888391e2be27a5a58503724ac8e99706e8c2。
- 只有一条交付 commit：19f0888 feat(mobile): 交付 N04 手势列表与轮播独立演示。
- 本席不改码，不提交、不 push、不合并、不关票、不 ready、不监控/轮询。发现 material 后停止 acceptance/merge；新 head 必须重新独立审查。

## Material（2）

### F1 / P2 / 新增回归：外部切页被算进拖动位移

定位 frontend/packages/ui-mobile/src/components/swiper/Swiper.vue:164–165（新增 watcher），关联 :118–123（松手判页）。Owner：本 PR NvSwiper 受控同步修复。#48 要求“验证受控事件”，本票明确验证受控页与连续操作；不是 #35 的高层列表恢复，也不是其它延期票。

稳定公开输入：三项 items、公开 index、DOM offsetWidth=300 的明确 jsdom 几何 seam；index=0，pointerdown x=150，pointermove x=130，宿主 setProps(index=1) 并等待，再 pointerup。真实指针位移仅20px，小于60px阈值，head 却额外发出 update:index(2)。反向 index=2，x130→150，再外部 index=1，松手额外发出 update:index(0)。两个方向 baseline PASS、head FAIL。

根因：watch(active)改 offset，起手 startOffset 未更新；onUp 将外部切页的300px也计入用户移动。修复应取消或重新基准化进行中的手势，并保留外部切页本身的轨道同步；本席未改实现。回归用例不能要求保留 baseline 外部 index 不同步的原缺陷。

### F2 / P2 / 继承验收缺口：loading 在手势中变 true 后仍请求 refresh

定位 frontend/packages/ui-mobile/src/components/pull-refresh/PullRefresh.vue:71–79，关联 :105–107。Owner：当前 N04 的 ui-mobile/PullRefresh 防重复验收；旧库回传仍归 #14。

公开输入：modelValue=false、顶端起手 y10→260，下拉跨阈值；宿主因另一刷新设 modelValue=true 并等待，此时可见“刷新中”；随后 pointerup。预期不再发 refresh，实际仍发出一次，可能启动与正在执行请求并行的第二请求。onMove 检查 loading，onUp 没有检查；loading=true 没有撤销旧 engaged。

此缺口 baseline 与 head 都 FAIL，明确不是本 PR 新引入。它直接违反本票证据矩阵的“loading 期间防重复”，且用户要求主动验证动态 loading；不任意扩大成其它继承缺陷整改。对照“loading=true 时起手不请求，清除 loading 后新手势仅请求一次”两者都 PASS。

## Fresh Requirement | Evidence

| Requirement | Evidence |
| --- | --- |
| 外部受控切页不把短拖动放大成额外翻页 | keeps the externally chosen page after a short drag - external-forward / external-backward；baseline 2 PASS，head 2 FAIL；raw/final-public.json 与 .log |
| 动态 loading 防重复及完成后重入 | does not emit another refresh when the host starts loading during an eligible pull：base/head各1 FAIL；ignores a pull started while loading and permits one after completion：base/head各1 PASS |
| 现有受影响公开行为测试 | official-pull-refresh 6/6 PASS；official-swiper 5/5 PASS；JSON完整解析，pending=0；它们未覆盖上述交错输入 |
| 固定对象、依赖与冻结范围 | raw/final-audit.json：16个dependency inputs逐字节相等；migration与原版零changed；三树clean、SHA未漂移 |

最终外部 probe：8执行，4 PASS / 4 FAIL，0 pending，原生exit1。head是1 PASS / 3 FAIL；base是3 PASS / 1 FAIL。不是绿色门禁。组件probe只用props/slots/事件/DOM和明确几何输入，无私有vm；MouseEvent构造pointer事件是合成单元输入，不能称真实触控或浏览器。

复现命令（workdir=/private/tmp/nerv-ui-t04-n04-merger-r1-20261024）：

    /Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists/frontend/node_modules/.bin/vitest run --config /tmp/nerv-ui-t04-n04-merger-r1-20261024/vitest.config.mjs --outputFile=/tmp/nerv-ui-t04-n04-merger-r1-20261024/raw/final-public.json

官方两条命令 workdir 都是 /Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists/frontend/packages/ui-mobile，PATH=/tmp/nerv-ui-t04-n04/bin:$PATH，corepack pnpm@11.22.0 exec vp test run src/components/pull-refresh（6）/src/components/swiper（5），default+JSON reporter，路径见 raw/official-*.json。未重新安装依赖。

## Optional（2，不抵消 material）

1. Standards P3：Swiper重复位移同步表达式，可后续集中；纯判断，无公开反例。
2. Spec P3：VirtualList底部Resize、清空恢复与重排组合断言可补强；未确认稳定公开失败。

## 证据与未运行边界

- Fresh：本席对象/在线issue与PR读取、两个具体组件的公开交错反例、base/head对照、官方6+5测试、16输入字节与冻结范围核对、最终三个工作树状态及tracker读取。
- 实施者mobile108/naming6/docs2、UI644/docs6、host66、clean frozen/type/build、四态24组browser及资源桥接均保留“实施席”身份。本轮因material拒绝集成，不认证这些为本席fresh通过，也未以继承browser PASS做验收。
- 本席 fresh build、fresh browser、响应/dist/hash桥接、全mobile/UI/host门禁、scopedfmtlint和clean install均 UNRUN；停止合并后无必要重复。原browser07 FAIL与其它实施harness失败保留在原证据目录，不清洗。
- CI、packed #11、物理touch/iOS/Android/PDA/非零安全区、旧库接入与发布均UNRUN。
- 本席harness失败保留raw/probe-harness-*.log：外部/tmp realpath/CWD导致模块未找到、vp拒绝workspace外目录、vitest CommonJS alias失败；修正为/private/tmp cwd与ESM vitest alias后才实际执行。另一次BSD sed追加语法错误未修改config，重复run的模块失败同类；audit-final在官方Swiper尚未结束前读JSON的ENOENT为收据时序错误，等待runner退出后成功重跑。读取不存在的PullRefresh.scroll-restore.test.ts失败后转真实文件；旧源误用新库diff坐标的fatal只读错误未产生变动。上述不作产品finding。
- CSS parser警告原样保留；失败输出没有过滤、skip或修改断言装绿。

## 集成与清理

- PR54 OPEN、head未漂移、base integration、MERGEABLE/CLEAN、statusCheckRollup为空；没有执行gh pr merge。
- 本地root与远端integration仍d730e76ac576baa7c1509a50af4857fd9370a5bd，root/task均clean；新库main仍599031a688496679e300458f56a1896d41ac8f81。
- 旧源HEAD79b1578f2b75f55709765b5e7882aaf33146c603、tree58e30c637acb7efdd393af291e570288b03b5aa9、status空；旧源main ecb7626378e446dcc361cfc4f3c43227ba7e8364未改。
- #48/#5/#1/#43/#49/#51继续OPEN；#18继续OPEN且draft。没有GitHub评论/Review或状态写入。
- 没有启动浏览器/服务/设备；测试runner均已退出，wrapper均finally unmount。任务worktree保留给父controller修复归档。本目录没有node_modules/clean checkout；baseline/只有两个组件和utils的固定base字节快照。
- PR已link；最后list links结果在raw/thread-pr-links.json，watching=false。

## Standards（独立席原文）

# Standards：PR #54 / #48

固定 base `d730e76ac576baa7c1509a50af4857fd9370a5bd`；head `19f0888391e2be27a5a58503724ac8e99706e8c2`；tree `b2890bdd6a39f2dc3f9b4618856913c3eb302704`，已核实。

`git diff d730e76ac576baa7c1509a50af4857fd9370a5bd...19f0888391e2be27a5a58503724ac8e99706e8c2`

硬违反/material：**0**。已读指定材料；来源与文档同步符合 A、G 及包内规则；跳过工具强制项。五处实施修复不是前轮独立审核通过。

引用缩写：R＝`/Users/mang/.codex/skills/code-review/SKILL.md` §3；G＝`frontend/DESIGN/governance.md` 7–9、126–137；A＝`AGENTS.md` 6–10。全表依据 R，均属判断，仓规优先。
U＝`frontend/packages/ui-mobile/src/components/`；P＝`frontend/apps/playground/src/`。
S＝U`swiper/Swiper.vue`；F＝U`pull-refresh/PullRefresh.vue`；V＝U`virtual-list/VirtualList.vue`；L＝P`mobile-lists/LetterCarousel.vue`；M＝P`MobileListDemo.vue`。

| Smell→处置 | 判断／规则／head hunk |
|---|---|
| Mysterious Name→rename | 0，资格命名清楚；G；F:47–68 |
| Duplicated Code→extract | optional P3；G；S:164–166 |
| Feature Envy→move | 0，DOM归组件；G；V:29–40 |
| Data Clumps→bundle | 0，无重复参数簇；G；L:9–17 |
| Primitive Obsession→domain type | 0，页码无需领域类型；G；L:13–16 |
| Repeated Switches→map | 0，无重复分派；G；F:47–68 |
| Shotgun Surgery→gather | 0，导航属AC；G；P`App.vue`:80–90、M:33–38 |
| Divergent Change→split | 0，五片职责分开；G；M:41–45 |
| Speculative Generality→delete | 0，无预留抽象；G；V:29–40 |
| Message Chains→hide navigation | 0，无长链；G；F:88–90 |
| Middle Man→inline delegate | 0，页壳承担布局；G；M:13–45 |
| Refused Bequest→composition | 0，无继承；G；V:1–40 |

optional：S 新增 `offset.value = -active.value * width.value` 与60、150行重复。后续调整位移策略时可提取同步函数；无公开行为反例，不阻塞AC。

继承owner：#43 TouchButton、#51 RadioGroup；旧库同步归#14，未移交本票（A；`docs/mobile-standalone.md`:76、116、118）。

本轮仅静态审查；测试/安装/build/浏览器均UNRUN。实施日志保留其来源身份，不计本轮fresh。未改仓库、合并、评论、监控或委派。

计数：全文 370 词（Intl.Segmenter，zh，含本行）。


## Spec（独立席原文，随后已由本席fresh复现两项）

# PR #54 / #48：独立 Spec 审查

固定 base `d730e76ac576baa7c1509a50af4857fd9370a5bd`、head `19f0888391e2be27a5a58503724ac8e99706e8c2`、tree `b2890bdd6a39f2dc3f9b4618856913c3eb302704`；工作树 clean，均已只读核实。

比较：`git diff d730e76ac576baa7c1509a50af4857fd9370a5bd...19f0888391e2be27a5a58503724ac8e99706e8c2`。

## Material：2 项（新增 1，继承 1）

1. **P2，新增：外部切页被误计为拖动距离。** AC 原文：“验证受控事件、结束/失败/重试、有限DOM与滚动状态”。`frontend/packages/ui-mobile/src/components/swiper/Swiper.vue:164-165` 更新 offset，却保留起手 startOffset；`:118-123` 用两者差值决定下一页。稳定公开反例思路：三页、稳定宽 300、index=0；pointerdown(x=150)，pointermove(x=130，buttons=1)，宿主将 index=1 并等待更新，然后 pointerup。20px 未过 60px 阈值，但新 watcher 令 offset=-300、startOffset=0，松手推导 delta=1，错误发出 update:index/change(2)，多翻一页。基线无此 watcher；应取消或重基准化进行中的手势。Owner：本 PR 的 NvSwiper 修复。

2. **P2，继承：拖动中进入 loading 仍可再发 refresh。** AC 原文：“验证受控事件、结束/失败/重试、有限DOM与滚动状态”；本票证据矩阵 `docs/evidence/t04-n04/README.md:20` 承诺“loading 期间防重复”。`frontend/packages/ui-mobile/src/components/pull-refresh/PullRefresh.vue:71-79,105-107` 松手未检查 loading，loading=true 也未撤销 engaged。公开反例思路：顶端 loading=false 起手并下拉 250px，宿主因外部刷新设 modelValue=true，等待更新后松手；仍发 refresh，造成第二次请求。现有测试只覆盖 loading 已为 true 后重新起手。基线已有同一漏洞，属于 ui-mobile/PullRefresh 的继承验收缺口，不称本 PR 引入；旧仓同步仍归 #14，不迁入 #35。

## Optional：1 项

补充虚拟列表底部 Resize、清空后恢复与重排的组合断言；现有浏览器脚本清空后恢复未断言窗口内容。暂未形成稳定公开反例，不计 material。

## 边界

静态核对六件、中性路由、五旧入口、裸包/公共 CSS、宿主取数所有权；未见扩 API、依赖升级或冻结素材变化。touch-action 初值/scroll restore、非顶端起手资格、取消、分页状态、虚拟窗口/身份及 observer/timer 清理未另发现确定 material。

本席仅新做只读审查；上述反例是代码推演，未执行。测试、安装、build、浏览器全部 UNRUN；实施者五处自查修复及保存的通过收据不视为前轮独立通过。#43/#51 保留原 owner；不验收 #35/#49 或父票，不合并、评论、监控、关票。


总计：Standards material0/optional1；Spec material2/optional1。最严重分别无硬违反 / P2新增受控轮播回归。最终合并决定：拒绝集成，返父修复。
