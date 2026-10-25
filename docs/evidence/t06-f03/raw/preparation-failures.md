# 会话原始失败摘录（工具历史节选，不是重跑）

- 最初技能读取：`cat: /Users/mang/.codex/skills/documentation/SKILL.md: No such file or directory`。两处技能根和文件名搜索均无 documentation，按目标仓约定更新对应组件文档。
- Vue reference 路径初次失配：`cat: /Users/mang/.codex/skills/vue-best-practices/references/reactivity-core.md: No such file or directory`；随后按技能实际 `references/reactivity.md` 读取。
- 安装前：`ls: frontend/node_modules: No such file or directory`，属于初态；之后 frozen install exit0。
- 早期证据脚本 glob：`zsh:1: no matches found: /Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t06-f02-review-r1/scripts/*`；后按实际根目录脚本读取。
- 检查 gate 进度时 shell glob：`zsh:18: no matches found: /tmp/nerv-ui-t06-f03/raw/ui*`，当时首轮UI未写最终JSON；不视为测试结果。
- 第一次恢复模板替换没有命中实际缩进；fmt exit0，但 native-final2.json success=false/FilesDemo suite编译失败。第二次使用 asserted regex替换，native-final3.json成功。
- 所有 RED、编译错误、browser context/locator/wait FAIL、网络透明重试反例均见各原始 log/json，不删除空字段或原始空白。
- resource-audit.py 初次错误假设图片高度导致 AssertionError，初次 resource-audit.log stdout为空；随后通过run.py重现得到明确exit1和raw/resource-audit-red.log。实物metadata确认SVG1200×720、PNG/JPEG640×400后修正脚本，green exit0；原始脚本仍保留。
- verify-browser 初次把 Chromium 内部 PUT 重试次数误限为2，production 实际同一应用fetch产生3次服务端请求，AssertionError已保留。按正确边界改为应用层该session仅1次fetch；内部3次事实单列，不要求用户态控制Chromium重试。offset非法案例的1/2请求上界未放宽。
