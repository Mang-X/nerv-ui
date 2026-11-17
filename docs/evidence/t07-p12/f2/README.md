# T07/P12 PR110 R2 两项 P2 返修

本轮只处理 #95/P12 的两项 R2 material：包 README 的比较合同入口断链，以及有 task 但 assignment ID 为空串或全空白时比较与独立预览未停止。R2 起点为 `d47dbb784f6637721254a5387367b6b0e48a6916` / tree `a1401c3576ef0308afb36af4dbab5c7f76d8dc97`；固定 integration base 为 `4e41611aa926ea6c185dd484f2d08278699f4959` / tree `92b9d014d3f123cd00d9771411e1711d93030901`。最终提交与原始日志见外部 `t07-p12-empty-identity-fix/handoff.md`。

## Requirement → 公开 RED/GREEN

| R2 finding                      | 实际证据                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1 比较合同入口多一级 `..`      | `frontend/packages/scheduling/README.md` 改为 `../../../docs/scheduling-comparison.md`。本票原有 5 份人工 Markdown 的 51 个本地相对链接逐项目标存在，另对新增本页复核；fmt 单列。                                                                                                                                                                                                                                     |
| F1 缺失 assignment 身份继续比较 | `public snapshot comparison rejects missing assignment identities in comparison and recovers after replacement` 和 `public snapshot comparison stops standalone preview for missing assignment identity and restores current selection` 在旧实现下 2 FAIL / 10 PASS；单点 `uniqueItems` 校验后 12/12 PASS。两入口均覆盖空串、全空白、错误停行/停图、替换恢复、不发错选中；无 task 的显式 blocked 与正常原样 ID 保留。 |

`ScheduleTask.id` 的公开类型为 `string`；校验只判断是否存在非空白字符，不修剪并改写合法 ID，也不从 semanticKey 或 legacy pair 推造 ID。没有 task 的活动不进入 assignment 校验。原 R1 五项行为及 P08 旧省略签名未改。

## Fresh 门禁与实际读面

- `TZ=Asia/Shanghai` scheduling 全桶：319 discovery / 315 PASS / 0 FAIL / 4 pending vendor stub skip，JSON `success:true`、命令 exit 0。`playground` 默认并行全桶：328 PASS / 1 FAIL（`DraftEditingDemo.test.ts:95` 一例约 5.2 秒）；原始失败保留。随后单次 `--no-file-parallelism` 全桶：329/329 PASS、exit 0。三个 JSON 均缺 `unhandledErrors` 字段；CSS parser 噪声单列，不写成产品失败。
- scheduling/playground `vue-tsc --noEmit` 与 playground build 均 exit 0。build 的 Rolldown PURE 注释及大 chunk 提示保留。受影响源码 lint、本票 Markdown fmt、维护 diff-check 和最终状态见外部 handoff。
- 本次 dist 主 JS 为 `index-DLowpJ7l.js`。本地 preview 对 HTML、主 JS/CSS、runtime、Evaluation JS/CSS、字体的 7/7 HTTP GET 为 200，MIME 与实际响应 body 对 fresh dist 字节一致。真实 Chromium library 中受控 props 注入空串/空白：比较出现身份错误且 3 行归零，独立预览错误且真实图面撤下，选择仍未发；恢复原 ID 后 3 行和图面恢复，点击当前活动选中。studio 路由显示 3 行与 2 条真实 vendor task bar；Evaluation notice 在 shadow DOM，完整浏览器 snapshot 可见。该探针操作的是本地页面运行时 props，不是宿主正式错误数据入口。
- T3 `preview_status`→`preview_open` 后同一步 `preview_snapshot` 两次报 `Preview automation snapshot timed out after 15000ms.`，按规则切 ego-browser。studio 中最初用 `document.body.textContent` 查 notice 得 false，后由完整 snapshot 查见 shadow DOM notice；第一次等待 body 文案超时是探针方法错误，原始日志保留。
- 16 工程输入及 vendor JS/CSS/d.ts 对 base 字节相等；锁原字节与完整 YAML 对象相等（5 importer / 973 package / 973 snapshot，含依赖边、peer、optional），两消费方 Vue 为同一实体，migration 相对 base 无 diff。Evaluation 9.1.4 声明/水印未编辑，商业授权 UNKNOWN。

CI、docs #10、packed #11、device、旧 consumer #13/#15、父 #8 组合、真实 APS、生产、原生 zoom、默认并行稳定性及 base/head timeout 归因均 **UNRUN/UNKNOWN**。R2 旧回执及原始证据仅供独立 R3 参考；本实施席不自审、ready、merge、close、watch 或启动后继。
