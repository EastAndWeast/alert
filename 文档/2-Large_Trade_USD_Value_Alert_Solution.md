# 需求分析：Large Trade (USD价值) 提醒系统

针对多币种账户（JPY, EUR, GBP等）及美分账户（Cent Accounts），实现统一的USD等值金额报警。

## 1. 具体方案

### 技术实现路径
核心挑战在于**实时汇率换算**。系统需要一个内部的“汇率引擎”，将非USD基础货币的交易金额即时折算为USD。

- **汇率引擎**: 定期从 MT4/MT5 Server 获取主要货币对（EURUSD, GBPUSD, USDJPY等）的当前价格作为折算汇率。
- **美分账户处理**: 系统需识别美分账户标识（通常通过 Account Group 或 Currency 字段，如 `USC` 或 `EUX`），在计算前将名义金额除以 100。

### 核心计算逻辑
对于每一笔成交（Deal/Trade）：
1.  **计算本币价值 (Notation Value)**:
    *   `Amount = Lots * ContractSize * OpenPrice`
2.  **折算为 USD**:
    *   如果账户货币 = `USD`: `Value_USD = Amount`
    *   如果账户货币 = `USC` (美分): `Value_USD = Amount / 100`
    *   如果账户货币 = `EUR`: `Value_USD = Amount * Rate_EURUSD`
    *   如果账户货币 = `JPY`: `Value_USD = Amount / Rate_USDJPY`
3.  **判定阈值**:
    *   `Value_USD >= USD_Threshold` 则触发警报。

---

## 2. 例子

**场景：日本账户（JPY）大额开仓预警**
- **配置**: USD 报警阈值为 `$50,000`。当前 `USDJPY = 150.00`。
- **背景**: 某日本客户（JPY 账户）开仓 0.5 手黄金（XAUUSD）。
- **动作**: 
    *   `Lots = 0.5`, `OpenPrice = 2000`, `ContractSize = 100`。
    *   本币成交价值 = `0.5 * 100 * 2000 = 100,000 JPY`。
- **折算过程**:
    *   `Value_USD = 100,000 / 150 = $666.67`。
    *   `$666.67 < $50,000` -> **不触发警报**。
- **对比动作**: 该客户开仓 50 手黄金（JPY 账户）。
    *   本币成交价值 = `50 * 100 * 2000 = 10,000,000 JPY`。
    *   `Value_USD = 10,000,000 / 150 = $66,666.67`。
    *   `$66,666.67 > $50,000` -> **触发警报**。

---

## 3. 配置参数

| 参数名称 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `USD_Value_Threshold` | Float | 统一的USD等值报警阈值 (USD) | `50000.0` |
| `Cent_Account_Groups`| Array | 标识美分账户的 Group 关键字 | `["*CENT*", "*MICRO*"]` |
| `Currency_Map` | Map | 非常规货币的手动映射或特定汇率源 | `{"USC": "USD", "EUX": "EUR"}` |
| `Rate_Source` | Enum | 汇率获取来源 | `MT_SERVER_SYMBOLS` |
| `Min_Alert_Interval` | Int | 同一账户短时间内多次大额成交的报警间隔（秒） | `60` |
