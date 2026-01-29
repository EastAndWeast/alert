// 账户管理模块

const AccountsModule = {
    render() {
        return `
            <div class="filter-bar">
                <div class="filter-group">
                    <span class="filter-label">${I18n.t('platform_label')}：</span>
                    <select class="filter-select" id="platformFilter">
                        <option value="all">${I18n.t('all_platforms')}</option>
                        <option value="MT4">MT4</option>
                        <option value="MT5">MT5</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-2" style="margin-bottom: var(--spacing-lg);">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-value">${MockData.accounts.length}</div>
                    <div class="stat-label">${I18n.t('total_accounts')}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-icon">🔔</div>
                    <div class="stat-value">${MockData.accounts.reduce((sum, a) => sum + a.alert_count, 0)}</div>
                    <div class="stat-label">${I18n.t('total_alerts')}</div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">👥 ${I18n.t('trading_account_management')}</h3>
                </div>
                <div class="card-body" style="padding: 0;">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>${I18n.t('account_id_header')}</th>
                                    <th>${I18n.t('platform_header')}</th>
                                    <th>${I18n.t('currency_header')}</th>
                                    <th>${I18n.t('balance_header')}</th>
                                    <th>${I18n.t('equity_header')}</th>
                                    <th>${I18n.t('margin_level_header')}</th>
                                    <th>${I18n.t('alert_count_header')}</th>
                                    <th>${I18n.t('actions_header')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${MockData.accounts.map(acc => `
                                    <tr>
                                        <td><code>${acc.account_id}</code></td>
                                        <td><span class="badge badge-${acc.platform === 'MT4' ? 'primary' : 'success'}">${acc.platform}</span></td>
                                        <td>${acc.account_currency}</td>
                                        <td>${this.formatBalance(acc.balance, acc.account_currency)}</td>
                                        <td>${this.formatBalance(acc.equity, acc.account_currency)}</td>
                                        <td><span class="badge badge-${acc.margin_level > 500 ? 'success' : acc.margin_level > 300 ? 'warning' : 'danger'}">${acc.margin_level}%</span></td>
                                        <td>${acc.alert_count > 0 ? `<span class="badge badge-danger">${acc.alert_count}</span>` : '-'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-secondary" onclick="AccountsModule.viewAccount('${acc.account_id}')">${I18n.t('view')}</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    formatBalance(value, currency) {
        if (currency === 'JPY') return '¥' + Utils.formatNumber(value);
        return Utils.formatCurrency(value, currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : currency === 'GBP' ? 'GBP' : 'USD');
    },

    viewAccount(accountId) {
        const acc = MockData.accounts.find(a => a.account_id === accountId);
        const alerts = MockData.alerts.filter(a => a.account_id === accountId);
        if (acc) {
            App.showModal(`${I18n.t('account_detail_title')} - ${accountId}`, `
                <div class="grid grid-2" style="gap: var(--spacing-md); margin-bottom: var(--spacing-lg);">
                    <div class="param-item"><div class="param-label">${I18n.t('platform_label')}</div><div class="param-value">${acc.platform}</div></div>
                    <div class="param-item"><div class="param-label">${I18n.t('currency_label')}</div><div class="param-value">${acc.account_currency}</div></div>
                    <div class="param-item"><div class="param-label">${I18n.t('balance_label')}</div><div class="param-value">${this.formatBalance(acc.balance, acc.account_currency)}</div></div>
                    <div class="param-item"><div class="param-label">${I18n.t('equity_label')}</div><div class="param-value">${this.formatBalance(acc.equity, acc.account_currency)}</div></div>
                    <div class="param-item"><div class="param-label">${I18n.t('margin_level_label')}</div><div class="param-value">${acc.margin_level}%</div></div>
                    <div class="param-item"><div class="param-label">${I18n.t('created_date_label')}</div><div class="param-value">${acc.created_at}</div></div>
                </div>
                <h4 style="margin-bottom: var(--spacing-md); color: var(--text-secondary);">${I18n.t('recent_alerts')} (${alerts.length})</h4>
                ${alerts.length > 0 ? `
                    <div style="max-height: 200px; overflow-y: auto;">
                        ${alerts.slice(0, 5).map(a => `
                            <div style="padding: var(--spacing-sm); background: var(--bg-tertiary); border-radius: var(--border-radius-sm); margin-bottom: var(--spacing-sm);">
                                <div style="display: flex; justify-content: space-between;">
                                    <span class="badge badge-${AlertsModule.getRuleTypeColor(a.rule_type)}">${a.rule_type}</span>
                                    <span style="color: var(--text-muted); font-size: 12px;">${a.trigger_time}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `<div style="color: var(--text-muted);">${I18n.t('no_alerts')}</div>`}
            `);
        }
    }
};
