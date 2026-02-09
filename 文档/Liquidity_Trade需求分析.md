# Liquidity Trade 需求分析

> 生成时间: 2026-02-09 11:03

## 一、需求背景

**核心问题**: 检测客户是否通过短时间内开多张小手数订单来消耗市场深度，此类交易行为需要触发警报。

## 二、客户原始需求

### 2.1 核心检测逻辑
- **触发条件**: 客户在短时间内开多张订单，每张订单手数较小，但累加超过10手
- **行为特征**: 消耗市场深度（Liquidity Trade）

### 2.2 算法参数设计
客户建议平台可配置以下参数：

| 参数 | 说明 | 示例值 |
|------|------|--------|
| **时间间隔** | 监控时间窗口 | 60秒 |
| **订单数量阈值** | 相同方向订单数 | ≥2 或 >2 |
| **产品范围** | 具体产品或产品分类 | XAUUSD, Metals, Forex |
| **方向** | 必须是相同方向 | BUY 或 SELL |

### 2.3 产品分类管理需求

#### 需求点1: 产品映射配置
- **问题**: 不同平台对同一产品命名不同
- **解决方案**: 需要建立产品大类(Symbol Classification)映射关系
- **示例**:
  ```
  Metals:
    - XAUUSD
    - XAUUSD.r
    - XAUUSD.b
    - XAUCNH
  
  Forex:
    - AUDUSD
    - EURUSD
    - GBPUSD
  ```

#### 需求点2: 灵活的产品选择
客户可以通过以下两种方式选择监控范围：
1. **指定具体产品**: 如 XAUUSD, AUDUSD
2. **选择产品大类**: 如选择 Metals，则监控该分类下所有产品

## 三、需求分析

### 3.1 是否满足客户需求？

**✅ 完全可以满足**，分析如下：

#### 核心检测能力
- [x] 时间窗口监控（可配置）
- [x] 订单数量统计（相同产品+相同方向）
- [x] 手数累加计算
- [x] 阈值触发报警

#### 产品管理能力
- [x] 产品分类映射配置
- [x] 多平台产品名称兼容
- [x] 灵活的产品选择机制（具体产品 或 产品大类）

#### 实现思路
```
监控流程:
1. 实时接收订单数据(MT4 Trades / MT5 Deals)
2. 按 [产品, 方向] 分组
3. 在时间窗口内累计订单
4. 判断:
   - 订单数量 >= 阈值
   - 累计手数 > 10
5. 触发警报
```

### 3.2 是否存在过度设计？

**❌ 当前需求无过度设计**，理由如下：

#### 必要功能点评估

| 功能点 | 是否必要 | 原因 |
|--------|---------|------|
| 时间窗口配置 | ✅ 必要 | 不同平台/客户的风控标准不同 |
| 订单数量阈值 | ✅ 必要 | 灵活性需求，避免硬编码 |
| 产品分类映射 | ✅ 必要 | 解决多平台产品名称差异的实际痛点 |
| 支持产品大类选择 | ✅ 必要 | 提升配置效率（如一次选择所有贵金属产品）|
| 方向过滤 | ✅ 必要 | 单向频繁开仓才可能消耗市场深度 |
| 手数累计10手阈值 | ⚠️ 建议可配置 | 不同产品的流动性不同，建议改为可配置参数 |

#### 需要补充确认的点

> [!IMPORTANT]
> 以下问题需要与客户确认：

1. **手数阈值是否固定为10手？**
   - 建议: 改为可配置参数（不同产品流动性差异大）
   - 示例: XAUUSD可能10手就算大单，BTCUSD可能需要更小的阈值

2. **时间窗口的计算方式？**
   - 滑动窗口: 从当前时间向前推60秒
   - 固定窗口: 每60秒重置一次
   - 建议: 使用**滑动窗口**，更准确检测短时集中开仓

3. **订单数量阈值的边界值？**
   - "大于等于2" 还是 "大于2"？
   - 建议: 提供给客户选择（`>=`, `>`）

4. **是否需要排除某些账户？**
   - 如: 内部测试账户、做市商账户
   - 建议: 增加白名单/黑名单机制

## 四、设计建议

### 4.1 数据模型设计

#### 规则配置表 (liquidity_trade_rules)
```sql
{
  "id": "uuid",
  "platform_id": "平台ID",
  "rule_name": "规则名称",
  "enabled": true,
  
  // 检测参数
  "time_window_seconds": 60,           // 时间窗口(秒)
  "order_count_threshold": 2,          // 订单数量阈值
  "order_count_operator": ">=",        // 比较操作符
  "lot_size_threshold": 10,            // 累计手数阈值
  
  // 产品配置
  "symbol_filter_type": "classification", // "specific" | "classification"
  "symbol_list": ["XAUUSD"],           // 具体产品列表
  "classification_list": ["Metals"],   // 产品分类列表
  
  // 其他
  "alert_channels": ["telegram", "email"],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### 产品分类映射表 (symbol_classifications)
```sql
{
  "id": "uuid",
  "platform_id": "平台ID",
  "symbol": "XAUUSD",                  // 平台产品代码
  "classification": "Metals",          // 产品大类
  "created_at": "timestamp"
}
```

### 4.2 UI 设计要点

#### 规则配置页面
```
┌─────────────────────────────────────┐
│ Liquidity Trade 规则配置             │
├─────────────────────────────────────┤
│ 时间窗口: [60] 秒                    │
│ 订单数量: [>=] [2] 张                │
│ 累计手数: [>] [10] 手                │
├─────────────────────────────────────┤
│ 产品范围:                            │
│ ○ 指定产品: [选择产品 ▼]             │
│ ● 产品分类: [✓ Metals][✓ Forex]     │
├─────────────────────────────────────┤
│ 警报渠道: [✓ Telegram][✓ Email]     │
└─────────────────────────────────────┘
```

#### 产品分类管理页面
```
┌─────────────────────────────────────┐
│ 产品分类映射管理                     │
├─────────────────────────────────────┤
│ Metals                               │
│   - XAUUSD        [删除]             │
│   - XAUUSD.b      [删除]             │
│   - XAUCNH        [删除]             │
│   [+ 添加产品]                       │
├─────────────────────────────────────┤
│ Forex                                │
│   - AUDUSD        [删除]             │
│   - EURUSD        [删除]             │
│   [+ 添加产品]                       │
├─────────────────────────────────────┤
│ [+ 新建分类]                         │
└─────────────────────────────────────┘
```

### 4.3 检测算法伪代码

```python
def check_liquidity_trade(new_order):
    # 1. 获取规则配置
    rules = get_enabled_rules(new_order.platform_id)
    
    for rule in rules:
        # 2. 产品过滤
        if not match_symbol_filter(new_order.symbol, rule):
            continue
        
        # 3. 查询时间窗口内的订单
        time_window_start = now() - rule.time_window_seconds
        related_orders = get_orders(
            platform_id=new_order.platform_id,
            symbol=new_order.symbol,
            direction=new_order.direction,  # 相同方向
            time_range=(time_window_start, now())
        )
        
        # 4. 统计
        order_count = len(related_orders)
        total_lots = sum(order.lot_size for order in related_orders)
        
        # 5. 判断阈值
        if (compare(order_count, rule.order_count_threshold, rule.order_count_operator) 
            and total_lots > rule.lot_size_threshold):
            # 触发警报
            send_alert(
                rule_name=rule.rule_name,
                order_count=order_count,
                total_lots=total_lots,
                orders=related_orders,
                channels=rule.alert_channels
            )
```

## 五、总结

### ✅ 需求满足度评估
- **核心功能**: 100%满足
- **扩展性**: 良好（支持多平台、可配置）
- **易用性**: 需要友好的UI支持

### ⚠️ 需要补充确认的点
1. 手数阈值是否改为可配置？
2. 时间窗口采用滑动窗口还是固定窗口？
3. 是否需要账户白名单/黑名单？

### 📌 下一步行动
1. 与客户确认以上3个问题
2. 设计详细的数据库Schema
3. 开发产品分类管理UI
4. 实现检测算法
5. 集成警报通道

---

**需求状态**: ✅ 可行性高，无过度设计，建议进入实现阶段
