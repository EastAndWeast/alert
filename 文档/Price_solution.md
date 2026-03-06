# Pricing 报价异常监控实施方案 (Price Solution)

## 1. 业务背景
为适应多交易平台（MT4/MT5）底层数据流的差异，并更精准地进行风险警示，系统将原“Pricing & Volatility”规则拆分。本方案专为**Pricing（报价异常）**设计。

**核心逻辑：**
Pricing 是针对高频瞬时数据（Tick）的健康度监控，主要解决两类最常见的交易事故：
- **流动性断层/网关宕机**：导致的报价停滞（Stale Price）。
- **流动性恶化/暗盘**：导致的买卖点差异常拉大（Widen Spread）。

---

## 2. 前端配置项设计 (UI Configuration)

在预警规则配置页面新增或独立出 `Pricing` 规则卡片，包含以下极简配置：

| 字段名称 | 英文标识 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **规则名称** | Rule Name | Text | 是 | 标识该条预警，如 "XAUUSD 高峰期报价监控" |
| **目标产品/组** | Target Symbols/Groups | Select | 是 | 应用到哪些品种（如 XAUUSD）或特定平台组群 |
| **最大报价停滞时间** | Max Stale Time (Sec) | Number | 否* | 连续多少秒未收到新 Tick 报价则告警（如 `10`秒）。防范断线。 |
| **最大点差阈值** | Max Spread (Points) | Number | 否* | 买卖差价瞬间拉大超过此点数（如 `150`点）则告警。防范错价/暗盘。 |
| **通知对象** | Notification Group | Select | 否 | 指定接收告警的用户组（考虑到报价异常通常较紧急，建议默认发给紧急运维组）。 |

*(注：`Max Stale Time` 与 `Max Spread` 至少需填写一项。)*

---

## 3. 告警记录展示设计 (Alert History Table)

告警历史列表中，需清晰展示每次触发异常的具体原因和瞬时指标：

| 列表列名 | 对应含义 | 展示示例 |
| :--- | :--- | :--- |
| **Trigger Time** | 告警触发时间 | `2026-03-06 17:30:00` |
| **Symbol/Platform** | 异常品种与平台 | `XAUUSD (MT5)` |
| **Alert Type** | 具体的异常标签 | `<span class="badge">Stale Price</span>` 或 `<span class="badge">High Spread</span>` |
| **Current Value** | 触发时的实际现状 | `"No Quote for 15s"` 或 `"Spread: 200 pts"` |
| **Threshold** | 用户设定的触发红线 | `"> 10s"` 或 `"> 150 pts"` |
| **Status** | 告警处理状态 | `Sent (Telegram)` 等 |

---

## 4. 实施指导原则 (KISS & First Principles)
- **无状态处理**：Spread 的计算 `(Ask - Bid)` 必须在每个 Tick 接收时立即比对，不跨时间窗口，保持极低延迟。
- **单一职责**：Pricing 仅负责数据源的“死活与胖瘦”。关于行情的快慢剧烈程度，一律交由 Volatility 方案处理。
