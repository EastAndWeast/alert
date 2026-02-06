# 需求分析：Large Trade (大额交易) 提醒系统

## 1. 具体方案

### 技术实现路径
为了实现对 MT4 (Trades) 和 MT5 (Deals) 的实时监控，建议采用 **API/Manager API 抓取** 或 **数据库轮询** 的方式，而非客户端 EA，以保证风控系统在后台独立运行。

- **MT4 端**: 使用 MT4 Manager API 监听 `OnTradeUpdate` 或定期轮询 `MT4_TRADES` 数据库表。
- **MT5 端**: 使用 MT5 Manager API 监听 `OnTransaction` 事件，过滤出 `TRADE_TRANSACTION_DEAL_ADD` 类型的成交，或者查询 `MT5_DEALS` 数据库。

### 核心逻辑
1.  **事件触发/轮询**: 捕获每一笔新成交（MT5 Deals）或新开仓记录（MT4 Trades）。
2.  **过滤与匹配**:
    *   检查交易类型：仅关注 `OP_BUY`, `OP_SELL` (MT4) 或 `DEAL_TYPE_BUY`, `DEAL_TYPE_SELL` (MT5)。
    *   检查成交性质：仅针对开仓行为（MT5 需要判断是否为入场成交）。
3.  **计算与对比**:
    *   获取该笔交易的手数（Lots）。
    *   对比预设的阈值（如 5手）。
4.  **报警触发**: 若满足 `Lots >= Threshold`，则立即推送到报警网关（如 Telegram, 钉钉, 企业微信或邮件）。

---

## 2. 例子

**场景：黄金（XAUUSD）大额开仓预警**
- **背景**: 某交易者在 MT5 账户上操作，风控预设黄金单笔报警阈值为 5 手。
- **动作**: 交易者开仓买入 10 手 XAUUSD。
- **结果**:
    *   风控系统捕获到一条新的 Deal 记录。
    *   系统识别出交易品种为 XAUUSD，手数为 10 手。
    *   `10 > 5` 触发警报。
    *   **警报内容**: `[大额预警] 账户: 888888 | 品种: XAUUSD | 类型: BUY | 手数: 10.00 | 阈值: 5.00 | 时间: 2025-12-25 15:26`

---

## 3. 配置参数

建议在配置文件（JSON/YAML）或数据库中设置以下参数：

| 参数名称 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `Symbol_Filter` | String/Array | 需要监控的产品（* 表示全品种） | `["XAUUSD", "EURUSD"]` |
| `Lot_Threshold` | Float | 触发报警的最小手数阈值 | `5.0` |
| `Source_Type` | Enum | 监控来源 | `MT4_TRADE` / `MT5_DEAL` |
| `Alert_Channels` | Array | 报警发送渠道 | `["Telegram", "DingTalk"]` |
| `Ignore_Demo` | Boolean | 是否忽略模拟账户 | `true` |
| `White_List` | Array | 排除在外的特定账户 ID 列表 | `[10001, 10002]` |
