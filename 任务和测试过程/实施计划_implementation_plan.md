# 告警系统改造实施计划

## 项目背景
根据10个方案文档，对现有 MT4/MT5 交易风控 Web 管理后台进行改造，移除现有告警功能并实现新的10种告警类型。

---

## 新告警类型对照表

| 序号 | 告警类型 | 告警ID | 核心功能 |
|:---:|:---|:---|:---|
| 1 | Large Trade (手数) | `large_trade_lots` | 单笔开仓手数超阈值 |
| 2 | Large Trade (USD价值) | `large_trade_usd` | 单笔开仓USD等值金额超阈值 |
| 3 | Liquidity Trade | `liquidity_trade` | 滑动窗口检测拆单行为 |
| 4 | Scalping | `scalping` | 持仓时间过短+多重过滤器 |
| 5 | Exposure Alert | `exposure` | 货币净敞口超限+频率控制 |
| 6 | Pricing & Volatility | `pricing_volatility` | 行情中断/剧烈波动 |
| 7 | NOP Limit | `nop_limit` | 品种净头寸超限 |
| 8 | Watch List | `watch_list` | 重点账户开仓监控 |
| 9 | Reverse Positions | `reverse_positions` | 平仓后反向开仓检测 |
| 10 | Deposit & Withdrawal | `deposit_withdrawal` | 外部大额出入金监控 |

---

## 代码改造范围

### [MODIFY] index.html
- 更新侧边栏规则管理菜单项，移除旧类型，添加新的10种告警导航

### [MODIFY] router.js
- 更新路由配置，移除旧路由，添加10个新告警页面路由

### [MODIFY] rules.js
- **完全重写**：移除现有实现，根据10个方案文档重新实现各告警类型的配置面板
- 每种告警需实现：
  - 规则列表渲染
  - 配置参数表单
  - 告警历史记录展示

### [MODIFY] mock-data.js
- 更新规则数据结构，添加10种新告警的 Mock 配置
- 更新告警记录 Mock 数据

---

## 各告警类型配置参数汇总

### 1. Large Trade (手数)
```javascript
{
  Symbol_Filter: ["XAUUSD", "EURUSD"],
  Lot_Threshold: 5.0,
  Ignore_Demo: true,
  White_List: []
}
```

### 2. Large Trade (USD价值)
```javascript
{
  USD_Value_Threshold: 50000.0,
  Cent_Account_Groups: ["*CENT*", "*MICRO*"],
  Min_Alert_Interval: 60
}
```

### 3. Liquidity Trade
```javascript
{
  Time_Window: 60,
  Min_Order_Count: 2,
  Total_Lot_Threshold: 10.0,
  Monitoring_Scope: ["Metals", "BTCUSD"],
  Aggregation_Logic: "BY_CATEGORY"
}
```

### 4. Scalping
```javascript
{
  Duration_Threshold: 180,
  Comparison_Logic: "LESS_THAN",
  Symbol_Filter: ["XAUUSD"],
  Lot_Min: 0.1,
  USD_Value_Min: 10000.0,
  Profit_USD_Min: 200.0
}
```

### 5. Exposure Alert
```javascript
{
  Target_Currency: "JPY",
  Exposure_Threshold: 500000.0,
  Time_Interval: 60,
  Max_Remind_Count: 1
}
```

### 6. Pricing & Volatility
```javascript
{
  // Pricing
  Stop_Pricing_Duration: 30,
  Scope: ["Forex", "XAUUSD"],
  // Volatility
  Volatility_Mode: "POINTS",
  Threshold_Value: 100,
  Digits_Auto_Detect: true
}
```

### 7. NOP Limit
```javascript
{
  Symbol_Name: "XAUUSD",
  Platform_Type: "MT5",
  NOP_Threshold: 5000.0,
  Calculation_Frequency: 5,
  Alert_CoolDown: 300
}
```

### 8. Watch List
```javascript
{
  Watched_Accounts: [123456, 888888],
  Monitoring_Actions: ["OPEN_TRADE", "PENDING_ORDER"],
  Alert_Priority: "HIGH"
}
```

### 9. Reverse Positions
```javascript
{
  Max_Reverse_Interval: 5,
  Min_Reverse_Lot: 1.0,
  Min_Reverse_Value_USD: 10000.0,
  Cooldown_Period: 60
}
```

### 10. Deposit & Withdrawal
```javascript
{
  Deposit_Threshold: 5000.0,
  Withdrawal_Threshold: 5000.0,
  Include_Keywords: ["Deposit", "Withdraw", "External"],
  Exclude_Keywords: ["Transfer", "Adjustment"]
}
```

---

## 验证计划

### 浏览器测试
1. 打开 `index.html` 页面
2. 验证侧边栏显示10种新告警菜单
3. 逐一点击验证各告警配置页面正常渲染
4. 验证规则启用/禁用功能
5. 验证告警历史记录显示

---

## 实施顺序

1. **Phase 1**: 更新 `index.html` 侧边栏菜单
2. **Phase 2**: 更新 `router.js` 路由配置
3. **Phase 3**: 更新 `mock-data.js` 数据结构
4. **Phase 4**: 重写 `rules.js` 实现10种告警配置面板
5. **Phase 5**: 浏览器验证测试
