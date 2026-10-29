# T09/F21 基础 Tabs 实施候选

范围 #195 / 父 #10，scope:S，一个同族 draft PR。基线 `2160cfe08412a2b2f4b3c1ed354394de37be264c` / tree `ee4e4df97029138d950e8326dd735ac506bf757c`；开工 clean，PR192 MERGED。末次 fetch integration 无漂移。

现有 tabs 页追加 `Tabs → TabsList → TabsTrigger + TabsContent`，live 与学习源码共用 BaseTabsExample.vue。List default/line、Root horizontal/vertical 外部按钮均有 pressed 状态；当前值受控，禁用露台不参与选择，无业务保存。只补 List/Trigger 两个确认合同缺口，不重新裁决 Tabs 根。未改库/API/锁/治理/导航/永久 registry。

## 本地 fresh

固定 pnpm：`node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`，docs cwd `frontend/apps/design-system`。

- `exec vitest run --config vitest.config.ts`：26 文件 97/97，退出 0；原 25 测试文件（95 条）逐字节不变。
- `typecheck`、`build`（含 VitePress 死链检查）均退出 0。
- frontend cwd 对新增 Vue/test 与 vitest.config.ts 执行 scoped `exec vp lint`、`exec vp fmt --check`：退出 0。
- uv 字节核对：183 旧 Markdown 页保留；tabs 移除新增 import 后完整原文为前缀，原 Nv 例与链接不变，其余页逐字节相同。非空 Markdown 二次 cmp；`git diff --check` 通过。

行为测试：

- `links controlled selection to its panel and refuses disabled pointer activation`：真实 mousedown 更新选中态，active panel 文本与双向 ARIA ID 关联，disabled trigger 不激活、当前 status 保持。
- `retains panel across external variant and direction changes with automatic focus`：真实 focus 自动激活，再逐次切换两种变体/两个方向，公开 DOM 方向、变体、pressed、当前面板一致。视觉指示和对齐不以 class 断言替代。

先缺示例 import FAIL（准备失败）；首轮 selector 误取隐藏 panel，2 FAIL，按真实 producer 改取 active panel 后 2 PASS。行为 RED：故意把 v-model 改为单向 model-value，2 FAIL；恢复后完整 97 PASS。首次 shell 路径错误及 sed 错误、误在无测试配置位置运行的失败均保留，未计作行为 RED。CSS stylesheet 解析告警、Rollup PURE 告警见 raw。历史81/82 FAIL 细节 UNKNOWN，未重现或改判。

## 证据边界

browser/HTTP/1440/390 亮暗/真实鼠标、Tab、方向键、Enter/线条位置与横竖对齐/document overflow 全部 UNRUN，留父独立席；runtime 数字 UNKNOWN。CI 空不是 PASS；packed/device/production 独立 UNRUN。旧应用接入退出 NOT_PLANNED。未委派、自审、runtime签署、ready、merge、close、watch 或更改父票。

外部最小 raw/source/SHA 回读：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f21-implementation-r1/handoff.md`，不含 dist/deps。
