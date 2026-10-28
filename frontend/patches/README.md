# 第三方局部补丁

## reka-ui@2.10.1 — #51 单选键盘移焦归属

`reka-ui@2.10.1.patch` 固定于 MIT 发行版 2.10.1，仅修改 `RovingFocusItem` 与 `focusFirst` 的 ESM/CJS 编译文件；不改许可证、导航候选、方向、循环、禁用过滤或默认返回值。

问题：该版 RadioGroupItem 在 focus timer 才读取方向键是否仍按下，快速 keyup 会漏选。但事后读取 DOM 焦点无法区分真实键盘移焦和宿主提前聚焦。补丁使 `focusFirst` 可接收内部回调，只有本次 `candidate.focus()` 后 activeElement 确为该 candidate 才调用；已经聚焦、聚焦失败或回调重定向不调用。RovingFocusItem 由此发出内部 `nv-roving-focus` DOM 事件，detail 为原 KeyboardEvent。只有移动 Group 消费该事件来确认本次导航；其它消费者没有新增选择行为，原返回值仍为 undefined。此信号不作为 Nv 公开 API，不能由应用依赖。

现有宿主模型更替与转焦取消仍由 Group 负责；补丁不会绕过 Radio 的 select/preventDefault/受控更新。没有安装新版本或新依赖。包 source map 保留上游原件，修改的四份 runtime 文件以 patch 为准，不将上游 map 当作补丁后的精确调试映射。

本仓库 `pnpm-workspace.yaml` 登记补丁；使用固定 pnpm 11.22.0 执行 `pnpm -C frontend install --frozen-lockfile` 安装，应用补丁失败应使安装失败。已执行离线 frozen 安装，并核对实际加载四份 ESM/CJS 文件与补丁源相同。完整锁对象与实际依赖边仅增加 patch 元数据：5 importers、973 packages、973 snapshots，Vue 与 Reka 各同一实体。工具初次生成的无关依赖修剪已拒绝，原日志保留。

独立发布／安装产物必须携带补丁或另提供等价实现；普通外部消费者只安装未打补丁的 Reka 不具备该信号。该分发合同由 #11 验证，目前 UNRUN，不能声称 npm 安装已验收。移除条件：上游版本能证明快速松键、宿主抢焦、模型更替、取消和两个模块格式均保持合同；重新运行[公开回归与 producer 证据](../../docs/evidence/bug51/f2/README.md)，再移除 workspace 登记与补丁。未声称存在已合入上游的修复。
