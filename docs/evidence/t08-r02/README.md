# T08/R02 · 两处装饰背景实施证据

## 对象与范围

- 票：[ #20](https://github.com/Mang-X/nerv-ui/issues/20)，scope M；交付一支独立 draft PR，母 #9 / Spec #1 保持 open。
- 实施基线：`a422ffe9e735a81fd0d2251cf3aaf5d863d4b12b` / tree `6f088a1ffa5d7e77ed7938187ba660af2fee0eb1`，开工时分支 `feat/t08-r02-backgrounds` 干净。
- 固定旧源：Nerv-IIP `79b1578f2b75f55709765b5e7882aaf33146c603` / tree `58e30c637acb7efdd393af291e570288b03b5aa9`，只读；新库迁移素材的 blob 与旧源一致。
- `FlowLinesBg.vue`：blob `13d08933d5b0b95887d5a08720256bfa2b788bdb` → `NvScreenFlowLinesBg`；`IsoFactoryBg.vue`：blob `647b23348315b2409d4471a172595d949707a121` → `NvScreenIsometricBlocksBg`。固定素材树搜索无两件的直接组件引用；此事实不证明历史从未使用。
- 两个新组件与来源仅有注释中性化及 CSS 层 `app` → `nv-components` 差异。流线保留 2 主干、4 支线、6 条对应流光、8 节点与 3 扩散环，`1440×810` / `xMidYMid slice`；等距块体保留 20 条网格线、6 组块体及节点，`1200×760` / `xMidYMid slice`。两者均零必填属性、保留 `aria-hidden`，没有共享 SVG `id`。
- 新库 screen 主桶导出与 `/#screen/backgrounds` 专用深链只覆盖这两件。无业务数据、SDK、认证、路由依赖；`FusionBg`、种子氛围层、导航框架和旧应用接入不在本票。

## fresh 验证

| 接缝                  | 实际结果                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 公开组件测试 RED      | 初始 `ScreenBackgrounds.test.ts` 3/3 FAIL：两个公共导出为 `undefined`，双实例 0 SVG。                                                                                                                                                                                                                                                                                      |
| 公开组件测试 GREEN    | `vp test run src/components/screen/ScreenBackgrounds.test.ts src/components/screen/ScreenChrome.test.ts`：2 files、6/6 PASS。检查原固定路径、尺寸、切片、几何数量和双实例引用。                                                                                                                                                                                            |
| host 深链 RED → GREEN | 新测试初始 0/2 SVG FAIL；`vp test run src/ScreenDemo.test.ts` 最终 9/9 PASS，含离开/重入。                                                                                                                                                                                                                                                                                 |
| 文档合同              | `vp test run src/design-docs.contract.test.ts src/nvui-doc-coverage.contract.test.ts src/docs-layout.contract.test.ts`：3 files、6/6 PASS。                                                                                                                                                                                                                                |
| 类型、构建、风格      | UI 与 playground `vue-tsc --noEmit` 均 exit 0；playground `vp build` exit 0（6563 modules）；受影响源码 `vp lint` exit 0；受影响前端文件 `vp fmt --check` exit 0；根 README 与 `docs/screen-standalone.md` 用同版 `oxfmt --check` exit 0；`git diff --check` exit 0。                                                                                                      |
| 真浏览器、生产预览    | `vp preview` 的 `http://127.0.0.1:4187/#screen/backgrounds` 实际目视；宽 2300×1225 与窄 720×900、宿主深/浅主题、双实例、系统 low motion 动态切换均检查。流光正常时有 CSS animation，low motion 时 `.flux`/`.ping` 隐藏，流线/等距节点 animation 为 `none`，静态线框/块体/节点可见。离开深链 SVG 4→0，重入 0→4，实例中 SVG `id` 数 0。                                      |
| 实际资源              | 生产预览加载 `index-Db7nc1YS.js`（200，`text/javascript`，1,203,089 bytes，SHA-256 `2f58862622a61979c3789f2bc08b1737e9bb9fb6a32ad06395b6542356877c0c`）及 `index-D7v_h1v7.css`（200，`text/css`，348,829 bytes，SHA-256 `bdb941ce988ad5f9739b4f85740fcf612d2d7a02726c8548576067c48103b663`），响应 body 与本次新鲜 `dist` 文件逐字节相同。只证明此入口实际请求的两个资产。 |

目视截图：[默认](screenshots/backgrounds-default.png) · [浅色宿主](screenshots/backgrounds-light.png) · [窄视口](screenshots/backgrounds-narrow.png) · [低动效](screenshots/backgrounds-reduced.png)。截图取自生产预览，非静态 mock。

## 继承、FAIL 与 UNRUN

- **继承**：`frontend/pnpm-lock.yaml` 与基线 byte-for-byte 相同（SHA-256 `0cfcb1cc92892690db8aa848165280a49941f0cf8d7b868c721e641e4634ab07`）。完整解析比较 5 个 importer、973 个 package object、973 个 snapshot object，均与基线相同；根、UI、playground manifest specifier 无差异，Vue 唯一快照 `vue@3.5.39(typescript@6.0.3)` 的依赖与可选 TypeScript 边未变。测试复用另一同锁工作树的既有 Node 依赖缓存链接；没有 install、升级或改 lock。
- **历史/环境 FAIL 保留**：全 frontend `vp fmt --check .` 本轮 exit 1，四个未改文件 `DESIGN/component-coverage.md`、`design-system/.../file-upload.md`、`playground/.../PDF-SOURCES.md`、`ui/.../THIRD_PARTY_NOTICES.md` 仍与基线各自同 blob；没有顺修。首次错误调用 pnpm 12 触发版本拒绝，随后 pnpm 11 的 `exec` 拒绝外部 symlink modules dir；门禁改用已缓存 `vp` / `vue-tsc` 可执行文件。T3 preview 截图同一步两次超时，原文 `Preview automation snapshot timed out after 15000ms.`，随后通过 ego-browser 完成真浏览器检查。
- **非失败告警**：jsdom 的 `Could not parse CSS stylesheet` 与 Rolldown 的旧依赖 annotation、chunk size、`crypto` externalized 告警单列，不冒充无告警成功。
- **UNRUN**：CI、完整文档站 #10、版本化/packed 安装 #11、设备、旧消费者、父 #9 组合验收、生产与授权验证。DHTMLX 9.1.4 Evaluation 及版权水印未动，授权状态 UNKNOWN。#12–#16 四类旧应用接入与旧库退出已按用户最新范围取消（NOT_PLANNED），不作为本轮必须门禁；原 Nerv-IIP 仓库未写。

外部原始截图、全局格式日志与实施交接：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t08-r02-implementation-r1/`。本目录仅含差异证据，不复制 `node_modules`、缓存、`dist` 或 clean checkout。
