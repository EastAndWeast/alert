# 需求分析：Reverse Open Positions (锁单翻仓/反向开仓) 提醒系统

此系统旨在识别交易行为中的“急速翻仓”现象，即在平仓一笔订单后的极短时间内，立即在同一产品上开设反方向的订单。这种行为通常与特定自动化策略、超短线投机或情绪化交易相关。

## 1. 具体方案

### 核心判定逻辑
系统需要跟踪每个账户的“最近平仓记录”，并在新开仓时进行回溯比对。

1.  **平仓记录追踪**:
    *   当账户平仓（Close）时，系统缓存该动作的时间、品种、方向及规模。
    *   记录格式：`{Login: 123, Symbol: "XAUUSD", CloseDirection: "BUY", CloseTime: T1, CloseVolume: 5.0}`。

2.  **开仓触发比对**:
    *   当该账号有新开仓（Open）动作时，立即查找其对应品种的最近一次平仓记录。
    *   **判定条件**:
        *   **相同产品**: `OpenSymbol == LastCloseSymbol`。
        *   **反向动作**: `OpenDirection` 必须与 `LastCloseDirection` 相反（例如：平多仓后，新开空仓）。
        *   **时间间隔**: `OpenTime - CloseTime <= Max_Interval_Seconds`（由客户设置，如 5s）。
        *   **规模过滤器 (Optional)**: 
            *   新开仓的手数 (Lots) $\ge$ 设定门槛。
            *   新开仓的合约价值 (USD Value) $\ge$ 设定门槛。

3.  **警报发送**: 若以上条件全部满足，系统记录这一“翻仓”行为并非发出警报。

---

## 2. 例子

**场景：黄金（XAUUSD）快速反向翻仓预警**
- **风控配置**: 
    - 最大时间间隔: `10秒`。
    - 最小手数门槛: `5手`。
- **动作过程**:
    *   17:00:01: 账号 A 平仓（Close） 10 手 `XAUUSD` 多单 (原方向为 BUY)。
    *   17:00:05: 账号 A 新开仓（Open） 8 手 `XAUUSD` 空单 (方向为 SELL)。
- **判定**:
    *   产品相同 (XAUUSD)。
    *   方向相反 (Close BUY -> Open SELL)。
    *   间隔 4 秒 (满足 $\le$ 10s)。
    *   开仓 8 手 (满足 $\ge$ 5手)。
- **结果**: **触发警报**。
    *   **警报内容**: `[反向翻仓] 账户: A | 品种: XAUUSD | 类型: BUY平 -> SELL开 | 间隔: 4s | 规模: 8.0手`

---

## 3. 配置参数

| 参数名称 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `Max_Reverse_Interval` | Integer | 允许的最大平仓至反向开仓的时间差（秒） | `5` |
| `Min_Reverse_Lot` | Float | 触发报警的最小新开仓手数 | `1.0` |
| `Min_Reverse_Value_USD`| Float | 触发报警的最小新开仓合约价值 (USD) | `10000.0` |
| `Symbol_Match_Level` | Enum | 匹配维度：必须完全相同产品，或同大类即触发 | `EXACT_MATCH` (默认) |
| `Cooldown_Period` | Integer | 同一账户连续翻仓时的报警冷却时间 | `60` (秒) |
