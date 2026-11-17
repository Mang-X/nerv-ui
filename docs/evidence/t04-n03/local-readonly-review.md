# #47 提交前轻量只读审查

审查对象固定为 base `0e487bdbb51c9d041b71576f41585ac80244f2c1` → Git tree `ab29e5054b74f5179748d5115573e38a3db3701d`。已通过 `git cat-file` 核实对象类型为 commit/tree，使用 `git diff base tree`、`git show tree:path` 审查全部 16 个变更文件，没有审移动中的工作区源码。

结论：material findings **1**（P2）；Critical **0**；optional **1**。建议先窄修下述滚动回写，再进入提交。本席不作合并或完整验收结论。

## Material findings

### P2：日列滚动处理回写自身位置，新增提前吸附回归

- 位置：`frontend/packages/ui-mobile/src/components/date-picker/MobileDatePicker.vue:44–48`，尤其第 48 行。
- 触发：用户滚动“日”列，原生 scroll 事件发生在非整项位置，例如 `scrollTop=10` 或 `55`。`onScroll('d', ...)` 取整草稿后，无条件在 nextTick 调用 `scrollTo('d', ...)`，再次设置正在滚动的同一列。
- 证据：本席从两个固定 Git 对象提取实际 `onScroll`/`scrollTo`/`normalize` 函数，在内存中去除 TypeScript 类型并配以最小滚轮对象和 nextTick 队列运行。输入 10/55 时，base 的最终位置为 10/55，候选为 0/40；两者草稿日均为 1/2。候选不再让原生滚动过程保持中间位置，而是在每次事件后强制跳到整项位置。
- 影响：原有日列连续滚动被程序反复校正，提前吸附、干扰拖动及惯性滚动；这超出了年月变化时夹取非法月末的修复范围。物理触摸与浏览器手势的具体表现本席未运行，不能把上述函数探针写成真机或浏览器复现。
- 最窄建议：只在年月列变化需要校正日列时回写日列位置，例如至少排除 `key === 'd'`；日列自身滚动仅更新草稿，继续交给现有 CSS scroll-snap 收尾。补一条非整项日列 scroll 不回写自身位置的轻量回归即可。现有 `MobileDatePicker.test.ts:14–18` 总是设置 `index * 40`，且新增用例主要滚动年月，无法暴露此回归；未发现这些断言造假。

## Optional

1. `docs/mobile-standalone.md:100` 的 `evidence/t04-n03/README.md` 在候选 tree 中不存在。该句又将“四态浏览器与资源身份”指向此目标，目前读者无法取得相应记录。交付打包时补入对应证据入口，或将此句改为准确的待完成状态。鉴于用户已明确横屏仍在补，本席不把它升级成运行行为缺陷，也不据此认定四态已通过。

## 已核对且未发现其它 material 问题

- 根 AGENTS/README、ui-mobile AGENTS/CLAUDE、当前 `frontend/DESIGN/governance.md` 及 `gh issue view 47` 的 scope。包内指向旧 `frontend/AGENTS.md`/ADR 的历史坐标没有作为新库现态依据。
- 宿主仅增加三个职责模块，由页面组合；8 件目标能力、`#mobile-overlays` 与原四入口保留。稳定裸包导入，未新增 manifest/lock/API/SDK 依赖变更。
- Picker 初始受控打开、外部 model/options 变化、按 value 保留重排草稿和移除后的回退；DatePicker 初始打开、外部值/年界同步与合法月末夹取。
- 实际滚轮 ref 挂载后的定位路径、确认与取消分离、动作值身份、下拉组单开/重排、collapse slots、公开 body/selector/HTMLElement overlay target、键盘优先指针层和页面卸载清理。

## 证据与权限边界

- fresh：固定对象静态审查、只读读取 #47、上述函数级基线/候选对照探针。该探针没有挂载 Vue、运行测试套件或浏览器。
- 继承/只读核对：`/tmp/nerv-ui-t04-n03/mobile-final.log` 显示 93 passed，`host-final.log` 显示 52 passed；原始来源复测日志 `selection-final-tests-original-source-red.log` 保留 6 failed / 2 passed，`details-public-baseline.log` 保留原本已通过的 3 passed。后续 GREEN 与用户提供的 UI644、naming/docs/build 属于实施席证据，本席没有 fresh 重跑，也没有将 baseline 已通过行为伪造为 RED。早期 `gates.json` 的 build exit=2 与后续 `build-fixed.log` 的 exit=0 均保留。
- UNRUN：重型门禁、测试套件、真实浏览器/横屏、物理设备、CI、发布和原库接入。本席不将仍在补的真实浏览器横屏验收写成全过；外部日志未据本次审查重新建立完整 tree→运行资源身份链。
- Declined to judge：#51/#43 底层继承问题及 Reka 升级、#48/#49、父 #5、T08、#11，均按用户指定范围排除；物理键盘/触摸与完整视觉焦点矩阵留给对应运行验收。本席没有派生代理、改仓库文件、提交、合并、发评论或创建 PR；唯一写入为本回执。
