# R1 数量显示返修

仅修 recipe 明细数量：cell-value 使用与图例一致的 zh-CN 最多三位小数，真实零保留；非有限运行值显示 —。原始 distribution 数组和数值不变。明细列标题同时显示宿主 unit，空单位不产生空括号。未改公共 Table/Donut 或 API。

Requirement coverage：`keeps chart and detail quantity precision consistent without changing input values`，旧候选 RED 2 PASS/1 FAIL，修复后连同 recipe/demo/导航 18 PASS、0 FAIL、JSON success=true。断言图例和明细均为1.235、明细不露1.23456789、零保留、数量列单位、输入原值未变和替换后2.5退出旧显示。

Fresh：playground types/build、两份源码 lint/fmt、diffcheck通过；JSON缺 runtime/unhandled字段仍UNKNOWN。UI affected48仅继承。本轮未重跑原R1缺陷探针（其断言用于复现错误而非验证修复）。R1原FAIL及历史globalfmt/mainRAW/docsalias/timeout保留。R1来源全量布局对照尚未完成，需独立R2继续，不能据此宣布Spec完整通过。browser/visual/HTTP/docsLive/CI/packed/device/vendor/APS/productionUNRUN，旧应用接入退出NOT_PLANNED。

命令 cwd playground：`TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/screen/ScreenDashboardRecipe.test.ts src/screen/ScreenDashboardDemo.test.ts src/ScreenDemo.test.ts --reporter=json --outputFile=<外部报告>`、`../../node_modules/.bin/vue-tsc --noEmit -p tsconfig.json`、`../../node_modules/.bin/vp build`；fmt/lint cwd frontend。文档用oxfmt stdin非空输出cmp。最终对象见外部handoff。

## R2 数量列对齐

数量列显式 align=right，回归 `keeps chart and detail quantity precision consistent without changing input values` 增加真实表头和每行数值 td 的 text-align 断言。旧候选 RED 2 PASS/1 FAIL，修复后含宿主导航 18/18 PASS；types/build/scoped lint/fmt通过。仍保留输入原值、精度、单位和替换断言。来源完整 Spec 对照留独立R3完成；浏览器未跑。R2原FAIL和其它未运行边界不变。

## R3 KPI 单位层级

主KPI单位独立正常字重400与弱色screen muted，不再继承数字强调；补同处optional KPI tracking-tight及技术编号muted。`keeps primary units visually subordinate while preserving zero unknown and replacement` 从RED3PASS/1FAIL到含宿主导航GREEN19/19，验证公开DOM单位样式、零/12单位替换、unknown无单位。该测试证明声明样式而非真实视觉测量。types/build/scopedlintfmt和本文stdin比对通过。R3已完成Spec来源对照，仅有限继承；browser/CI等仍UNRUN，历史FAIL保持。
