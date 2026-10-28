---
title: 中性应用壳组合
---

<script setup>
import NeutralShellDemo from '../../../../playground/src/NeutralShellDemo.vue'
</script>

# 中性应用壳组合

<ClientOnly><div class="vp-raw"><NeutralShellDemo space="library" /></div></ClientOnly>
<ClientOnly><div class="vp-raw"><NeutralShellDemo space="studio" /></div></ClientOnly>

两个可操作入口：`/#shell/library`（侧栏）与 `/#shell/studio`（顶部溢出）。live 示例直接复用 playground 源码，未恢复候选 app-shell 包，也未新增公共组件导出。

## 宿主适配 API

`NeutralShell.vue` 是示例内的适配器；公共布局仍为 `NvAppShellInset`。

| 输入/输出                                           | 合同                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------- |
| title                                               | 可替换品牌名称                                                          |
| layout                                              | side / top；仅示例排列，不是新库框架                                    |
| items / recent / starred                            | `{ key, label, disabled? }[]`；key 在各列表内唯一且稳定，宿主先过滤权限 |
| currentKey                                          | 当前项唯一事实源；navigate 请求被拒绝时不提前高亮                       |
| user                                                | 可选 `{ key, name }`；替换后插槽与退出读取当前身份                      |
| navigate                                            | key；由宿主决定接受、拒绝及实际路由                                     |
| signOut                                             | 当前 user.key；只产生动作，无认证操作                                   |
| openSearch                                          | 按钮或 Cmd/Ctrl+K 请求；无搜索服务                                      |
| header / user-menu-items / sidebar-footer / default | scoped slot `{ user }`；用户菜单扩展须使用合法 menuitem 原语            |

K 键以焦点所在实例为归属；焦点在壳外时由第一个存活监听者认领。已 preventDefault 或 repeat 的事件不处理。卸载移除实例监听。弹出菜单属于 portal，宿主不应让多个壳同时争用一个全局命令入口。侧栏折叠及其 B 快捷键仍遵循既有公共骨架合同。

<!-- @include: ../../../../../DESIGN/components/neutral-shells.md -->
