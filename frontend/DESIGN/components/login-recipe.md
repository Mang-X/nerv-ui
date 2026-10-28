# 中性登录与改密组合

## 规则

C01 是宿主 recipe，源码位于 `apps/playground/src/login`，没有新增库组件、barrel、认证层或 package 入口。复用 NvSidebarBrand、NvCard、NvButton、NvMobileButton、NvScreenButton 与 R05 的 NvScreenLoginStage；原生 label/input 保留来源输入合同，受控拒绝更新不丢焦点、不采用被拒绝的显示草稿。

## 判定

四形态来自 console、business-console、business-pda、screen，而不是四个新的组件。两个 PC 形态在 lg 断点分栏，小屏显示品牌；console 无外卡，business-console 有卡片与账号说明。PDA 四边安全区、48px 输入与移动按钮。大屏嵌入 R05 唯一 form，不再实现插画舞台；使用原生 password 输入，因为现有 NvScreenInput 没有将 type/autocomplete 转发到实际 input 的公开合同，不更改该件或冻结 primitive。

## 正例

两个中性领域为晨光书房/周末画室。宿主拥有五字段 draft、形态、模式、只读、禁用、退出结果和明确确认回调。`submit` 接收草稿快照及 mode，只有返回对象 `accepted === true` 才 emit `confirmed`。此事件不含密码；示例只显示安全确认，不创建会话、不保存、不跳转。错误拒绝、throw、缺 callback、缺 receipt 均用固定安全文案，可重试。

请求版本在 pending 期间防重复；取消、卸载、形态/模式/上下文、readonly/disabled、callback 与 draft 更改使旧 success/catch/finally 全部失效。取消保留草稿；readonly 可取消。宿主若需要真正跳转，必须自己在有效确认后处理。

## 反例

不根据非空账号猜认证成功，不显示异常原文、密码、payload 或密码日志；不复制 auth/store/router/SDK、redirect 清洗或原应用算法。改密不内置 required、强度、长度或确认一致策略；三个原样字符串交宿主决定。四形态均可组合改密，但 screen 来源没有改密页面，属于本票中性组合，不能宣称原 screen 有此行为。

## 来源合同

来源固定 `79b1578f2b75f55709765b5e7882aaf33146c603`，逐文件 blob/SHA256 回到 T01 provenance；C01 完整读取清单和字节核对在 `docs/evidence/t08-c01/sources.json`。

| 来源                                                  | 保留                                                                                                                   | 移交宿主与差异                                                                                      |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| console login + LoginForm                             | PC 分栏/小屏品牌、无边框外卡、username/current-password、text/password、required、原生 form Enter                      | 账号提交 trim，密码原样；i18n/authError、认证及 redirect 不复制                                     |
| business-console login + LoginForm                    | PC 分栏/小屏品牌、卡片、账号说明、输入合同同上                                                                         | 同样 trim；品牌与安全提示中性化                                                                     |
| business-pda login                                    | 四边安全区、username/current-password、autocapitalize off、spellcheck false、无 required；failed/timed-out 退出 notice | 账号不 trim；notice 只呈现宿主结果，不执行会话撤销                                                  |
| screen login                                          | username/current-password、text/password、无 required、单 form、等待与失败                                             | 舞台由 R05 提供，账号不 trim；原 real/mock 分支、store、timer、路由与时钟不复制                     |
| console/business-console/business-pda change-password | 当前/新/确认三字段，current-password/new-password/new-password，novalidate                                             | 来源非空及一致性校验、passwordChangeRequired、toast/跳转/清缓存与退出行为归宿主；本票不内置密码策略 |

来源没有业务 slot 或 autofocus；recipe 的 `hint` 是宿主提示插槽，R05 默认 slot 保留表单内容，未添加自动聚焦、焦点抢占或密码可见切换策略。Enter 使用原生 form submit，真实键盘/焦点/宽窄视觉由父独立运行席验收。

缺值：draft 五个字符串必传，空串原样保留；不将缺失字段自动补成空串。logoutNotice 缺失和显式空都不显示（符合来源路由未匹配的默认空 notice），failed 与 timed-out 区分。callback 缺失/void/false/畸形 receipt 全部拒绝。演示不持久化，页面离开后状态消失。
