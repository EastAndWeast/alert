# Scalping 需求分析

> 生成时间: 2026-02-09 11:34

## 一、需求背景

**核心问题**: 检测客户是否存在刷单行为（超短线交易），即持仓时间过短的交易。

## 二、客户原始需求

### 2.1 核心检测逻辑
- **触发条件**: 当持仓时间（平仓时间 - 开仓时间）**小于**所设定的参数时，发出警报

### 2.2 过滤器（Filter）参数

客户要求可以添加多个过滤条件：

| 参数 | 说明 | 数据源 |
|------|------|--------|
| **持仓时间阈值** | 核心判定条件 | 计算得出 |
| **产品** | 过滤特定产品 | - |
| **手数** | 过滤特定手数范围 | - |
| **开仓价值** | DealInUSD (MT5) / OpenTradeInUSD (MT4) | MT平台字段 |
| **盈利** | ProfitInUSD | MT平台字段 |

## 三、当前系统实现分析

### 3.1 已实现的参数

查看当前代码(`rules.js` 第402-427行 和 `mock-data.js` 第117-119行)：

```javascript
// 当前Scalping配置参数
{
  duration_threshold: 180,        // 持仓时间阈值(秒) ✅
  comparison_logic: 'LESS_THAN',  // 比较逻辑(小于) ✅
  symbol_filter: ['XAUUSD'],      // 产品过滤 ✅
  lot_min: 0.1,                   // 最小手数 ✅
  usd_value_min: 10000.0,         // 最小USD价值 ✅
  profit_usd_min: 200.0,          // 最小获利USD ✅
  include_loss: false             // 是否包含亏损交易 ✅
}
```

### 3.2 功能对比

| 客户需求 | 当前系统 | 状态 | 说明 |
|---------|---------|------|------|
| 持仓时间阈值 | `duration_threshold` | ✅ 已支持 | 默认180秒 |
| 产品过滤 | `symbol_filter` | ✅ 已支持 | 支持多产品选择 |
| 手数过滤 | `lot_min` | ✅ 已支持 | 最小手数限制 |
| 开仓价值过滤 | `usd_value_min` | ✅ 已支持 | 对应MT5的DealInUSD / MT4的OpenTradeInUSD |
| 盈利过滤 | `profit_usd_min` | ✅ 已支持 | ProfitInUSD |

## 四、需求分析

### 4.1 是否满足客户需求？

**✅ 完全满足**，分析如下：

#### 核心功能
- [x] 持仓时间检测（小于阈值时触发）
- [x] 产品过滤
- [x] 手数过滤
- [x] 开仓价值过滤（USD）
- [x] 盈利过滤（USD）

#### 额外功能
当前系统还提供了客户需求中**未明确要求**但**非常实用**的功能：
- [x] `include_loss`: 是否包含亏损交易（可选择只监控盈利交易）
- [x] `comparison_logic`: 比较逻辑（虽然客户只要求"小于"，但系统已经实现）

### 4.2 是否存在过度设计？

**❌ 无过度设计**，理由如下：

| 功能点 | 是否必要 | 原因 |
|--------|---------|------|
| `duration_threshold` | ✅ 必要 | 客户明确要求 |
| `symbol_filter` | ✅ 必要 | 客户明确要求 |
| `lot_min` | ✅ 必要 | 客户明确要求 |
| `usd_value_min` | ✅ 必要 | 客户明确要求（对应DealInUSD/OpenTradeInUSD）|
| `profit_usd_min` | ✅ 必要 | 客户明确要求 |
| `include_loss` | ⚠️ 可选 | 客户未要求，但**实用性强**，建议保留 |
| `comparison_logic` | ⚠️ 可选 | 客户只要求"小于"，该字段可能** redundant** |

#### 关于`comparison_logic`

```javascript
comparison_logic: 'LESS_THAN'  // 目前硬编码为小于
```

**建议**: 
- 客户需求只提到"小于"，没有提到大于或其他逻辑
- 保留该字段不会造成过度设计（扩展性好）
- 但**无需在UI中暴露**，可以内部固定为`LESS_THAN`

#### 关于`include_loss`

这是一个**非常实用**的过滤器：

**使用场景**:
- 只监控盈利的刷单: `include_loss = false`
- 监控所有刷单（含亏损）: `include_loss = true`

**建议**: 保留，提供给客户选择

---

## 五、字段命名对照

### 5.1 MT5 vs MT4 字段对应

| 客户需求术语 | MT5字段 | MT4字段 | 系统参数名 |
|-------------|---------|---------|-----------|
| 开仓价值 | `DealInUSD` | `OpenTradeInUSD` | `usd_value_min` |
| 盈利 | `ProfitInUSD` | `ProfitInUSD` | `profit_usd_min` |

**说明**: 
- 系统需要在后端自动识别MT4/MT5平台
- 对MT4使用`OpenTradeInUSD`，对MT5使用`DealInUSD`
- 前端统一显示为"最小USD价值"

### 5.2 UI标签建议

| 系统参数 | 前端标签（中文） | 前端标签（英文） |
|---------|----------------|-----------------|
| `duration_threshold` | 持仓时间阈值 | Duration Threshold |
| `symbol_filter` | 监控品种 | Monitor Symbols |
| `lot_min` | 最小手数 | Min Lot |
| `usd_value_min` | 最小USD价值 | Min USD Value |
| `profit_usd_min` | 最小获利(USD) | Min Profit (USD) |
| `include_loss` | 包含亏损交易 | Include Loss Trades |

---

## 六、配置界面评估

### 6.1 当前UI设计

```
┌───────────────────────────────┐
│ 持仓时间: [180] 秒 *           │
│ 最小手数: [0.1]               │
│ 最小USD价值: [10000]          │
│ 最小获利: [200] USD           │
│ ☐ 包含亏损交易                │
├───────────────────────────────┤
│ 监控品种: [选择器]            │
└───────────────────────────────┘
```

**评估**: ✅ 界面完全符合客户需求，所有必要参数均可配置

### 6.2 建议优化点

#### 优化1: 帮助提示

在"持仓时间"字段旁增加提示：

```
💡 提示：当交易的持仓时间小于此阈值时触发告警。
例如：设置180秒，则所有持仓不足3分钟就平仓的交易都会触发告警。
```

#### 优化2: 参数说明

在"最小USD价值"字段旁增加说明：

```
ℹ️ 说明：对应MT5的DealInUSD和MT4的OpenTradeInUSD字段。
系统会自动根据平台类型匹配正确的字段。
```

---

## 七、检测算法伪代码

```python
def check_scalping(closed_order, rule):
    # 1. 计算持仓时间
    duration = closed_order.close_time - closed_order.open_time
    
    # 2. 基础判定：持仓时间必须小于阈值
    if duration >= rule.duration_threshold:
        return  # 不触发
    
    # 3. 产品过滤
    if rule.symbol_filter and closed_order.symbol not in rule.symbol_filter:
        return
    
    # 4. 手数过滤
    if closed_order.lot_size < rule.lot_min:
        return
    
    # 5. USD价值过滤
    # 根据平台类型选择字段
    usd_value = get_deal_usd_value(closed_order)  # MT5: DealInUSD, MT4: OpenTradeInUSD
    if usd_value < rule.usd_value_min:
        return
    
    # 6. 盈利过滤
    profit_usd = closed_order.profit_usd
    
    # 6.1 如果不包含亏损交易，且当前交易亏损，则跳过
    if not rule.include_loss and profit_usd < 0:
        return
    
    # 6.2 盈利必须达到最小值（对于include_loss=True的情况，也需要检查）
    if abs(profit_usd) < rule.profit_usd_min:
        return
    
    # 7. 所有条件满足，触发告警
    trigger_alert(
        rule_type='scalping',
        order=closed_order,
        duration=duration,
        profit_usd=profit_usd
    )
```

---

## 八、参数配置示例

### 示例1: 监控黄金短线盈利交易

```javascript
{
  duration_threshold: 120,           // 持仓时间 < 2分钟
  symbol_filter: ['XAUUSD'],         // 只监控黄金
  lot_min: 0.5,                      // 最小0.5手
  usd_value_min: 50000,              // 最小5万美元价值
  profit_usd_min: 500,               // 最小获利500美元
  include_loss: false                // 只监控盈利交易
}
```

**业务含义**: 
监控在黄金上进行的高频短线交易，这些交易通常手数较大、价值高，且能在2分钟内盈利500美元以上。

### 示例2: 监控所有产品的刷单行为（含亏损）

```javascript
{
  duration_threshold: 60,            // 持仓时间 < 1分钟
  symbol_filter: [],                 // 所有产品
  lot_min: 0.1,                      // 最小0.1手
  usd_value_min: 10000,              // 最小1万美元价值
  profit_usd_min: 100,               // 最小盈亏100美元
  include_loss: true                 // 包含亏损交易
}
```

**业务含义**: 
监控所有极短线交易，无论盈亏，只要持仓不到1分钟且盈亏超过100美元。

---

## 九、待确认问题

> [!IMPORTANT]
> 以下问题建议与客户确认：

### 1. `include_loss`功能是否需要？

**问题**: 客户原始需求中提到"ProfitInUSD"，但未明确说明：
- 只监控盈利交易？
- 还是盈利和亏损交易都监控？

**建议**: 
- 保留该功能，默认值设为`false`（只监控盈利交易）
- 提供选项让客户自行选择

**理由**: 
- 有些风控场景只关注盈利刷单（可能是内幕交易）
- 有些场景需要监控所有刷单（无论盈亏）

### 2. `profit_usd_min`的语义

**问题**: 客户提到"ProfitInUSD"作为filter，是指：
- A. 盈利必须≥该值（例如≥200美元）
- B. 盈亏绝对值≥该值（例如盈利200或亏损200都告警）

**当前实现**: 
```javascript
if abs(profit_usd) < rule.profit_usd_min:
    return  # 不触发
```
系统使用**绝对值**判断，即方案B

**建议**: 确认客户的实际需求

### 3. 多个过滤器的逻辑关系

**问题**: 当设置了多个过滤器时，是**AND**还是**OR**关系？

**当前实现**: 
全部为**AND**关系（所有条件都必须满足）

**示例**:
```
duration < 180秒 AND 
symbol in ['XAUUSD'] AND 
lot >= 0.1 AND 
usd_value >= 10000 AND 
profit >= 200
```

**建议**: 确认客户需求，当前AND逻辑应该符合大多数场景

---

## 十、总结

### ✅ 需求满足度评估
- **核心功能**: 100%满足
- **扩展性**: 优秀（支持多平台、多产品、灵活过滤）
- **易用性**: 良好（配置界面清晰）

### ❌ 过度设计评估
- **无过度设计**
- 所有参数均有明确的业务用途
- `include_loss`和`comparison_logic`虽然客户未明确要求，但属于**合理的扩展**而非过度设计

### 📌 建议

1. **保留当前所有参数**（无需删减）
2. **优化UI提示文案**（增加帮助说明）
3. **与客户确认3个问题**（见第九节）
4. **文档中明确MT4/MT5字段对应关系**

---

**需求状态**: ✅ 完全满足，无过度设计，建议保持当前实现
