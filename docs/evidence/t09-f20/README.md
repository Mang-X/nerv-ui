# T09/F20 基础 Chart 组合实施证据

范围：#191 / 父 #10，scope:M，仅现有 chart 页新增同族组合与同源源码。基线 `58eb4c3cedfc7155ec57cffbbb7bd9d578dabf8d`，tree `2e36df2c71088549637ac1557de780ab56a1b323`；开工 clean，PR #190 MERGED。结束 fetch 未发现 integration 漂移。

`ChartContainer → 宿主 meter/当前项按钮 + ChartLegendContent(items) + ChartTooltipContent(slot)`。三件从主桶真实 render，不修改 producer/API/config 计算合同。NvBarChart 无当前项选择事件，采用最小原生宿主图面，非新增引擎。config 只被接收，不声称注入或自动绑定。数据、图例与提示同源，按 key 读取最新值。

## 本地 fresh

固定命令前缀 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`。docs cwd `frontend/apps/design-system`：

- `exec vitest run --config vitest.config.ts`：25 文件 95/95，退出 0。原 94 条断言对应测试文件均逐字节保留。
- `typecheck`（vue-tsc）与 `build`（VitePress，含死链检查）退出 0。
- frontend cwd 对新增 Vue/test 和 vitest.config.ts 执行 `exec vp lint`、`exec vp fmt --check`，退出 0。
- `git diff --check` 退出 0。uv 脚本核实 183 旧页，其余页逐字节一致；chart 原文移除新增 import 后仍为完整原始前缀。非空 Markdown 二次 cmp 通过，旧链接保留。

| 行为 | 精确测试名与证据 |
| --- | --- |
| 零值、三位精度、当前项按 key 更新、已删除身份不残留 | `synchronizes real zero, keyed replacement, clear, restore and visibility across public chart parts`；真实 meter value、公开按钮 click/focus 与提示文本 |
| 隐藏/显示、清空/恢复后图面图例提示一致 | 同一测试；meter 数量、legend 文本及真实 tooltip slot 内容 |

首次局部 GREEN 1/1。反证 RED：将 replace 故意改为保留初始数据，测试 1 FAIL，预期 `窗边花园（更新）3.5`，实际旧名称 `12.346`；恢复实现后完整 GREEN 95/95。未把 import/class/source 字符串当几何证据。DOM focus/click 不是浏览器 Tab/Enter/Space 实测。

CSS stylesheet 解析告警及 Rollup PURE 注释告警保留于 raw。未发生其它准备 FAIL。历史 81/82 FAIL 细节 UNKNOWN，本轮未重现或改判。

## 独立证据边界

browser/HTTP/1440/390 亮暗/真实鼠标键盘交互/resize/overflow/提示裁切均 UNRUN，留父独立席；runtime 数字 UNKNOWN。CI 空不作 PASS，checks/reviews 以 PR 回读为准；packed/device/production UNRUN。旧应用接入与退出 NOT_PLANNED。未自审、runtime 签署、ready、merge、close、watch 或修改父票。

外部原始日志、source 与 SHA-256 回读：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f20-implementation-r1/`，入口 `handoff.md`。无 dist/deps 入证据。交付仅 draft 候选，不代表父 #10 集成验收。
