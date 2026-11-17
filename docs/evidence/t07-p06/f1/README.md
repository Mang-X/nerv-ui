# P06 · R1 Standards F1/P2 展示返修

本轮仅 #89 / PR105 的 scope S 返修。R1 在 `b1b74511cdcbedfb179bb37ed9ecf176fc3e4b2a` / tree `dec7a4ccbce1e4aa7b19bb64523ae3889a75e555` 拒绝：展开“时间调整记录”会显示原始 JSON，违反 `frontend/DESIGN/governance.md:262/264`。本轮改成活动名、移动/开始/结束时间调整、上海时间的前后时刻及实际处理结果；记录全部保留可展开阅读，没有增加默认可见的技术诊断。

精确最终 head/tree、命令和 SHA 回读见 durable [handoff](/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p06-record-copy-fix/handoff.md)，下文 `E` 为其目录。原[实施记录](../README.md)、[实施 handoff](/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p06-implementation-r1/handoff.md)、[R1 receipt](/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p06-review-r1/review-receipt.md) 与两轴报告保留，不由本轮结果覆盖。

## Requirement | Evidence

| Requirement                                                 | Evidence                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 两领域使用实际活动名、动作、前后时间和结果，不显示技术 JSON | `E/raw/browser-05.json/log`，真实鼠标；[书房截图](browser/library-records.png)、[画室截图](browser/studio-records.png) 已实际查看。分别为“阅读与交流”和“速写与配色”，三条记录均可读，展开内容不含 operationId/taskId/resourceId/kind/startUtc/endUtc。                                                                                                                                                               |
| accept/reject 的实际行为不变                                | 两领域 move 10→13 时移至12→15时并采用；左端提议11→15时但保留12→15时；右端调整采用12→17时。另以真实 move 触发“换为另一安排”，结果显示已换时间，当前权威16→19时。每步同时读公开时间、记录及 bar label；参考图时间与几何未改变。                                                                                                                                                                                        |
| 保留所有记录，支持打开/关闭/重开及重置                      | 两领域空态、三条历史的关闭和重新展开均验证；第四条替换结果可读；“恢复最初安排”后记录归零及空态恢复。没有用隐藏整个面板替代返修。                                                                                                                                                                                                                                                                                     |
| 公共 payload/事件/controlled 算法保持                       | `E/raw/unchanged-inputs.json`：scheduling 全部源码、测试、vendor 及 lock/workspace 共72文件与 R1 逐字节相同。原 `TaskDragPayload[]` 仍保存原事件对象；新增记录只保存展示快照。原测试 `restores authoritative order dates after a rejected %s without mutating input` 的完整六字段断言和 accept/reject、身份断言未削减，本轮不写测试或镜像断言。                                                                      |
| 真实新产物、受影响门禁                                      | fresh 宿主297/297 PASS；实际 reporter `unhandledCount=0` / `reason=passed`，Vitest JSON 缺失字段仍 null。docs-source6 PASS、workspace types、root production build、修改源码 fmt/lint、maintenance diff-check 均 exit0。root 53个 HTTP 实际响应逐字节等于 fresh dist，metadata全部保留；仅本页相关7项保留响应 body，包含新主JS/CSS、runtime、vendor JS/CSS、字体与HTML。见 `E/gates.json`、`raw/http-bodies*.json`。 |

截图通过公开按钮收起参考图以完整展示三条记录；活动图、Evaluation 声明、水印与授权 UNKNOWN 保留。仅核 P06 新页可见提示及当前时间表达，不扩全仓文案；公共开发文档中的 payload 说明保留。

## 边界与证据分层

- 本轮生产源码仅 `OrderEditingDemo.vue` 的记录快照、当地时间格式和模板；原 accept/reject/replace 分支不变。无 DhtmlxEngine、TaskDragPayload 公共合同、事件、controlled 算法、lock/vendor/依赖改动。无需回传冻结来源，旧库和 root 只读。
- R1 Spec optional P3 的文字修正：旧手势失效保证从 `onBeforeTaskDrag` 建立 token 后开始。mousedown 到移动阈值之间没有 token，不能声称任何 mousedown 后的替换都会取消；R1 真实测试未观察到旧值覆盖新权威。本轮不改 token 设计。1000px Evaluation 遮首条上半部、下缘真实拖成功的历史边界保留；本轮不去水印、不采购、不扩大窄图修复。
- fresh 仅本轮上述展示浏览器和门禁；原 R1 scheduling 146 PASS/4原skip、三类 drag完整payload、动态readonly/lock/authority、双实例、卸载/路由/native及完整生命周期只作有限继承。72项字节证明和新产物响应支持该限度，不将旧浏览器或nested证据冒充 fresh。四 stub skip仍0执行，不冒真实 vendor conformance，不增skip/exclude/timeout。
- maintenance diff-check exit0；main全量RAW exit2历史空白分列保留。root build 的第三方 PURE/chunk warning、docs-source CSS parse提示保留。未 fresh install、未机械重跑未变的完整engine/其它UI矩阵。
- 本轮 `browser-01` stdin解析错误；02右端一小时输入未产生提案而超时；03同URL未reload导致空态前置不成立；04真实右端吸附17时而脚本预期16时失败；05纠正验证脚本、fresh reload后两领域整轮exit0。均保留原件，产品代码没有因此变动。脚本的水印精确字符串读取未匹配，水印存在以两张实际截图为证，不以该布尔值推定水印消失。
- T3先status/open，about:blank参数错误改为空参数后成功；同一步snapshot两次原始 `Preview automation snapshot timed out after 15000ms.` 后切Ego。仅自有Space73/p1，未升级；末次finish恰一次，T3自有tab正常关闭。TZ/原生zoom未覆盖，末Asia/Shanghai、dark、visualViewport.scale=1。服务只清理核过PID/cwd的自有4266 preview，清理回执见 handoff。
- 原公开RED、测试literal错误后corrected RED、中间fake after-only FAIL、窄图及browser-races-03 FAIL、R1 material拒绝全部保留在历史指针。P01提示/P02年份/P03字号与ETA、P04/P05、#43/#51均不搭车。
- UNRUN：CI、完整docs #10、packed #11、device、旧consumer #13/#15、父 #8组合、真实SDK/APS、生产发布、原生80%/125%zoom、独立R2；商业授权 UNKNOWN。

PR105保持OPEN/DRAFT，watching=false；#89/#8/#1保持OPEN，总PR18保持DRAFT。仅实施返父，不独立审核、ready、merge、close、watch或启动后继。独立R2由父席安排。
