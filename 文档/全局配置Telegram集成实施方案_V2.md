# 全局配置 Telegram 集成及 Webhook 功能增强方案 (V2)

## 1. 核心需求变更总结
*   **配置说明展示**：采用 **弹窗 (Modal)** 形式展示静态配置教程。
*   **覆盖范围**：所有 Webhook 渠道（现有的及未来的）均需配备独立的图文说明。
*   **排序调整**：
    1.  **Telegram** (新增)
    2.  **Microsoft Teams**
    3.  **Slack**
    4.  **Lark (飞书)**

---

## 2. 详细设计方案

### 2.1 Telegram 集成 UI
*   **字段**：`Bot Token` (密码类输入框), `Chat ID` (文本输入框)。
*   **功能**：支持启用/禁用。

### 2.2 配置引导弹窗 (Tutorial Modal)
*   **触发方式**：在每个 Webhook 渠道标题旁增加一个 `ℹ️` 或 `❓` 图标。
*   **内容结构**：
    *   标题：[平台名称] 配置指南。
    *   步骤说明：清晰的 1, 2, 3 步骤。
    *   图解占位：使用特定的 CSS 类名或占位图展示配置位置（后续可根据用户提供的图片替换）。
    *   底部：关闭按钮。
*   **实现技术**：在 `App` 核心类中新增一个通用的静态弹窗方法 `App.showStaticModal(contentKey)`。

### 2.3 国际化处理 (i18n)
*   新增各个平台的配置引导文案（中英文对照）。
*   新增 Webhook 渠道的 label 和 placeholder。

---

## 3. 实施计划 (Implementation Plan)

### 3.1 [MODIFY] [i18n.js](file:///c:/Users/haido/Desktop/HexPay/3.AI/Google%20antigravity/18.Alert%E9%A1%B9%E7%9B%AE%E9%9C%80%E6%B1%82%E5%88%86%E6%9E%90/trading-risk-admin/js/i18n.js)
*   添加 Telegram 相关翻译。
*   添加配置指南的全文翻译。

### 3.2 [MODIFY] [mock-data.js](file:///c:/Users/haido/Desktop/HexPay/3.AI/Google%20antigravity/18.Alert%E9%A1%B9%E7%9B%AE%E9%9C%80%E6%B1%82%E5%88%86%E6%9E%90/trading-risk-admin/js/mock-data.js)
*   在 `globalSettings` 中增加 `telegram_token`, `telegram_chat_id`, `telegram_enabled`。
*   调整默认配置。

### 3.3 [MODIFY] [settings.js](file:///c:/Users/haido/Desktop/HexPay/3.AI/Google%20antigravity/18.Alert%E9%A1%B9%E7%9B%AE%E9%9C%80%E6%B1%82%E5%88%86%E6%9E%90/trading-risk-admin/js/modules/settings.js)
*   重构 `render` 函数中的 Webhook 部分：
    *   按照指定顺序排列。
    *   为每个项目添加“帮助图标”点击事件。
*   更新 `saveSettings` 逻辑。

### 3.4 [MODIFY] [app.js](file:///c:/Users/haido/Desktop/HexPay/3.AI/Google%20antigravity/18.Alert%E9%A1%B9%E7%9B%AE%E9%9C%80%E6%B1%82%E5%88%86%E6%9E%90/trading-risk-admin/js/app.js)
*   实现 `App.showGuide(platform)` 方法。

---

## 4. 验证方案
*   点击各平台帮助图标，弹出对应的中英文说明。
*   填写 Telegram Token 和 Chat ID 并保存，刷新页面验证数据持久化（模拟）。
*   检查排序是否符合：Telegram > Teams > Slack > Lark。
