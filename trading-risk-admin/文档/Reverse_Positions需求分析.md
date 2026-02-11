# Reverse Positions 需求分析

## 需求背景
在交易风控管理中，"反向开仓"（Reverse Positions）是一种常见的风险行为。用户希望调整该规则的配置项，以更精准地监控特定产品的翻仓/反向刷单行为。

## 变更内容
1.  **移除冷却时间 (Cooldown Period)**：不再限制触发告警后的冷却期，以确保每一次符合条件的违规行为都能被捕捉。
2.  **新增监控产品 (Monitor Symbols)**：允许用户指定监控的具体产品（Symbol），而非全局监控，提高规则的灵活性。

## 影响范围
-   **UI 层**：`Rules` 模块下的 `Reverse Positions` 新增/编辑弹窗。
-   **配置层**：规则参数结构变更（移除 `cooldown_period`，新增 `symbol_filter`）。
-   **逻辑层**：规则预览说明文案及卡片详情展示。
