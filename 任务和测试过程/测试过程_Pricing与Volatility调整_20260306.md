# 测试过程：Pricing与Volatility参数调整

## 需求回顾
根据方案 `6-Pricing_Volatility_Alert_Solution.md`，将以下两个模块的参数进行了精确重构：
1. **Pricing (报价监控)**: 保留 `stop_pricing_duration`(停止报价时长)，去除了无关的 `max_spread`(最大点差)相关设定。
2. **Volatility (波动监控)**: 补充完整参数形态，支持了 `PERCENTAGE` 与 `POINTS` 模式切换；且在 `POINTS` 模式下新增支持“根据产品 Digits 自动折算点数”(`digits_auto_detect`)开关。

## 测试流转步骤

### 1. 检查现存默认规则卡片 (读取 mock-data)
- 在页面中定位到 **Pricing Monitor** 卡片，确保其只显示“停止报价时长”和“监控品种”，不再包含“最大点差”。
- 定位到 **Volatility Monitor** 卡片，确保其参数列表现在明确显示了“Percentage(%)”，并将数据展平显示。

### 2. 检查新增/编辑表单及其联动
- 点击新增规则 -> 选 Pricing，检查表单中已经去掉了“最大点差 (Points)”的输入框。
- 点击新增规则 -> 选 Volatility，检查：
  - 是否新增了“波动模式”的下拉单选框（Percentage / Points）。
  - 选择 Percentage 时，是否仅有关联时间及大小数值阈值。
  - **动态联动测试**：切换至 Points 模式，下方是否会动态出现一个“根据产品 Digits 自动折算点数”的 Checkbox 选项。

### 3. 保存逻辑与预览渲染
- 尝试编辑任意上述两个规则。
- 确认底部【当前规则逻辑】灰色信息块中的文字：
  - Pricing会显示：“... 如果停止报价时长 ≥ XX秒”。不再有“或买卖点差...”字样。
  - Volatility会显示：“如果在XX内价格波动 ≥ XX (百分比或点数)，且带有自动折算的相关提示(如 Yes/No)”。

## 代码及文档更新反馈
- 前端 JS (`mock-data.js`, `rules.js`, `i18n.js`) 已彻底移除 `max_spread` 在此告警类别下的关联。
- 分析说明文档已同步更新，从《告警规则算法说明文档》和《所有规则触发值显示优化方案》内去除了针对 Pricing 的高点差触发值定义；丰富了 Volatility 参数定义的摘要结构。
