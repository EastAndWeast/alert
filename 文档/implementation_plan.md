# 完善规则列表显示实施方案

本方案旨在响应用户需求，确保所有在配置表单中包含 "监控品种"（或类似功能）的规则，其在列表页面的摘要卡片中也能显示该配置项。

## 用户审核事项

> [!NOTE]
> 此次修改仅涉及 UI 显示逻辑，不影响规则的底层逻辑或保存的数据。我们将统一显示标签为 "监控品种" (Monitor Symbols)。

## 拟议变更

### 1. 规则渲染逻辑调整

#### [MODIFY] [rules.js](file:///Users/bruce/Desktop/工作/HexPay/3.AI/Google antigravity/18.Alert项目需求分析/trading-risk-admin/js/modules/rules.js)
在 `renderRuleParams` 函数中，为以下规则类型增加 "监控品种" 的显示：

- **`liquidity_trade`**: 使用 `p.monitoring_scope` 字段。
- **`scalping`**: 使用 `p.symbol_filter` 字段。
- **`pricing_volatility`**: 使用 `p.pricing.scope` 字段。
- **`nop_limit`**: 使用 `p.symbol_filter` 字段。

对于所有这些字段，如果为空（即监控全部），将显示 "全部" (All)。

## 验证计划

### 手动验证
1. 打开浏览器进入规则管理页面。
2. 依次检查以下规则列表，确认卡片中出现了 "监控品种" 配置项：
    - Liquidity Trade
    - Scalping
    - Pricing & Volatility
    - NOP Limit
3. 编辑其中一个规则，修改品种选择并保存，确认列表页面的显示同步更新。
4. 切换中英文，确认标签翻译正确。
