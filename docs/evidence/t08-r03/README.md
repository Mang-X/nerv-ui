# T08/R03 实施证据

范围 M，#21 单一 FusionBg 展示接缝，独立 draft PR，目标 integration/nerv-ui-extraction。未经独立审核；不 ready/merge/close/watch，不解锁 #37，不修改 #23/#43 或 P15。旧应用接入 NOT_PLANNED。

## 对象与来源

唯一 checkout `/Users/mang/Project/nerv-ui-worktrees/t08-r16-action-summary`，branch `feat/t08-r03-fusion-background`。起点 HEAD `2f2f2fd15fa10888d5663b30be7b33e62fd85daa`，tree `d7270f50a7b2711a631267f76027c58f5f434849`，初始 clean。结束 fetch 目标分支仍为同 SHA，无 delta，无 reset/checkout 切换。最终对象以本记录所在提交及持久 handoff 为准。

固定 source `79b1578f2b75f55709765b5e7882aaf33146c603`。完整读取 FusionBg.vue，固定素材全树 `rg -n FusionBg migration/materials/source/frontend/apps/screen` 无直接引用（文件自身不含该标识符），因此没有直接 consumer 模板/CSS 可迁。原始文件包含 7 个业务节点、7 条关系及图标组件；新件全部改为显式输入，不复制行业默认。保留 cell=34、U=.866、V=.5 三面投影、顶部图标、双行文字、二次曲线与有向 dash 流动；颜色映射 screen tokens，键由 id 替换索引。曲线弯度改显式 bend，禁止重排改变曲率。

Source SHA256: e102118d3b2256c667e462d8f2c3245bd8afdfc1835bdb0aff930bd868f11df3。`git diff -- migration` 为空；source/reference 原字节不动。旧父仓禁写，未读取/操作 newmain、P15 或其它候选。历史材料只读当前相关入口，未审阅全库历史。

## 输入和边界

nodes/edges 空默认；节点 geometry、label/caption、可信纯显示 icon 和显式 tone 由宿主控制。无 events/slots，无业务 SDK/auth/fetch/图布局引擎，无交互图编辑。图标在装饰 SVG 内，标签文本转义；宿主可读描述重复完整长标签。图标不接受按钮等交互内容。无数量/单位指标或技术值 UI，foundation 数量最多三位小数/右对齐/tabular、单位空格普通弱色、技术值 mono-xs-muted 本轮无适用字段。

无 defs/id/href/use/marker/gradient，独立 app 根没有内部引用冲突；组合有定义的 ScreenLayout 时 SSR 服务端/客户端提前配置唯一 app.config.idPrefix，不能仅凭 useId 宣称跨根安全。无随机/RAF/timer/observer，无迟到回调资源。低动效 CSS animation:none 保留图形。有限合理范围坐标，零与负坐标合法；尺寸非负、cell>0，id 集合内唯一。

## Requirement → Evidence

| 精确 test name / 对应行为                                                           | Fresh evidence             |
| ----------------------------------------------------------------------------------- | -------------------------- |
| projects source faces icons escaped labels and directed zero-negative endpoints     | final-ui-1.json / passed   |
| updates same ids reorders reverses deletes and clears without stale paths or labels | final-ui-1.json / passed   |
| isolates independent app roots without SVG references and has no default topology   | final-ui-1.json / passed   |
| declares transparent decoration and reduced motion without runtime resources        | final-ui-1.json / passed   |
| shares changed cell geometry and keeps coincident endpoint curves finite            | final-ui-1.json / passed   |
| shows two neutral graphs and clears and restores through host controls              | final-host-1.json / passed |

第一轮 RED 使用有效已导出空 SVG 组件，模块可解析，三个 DOM 行为失败（red-1.json）；第四项 raw URL 读取失败是测试准备缺陷，不计行为 RED。修正为 ?raw 后低动效仅声明性验证。host-red-1.json 是有效空 SVG 下宿主行为 RED，0/1；final-host-1.json 1/1 GREEN。最终 UI 267/267（含本件 5 项、R02/R04 与命名/文档覆盖），final-ui-1.json。后加 cell/coincident 边界有 GREEN，无单独 RED 声称。

失败保留：最初测试准备命令 cwd/相对路径错误未写文件、未执行测试；green-1 3/4（raw URL）；green-2 265/266（格式敏感断言）；host-1 suite import FAIL（缺 @lucide/vue，0 行为测试，绝非 RED）；首次类型检查 get().exists 类型错误 exit2，未有完整持久日志，UNKNOWN 原始输出；改用 find 后通过。构建带既有 vendor PURE 注解警告。测试日志含 CSS parser 警告；JSON 未提供独立 runtime unhandled 字段，UNKNOWN，不签 runtime 无错误。

## 实际命令与结果

所有命令显式 cwd；Node v24.18.0，frontend pnpm 11.22.0。根 pnpm 12.0.0 仅版本探针，非正式门禁。无安装/升级。

- cwd `frontend/packages/ui`: `pnpm exec vp test run src/components/screen/FusionBg.test.ts src/components/screen/ScreenBackgrounds.test.ts src/components/screen/ScreenLayout.test.ts src/nvui-naming.contract.test.ts src/nvui-doc-coverage.contract.test.ts --reporter=json --outputFile=<checkout>/docs/evidence/t08-r03/final-ui-1.json`，exit0。
- cwd `frontend/apps/playground`: `pnpm exec vp test run src/screen/FusionDemo.test.ts --reporter=json --outputFile=<checkout>/docs/evidence/t08-r03/final-host-1.json`，exit0。
- cwd `frontend`: `pnpm --filter @nerv-iip/ui typecheck`、`pnpm --filter @nerv-iip/playground typecheck`、`pnpm --filter @nerv-iip/playground build`，exit0，types-build-2.log。
- cwd `frontend`: scoped `pnpm exec vp lint` 本件组件/测试/两个宿主文件，exit0，lint-1.log；scoped vp fmt 新增/改变代码与 MD。根 MD 用非空 stdin 输出再 cmp 验证；人工检查新链接实际路径与 @include，不称整个文档站门禁 PASS。
- `git diff --check` exit0；fetch integration 无 delta。未运行全桶或历史失败的反复验证。

## 未运行与继承

Browser/visual/HTTP/docs live/CI/packed/device/vendor/APS/production UNRUN，许可 UNKNOWN。尚需父级独立 review 与必要视觉 AC：立体层次、长标签真实布局、曲线方向动画、系统 reduced motion、实际指针穿透；DOM 和 CSS 声明不是这些 PASS。SSR 水合 UNRUN。

没有继承通过结论。用户告知历史 C02 vendor 整桶 432 PASS / 1 timeout，原 log 缺失；历史 globalfmt 3、main RAW 2、docs alias ENOTDIR、parallel timeout 保留，不顺修、不重跑、不称 skip。本轮不触及 #23 PR128 的视觉 reduced/Enter、#43 PR122 keyboard 或 #37 状态。
