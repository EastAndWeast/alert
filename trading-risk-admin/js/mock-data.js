// 模拟数据 - 交易风控管理系统（多租户版）

const MockData = {
    // 当前用户状态
    currentUser: null,

    // 公司数据
    companies: [
        { company_id: 'C001', company_name: 'Alpha Broker', contact_email: 'admin@alpha.com', status: 'active', created_at: '2023-01-15' },
        { company_id: 'C002', company_name: 'Beta Trading', contact_email: 'admin@beta.com', status: 'active', created_at: '2023-03-20' },
        { company_id: 'C003', company_name: 'Gamma FX', contact_email: 'admin@gamma.com', status: 'inactive', created_at: '2023-06-10' }
    ],

    // 数据源
    dataSources: [
        { source_id: 'DS001', source_name: 'Alpha MT4', platform_type: 'MT4', company_id: 'C001', ip: '192.168.1.100', username: 'mt4_admin', password: 'Alpha@2023', status: 'active', created_at: '2023-01-16' },
        { source_id: 'DS002', source_name: 'Alpha MT5', platform_type: 'MT5', company_id: 'C001', ip: '192.168.1.101', username: 'mt5_admin', password: 'Alpha@2024', status: 'active', created_at: '2023-02-01' },
        { source_id: 'DS003', source_name: 'Beta MT5', platform_type: 'MT5', company_id: 'C002', ip: '10.0.0.50', username: 'beta_mt5', password: 'Beta#2023', status: 'active', created_at: '2023-03-21' },
        { source_id: 'DS004', source_name: 'Gamma MT4', platform_type: 'MT4', company_id: 'C003', ip: '172.16.0.25', username: 'gamma_mt4', password: 'Gamma!2023', status: 'inactive', created_at: '2023-06-11' }
    ],

    // 用户
    users: [
        { user_id: 'U001', username: 'sa@system.com', password: 'admin123', email: 'sa@system.com', role: 'super_admin', company_id: null, datasource_ids: [], status: 'active', display_name: '超级管理员', created_at: '2023-01-01' },
        { user_id: 'U002', username: 'admin@alpha.com', password: 'alpha123', email: 'admin@alpha.com', role: 'company_admin', company_id: 'C001', datasource_ids: ['DS001', 'DS002'], status: 'active', display_name: 'Alpha 管理员', created_at: '2023-01-16' },
        { user_id: 'U003', username: 'user@alpha.com', password: 'alpha123', email: 'user@alpha.com', role: 'company_user', company_id: 'C001', datasource_ids: ['DS001'], status: 'active', display_name: 'Alpha 操作员', created_at: '2023-02-10' },
        { user_id: 'U004', username: 'viewer@alpha.com', password: 'alpha123', email: 'viewer@alpha.com', role: 'viewer', company_id: 'C001', datasource_ids: ['DS001', 'DS002'], status: 'active', display_name: 'Alpha 只读', created_at: '2023-03-05' },
        { user_id: 'U005', username: 'admin@beta.com', password: 'beta123', email: 'admin@beta.com', role: 'company_admin', company_id: 'C002', datasource_ids: ['DS003'], status: 'active', display_name: 'Beta 管理员', created_at: '2023-03-21' },
        { user_id: 'U006', username: 'viewer@beta.com', password: 'beta123', email: 'viewer@beta.com', role: 'viewer', company_id: 'C002', datasource_ids: ['DS003'], status: 'active', display_name: 'Beta 只读', created_at: '2023-04-15' }
    ],

    // 用户ID计数器
    userIdCounter: 7,

    // 交易数据
    trades: [
        { trade_id: 'T001', source_id: 'DS001', platform: 'MT4', account_id: 'ACC001', account_currency: 'USD', product_code: 'EURUSD', product_category: 'Forex Major', volume_lot: 5.0, open_time: '2024-01-15 10:30:00', close_time: '2024-01-15 10:35:00', deal_usd: 150000 },
        { trade_id: 'T002', source_id: 'DS002', platform: 'MT5', account_id: 'ACC002', account_currency: 'EUR', product_code: 'GBPUSD', product_category: 'Forex Major', volume_lot: 2.5, open_time: '2024-01-15 11:00:00', close_time: '2024-01-15 11:02:30', deal_usd: 85000 },
        { trade_id: 'T003', source_id: 'DS001', platform: 'MT4', account_id: 'ACC003', account_currency: 'JPY', product_code: 'USDJPY', product_category: 'Forex Major', volume_lot: 10.0, open_time: '2024-01-15 12:00:00', close_time: '2024-01-15 12:00:45', deal_usd: 250000 },
        { trade_id: 'T004', source_id: 'DS002', platform: 'MT5', account_id: 'ACC001', account_currency: 'USD', product_code: 'XAUUSD', product_category: 'Commodities', volume_lot: 3.0, open_time: '2024-01-15 13:30:00', close_time: '2024-01-15 14:15:00', deal_usd: 180000 },
        { trade_id: 'T005', source_id: 'DS003', platform: 'MT5', account_id: 'ACC004', account_currency: 'GBP', product_code: 'EURUSD', product_category: 'Forex Major', volume_lot: 1.0, open_time: '2024-01-15 14:00:00', close_time: '2024-01-15 14:00:25', deal_usd: 45000 },
        { trade_id: 'T006', source_id: 'DS003', platform: 'MT5', account_id: 'ACC005', account_currency: 'USD', product_code: 'BTCUSD', product_category: 'Crypto', volume_lot: 0.5, open_time: '2024-01-15 15:00:00', close_time: '2024-01-15 15:30:00', deal_usd: 320000 }
    ],

    // 产品映射
    productMappings: [
        // Forex Major
        { id: 1, source_id: 'DS001', platform: 'MT4', raw_product_name: 'EURUSD', unified_product_code: 'EURUSD', product_category: 'forex_major', match_pattern: false, enabled: true },
        { id: 2, source_id: 'DS002', platform: 'MT5', raw_product_name: 'EURUSD.', unified_product_code: 'EURUSD', product_category: 'forex_major', match_pattern: false, enabled: true },
        { id: 3, source_id: 'DS001', platform: 'MT4', raw_product_name: 'GBPUSD*', unified_product_code: 'GBPUSD', product_category: 'forex_major', match_pattern: true, enabled: true },
        { id: 4, source_id: 'DS003', platform: 'MT5', raw_product_name: 'EURUSD.', unified_product_code: 'EURUSD', product_category: 'forex_major', match_pattern: false, enabled: true },
        // Metals
        { id: 5, source_id: 'DS001', platform: 'MT4', raw_product_name: 'XAUUSD', unified_product_code: 'XAUUSD', product_category: 'metals', match_pattern: false, enabled: true },
        { id: 6, source_id: 'DS002', platform: 'MT5', raw_product_name: 'GOLD', unified_product_code: 'XAUUSD', product_category: 'metals', match_pattern: false, enabled: true },
        { id: 7, source_id: 'DS001', platform: 'MT4', raw_product_name: 'XAUUSD*', unified_product_code: 'XAUUSD', product_category: 'metals', match_pattern: true, enabled: true },
        { id: 8, source_id: 'DS002', platform: 'MT5', raw_product_name: 'XAGUSD', unified_product_code: 'XAGUSD', product_category: 'metals', match_pattern: false, enabled: true },
        // Crypto
        { id: 9, source_id: 'DS003', platform: 'MT5', raw_product_name: 'BTCUSD', unified_product_code: 'BTCUSD', product_category: 'crypto', match_pattern: false, enabled: true },
        { id: 10, source_id: 'DS003', platform: 'MT5', raw_product_name: 'ETHUSD', unified_product_code: 'ETHUSD', product_category: 'crypto', match_pattern: false, enabled: true },
        // Indices
        { id: 11, source_id: 'DS002', platform: 'MT5', raw_product_name: 'US30', unified_product_code: 'US30', product_category: 'indices', match_pattern: false, enabled: true },
        // Energy
        { id: 12, source_id: 'DS001', platform: 'MT4', raw_product_name: 'XTIUSD', unified_product_code: 'XTIUSD', product_category: 'energy', match_pattern: false, enabled: true }
    ],

    // 产品大类定义 (动态管理)
    productCategories: [
        { id: 'metals', name: 'Metals', icon: '<i data-lucide="gem"></i>', description: '贵金属类产品 (XAUUSD, XAGUSD等)' },
        { id: 'forex_major', name: 'Forex Major', icon: '<i data-lucide="arrow-left-right"></i>', description: '主要货币对 (EURUSD, GBPUSD等)' },
        { id: 'forex_minor', name: 'Forex Minor', icon: '<i data-lucide="shuffle"></i>', description: '次要货币对 (EURGBP, AUDJPY等)' },
        { id: 'crypto', name: 'Crypto', icon: '<i data-lucide="bitcoin"></i>', description: '加密货币 (BTCUSD, ETHUSD等)' },
        { id: 'indices', name: 'Indices', icon: '<i data-lucide="bar-chart-3"></i>', description: '股票指数 (US30, GER40等)' },
        { id: 'energy', name: 'Energy', icon: '<i data-lucide="flame"></i>', description: '能源类产品 (XTIUSD, XNGUSD等)' }
    ],

    addProductCategory: function (cat) {
        if (this.productCategories.find(function (c) { return c.id === cat.id; })) {
            return false;
        }
        this.productCategories.push(cat);
        return true;
    },

    updateProductCategory: function (id, data) {
        var cat = this.productCategories.find(function (c) { return c.id === id; });
        if (cat) {
            Object.assign(cat, data);
            return true;
        }
        return false;
    },

    deleteProductCategory: function (id) {
        var idx = this.productCategories.findIndex(function (c) { return c.id === id; });
        if (idx > -1) {
            this.productCategories.splice(idx, 1);
            return true;
        }
        return false;
    },

    // 风控规则（10种新告警类型）
    rules: [
        // 1. Large Trade (手数) - 按手数阈值监控
        { rule_id: 'R001', source_id: 'DS001', rule_type: 'large_trade_lots', name: 'Large Trade (手数)', description: '监控单笔开仓手数超过阈值', icon: '💰', enabled: true, parameters: { lot_threshold: 5.0, symbol_filter: ['XAUUSD', 'EURUSD'], ignore_demo: true, white_list: [] }, trigger_action: 'alert', triggered_count: 25 },
        { rule_id: 'R002', source_id: 'DS002', rule_type: 'large_trade_lots', name: 'Large Trade (手数)', description: '监控单笔开仓手数超过阈值', icon: '💰', enabled: true, parameters: { lot_threshold: 3.0, symbol_filter: ['XAUUSD'], ignore_demo: true, white_list: [] }, trigger_action: 'alert', triggered_count: 12 },
        { rule_id: 'R003', source_id: 'DS003', rule_type: 'large_trade_lots', name: 'Large Trade (手数)', description: '监控单笔开仓手数超过阈值', icon: '💰', enabled: true, parameters: { lot_threshold: 1.0, symbol_filter: ['BTCUSD'], ignore_demo: false, white_list: [] }, trigger_action: 'alert', triggered_count: 18 },

        // 2. Large Trade (USD价值) - 按USD等值金额监控
        { rule_id: 'R010', source_id: 'DS001', rule_type: 'large_trade_usd', name: 'Large Trader (USD)', description: '监控单笔开仓USD等值金额超过阈值', icon: '💵', enabled: true, parameters: { usd_value_threshold: 50000.0, cent_account_groups: ['*CENT*', '*MICRO*'], symbol_filter: ['XAUUSD', 'EURUSD'] }, trigger_action: 'alert', triggered_count: 15 },
        { rule_id: 'R011', source_id: 'DS003', rule_type: 'large_trade_usd', name: 'Large Trader (USD)', description: '监控单笔开仓USD等值金额超过阈值', icon: '💵', enabled: true, parameters: { usd_value_threshold: 100000.0, cent_account_groups: [], symbol_filter: [] }, trigger_action: 'alert', triggered_count: 8 },

        // 3. Liquidity Trade - 拆单检测
        { rule_id: 'R020', source_id: 'DS001', rule_type: 'liquidity_trade', name: 'Liquidity Trade', description: '监控短时间内多笔小单消耗市场深度', icon: '🌊', enabled: true, parameters: { time_window: 60, min_order_count: 2, total_lot_threshold: 10.0, monitoring_scope: ['Metals'], aggregation_logic: 'BY_CATEGORY' }, trigger_action: 'alert', triggered_count: 8 },
        { rule_id: 'R021', source_id: 'DS003', rule_type: 'liquidity_trade', name: 'Liquidity Trade', description: '监控短时间内多笔小单消耗市场深度', icon: '🌊', enabled: true, parameters: { time_window: 120, min_order_count: 3, total_lot_threshold: 15.0, monitoring_scope: ['BTCUSD', 'Crypto'], aggregation_logic: 'BY_SYMBOL' }, trigger_action: 'alert', triggered_count: 5 },

        // 4. Scalping - 超短线监控
        { rule_id: 'R030', source_id: 'DS001', rule_type: 'scalping', name: 'Scalping', description: '监控持仓时间过短的交易行为', icon: '⚡', enabled: true, parameters: { duration_threshold: 180, comparison_logic: 'LESS_THAN', symbol_filter: ['XAUUSD', 'EURUSD'], lot_min: 0.1, usd_value_min: 10000.0, profit_usd_min: 200.0, include_loss: false }, trigger_action: 'alert', triggered_count: 35 },
        { rule_id: 'R031', source_id: 'DS003', rule_type: 'scalping', name: 'Scalping', description: '监控持仓时间过短的交易行为', icon: '⚡', enabled: true, parameters: { duration_threshold: 120, comparison_logic: 'LESS_THAN', symbol_filter: ['BTCUSD'], lot_min: 0.5, usd_value_min: 50000.0, profit_usd_min: 500.0, include_loss: true }, trigger_action: 'alert', triggered_count: 22 },

        // 5. Exposure Alert - 货币敞口监控
        { rule_id: 'R040', source_id: 'DS001', rule_type: 'exposure_alert', name: 'Exposure Alert', description: '监控货币净敞口超标', icon: '📊', enabled: true, parameters: { target_currency: 'USD', exposure_threshold: 10000000, time_interval: 600, calculation_mode: 'ONLY_POSITIONS' }, trigger_action: 'alert', triggered_count: 2 },
        { rule_id: 'R041', source_id: 'DS001', rule_type: 'exposure_alert', name: 'Exposure Alert', description: '监控货币净敞口超标', icon: '📊', enabled: true, parameters: { target_currency: 'JPY', exposure_threshold: 50000000, time_interval: 600, calculation_mode: 'ONLY_POSITIONS' }, trigger_action: 'alert', triggered_count: 1 },

        // 6. Pricing - 报价异常
        { rule_id: 'R050', source_id: 'DS001', rule_type: 'pricing', name: 'Pricing Monitor', description: 'Monitor price gaps and staleness', icon: '⏱️', enabled: true, parameters: { pricing: { stop_pricing_duration: 30, max_spread: 150, scope: ['Forex', 'XAUUSD'] } }, trigger_action: 'alert', triggered_count: 12 },
        // 7. Volatility - 波动率异常
        { rule_id: 'R051', source_id: 'DS003', rule_type: 'volatility', name: 'Volatility Monitor', description: 'Monitor extreme price fluctuations', icon: '📈', enabled: true, parameters: { volatility_mode: 'PERCENTAGE', threshold_value: 0.5, time_window: 'M1', volatility_scope: ['Crypto'] }, trigger_action: 'alert', triggered_count: 8 },

        // 7. NOP Limit - 净头寸限额
        { rule_id: 'R060', source_id: 'DS001', rule_type: 'nop_limit', name: 'NOP Limit', description: '监控产品净头寸超限', icon: '📐', enabled: true, parameters: { symbol_name: 'XAUUSD', nop_threshold: 5000.0 }, trigger_action: 'alert', triggered_count: 6 },
        { rule_id: 'R061', source_id: 'DS002', rule_type: 'nop_limit', name: 'NOP Limit', description: '监控产品净头寸超限', icon: '📐', enabled: true, parameters: { symbol_name: 'EURUSD', nop_threshold: 10000.0 }, trigger_action: 'alert', triggered_count: 3 },
        { rule_id: 'R062', source_id: 'DS003', rule_type: 'nop_limit', name: 'NOP Limit', description: '监控产品净头寸超限', icon: '📐', enabled: true, parameters: { symbol_name: 'BTCUSD', nop_threshold: 100.0 }, trigger_action: 'alert', triggered_count: 2 },

        // 8. Watch List - 重点账户监控
        { rule_id: 'R070', source_id: 'DS001', rule_type: 'watch_list', name: 'Watch List', description: '监控重点账户交易行为', icon: '👁️', enabled: true, parameters: { watched_accounts: [123456, 888888], monitoring_actions: ['OPEN_TRADE', 'PENDING_ORDER'], alert_priority: 'HIGH', lots_min_limit: 0.01 }, trigger_action: 'alert', triggered_count: 15 },
        { rule_id: 'R071', source_id: 'DS003', rule_type: 'watch_list', name: 'Watch List', description: '监控重点账户交易行为', icon: '👁️', enabled: true, parameters: { watched_accounts: [999999], monitoring_actions: ['OPEN_TRADE'], alert_priority: 'INFO', lots_min_limit: 1.0 }, trigger_action: 'alert', triggered_count: 8 },

        // 9. Reverse Positions - 反向开仓监控
        { rule_id: 'R080', source_id: 'DS001', rule_type: 'reverse_positions', name: 'Reverse Positions', description: '监控平仓后反向开仓行为', icon: '🔀', enabled: true, parameters: { max_reverse_interval: 5, min_reverse_lot: 1.0, min_reverse_value_usd: 10000.0, symbol_match_level: 'EXACT_MATCH', cooldown_period: 60 }, trigger_action: 'alert', triggered_count: 3 },
        { rule_id: 'R081', source_id: 'DS003', rule_type: 'reverse_positions', name: 'Reverse Positions', description: '监控平仓后反向开仓行为', icon: '🔀', enabled: true, parameters: { max_reverse_interval: 10, min_reverse_lot: 0.5, min_reverse_value_usd: 50000.0, symbol_match_level: 'EXACT_MATCH', cooldown_period: 120 }, trigger_action: 'alert', triggered_count: 2 },

        // 10. Deposit & Withdrawal - 出入金监控
        { rule_id: 'R090', source_id: 'DS001', rule_type: 'deposit_withdrawal', name: 'Deposit & Withdrawal', description: '监控大额出入金行为', icon: '💳', enabled: true, parameters: { deposit_threshold: 10000.0, withdrawal_threshold: 5000.0, include_keywords: ['Deposit', 'Withdraw', 'External'], monitoring_source: 'REAL_ONLY' }, trigger_action: 'alert', triggered_count: 7 },
        { rule_id: 'R091', source_id: 'DS003', rule_type: 'deposit_withdrawal', name: 'Deposit & Withdrawal', description: '监控大额出入金行为', icon: '💳', enabled: true, parameters: { deposit_threshold: 50000.0, withdrawal_threshold: 25000.0, include_keywords: ['Deposit', 'Withdraw'], monitoring_source: 'REAL_ONLY' }, trigger_action: 'alert', triggered_count: 2 }
    ],

    // 告警记录（10种告警类型各含模拟数据）
    alerts: [
        // 1. Large Trade (手数)
        { alert_id: 'A001', source_id: 'DS001', rule_type: 'large_trade_lots', rule_id: 'R001', account_id: 'ACC001', product: 'XAUUSD', trigger_time: '2024-01-15 10:30:15', trigger_value: 8.5, status: 'new', platform: 'MT4', details: { direction: 'BUY', threshold: 5.0 } },
        { alert_id: 'A002', source_id: 'DS002', rule_type: 'large_trade_lots', rule_id: 'R002', account_id: '88888888', product: 'XAUUSD', trigger_time: '2024-01-15 11:15:22', trigger_value: 6.0, status: 'reviewed', platform: 'MT5', details: { direction: 'SELL', threshold: 3.0 } },
        { alert_id: 'A003', source_id: 'DS003', rule_type: 'large_trade_lots', rule_id: 'R003', account_id: '99999999', product: 'BTCUSD', trigger_time: '2024-01-15 14:20:05', trigger_value: 2.5, status: 'new', platform: 'MT5', details: { direction: 'BUY', threshold: 1.0 } },

        // 2. Large Trade (USD)
        { alert_id: 'A010', source_id: 'DS001', rule_type: 'large_trade_usd', rule_id: 'R010', account_id: '12345678', product: 'EURUSD', trigger_time: '2024-01-15 09:45:30', trigger_value: 125000, status: 'new', platform: 'MT4', details: { lots: 2.5, account_currency: 'USD', rate_used: 1.0 } },
        { alert_id: 'A011', source_id: 'DS002', rule_type: 'large_trade_usd', rule_id: 'R011', account_id: '66666666', product: 'XAUUSD', trigger_time: '2024-01-15 10:55:18', trigger_value: 280000, status: 'reviewed', platform: 'MT5', details: { lots: 1.5, account_currency: 'EUR', rate_used: 1.08 } },

        // 3. Liquidity Trade (拆单监控)
        { alert_id: 'A020', source_id: 'DS001', rule_type: 'liquidity_trade', rule_id: 'R020', account_id: '12345678', product: 'XAUUSD', trigger_time: '2024-01-15 11:30:00', trigger_value: 15.5, status: 'new', platform: 'MT4', details: { order_count: 8, time_window: 60, direction: 'BUY', category: 'Metals' } },
        { alert_id: 'A021', source_id: 'DS003', rule_type: 'liquidity_trade', rule_id: 'R021', account_id: '77777777', product: 'BTCUSD', trigger_time: '2024-01-15 13:45:22', trigger_value: 12.0, status: 'new', platform: 'MT5', details: { order_count: 6, time_window: 120, direction: 'SELL', category: 'Crypto' } },

        // 4. Scalping (刷单监控)
        { alert_id: 'A030', source_id: 'DS001', rule_type: 'scalping', rule_id: 'R030', account_id: '88888888', product: 'EURUSD', trigger_time: '2024-01-15 10:00:45', trigger_value: 35, status: 'new', platform: 'MT4', details: { profit_usd: 850, lots: 2.0, threshold: 180 } },
        { alert_id: 'A031', source_id: 'DS002', rule_type: 'scalping', rule_id: 'R031', account_id: '55555555', product: 'GBPUSD', trigger_time: '2024-01-15 11:02:18', trigger_value: 28, status: 'reviewed', platform: 'MT5', details: { profit_usd: 520, lots: 1.5, threshold: 120 } },
        { alert_id: 'A032', source_id: 'DS003', rule_type: 'scalping', rule_id: 'R032', account_id: '44444444', product: 'XAUUSD', trigger_time: '2024-01-15 15:12:55', trigger_value: 42, status: 'new', platform: 'MT5', details: { profit_usd: 1200, lots: 0.8, threshold: 60 } },

        // 5. Exposure Alert (敞口监控)
        { alert_id: 'A040', source_id: 'DS001', rule_type: 'exposure_alert', rule_id: 'R040', account_id: 'SYSTEM', product: 'USD', trigger_time: '2024-01-15 12:00:00', trigger_value: 12500000, status: 'new', platform: 'MT4', details: { direction: 'LONG', threshold: 10000000, currency: 'USD' } },
        { alert_id: 'A041', source_id: 'DS002', rule_type: 'exposure_alert', rule_id: 'R041', account_id: 'SYSTEM', product: 'JPY', trigger_time: '2024-01-15 14:30:00', trigger_value: -8500000, status: 'reviewed', platform: 'MT5', details: { direction: 'SHORT', threshold: 5000000, currency: 'JPY' } },

        // 6. Pricing 
        { alert_id: 'A050', source_id: 'DS001', rule_type: 'pricing', rule_id: 'R050', account_id: 'SYSTEM', product: 'XAUUSD', trigger_time: '2024-01-15 09:15:00', trigger_value: 45, status: 'new', platform: 'MT4', details: { alert_subtype: 'STALE_PRICE', last_tick_time: '2024-01-15 09:14:15', threshold: 30 } },
        // 7. Volatility
        { alert_id: 'A051', source_id: 'DS002', rule_type: 'volatility', rule_id: 'R051', account_id: 'SYSTEM', product: 'EURUSD', trigger_time: '2024-01-15 16:22:05', trigger_value: 85, status: 'new', platform: 'MT5', details: { alert_subtype: 'VOLATILITY', change_points: 85, time_window: 'M1' } },

        // 7. NOP Limit (净头寸限额)
        { alert_id: 'A060', source_id: 'DS001', rule_type: 'nop_limit', rule_id: 'R060', account_id: 'SYSTEM', product: 'XAUUSD', trigger_time: '2024-01-15 13:00:05', trigger_value: 6200, status: 'new', platform: 'MT4', details: { threshold: 5000, net_position: 62, direction: 'LONG' } },
        { alert_id: 'A061', source_id: 'DS003', rule_type: 'nop_limit', rule_id: 'R061', account_id: 'SYSTEM', product: 'BTCUSD', trigger_time: '2024-01-15 15:45:30', trigger_value: 1250, status: 'reviewed', platform: 'MT5', details: { threshold: 1000, net_position: 12.5, direction: 'SHORT' } },

        // 8. Watch List (观察名单)
        { alert_id: 'A070', source_id: 'DS001', rule_type: 'watch_list', rule_id: 'R070', account_id: '123456', product: 'XAUUSD', trigger_time: '2024-01-15 10:05:12', trigger_value: 5.0, status: 'new', platform: 'MT4', details: { action: 'OPEN_TRADE', direction: 'BUY', priority: 'HIGH' } },
        { alert_id: 'A071', source_id: 'DS002', rule_type: 'watch_list', rule_id: 'R070', account_id: '888888', product: 'EURUSD', trigger_time: '2024-01-15 11:22:45', trigger_value: 2.0, status: 'new', platform: 'MT5', details: { action: 'OPEN_TRADE', direction: 'SELL', priority: 'HIGH' } },
        { alert_id: 'A072', source_id: 'DS003', rule_type: 'watch_list', rule_id: 'R071', account_id: '999999', product: 'BTCUSD', trigger_time: '2024-01-15 14:55:08', trigger_value: 1.5, status: 'reviewed', platform: 'MT5', details: { action: 'OPEN_TRADE', direction: 'BUY', priority: 'INFO' } },

        // 9. Reverse Positions (反向开仓)
        { alert_id: 'A080', source_id: 'DS001', rule_type: 'reverse_positions', rule_id: 'R080', account_id: '12345678', product: 'XAUUSD', trigger_time: '2024-01-15 11:45:05', trigger_value: 3, status: 'new', platform: 'MT4', details: { close_direction: 'BUY', open_direction: 'SELL', close_lots: 2.0, open_lots: 2.5 } },
        { alert_id: 'A081', source_id: 'DS003', rule_type: 'reverse_positions', rule_id: 'R081', account_id: '99999999', product: 'BTCUSD', trigger_time: '2024-01-15 16:02:18', trigger_value: 2, status: 'new', platform: 'MT5', details: { close_direction: 'SELL', open_direction: 'BUY', close_lots: 0.8, open_lots: 1.0 } },

        // 10. Deposit & Withdrawal (出入金监控)
        { alert_id: 'A090', source_id: 'DS001', rule_type: 'deposit_withdrawal', rule_id: 'R090', account_id: '88888888', product: 'N/A', trigger_time: '2024-01-15 09:00:00', trigger_value: 50000, status: 'new', platform: 'MT4', details: { type: 'DEPOSIT', comment: 'External Deposit', currency: 'USD' } },
        { alert_id: 'A091', source_id: 'DS002', rule_type: 'deposit_withdrawal', rule_id: 'R090', account_id: '66666666', product: 'N/A', trigger_time: '2024-01-15 14:30:22', trigger_value: 25000, status: 'reviewed', platform: 'MT5', details: { type: 'WITHDRAWAL', comment: 'Withdraw to Bank', currency: 'EUR' } },
        { alert_id: 'A092', source_id: 'DS003', rule_type: 'deposit_withdrawal', rule_id: 'R091', account_id: '77777777', product: 'N/A', trigger_time: '2024-01-15 16:45:55', trigger_value: 85000, status: 'new', platform: 'MT5', details: { type: 'DEPOSIT', comment: 'External Deposit Wire', currency: 'USD' } }
    ],

    // 账户数据
    accounts: [
        { account_id: 'ACC001', source_id: 'DS001', platform: 'MT4', account_currency: 'USD', balance: 125000, equity: 128500, margin_level: 450, status: 'active', risk_level: 'high', created_at: '2023-06-15', alert_count: 2 },
        { account_id: 'ACC002', source_id: 'DS002', platform: 'MT5', account_currency: 'EUR', balance: 85000, equity: 82300, margin_level: 320, status: 'active', risk_level: 'medium', created_at: '2023-08-20', alert_count: 0 },
        { account_id: 'ACC003', source_id: 'DS001', platform: 'MT4', account_currency: 'JPY', balance: 15000000, equity: 15250000, margin_level: 580, status: 'active', risk_level: 'high', created_at: '2023-04-10', alert_count: 1 },
        { account_id: 'ACC004', source_id: 'DS003', platform: 'MT5', account_currency: 'GBP', balance: 45000, equity: 44200, margin_level: 280, status: 'active', risk_level: 'low', created_at: '2023-11-05', alert_count: 1 },
        { account_id: 'ACC005', source_id: 'DS003', platform: 'MT5', account_currency: 'USD', balance: 520000, equity: 535000, margin_level: 620, status: 'active', risk_level: 'high', created_at: '2023-02-28', alert_count: 1 }
    ],

    // IB返佣数据
    ibRebates: [
        { ib_id: 'IB001', source_id: 'DS001', ib_name: 'Alpha Partners', total_rebate: 15800, today_rebate: 850, trade_count: 980, client_count: 28, rank: 1 },
        { ib_id: 'IB002', source_id: 'DS003', ib_name: 'Beta Affiliates', total_rebate: 18200, today_rebate: 920, trade_count: 1150, client_count: 35, rank: 1 }
    ],

    // 全局配置
    globalSettings: {
        base_currency: 'USD',
        exchange_rate_source: 'Reuters',
        default_time_zone: 'Asia/Shanghai',
        alert_retention_days: 90,
        auto_refresh_interval: 30,
        // Webhook 通知配置
        telegram_token: '',
        telegram_chat_id: '',
        telegram_enabled: false,
        teams_webhook: '',
        teams_enabled: false,
        slack_webhook: '',
        slack_enabled: false,
        lark_webhook: '',
        lark_enabled: false
    },

    // 审计日志
    auditLogs: [
        { id: 1, user_id: 'U001', action: 'LOGIN', detail: '超级管理员登录系统', ip: '192.168.1.1', time: '2024-01-15 09:00:00' },
        { id: 2, user_id: 'U001', action: 'UPDATE_RULE', detail: '修改规则 R001 阈值为 5.0', ip: '192.168.1.1', time: '2024-01-15 09:30:00' }
    ],

    addAuditLog: function (action, detail) {
        var user = this.currentUser;
        var log = {
            id: this.auditLogs.length + 1,
            user_id: user ? user.user_id : 'SYSTEM',
            action: action,
            detail: detail,
            ip: '127.0.0.1', // 模拟 IP
            time: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        };
        this.auditLogs.unshift(log); // 最新日志在前
    },

    // 统计数据获取方法
    getStatistics(sourceIds) {
        const alerts = this.filterBySource(this.alerts, sourceIds);
        const accounts = this.filterBySource(this.accounts, sourceIds);
        const rules = this.filterBySource(this.rules, sourceIds);
        const newAlerts = alerts.filter(function (a) { return a.status === 'new'; }).length;
        const activeRules = rules.filter(function (r) { return r.enabled; }).length;
        const alertedAccounts = new Set(alerts.filter(function (a) { return a.account_id !== 'SYSTEM'; }).map(function (a) { return a.account_id; })).size;
        const reviewedAlerts = alerts.filter(function (a) { return a.status === 'reviewed'; }).length;
        const alertResolutionRate = alerts.length > 0 ? Math.round(reviewedAlerts / alerts.length * 100) : 0;
        return {
            today_alerts: newAlerts,
            active_rules: activeRules,
            alerted_accounts: alertedAccounts,
            alert_resolution_rate: alertResolutionRate,
            alerts_by_type: {
                large_trade_lots: alerts.filter(function (a) { return a.rule_type === 'large_trade_lots'; }).length,
                large_trade_usd: alerts.filter(function (a) { return a.rule_type === 'large_trade_usd'; }).length,
                liquidity_trade: alerts.filter(function (a) { return a.rule_type === 'liquidity_trade'; }).length,
                scalping: alerts.filter(function (a) { return a.rule_type === 'scalping'; }).length,
                exposure_alert: alerts.filter(function (a) { return a.rule_type === 'exposure_alert'; }).length,
                pricing: alerts.filter(function (a) { return a.rule_type === 'pricing'; }).length,
                volatility: alerts.filter(function (a) { return a.rule_type === 'volatility'; }).length,
                nop_limit: alerts.filter(function (a) { return a.rule_type === 'nop_limit'; }).length,
                watch_list: alerts.filter(function (a) { return a.rule_type === 'watch_list'; }).length,
                reverse_positions: alerts.filter(function (a) { return a.rule_type === 'reverse_positions'; }).length,
                deposit_withdrawal: alerts.filter(function (a) { return a.rule_type === 'deposit_withdrawal'; }).length
            },
            alerts_trend: [
                { date: '01/09', count: 8 }, { date: '01/10', count: 12 }, { date: '01/11', count: 6 },
                { date: '01/12', count: 15 }, { date: '01/13', count: 9 }, { date: '01/14', count: 11 }, { date: '01/15', count: newAlerts }
            ],
            platform_volume: { MT4: 685000, MT5: 715000 }
        };
    },

    filterBySource(data, sourceIds) {
        if (!sourceIds || sourceIds.length === 0) return data;
        return data.filter(function (item) { return sourceIds.indexOf(item.source_id) >= 0; });
    },

    getUserSourceIds(user) {
        var self = this;
        if (!user) return [];
        if (user.role === 'super_admin') return this.dataSources.map(function (ds) { return ds.source_id; });
        return this.dataSources.filter(function (ds) { return ds.company_id === user.company_id; }).map(function (ds) { return ds.source_id; });
    },

    getUserCompanies(user) {
        if (!user) return [];
        if (user.role === 'super_admin') return this.companies;
        return this.companies.filter(function (c) { return c.company_id === user.company_id; });
    },

    // 用户管理方法
    addUser(userData) {
        var self = this;
        var newUser = {
            user_id: 'U' + String(this.userIdCounter++).padStart(3, '0'),
            username: userData.username,
            password: userData.password,
            email: userData.email,
            role: userData.role,
            company_id: userData.company_id || null,
            datasource_ids: userData.datasource_ids || [],
            status: userData.status || 'active',
            display_name: userData.display_name,
            created_at: new Date().toISOString().split('T')[0]
        };
        this.users.push(newUser);
        return newUser;
    },

    updateUser(userId, userData) {
        var user = this.users.find(function (u) { return u.user_id === userId; });
        if (user) {
            if (userData.username) user.username = userData.username;
            if (userData.password) user.password = userData.password;
            if (userData.email) user.email = userData.email;
            if (userData.role) user.role = userData.role;
            if (userData.hasOwnProperty('company_id')) user.company_id = userData.company_id;
            if (userData.datasource_ids) user.datasource_ids = userData.datasource_ids;
            if (userData.status) user.status = userData.status;
            if (userData.display_name) user.display_name = userData.display_name;
            return user;
        }
        return null;
    },

    deleteUser(userId) {
        var index = this.users.findIndex(function (u) { return u.user_id === userId; });
        if (index > -1) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    },

    getAvailableDatasources(companyId, currentUser) {
        if (Permissions.isSuperAdmin(currentUser)) {
            if (!companyId) {
                return this.dataSources;
            }
            return this.dataSources.filter(function (ds) { return ds.company_id === companyId; });
        }
        return this.dataSources.filter(function (ds) { return ds.company_id === currentUser.company_id; });
    },

    // 角色数据
    roles: [
        { role_id: 'R001', role_key: 'super_admin', role_name: '超级管理员', color: 'danger', level: 100, is_system: true, permissions: ['view_dashboard', 'manage_rules', 'manage_products', 'view_alerts', 'manage_accounts', 'manage_companies', 'manage_datasources', 'manage_users', 'manage_roles', 'manage_settings'], created_at: '2023-01-01' },
        { role_id: 'R002', role_key: 'company_admin', role_name: '公司管理员', color: 'warning', level: 80, is_system: true, permissions: ['view_dashboard', 'manage_rules', 'manage_products', 'view_alerts', 'manage_accounts', 'manage_datasources', 'manage_users'], created_at: '2023-01-01' },
        { role_id: 'R003', role_key: 'company_user', role_name: '公司用户', color: 'info', level: 60, is_system: true, permissions: ['view_dashboard', 'manage_rules', 'manage_products', 'view_alerts'], created_at: '2023-01-01' },
        { role_id: 'R004', role_key: 'viewer', role_name: '只读用户', color: 'secondary', level: 20, is_system: true, permissions: ['view_dashboard', 'view_alerts'], created_at: '2023-01-01' }
    ],

    // 角色ID计数器
    roleIdCounter: 5,

    // 权限定义
    permissionDefinitions: [
        { key: 'view_dashboard', menu_key: 'dashboard', name: '查看仪表盘', menu: 'Dashboard', icon: '<i data-lucide="layout-dashboard"></i>' },
        { key: 'manage_rules', menu_key: 'rules_manage', name: '管理规则', menu: '规则管理', icon: '<i data-lucide="cog"></i>' },
        { key: 'manage_products', menu_key: 'product_mapping', name: '管理产品映射', menu: '产品映射', icon: '<i data-lucide="package"></i>' },
        { key: 'view_alerts', menu_key: 'alert_records', name: '查看告警', menu: '告警记录', icon: '<i data-lucide="bell"></i>' },
        { key: 'manage_accounts', menu_key: 'account_management', name: '管理账户', menu: '账户管理', icon: '<i data-lucide="users"></i>' },
        { key: 'manage_companies', menu_key: 'company_management', name: '管理公司', menu: '公司管理', icon: '<i data-lucide="building-2"></i>' },
        { key: 'manage_datasources', menu_key: 'datasource_management', name: '管理数据源', menu: '数据源管理', icon: '<i data-lucide="plug"></i>' },
        { key: 'manage_users', menu_key: 'user_management', name: '管理用户', menu: '用户管理', icon: '<i data-lucide="user"></i>' },
        { key: 'manage_roles', menu_key: 'role_management', name: '管理角色', menu: '角色管理', icon: '<i data-lucide="lock"></i>' },
        { key: 'manage_settings', menu_key: 'global_config', name: '管理配置', menu: '全局配置', icon: '<i data-lucide="wrench"></i>' }
    ],

    // 角色管理方法
    addRole(roleData) {
        var newRole = {
            role_id: 'R' + String(this.roleIdCounter++).padStart(3, '0'),
            role_key: roleData.role_key,
            role_name: roleData.role_name,
            color: roleData.color || 'primary',
            level: roleData.level || 50,
            is_system: false,
            permissions: roleData.permissions || [],
            created_at: new Date().toISOString().split('T')[0]
        };
        this.roles.push(newRole);
        return newRole;
    },

    updateRole(roleId, roleData) {
        var role = this.roles.find(function (r) { return r.role_id === roleId; });
        if (role) {
            if (roleData.role_name) role.role_name = roleData.role_name;
            if (roleData.role_key) role.role_key = roleData.role_key;
            if (roleData.color) role.color = roleData.color;
            if (roleData.hasOwnProperty('level')) role.level = roleData.level;
            if (roleData.permissions) role.permissions = roleData.permissions;
            return role;
        }
        return null;
    },

    deleteRole(roleId) {
        var role = this.roles.find(function (r) { return r.role_id === roleId; });
        if (role && role.is_system) {
            return false; // 不能删除系统角色
        }
        var index = this.roles.findIndex(function (r) { return r.role_id === roleId; });
        if (index > -1) {
            this.roles.splice(index, 1);
            return true;
        }
        return false;
    },

    getRoleByKey(roleKey) {
        return this.roles.find(function (r) { return r.role_key === roleKey; });
    }
};

// 权限系统
var Permissions = {
    // 兼容旧的静态roles（动态获取）
    get roles() {
        var rolesMap = {};
        MockData.roles.forEach(function (r) {
            rolesMap[r.role_key] = { name: r.role_name, color: r.color, level: r.level };
        });
        return rolesMap;
    },

    can: function (user, action) {
        if (!user) return false;
        var role = MockData.getRoleByKey(user.role);
        if (!role) return false;
        return role.permissions.indexOf(action) >= 0;
    },

    hasPermission: function (user, permissionKey) {
        return this.can(user, permissionKey);
    },

    isReadOnly: function (user) {
        return user && user.role === 'viewer';
    },

    isSuperAdmin: function (user) {
        return user && user.role === 'super_admin';
    },

    canManageRoles: function (user) {
        return this.can(user, 'manage_roles');
    },

    getUserPermissions: function (user) {
        if (!user) return [];
        var role = MockData.getRoleByKey(user.role);
        return role ? role.permissions : [];
    }
};

// 辅助函数
var Utils = {
    formatCurrency: function (value, currency) {
        currency = currency || 'USD';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value);
    },
    formatNumber: function (value) {
        return new Intl.NumberFormat('en-US').format(value);
    },
    formatDateTime: function (dateStr) {
        return new Date(dateStr).toLocaleString('zh-CN');
    },
    getStatusClass: function (status) {
        var map = { new: 'danger', reviewed: 'success', ignored: 'warning', active: 'success', suspended: 'danger', inactive: 'secondary' };
        return map[status] || 'info';
    },
    getRiskClass: function (risk) {
        var map = { high: 'danger', medium: 'warning', low: 'success' };
        return map[risk] || 'info';
    },
    getSourceName: function (sourceId) {
        var ds = MockData.dataSources.find(function (d) { return d.source_id === sourceId; });
        return ds ? ds.source_name : sourceId;
    },
    getCompanyName: function (companyId) {
        var c = MockData.companies.find(function (c) { return c.company_id === companyId; });
        return c ? c.company_name : companyId;
    }
};
