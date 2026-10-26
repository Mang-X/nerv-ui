# P11 快照风险与资源负荷实施证据

范围：#94，scope:M / 中，四件同展示 owner，一个独立 draft PR。基线 `c0f6e41421da5aaeb38e07474413a06b78c2ea0c` / tree `d914c0d1668d786ff587ded0f0af89428b862b42`。本页先盘点，命令与最终证据随后按实际填充。

## 来源能力与处置（实施前盘点）

固定来源 Nerv-IIP `79b1578f2b75f55709765b5e7882aaf33146c603`；四文件位于冻结 `migration/materials/source/frontend/apps/business-console/src/components/scheduling/`，保留原字节。研究 §3–7 / 附录64路径只作来源索引，不作当前实现事实。

| 来源                                  | 原能力                                                    | P11 处置                                                                                                           |
| ------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| SchedulingMaterialShortageSummary.vue | 总缺口折叠；物料/批次、数量/单位；受影响工单/工序二次展开 | 公开 MaterialShortageSummary；保留 shortages prop，新增 optional display 中性名称、单位、影响活动；不分配库存      |
| SchedulingPlanRisks.vue               | 物料按工单、设备按资源，两层分组；完整风险明细；冻结说明  | 公开 PlanRisks；保留 materialRisks/equipmentRisks，新增 optional display 类别/组/活动/严重度；不诊断风险           |
| SchedulingPlanConflicts.vue           | 阻断/未排直显；warning/info按原因折叠；generatedAtUtc     | 公开 PlanConflicts；保留 conflicts/unscheduledOperations/generatedAtUtc；显式 severity，不按文案猜；未知不归 error |
| SchedulingResourceLoads.vue           | 各资源 active/idle 窗口；零负荷折叠；未知显示             | 公开 ResourceLoads；保留 loads，新增 optional display 名称/时间；明确 null/缺失为 —，不从容量计算利用率            |

原四件属旧 app 私有 default 组件，无库公共导出或事件；旧七个公共组件/现有默认值/events不改。中性组合由 playground 拥有，事实/来源/时点/状态/动作能力由 host 给。旧业务 SDK/日期格式器不入运行图，不修改冻结材料。P10/P12–16、引擎/生命周期/投影/草案算法不在本票。

## 2026-10-27 接续与独立核验

前席未提交改动先保存于 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t07-p11-resume/predecessor/`：`tracked.diff` SHA-256 `18f5b7c055d70fab18e3cb9e32ca39feaa1ca7318c92d6955f1465213227b094`，`untracked.tar` SHA-256 `ad4c6de9e66563c5089cacef830ba7b4c4fc4de3703877b64a3a9338b3b2aa1c`。未纳入生成的 `dist-nested`。前席 `2026-10-26/t07-p11-implementation-r1` 目录无文件，本页不归属其 fresh PASS。起点为 integration `c0f6e41421da5aaeb38e07474413a06b78c2ea0c` / tree `d914c0d1668d786ff587ded0f0af89428b862b42`。

公开接缝为 `@nerv-iip/scheduling` 主桶的四件 default SFC 和类型，playground 的两个实际 hash deep link。旧 app 私有输入只作结构兼容；本轮公开入口回归补回原材料中受影响工单/工序、风险活动与冲突/未安排的已有身份。新 display 仍优先，不从 identity 计算准备状态或资格。

### 需求 → 精确测试 → 结果

| 需求 | 公开入口测试 | 本轮证据 |
| --- | --- | --- |
| 0 idle、null/nonfinite unknown、按资源保留窗口、外部换数组 | `keeps a true zero idle window while null utilization stays unknown instead of zero percent`；`shows neutral load names and exact host ratios while filtering idle and unknown separately`；`keeps nonfinite load metrics unknown and preserves explicit empty display over populated legacy arrays` | scheduling fresh GREEN |
| 批次/单位/影响项二层展开、风险完整分组和缺口 | `keeps batch units and every affected activity behind two disclosure levels without inventing missing counts`；`groups risk facts by category and stable group identity without dropping detailed shortages on replacement` | scheduling fresh GREEN |
| warning/error/unknown、空快照与当前/读取状态 | `keeps unspecified severity neutral while warning text containing error words never becomes blocking`；`shows blocking and unscheduled facts directly while warning and info stay independently grouped by reason identity`；`distinguishes empty snapshot current unknown missing forbidden and unavailable data for every public display`；`does not turn a missing payload into an empty record set even when the source is marked available` | scheduling fresh GREEN |
| 原私有数组的工单/工序/资源信息可见 | `preserves legacy order and operation identities in the public shortage risk and conflict displays` | fresh RED：10 discovery、9 passed、1 failed，受影响活动只显示“活动名称未提供”；补映射后 fresh GREEN：10/10 |
| 两中性领域实际 deep link、可见动作、替换/空态 | `opens both neutral snapshot deep links composes all four displays and returns to the existing desktop entry`；两条 `neutral ... snapshot selection always follows current risk and conflict activity identity after external replacement`；两条 `neutral ... snapshot distinguishes warning only zero idle unknown empty and current records without declaring readiness` | playground fresh 5/5；浏览器见下 |

以上 RED 原始 JSON 为外部 `legacy-red.json`，GREEN 为 `legacy-green.json`。首轮前席代码在本席重跑的定向测试分别为 scheduling 9/9、playground 5/5；这些是本席 fresh 运行，不冒充前席验收。完整 scheduling `vp test run src` 报告 `scheduling-full.json`：38 suites，301 discovery / 297 passed / 0 failed / 4 pending skip（既有 vendor stub），`unhandledErrors: null`，exit 0。playground `vp test run src` 报告 `playground-full.json`：30 suites，321 discovery / 321 passed / 0 failed / 0 skipped，`unhandledErrors: null`，exit 0。两份 JSON 字段缺省含义不改写为数字 0。`vue-tsc --noEmit` scheduling、playground 均 exit 0。playground `vp build` exit 0，仍有 `@embedpdf/models` crypto externalized、`@vueuse/core` PURE 注释与大 chunk 的既有构建提示；没有把提示称为 FAIL 或静默删除。

### 最终 fresh dist 的真实浏览器与 HTTP

用本轮 `vp build` 的 `frontend/apps/playground/dist` 启动本席 127.0.0.1:5189 preview。T3 preview 的同一步 snapshot 两次失败，原文均为 `Preview automation snapshot timed out after 15000ms.`；切换 ego-browser 后，在真实 Chromium 页面检查 `/#schedule-snapshot/library` 和 `/studio`。library 实际点击展开缺口、影响活动、风险类别/组、warning 组和 idle 窗口，看到批次“秋日一批”、3 张、活动、显式 warning、error 独立直显、0 分钟与 unknown `—`；点击活动、替换全部记录后旧组/旧资源退出且选中清空；warning-only 消去 error 与未安排；空数组保持“等待现场确认”；切到当前记录显示 09:45（Asia/Shanghai）、缺口 0 张与当前已排 15；unknown 读取状态藏四件正文。studio 390 CSS px 宽深链看到四件、创作活动与两级展开，文档横向无溢出。明/暗及蓝色主题 token 切换后恢复原值，窄宽开关操作后恢复。首次 studio 导航重置 CDP viewport 到 2300px，第一条断言退出 1；重新设 390px 后通过，属于浏览器设定失败，不计产品 FAIL。图片：[library 当前 390px](library-390-current.png)、[studio 冻结 390px](studio-390.png)；展开图和原始测试报告保存在外部 handoff 目录。

HTTP 对最终 fresh dist 的 `/index.html`、主 JS、runtime JS、主 CSS 实际 `200`，MIME 分别为 `text/html`、`text/javascript`、`text/javascript`、`text/css`；下载 body 与同路径构建字节 `cmp` 一致。大小分别 514、1,067,904、612、344,052 字节，SHA-256 分别 `1b1b0b2cb3d5631edd110e7eabd831116bfa2e411058b4d800063d325a279f9a`、`52b79a17604f32f68cb4dcfae6472de33a672c37b43559cf8e7d51eaddc78d82`、`f274af3d745c531243aedd39bc50813c6e0c009124334fee9a5f2e581c7cf623`、`9da1ef7f90010cd64acf79f9a809204d73d453e0a1bdd50ee275b825af175d50`。第一次 HTTP 脚本误用 zsh 保留变量 `path` 覆盖 PATH，`curl/cmp` 未执行，exit 127；纠正专用变量后全项执行，原失败保留。

### 不变项与独立车道

`frontend/pnpm-lock.yaml` 相对固定基线字节完全相同，SHA-256 `0cfcb1cc92892690db8aa848165280a49941f0cf8d7b868c721e641e4634ab07`，因此 973 个 package 对象、540 个 snapshot 对象及 importer、依赖边、peer、optional 元数据逐字节未变；16 个受影响工程输入逐路径无 diff。scheduling 与 playground 的 Vue realpath 同为 `vue@3.5.39_typescript@6.0.3`。冻结 migration 四件与 vendor 9.1.4 Evaluation JS/CSS 未改，版权/水印不动，商业授权仍 UNKNOWN。`git diff main...HEAD --check` 原有全历史 RAW exit 2（3,570 行诊断）；本票维护范围的 diff-check 单列，不抹去原失败。

本轮实际运行的是新库源码宿主、测试、类型、build、HTTP 与浏览器。CI、docs #10、packed #11、device、旧消费者 #13/#15、父 #8 全组合、真实 APS 后台、生产发布、商业授权及原生 zoom 均 UNRUN；四个 vendor stub skip 不升级为真实引擎 PASS。#94 留给独立 merger，#8 与 spec #1 保持各自状态。
