# 实施者自查（不是独立 merger 审查）
固定 base d730e76ac576baa7c1509a50af4857fd9370a5bd。标准：根/包 AGENTS，frontend/DESIGN/governance；范围：在线 #48/#5/#1。用户禁止额外 agent，本席未委派；后续 exact-head 独立审查归父 controller。
Standards material 0：无导出/API/依赖/token/CSS layer/冻结原版变化；当前包与宿主只裸包消费，migration素材字节保留。三个库实现均为本票公开失败的最窄修复，旧源未写入。
Spec material 0（四态/资源/清理收据补齐前不据此完成）：6件实际宿主输出，existing API guard，host-only错误模拟，empty/loading/error/retry/end，不迁业务列表恢复、不碰49/43/51。公开 events/slot/DOM，未访问私有 vm；每条 Requirement|Evidence 已列准确测试名。
测试支撑已自查：mock只限浏览器指标/观察器/时间；没有stub掉目标组件。原始产品FAIL、测试环境失败、工具超时和未运行设备证据分列。末项数据、字面身份、loop两向、81/80阈值均有独立预期。
