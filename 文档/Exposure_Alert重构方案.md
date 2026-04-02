# Exposure Alert 需求分析与重构方案

## 1. 原有功能分析
目前系统中的 Exposure Alert (敞口告警) 主要配置参数为：
- Target Currency (目标货币)
- Exposure Threshold (敞口阈值)
- Time Interval (检查时间间隔)

此版本较为简化，无法精细化到 MT Manager 的 Asset 维度，且未设置上下限区间。

## 2. 客户反馈与新需求
基于客户使用 MT Manager 的经验，反馈要求如下：
1. **指标对齐**：监控目标为每个 Asset 对应的 **Net Total (USD)**（净总敞口美元价值）。如果系统底层能直接读到此字段则直接使用；否则使用公式 `(Net Volume * 市场价) 转换为 USD` 来计算。
2. **细粒度配置**：新增**监控品种 (Asset Column)** 的配置，允许针对每个（或多个）交易品种独立计算。
3. **阈值区间**：用 **上限阈值 (Upper Limit)** 和 **下限阈值 (Lower Limit)** 替代单一阈值。这两个数值允许输入**正数**和**负数**。触发条件为：资产的 Net Total (USD) > 上限，或 < 下限。

## 3. UI/UX 改造方案 (前端界面)
在 `js/modules/rules.js` 中需进行如下改造：
- **修改 `renderRuleForm` (表单渲染)**:
  - 移除 `target_currency` 和原 `exposure_threshold`。
  - 新增 `upper_limit_usd` (输入框，允许负数)。
  - 新增 `lower_limit_usd` (输入框，允许负数)。
  - 新增 `symbol_filter` (监控品种，复用 `renderTagInput`，用于选择 Asset)。
  - 保留 `time_interval` (检查频率)。
  
- **修改 `renderRuleParams` (规则摘要渲染)**:
  - 更新为显示：上限阈值、下限阈值、监控品种。

- **修改 `formatTriggerValue` (告警记录展示)**:
  - 触发时的格式调整为显示 `Net Total: $XXX | Asset: YYY` 等更直观的字样。

- **增加多语言词条 (i18n.js)**:
  - `upper_limit_usd_label`: 上限阈值 (USD) / Upper Limit (USD)
  - `lower_limit_usd_label`: 下限阈值 (USD) / Lower Limit (USD)

## 4. 实施阶段计划
待用户评审通过此方案后，将会执行相应的代码修改并生成 Task List。
