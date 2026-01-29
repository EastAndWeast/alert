// Dashboard 模块

var DashboardModule = {
    updateTimer: null,
    trendChart: null,
    distChart: null,

    render: function () {
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var stats = MockData.getStatistics(sourceIds);
        var alerts = MockData.filterBySource(MockData.alerts, sourceIds);

        var companyInfo = '';
        if (user && user.company_id) {
            companyInfo = '<span class="badge badge-info" style="margin-left: 8px;">' + Utils.getCompanyName(user.company_id) + '</span>';
        } else if (Permissions.isSuperAdmin(user)) {
            companyInfo = '<span class="badge badge-danger" style="margin-left: 8px;">' + I18n.t('global_view') + '</span>';
        }

        return '\
            <div class="grid grid-4">\
                <div class="stat-card danger">\
                    <div class="stat-icon">🔔</div>\
                    <div class="stat-value">' + stats.today_alerts + '</div>\
                    <div class="stat-label">' + I18n.t('today_alerts') + '</div>\
                </div>\
                <div class="stat-card success">\
                    <div class="stat-icon">⚙️</div>\
                    <div class="stat-value">' + stats.active_rules + '</div>\
                    <div class="stat-label">' + I18n.t('active_rules') + '</div>\
                </div>\
                <div class="stat-card info">\
                    <div class="stat-icon">👥</div>\
                    <div class="stat-value">' + stats.monitored_accounts + '</div>\
                    <div class="stat-label">' + I18n.t('monitored_accounts') + '</div>\
                </div>\
                <div class="stat-card warning">\
                    <div class="stat-icon">📈</div>\
                    <div class="stat-value">' + stats.total_trades_today + '</div>\
                    <div class="stat-label">' + I18n.t('today_trades') + '</div>\
                </div>\
            </div>\
            <div class="grid grid-2" style="margin-top: var(--spacing-lg);">\
                <div class="card">\
                    <div class="card-header">\
                        <h3 class="card-title">📊 ' + I18n.t('alert_trend') + companyInfo + '</h3>\
                    </div>\
                    <div class="card-body">\
                        <div class="chart-container">\
                            <canvas id="alertTrendChart"></canvas>\
                        </div>\
                    </div>\
                </div>\
                <div class="card">\
                    <div class="card-header">\
                        <h3 class="card-title">🎯 ' + I18n.t('rule_dist') + '</h3>\
                    </div>\
                    <div class="card-body">\
                        <div class="chart-container">\
                            <canvas id="ruleDistChart"></canvas>\
                        </div>\
                    </div>\
                </div>\
            </div>\
            <div class="grid grid-2" style="margin-top: var(--spacing-lg);">\
                <div class="card">\
                    <div class="card-header">\
                        <h3 class="card-title">🔔 ' + I18n.t('latest_alerts') + '</h3>\
                        <a href="#alerts" class="btn btn-sm btn-secondary">' + I18n.t('view_all') + '</a>\
                    </div>\
                    <div class="card-body" style="padding: 0;">\
                        <div class="table-container">\
                            <table class="table">\
                                <thead>\
                                    <tr>\
                                        <th>' + I18n.t('rule_type_header') + '</th>\
                                        <th>' + I18n.t('account_header') + '</th>\
                                        <th>' + I18n.t('data_source_header') + '</th>\
                                        <th>' + I18n.t('time_header') + '</th>\
                                        <th>' + I18n.t('status_header') + '</th>\
                                    </tr>\
                                </thead>\
                                <tbody>' + this.renderAlertRows(alerts.slice(0, 5)) + '</tbody>\
                            </table>\
                        </div>\
                    </div>\
                </div>\
                <div class="card">\
                    <div class="card-header">\
                        <h3 class="card-title">📊 ' + I18n.t('platform_volume') + '</h3>\
                    </div>\
                    <div class="card-body">\
                        <div class="chart-container">\
                            <canvas id="platformChart"></canvas>\
                        </div>\
                    </div>\
                </div>\
            </div>';
    },

    renderAlertRows: function (alerts) {
        if (alerts.length === 0) {
            return '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">' + I18n.t('no_alerts') + '</td></tr>';
        }
        return alerts.map(function (alert) {
            return '\
                <tr>\
                    <td><span class="badge badge-' + Utils.getStatusClass(alert.status) + '">' + I18n.t(alert.rule_type) + '</span></td>\
                    <td>' + alert.account_id + '</td>\
                    <td>' + Utils.getSourceName(alert.source_id) + '</td>\
                    <td>' + alert.trigger_time.split(' ')[1] + '</td>\
                    <td><span class="status-dot ' + (alert.status === 'new' ? 'danger' : 'active') + '"></span>' + I18n.t('status_' + alert.status) + '</td>\
                </tr>';
        }).join('');
    },

    initCharts: function () {
        var self = this;
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var stats = MockData.getStatistics(sourceIds);

        if (this.updateTimer) clearInterval(this.updateTimer);

        var trendCtx = document.getElementById('alertTrendChart');
        if (trendCtx) {
            this.trendChart = new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: stats.alerts_trend.map(function (d) { return d.date; }),
                    datasets: [{
                        label: I18n.t('alert_count'),
                        data: stats.alerts_trend.map(function (d) { return d.count; }),
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        var distCtx = document.getElementById('ruleDistChart');
        if (distCtx) {
            var alertsByType = stats.alerts_by_type;
            this.distChart = new Chart(distCtx, {
                type: 'doughnut',
                data: {
                    labels: [
                        I18n.t('large_trade_lots'),
                        I18n.t('large_trade_usd'),
                        I18n.t('liquidity_trade'),
                        I18n.t('scalping'),
                        I18n.t('exposure_alert'),
                        I18n.t('pricing_volatility'),
                        I18n.t('nop_limit'),
                        I18n.t('watch_list'),
                        I18n.t('reverse_positions'),
                        I18n.t('deposit_withdrawal')
                    ],
                    datasets: [{
                        data: [
                            alertsByType.large_trade_lots || 0,
                            alertsByType.large_trade_usd || 0,
                            alertsByType.liquidity_trade || 0,
                            alertsByType.scalping || 0,
                            alertsByType.exposure_alert || 0,
                            alertsByType.pricing_volatility || 0,
                            alertsByType.nop_limit || 0,
                            alertsByType.watch_list || 0,
                            alertsByType.reverse_positions || 0,
                            alertsByType.deposit_withdrawal || 0
                        ],
                        backgroundColor: ['#ef4444', '#f97316', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#6366f1', '#ec4899', '#14b8a6', '#10b981'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10, padding: 10, font: { size: 10 } } } }
                }
            });
        }

        var platformCtx = document.getElementById('platformChart');
        if (platformCtx) {
            new Chart(platformCtx, {
                type: 'bar',
                data: {
                    labels: ['MT4', 'MT5'],
                    datasets: [{
                        label: I18n.t('trade_volume_usd'),
                        data: [stats.platform_volume.MT4, stats.platform_volume.MT5],
                        backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(16, 185, 129, 0.8)']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                        y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#94a3b8' } }
                    }
                }
            });
        }

        this.updateTimer = setInterval(function () {
            self.simulateDataUpdate();
        }, 3000);
    },

    simulateDataUpdate: function () {
        if (this.trendChart) {
            var data = this.trendChart.data.datasets[0].data;
            var lastIdx = data.length - 1;
            data[lastIdx] += Math.floor(Math.random() * 3) - 1;
            if (data[lastIdx] < 0) data[lastIdx] = 0;
            this.trendChart.update('none');
        }

        if (this.distChart) {
            var data = this.distChart.data.datasets[0].data;
            var randomIdx = Math.floor(Math.random() * data.length);
            data[randomIdx] += Math.floor(Math.random() * 2);
            this.distChart.update('none');
        }
    }
};
