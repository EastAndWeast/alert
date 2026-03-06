# Volatility 波动率异常监控实施方案 (Volatility Solution)

## 1. 业务背景
为适应多交易平台（MT4/MT5）底层数据流的差异，并更精准地进行风险警示，系统将原“Pricing & Volatility”规则拆分。本方案专为**Volatility（波动率异常）**设计。

**核心逻辑：**
Volatility 是针对时间序列数据（Time-series）的聚合监控，主要解决的业务痛点是：
- **市场重大异动**：如非农数据发布导致短时间内行情爆拉/暴跌。
- **单边风险预警**：防止客户在特定品种的剧烈波动中穿仓或引发大面积客诉。

---

## 2. 前端配置项设计 (UI Configuration)

在预警规则配置页面新增或独立出 `Volatility` 规则卡片，包含以下极简配置：

| 字段名称 | 英文标识 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **规则名称** | Rule Name | Text | 是 | 标识该条预警，如 "黄金剧烈波动监控" |
| **目标产品/组** | Target Symbols/Groups | Select | 是 | 应用到哪些品种或特定平台组群 |
| **波动模式** | Volatility_Mode | Enum | 是 | 波动计算模式，可选 `PERCENTAGE` / `POINTS` |
| **最大波幅** | Threshold_Value | Float | 是 | 对应的百分比数值或点数数值，如 `3.0` (3个点) 或 `0.5` (0.5%) |
| **时间窗口** | Time_Window | Enum | 是 | 计算波动的时间周期，如 `M1` (1分钟), `M5`, `M15` |
| **通知对象** | Notification Group | Select | 否 | 指定接收告警的用户组（建议发给业务风控盯盘组）。 |

---

## 3. 告警记录展示设计 (Alert History Table)

告警历史列表中，需清晰展示每次触发的周期以及实际的波动幅度：

| 列表列名 | 对应含义 | 展示示例 |
| :--- | :--- | :--- |
| **Trigger Time** | 告警触发时间 | `2026-03-06 20:30:15` |
| **Symbol/Platform** | 异常品种与平台 | `BTC/USD (MT4)` |
| **Time Window / Summary** | 触发的统计时长与概要 | `<span class="badge">M1</span>` |
| **Actual Fluctuation** | 窗口内的实际波动数值 | `"85 pts \| M1"` 或 `"0.5% \| M5"` |
| **Threshold** | 用户设定的高危线 | `"> 500 pts"` 或 `"> 0.8%"` |
| **Status** | 告警处理状态 | `Sent (Risk Dept)` 等 |

---

## 4. 实施指导原则 (KISS & First Principles)
- **有状态时间窗**：这是一个基于滑动时间窗口（或固定分钟窗口）的统计。只计算该窗口内的`(High - Low)`或`(Close - Open)`绝对差值是否越界。
- **与价格绝对值解耦**：Volatility 方案完全不关心具体的 Bid/Ask 点差宽窄，也无需实时每 Tick 都比对，只需按分钟级别从时序数据库或内存聚合器中取值即可，极大地节约了前后台校验的并发消耗。
