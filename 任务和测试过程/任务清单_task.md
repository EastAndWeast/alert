# 告警系统改造任务清单

## 一、需求分析 ✅
- [x] 阅读现有代码结构
- [x] 阅读10个方案文档
- [x] 制定实施计划

## 二、删除旧功能 ✅
- [x] 移除 `rules.js` 中的现有告警类型实现
- [x] 移除 `router.js` 中的现有规则路由
- [x] 清理 `mock-data.js` 中的旧规则数据
- [x] 更新 `index.html` 侧边栏菜单

## 三、实现新告警功能 ✅
### 3.1 交易类告警
- [x] **1. Large Trade (手数)** - 大额交易监控（按手数阈值）
- [x] **2. Large Trade (USD价值)** - 大额交易监控（按USD等值金额）
- [x] **3. Liquidity Trade** - 流动性拆单检测（滑动窗口聚合）
- [x] **4. Scalping** - 超短线交易监控（持仓时间+多重过滤器）

### 3.2 敞口与头寸类告警
- [x] **5. Exposure Alert** - 货币敞口监控（频率控制）
- [x] **7. NOP Limit** - 净头寸限额监控

### 3.3 行情监控类告警
- [x] **6. Pricing & Volatility** - 行情中断/波动预警

### 3.4 账户行为类告警
- [x] **8. Watch List** - 重点账户监控
- [x] **9. Reverse Positions** - 反向开仓检测
- [x] **10. Deposit & Withdrawal** - 出入金异常监控

## 四、配套功能更新 ✅
- [x] 更新 Dashboard 统计数据
- [x] 重新设计产品映射模块（Symbol Mapping Engine）
- [x] 更新告警记录模块
- [x] 更新 Mock 数据

## 五、验证测试 ✅
- [x] 浏览器功能测试
- [x] 页面交互测试
