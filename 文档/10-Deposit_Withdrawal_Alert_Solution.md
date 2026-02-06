# 需求分析：Deposit and Withdrawal (出入金异常) 提醒系统

此系统用于监控账户的财务流水，识别并提醒大额的外部出入金行为，以防止洗钱风险或重大的资金流动变动。

## 1. 具体方案

### 技术实现路径
监控 MT4/MT5 Server 的 `Balance` 或 `Finance` 相关事务（Deals/Trades）。

- **MT4 处理**: 监听 `MT4_TRADES` 记录，其中 `Type` 为 6 (`OP_BALANCE`)。
- **MT5 处理**: 监听 `DEAL_TYPE_BALANCE`（入金/平账）和 `DEAL_TYPE_CREDIT`（信用额度）事务。

### 核心判定逻辑
1.  **事务识别**: 捕获所有 Balance 类型的变动。
2.  **外部出入金判定**:
    *   **关键词抓取 (Comment Filter)**: 
        *   系统扫描 `Comment` (订单注释) 字段。
        *   匹配用户预设的关键词（如 `Deposit`, `Withdraw`, `External`, `Gateway` 等）。
        *   排除掉内部转账、返佣结算或调整金额的关键词（如 `Transfer`, `Commission`, `Adjustment`）。
3.  **金额门槛校验**:
    *   获取变动金额 `Amount`（取绝对值）。
    *   **判定**: `|Amount| >= Threshold`（由客户根据入金或出金分别设置）。
4.  **警报发送**: 符合关键词且金额超标后，立即推送财务警报。

---

## 2. 例子

**场景：大额外部入金预警**
- **风控配置**: 
    - 外部识别关键词: `Deposit`, `External`
    - 单笔报警门槛: `$10,000`
- **动作过程**:
    *   17:29:00: 通过外部支付网关存入金额。
    *   生成的订单注释为: `External Deposit via Stripe`。
    *   变动金额为: `$15,000`。
- **系统判定**:
    *   类型为 Balance 变动。
    *   Comment 中包含关键词 `Deposit` 和 `External`。
    *   金额 `15,000 > 10,000`。
- **结果**: **触发警报**。
    *   **警报内容**: `[出入金提醒] 账户: 123456 | 类型: 入金 | 金额: $15,000 | 方式: External Deposit via Stripe | 时间: 2025-12-25 17:29`

---

## 3. 配置参数

| 参数名称 | 类型 | 说明 | 示例值 |
| :--- | :--- | :--- | :--- |
| `Deposit_Threshold` | Float | 单笔入金触发报警的金额门槛 | `5000.0` |
| `Withdrawal_Threshold`| Float | 单笔出金触发报警的金额门槛 | `5000.0` |
| `Include_Keywords` | Array | 标识为“外部出入金”的 Comment 关键词列表 | `["Deposit", "Withdraw", "External"]` |
| `Exclude_Keywords` | Array | 需要排除的内部操作关键词列表 | `["Transfer", "Adjustment", "IB_Pay"]` |
| `Alert_Currency` | String | 报警金额显示的基准货币（默认为 USD） | `USD` |
| `Monitoring_Source` | Enum | 监控账号类型（真实号/模拟号） | `REAL_ONLY` |
