# 需求分析：Exposure Alert (货币敞口) 提醒系统

此系统旨在监控特定货币（如 BTC, EUR, USD 等）的净敞口（Net Exposure）。当某货币的总敞口超过设定阈值，并满足设定的警报频率时，系统将发出提示。

## 1. 具体方案

### 计算逻辑
系统通过集成 `mt5_symbols` 和 `mt5_prices` API 获取必要数据进行分解计算：

1.  **数据抓取**:
    *   使用 `mt5_symbols` 获取每个交易产品的属性（Contract Size, Base Currency, Profit Currency）。
    *   使用 `mt5_prices` 获取当前市场价格（用于将非标资产折算为货币单位或 USD）。

2.  **货币拆解与折算**:
    *   对于每一笔持仓（Position）：
        *   **Base Currency 敞口**: `Lots * ContractSize`（买入为正，卖出为负）。
        *   **Profit Currency 敞口**: `- (Lots * ContractSize * Price)`（买入为负，卖出为正）。
    *   **示例**: 在黄金（XAUUSD）开仓 1 手（合约大小 100），价格 2000。
        *   产生 `+100 oz` 的 XAU 敞口。
        *   产生 `-200,000` (1 * 100 * 2000) 的 USD 敞口。

3.  **净敞口汇总**:
    *   系统按货币代码（Currency）实时汇总所有持仓及订单的数值，得到每个货币的 Net Exposure。

### 频率控制逻辑 (Alert Frequency Control)
系统不仅仅在超过阈值时报警，还根据用户设定的频率进行提醒：
- **逻辑**: 在时间段 $T$ 内，最多提醒 $N$ 次。
- **频率计算**: `Frequency = Remind_Count / Time_Interval`。
- **实现**: 使用令牌桶或计数器机制，防止在一个敞口超限期间产生海量重复警报。

---

## 2. 例子

**场景：日元（JPY）总敞口过大提醒**
- **风控配置**:
    - **监控目标**: `JPY`。
    - **敞口阈值**: `50,000,000 JPY`（约 5000万日元）。
    - **提醒频率**: `600秒`（10分钟）内提醒 `1次`。
- **背景**: 交易者持有多笔交叉盘：
    *   卖出 5 手 `USDJPY` (生成大量 JPY 买入敞口)。
    *   买入 3 手 `EURJPY` (生成 JPY 卖出敞口)。
- **过程**:
    *   汇总后 JPY 净敞口达到 `+60,000,000`。
    *   **判定**: `6000万 > 5000万`，且过去 10 分钟内未发送过此类报警。
    *   **结果**: **发出警报**。
    *   **后续**: 哪怕敞口继续波动，在接下来的 600 秒内系统将保持沉默，直到下一个周期。

---

## 3. 配置参数

| 参数名称 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `Target_Currency` | String | 需要监控的货币代码 | `BTC`, `JPY`, `EUR` |
| `Exposure_Threshold`| Float | 触发报警的净敞口绝对值门槛 | `500000.0` |
| `Time_Interval` | Integer | 频率统计的时间窗口（秒） | `60` |
| `Max_Remind_Count` | Integer | 该时间窗口内允许的最大提醒次数 | `1` |
| `Calculation_Mode` | Enum | 计算模式（仅持仓、含挂单、含信用额度等） | `ONLY_POSITIONS` |
| `Price_Source` | API | 指定价格获取接口 | `mt5_prices` |
