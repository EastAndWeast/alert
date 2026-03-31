// IP 风控规则模块 - Black List / Fake IP / Position Hedge (IP)
// 基于现有 RulesModule 架构风格开发，保持代码一致性

var RulesIPModule = {

    // =============================================
    // 模拟数据
    // =============================================
    blacklistData: [
        { id: 'BL001', type: 'IP', value: '45.33.32.156', reason: '2025年恶意对冲套利，同一IP下多账号反向开仓', addedBy: 'admin', addedAt: '2025-12-10 09:21', status: 'active' },
        { id: 'BL002', type: 'IP', value: '103.224.182.240', reason: '数据中心IP，疑似使用云主机伪装本地交易', addedBy: 'risk_manager', addedAt: '2026-01-05 14:30', status: 'active' },
        { id: 'BL003', type: 'CID', value: 'C-889923', reason: '多次恶意刷返佣，累计损失 $12,400', addedBy: 'admin', addedAt: '2026-02-18 11:05', status: 'active' },
        { id: 'BL004', type: 'CID', value: 'C-334411', reason: '异常Scalping行为，持仓时间平均 <3秒', addedBy: 'risk_manager', addedAt: '2026-03-01 16:42', status: 'active' },
        { id: 'BL005', type: 'IP', value: '198.199.77.88', reason: 'DigitalOcean 数据中心节点，多租户共用IP', addedBy: 'admin', addedAt: '2026-03-15 08:00', status: 'active' }
    ],

    fakeIPConfig: {
        blockDatacenters: true,
        roamingDetection: true,
        exemptAccounts: ['10001', '10002', 'ADMIN_TEST'],
        trustedLocations: [
            { account: 'C-556677', city: 'Sydney', country: 'AU', ip: '203.11.48.12', addedAt: '2026-03-20', note: '客户确认在澳洲出差' },
            { account: 'C-112233', city: 'London', country: 'GB', ip: '82.132.210.55', addedAt: '2026-03-22', note: '长期居住英国' }
        ]
    },

    hedgeIPConfig: {
        analysisTimeframe: 3600,
        symbolFilter: [],
        minLots: 0.1
    },

    hedgeMockAlerts: [
        { id: 'HD001', ip: '45.76.120.33', accountA: '801234', accountB: '801235', symbol: 'EURUSD', lotsA: 2.0, lotsB: 1.5, dirA: 'BUY', dirB: 'SELL', timeDiff: 8, detectedAt: '2026-03-30 10:23:11', status: 'UNRESOLVED' },
        { id: 'HD002', ip: '103.55.18.77', accountA: '920001', accountB: '920007', symbol: 'XAUUSD', lotsA: 5.0, lotsB: 5.0, dirA: 'SELL', dirB: 'BUY', timeDiff: 2, detectedAt: '2026-03-29 15:44:02', status: 'CONFIRMED' },
        { id: 'HD003', ip: '192.168.10.5', accountA: '770100', accountB: '770101', symbol: 'GBPUSD', lotsA: 1.0, lotsB: 1.0, dirA: 'BUY', dirB: 'SELL', timeDiff: 45, detectedAt: '2026-03-28 09:11:58', status: 'FALSE_POSITIVE' }
    ],

    fakeIPAlerts: [
        { id: 'FIP001', account: 'C-334555', ip: '104.21.66.33', resolvedCity: 'San Francisco', resolvedCountry: 'US', registeredCountry: 'CN', ispType: 'Cloudflare CDN', detectedAt: '2026-03-30 08:12:55', status: 'UNRESOLVED' },
        { id: 'FIP002', account: 'C-556677', ip: '203.11.48.12', resolvedCity: 'Sydney', resolvedCountry: 'AU', registeredCountry: 'CN', ispType: 'Residential', detectedAt: '2026-03-29 22:05:10', status: 'TRUSTED' },
        { id: 'FIP003', account: 'C-789900', ip: '165.22.187.44', resolvedCity: 'Frankfurt', resolvedCountry: 'DE', registeredCountry: 'CN', ispType: 'DigitalOcean Data Center', detectedAt: '2026-03-29 14:55:43', status: 'CONFIRMED' }
    ],

    // =============================================
    // 1. Blacklist — 已迁移至 RulesModule 原生引擎
    // =============================================
    // renderBlacklist(), showAddBlacklistModal(), saveBlacklist(), removeBlacklist()
    // 已废弃。路由现在指向 RulesModule.renderRulePage('blacklist')。
    // 数据同步请直接操作 MockData.rules (rule_type: 'blacklist')。

    // =============================================
    // 2. Fake IP 处理逻辑 (UI 已由 RulesModule 接管)
    // =============================================
    // 原 renderFakeIP 已由 RulesModule.renderRulePage('fake_ip') 代替

    trustLocation(alertId) {
        var alert = this.fakeIPAlerts.find(function(a){ return a.id === alertId; });
        if (!alert) return;
        alert.status = 'TRUSTED';
        this.fakeIPConfig.trustedLocations.push({ account: alert.account, city: alert.resolvedCity, country: alert.resolvedCountry, ip: alert.ip, addedAt: new Date().toISOString().slice(0,10), note: I18n.t('trusted_by_operator') });
        App.showToast('success', alert.account + ' ' + I18n.t('location_trusted_msg') + ' ' + alert.resolvedCity);
        Router.refresh();
    },

    confirmRisk(alertId) {
        var alert = this.fakeIPAlerts.find(function(a){ return a.id === alertId; });
        if (!alert) return;
        alert.status = 'CONFIRMED';
        App.showToast('warning', I18n.t('risk_confirmed_msg'));
        Router.refresh();
    },

    removeTrustedLocation(index) {
        if (!confirm(I18n.t('tl_remove_confirm'))) return;
        this.fakeIPConfig.trustedLocations.splice(index, 1);
        App.showToast('success', I18n.t('tl_removed'));
        Router.refresh();
    },

    // =============================================
    // 3. Position Hedge 处理逻辑 (UI 已由 RulesModule 接管)
    // =============================================
    // 原 renderHedgeIP 已由 RulesModule.renderRulePage('hedge_ip') 代替

    confirmHedge(id) {
        var a = this.hedgeMockAlerts.find(function(x){ return x.id === id; });
        if (a) { a.status = 'CONFIRMED'; App.showToast('warning', I18n.t('risk_confirmed_msg')); Router.refresh(); }
    },

    dismissHedge(id) {
        var a = this.hedgeMockAlerts.find(function(x){ return x.id === id; });
        if (a) { a.status = 'FALSE_POSITIVE'; App.showToast('success', I18n.t('marked_false_positive')); Router.refresh(); }
    },

    // =============================================
    // 工具方法
    // =============================================
    _statMini(label, value, icon, color) {
        return '<div class="stat-card" style="padding:16px;">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;">' +
            '<div><div style="font-size:24px;font-weight:700;color:var(--color-' + color + ');">' + value + '</div>' +
            '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' + label + '</div></div>' +
            '<span class="stat-icon color-' + color + '"><i data-lucide="' + icon + '"></i></span>' +
            '</div></div>';
    }
};
