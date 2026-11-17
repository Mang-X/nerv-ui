# 两处 NvSidebar 预览高度规则

scope:S，#205，父#10 F。F R2真实Dashboard侧栏900px被480px框裁切、footer不可见且click超时；原FAIL见外部t09-f-parent-acceptance-r2/review-receipt.md。

只修dashboard.md与sidebar.md中实际NvSidebar的data-slot高度选择器；原版BaseSidebarExample的sidebar-container不改，neutral-shells前轮已修。已核当前组件实际为nv-sidebar-container，不改基础源码/API/锁/治理或其他例逻辑。原文与原例字节仅这两处差异。

CSS匹配不能代替真实几何和命中，最终footer/移动/站点回归留独立验收。外部 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-nv-sidebar-preview-height-fix/handoff.md` 保存实际门禁与最小对象回读。历史FAIL/UNKNOWN保留，CI/packed/device/productionUNRUN，旧应用接入退出NOT_PLANNED。本票不代表F已通过。
