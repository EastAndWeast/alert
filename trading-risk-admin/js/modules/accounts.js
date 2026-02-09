// 账户管理模块

var AccountsModule = {
    filters: {
        company: 'all',
        datasource: 'all',
        platform: 'all'
    },

    render: function () {
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var companies = MockData.companies;
        var dataSources = MockData.filterBySource(MockData.dataSources, sourceIds);
        var filteredAccounts = this.getFilteredAccounts(sourceIds);
        var self = this;

        var html = '<div class="filter-bar">';

        // 公司筛选
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('company_label') + '：</span>';
        html += '<select class="filter-select" id="companyFilter" onchange="AccountsModule.applyFilters()">';
        html += '<option value="all">' + I18n.t('all_companies') + '</option>';
        companies.forEach(function (c) {
            html += '<option value="' + c.company_id + '" ' + (self.filters.company === c.company_id ? 'selected' : '') + '>' + c.company_name + '</option>';
        });
        html += '</select></div>';

        // 数据源筛选
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('datasource_label') + '：</span>';
        html += '<select class="filter-select" id="datasourceFilter" onchange="AccountsModule.applyFilters()">';
        html += '<option value="all">' + I18n.t('all_datasources') + '</option>';
        dataSources.forEach(function (ds) {
            html += '<option value="' + ds.source_id + '" ' + (self.filters.datasource === ds.source_id ? 'selected' : '') + '>' + ds.source_name + '</option>';
        });
        html += '</select></div>';

        // 平台筛选
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('platform_label') + '：</span>';
        html += '<select class="filter-select" id="platformFilter" onchange="AccountsModule.applyFilters()">';
        html += '<option value="all" ' + (self.filters.platform === 'all' ? 'selected' : '') + '>' + I18n.t('all_platforms') + '</option>';
        html += '<option value="MT4" ' + (self.filters.platform === 'MT4' ? 'selected' : '') + '>MT4</option>';
        html += '<option value="MT5" ' + (self.filters.platform === 'MT5' ? 'selected' : '') + '>MT5</option>';
        html += '</select></div>';

        html += '</div>';

        // 统计卡片
        var totalAlerts = filteredAccounts.reduce(function (sum, a) { return sum + a.alert_count; }, 0);
        html += '<div class="grid grid-2" style="margin-bottom: var(--spacing-lg);">';
        html += '<div class="stat-card"><div class="stat-icon">👥</div><div class="stat-value">' + filteredAccounts.length + '</div><div class="stat-label">' + I18n.t('total_accounts') + '</div></div>';
        html += '<div class="stat-card warning"><div class="stat-icon">🔔</div><div class="stat-value">' + totalAlerts + '</div><div class="stat-label">' + I18n.t('total_alerts') + '</div></div>';
        html += '</div>';

        // 账户表格
        html += '<div class="card"><div class="card-header"><h3 class="card-title">👥 ' + I18n.t('trading_account_management') + '</h3></div>';
        html += '<div class="card-body" style="padding: 0;"><div class="table-container"><table class="table"><thead><tr>';
        html += '<th>' + I18n.t('account_id_header') + '</th>';
        html += '<th>' + I18n.t('company_header') + '</th>';
        html += '<th>' + I18n.t('datasource_header') + '</th>';
        html += '<th>' + I18n.t('platform_header') + '</th>';
        html += '<th>' + I18n.t('currency_header') + '</th>';
        html += '<th>' + I18n.t('balance_header') + '</th>';
        html += '<th>' + I18n.t('equity_header') + '</th>';
        html += '<th>' + I18n.t('margin_level_header') + '</th>';
        html += '<th>' + I18n.t('alert_count_header') + '</th>';
        html += '<th>' + I18n.t('actions_header') + '</th>';
        html += '</tr></thead><tbody>';

        filteredAccounts.forEach(function (acc) {
            var source = MockData.dataSources.find(function (ds) { return ds.source_id === acc.source_id; });
            var companyName = source ? Utils.getCompanyName(source.company_id) : '-';
            var sourceName = source ? source.source_name : '-';

            html += '<tr>';
            html += '<td><code>' + acc.account_id + '</code></td>';
            html += '<td><span class="badge badge-secondary">' + companyName + '</span></td>';
            html += '<td><span class="badge badge-info">' + sourceName + '</span></td>';
            html += '<td><span class="badge badge-' + (acc.platform === 'MT4' ? 'primary' : 'success') + '">' + acc.platform + '</span></td>';
            html += '<td>' + acc.account_currency + '</td>';
            html += '<td>' + self.formatBalance(acc.balance, acc.account_currency) + '</td>';
            html += '<td>' + self.formatBalance(acc.equity, acc.account_currency) + '</td>';
            html += '<td><span class="badge badge-' + (acc.margin_level > 500 ? 'success' : acc.margin_level > 300 ? 'warning' : 'danger') + '">' + acc.margin_level + '%</span></td>';
            html += '<td>' + (acc.alert_count > 0 ? '<span class="badge badge-danger">' + acc.alert_count + '</span>' : '-') + '</td>';
            html += '<td><button class="btn btn-sm btn-secondary" onclick="AccountsModule.viewAccount(\'' + acc.account_id + '\')">' + I18n.t('view') + '</button></td>';
            html += '</tr>';
        });

        html += '</tbody></table></div></div></div>';
        return html;
    },

    getFilteredAccounts: function (sourceIds) {
        var self = this;
        return MockData.accounts.filter(function (acc) {
            // 权限过滤
            if (sourceIds.indexOf(acc.source_id) === -1) return false;

            // 平台过滤
            if (self.filters.platform !== 'all' && acc.platform !== self.filters.platform) return false;

            // 数据源过滤
            if (self.filters.datasource !== 'all' && acc.source_id !== self.filters.datasource) return false;

            // 公司过滤
            if (self.filters.company !== 'all') {
                var source = MockData.dataSources.find(function (ds) { return ds.source_id === acc.source_id; });
                if (!source || source.company_id !== self.filters.company) return false;
            }

            return true;
        });
    },

    applyFilters: function () {
        this.filters.company = document.getElementById('companyFilter').value;
        this.filters.datasource = document.getElementById('datasourceFilter').value;
        this.filters.platform = document.getElementById('platformFilter').value;
        App.refresh();
    },

    formatBalance: function (value, currency) {
        if (currency === 'JPY') return '¥' + Utils.formatNumber(value);
        return Utils.formatCurrency(value, currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : currency === 'GBP' ? 'GBP' : 'USD');
    },

    viewAccount: function (accountId) {
        var acc = MockData.accounts.find(function (a) { return a.account_id === accountId; });
        var alerts = MockData.alerts.filter(function (a) { return a.account_id === accountId; });

        if (acc) {
            var html = '<div class="grid grid-2" style="gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">';
            html += '<div class="param-item"><div class="param-label">' + I18n.t('platform_label') + '</div><div class="param-value">' + acc.platform + '</div></div>';
            html += '<div class="param-item"><div class="param-label">' + I18n.t('currency_label') + '</div><div class="param-value">' + acc.account_currency + '</div></div>';
            html += '<div class="param-item"><div class="param-label">' + I18n.t('balance_label') + '</div><div class="param-value">' + this.formatBalance(acc.balance, acc.account_currency) + '</div></div>';
            html += '<div class="param-item"><div class="param-label">' + I18n.t('equity_label') + '</div><div class="param-value">' + this.formatBalance(acc.equity, acc.account_currency) + '</div></div>';
            html += '<div class="param-item"><div class="param-label">' + I18n.t('margin_level_label') + '</div><div class="param-value">' + acc.margin_level + '%</div></div>';
            html += '<div class="param-item"><div class="param-label">' + I18n.t('created_date_label') + '</div><div class="param-value">' + acc.created_at + '</div></div>';
            html += '</div>';

            html += '<h4 style="margin-bottom: var(--spacing-md); color: var(--text-secondary);">' + I18n.t('recent_alerts') + ' (' + alerts.length + ')</h4>';

            if (alerts.length > 0) {
                html += '<div style="max-height: 200px; overflow-y: auto;">';
                alerts.slice(0, 5).forEach(function (a) {
                    html += '<div style="padding: var(--spacing-sm); background: var(--bg-tertiary); border-radius: var(--border-radius-sm); margin-bottom: var(--spacing-sm);">';
                    html += '<div style="display: flex; justify-content: space-between;">';
                    html += '<span class="badge badge-danger">' + a.rule_type + '</span>';
                    html += '<span style="color: var(--text-muted); font-size: 12px;">' + a.trigger_time + '</span>';
                    html += '</div></div>';
                });
                html += '</div>';
            } else {
                html += '<div style="color: var(--text-muted);">' + I18n.t('no_alerts') + '</div>';
            }

            App.showModal(I18n.t('account_detail_title') + ' - ' + accountId, html);
        }
    }
};
