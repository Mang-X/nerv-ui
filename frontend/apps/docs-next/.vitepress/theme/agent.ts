import { createAgent, registerTools } from '@nerv-ui-next/desktop/agent'

/**
 * 文档站的代理桥：让代理直接读取并操作页面上的组件，而不是靠截图猜。
 *
 * ui-sdk 的组件把状态和动作登记在桥里，`agent.snapshot()` 返回每个可控组件的
 * `label / state / actions`，`agent.act()` 直接调用组件 API——比截图 + 无障碍树
 * 少一大截来回，也不必从 DOM 文本反推组件语义。
 *
 * `registerTools` 只在支持 `document.modelContext` 的浏览器里生效（WebMCP），
 * 其余环境什么都不做，所以这里不需要额外判断。`allow` 直接放行：这是文档站，
 * 没有删除、付款这类需要人确认的动作。
 */
export const agent = createAgent({ allow: () => true })

if (typeof document !== 'undefined') registerTools(agent, { allow: () => true })

/**
 * 浏览器里没有 WebMCP 时，代理桥仍然要够得着：挂在 window 上，控制台和自动化
 * 脚本都能直接 `__nvAgent.snapshot()`。文档站没有需要人确认的动作，所以常开。
 */
if (typeof window !== 'undefined') {
  ;(window as unknown as { __nvAgent?: typeof agent }).__nvAgent = agent
}

export type { AgentComponent, AgentStep } from '@nerv-ui-next/desktop/agent'
