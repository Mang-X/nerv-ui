# T01 固定提交复制证据

本目录是 [#2](https://github.com/Mang-X/nerv-ui/issues/2) 的一次迁移记录，不是组件 registry，不接入长期 CI，也不随组件演进维持第二份实现清单。根 README 描述新库现态；复制的原文只证明来源时点。

## 来源与提取方式

- 来源：`Mang-X/Nerv-IIP`，固定 commit `79b1578f2b75f55709765b5e7882aaf33146c603`，tree `58e30c637acb7efdd393af291e570288b03b5aa9`。
- 新库起点：`599031a688496679e300458f56a1896d41ac8f81`；开工时任务分支、integration tip 与 merge-base 相同，工作区干净。
- 使用 `git ls-tree -rz` 枚举固定提交、`git cat-file --batch` 读取 blob；从未用原库工作区文件覆盖来源。提取器拒绝覆盖已有目标，按 Git mode 写入。
- 只保存 Git 跟踪内容，不提取 node_modules、缓存、未提交文件或本地环境。原库跟踪的 `.env.example` 只作为应用模板保留在素材区，未创建实际 `.env`。
- 原库只读，未启动服务或生产栈。来源 HEAD 与工作区状态的最终复核见 PR；本票不修改旧库。

## 分类与范围

逐文件权威映射是 [provenance.jsonl](provenance.jsonl)。每行包含原路径、Git blob、mode、SHA-256、字节数、目标位置、用途、后续责任票及 UI 盘点信号；排除项也保留固定来源身份且 `target=null`。

| 分类 | 数量 | 处置 |
| --- | ---: | --- |
| `unchanged-candidate` | 1,045 | 原样活动候选，保持原结构、包名、导出、测试和配置；尚未证明独立运行 |
| `needs-decoupling` | 1,321 | `migration/materials/source/` 中的应用及业务支持原始素材，不在 `frontend` workspace 成员路径内 |
| `reference` | 25 | `migration/reference/source/` 中的原库规则、ADR、测试治理、前端工具及 CI 参考，不启用旧全栈流程 |
| `excluded-sdk` | 64 | 整个 `frontend/packages/api-client` 留在原库，只登记来源；不以新库永久依赖保存业务生成 SDK |
| `excluded-history` | 37 | frontend 外的历史报告截图留在原库；不作为本次 fresh 验收或运行资产 |

合计盘点 2,492 个来源条目，复制 2,391 个文件、24,950,043 字节，全部 mode 为 `100644`。其中 frontend 全量 2,428 个文件全部有处置：2,364 个复制、64 个 SDK 排除。

| frontend 来源组 | 文件数 | `.vue` | 目标与后续责任 |
| --- | ---: | ---: | --- |
| packages/ui | 551 | 382 | 原路径；桌面 #3、触屏 #4、大屏 #6、文件 #7 |
| packages/ui-mobile | 71 | 48 | 原路径；移动 #5 |
| packages/app-shell | 14 | 6 | 原路径；应用壳/散落 UI #9 |
| packages/scheduling | 64 | 13 | 原路径，含 vendor 与业务模型；排程 #8 |
| apps/design-system | 180 | 14 | 原路径，含 VitePress 隐藏配置、完整页面、示例与预览文件；#10 |
| DESIGN | 155 | 0 | 原路径，含设计资料、roadmap 和原历史截图；#3、#10 |
| frontend 根配置 | 7 | 0 | 原路径；#3、#10、#11 |
| frontend/AGENTS.md | 1 | 0 | reference 中原样保留，根新 AGENTS 是独立仓库入口 |
| apps/business-console | 769 | 239 | materials，含页面共置组件、文件/排程适配和测试；#9（文件 #7、排程 #8 对照素材） |
| apps/business-pda | 262 | 75 | materials，完整触控/扫码页面、测试与模板；#5、#9 |
| apps/console | 78 | 28 | materials，完整平台页面、布局、样式与测试；#9 |
| apps/screen | 105 | 26 | materials，完整大屏页面、布局、取数逻辑、背景与样式；#6、#9 |
| apps/docs | 41 | 0 | materials，产品文档与图片；#9、#10 |
| packages/business-core | 58 | 0 | materials，业务支持参考，待宿主适配；#8、#9 |
| packages/auth | 8 | 0 | materials，认证编排参考，待宿主适配；#9 |
| packages/api-client | 64 | 0 | 来源登记，未复制；#3、#8、#10 |

完整盘点不是按组件目录猜测：全部 frontend 文件（含 TS render/组合逻辑、路由页面、colocated 私有组件、测试、隐藏配置和支持文件）均逐行登记。`ui_signals` 标记 `.vue`、样式/资产、assets/public 与组件/布局/页面/组合逻辑，用于本次审核筛选，并非新的导出清单。frontend 外全树扫描未发现额外 `.vue` 或 UI 样式源码；37 张历史报告截图明确排除。

831/831 个 `.vue` 已复制，126/126 个样式/资产文件已复制（CSS、图片、预览文档等）。ui 内 34 个大屏、5 个触屏、120 个 PC、12 个 blocks、8 个 layout、203 个 ui 目录 Vue 文件均原样保留。屏幕背景 `apps/screen/src/assets/login-hero.webp` 在素材区；文件能力保留 PDF/Office 组件及文档站 PDF、DOCX、XLSX、PPTX、SVG 样例；排程保留 64 个文件以及 DHTMLX 的 JS/CSS/类型声明。历史资料中的截图只代表旧时点，不替代交互验收。

## 参考位置与后续解耦

原路径 `P` 的参考材料位于 `migration/reference/source/P`，素材位于 `migration/materials/source/P`，候选仍位于 `P`。原文中的相对链接、规则及测试扫描对象保持不变，可能尚未在新结构闭合；不要为使其看起来可运行而移动应用或复制 SDK 回活动 workspace。

必要决策包括原 ADR 0006（workspace）、0007（文件路由/共置）、0020（Nv/token/CSS 层）、0036（Evaluation）；设计治理、原工程工具和测试规则也按 manifest 保留。旧根 `AGENTS.md`/`CLAUDE.md` 在 reference 内，只是历史参考，不安装为新库根规则。

已观察而未修复的耦合：

- 根 Vite/TypeScript/workspace 聚合任务仍指向原控制台、PDA、screen、docs 以及 api-client；#3、#10、#11 负责独立工程入口。
- scheduling 保留 api-client/business-core 依赖及 APS 语义，#8 负责通用模型和宿主适配；不在 T01 重构。
- 文档站保留 api-client alias 与排程场景；#10 负责脱离原业务契约。
- theme.css、overrides.css、Tailwind `@source` 与宿主样式层关系保留原样；#3 起逐表面验证。
- 复制的测试含原应用目录扫描；旧通过记录不继承，后续票区分库行为测试与原库消费者测试。
- 素材区内业务逻辑并非可直接发布的通用组件；逐项提取与处置由 #9 负责，超过范围时由父代理拆票。

## 第三方来源与限制

未选择新发行许可、未改变仓库公开范围、未发布包。原树无独立 LICENSE 文件；本次不补写一个暗示已获统一发行授权的新许可。

- shadcn/reka 原始来源与冻结边界保留于 `frontend/DESIGN/governance.md` 和 ui 包内规则；包括原 registry/版本信息与自研例外，不重写为“全部原创”。
- `frontend/packages/scheduling/vendor/dhtmlx/dhtmlxgantt.es.js` 与 `.d.ts` 保留 `dhtmlxGantt v.9.1.4 Professional Evaluation`、厂商与 Evaluation 限制声明；CSS 原样保留（含远程字体 URL）。未删除提示、水印或修改 vendor。
- 原 ADR 0036 在 reference 中完整保留，记录的是原项目用途裁决，不构成新库取得额外第三方授权的证明；后续 #8 保持来源与限制可见。
- PDF/Office、字体、图表等依赖名称与版本保留于原 package.json/lockfile。本次未下载依赖，未收集安装包的许可证全文，也未进行发行许可审计；发布相关验证属于 #11 等后续票。

## 核验与证明边界

按已批准的 provenance 接缝执行；没有新业务行为，没有建立镜像实现的伪组件测试。

- **Before / fresh FAIL**：[before-copy.json](before-copy.json)，执行复制前检查，exit 1；2,391 个目标全部缺失、已存在 0，证明复制前尚未交付。
- **After / fresh PASS**：[after-copy.json](after-copy.json)，重新枚举固定 Git tree 并读取原 blob，逐目标比较完整字节、Git blob、SHA-256 与 mode；核对复制集合无缺失、无额外目标、无 SDK 树。2,391/2,391 通过，错误 0。
- provenance 的哈希不是独立语义来源；权威是获批固定 Git tree。核验时重新读取来源与目标，不以新生成清单自己验证自己。

本次可复核命令（在新库根执行，`--source-repo` 指向含固定提交对象的只读旧库 checkout）：

```sh
uv run migration/t01/provenance.py verify --source-repo /path/to/Nerv-IIP --output /tmp/nerv-ui-t01-fresh.json
```

工具的 `before`/`copy` 只用于首次迁移，目标已有时复制会拒绝覆盖；日常组件开发无需运行或扩展此工具。记录中的 `target_head` 是核验时仓库 HEAD，工作区新增复制内容由 manifest SHA-256 与逐文件校验定位；提交后的 exact-head/index 复核在 PR 报告。

**UNRUN**：依赖安装、构建、类型检查、lint、组件测试、浏览器、旧全栈、独立宿主安装与 CI。保留的历史记录不计 fresh PASS，源码/样式相等也不证明独立运行、资源可加载、第三方授权完整、原库接入或母票完成。
