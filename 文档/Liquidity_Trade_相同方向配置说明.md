# 关于 Liquidity Trade "相同方向" 配置问题的解答

**问题**: 如何配置"相同方向"?当前有相关配置界面吗?

---

## 一、当前系统的情况

### 1.1 现有配置界面分析

查看当前代码(`rules.js` 第373-399行)后,发现**Liquidity Trade的配置界面中并没有"方向"相关的配置项**。

#### 当前配置界面包括的参数:
```javascript
// 当前Liquidity Trade配置界面
- 时间窗口 (time_window): 60秒
- 最小订单数量 (min_order_count): 2
- 总手数阈值 (total_lot_threshold): 10手
- 监控范围 (monitoring_scope): 产品/分类选择器
- 聚合逻辑 (aggregation_logic): BY_CATEGORY或BY_SYMBOL
```

**❌ 缺失**: 没有"相同方向"(direction)的配置选项

### 1.2 告警数据中的实际情况

但在模拟数据(`mock-data.js` 第159-160行)中,告警记录里**确实包含了方向信息**:

```javascript
{ 
  alert_id: 'A020', 
  rule_type: 'liquidity_trade',
  details: { 
    order_count: 8, 
    time_window: 60, 
    direction: 'BUY',  // ← 这里有方向
    category: 'Metals' 
  } 
}
```

**结论**: 后端检测时使用了方向信息,但**前端配置界面没有暴露**这个参数。

---

## 二、"相同方向"的业务逻辑

### 2.1 为什么需要"相同方向"?

在Liquidity Trade检测中,"相同方向"是**核心判定条件之一**:

| 场景 | 是否触发 | 原因 |
|------|---------|------|
| 60秒内开5张BUY单 | ✅ 触发 | 相同方向,累加手数 |
| 60秒内开3张BUY + 2张SELL | ❌ **不触发** | 方向不同,不累加 |

**业务含义**: 
- 短时间内**同方向**多次开仓 → 可能在消耗市场深度
- 不同方向开仓 → 可能是对冲或正常交易

### 2.2 方向判定逻辑

```
检测算法伪代码:
1. 获取时间窗口内的所有订单
2. 按 [产品, 方向] 分组  ← 这里按方向分组
3. 统计每组的订单数和手数
4. 判断是否超阈值
```

**关键点**: 方向是**自动检测**的,不需要客户配置具体监控BUY还是SELL,而是:
- **BUY方向的单子单独累加**
- **SELL方向的单子单独累加**
- 两者互不影响

---

## 三、配置方案设计

### 3.1 方案A: 隐式处理(推荐)

**设计思路**: 方向不作为配置项,系统自动按方向分组检测

#### 优点:
- ✅ 符合业务逻辑(客户关心的是"相同方向",而不是"只监控BUY")
- ✅ 配置界面简洁
- ✅ 无需用户理解复杂概念

#### 实现方式:
```
后端检测逻辑:
- 自动将时间窗口内的订单按方向分类
- BUY方向订单独立累加
- SELL方向订单独立累加
- 任意方向超阈值即触发
```

#### UI展示:
```
配置界面:
┌─────────────────────┐
│ 时间窗口: [60] 秒    │
│ 订单数量: ≥ [2] 张   │
│ 累计手数: > [10] 手  │
│ 产品范围: [选择器]   │
└─────────────────────┘

告警信息:
"账户12345678 在60秒内对XAUUSD开了8张BUY单,累计15.5手"
           ↑ 自动显示方向
```

**📌 这是最推荐的方案**,因为:
1. 客户不需要配置"方向"
2. 系统自动处理,符合业务语义
3. 告警时明确显示是BUY还是SELL

---

### 3.2 方案B: 显式配置(可选)

**设计思路**: 如果客户有特殊需求,只监控特定方向

#### 适用场景:
- 客户只想监控BUY方向(例如怀疑某账户专门做多拉升)
- 客户只想监控SELL方向(例如怀疑某账户专门做空打压)

#### UI设计:
```
┌─────────────────────────────┐
│ 监控方向:                    │
│ ● 全部方向 (BUY + SELL)     │
│ ○ 仅 BUY                    │
│ ○ 仅 SELL                   │
└─────────────────────────────┘
```

#### 参数定义:
```javascript
parameters: {
  time_window: 60,
  min_order_count: 2,
  total_lot_threshold: 10,
  monitoring_scope: ['Metals'],
  aggregation_logic: 'BY_CATEGORY',
  
  // 新增配置项
  direction_filter: 'ALL'  // 'ALL' | 'BUY' | 'SELL'
}
```

---

## 四、推荐实施方案

### ✅ 采用方案A(隐式处理)

**理由**:
1. **符合客户需求**: 客户需求中说的是"相同方向",不是"指定方向"
2. **简化配置**: 减少用户学习成本
3. **覆盖全面**: 自动监控所有方向的异常行为

### 实现步骤

#### 步骤1: 确认后端检测逻辑
```python
def check_liquidity_trade(new_order, rule):
    # 1. 获取时间窗口内的订单
    orders_in_window = get_orders_in_window(
        time_window=rule.time_window,
        symbol=new_order.symbol
    )
    
    # 2. 按方向分组 ← 关键逻辑
    grouped_by_direction = {}
    for order in orders_in_window:
        direction = order.direction  # 'BUY' or 'SELL'
        if direction not in grouped_by_direction:
            grouped_by_direction[direction] = []
        grouped_by_direction[direction].append(order)
    
    # 3. 检查每个方向
    for direction, orders in grouped_by_direction.items():
        order_count = len(orders)
        total_lots = sum(o.lot_size for o in orders)
        
        if (order_count >= rule.min_order_count and 
            total_lots > rule.total_lot_threshold):
            # 触发告警,记录方向
            trigger_alert(direction=direction, orders=orders)
```

#### 步骤2: 前端配置界面保持当前设计
```
不需要修改配置界面(已经足够清晰)
```

#### 步骤3: 告警信息明确显示方向
```javascript
// 告警列表展示
"账户12345678 在60秒内对XAUUSD开了8张BUY单,累计15.5手"
```

---

## 五、FAQ

### Q1: 如果客户真的只想监控BUY方向怎么办?

**A**: 如果后续有此需求,可以轻松扩展为方案B,增加`direction_filter`配置项。但**当前不建议**,因为:
- 增加配置复杂度
- 客户原始需求没有提到"只监控某方向"
- 可能遗漏风险(如只监控BUY,但账户通过SELL消耗深度)

### Q2: "相同方向"和"相同产品"一样吗?

**A**: 不一样!

| 维度 | 说明 | 示例 |
|------|------|------|
| 相同产品 | 需要配置 | 客户选择"XAUUSD"或"Metals大类" |
| 相同方向 | 自动检测 | 系统自动识别BUY/SELL并分组 |

### Q3: 时间窗口是固定的还是滑动的?

**A**: **建议使用滑动窗口**
- 固定窗口: 每60秒重置,可能漏检跨窗口的集中开仓
- 滑动窗口: 从当前时刻向前推60秒,更准确

---

## 六、总结

### ✅ 当前状态
- **后端**: 已经在检测时使用方向信息
- **前端**: 配置界面缺少"方向"相关说明

### 📝 建议
1. **不增加方向配置项**(采用隐式处理)
2. **文档中明确说明**: "系统自动按方向分组检测"
3. **告警信息中突出显示方向**: "8张BUY单"
4. **可选**: 在配置界面增加帮助提示

#### 帮助提示文案示例:
```
💡 提示: 
系统会自动区分BUY和SELL方向,相同方向的订单才会累加手数。
例如: 60秒内开5张BUY单和3张S ELL单,不会累加为8张。
```

---

**结论**: "相同方向"是系统自动处理的,不需要客户配置。只需在文档和界面提示中明确说明即可。
