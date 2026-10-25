# 本轮保留的无效尝试与工具失败

- documentation 技能在 `/Users/mang/.codex/skills`、`/Users/mang/.agents/skills` 及可用副本搜索均未找到；按目标 AGENTS/API 现有文档结构实施，无缺失技能授权扩张。
- T3 preview 首次 open 早于 dev ready，页面 chrome-error；navigate 后可用，同一步 snapshot 两次均 `Preview automation snapshot timed out after 15000ms.`，使用既有 ego 0.6.1.9，未升级。
- 初次 mock test 放 playground，跨包解析实际引入 OOXML，Worker is not defined；移至依赖 owner ui，仍从裸稳定子入口消费后纠正。同步 setProps 之后立即发旧回调早于 props 更新，无效 RED；人为保留退出 vnode 的 stub 又造成依赖/实例归属混乱，不计产品反例。原 JSON/log 和 red-final-contract 对照均保留。
- 最终 base 对照明确是 15 条公开测试的 12 FAIL/3 PASS：旧 fake 不承担 HTTP，9 条在包装层必须持有可取消来源请求处失败；3 条非 ZIP 错误状态失败。正常旧 load 卸载后本就 PASS。不能把早期无效 RED 当有效缺口。
- browser-worker 首次只等任一 ready/error，误读旧状态，不能证明坏文件成功；v2 严格等 error 后抓到真实非 ZIP DOCX ready/1页，原 worker-timeout-state.json 保留，代码添加 ZIP 签名检查后 v3 三格式 error/recovery 通过。
- CDP Worker 自动附加两次导致解析暂停/调试会话重绑，normal-dev/v2 超时，原资源/日志保留。改为测试专用 Worker fetch recorder：原 parser worker 脚本原样追加在 recorder 后，真实 fetch response clone 记录，不 mock renderer/解析结果。Blob 不是 dist 文件，WASM HTTP body 逐字节等 dist。普通无 worker fetch recorder 的生命周期 lane 另列。
- 首个合并 instrument.js/instrument-worker.js 缺分号，IIFE 连接导致 TypeError；attempt-instrument-dev-matrix.json/instrument-attempt-audit.json 保留。修复仅测试脚本。
- normal-dev-v4 截图时同步格式化触发 dev HMR，App 重置为 SVG，Page.captureScreenshot 超时；attempt-v4-dev-matrix.json 保留。v5 期间不写生产源码，完整 21 点通过。早期截图可能记录 dropdown 150ms 退出帧；生产矩阵显式等 nv-select-content 移除后截图。
- browser-errors 首轮在公开 error 事件后立即读错误 DOM，但退出动画尚未完成；undefined.includes 工具断言失败。v2 等真正错误 DOM 后 6 场景及恢复通过。
- browser-late-worker 首轮要求未交付解析结果就终止 Worker，不符合上游无抢占语义而超时；v2 记录交付前3格式各1活 Worker，release 后销毁归零。XLSX navigation 已持有 workbook，可立即 terminate，真实 worksheet 晚回无污染。
- browser-late-source 首轮假定样张 >3000 字节，实际自制 DOCX 2918 字节导致错误阈值断言。v2 使用先前生成清单的精确 bytes/SHA 独立 oracle，12 场景通过。
- 第一生产资源轮 goto+reload 使首轮6个 response ID 无法再 getResponseBody；原 No resource with given identifier found 留存。后续 final-resources 只捕获一轮 reload 的实际响应，另行验证，不能用后来 fetch 冒充早先 response body。
- CSS parse、motion/PURE/chunk/build warning 保留原 log；JSON 未提供 numUnhandledErrors，不编造字段为0。结果验证逐 assertion/status 和日志无 unhandled/uncaught 记录分开。

上述 harness 失败不能作为产品 PASS，也不覆盖真正的 non-ZIP 空白 ready 和窄宽度 50% 钳位 RED。

- 首版 Office 请求 Accept 默认为 */*，Vite SPA 将 missing.docx/xlsx/pptx 返回 200 text/html，预检将其当非 ZIP 拒绝；这不是实际404。history-before-accept 保留整轮证据。新增三格式公开 Accept RED（3 FAIL）后，按文档 MIME 请求，最终重跑必须读到真实404；没有修改 Vite/shared fixture 中间件或伪造404。
