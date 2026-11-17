# T10-2 裁定：reka-ui patch 定性 + DHTMLX vendor 许可 + app-shell 阻塞核实

只读调查 + 裁定，2026-11-17，工作树 `/Users/mang/Project/nerv-ui`（branch `integration/nerv-ui-extraction`，HEAD `4143840`）。本报告不做法律结论；涉及许可措辞不确定处一律标注「需 owner 确认」。执行证据：全部结论来自仓库内文件实读与 `git log`/`gh issue view`，未运行安装/打包/浏览器，全部验证项标 UNRUN 处均如实标注。

## 裁定 1：reka-ui patch —— 影响公开行为，packed 形态必须规避

### patch 内容清单（`frontend/patches/reka-ui@2.10.1.patch` 全文实读，78 行）

只改 reka-ui 2.10.1 发行物内 **4 个编译产物文件**，ESM/CJS 各一对：

| 文件 | 改动 |
| --- | --- |
| `dist/RovingFocus/utils.js` + `utils.cjs` | `focusFirst(candidates, preventScroll)` 增加第 3 参 `onFocused`；`candidate.focus()` 后仅当 `getActiveElement() === candidate` 才回调（原来只判断「焦点变了」就 return，不区分焦点落在谁身上、也不区分是否被 focus handler 重定向） |
| `dist/RovingFocus/RovingFocusItem.js` + `RovingFocusItem.cjs` | 键盘导航时把 `onFocused` 传入；回调里 `candidate.dispatchEvent(new CustomEvent("nv-roving-focus", {bubbles:true, detail: 原KeyboardEvent}))` |

不改：导航候选计算、方向映射、loop、禁用过滤、返回值（仍 undefined）、许可证、source map。无新依赖。

### 是否影响公开组件行为：逐条

1. **对 reka-ui 自身公开行为：无影响。** 事件是 DOM CustomEvent、非 props/emits 变更；`focusFirst` 返回值与既有调用方语义不变（`onFocused` 可选，旧两参调用路径不变）。其它组件（Tabs/Menu 等同样走 RovingFocus）只会多冒泡一个无人监听的 DOM 事件，无选择行为变化。
2. **对 `@nerv-iip/ui` / `app-shell`：无影响。** 全仓唯一 `nv-roving-focus` 监听点在 `packages/ui-mobile/src/components/radio/MobileRadioGroup.vue:144`（`@nv-roving-focus.capture`）。ui 的 339 处 reka import 无一消费该信号。
3. **对 `@nerv-iip/ui-mobile`：有影响，且是公开可观察行为。** `MobileRadioGroup` 的「快速 keyup 后焦点-选中同步」修复（issue #51，已 closed）以 patch 信号为**必要输入**：`handleKeydown` 里 `request.vendorMoved` 只能由 `nv-roving-focus` 置真；未打补丁的 reka-ui 下该信号永不触发 → 快速方向键释放回到上游 bug（焦点移动、值不选中）。这是公开组件行为差异，不是内部实现细节。
4. **补丁引入原因**（`git log` + `patches/README.md`）：commit `d5ed78b`，为 #51 R2 返修——Reka 2.10.1 的 RadioGroupItem 在 focus `setTimeout` 里才读 key 状态，快速 keyup 会漏选；且仅凭 DOM 焦点转移无法区分「Reka 导航移焦」与「宿主主动聚焦」，故给 `focusFirst` 加 provenance 回调。README 明写：「普通外部消费者只安装未打补丁的 Reka 不具备该信号」「未声称存在已合入上游的修复」。

### 结论

- **patch 未上游化**（README 明示）；packed tgz 下宿主装的是官方 reka-ui@2.10.1，**MobileRadioGroup 快速松键回归 #51 缺陷**。其余 3 包行为无差异。
- **建议形态（三选一，按代价排序）：**
  - **A（建议）**：ui-mobile 产物内自带等价实现，不依赖 patch。`nv-roving-focus` 的语义是「`focusFirst` 真把焦点移到了哪个 candidate」——等价逻辑可在 NvMobileRadioGroup 内用 capture 阶段 focus/blur 配对复现（组件已在 `captureBlur`/`captureFocus` 里维护 `source→target` 配对，patch 只是额外提供「vendor 确实动了焦点」的确证）。**需要一次小型改造 + 重跑 #51 公开回归**，换取「宿主任意 reka-ui 行为一致」。这是唯一能对外宣称「patch 不承重」的形态。
  - **B（保守兜底）**：产物声明「宿主必须对 reka-ui 打此 patch」，把 `.patch` 文件随包分发 + 文档要求宿主配 `patchedDependencies`。技术可行但把 workspace 内部机制泄漏成公开合同，宿主若用 npm/yarn 则无路可走。**只应在 A 被 owner 判定超 scope 时采用**。
  - **C（上游化）**：向 reka-ui 上游提 `focusFirst` provenance 回调或等价修复，等合入发版后删 patch。是终态但不是本里程碑能等的（移除条件见 `patches/README.md`，需上游版本证明快速松键/宿主抢焦/模型更替/取消/双格式五项合同）。
- **依据**：patch 只新增内部信号通道；把它做成包内私有能力（A）与把包外依赖变回纯净（B）都成立，但 A 让产物合同干净。需 owner 在 A/B/C 间拍板；A 的工作量约 1 张 S/M 票（改造 + #51 回归复跑 + `RadioNavigationPatch.test.ts` 改造或删除）。

## 裁定 2：DHTMLX vendor —— 评估版字节不进 tgz，三入口改「宿主自备」契约

### 实读事实

- `vendor/dhtmlx/` 三个文件**确实在 git 里**（T01 commit `50ee079` 起即入库）：`dhtmlxgantt.es.js`（891KB）、`.css`（142KB）、`.d.ts`（211KB），文件头声明 **"dhtmlxGantt v.9.1.4 Professional Evaluation … Usage without proper license is prohibited"**。
- `stub.ts:3` 注释「试用版评估许可禁止分发,真实库文件永不进 git」**与实际在仓状态矛盾**：它描述的是 T01 复制来源仓（Nerv-IIP）的约束（来源仓里真实文件靠 `@dhx/trial-gantt` 别名注入、不进 git）；nerv-ui 的 T01「原样复制基线」把评估版字节直接带进了仓。注释没更新，现状是「评估版字节在 git 但只供仓内自用」。
- `scheduling/README.md` 已把口径写对：「DHTMLX 固定 9.1.4 Professional Evaluation；vendor 声明与水印保持，授权范围 UNKNOWN。无发布、升级或替换。」→ 仓内持有 ≠ 已授权分发。
- 架构上 `./vendor`/`./vendor.css` **本来就是 alias 接缝**：包内 `vite.config.ts` 把测试环境 alias 到 `stub.ts`/`empty.css`；`loader.ts` 用动态 `import('@nerv-iip/scheduling/vendor')` + catch 回落 `isDhtmlxAvailable()=false`。即「vendor 不存在」已是被设计的一等场景。
- `vite.mjs` 的 `schedulingVendorStyles()` 插件按**路径特征**匹配 `*/vendor/dhtmlx/dhtmlxgantt.css`，把 CSS 剥 fonts.gstatic `@font-face` 后裹 `@layer nv-components`；宿主（playground、design-system）都在用它。它对「文件在包内」无硬编码依赖——匹配的是 import 后解析到的路径。

### 裁定

**三个入口在 packed tgz 中全部不携带评估版字节；入口契约改为「宿主自备 vendor」。** 具体：

| 入口 | 现在指向 | tgz 形态处理 |
| --- | --- | --- |
| `./vendor` | `vendor/dhtmlx/dhtmlxgantt.es.js` + `.d.ts` | **从 `files` 剔除 vendor/dhtmlx/**。入口本身保留但产物内指向**打包出的 stub 兜底**（等价于现有 `src/engine/dhtmlx/stub.ts`：`gantt/Gantt = undefined`），使 `import('@nerv-iip/scheduling/vendor')` 恒可解析、`isDhtmlxAvailable()` 在无 vendor 宿主返回 false → GanttChart 占位不崩（验收清单 10 的「无 vendor 回落」项即此场景）。真 vendor 由宿主 vite alias `@nerv-iip/scheduling/vendor` → 自备的 `dhtmlxgantt.es.js`（与包内测试 alias 同一机制，文档化）。 |
| `./vendor.css` | `vendor/dhtmlx/dhtmlxgantt.css` | 同上：产物内指向一个 **empty.css 等价物**；宿主 alias 到自备 css。loader 的动态 import 双路（js+css）天然兼容。 |
| `schedulingVendorStyles`（`./vite`） | `vite.mjs` 手写插件 | **保留并随包分发**（`.mjs` 直接进 `files`）。它不含 vendor 字节、只按路径特征 transform；宿主把 vendor.css alias 到自备文件后插件照常命中。需要文档声明「宿主用了真 DHTMLX css 才需要此插件；无 vendor 宿主不装它」。 |
| 附带：`./vendor` 的 `types` 条件 | `dhtmlxgantt.d.ts`（211KB 评估版类型声明） | 评估版 d.ts 同样属 vendor 字节，**不进包**。宿主 alias 真库时其自带 d.ts 生效；无 vendor 时类型消费方拿到 stub 的 `unknown` 导出，足够编译。 |

### 可执行 exports/files 建议

```jsonc
// packages/scheduling/package.json（产物化后）
"exports": {
  "./vendor":     { "types": "./dist/vendor-stub.d.ts", "default": "./dist/vendor-stub.js" },
  "./vendor.css": "./dist/vendor-empty.css",
  "./vite":       { "types": "./vite.d.mts", "default": "./vite.mjs" },
  // …其余入口不变
},
"files": ["dist", "src/styles", "vite.mjs", "vite.d.mts"] // 明确不含 vendor/
```

- `dist/vendor-stub.js` 由 stub.ts 一起 build；`vendor-empty.css` 由 `empty.css` 复制。
- **宿主自备契约（文档项）**：`resolve.alias['@nerv-iip/scheduling/vendor'] = <宿主真实 dhtmlxgantt.es.js>`、同理 `vendor.css`。仓内 `vite.config.ts` 已有这个写法的活例（test alias），docs 直接引用。
- **许可留痕**：评估版字节**留在 git**（仓内 playground/design-system 真实甘特演示仍需要，T07/P04 已验收），只是不进 `files`/tgz。建议 T10-5 顺手把 `stub.ts` 那句过时注释改成「评估版字节在仓内供演示自用、不进 packed 产物」，消除自述矛盾。**是否允许评估版字节继续留在公开 git 仓**属许可边界判断，**需 owner 确认**（本报告只裁定 tgz 不携带）。
- 替代形态「保持私有不分发 scheduling 包」被否：`model`/`host`/样式/组件本身是抽取主目标，vendor 已是可插拔接缝，没有为了 vendor 扣住整包的理由。

## 裁定 3：app-shell —— 阻塞属实，但只是成员资格一行之差，不是工程阻塞

- `pnpm-workspace.yaml` 注释 `app-shell in #9` 是**陈旧指针**：#9（T08）2026-10-28 已 CLOSED，但 app-shell 自始至终**从未进过 packages 列表**（`git log -p frontend/pnpm-workspace.yaml` 全程无 `packages/app-shell` 行；注释从「mobile/app-shell in #5/#9」演化到「app-shell in #9」，成员行一直没加）。
- 工程后果核实：**当前无任何消费方**。`@nerv-iip/app-shell` 不在任何 package.json 依赖里；design-system 的中性壳文档页直接复用 playground 源码（neutral-shells.md 明写「未恢复候选 app-shell 包」）。`pnpm install` 不会为它建 node_modules——但它是纯源码包、无 install script、无 codegen，这不阻塞它的**文件存在与产物化**（tsdown 只读源码 + `vue`/`reka-ui`/`@nerv-iip/ui` 类型可从 workspace 兄弟包解析）。
- **核实结论**：T10-6 的「#9 恢复前置」在事实上已解除（#9 关闭且 23 叶全 completed）；真正的前置只剩「把 `- packages/app-shell` 加回 yaml + 跑通它的 typecheck/test」这一行改动。阻塞程度：**不是工程阻塞，是一行成员资格 + 验收复跑**。建议 T10-6 开工第一步即补成员行；补行前它的 tgz 产物化在技术上也可做（源码在仓），但「未在 workspace ⇒ 未过仓内门禁 ⇒ 无验收证据」的组合意味着 T10-6 验收必须把成员行作为前置动作，不能跳过。

## 对 T10-3/4/5/6 的输入（验收项按裁定调整）

| 票 | 受影响验收项 | 调整 |
| --- | --- | --- |
| **T10-3**（ui 主桶） | reka-ui 依赖形态 | 裁定 1 确认 patch **不影响** ui 公开行为 → ui 可把 `reka-ui` 降为 `peerDependencies`（^2.10.1）无需附加 patch 说明；验收清单不含 MobileRadioGroup 快速松键项 |
| **T10-4**（file-preview） | 无直接输入 | patch 与 file-preview 无交集；维持原验收 |
| **T10-5**（scheduling） | vendor 三入口 + `schedulingVendorStyles` + 验收清单 10 | 按裁定 2 落地：exports 改成 stub 兜底、`files` 排 `vendor/`、宿主自备 alias 文档、stub.ts 注释修正；验收清单 10 拆成两层——**无 vendor 宿主**：`isDhtmlxAvailable()=false` + 占位不崩（tgz 默认形态即可验）；**真甘特**：验收宿主需 alias 一份自备 dhtmlx 9.1.4 文件（取证可复用仓内 vendor 字节，但证据必须注明「宿主自备注入、非包内分发」） |
| **T10-6**（app-shell） | 前置条件 | 「#9 恢复」改写为「补 workspace 成员行 + typecheck/test 通过」；其余不变。若 T10-6 采用裁定 1-A 方案（patch 内化），app-shell 无 #51 相关组件，不受影响 |
| **跨票（新输入）** | ui-mobile 在独立宿主的 #51 场景 | 无论哪个票做 ui-mobile 产物化（T10-1 骨架即含它），验收清单必须显式处理「快速 keyup RadioGroup」：采 A 则跑 #51 公开回归；采 B 则宿主装 patch 后验；采 C 则该项暂记 UNRUN + 缺陷声明。**在 owner 拍板 A/B/C 之前，独立宿主验收不得宣称移动 Radio 键盘合同成立** |

## 未定项（交 owner）

1. patch 处置路线 A/B/C 三选一（建议 A，理由见上）。
2. 评估版 DHTMLX 字节继续留在公开 git 仓是否可接受（本票只裁定 tgz 不携带；仓内持有状态的合法性需 owner 确认）。
3. T10-5 验收「真甘特」层的宿主自备 vendor 来源：复用仓内字节做取证是否算「自备」需要 owner 确认取证口径。
