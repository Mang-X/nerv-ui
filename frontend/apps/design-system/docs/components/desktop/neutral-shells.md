---
title: 中性应用壳组合
---

<script setup>
import NeutralShellDemo from '../../../../playground/src/NeutralShellDemo.vue'
</script>

# 中性应用壳组合

## 示例

<section id="library-shell" class="vp-raw nv-doc-shell-frame" aria-label="晨光书房应用壳示例">
  <ClientOnly>
    <NeutralShellDemo space="library">
      <template #navigation>
        <a href="/" class="p-2 underline">返回文档首页</a>
        <a href="/components/desktop/neutral-shells?space=studio#studio-shell" target="_self" class="p-2 underline">周末画室</a>
      </template>
    </NeutralShellDemo>
  </ClientOnly>
</section>
<section id="studio-shell" class="vp-raw nv-doc-shell-frame" aria-label="周末画室应用壳示例">
  <ClientOnly>
    <NeutralShellDemo space="studio">
      <template #navigation>
        <a href="/" class="p-2 underline">返回文档首页</a>
        <a href="/components/desktop/neutral-shells?space=library#library-shell" target="_self" class="p-2 underline">晨光书房</a>
      </template>
    </NeutralShellDemo>
  </ClientOnly>
</section>

两个可操作入口：`/#shell/library`（侧栏）与 `/#shell/studio`（顶部溢出）。live 示例直接复用 playground 源码，未恢复候选 app-shell 包，也未新增公共组件导出。

文档通过 `NeutralShellDemo` 的 `navigation` 插槽提供首页链接与两个实例的定位入口。空间链接在当前标签页重新载入文档并定位对应实例，示例状态随页面重新开始；playground 不传插槽时保留原 hash 导航。

## API

`NeutralShell.vue` 是示例内的适配器；公共布局仍为 `NvAppShellInset`。

| 输入/输出                                           | 合同                                                                               |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| title / logo                                        | 可替换品牌名称                                                                     |
| layout                                              | side / top；仅示例排列，不是新库框架                                               |
| items / recent / starred                            | `{ key, label, disabled?, children? }[]`；key 在各列表内唯一且稳定，宿主先过滤权限 |
| currentKey                                          | 当前项唯一事实源；navigate 请求被拒绝时不提前高亮                                  |
| user                                                | 可选 `{ key, name }`；替换后插槽与退出读取当前身份                                 |
| navigate                                            | key；由宿主决定接受、拒绝及实际路由                                                |
| signOut                                             | 当前 user.key；只产生动作，无认证操作                                              |
| openSearch                                          | 按钮或 Cmd/Ctrl+K 请求；无搜索服务                                                 |
| header / user-menu-items / sidebar-footer / default | scoped slot `{ user }`；用户菜单扩展须使用合法 menuitem 原语                       |

`topDomains` 为独立的 `{ key, label, disabled? }[]`；`currentDomainKey` 为当前域，`selectDomain(key)` 为受控请求。host 通过 `items` 更换域内页菜单；`currentKey` 只标记页，域与页的 key 不互相推断。`items.children` 表达父子折叠，父项本身不发页导航。

以下可选文案 props 均有默认值：`searchLabel`（查找空间）、`moreLabel`（更多空间）、`signOutLabel`（退出当前用户）、`navLabel`（空间菜单）、`domainsLabel`（常用空间）、`starredLabel`（星标）、`recentLabel`（最近访问）。`userMenuLabel` 缺省为当前用户名加「的用户菜单」。`logo` 默认 N。

顶部按实际宽度显示 0..N 域，菜单关闭后仍标记溢出当前域。未提供 `topDomains` 时兼容平面 `items` 导航；两个正式示例均显式分离域与页。

K 键以焦点所在实例为归属；焦点在壳外时由第一个存活监听者认领。已 preventDefault 或 repeat 的事件不处理。卸载移除实例监听。弹出菜单属于 portal，宿主不应让多个壳同时争用一个全局命令入口。侧栏折叠及其 B 快捷键仍遵循既有公共骨架合同。

<!-- @include: ../../../../../DESIGN/components/neutral-shells.md -->

<style>
/* A transformed host contains each shell's fixed desktop sidebar, as on the Sidebar page. */
.nv-doc-shell-frame {
  position: relative;
  transform: translateZ(0);
  isolation: isolate;
  height: 36rem;
  max-width: 100%;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-block: 1rem;
}
.nv-doc-shell-frame [data-slot='sidebar-wrapper'] {
  min-height: 100%;
}
.nv-doc-shell-frame [data-slot='nv-sidebar-container'] {
  height: 100%;
}
</style>
