# 需求分析：Pricing & Volatility Alert (行情异常) 提醒系统

此系统包含两个子功能：一是监控行情源是否中断（Stop Pricing），二是监控行情波动是否剧烈（Volatility）。

## 1. 具体方案

### A. Pricing Alert (行情中断提醒)
该功能用于检测行情源是否掉线或冻结。
1.  **Session 校验**: 
    *   读取 MT 系统的 `Trading Sessions`。
    *   系统仅在“交易进行中”的时段内执行检测，避开休市时段的自然中断。
2.  **死灯检测 (Heartbeat Check)**:
    *   记录每个 Symbol 接收到最后一次 `Tick` 的时间戳。
    *   **判定逻辑**: `CurrentTime - LastTickTime > Config_Seconds`。
3.  **分级设置**: 支持按具体 Symbol 或按 Asset Classification（大类）设置不同的中断门槛。

### B. Volatility Alert (行情波动提醒)
检测短时间内（如前一分钟）的极端上下波动。
1.  **计算逻辑**: 监控前一分钟 K 线的 `High - Low`。
2.  **报警模式**:
    *   **百分比模式**: `(High - Low) / Low * 100% >= Threshold_%`。
    *   **Points (点数) 模式**: `High - Low >= Points / (10 ^ Digits)`。
        *   系统自动读取产品的 `Digits` 属性。
        *   **示例**: XAUUSD (Digits=2)，设置 3 个 Points，则 `0.03 = 3 / 100`。报警门槛为 0.03。

---

## 2. 例子

**场景 1：Pricing Alert (行情中断)**
- **配置**: `Forex` 大类设置 `30秒` 中断报警。
- **动作**: `EURUSD` 在 15:00:00 收到最后一次报价，随后行情卡死。
- **判定**: 到 15:00:31 时，系统发现已中断 31 秒且处于交易时段内。
- **结果**: **发出警报**：`[行情中断] Symbol: EURUSD | 分类: Forex | 已中断: 31s | 状态: 交易中`

**场景 2：Volatility Alert (波动预警 - Points 模式)**
- **配置**: `XAUUSD` (Digits:2)，设置 `100` Points (即 1.00 美金波动)。
- **动作**: 15:01 分钟内，最高价 2300.50，最低价 2299.40。
- **判定**: `High - Low = 1.10`。对应的 Points = `1.10 * 100 = 110`。
- **结果**: `110 > 100`，**发出警报**：`[高波动提醒] Symbol: XAUUSD | 波动: 110 pts (1.10 USD) | 阈值: 100 pts`

---

## 3. 配置参数

### Pricing 配置
| 参数名称 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `Stop_Pricing_Duration` | Integer | 停止报价的最大容忍时间（秒） | `30` |
| `Scope` | Array/String| 适用的品种或大类代码 | `["Forex", "XAUUSD"]` |

### Volatility 配置
| 参数名称 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `Volatility_Mode` | Enum | 波动计算模式 | `PERCENTAGE` / `POINTS` |
| `Threshold_Value` | Float | 对应的百分比数值或点数数值 | `3.0` (3个点) 或 `0.5` (0.5%) |
| `Time_Window` | Enum | 计算波动的时间周期 | `M1` (1分钟) |
| `Digits_Auto_Detect` | Boolean| 是否根据产品 Digits 自动折算点数 | `true` |
