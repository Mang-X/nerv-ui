# 文档顶栏中间宽度前置修复

scope:S，#193，父#10；独立于F20/PR192。基线58eb4c3cedfc7155ec57cffbbb7bd9d578dabf8d。

R1真实800px出现document951px/scroll151px，同宽Avatar亦现；theme与基线同字节，属于已有宿主前置问题，原FAIL与来源保留在外部 t09-f20-acceptance-merger-r1/review-receipt.md。

仅Layout.vue将搜索宽度/文案/快捷键从md展开改为lg展开；768–1023px保留紧凑搜索按钮、原可访问名称和VitePress搜索打开路径，导航/主题入口不删减。不改基础库/API/锁/治理，不全局裁剪overflow。

几何和真实操作待独立runtime验证，不用class或jsdom断言冒充浏览器证据。fresh门禁及对象见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-nav-medium-width-fix/handoff.md`；缺runtime数字UNKNOWN，CI/packed/device/production UNRUN。历史FAIL保留，旧应用接入退出NOT_PLANNED。
