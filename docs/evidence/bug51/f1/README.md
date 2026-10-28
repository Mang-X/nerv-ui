# #51 R1 返修：模型权威与焦点序列

仅 PR133，base `0072c1cec946b05a5744ae95f54097d608c12ef9`；R1 被拒候选 `02dc32f42b48b10efd16f82a71949bb5079ee479`。Standards material 0、Spec 两项 P2：旧补偿覆盖宿主新值，以及把宿主转焦误当导航目标。R1 原始失败和判断保留。

## 修复边界

仍由真实 Reka 2.10.1 决定方向、循环、禁用过滤与目标，不另写导航算法。捕获阶段在 Reka 排队前登记一个 nextTick 边界；只有排队期间第一次 source → 同组 radio 的 blur/focus 配对可用于补偿。目标从该配对取得，不再从事后任意 activeElement 推断；之后任何 blur/focus（包括离开再返回）永久撤销该任务。同步 watch 当前 `modelValue` 与 `disabled`，输入更替撤销旧补偿。新按键、pointerdown、click、卸载原有取消行为保留。

只修改 Group 与公开测试；无新 API、Item 变更、全局监听、依赖升级、lockfile 变更或 vendor 补丁。未新增 readonly 合同。DOM 序列断言不等于浏览器焦点认证，依赖实际 Reka 的 nextTick 排队边界。

## Requirement coverage

| Requirement                       | Evidence                                                                                                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 宿主在 timer 前替换受控值不被覆盖 | `abandons old navigation when the host replaces its controlled value before the repair timer`                                                                                                             |
| 宿主 focus 回调同组转焦不补选     | `does not turn a host focus callback redirect into a keyboard selection`                                                                                                                                  |
| 同组或组外离开后返回不复活旧补偿  | `permanently cancels navigation after focus leaves its target for same group even when it returns`；`permanently cancels navigation after focus leaves its target for outside group even when it returns` |
| 队列前主动聚焦不被当作导航        | `does not adopt a synchronous host focus change before the queued roving navigation`                                                                                                                      |

正式新增五例在旧候选上为 11 PASS / 5 FAIL，修后整份 16 PASS。普通/keyed 快速松键、长按 repeat、Tab/鼠标、禁用、实例/卸载、preventDefault/select 取消及重排失焦的原 11 例仍通过。

R1 `control.probe.test.ts` 原字节、原断言不改：真实 timer 与 fake timer、原生 Reka 对照共 4/4 PASS；R1 原 2 PASS / 2 FAIL 保留。旧补偿不再改写宿主 pocket，不再因转焦到 pocket 或离开再返回而发出更新；快速松键正例仍选择 travel。原 probe 的真实 timer lane 使用 30ms 等待，仅计此次原 probe 复跑，不称确定性正式回归。

## 门禁与证据边界

fresh：组件/移动命名 22 PASS（16+6）、宿主16 PASS、两处 types、playground build、scoped lint/fmt。日志与逐命令 argv/cwd/exit 在 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/mobile-radio-quick-keyup-authority-fix/`。pnpm 11.22.0；无安装或升级。报告缺少 runtime/unhandled 计数，保持 UNKNOWN；CSS 解析/构建 warning 保留。

本轮不运行浏览器、真实键盘、设备、HTTP、CI、packed、旧消费者或生产，不能签整票完成。旧应用接入/旧库退出 NOT_PLANNED；排程仍延后。历史 RED/FAIL/UNKNOWN、R1 准备异常与 globalfmt/docsalias/mainRAW 边界不改写。PR 保持 Draft、#51 Open；独立 R2 另席执行，本轮不 ready/merge/close/watch。
