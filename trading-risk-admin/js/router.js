// 路由管理

var Router = {
    routes: {
        'dashboard': { title: 'dashboard', breadcrumb: 'dashboard', render: function () { return DashboardModule.render(); }, init: function () { DashboardModule.initCharts(); } },
        'rules-large-trade-lots': { title: 'large_trade_lots', breadcrumb: 'rules_manage / large_trade_lots', render: function () { return RulesModule.renderLargeTradeLots(); } },
        'rules-large-trade-usd': { title: 'large_trade_usd', breadcrumb: 'rules_manage / large_trade_usd', render: function () { return RulesModule.renderLargeTradeUSD(); } },
        'rules-liquidity': { title: 'liquidity_trade', breadcrumb: 'rules_manage / liquidity_trade', render: function () { return RulesModule.renderLiquidity(); } },
        'rules-scalping': { title: 'scalping', breadcrumb: 'rules_manage / scalping', render: function () { return RulesModule.renderScalping(); } },
        'rules-exposure': { title: 'exposure_alert', breadcrumb: 'rules_manage / exposure_alert', render: function () { return RulesModule.renderExposure(); } },
        'rules-pricing': { title: 'pricing_volatility', breadcrumb: 'rules_manage / pricing_volatility', render: function () { return RulesModule.renderPricing(); } },
        'rules-nop': { title: 'nop_limit', breadcrumb: 'rules_manage / nop_limit', render: function () { return RulesModule.renderNOP(); } },
        'rules-watchlist': { title: 'watch_list', breadcrumb: 'rules_manage / watch_list', render: function () { return RulesModule.renderWatchList(); } },
        'rules-reverse': { title: 'reverse_positions', breadcrumb: 'rules_manage / reverse_positions', render: function () { return RulesModule.renderReverse(); } },
        'rules-deposit': { title: 'deposit_withdrawal', breadcrumb: 'rules_manage / deposit_withdrawal', render: function () { return RulesModule.renderDeposit(); } },
        'products': { title: 'product_category_mapping', breadcrumb: 'product_category_mapping', render: function () { return ProductsModule.render(); } },
        'alerts': { title: 'alert_records', breadcrumb: 'monitoring_record', render: function () { return AlertsModule.render(); } },
        'accounts': { title: 'account_management', breadcrumb: 'trading_account', render: function () { return AccountsModule.render(); } },
        'companies': { title: 'company_management', breadcrumb: 'multi_tenant / company_management', render: function () { return CompaniesModule.render(); }, permission: 'manage_companies' },
        'datasources': { title: 'datasource_management', breadcrumb: 'multi_tenant / datasource_management', render: function () { return DatasourcesModule.render(); }, permission: 'manage_datasources' },
        'users': { title: 'user_management', breadcrumb: 'multi_tenant / user_management', render: function () { return UsersModule.render(); }, permission: 'manage_users' },
        'roles': { title: 'role_management', breadcrumb: 'multi_tenant / role_management', render: function () { return RolesModule.render(); }, permission: 'manage_roles' },
        'settings': { title: 'global_config', breadcrumb: 'param_config', render: function () { return SettingsModule.render(); } },
        'profile': { title: 'profile', breadcrumb: 'user_center / profile', render: function () { return ProfileModule.render(); } },
        'audit': { title: 'audit_logs', breadcrumb: 'system_manage / audit_logs', render: function () { return AuditModule.render(); }, permission: 'manage_settings' }
    },

    currentRoute: 'dashboard',

    init: function () {
        var self = this;
        window.addEventListener('hashchange', function () { self.handleRoute(); });
        this.handleRoute();
    },

    handleRoute: function () {
        var hash = window.location.hash.slice(1) || 'dashboard';
        this.navigateTo(hash);
    },

    navigateTo: function (route) {
        var config = this.routes[route];
        if (!config) {
            route = 'dashboard';
            config = this.routes[route];
        }

        // 权限检查
        if (config.permission && !Permissions.can(MockData.currentUser, config.permission)) {
            route = 'dashboard';
            config = this.routes[route];
            App.showToast('warning', I18n.t('no_permission_warning'));
        }

        this.currentRoute = route;

        // 更新标题和面包屑
        document.getElementById('pageTitle').textContent = I18n.t(config.title);
        var breadcrumbParts = config.breadcrumb.split(' / ');
        var breadcrumbHtml = '<span>' + I18n.t('home') + '</span>';
        for (var i = 0; i < breadcrumbParts.length; i++) {
            breadcrumbHtml += '<span class="breadcrumb-sep">/</span>';
            breadcrumbHtml += '<span class="' + (i === breadcrumbParts.length - 1 ? 'breadcrumb-current' : '') + '">' + I18n.t(breadcrumbParts[i]) + '</span>';
        }
        document.getElementById('breadcrumb').innerHTML = breadcrumbHtml;

        // 更新导航状态
        var navLinks = document.querySelectorAll('.nav-link');
        for (var j = 0; j < navLinks.length; j++) {
            navLinks[j].classList.remove('active');
            if (navLinks[j].dataset.page === route) {
                navLinks[j].classList.add('active');
            }
        }

        // 渲染内容
        document.getElementById('contentWrapper').innerHTML = config.render();

        // 执行初始化函数
        if (config.init) {
            setTimeout(config.init, 100);
        }
    },

    refresh: function () {
        this.navigateTo(this.currentRoute);
    }
};
