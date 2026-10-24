# 提交前窄审响应
R1 candidate tree ab29e5054b74f5179748d5115573e38a3db3701d，material P2 1 / optional1 / critical0。
P2接受：日列自身scroll不应程序回写；先补公开DOM非整项scrollTop=58回归，候选应RED，再将日列回写限于年月变化。无需公共基础改动或新API。旧全整数滚轮测试不足以暴露该回归。旧构建和四态结果保留，不冒充最终新产物。
Optional接受：在最终提交补docs/evidence/t04-n03/README.md与原始记录。
公开回归 review-day-wheel-red.log: 1FAIL/4PASS，实际58→40；最窄修 key !== 'd' 后 review-day-wheel-green.log:5PASS，mobile-post-review:94PASS，host-post-review:52PASS。保留原P2与旧93PASS证据。最终将使用新构建重新做完整四态组合，而非把旧bundle浏览器凭据冒充最终。
