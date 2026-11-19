/**
 * 代理桥：组件行为全部来自 `@ui-sdk/vue` 原语，ui-sdk 的代理桥因此能直接看见
 * 它们的状态与动作。这里把桥从「组件所在的包」再导出一次——调用方用哪个包
 * 写界面，就从哪个包拿桥，不必单独安装 ui-sdk 或者猜它和组件的版本关系。
 *
 * ```ts
 * import { createAgent } from '@nerv-ui/desktop/agent'
 * const agent = createAgent()
 * agent.snapshot() // 每个可控组件的 label / state / actions
 * ```
 */
export { agentTools, createAgent, registerTools } from '@ui-sdk/vue/agent'
export type {
  AgentAction,
  AgentChange,
  AgentComponent,
  AgentStep,
  ObservedChange,
} from '@ui-sdk/vue/agent'
