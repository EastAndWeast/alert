# 需求分析：Liquidity Trade (流动性冲击/拆单交易) 提醒系统

该系统旨在识别针对市场深度的“拆单”行为（Layering），即在极短时间内连续下达多笔小额同向订单，累计达到大额交易的效果。

## 1. 具体方案

### 核心算法：滑动窗口聚合（Sliding Window Aggregation）
系统需要维护一个以账户和产品为维度的实时内存缓存（如 Redis 或内存字典），记录最近 X 秒内的订单流。

1.  **产品大类映射（Symbol Mapping Engine）**:
    *   **控制面板映射**: 建立一个 `Symbol -> Category` 的映射表。
    *   例如：`XAUUSD` -> `Metals`, `XAUUSD.r` -> `Metals`, `EURUSD` -> `Forex`。
    *   支持正则表达式或后缀通配符简化配置。
2.  **交易监控流**:
    *   每当新订单产生，根据映射表将其归类。
    *   如果该订单符合“选定监控范围”（特定品种或特定大类），则进入聚合逻辑。
3.  **聚合与判定**:
    *   统计该账户在 `Time_Window` 秒内，**同方向**（BUY/SELL）且**同大类/同产品**的订单。
    *   **触发条件**: 
        *   订单张数 $\ge N$。
        *   累计手数 $\ge Lot\_Threshold$。
4.  **警报触发**: 满足条件后，将这组相关的订单信息打包发送报警。

---

## 2. 例子

**场景：金属类产品（Metals）拆单预警**
- **风控配置**: 
    - 监控对象：`Metals` 大类。
    - 参数：`60s` 内，相同方向订单 $\ge 3$ 张，且累计手数 $\ge 10$ 手。
- **Mapping 设置**: 系统已设置将 `XAUUSD`, `XAUUSD.r`, `XAGUSD` 都归类为 `Metals`。
- **动作过程**:
    *   15:00:01: 账户 A 买入 4 手 `XAUUSD` (第1张)
    *   15:00:10: 账户 A 买入 3 手 `XAUUSD.r` (第2张)
    *   15:00:25: 账户 A 买入 4 手 `XAGUSD` (第3张)
- **判定**:
    *   在 60s 内，共 3 张单，总计 $4+3+4 = 11$ 手。
    *   **结果**: 满足条件，触发警报。
    *   **警报内容**: `[流动性风险] 账户: A | 分类: Metals | 行为: BUY 拆单 | 订单数: 3 | 总手数: 11.0 | 涉及品种: XAUUSD, XAUUSD.r, XAGUSD`

---

## 3. 配置参数

### 控制面板设置 (Control Panel)
| 参数项 | 类型 | 说明 | 说明/示例 |
| :--- | :--- | :--- | :--- |
| `Sync_Mapping` | Map | 品种与大类的对应关系表 | `{"XAUUSD*": "Metals", "EUR*": "Forex"}` |
| `Monitoring_Scope` | Array | 当前生效的监控范围（大类或具体品种） | `["Metals", "BTCUSD"]` |

### 报警算法参数 (Strategy Parameters)
| 参数名称 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `Time_Window` | Integer | 滑动窗口时间范围（秒） | `60` |
| `Min_Order_Count` | Integer | 触发报警的最小订单张数（同向） | `2` |
| `Total_Lot_Threshold` | Float | 触发报警的最小累计手数 | `10.0` |
| `Aggregation_Logic` | Enum | 聚合维度：仅单品种或按大类聚合 | `BY_CATEGORY` |
| `Exclude_Small_Lot` | Float | 忽略极小散单的阈值（可选） | `0.01` |
