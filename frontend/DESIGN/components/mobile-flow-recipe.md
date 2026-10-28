# 移动候选与分步执行

## 使用与决策

适合扫码或键入编码后，从候选中选一项、填写数量并确认的轻量移动流程。只组合已有公开移动件，不新增库导出。

ScanBar 的 `scan(value)` 接入编码输入通道；不接图库或相机。Picker 的 `update:modelValue` 选稳定 key，`open` 管浮层。NumberKeyboard 的字符串 model 保留空值与 0；Stepper 默认归零且限数值，不用于未知数量。详情使用语义 section；状态用 MobileTag 的明确 label/tone；结果只在 execute 返回非空 receipt 后出现。AppShellMobile 的 header/footer slots 承担安全区，NavBar back 回到选择步。

规则、资格、数量校验与限制文案是 FlowInput 显式输入。示例不推导业务状态。候选重排不改变 key；同 key 替换读取新事实并取消旧动作，删除清空数量与详情，拒绝则返回选择步。source/code 变化清空整个草稿；只读禁编辑，已完成详情仍可看。数量最多三位小数由本页校验，显示遵守 foundation 的右对齐、tabular-nums、单位独立样式与空格；编码使用 mono-xs-muted。

## 异步合同

execute 接收 code/key/quantity 快照和 AbortSignal；一次动作进行中禁重复。失败保留草稿可重试，缺少回执不显示成功。来源、候选、返回、清空、只读切换和卸载递增动作身份并 abort；即使宿主忽略 abort，迟到成功、失败和 finally 仍被身份守卫隔离。真实持久化、幂等和错误文案归接入方。

## 来源与边界

固定来源 `79b1578f2b75f55709765b5e7882aaf33146c603`，原字节不变：

| 来源（migration/materials/source/frontend/apps/business-pda/src/pages/） | 保留与处置                                                            |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| scan.vue                                                                 | 编码入口；扫码路由、识别服务和硬件入口不迁入                          |
| mes/operation.vue                                                        | 列表扫码、选中执行、pending 与结果；设备/人员核验和动作策略由输入替代 |
| mes/components/MesOperationExecutionPanel.vue                            | context-scan slot 与详情/执行分区；不复制领域动作面板                 |
| wms/pick.vue                                                             | 候选目录错误与动作回执分离；候选和确认以显式输入/回调提供             |

这些页面及其直接页面组件消费者仍留原始素材，旧应用接入 NOT_PLANNED。现有 ScanBar/Picker/NumberKeyboard/NavBar/AppShellMobile/Result/Steps/Stepper 已盘点；本票只新增示例局部 recipe，不重造这些组件。未深入读取设备、质量、图库与后端算法实现，不据此声称整体 PDA 已迁完。
