# 全局配置 Telegram 集成及 Webhook 功能增强讨论方案

## 1. Telegram 集成方案讨论

### 1.1 Telegram Bot 相关概念
Telegram 的消息推送通常不是通过简单的 Webhook URL（像 Slack/Lark 那样直接一个地址），而是通过 **Telegram Bot API** 实现。

*   **实现原理**：
    *   你需要创建一个 Bot（通过 `@BotFather`）。
    *   你需要两个参数：`Bot Token`（身份验证）和 `Chat ID`（发送给谁，可以是个人、群组或频道）。
    *   发送接口：`https://api.telegram.org/bot<token>/sendMessage`。
*   **配置项建议**：
    *   `token`: Bot 的访问令牌。
    *   `chat_id`: 目标对话 ID。
    *   `enabled`: 是否启用。

### 1.2 为什么说它不一样？
*   **Lark/Slack/Teams**：通常提供一个固定的 Webhook URL，直接往这个 URL 发 POST 请求即可。
*   **Telegram**：本质上是一个 API 调用。Bot Token 是全局的，但 Chat ID 决定了消息的分发目标。为了保持 UI 对齐，我们可以将其抽象为两个输入框。

---

## 2. Microsoft Teams 账号要求
*   **企业账号 vs 个人账号**：
    *   **是的**，原生支持 Incoming Webhook 的功能通常需要 **Microsoft 365 企业版、教育版或商业版** 账号。
    *   **个人版 Teams** 目前对 Incoming Webhook 的原生支持非常有限，通常需要通过第三方工具（如 Power Automate）来桥接，配置较为复杂。
    *   **方案建议**：在配置说明中明确标注“建议使用 Teams 企业/商业版，并获取 Incoming Webhook URL”。

---

## 3. Webhook 配置说明增强（图文并茂）
为了提升用户体验，我们计划在配置界面增加“帮助说明”链接或折叠面板。

### 3.1 增加的元素
*   **操作指引图标**：点击图标展示对应的配置步骤。
*   **关键图示**：例如“如何在 Telegram 获取 Chat ID”，“如何在 Slack 生成 Webhook URL”。
*   **中英文支持**：文案和指引图片（如果需要图片文字提示）将全面国际化。

---

## 4. 中英文开发计划
*   **i18n.js**：更新所有的 key，确保每个新增的配置项都有对应的中英文翻译。
*   **MockData**：扩展 `globalSettings` 结构，增加 Telegram 相关字段。

## 5. 待确认事项 (Question Board)
1.  **Telegram 文案**：我们是提供两个输入框（Token, Chat ID），还是引导用户自行拼接成某种格式？
2.  **指引内容**：配置说明是采用浮层展示，还是在页面下方增加一个专门的“配置教程”区域？
3.  **多目标支持**：目前的 Webhook 是每个渠道一个地址，未来是否需要支持一个渠道发送到多个群组/频道？
