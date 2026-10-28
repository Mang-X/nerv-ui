# #51 移动单选快速释放实现候选

仅处理 [#51](https://github.com/Mang-X/nerv-ui/issues/51)，scope M，高难度，单独 Draft PR，目标 `integration/nerv-ui-extraction`。base `0072c1cec946b05a5744ae95f54097d608c12ef9`，tree `7dcc5dd72a51f6e96b55964f5ddd2ce14c6551d9`。这是代码候选证据，不是整票验收。

## 来源与根因

真实安装 `reka-ui@2.10.1`：`dist/RovingFocus/RovingFocusItem.js` 在 `nextTick` 移焦；`dist/RadioGroup/RadioGroupItem.js` 在 focus 的 `setTimeout(0)` 内才读 `isArrowKeyPressed`，window keyup 可先清除它。因此快速释放后焦点移动、值仍为 desk。base 的 mobile 两 wrapper 与 a20825e 完整字节相同；Group SHA-256 `844d86c8cf1788bc47b3b97cb5d12aef4dcb50ae83a72177113e86f7ce31cf88`。

仅改 [MobileRadioGroup.vue](../../../frontend/packages/ui-mobile/src/components/radio/MobileRadioGroup.vue)：保留 Reka 的方向、循环、禁用过滤与 DOM 导航；在其 nextTick 移焦和既有选择 timer 后，仅对仍聚焦于本组、未选中、未禁用的目标调用原生 click，经过真实 Reka select/取消/受控更新路径。正常点击（包括被取消的 select）取消补偿，避免重试或双发；新按键、pointerdown 和卸载取消旧任务。不拦截、不推迟 keydown/keyup，不延迟用户输入；补偿沿用 vendor 异步 focus/selection 时序。未改 Item、冻结层、依赖/lock、原始材料或公开 API；未增加 readonly 合同（RadioGroup 无此 prop）。

## Requirement coverage

[公开组件测试](../../../frontend/packages/ui-mobile/src/components/radio/MobileRadioGroup.test.ts) 使用真实 Reka producer 和真实 DOM focus/click，fake timers 仅控制 setTimeout/clearTimeout，卸载后排空并恢复，无 focus/selection stub。

| Requirement                   | Evidence                                                                                                                                                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 普通顺序完整快速释放          | `selects the roving focus after immediate keyup in 'ordinary order'`                                                                                                                                                                                                                              |
| keyed 重排后当前身份          | `selects the roving focus after immediate keyup in 'keyed reorder'`                                                                                                                                                                                                                               |
| focus 后 timer 前释放         | `selects once when released after focus but before the selection timer`                                                                                                                                                                                                                           |
| 长按与重复、每次移动单次选择  | `keeps long press and repeat navigation single-selection per movement`                                                                                                                                                                                                                            |
| programmatic focus、Tab、鼠标 | `keeps programmatic focus and Tab inert while mouse click selects`                                                                                                                                                                                                                                |
| 禁用项/组                     | `skips disabled items and keeps a disabled group inert`                                                                                                                                                                                                                                           |
| 双实例/卸载                   | `isolates instances and abandons pending navigation on unmount`                                                                                                                                                                                                                                   |
| 已 preventDefault             | `does not repair an already prevented keydown`（Reka 仍会移焦，wrapper 不补选）                                                                                                                                                                                                                   |
| select 取消                   | `honors a canceled select without retrying it`                                                                                                                                                                                                                                                    |
| 失焦/异步禁用                 | `abandons repair when focus leaves or the group becomes disabled`                                                                                                                                                                                                                                 |
| 同轮重排失焦                  | `abandons selection when a same-turn keyed DOM reorder loses focus`（jsdom 明确断言 body/desk/零 select，不主张浏览器相同行为）                                                                                                                                                                   |
| 既有公开宿主                  | [MobileInputDemo.test.ts](../../../frontend/apps/playground/src/MobileInputDemo.test.ts)：`keeps host focus and preference aligned after quick keyup in 'ordinary order'` 与 `keeps host focus and preference aligned after quick keyup in 'keyed reorder'`，同时断言焦点、aria-checked、业务回显 |

## Fresh 门禁

cwd 均为 `/Users/mang/Project/nerv-ui-worktrees/t08-r02-backgrounds/frontend`，入口 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`，未用全局 pnpm。下列命令 exit 0；精确 argv/cwd/exit 及 JSON/日志保存在外部 handoff 同目录 `commands.json`。

| 命令参数                                                                                      | 结果                      |
| --------------------------------------------------------------------------------------------- | ------------------------- |
| `--filter @nerv-iip/ui-mobile exec vp test run src/components/radio/MobileRadioGroup.test.ts` | 11/11，0 failed/0 pending |
| `--filter @nerv-iip/playground exec vp test run src/MobileInputDemo.test.ts`                  | 16/16，0 failed/0 pending |
| `--filter @nerv-iip/ui-mobile exec vp test run src/nvui-naming.contract.test.ts`              | 6/6，0 failed/0 pending   |
| `--filter @nerv-iip/ui-mobile typecheck`                                                      | 通过                      |
| `--filter @nerv-iip/playground typecheck`                                                     | 通过                      |
| `--filter @nerv-iip/playground build`                                                         | 通过，不是浏览器执行      |
| `exec vp lint` / `exec vp fmt --check` 三个修改的源码/测试文件                                | 通过                      |
| 本文 relative Markdown 文件链接存在性、`git diff --check`                                     | 通过                      |

JSON 无 runtime/unhandled 计数字段，两者 UNKNOWN，不填 0。断言通过只证明本次 runner 已发现断言通过。

## RED、FAIL 与边界

- Fresh RED（修复前）：7 例中 2 pass / 5 fail，exit 1；普通顺序和 keyed 重排均焦点已移动、值仍 desk。保留 `red.json` / `red.log`。首次修复后 `green.json` 为 7/7。
- 扩展测试首次 `component.json` 为 10 pass / 1 fail：错误假定同轮 DOM 重排保留焦点，实际 jsdom 回 body。随后明确断言失焦不补选，原 FAIL 保留；该中间组件命令独立 exit 未保留，为 UNKNOWN（串行命令最终 exit 0 不能代表它）。最终组件 11/11 有独立 exit 0。
- 准备失败均保留：错误相对写入路径、repo root 执行 pnpm fmt 的 `ERR_PNPM_RECURSIVE_EXEC_NO_PACKAGE`、首次写证据时目录不存在，均 exit 1；修正路径/cwd 后执行，无依赖安装升级。
- 继承 `/tmp/nerv-ui-t04-n02/browser-05.log` 仍存在且原样保留，focus=pocket / selected=desk。历史两帧后成功不覆盖此前失败，也不是本轮 fresh 浏览器证据。
- 继承 globalfmt3、docs alias ENOTDIR、main raw diff2 不顺修，未声称重新验证。
- 浏览器、物理键盘、设备、CI、安装产物/发布：UNRUN。本轮禁止 server/preview/Ego/Playwright；policy4 vendor 为零执行，不是 PASS，更大 vendor 桶未运行。
- 旧应用接入/旧库退出 NOT_PLANNED；排程和 PR132/130/128/122 不推进、不碰。source/reference/lock 完整保留，授权 UNKNOWN。

外部 handoff：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/mobile-radio-quick-keyup-implementation-r1/handoff.md`，记录最终 head/tree/clean 与 PR 完整 UTF-8 正文字节核对。无独立审核、自审、ready、merge、关闭 Issue 或验收评论。

附加工具失败保留：文档 fmt 的相对路径两次被拒绝（PATH must not contain ".."，exit 1）；绝对路径首次 check 报格式差异（exit 1），随后仅格式化本证据文件并复查。

## R1 返修

旧补偿覆盖宿主新值、误认程序化转焦的两项 P2 已实施修复。五项正式 RED→GREEN、原字节对照 probe 与 fresh/UNRUN 边界见 [F1 记录](f1/README.md)。R1 拒绝及原始 FAIL 保留，不据此宣布整票完成。

## R2 返修

观察窗口不足以区分宿主与 vendor 的同目标聚焦；改用固定版本 producer 的内部移焦信号，详见 [F2 证据](f2/README.md)。原 F1 记录为当时实现，不作为最终机制；所有拒绝和 FAIL 保留。新的补丁分发合同须由 #11 单独验收。
