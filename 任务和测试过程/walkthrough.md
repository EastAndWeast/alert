# 验收文档 - Large Trader (USD) 配置调整

本任务已完成对 "Large Trader (USD)" 规则的配置调整，确保其 UI 和逻辑与 "Large Trade (Lots)" 一致。

## 变更内容清单

### 1. 界面与名称更新
- **显示名称**：由 "Large Trade (USD)" 更名为 **"Large Trader (USD)"**（中英文同步更新）。
- **列表显示**：在规则详情卡片中，移除了 "报警间隔"，新增了 **"监控品种"** 展示。

### 2. 配置项逻辑调整
- **移除字段**：已从表单和数据结构中彻底移除 `min_alert_interval`（最小报警间隔）。
- **新增功能**：新增了 **`symbol_filter`**（监控品种）选择功能，UI 采用左右布局，左侧为基础参数，右侧为品种选择面板。

### 3. 数据层适配
- 更新了 `MockData` 中的预置规则，使老旧数据也能适配新的字段结构。

## 验证方法 (推荐步骤)

1. **刷新页面**：进入规则管理模块。
2. **确认名称**：在左侧菜单或规则分类中找到 "Large Trader (USD)"。
3. **检查列表**：进入该规则页面，确认卡片摘要中显示的是 "监控品种" 而非 "报警间隔"。
4. **功能测试**：
    - 点击 "编辑" 现有规则，确认右侧出现了品种选择面板，且左侧没有了报警间隔输入框。
    - 尝试添加或移除品种，点击保存，确认更改生效。
    - 点击 "新增规则"，确认初始布局正确。

## 关键代码位置参考

- [i18n.js](file:///Users/bruce/Desktop/工作/HexPay/3.AI/Google antigravity/18.Alert项目需求分析/trading-risk-admin/js/i18n.js)
- [rules.js](file:///Users/bruce/Desktop/工作/HexPay/3.AI/Google antigravity/18.Alert项目需求分析/trading-risk-admin/js/modules/rules.js)
- [mock-data.js](file:///Users/bruce/Desktop/工作/HexPay/3.AI/Google antigravity/18.Alert项目需求分析/trading-risk-admin/js/mock-data.js)
