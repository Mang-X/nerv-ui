# T05/A06：大屏清单、分页与事件身份

范围为 [#63](https://github.com/Mang-X/nerv-ui/issues/63) 的三件 ScreenTable/Pagination/AlarmTable、`/#screen/tables` 宿主/fixtures/tests、串行壳与三 API 页。按已批准 [spec v1](https://github.com/Mang-X/nerv-ui/issues/1) 与父 [#6](https://github.com/Mang-X/nerv-ui/issues/6) 实施；不是父票组合验收。

工作树 `/Users/mang/Project/nerv-ui-worktrees/t05-a06-screen-tables`，分支 `feat/t05-a06-screen-tables`。基线 `f9ff36d2a9331328070dbb15e46c5c40e17aed13`，tree `8579125f8a6812fdab5843afee70cf26d2e288c5`。交付前 fetch/merge `origin/integration/nerv-ui-extraction`；最终 head/tree/base/PR 在外部 handoff 固定，避免自引用提交 SHA。未写 root checkout、双 main、自动 Nerv-IIP 工作树或旧源 `79b1578f2b75f55709765b5e7882aaf33146c603`。

## 合同与来源

- 主桶与既有 CSS 入口不变，未改导出、tokens、全局覆盖、原版/冻结素材或依赖。ScreenTable 的原值和 slot 行回调已满足合同，保留默认工单示例与 `rowKey='wo'`；只修吸顶表头透字：自身 scoped `nv-components` 中用已有不透明 `--nv-scr-bg-accent` 并补 z-index，不接管宿主全局 `th`。
- Alarm 保留旧六字段、标题、more、5 行默认值与二级呈现。新增可选 `rowKey`、部分 `labels`/`levelLabels` 与 `cell-level`/`cell-status`。slot 收到完整当前行与原值，宿主附加字段类型为 unknown；旧具名六字段 interface 无须索引签名。默认「已恢复」绿色兼容；传状态 slot 后旧中文判断完全退出，文字不会偷偷决定色调。
- 中性宿主把空间/参考号适配到旧 `line`/`wo` 字段，未用 rename 掩盖含义。`event-001`/`event-002` 同为 REF-7，独立 `id` 维持身份，不按业务引用去重。静态 `more` 一直是说明文字，无链接/导航能力。
- Pagination 仍受控，只对用户请求另一有效页发一次事件；total 改动不自动发事件。host 同次替换 rows 与 page=1，再 slice 18 项。未知总数明确显示未知并隐藏分页，不传假 0。有限正整数尺寸/非负整数总数是推荐合同；0/负/NaN/Infinity pageSize 窄回退到旧默认10，不新抛错。小数或非法 total 未扩展为通用校验框架，host 仍负责同一有效尺寸与页号。
- 固定高容器原生双向内滚，事件内容区域可 Tab 聚焦。无服务查询/查库、通用表格 DSL、SDK、规则框架；#64、T08 #40、PC #31/#43/#51 均不扩。增量留新库，旧消费者接入时由对应 owner 决定回传。

## Requirement | Evidence

U=`frontend/packages/ui/src/components/screen/ScreenTables.test.ts`，P=`frontend/apps/playground/src/screen/ScreenTablesDemo.test.ts`，壳=`frontend/apps/playground/src/ScreenDemo.test.ts`。均从主桶公共 mount/setProps/slots/events/DOM 观察，无 private VM 或纯镜像分页算法测试。

| Requirement                                                                | Evidence                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 六列表头、优先级文案、同 reference 两事件、keyed 重排/替换/empty/recover   | U `Alarm neutral headers level text and explicit state slot preserve distinct event identity across reorder replacement and empty`；原实现 RED，中性接缝 GREEN。以 input DOM 节点复用证明身份，非仅检查两条文本存在。                 |
| 旧默认、显式空行、静态 more                                                | U `legacy Alarm defaults remain six columns five rows and restored state while more is plain text`；基线原本 PASS，未伪称 RED。                                                                                                       |
| 级别/状态显式 slot 不受任意中文判断                                        | U `Alarm level and state slots own explicit tones regardless of Chinese words and update with input`；原实现 RED，slot GREEN。                                                                                                        |
| 空字符串列头/级别/状态不被默认值吞                                         | U `Alarm explicit empty labels level text and status stay empty rather than falling back`；原实现 RED，GREEN。                                                                                                                        |
| 旧具名行 interface 可赋值性                                                | U `Alarm accepts existing named six field row interfaces without requiring an index signature`；原 API PASS。本次初版索引签名引入类型 FAIL；`legacy-types-red.log` 公共 mount 类型检查 exit2，修复后 `legacy-types-green.log` exit0。 |
| Table 0/空/—、列对齐、slot callback 当前行与重排/替换/empty                | U `Table preserves zero empty dash and cell callback identity through keyed reorder replacement and empty`；基线原本 PASS。                                                                                                           |
| prev/next/首末/窗口/ellipsis/range/total0、受控一次事件与 total 不自动改页 | U `Pagination windows boundaries ranges and controlled updates never emit on total replacement`；基线原本 PASS。                                                                                                                      |
| 非法尺寸不产生 Infinity/NaN 页与区间                                       | U `Pagination invalid sizes use the legacy default without invalid pages or ranges`；基线 size0 显示 Infinity/1–0 RED，回退10 GREEN。                                                                                                 |
| host 实际切 rows、回调 ID、缩量/未知/empty/recover/刷新/换源               | P `host controlled pagination changes actual row IDs range and slot callback once then resets on smaller total unknown empty and recovery`；实际19…36、range19–36、事件一次与重置不增次数。                                           |
| host 同引用事件与显式状态、倒序/替换                                       | P `host retains two independent events sharing a reference and explicit priority state presentation after reorder and replacement`。                                                                                                  |
| 深链、已完成入口与往返重置                                                 | 壳 `opens tables deep link preserves completed links and resets rows and focus when returning`；旧壳错开 stage 的 RED→GREEN。jsdom 只证明状态/入口/portal 缺席；真实 focus/几何另列。                                                 |
| 固定高双向内滚与表头不透字                                                 | browser `browser-07.log` exit1 / `header-assert-red.json`，旧背景 rgba(255,255,255,.04)；`browser-09.log` 与 `header-green.png/json`，最终不透明 rgb(8,16,32)、真实 TH 命中、scrollTop325。                                           |

最终八个 U 在固定基线三件原源码上对照为 **4 FAIL / 4 PASS**；最终八个 GREEN。`baseline.mjs` 在 finally 恢复源字节，固定比较对象，失败与通过各自保留。P 首次名为 `host-red` 的运行实际已经 PASS（异步 runner 启动时文件已创建），**不算产品 RED**；`host-missing-red` 是主动撤下组件后的导入接线 FAIL（tests=0），也不算行为 RED。宿主的真实行为由最终公共测试与 browser 独立验证。

## Fresh 本地门禁

初始无 node_modules。首个 corepack 默认选到12.15.0，被版本护栏拒绝，未安装；`install.log` 保留。随后 task-local shim 显式 `corepack pnpm@11.22.0`，只 frozen install 成功一次（`install-pinned.log`），嵌套 PATH 同样固定；未改全局 pnpm，Python 只 uv。

所有命令显式 workdir 为本页工作树。外部 `run.mjs` 固定 cwd、保存 stdout/stderr、参数与退出码；`gates.mjs` 串行执行：

```sh
node /tmp/nerv-ui-t05-a06/handoff/gates.mjs
node /tmp/nerv-ui-t05-a06/handoff/run.mjs build-delivery -C frontend build
node /tmp/nerv-ui-t05-a06/handoff/validate.mjs
node /tmp/nerv-ui-t05-a06/handoff/audit.mjs
node /tmp/nerv-ui-t05-a06/handoff/maintenance.mjs
```

`gates.mjs` 实际命令为 `pnpm -C frontend --filter <package> test`（UI/mobile/host）及 `test:docs`（UI/mobile），每 lane `--reporter=json --outputFile=/tmp/nerv-ui-t05-a06/handoff/raw/<lane>.json`。最终 UI **752**（基线744+8）、mobile **144**、host **119**（基线114+3行为+2新增源码导入检查）、静态 docs **6+2**；全 exit0、JSON success=true、failed/pending/todo0、所有 suite/assertion passed。日志无 Unhandled Errors/Unhandled Rejection/uncaughtException；runner 没有 numUnhandledErrors 字段，不把字段缺席当字段值0。

生产 build 包含三个活动包 vue-tsc。早期 slot fixture 类型过窄、宿主 unknown class、初版具名 interface 回归的类型 FAIL 均留原日志，不以最终 PASS 擦除。CSS parser、VueUse PURE/INVALID_ANNOTATION 与 chunk 警告保留。本次 scoped fmt 首次 FAIL（10文件未格式化）后修正；维护精确文件列表与 fmt/lint/diffcheck 见 `maintenance-files.json`。历史全量 raw diffcheck exit2 与冻结 fmt exit1 仅继承，不重跑或顺修。

`dependencies-final.json` 对16份完整 manifest/lock/workspace 输入逐字节 SHA256 比较，未升级；UI/mobile/playground 实际 Vue realpath 唯一。所有桶、tokens、A04 helper/Freshness、冻结素材不变。A01–A05 完整既有行为测试随 UI/host 套件运行；未重做 A05 全 browser matrix。

## Fresh browser 与资源

先 T3 preview status/open，打开 `tab_1z_6faab953-90e1-4ff7-b4aa-20aa9696713e`；同一步两次 snapshot 原文均为 `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`，按用户要求切 ego-browser。只有 TaskSpace21，p1 为本页、p2 原生设置页；不是新建 Playwright 框架或物理设备。

| Requirement                                                    | Evidence                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1920×1080、1366×768、fit 精确0.5                               | `browser-18.log`（最终dist重跑）/ `viewport-matrix.json` 三个实际 viewport；960×621 中工具栏81、舞台960×540，transform matrix(.5,0,0,.5,0,0)。                                                                                                                               |
| 双向内滚/长值/表头/实际页与键盘                                | 同矩阵实际 wheel 使两表 scrollLeft/Top>0，document保持0；Enter next，19…36/range19–36/事件1；末页145…153/range145–153且 next禁用，再返1页。`tables-1920/1366/960.png`；`browser-19.log` / `keyboard-scroll-regions.json` 另以真实ArrowDown证明两个可聚焦内容区确实滚动。     |
| Space分页、slot callback、缩量/unknown/empty/recover/刷新/换源 | `browser-11.log` / `host-updates.json`：Space next、键盘选collection-019，缩7项后尚未选择，全部替换保持分页事件1；unknown隐藏分页，empty显式0，恢复153；事件倒序与replacement两ID。`reload-reset.json` 证明真实深链刷新回初始值。                                            |
| 四种外层 light/dark × neutral/blue                             | `browser-14.log` / `outer-themes.json`：实际 class、品牌按钮与 --brand，screen背景固定rgb(3,5,11)、color-scheme dark，显式状态色未被外层主题或中文词决定。                                                                                                                   |
| 路由往返与低动效键盘                                           | `route-roundtrips.json` 12条到stage/controls/indicators/data/charts与全部旧表面，旧表DOM/portal不残留、activeElement连接，返回页1/事件0；`reduced-motion.json` 仍可键盘next。首次 browser-12 因 stage 链接匹配两处而工具 FAIL，改用导航区域明确定位后通过，原FAIL保留。      |
| 原生125%与恢复100%                                             | 见 `native-125.json` / `native-zoom-restored.json`、原生设置与页面 `*-native-125-full.png` 截图；通过chrome://settings/appearance选择125%，actual DPR2→2.5且visualViewport.scale=1，不使用DPR/pageScale/CSS模拟。                                                            |
| 最终HTML/JS/CSS/实际加载字体                                   | `final-dist-resources.json`：仅页面已请求脚本/样式与实际加载woff2，再经真实浏览器fetch保存200响应体、逐字节比对最终dist及SHA256，共4份200响应（HTML/JS/CSS/实际加载Inter Latin woff2）；没有请求的MiSans/其他字体不认证。没有认证未请求字体/资源；无旧checkout/API/SDK资源。 |

普通 `page.screenshot` 在原生125%时生成1464×776的二次裁切图（当时实际CSS viewport1830×970），该工具输出不作为完整画面PASS。`browser-16.log` 改用无clip的 `Page.captureScreenshot` 保存完整原生图，并记录前后viewport/DPR；保留先前裁切文件，不以新图覆盖。`browser-05` 在resize后尚未等待Vue几何更新即取值，属中间观察；正式矩阵每次等待两次RAF并核验实际viewport，不能把该中间矩形当验收坐标。

## 证据保存与边界

临时原始目录 `/tmp/nerv-ui-t05-a06/handoff/{raw,browser}`；可持久保存副本 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t05-a06-final`，含脚本、JSON、截图、响应字节及 handoff。复制过滤 node_modules、clean checkout、.vite/cache，仓库不提交原始大文件。最终静态资源身份与截图均对应交付 dist；最终 SHA/tree/PR 以 handoff 为准。

CI、#11 packed install、#10 完整文档站运行、物理设备、旧消费者接入、父 #6 最终组合验收均 **UNRUN**。本地 PASS 不替代这些 lane。保留 #63/#6/#1 open 与 PR18 draft，由独立 merger 审核合入 integration；本实施者不 merge、不关闭 tracker、不轮询监控。未触碰无关旧 P3。
