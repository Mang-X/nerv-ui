# nerv-ui 协作入口

- 先读当前 Issue 与根 `README.md`。这是独立 UI 仓库，T01 仅建立固定提交的复制基线；后续工作按对应子票推进。
- 修改候选源码前读最近包内规则与 `frontend/DESIGN/governance.md`；Nv 命名、shadcn 冻结区和 token/CSS 层边界初始继承原约定。原 ADR 与来源路径映射见 `migration/t01/README.md`。
- `migration/materials/source` 是待解耦的应用原始素材；`migration/reference/source` 是固定时点参考。复制的旧 README、AGENTS、CLAUDE、ADR、脚本和配置中的业务范围、命令及通过结论均属于原库，不能当作新库现态。当前执行入口由本文件、根 README 和目标票确定。
- 来源文件保持原样；需要适配时在后续票记录来源、变更与是否需回传旧库。`migration/t01/provenance.jsonl` 是一次迁移证据，不是永久组件注册表，不随组件演进另建平行清单。
- 包名、公开组件名和许可的变更须有对应授权。业务服务、认证和生成 SDK 由宿主提供，不以迁移素材建立永久库依赖。
- 命令以当前目标配置和帮助核实；复制配置尚含原树耦合，不默认可运行，不启动 Nerv-IIP 全栈。
- Python 使用 uv；一次性脚本声明 PEP 723 依赖，不使用全局 pip 安装。
- 协作文本用简体中文；代码、标识符、SHA 和第三方声明保留原文。交付区分 fresh、继承证据及 UNRUN，并分别报告本地、CI、浏览器、发布和原库接入状态。
