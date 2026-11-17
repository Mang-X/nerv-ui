# T09-B R1 返修：图外资源选择清空归属覆写

独立 R1 的 host/共享投影探针确认：页面接受 workCenter null 后再选“焊接-01”，资源字段已更新，但旧 `unassignedDimensions` 仍压过新工作中心，图投影仍为未分配。默认页面真实鼠标是否可达该 null 状态尚未取证，不把本缺陷写成真实 vendor FAIL。

本次仅在资源页本地资源目录 setter 及对应围栏中，重新选择合法资源时移除 workCenter 的明确空归属标记，保留 team 等其它标记。生产包和 projection 不变，目录映射仍为该页显式规则，不扩为通用设备推断。

`resource field assignment clears its work-center null override while retaining other empty dimensions` 实际编译原 Markdown 的脚本与 live 内容：公开图板事件输入 team/workCenter null，公开 NvSelect 更新到焊接-01，核当前资源字段、共享生产 projection.keyOf 是焊接-01，team 仍未分配。修复前 FAIL，修复后 PASS。图板明确 stub，这证明文档宿主衔接，不替真实厂商手势。

A6 与 B 新旧用例共 19/19 通过；types/build 与原始日志见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-b-marker-fix/handoff.md`。剩余 B 代码/真实运行验收仍待独立席，本次未操作浏览器。旧 R1 FAIL 与作者历史 RED 不覆盖；runtime/unhandled 数字缺失 UNKNOWN，CI/packed/device/APS/production UNRUN、授权 UNKNOWN。C–H 与父 #10 不在本修复验收内。
