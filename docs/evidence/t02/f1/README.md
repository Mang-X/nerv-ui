# T02 / F1 修复证据（2026-10-24）

只修 [PR #42](https://github.com/Mang-X/nerv-ui/pull/42) 的 F1，未合并、未关闭 #3。base/integration 为 `274d12baf1d5d27857beab0c7183d56623ffcefd`；被拒绝的初版为 `621ca3d868f0cc34a35640cc011915029e19ca2d`。

## 失败历史与根因

[独立审核原回执](review-r1.md) 保留 REQUEST CHANGES、当时的 fresh/继承/UNRUN 结果；[实际安装反例](installed-edges-r1.json) 保留当时升级后的解析。初版 package keys 新增 `[]`、减少 266 是真实统计，但不能推出纯裁剪：`wrap-ansi@7.0.0` 的 `string-width` 4.1.0 → 4.2.3、`strip-ansi` 6.0.0 → 6.0.1 均指向来源已存在的版本，版本键集合无法发现改边。

直接根因是把活动 workspace 调整后的解析结果当作纯裁剪，并用版本键子集代替图语义约束。修复从固定来源恢复该 snapshot 的原边及其完整旧闭包，不重新 resolve，不新增 override，不改 manifest、工具或业务源码。

## RED → GREEN：来源图与当前图

[一次性比较脚本](compare-lock.mjs) 从当前 importer 选择根，沿**来源 snapshots** 计算完整可达闭包；候选图独立检查闭包，无候选改边掩盖来源节点的情况。比较全部保留 packages/snapshots 的完整对象，包括 resolution/integrity、dependencies、optionalDependencies、peerDependencies/meta、transitivePeerDependencies 及未知字段；snapshot key 包含完整 peer 上下文。对象键序不影响比较，数组顺序保持。

- **RED**：[graph-red.json](graph-red.json)，exit 1。确认一个保留 snapshot 的两条改边，以及误裁的四个来源可达节点：`string-width@4.1.0`、`strip-ansi@6.0.0`、`strip-ansi@5.2.0`、`ansi-regex@4.1.1`。
- **GREEN**：[graph-green.json](graph-green.json)，exit 0。来源 1235 个 packages/snapshots 各保留 **973**、裁剪 **262**；新增键 **0**，package 完整对象差异 **0**，snapshot 解析/依赖/peer 语义差异 **0**。可达边计数两图均为 **1627**（含 importer/link 边）；缺失来源可达项、额外项、候选不可达项均 **0**。
- 五个 snapshot 仅新增 `optional:true`：`@noble/hashes@2.4.0`、`@pinia/colada@1.4.2(...)`、`esbuild@0.28.1`、`pinia@4.0.2(...)`、`rollup@4.62.2`；完整 key/字段在报告内，继承 R1 对分类变化的确认。脚本仅允许这五项 absence → true，不忽略 dependency 或 peer 字段。
- root/UI importer 完整对象不变；新增 playground importer 精确限定 `@nerv-iip/ui` 的 workspace 链接和来源 Vue 解析；移除非活动 importer 属 T02 既有范围。lockfileVersion/settings/overrides 等其余顶层字段差异 **0**。

修复 lock SHA256：`b4bc0d1992a19af9978dd14ccd7a6f5e92bda1d91cd8f9080f2bd9215d1fe85d`。报告以文件 hash 固定验证输入，最终提交 SHA 由 PR 回执固定，避免文档自引用 SHA。

复现图比较（仓库根；已 frozen 安装，复用已锁定 yaml@2.9.0）：

```sh
git show 274d12baf1d5d27857beab0c7183d56623ffcefd:frontend/pnpm-lock.yaml > /tmp/t02-f1-base.yaml
git show 621ca3d868f0cc34a35640cc011915029e19ca2d:frontend/pnpm-lock.yaml > /tmp/t02-f1-rejected.yaml
node docs/evidence/t02/f1/compare-lock.mjs /tmp/t02-f1-base.yaml /tmp/t02-f1-rejected.yaml /tmp/t02-f1-red.json
# 上一条预期 exit 1；以下预期 exit 0。
node docs/evidence/t02/f1/compare-lock.mjs /tmp/t02-f1-base.yaml frontend/pnpm-lock.yaml /tmp/t02-f1-green.json
```

脚本和 JSON 仅为本票一次性迁移证据，不接入 CI 或永久 registry。

## 本次 fresh 验证

全新目录 `/tmp/nerv-ui-t02-f1-20261024/clean` 由初版 `git archive` 加唯一 frontend 增量（修复后的 lock）生成；安装前无 `.git`、`node_modules`、`dist`。对任务树和干净副本的 **1055 个 tracked frontend 文件**逐字节比较，差异 **0**，见 [clean-source.json](clean-source.json)；文档/evidence 增量不参与前端构建。所有重型门禁串行执行。

| Requirement             | Evidence                                                                                                                                                                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 干净 frozen 安装        | `pnpm -C frontend install --frozen-lockfile` exit 0，固定 pnpm **11.22.0**，resolution step skipped，855 个当前平台可安装包；[clean-install.log](clean-install.log)。安装前后 lock SHA256 一致                                                            |
| 实际解析恢复            | [check-installed.mjs](check-installed.mjs) 从实际 `wrap-ansi@7.0.0` 包位置解析依赖并读 package.json；四条恢复链均匹配固定来源版本；安装生成 `.pnpm/lock.yaml` 与提交 lock **全对象相等**（973/973）；[installed-green.json](installed-green.json)，exit 0 |
| 库/宿主行为             | `pnpm -C frontend test` exit 0，UI **38 文件 / 614 PASS / 0 FAIL / 0 SKIP**，playground **2 文件 / 10 PASS / 0 FAIL / 0 SKIP**；[tests.log](tests.log)                                                                                                    |
| 文档静态契约            | `pnpm -C frontend --filter @nerv-iip/ui test:docs` exit 0，**3 文件 / 6 PASS / 0 FAIL / 0 SKIP**；[docs-tests.log](docs-tests.log)，不代表完整文档站运行                                                                                                  |
| 类型/构建               | `pnpm -C frontend build` exit 0，UI/playground 两份 `vue-tsc --noEmit` 与宿主 production build；[clean-build.log](clean-build.log)                                                                                                                        |
| 构建对应原 browser 资源 | [artifacts-green.json](artifacts-green.json)：HTML/JS/CSS/7 字体 **10/10** SHA256 与初版最终干净构建一致；JS/CSS 也直接对原 browser response hash 相等，HTML 对最终 HTTP 复核相等                                                                         |

安装解析检查可在干净副本根复现：

```sh
node /absolute/path/to/docs/evidence/t02/f1/check-installed.mjs /tmp/t02-f1-installed.json
```

日志仅去除 ANSI 着色、行尾空格和多余末空行；原始输出保留于 `/tmp/nerv-ui-t02-f1-20261024`。本次继续出现 jsdom `Could not parse CSS stylesheet` 和 VueUse 两条 `INVALID_ANNOTATION` 警告，均未改写为失败或消除声明。

## 继承与 UNRUN

浏览器 JSON、三张截图、键盘/焦点/主题交互和资源响应继承初版 `621ca3d8` 的 [原证据](../README.md#真实浏览器)。本次产物字节相等支持继承，本次 fresh browser **UNRUN**。初次 HTML formatter hash 不相等及最终 HTTP 复核的历史均保留，未覆盖。

初版 scoped fmt/lint 为继承证据；本次文档/脚本/JSON 的 [scoped fmt](fmt-check.log) 和两份一次性脚本的 [scoped lint](lint-final.log) 均 exit 0。路径调用失败及初次 lint warning 保留于 [tooling-attempts.log](tooling-attempts.log)，最终图检查再次确认 RED/GREEN 与已存报告相等，见 [final-graph-checks.json](final-graph-checks.json)。CI、独立复审、PR 合并/关票、版本化产物 #11、完整文档站 #10、其它表面、旧消费者 reference tests/接入 #12–#15、旧全栈、设备与发布 **UNRUN**。等待父代理对新 head 独立复审；本实施席无尚未解决的 F1 技术异议。
