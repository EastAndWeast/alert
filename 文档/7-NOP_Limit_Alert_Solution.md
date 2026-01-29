# 需求分析：NOP Limit Alert (净头寸限额) 提醒系统

此系统用于监控单一交易品种的净头寸（Net Open Position, NOP）。当该品种的累计净头寸值超过设定参数时，立即发出警报。

## 1. 具体方案

### 计算逻辑
系统将实时汇总指定品种的所有持仓，并根据 MT4 或 MT5 的不同比例系数进行折算。

1.  **分平台折算系数**:
    *   **MT5**: 系数 $K = 10000$。
    *   **MT4**: 系数 $K = 100$。

2.  **单笔持仓值计算**:
    *   **买单 (Buy)**: $Value = (ContractSize \times Volume) / K$
    *   **卖单 (Sell)**: $Value = -1 \times (ContractSize \times Volume) / K$
    *   *注：此处 Volume 通常指手数（Lots）。*

3.  **净头寸汇总 (NOP)**:
    *   $NOP = |\sum Value_{Buy} + \sum Value_{Sell}|$ (所有买卖单 Value 之和的绝对值)。

4.  **报警判定**:
    *   如果 $NOP > NOP\_Threshold$，则触发警报。

---

## 2. 例子

**场景：黄金 (XAUUSD) NOP 报警**
- **平台**: MT5 (折算系数 10000)。
- **合约规格**: ContractSize = 100。
- **风控配置**: XAUUSD 的 NOP 阈值设为 `5000`。
- **当前持仓**:
    *   持仓 1: 买入 1000 手。 $Value = (100 \times 1000) / 10000 = 10$。
    *   持仓 2: 买入 600,000 手。 $Value = (100 \times 600,000) / 10000 = 6000$。
    *   持仓 3: 卖出 50,000 手。 $Value = -1 \times (100 \times 50,000) / 10000 = -500$。
- **判定**:
    *   $NetValue = 10 + 6000 - 500 = 5510$。
    *   $NOP = |5510| = 5510$。
    *   由于 $5510 > 5000$，**系统发出警报**。
    *   **警报内容**: `[NOP超标] 品种: XAUUSD | 当前净头寸值: 5510 | 阈值: 5000 | 平台: MT5`

---

## 3. 配置参数

| 参数名称 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `Symbol_Name` | String | 监控的具体产品品种 | `XAUUSD`, `EURUSD` |
| `Platform_Type` | Enum | 指定平台以应用不同系数 | `MT4` / `MT5` |
| `NOP_Threshold` | Float | 触发报警的 NOP 数值阈值 | `5000.0` |
| `Calculation_Frequency`| Integer | 计算 NOP 的频率（秒） | `5` (每5秒计算一次) |
| `Alert_CoolDown` | Integer | 重复报警的冷却时间（秒） | `300` (5分钟) |
