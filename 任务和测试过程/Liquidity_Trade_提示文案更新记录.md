# Liquidity Trade "相同方向"提示文案更新记录

**更新时间**: 2026-02-09 11:21  
**更新内容**: 在配置界面添加关于"相同方向"自动检测的提示文案

---

## 更新内容

### 文件修改

**文件**: `trading-risk-admin/js/i18n.js`

#### 英文版提示 (Line 234)
```javascript
// 修改前:
'rule_tip_liquidity_trade': 'Tip: Monitor frequent small trades in short time.',

// 修改后:
'rule_tip_liquidity_trade': 'Tip: System automatically groups orders by direction (BUY/SELL). Only same-direction orders are counted together.',
```

#### 中文版提示 (Line 828)
```javascript
// 修改前:
'rule_tip_liquidity_trade': '提示：监控短时间内特定品种或类别的流动性集中情况。',

// 修改后:
'rule_tip_liquidity_trade': '💡 提示：系统会自动区分BUY和SELL方向，相同方向的订单才会累加手数。例如：60秒内开5张BUY单和3张SELL单，不会累加为8张。',
```

---

## 效果展示

### 在配置界面中的显示

用户在配置Liquidity Trade规则时，会在表单底部看到以下提示:

**中文界面**:
```
┌─────────────────────────────────┐
│ 时间窗口: [60] 秒                │
│ 最小订单数: ≥ [2] 张            │
│ 总手数阈值: > [10] 手           │
│ 聚合逻辑: [按大类聚合 ▼]        │
├─────────────────────────────────┤
│ 💡 提示：系统会自动区分BUY和    │
│ SELL方向，相同方向的订单才会    │
│ 累加手数。例如：60秒内开5张     │
│ BUY单和3张SELL单，不会累加为8张。│
└─────────────────────────────────┘
```

**英文界面**:
```
┌─────────────────────────────────┐
│ Time Window: [60] seconds       │
│ Min Order Count: ≥ [2] orders   │
│ Total Lot Threshold: > [10] lots│
│ Aggregation Logic: [Category ▼] │
├─────────────────────────────────┤
│ Tip: System automatically groups│
│ orders by direction (BUY/SELL). │
│ Only same-direction orders are  │
│ counted together.               │
└─────────────────────────────────┘
```

---

## 提示文案的作用

1. **明确告知用户**: 方向是自动处理的,不需要额外配置
2. **避免误解**: 用户不会误以为BUY和SELL单会累加在一起
3. **提供具体示例**: 通过实例帮助用户理解检测逻辑
4. **增强信心**: 用户知道系统会正确处理方向问题

---

## 相关文档

- [Liquidity Trade需求分析](./Liquidity_Trade需求分析.md)
- [Liquidity Trade相同方向配置说明](./Liquidity_Trade_相同方向配置说明.md)
- [需求讨论记录](../AI沟通记录/Liquidity_Trade需求讨论_20260209.md)

---

**状态**: ✅ 已完成
