# T06/F03：原生传输与本机读回证据

本票仅实施 [#74](https://github.com/Mang-X/nerv-ui/issues/74)，scope:M，单 PR 目标 `integration/nerv-ui-extraction`。本机模拟端点成功不等于生产 FileStorage、原后端或 FullChain 接入。独立 review/merger 尚未执行，本实现席不合并或关闭票。

## 对象与边界

- 开工 clean base：`739a546a81d9cae41224fbeaab016b8f77a575e4`，tree `54e8366ce03270cda6428895ac0e3e9559ecbe33`；fetch/merge 最新 integration 的输出见 raw/integration-refresh.log。
- 实现提交：`2ad055d510c0b35417dfdd87b16ab34c94cf87e5`，tree `a324e008c2e0141b1a09ce87cc69092ffae0a34b`。后续归档提交只增加本证据目录；最终 head/tree 见 PR 和外部 handoff。
- 全部 shell 显式 workdir=`/Users/mang/Project/nerv-ui-worktrees/t06-f03-native-transport`。root/旧源操作通过显式 `git -C` 只读；没有写 T3 自动绑定旧树。真实根、ui 包 AGENTS 与治理已读。
- 修改 8 个实现/协议测试/宿主/文档文件，另本 README 为第 9 个手写文件；raw 为生成证据。未改 SDK/auth/业务 DTO、依赖、CI/shared test-support、migration 来源、F02 useFileUpload/内存 attempt 或原消费者。
- 原 brief 为 raw/issue74-initial.json；父 raw/spec1-initial.json、raw/issue7-initial.json；研究/控制与 F01/F02 独立回执保留在外部目录。Issue #74 仅追加固定兼容/fixture 规则并精确读回；仍 OPEN。

## 需求与精确公开测试

测试从裸 `@nerv-iip/ui` 调用既有公开函数；不以私有函数测试替代协议。下列精确测试名及所有参数展开名、成功断言状态见 raw/host.json 和 raw/verified-results.json。

| 需求 | 公开测试 / 实际证据 |
| --- | --- |
| HEAD 缺失、空、NaN、负数、小数、越界，无 PATCH/假完成 | `rejects invalid HEAD offset null before any PATCH`；其余参数为空字符串、NaN、-1、0.5、9；每例仅 1 请求，无进度。RED6→GREEN6。 |
| PATCH 非法值、不前进、倒退、部分确认，有界结束 | `rejects unconfirmed PATCH offset null with bounded requests`；其余参数为空字符串、NaN、-1、0.5、9、2、1、4；旧 offset2、文件8，每例仅 HEAD+PATCH、只保留25%，不100。RED9→GREEN15。 |
| 非零恢复、二进制、session headers、1 MiB | `resumes from nonzero HEAD with exact binary slices, session headers and 1 MiB chunks`；实际 HEAD17、两个1048576字节 PATCH、最终2097169。`handles an already-complete or empty tus session with HEAD only` 覆盖边界。 |
| 冲突/未知 provider 不再 OR 通吃 | `rejects mode tus provider server-proxy before fetch`、`rejects mode server-proxy provider tus before fetch`、`rejects mode unknown provider tus before fetch`、`rejects mode tus provider unknown before fetch`、`rejects mode unknown provider unknown before fetch`。无 fetch。 |
| 取消传入真实 fetch，阻止后续片与成功 | `aborts before starting and between acknowledged chunks without later PATCH or success`；`passes AbortSignal into an in-flight fetch and never reports PUT completion after abort`；真实 browser 第二片 held→AbortError、服务端 aborted、offset1048593、pending0→resume→最终 hash 相等。 |
| tus409/412/413/460、PUT403/500/network 保留原因 | `preserves tus HTTP 409 reason on HEAD and PATCH`、同名412/413/460；`PUT forwards binary File and headers, reports only completion after response, and preserves failures`。真实 HTTP 与 network-close 另见 browser 读回。 |
| PUT 无细粒度字节进度，回执等 complete 确认 | 上述 PUT 测试在响应前无 onProgress，成功后仅100；`keeps native mode and known fixture selection inert until explicit upload and waits for endpoint completion receipt` 在 complete promise 未释放时无回执，释放后仅确认的 fileId。 |
| 初始/加入/预览/openSource/换页无上传 | 上述 native host 测试；`owns local preview URLs and only opens a controlled source after a separate host action`；browser inert 初态、预览、路由往返与加入夹具的 session/events 均为空。 |
| F01/F02 保留 | 现有 host248 全套通过，包含七变体、图片与 attempt/晚回隔离；runtime memoryUpload/UploadPanel/useFileUpload、App 路由未改。F01/F02 独立回执为 inherited。未重复声称父 #7 全组合通过。 |
| 端点内存/loopback/固定文件/reset | nativeFixture.ts 的 configureServer/configurePreviewServer；server 逐片比较固定字节；真实 pending reset409；最终全部 bytes/hash 确认才 complete。每进程最多16会话、256摘要，文件2097169字节，无任意代理或长期存储。 |

协议规则与宿主操作见[上传文档](../../../frontend/apps/design-system/docs/components/desktop/file-upload.md#原生-http-传输与本机夹具t06f03)。已有根/子入口/default/签名保持；默认仅 tus/tus、server-proxy/server-proxy 两组合兼容，冲突/缺失/未知在 fetch 前拒绝。PATCH 必须确认整片；PUT 等待→传输完成，再完成回执；自定义 adapter 仍可报告细粒度进度。

## Fresh 门禁

- 初始无 node_modules 的准备工作树 `corepack pnpm@11.22.0 -C frontend install --frozen-lockfile` exit0；缓存克隆855实际安装项，不冒称973项均安装。nested pnpm 通过外部 PATH shim 固定11.22.0。
- UI **770**、mobile **144**、host **248**、docs-source UI **6** + mobile **2**，全部 exit0、JSON success=true、failed/pending0、每个 assertion passed；报告可解析。runner 没有 `numUnhandledErrors` 字段，保持 NOT PROVIDED；原始日志未见 unhandled/uncaught 标记，不伪造数值0。
- 最终 build exit0，含三个活动包 vue-tsc 与 production build；fresh fmt exit0；lint exit0，保留一条 `unicorn(no-useless-spread)` 测试中 TypedArray 转普通数组的 warning，不写成零诊断。
- 16 份完整依赖输入逐字节一致；整个 lockfile 及4 importers/973 packages/973 snapshots 全对象一致，含解析与依赖字段，非 keys-only。三个活动包 Vue3.5.39 指向同一真实文件。raw/dependency-audit.json、vue-identity.json。
- 源码 scoped diff-check exit0。包含 raw 后的完整 diff-check 另见交付检查；原始日志尾空白不清洗，不据局部检查宣称全量 clean。
- 可复现完整命令、cwd、exit、耗时在 raw/commands.jsonl；本轮所有 Python 经 uv。CSS parser、motion CSS变量、PURE annotation、chunk warning 保留。

## 浏览器与字节读回

实际在本机 dev5203、production preview5204，使用已安装 ego-browser 同一 space33/p1。T3 preview_status/open/navigate 后 snapshot 两次原样 `Preview automation snapshot timed out after 15000ms.`，按授权 fallback，未升级 Ego。raw/t3-tools.json 与 browser-*.log 保存原始结果。

已知夹具 `byte[i]=i%251`，本仓生成，2 MiB+17；SHA256 `b057f26faa652e9916aa08eed7e50906151f83de0e878173e9d06e359c0dd75e`，无第三方来源或用户文件。请求摘要含实际方法、session/Tus/offset/content-type headers、二进制长度/hash；响应摘要含状态、headers、body；服务端 readback 独立保留 byteCount/offset/hash/complete/pending。应用层 fetch instrumentation 不冒称完整 CDP 网络抓包，端点日志另包含 Chromium 内部 PUT 重试。

- dev 成功记录 raw/dev-browser-success.json：仅预览/openSource、换页往返、加入夹具均零会话；tus/PUT 最终完整 hash 相等。
- dev 矩阵 raw/dev-browser-matrix-complete.json：21 个场景的28条终态读回（成功、取消/恢复、四 tus HTTP错误/恢复、五 HEAD非法、七 PATCH非法、PUT成功及403/500恢复）；该轮 network 末例因一次断开被 Chromium透明重试，等待失败超时，未记为通过。修正后 raw/dev-network-final.json 实际 Failed to fetch，服务端两次断开均 offset0、complete=false、pending0。
- production 完整矩阵、资源响应与最终截图见后附 raw；所有成功必须固定最终2097169字节及上述 literal SHA256，失败无 complete，取消无后续片，恢复重新 HEAD 并最终相等。network 固定持续断开直到显式reset，不伪称该场景可直接恢复。

## FAIL、继承与未运行

保留 red-head/red-patch/red-routing-abort 原始 RED。格式化多语句 @click 导致 parser FAIL、第一次缩进替换未命中的第二次 FAIL、修正后 native-final3 成功；对应浏览器 context消失、空页/locator/wait超时与后续恢复都保留。网络夹具一次断开导致透明重试成功的反例也保留，不以之后通过覆盖。准备读取路径/工具 FAIL 见 raw/preparation-failures.md；raw空白和缺失字段原样保留。

F01/F02 独立 merger 证据仅 inherited；当前实施者自检不等于独立 review。PDF75/Office76、父7组合、CI、packed11、完整docs10、device41、旧consumer12–15、#43/#51、生产发布均 UNRUN。本轮未顺修其它票、未 merge/close/ready18/watch/poll/publish。

外部完整脚本、原 brief、控制与回执：`/tmp/nerv-ui-t06-f03/`；持久交接：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-f03-implementation-r1/`，含逐文件 SHA256SUMS 校验，过滤 node_modules/cache/cleancheckout/.vite/dist。实际 HTTP response.bin 属于证据，保留；源码dist目录不复制。清理浏览器/自有服务、最终精确对象与未决异议见外部 handoff.md。

最终 production `raw/prod-browser-matrix.json`：22场景/29终态读回；`raw/prod-resources.json`：七内存排列切换、SVG1200×720/PNG640×400/JPEG640×400真实解码、openSource与路由往返零写。HTML、当前 JS/CSS、Inter字体和三图片共7个实际200响应，其浏览器解码后 body 与最终dist逐字节相同，MIME/长度/SHA256见 raw/resource-audit.json；不把 gzip headers 与解码后 body 冒称压缩线缆字节。仅这7项实际响应已核对，完整dist manifest是本地产物清单，不是其它所有资产都真实加载的证据；PDF/Office资源运行仍UNRUN。

已查看 production 截图：prod-native.png 实际2300×1225；prod-native-390.png 实际390×844，配套几何 innerWidth=scrollWidth=390、scale1/dpr1。恢复后 width2300/scale1/dpr2；清除emulation、关闭space33所有自有页和T3页。确认pending0后显式reset，按PID与cwd核实只停止自有5203/5204，listener absent；见 raw/browser-cleanup.json、service-cleanup.json。

资源核对脚本初次错误假设图片高度900/480，实物SVG/PNG/JPEG metadata为720/400；raw/resource-audit-red.log与原脚本保留，纠正脚本后resource-audit-green exit0。产品图片未改，未把审计脚本错误算作产品缺陷。

raw/browser-verified.json 另逐条校验全部 partial hash、HEAD/PATCH/PUT/session headers、二进制分片及 literal 最终SHA。production network 由应用层1次fetch产生Chromium内部3次PUT，最终明确失败；dev为2次。首次审计脚本误把内部重试限2而FAIL，原脚本与verify-browser.log保留，修正为应用fetch边界后verify-browser-final exit0；非法offset的请求上界保持HEAD1或HEAD+PATCH（stub2，真实fixture在第二片触发时含首片总3请求）。

最终 staged 全量 `git diff --cached --check` 为 **exit2**；诊断全部位于本票 raw 的原始尾空白/EOF空行。源码与手写文档维护范围检查为exit0，二者分列。完整失败输出与真实exit在外部 raw/final-full-diff-check.log、commands.jsonl；没有清洗或冒称全量通过。
