# T06/F01（#72）验证记录

范围为独立 `/#files`、host 注入的顺序内存上传、图片与容器状态。父 #7、#73–#76 及其它发布/接入票不由本票验收或关闭。

## 固定对象与执行环境

- 仓库：`Mang-X/nerv-ui`；workdir：`/Users/mang/Project/nerv-ui-worktrees/t06-f01-files-host`；分支：`feat/t06-f01-files-host`。
- base：`e3909896e2072d4a4b874161f29a555cbe50168d`，tree `c51d279d8cd8ab723287fb2a04f91608f2a75311`。交付前 fetch/merge `origin/integration/nerv-ui-extraction`，结果 Already up to date。
- 实施：`5b437caf73ca6e63cc92f69bda7ef396769ff462`；提示换行修复/最终运行源码：`4a0675711c69df5ce422313590dfbe7fa7c2be42`，tree `7ff47d4c17454988958b20771d6fa1ff71b00c93`。之后仅追加本证据；最终 PR head/tree 在外部 handoff 和 PR 中固定。
- Node 24；pnpm `11.22.0` 通过 task-local `/tmp/nerv-ui-t06-f01/bin/pnpm` → `corepack pnpm@11.22.0`，嵌套脚本同 PATH。未改全局 pnpm；Python 仅 uv。缺 node_modules，frozen install 成功一次。
- dev `http://127.0.0.1:5196/#files`，production preview `http://127.0.0.1:5197/#files`。T3 preview 打开后两次 snapshot timeout，转 ego-browser space 26；工具原文见 `raw/preview-tool-errors.txt`。桌面 Chromium 自动化，未使用设备。

## Requirement / Evidence

| Requirement                                              | Evidence                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 独立页、裸包和全部既有 hash                              | `App.test.ts`：`opens files directly and returns from every completed surface group`；先 RED（实际仍为桌面 heading），后 GREEN。root FileUpload、root 类型/helper、稳定 `@nerv-iip/ui/file-preview` 在真实 host 消费；无 src alias。生产 `prod-layout-routes.json` 的 14 条实际往返全部返回 files。                                                                                                  |
| 手动上传前计数零、顺序暂停/恢复/失败/重试、receipt 快照  | `FilesDemo.test.ts`：`keeps manual selection inert then pauses, resumes, retries and replaces receipt snapshots`；adapter：`advances only explicit transports and records abort, failure and completion separately`。`dev-upload.json` / `prod-upload.json` 给出 empty、picker 后、25% pause（complete 0）、失败（无成功 receipt）、retry 完成、同文件重选、移除完成项、clear 的公开读回；写请求 0。 |
| accept 扩展/MIME/wildcard/空策略、大小/数量边界          | `publicFiles.test.ts` 的四个 `validates extension MIME wildcard and empty policy ... through picker and drop`；`rejects adjacent size, wrong type and excess count without creating successful receipts`。大小 4/5 bytes、数量 2/3 形成相邻边界；真实 host 32KiB+1 的拒绝、类型拒绝与 maxFiles 1/2 读回另见两份 browser upload 记录。                                                                |
| disabled 与 host 权限                                    | `disabled guards picker browse and drop while the explicit ref and composable keep host authority`；`prod-auto-disabled.json` 的禁用 drop 无变化、自动模式不点开始即进入 uploading。未给 ref/composable 擅加 disabled 权限。                                                                                                                                                                         |
| 七变体和 >40 虚拟窗口                                    | 参数化 `renders the public <variant> variant and releases library thumbnails on removal or clear` 七例；`adds the full 48-note collection before presenting a bounded virtual window`。host 起初错用旧 5 槽限制的 RED 保留，修复为先 nextTick 再公开 addFiles。浏览器真实 384px/4800px 滚动容器，scrollTop 3300，窗口内容从前段变为后段，实际移除 moment-40；不是只设置 scrollTop 的替代断言。       |
| 390px 无横溢出、主题/焦点/hit/低动效                     | 真实几何 RED：compact 390→549、gallery 390→393，均由限制提示长词溢出。仅在自研 FileUpload 的三处提示加 `wrap-anywhere`；`narrow-variants-green.json` 七变体全部 scrollWidth=390。最终生产矩阵 3 视口×4亮暗/强调色、7变体 hit、Tab 顺序、reduced-motion 和 14 路径，见 `prod-layout-routes.json`（34 记录）及截图。无全局 CSS 覆盖，shadcn 原版未改。                                                 |
| helper 和真实分类边界                                    | 18 个 `classifies ... through the stable root helper as ...`：无扩展、MIME 参数/大小写、PDF/image 冲突、OOXML、legacy/text/media/archive unsupported；另有 `formats absent, zero and binary size boundaries through the root helper`。研究中“docx+image 可能 image”被当前公开反例纠正：`note.docx + image/png` 为 office-docx，未改策略。                                                            |
| 容器 props/events、empty/loading/error/unsupported/ready | `subpath preview distinguishes empty loading error unsupported and image ready without opening a window`；`offers an invalid image URL separately from corrupt bytes for source recovery`。jsdom 的 load/error 只证明事件编排；真实解码见 dev/prod preview 记录，不拿 dispatch load 代替浏览器。                                                                                                     |
| 真实 SVG/PNG/JPEG、坏源恢复、缩放旋转                    | `dev-preview.json` / `prod-preview.json` 各 29 记录：SVG naturalWidth 1200、PNG/JPEG 640；GET 200、正确 MIME、真实 body/hash；20%–300%、±90° 的实际 transform；broken.png 真坏 bytes、missing.png 真坏 URL 后切好源恢复。missing URL 在 Vite SPA fallback 下返回 200 text/html，**不是 404**。                                                                                                       |
| openSource 只事件；host 明确按钮才打开                   | `owns local preview URLs and only opens a controlled source after a separate host action`；subpath 单测；真实 browser 先请求后 tabs 不变，另点“打开本地原图”后才出现受控本地页，记录在 preview JSON。preview 本地 GET 是允许的读动作。                                                                                                                                                               |
| URL 所有权和释放                                         | 七变体单测真实调用 URL factory 的 spy，host URL 更换/离页另测。真实 browser registry：每轮 preview 创建 37 / revoke 37；虚拟 image 行卸载回收库 URL，active host preview URL 保持可用；replace、remove、clear、离页均有操作前后读回。库缩略图与 host Blob URL 分属各 owner。                                                                                                                         |
| lazy 构建图、依赖与产物来源                              | 仅启用已锁定 wasm plugin 3.6.0；`dependency-audit.json` 的 16 份完整输入 SHA/字节相同，4 importers、973 packages、973 snapshots **全对象**相同；`vue-identity.json` 三活动包同一 Vue 3.5.39 realpath。`prod-resource-receipt.json` 八个实际响应体逐字节等于 dist，完整 body 在 resources。未加载 PDF/Office/WASM；不能将 build graph 冒充运行。                                                      |

## 命令与结果

所有 shell 显式 workdir 为上面的工作树；下列命令均带 `PATH=/tmp/nerv-ui-t06-f01/bin:$PATH`。

```sh
pnpm -C frontend install --frozen-lockfile
pnpm -C frontend test
pnpm -C frontend --filter @nerv-iip/ui test --maxWorkers=4 --reporter=default --reporter=json --outputFile.json=/tmp/nerv-ui-t06-f01/raw/ui-final2.json
pnpm -C frontend --filter @nerv-iip/playground exec vp test run src --maxWorkers=4 --reporter=default --reporter=json --outputFile.json=/tmp/nerv-ui-t06-f01/raw/host-final4.json
pnpm -C frontend --filter @nerv-iip/ui test:docs
pnpm -C frontend --filter @nerv-iip/ui-mobile exec vp test run src/nvui-doc-coverage.contract.test.ts
pnpm -C frontend build
```

完整 workspace 首次结果：UI 770 / mobile 144 / host 167，exit0；加独立坏 URL 入口后 host 168。最终提示修复后 UI **770**（54 files）与 host **168**（20 files）再次 fresh PASS，JSON success=true、failed/pending=0、每条 assertion passed。mobile 144 的本轮 fresh 运行发生在最后提示 CSS 改动前，mobile 源码未改；没有把它冒称最后对象重跑。docs-source **6+2**；UI docs 最后改后重新 6 PASS。最终 build 包含三个活动包 vue-tsc，exit0。runner 未提供 numUnhandledErrors 字段；报告仅声明日志无 unhandled 标记，不伪造字段0。

维护清单、完整命令/exit 在 `maintenance-checks-final.json`。维护 fmt/lint/scoped diff-check PASS；全仓历史格式/RAW lane 不与此混写。浏览器脚本和执行日志均保留，操作读回不依赖 private vm；组件 ref 只用公开 expose。

## Fixture 来源和 bytes

| 路径（playground public/files） | bytes | SHA-256 / 来源                                                                                                                                                                                       |
| ------------------------------- | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| quality-evidence.svg            |  1079 | `8eef765829cb0a5acb073a629a99598f3c9622f38cf324255627c2bce57e9806`；从 design-system 同名 public 文件原样复制；来源固定旧 SHA `79b1578f2b75f55709765b5e7882aaf33146c603`，本票 base 内容相同。       |
| garden.png                      | 10878 | `bbb5957119507867b24fb51c761bcbf1bf3af25c38f908d68721e2d03c8ae92e`；本票自制 640×400 图形，GARDEN / 2026。                                                                                           |
| coast.jpg                       | 16037 | `2e5b23c0c5eaea91d63ae67b11aef0f4257974bd8d1e61448a964a294dcbaa30`；本票自制 640×400 图形，COAST / 2026。                                                                                            |
| broken.png                      |    66 | `75396acfeaa204eab730a1145f415a9691c6772b06453e45201456fd30eeba8d`；本票纯文本坏 PNG，故意用于解码失败。                                                                                             |
| notes.txt                       |   112 | `30a32bb124fc75e7e2207fd0dc92ea700d272ab1bedaf24958dd4e461f1bb305`；本票自制纯文本。unsupported 菜单用其作为受控来源，并用不同 fileName/contentType 测容器状态，不声称这些 bytes 是真实媒体/Office。 |

PNG/JPEG 由 `uv run docs/evidence/t06-f01/generate-images.py` 生成，PEP723 固定 Pillow 13.0.0；无下载素材、无嵌入字体文件、无新增发行许可。missing.png 故意不存在，未伪造其文件 hash。所有选择均为上述已知文件或本地生成便笺，无真实用户文件。

## FAIL、继承与 UNRUN

- 有效 RED：初始 route、adapter missing、host preview missing、48 槽顺序、missing URL，均保留。upload 初稿的 input 选择器带了一个最终组件不提供的 testid，这次失败仅作为测试准备历史，不单独计作有效行为 RED；缺 files 公共 host 的 RED 由 App heading 反例证明。既有 helper/组件公开行为直接 PASS，未伪称 RED。
- 初版 route GREEN 尝试因 jsdom 缺 matchMedia FAIL，局部测试加环境替身后通过；公共 limits 首轮因同时选中 row 和 badge 的 data-status 导致计数断言错误，改为公开 row 选择器，未改库策略。
- 浏览器工具/准备失败保留：T3 timeout、首轮因宿主格式写入热更新清队列、普通 wheel 未滚到正确容器、重复选择同一个 sample 重置事件记录、旧 production 产物复查、一次未显式切服务导致 initial counter guard 拒绝；最终脚本显式服务 URL、reload、产物身份和容器位置，未把失败改写成 PASS。
- compact/gallery 是实际产品反例，RED 截图/DOM/scrollWidth 与 GREEN 独立保存；三个提示 utility 是唯一组件实现变更，未扩展成框架。
- CSS parser、motion-v 的 CSS var 动画提示、VueUse PURE/INVALID_ANNOTATION、EmbedPDF crypto externalized 和大 chunk warning 保留原始日志。原有 [A07](../t05-a07/README.md) / [A06](../t05-a06/README.md) 的 RAW diff-check exit2、冻结 fmt exit1 为继承历史；未清洗或顺修冻结区。
- 本票 staged 全量 raw diff-check **exit2**（原样 ANSI build 日志尾空格），见 `raw/staged-raw-diff-check.log`；维护源码/文档 scoped diff-check **exit0**。未清洗原始日志，也未将 RAW2 写成 clean。
- 自有 ego space 26 与 T3 tab 已关闭，5196/5197 两个服务已按 cwd 核验 PID 后停止；未改变原生浏览器 zoom，测试 emulation 已清除，见 `browser-cleanup.json` / `services-cleanup.json`。
- F02 #73 慢 await、过期批量、晚回 attempt；F03 #74 native HTTP/tus；PDF #75；三种 Office #76；父 #7 最终组合；CI；packed #11；完整 docs #10；设备/相机 #41；旧 consumer #12–15、旧库与生产发布：**UNRUN**。构建到 PDFium 2.14.4 / 本地 OOXML 0.72.2 不代表运行验收。
- 不合并、不关闭 #72/#7/#1，不将 #18 ready，不监控 PR；独立 merger 审核后决定集成。旧源与两个 main 均未改。

完整外部原始证据及脚本：`/tmp/nerv-ui-t06-f01`，handoff/raw 与 durable 路径见最终 handoff。归档排除 node_modules、缓存、clean checkout、.vite 与 dist 目录；resources 中仅保存被核验的实际响应体。
