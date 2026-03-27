// 规则管理模块 - 10种新告警类型实现（含CRUD功能）

const RulesModule = {
    // 规则类型映射
    ruleTypes: {
        'large_trade_lots': { name: 'Large Trade (手数)', icon: '<i data-lucide="banknote"></i>', color: 'primary' },
        'large_trade_usd': { name: 'Large Trader (USD)', icon: '<i data-lucide="dollar-sign"></i>', color: 'success' },
        'liquidity_trade': { name: 'Liquidity Trade', icon: '<i data-lucide="waves"></i>', color: 'info' },
        'scalping': { name: 'Scalping', icon: '<i data-lucide="zap"></i>', color: 'warning' },
        'exposure_alert': { name: 'Exposure Alert', icon: '<i data-lucide="bar-chart-3"></i>', color: 'danger' },
        'pricing': { name: 'Pricing', icon: '<i data-lucide="clock"></i>', color: 'secondary' },
        'volatility': { name: 'Volatility', icon: '<i data-lucide="trending-up"></i>', color: 'warning' },
        'nop_limit': { name: 'NOP Limit', icon: '<i data-lucide="ruler"></i>', color: 'dark' },
        'watch_list': { name: 'Watch List', icon: '<i data-lucide="eye"></i>', color: 'primary' },
        'reverse_positions': { name: 'Reverse Positions', icon: '<i data-lucide="repeat"></i>', color: 'warning' },
        'deposit_withdrawal': { name: 'Deposit & Withdrawal', icon: '<i data-lucide="credit-card"></i>', color: 'success' }
    },

    // 规则ID计数器
    ruleIdCounter: 100,

    // 获取当前用户可见的规则
    getRulesByType(ruleType) {
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        return MockData.filterBySource(MockData.rules, sourceIds).filter(function (r) {
            return r.rule_type === ruleType;
        });
    },

    // 通用：渲染规则列表页面
    renderRulePage(ruleType, title, description, renderForm) {
        var rules = this.getRulesByType(ruleType);
        var typeInfo = this.ruleTypes[ruleType];
        var isReadOnly = Permissions.isReadOnly(MockData.currentUser);

        var html = '<div class="page-content">';
        html += '<div class="page-header">';
        html += '<div class="page-header-left">';
        html += '<span class="rule-icon-large color-' + typeInfo.color + '">' + typeInfo.icon + '</span>';
        html += '<div><h2>' + I18n.t(ruleType) + '</h2><p class="text-muted">' + I18n.t(ruleType + '_desc') + '</p></div>';
        html += '</div>';
        if (!isReadOnly) {
            html += '<div style="display:flex;gap:8px;align-items:center;">';
            html += '<button class="btn btn-primary" onclick="RulesModule.showAddRuleModal(\'' + ruleType + '\')"><i data-lucide="plus" style="width:14px;height:14px;vertical-align:-2px;"></i> ' + I18n.t('add_rule') + '</button>';
            if (rules.length > 0) {
                html += '<button class="btn btn-secondary" onclick="RulesModule.showBatchCloneModal(\'' + ruleType + '\')" title="批量克隆全部规则到其他服务器"><i data-lucide="copy-check" style="width:14px;height:14px;vertical-align:-2px;"></i> 批量克隆</button>';
            }
            html += '</div>';
        }
        html += '</div>';


        if (rules.length === 0) {
            html += this.renderNoRules(title);
        } else {
            html += '<div class="rules-grid">';
            for (var i = 0; i < rules.length; i++) {
                html += this.renderRuleCard(rules[i], ruleType);
            }
            html += '</div>';
        }

        html += this.renderAlertHistory(ruleType);
        html += '</div>';
        return html;
    },

    // 渲染规则卡片
    renderRuleCard(rule, ruleType) {
        var typeInfo = this.ruleTypes[ruleType];
        var isReadOnly = Permissions.isReadOnly(MockData.currentUser);
        var statusClass = rule.enabled ? 'success' : 'secondary';
        var statusText = rule.enabled ? I18n.t('running') : I18n.t('disabled');

        var html = '<div class="rule-card">';
        html += '<div class="rule-card-header">';
        html += '<div class="rule-title" style="align-items:flex-start;">';
        html += '<span class="rule-icon color-' + typeInfo.color + '" style="margin-top:2px;">' + typeInfo.icon + '</span>';
        html += '<div style="display:flex; flex-direction:column; line-height:1.2;">';
        html += '  <span style="font-size:16px; font-weight:600;">' + (rule.custom_name || I18n.t(rule.rule_type)) + '</span>';
        if (rule.custom_name) {
            html += '  <span style="font-size:12px; color:var(--text-muted); margin-top:4px;">' + I18n.t('rule_type_label') + ': ' + I18n.t(rule.rule_type) + '</span>';
        }
        html += '</div>';
        html += '</div>';
        html += '<span class="status-badge ' + statusClass + '">' + statusText + '</span>';
        html += '</div>';

        html += '<div class="rule-card-body">';
        html += '<p class="text-muted">' + I18n.t(rule.rule_type + '_desc') + '</p>';
        html += '<div class="rule-source"><strong>' + I18n.t('data_source') + '：</strong>' + Utils.getSourceName(rule.source_id) + '</div>';
        html += this.renderRuleParams(rule, ruleType);
        html += '</div>';

        html += '<div class="rule-card-footer">';
        html += '<div class="rule-stats">';
        html += '<span class="stat-item"><i data-lucide="bar-chart-3"></i> ' + I18n.t('triggered') + ': ' + rule.triggered_count + ' ' + I18n.t('times') + '</span>';
        html += '</div>';
        if (!isReadOnly) {
            html += '<div class="rule-actions">';
            html += '<button class="btn btn-sm btn-' + (rule.enabled ? 'warning' : 'success') + '" onclick="RulesModule.toggleRule(\'' + rule.rule_id + '\')">' + (rule.enabled ? I18n.t('disable') : I18n.t('enable')) + '</button>';
            html += '<button class="btn btn-sm btn-secondary" onclick="RulesModule.showEditRuleModal(\'' + rule.rule_id + '\')">' + I18n.t('edit') + '</button>';
            html += '<button class="btn btn-sm btn-info" onclick="RulesModule.showCloneModal(\'' + rule.rule_id + '\')" title="克隆此规则到其他服务器"><i data-lucide="copy" style="width:12px;height:12px;vertical-align:-1px;"></i> 克隆</button>';
            html += '<button class="btn btn-sm btn-danger" onclick="RulesModule.deleteRule(\'' + rule.rule_id + '\')">' + I18n.t('delete') + '</button>';
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';

        return html;
    },

    // 渲染规则参数摘要
    renderRuleParams(rule, ruleType) {
        var html = '<div class="rule-params">';
        var p = rule.parameters;

        switch (ruleType) {
            case 'large_trade_lots':
                html += '<div class="param-item"><strong>' + I18n.t('lot_threshold_label') + '：</strong>' + p.lot_threshold + ' ' + I18n.t('lot_unit') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('monitor_symbols_label') + '：</strong>' + (p.symbol_filter.length ? p.symbol_filter.join(', ') : I18n.t('all')) + '</div>';
                break;
            case 'large_trade_usd':
                html += '<div class="param-item" style="grid-column: 1 / -1;"><strong>📊 ' + I18n.t('standard_section') + '</strong></div>';
                html += '<div class="param-item"><strong>' + I18n.t('usd_threshold_label') + '：</strong>$' + Utils.formatNumber(p.usd_value_threshold) + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('monitor_symbols_label') + '：</strong>' + (p.symbol_filter && p.symbol_filter.length ? p.symbol_filter.join(', ') : I18n.t('all')) + '</div>';
                if (p.cent_enabled) {
                    html += '<div class="param-item" style="grid-column: 1 / -1; margin-top: 4px; border-top: 1px dashed var(--border-color); padding-top: 8px;"><strong>🔸 ' + I18n.t('cent_section') + '</strong></div>';
                    html += '<div class="param-item"><strong>' + I18n.t('cent_threshold_label') + '：</strong>$' + Utils.formatNumber(p.cent_threshold) + '</div>';
                    html += '<div class="param-item"><strong>' + I18n.t('cent_account_groups_label') + '：</strong>' + (p.cent_account_groups && p.cent_account_groups.length ? p.cent_account_groups.join(', ') : '-') + '</div>';
                    html += '<div class="param-item"><strong>' + I18n.t('cent_symbol_filter_label') + '：</strong>' + (p.cent_symbol_filter && p.cent_symbol_filter.length ? p.cent_symbol_filter.join(', ') : I18n.t('all')) + '</div>';
                }
                break;
            case 'liquidity_trade':
                html += '<div class="param-item"><strong>' + I18n.t('time_window_label') + '：</strong>' + p.time_window + ' ' + I18n.t('unit_seconds') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('min_order_count_label') + '：</strong>≥ ' + p.min_order_count + ' ' + I18n.t('unit_orders') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('total_lot_threshold_label') + '：</strong>' + p.total_lot_threshold + ' ' + I18n.t('unit_lots') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('monitor_symbols_label') + '：</strong>' + (p.monitoring_scope && p.monitoring_scope.length ? p.monitoring_scope.join(', ') : I18n.t('all')) + '</div>';
                break;
            case 'scalping':
                html += '<div class="param-item"><strong>' + I18n.t('duration_threshold_label') + '：</strong>< ' + p.duration_threshold + ' ' + I18n.t('unit_seconds') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('profit_usd_min_label') + '：</strong>$' + p.profit_usd_min + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('monitor_symbols_label') + '：</strong>' + (p.symbol_filter && p.symbol_filter.length ? p.symbol_filter.join(', ') : I18n.t('all')) + '</div>';
                break;
            case 'exposure_alert':
                html += '<div class="param-item"><strong>' + I18n.t('target_currency_label') + '：</strong>' + p.target_currency + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('exposure_threshold_label') + '：</strong>' + Utils.formatNumber(p.exposure_threshold) + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('time_interval_label') + '：</strong>' + p.time_interval + ' ' + I18n.t('unit_seconds') + '</div>';

                break;
            case 'pricing':
                var stopDur = p.stop_pricing_duration || (p.pricing && p.pricing.stop_pricing_duration);
                var pScope = p.pricing_scope || (p.pricing && p.pricing.scope);
                if (stopDur) {
                    html += '<div class="param-item"><strong>' + I18n.t('stop_pricing_duration_label') + '：</strong>' + stopDur + ' ' + I18n.t('unit_seconds') + '</div>';
                }
                html += '<div class="param-item"><strong>' + I18n.t('monitor_symbols_label') + '：</strong>' + (pScope && pScope.length ? pScope.join(', ') : I18n.t('all')) + '</div>';
                break;
            case 'volatility':
                var vMode = p.volatility_mode || (p.volatility && p.volatility.mode) || 'POINTS';
                var vTw = p.time_window || (p.volatility && p.volatility.time_window) || 'M1';
                var vThres = p.threshold_value || (p.volatility && p.volatility.threshold_value) || 500;
                var vScope = p.volatility_scope || (p.volatility && p.volatility.scope);

                html += '<div class="param-item"><strong>' + I18n.t('volatility_mode_label') + '：</strong>' + (vMode === 'PERCENTAGE' ? 'Percentage (%)' : 'Points') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('time_window_label') + '：</strong>' + vTw + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('max_fluctuation_label') + '：</strong>' + vThres + ' ' + (vMode === 'PERCENTAGE' ? '%' : 'Points') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('monitor_symbols_label') + '：</strong>' + (vScope && vScope.length ? vScope.join(', ') : I18n.t('all')) + '</div>';
                break;
            case 'nop_limit':

                html += '<div class="param-item"><strong>' + I18n.t('nop_threshold_label') + '：</strong>' + Utils.formatNumber(p.nop_threshold) + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('monitor_symbols_label') + '：</strong>' + (p.symbol_filter && p.symbol_filter.length ? p.symbol_filter.join(', ') : I18n.t('all')) + '</div>';
                break;
            case 'watch_list':
                html += '<div class="param-item"><strong>' + I18n.t('monitored_accounts_label') + '：</strong>' + p.watched_accounts.join(', ') + '</div>';
                var actions = [];
                if (p.monitoring_actions.indexOf('OPEN_TRADE') >= 0) actions.push(I18n.t('open_trade'));
                if (p.monitoring_actions.indexOf('PENDING_ORDER') >= 0) actions.push(I18n.t('pending_order'));
                html += '<div class="param-item"><strong>' + I18n.t('monitoring_actions_label') + '：</strong>' + actions.join(', ') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('min_lots_limit_label') + '：</strong>' + p.lots_min_limit + ' ' + I18n.t('lot_unit') + '</div>';
                break;
            case 'reverse_positions':
                html += '<div class="param-item"><strong>' + I18n.t('max_reverse_interval_label') + '：</strong>' + p.max_reverse_interval + ' ' + I18n.t('unit_seconds') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('min_reverse_lot_label') + '：</strong>' + p.min_reverse_lot + ' ' + I18n.t('lot_unit') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('min_reverse_value_usd_label') + '：</strong>$' + Utils.formatNumber(p.min_reverse_value_usd) + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('monitor_symbols_label') + '：</strong>' + (p.symbol_filter && p.symbol_filter.length ? p.symbol_filter.join(', ') : I18n.t('all')) + '</div>';
                break;
            case 'deposit_withdrawal':
                html += '<div class="param-item"><strong>' + I18n.t('deposit_threshold_label') + '：</strong>$' + Utils.formatNumber(p.deposit_threshold) + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('withdrawal_threshold_label') + '：</strong>$' + Utils.formatNumber(p.withdrawal_threshold) + '</div>';
                var keywordText = (p.include_keywords && p.include_keywords.length) ? p.include_keywords.join(', ') : I18n.t('all');
                html += '<div class="param-item"><strong>' + I18n.t('include_keywords_label') + '：</strong>' + keywordText + '</div>';
                break;
        }
        html += '</div>';
        return html;
    },

    // 渲染无规则提示
    renderNoRules(ruleName) {
        return '<div class="empty-state"><div class="empty-icon"><i data-lucide="inbox" style="width:48px;height:48px;stroke:var(--text-muted);"></i></div><h3>' + I18n.t('no_rules_prefix') + ' ' + ruleName + ' ' + I18n.t('no_rules_suffix') + '</h3><p>' + I18n.t('click_to_add_rule') + '</p></div>';
    },

    // 渲染告警历史
    renderAlertHistory(ruleType) {
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var alerts = MockData.filterBySource(MockData.alerts, sourceIds).filter(function (a) {
            return a.rule_type === ruleType;
        }).slice(0, 5);

        var html = '<div class="section-card mt-4">';
        html += '<div class="section-header"><h3><i data-lucide="clipboard-list"></i> ' + I18n.t('recent_alerts') + '</h3></div>';
        html += '<div class="section-body">';

        if (alerts.length === 0) {
            html += '<p class="text-muted text-center">' + I18n.t('no_alerts') + '</p>';
        } else {
            html += '<table class="data-table"><thead><tr>';
            html += '<th>' + I18n.t('time_header') + '</th><th>' + I18n.t('datasource_header') + '</th><th>' + I18n.t('account_header') + '</th><th>' + I18n.t('symbol_header') + '</th><th>' + I18n.t('triggered_value_header') + '</th><th>' + I18n.t('status_header') + '</th>';
            html += '</tr></thead><tbody>';
            for (var i = 0; i < alerts.length; i++) {
                var a = alerts[i];
                var statusClass = Utils.getStatusClass(a.status);
                html += '<tr>';
                html += '<td>' + a.trigger_time + '</td>';
                html += '<td><span class="badge badge-info">' + Utils.getSourceName(a.source_id) + '</span></td>';
                html += '<td>' + a.account_id + '</td>';
                html += '<td>' + a.product + '</td>';
                var triggerValue = this.formatTriggerValue(ruleType, a.trigger_value, a);
                html += '<td class="trigger-value-cell" title="' + triggerValue + '">' + triggerValue + '</td>';
                html += '<td><span class="status-badge ' + statusClass + '">' + a.status + '</span></td>';
                html += '</tr>';
            }
            html += '</tbody></table>';
        }
        html += '</div></div>';
        return html;
    },

    formatTriggerValue(ruleType, value, alert) {
        var v = value;
        var d = (alert && alert.details) || {};

        // 1. Large Trade (Lots)
        if (ruleType === 'large_trade_lots') {
            var parts = [v + ' ' + I18n.t('lot_unit')];
            if (d.direction) parts.push(d.direction);
            return parts.join(' | ');
        }

        // 2. Large Trade (USD)
        if (ruleType === 'large_trade_usd' || ruleType.indexOf('usd') >= 0) {
            var parts = ['$' + Utils.formatNumber(Math.abs(v))];
            if (d.lots) parts.push(d.lots + I18n.t('lot_unit'));
            if (d.account_type) {
                var typeLabel = d.account_type === 'cent' ? I18n.t('cent_account') : I18n.t('standard_account');
                parts.push(typeLabel);
            }
            return parts.join(' | ');
        }

        // 3. Liquidity Trade
        if (ruleType === 'liquidity_trade') {
            var parts = [v + I18n.t('lot_unit')];
            if (d.order_count) parts.push(d.order_count + I18n.t('unit_orders'));
            if (d.direction) parts.push(d.direction);
            return parts.join(' | ');
        }

        // 4. Scalping
        if (ruleType === 'scalping') {
            var parts = [v + 's'];
            if (d.lots) parts.push(d.lots + I18n.t('lot_unit'));
            if (d.profit_usd !== undefined) {
                var profit = (d.profit_usd >= 0 ? '+$' : '-$') + Utils.formatNumber(Math.abs(d.profit_usd));
                parts.push(profit);
            }
            return parts.join(' | ');
        }

        // 5. Exposure Alert
        if (ruleType === 'exposure_alert' || ruleType === 'exposure') {
            var parts = ['$' + Utils.formatNumber(Math.abs(v))];
            if (d.direction && d.currency) {
                parts.push(d.direction + ' ' + d.currency);
            }
            return parts.join(' | ');
        }

        // 6. Pricing 
        if (ruleType === 'pricing') {
            if (d.alert_subtype === 'PRICING' || d.alert_subtype === 'STALE_PRICE') {
                return v + 's | ' + I18n.t('pricing_stop');
            } else if (d.alert_subtype === 'HIGH_SPREAD') {
                return v + ' pts | High Spread';
            }
        }

        // 7. Volatility
        if (ruleType === 'volatility') {
            return (d.change_points || v) + (String(v).indexOf('%') > 0 ? '' : ' pts') + ' (' + (d.time_window || 'M1') + ')';
        }

        // 7. NOP Limit
        if (ruleType === 'nop_limit') {
            var parts = [];
            if (d.net_position) parts.push(d.net_position + I18n.t('lot_unit'));
            if (d.direction) parts.push(d.direction);
            parts.push('$' + Utils.formatNumber(v));
            return parts.join(' | ');
        }

        // 8. Watch List
        if (ruleType === 'watch_list') {
            var parts = [v + ' ' + I18n.t('lot_unit')];
            if (d.direction) parts.push(d.direction);
            if (d.action) {
                var actionText = d.action === 'OPEN_TRADE' ? I18n.t('open_trade') : I18n.t('pending_order');
                parts.push(actionText);
            }
            return parts.join(' | ');
        }

        // 9. Reverse Positions
        if (ruleType === 'reverse_positions') {
            var parts = [v + 's'];
            if (d.close_direction && d.open_direction) {
                parts.push(d.close_direction + '→' + d.open_direction);
            }
            if (d.close_lots && d.open_lots) {
                parts.push(d.close_lots + '→' + d.open_lots + I18n.t('lot_unit'));
            }
            return parts.join(' | ');
        }

        // 10. Deposit & Withdrawal
        if (ruleType === 'deposit_withdrawal') {
            var parts = ['$' + Utils.formatNumber(Math.abs(v))];
            if (d.type) {
                var typeText = d.type === 'DEPOSIT' ? I18n.t('deposit') : I18n.t('withdrawal');
                parts.push(typeText);
            }
            return parts.join(' | ');
        }

        return v;
    },

    // ==================== 10种告警类型渲染方法 ====================

    // 1. Large Trade (手数)
    renderLargeTradeLots() {
        return this.renderRulePage('large_trade_lots');
    },

    // 2. Large Trade (USD)
    renderLargeTradeUSD() {
        return this.renderRulePage('large_trade_usd');
    },

    // 3. Liquidity Trade
    renderLiquidity() {
        return this.renderRulePage('liquidity_trade');
    },

    // 4. Scalping
    renderScalping() {
        return this.renderRulePage('scalping');
    },

    // 5. Exposure Alert
    renderExposure() {
        return this.renderRulePage('exposure_alert');
    },

    // 6. Pricing
    renderPricing() {
        return this.renderRulePage('pricing');
    },

    // 7. Volatility
    renderVolatility() {
        return this.renderRulePage('volatility');
    },

    // 7. NOP Limit
    renderNOP() {
        return this.renderRulePage('nop_limit');
    },

    // 8. Watch List
    renderWatchList() {
        return this.renderRulePage('watch_list');
    },

    // 9. Reverse Positions
    renderReverse() {
        return this.renderRulePage('reverse_positions');
    },

    // 10. Deposit & Withdrawal
    renderDeposit() {
        return this.renderRulePage('deposit_withdrawal');
    },

    // ==================== CRUD 操作 ====================

    toggleRule(ruleId) {
        var rule = MockData.rules.find(function (r) { return r.rule_id === ruleId; });
        if (rule) {
            rule.enabled = !rule.enabled;
            var statusText = rule.enabled ? I18n.t('enabled') : I18n.t('disabled');
            App.showToast(rule.enabled ? 'success' : 'warning', I18n.t('rule') + ' ' + I18n.t('status_changed_to') + statusText);
            Router.refresh();
        }
    },

    deleteRule(ruleId) {
        if (!confirm(I18n.t('delete_rule_confirm'))) return;

        var index = MockData.rules.findIndex(function (r) { return r.rule_id === ruleId; });
        if (index > -1) {
            MockData.rules.splice(index, 1);
            App.showToast('success', I18n.t('rule_deleted'));
            Router.refresh();
        }
    },

    showAddRuleModal(ruleType) {
        var typeInfo = this.ruleTypes[ruleType];
        var user = MockData.currentUser;
        var dataSources = MockData.getAvailableDatasources(user.company_id, user);

        var dataSourceHtml = '<div class="form-group"><label>' + I18n.t('data_source_label') + ' *</label><select name="source_id" class="form-control" required>';
        for (var i = 0; i < dataSources.length; i++) {
            dataSourceHtml += '<option value="' + dataSources[i].source_id + '">' + dataSources[i].source_name + '</option>';
        }
        dataSourceHtml += '</select></div>';

        var html = '<form id="ruleForm">';
        html += '<input type="hidden" name="rule_type" value="' + ruleType + '">';
        html += this.renderRuleForm(ruleType, null, dataSourceHtml);
        html += '</form>';

        App.showModal(I18n.t('add') + ' ' + I18n.t(ruleType) + ' ' + I18n.t('rule'), html);
        document.getElementById('modalConfirm').onclick = function () { RulesModule.saveRule(); };
        this.bindRulePreviewEvents(ruleType);
        this.updateRulePreview(ruleType);
    },

    showEditRuleModal(ruleId) {
        var rule = MockData.rules.find(function (r) { return r.rule_id === ruleId; });
        if (!rule) return;

        var typeInfo = this.ruleTypes[rule.rule_type];

        var dataSourceHtml = '<div class="form-group"><label>' + I18n.t('data_source_label') + '</label><input type="text" class="form-control" value="' + Utils.getSourceName(rule.source_id) + '" disabled></div>';

        var html = '<form id="ruleForm">';
        html += '<input type="hidden" name="rule_id" value="' + ruleId + '">';
        html += '<input type="hidden" name="rule_type" value="' + rule.rule_type + '">';
        html += '<input type="hidden" name="source_id" value="' + rule.source_id + '">';
        html += this.renderRuleForm(rule.rule_type, rule, dataSourceHtml);
        html += '</form>';

        App.showModal(I18n.t('edit') + ' ' + I18n.t(rule.rule_type) + ' ' + I18n.t('rule'), html);
        document.getElementById('modalConfirm').onclick = function () { RulesModule.saveRule(); };
        this.bindRulePreviewEvents(rule.rule_type);
        this.updateRulePreview(rule.rule_type);
    },

    renderRuleForm(ruleType, rule, dataSourceHtml) {
        var p = rule ? rule.parameters : null;
        var html = '';

        // 【新增】置顶必填：自定义规则名称
        html += '<div class="form-group" style="margin-bottom: 20px;">';
        html += '<label>' + I18n.t('rule_custom_name_label') + ' *</label>';
        html += '<input type="text" name="custom_name" class="form-control" value="' + (rule && rule.custom_name ? rule.custom_name : '') + '" placeholder="' + I18n.t('rule_custom_name_placeholder') + '" required>';
        html += '</div>';

        // 所有规则统一增加预览区域（除了特定逻辑的预览）
        var previewId = ruleType + '-preview';
        var previewTextId = ruleType + '-preview-text';
        var previewNoteId = ruleType + '-preview-note';

        html += '<div id="' + previewId + '" class="rule-preview" style="margin-top: 0; margin-bottom: 20px;">';
        html += '  <div class="rule-preview-title"><i data-lucide="clipboard-list" style="width:14px;height:14px;vertical-align:-2px;stroke:var(--color-info);"></i> ' + I18n.t('rule_preview_title') + '</div>';
        html += '  <div class="rule-preview-text" id="' + previewTextId + '"></div>';
        html += '  <div class="rule-preview-note" id="' + previewNoteId + '"></div>';
        html += '</div>';

        switch (ruleType) {
            case 'large_trade_lots':
                html += '<div class="rule-form-split">';
                // 左侧：常规参数
                html += '  <div class="rule-sidebar">';
                if (dataSourceHtml) html += dataSourceHtml;
                html += '    <div class="form-group"><label>' + I18n.t('lot_threshold_label') + ' *</label>';
                html += '      <input type="number" name="lot_threshold" class="form-control" step="0.1" value="' + (p ? p.lot_threshold : 5.0) + '" required></div>';
                html += '    <div class="form-group">';
                html += '      <label style="display:flex; align-items:center; cursor:pointer;">';
                html += '        <input type="checkbox" name="ignore_demo" ' + (p && p.ignore_demo ? 'checked' : '') + ' style="margin-right:8px; width:18px; height:18px;"> ' + I18n.t('ignore_demo_label');
                html += '      </label>';
                html += '    </div>';
                html += '    <div class="rule-tip">' + I18n.t('rule_tip_large_trade_lots') + '</div>';
                html += '  </div>';

                // 右侧：产品选择
                html += '  <div class="rule-main">';
                html += '    <div class="form-group" style="margin-bottom:0;"><label>' + I18n.t('monitor_symbols_label') + '</label>';
                html += '      <div class="tag-input-panel-info">' + I18n.t('tag_input_help') + '</div>';
                html += this.renderTagInput('symbol_filter', p ? p.symbol_filter : []);
                html += '    </div>';
                html += '  </div>';
                html += '</div>';
                break;

            case 'large_trade_usd':
                var centEnabled = p ? (p.cent_enabled !== false) : false;
                var centThreshold = p ? (p.cent_threshold || Math.round((p.usd_value_threshold || 50000) / 100)) : 500;
                html += '<div class="rule-form-split">';
                // 左侧：参数设置
                html += '  <div class="rule-sidebar">';
                if (dataSourceHtml) html += dataSourceHtml;
                html += '    <div style="border-left: 3px solid var(--success-color); padding-left: 10px; margin-bottom: 12px;"><strong>📊 ' + I18n.t('standard_section') + '</strong></div>';
                html += '    <div class="form-group"><label>' + I18n.t('usd_threshold_label') + ' *</label>';
                html += '      <input type="number" name="usd_value_threshold" class="form-control" step="1000" value="' + (p ? p.usd_value_threshold : 50000) + '" required oninput="RulesModule.syncCentThreshold(this)"></div>';
                // 美分开关
                html += '    <div style="border-left: 3px solid var(--warning-color); padding-left: 10px; margin: 16px 0 12px;"><strong>🔸 ' + I18n.t('cent_section') + '</strong></div>';
                html += '    <div class="form-group"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;">';
                html += '      <input type="checkbox" name="cent_enabled" ' + (centEnabled ? 'checked' : '') + ' onchange="RulesModule.toggleCentSection(this)" style="width:16px;height:16px;"> ' + I18n.t('cent_enabled_label') + '</label></div>';
                html += '    <div id="centAccountSection" style="' + (centEnabled ? '' : 'display:none;') + '">';
                html += '      <div class="form-group"><label>' + I18n.t('cent_account_groups_label') + '</label>';
                html += '        <input type="text" name="cent_account_groups" class="form-control" value="' + (p && p.cent_account_groups ? p.cent_account_groups.join(',') : '*CENT*,*MICRO*') + '">';
                html += '        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">' + I18n.t('cent_group_help') + '</div></div>';
                html += '      <div class="form-group"><label>' + I18n.t('cent_threshold_label') + '</label>';
                html += '        <input type="number" name="cent_threshold" id="centThresholdInput" class="form-control" step="100" value="' + centThreshold + '" readonly style="background:var(--bg-tertiary);cursor:not-allowed;color:var(--text-muted);">';
                html += '        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">' + I18n.t('cent_threshold_auto') + '</div></div>';
                html += '    </div>';
                html += '    <div class="rule-tip">' + I18n.t('rule_tip_large_trade_usd') + '</div>';
                html += '  </div>';

                // 右侧：产品选择（上下两区）
                html += '  <div class="rule-main">';
                html += '    <div class="form-group"><label>📊 ' + I18n.t('monitor_symbols_label') + '</label>';
                html += '      <div class="tag-input-panel-info">' + I18n.t('tag_input_help') + '</div>';
                html += this.renderTagInput('symbol_filter', p ? p.symbol_filter : []);
                html += '    </div>';
                html += '    <div id="centSymbolSection" style="' + (centEnabled ? '' : 'display:none;') + '">';
                html += '      <div class="form-group" style="margin-bottom:0;"><label>🔸 ' + I18n.t('cent_symbol_filter_label') + '</label>';
                html += '        <div class="tag-input-panel-info">' + I18n.t('tag_input_help') + '</div>';
                html += this.renderTagInput('cent_symbol_filter', p ? (p.cent_symbol_filter || []) : []);
                html += '      </div>';
                html += '    </div>';
                html += '  </div>';
                html += '</div>';
                break;

            case 'liquidity_trade':
                html += '<div class="rule-form-split">';
                // 左侧：参数设置
                html += '  <div class="rule-sidebar">';
                if (dataSourceHtml) html += dataSourceHtml;
                html += '    <div class="form-group"><label>' + I18n.t('time_window_label') + ' (' + I18n.t('unit_seconds') + ')*</label>';
                html += '      <input type="number" name="time_window" class="form-control" value="' + (p ? p.time_window : 60) + '" required></div>';
                html += '    <div class="form-group"><label>' + I18n.t('min_order_count_label') + ' *</label>';
                html += '      <input type="number" name="min_order_count" class="form-control" value="' + (p ? p.min_order_count : 2) + '" required></div>';
                html += '    <div class="form-group"><label>' + I18n.t('total_lot_threshold_label') + ' *</label>';
                html += '      <input type="number" name="total_lot_threshold" class="form-control" step="0.1" value="' + (p ? p.total_lot_threshold : 10) + '" required></div>';
                html += '    <div class="form-group"><label>' + I18n.t('aggregation_logic_label') + '</label><select name="aggregation_logic" class="form-control">';
                html += '      <option value="BY_CATEGORY"' + (p && p.aggregation_logic === 'BY_CATEGORY' ? ' selected' : '') + '>' + I18n.t('by_category') + '</option>';
                html += '      <option value="BY_SYMBOL"' + (p && p.aggregation_logic === 'BY_SYMBOL' ? ' selected' : '') + '>' + I18n.t('by_symbol') + '</option>';
                html += '    </select></div>';
                html += '    <div class="rule-tip">' + I18n.t('rule_tip_liquidity_trade') + '</div>';
                html += '  </div>';

                // 右侧：产品选择
                html += '  <div class="rule-main">';
                html += '    <div class="form-group" style="margin-bottom:0;"><label>' + I18n.t('monitor_symbols_label') + '</label>';
                html += '      <div class="tag-input-panel-info">' + I18n.t('tag_input_help') + '</div>';
                html += this.renderTagInput('monitoring_scope', p ? p.monitoring_scope : []);
                html += '    </div>';
                html += '  </div>';
                html += '</div>';
                break;


            case 'scalping':
                html += '<div class="rule-form-split">';
                // 左侧：参数设置
                html += '  <div class="rule-sidebar">';
                if (dataSourceHtml) html += dataSourceHtml;
                html += '    <div class="form-group"><label>' + I18n.t('duration_threshold_label') + ' (' + I18n.t('unit_seconds') + ')*</label>';
                html += '      <input type="number" name="duration_threshold" class="form-control" value="' + (p ? p.duration_threshold : 180) + '" required></div>';
                html += '    <div class="form-group"><label>' + I18n.t('lot_min_label') + '</label>';
                html += '      <input type="number" name="lot_min" class="form-control" step="0.01" value="' + (p ? p.lot_min : 0.1) + '"></div>';
                html += '    <div class="form-group"><label>' + I18n.t('usd_value_min_label') + '</label>';
                html += '      <input type="number" name="usd_value_min" class="form-control" value="' + (p ? p.usd_value_min : 10000) + '"></div>';
                html += '    <div class="form-group"><label>' + I18n.t('profit_usd_min_label') + '</label>';
                html += '      <input type="number" name="profit_usd_min" class="form-control" value="' + (p ? p.profit_usd_min : 200) + '"></div>';
                html += '    <div class="rule-tip">' + I18n.t('rule_tip_scalping') + '</div>';
                html += '  </div>';

                // 右侧：产品选择
                html += '  <div class="rule-main">';
                html += '    <div class="form-group" style="margin-bottom:0;"><label>' + I18n.t('monitor_symbols_label') + '</label>';
                html += '      <div class="tag-input-panel-info">' + I18n.t('tag_input_help') + '</div>';
                html += this.renderTagInput('symbol_filter', p ? p.symbol_filter : []);
                html += '    </div>';
                html += '  </div>';
                html += '</div>';
                break;

            case 'exposure_alert':
                if (dataSourceHtml) html += dataSourceHtml;
                html += '<div class="form-group"><label>' + I18n.t('target_currency_label') + ' *</label>';
                html += '<input type="text" name="target_currency" class="form-control" value="' + (p ? p.target_currency : 'USD') + '" required placeholder="USD,JPY,EUR"></div>';
                html += '<div class="form-group"><label>' + I18n.t('exposure_threshold_label') + ' *</label>';
                html += '<input type="number" name="exposure_threshold" class="form-control" value="' + (p ? p.exposure_threshold : 10000000) + '" required></div>';
                html += '<div class="form-group"><label>' + I18n.t('time_interval_label') + ' (' + I18n.t('unit_seconds') + ')</label>';
                html += '<input type="number" name="time_interval" class="form-control" value="' + (p ? p.time_interval : 600) + '"></div>';

                html += '<div class="rule-tip">' + I18n.t('rule_tip_exposure_alert') + '</div>';
                break;

            case 'pricing':
                html += '<div class="rule-form-split">';
                // 左侧：参数设置
                html += '  <div class="rule-sidebar">';
                if (dataSourceHtml) html += dataSourceHtml;
                // Stale Price
                var formStopDur = (p && p.stop_pricing_duration) || (p && p.pricing && p.pricing.stop_pricing_duration) || 10;
                html += '    <div class="form-group"><label>' + I18n.t('stop_pricing_duration_label') + ' (' + I18n.t('unit_seconds') + ') *</label>';
                html += '      <input type="number" name="stop_pricing_duration" class="form-control" value="' + formStopDur + '" required min="1" onkeypress="return event.charCode >= 48 && event.charCode <= 57"></div>';
                html += '    <div class="rule-tip">' + I18n.t('rule_tip_pricing') + '</div>';
                html += '  </div>';

                // 右侧：产品选择
                html += '  <div class="rule-main">';
                html += '    <div class="form-group" style="margin-bottom:0;"><label>' + I18n.t('monitor_symbols_label') + '</label>';
                html += '      <div class="tag-input-panel-info">' + I18n.t('tag_input_help') + '</div>';
                var formPScope = (p && p.pricing_scope) || (p && p.pricing && p.pricing.scope) || [];
                html += this.renderTagInput('pricing_scope', formPScope);
                html += '    </div>';
                html += '  </div>';
                html += '</div>';
                break;

            case 'volatility':
                html += '<div class="rule-form-split">';
                // 左侧：参数设置
                html += '  <div class="rule-sidebar">';
                if (dataSourceHtml) html += dataSourceHtml;

                var vMode = (p && p.volatility_mode) || (p && p.volatility && p.volatility.mode) || 'POINTS';
                html += '    <div class="form-group"><label>' + I18n.t('volatility_mode_label') + '</label>';
                html += '      <select name="volatility_mode" class="form-control">';
                html += '        <option value="PERCENTAGE" ' + (vMode === 'PERCENTAGE' ? 'selected' : '') + '>Percentage (%)</option>';
                html += '        <option value="POINTS" ' + (vMode === 'POINTS' ? 'selected' : '') + '>Points</option>';
                html += '      </select></div>';

                html += '    <div class="form-group"><label>' + I18n.t('time_window_label') + '</label>';
                html += '      <select name="time_window" class="form-control">';
                var tw = (p && p.time_window) || (p && p.volatility && p.volatility.time_window) || 'M1';
                html += '        <option value="M1" ' + (tw === 'M1' ? 'selected' : '') + '>1 Min</option>';
                html += '        <option value="M5" ' + (tw === 'M5' ? 'selected' : '') + '>5 Min</option>';
                html += '        <option value="M15" ' + (tw === 'M15' ? 'selected' : '') + '>15 Min</option>';
                html += '      </select></div>';

                var formVThres = (p && p.threshold_value !== undefined) ? p.threshold_value : ((p && p.volatility && p.volatility.threshold_value !== undefined) ? p.volatility.threshold_value : 500);
                html += '    <div class="form-group"><label>' + I18n.t('max_fluctuation_label') + '</label>';
                html += '      <input type="number" step="0.01" name="threshold_value" class="form-control" value="' + formVThres + '" required></div>';

                html += '    <div class="rule-tip">' + I18n.t('rule_tip_volatility') + '</div>';
                html += '  </div>';

                // 右侧：产品选择
                html += '  <div class="rule-main">';
                html += '    <div class="form-group" style="margin-bottom:0;"><label>' + I18n.t('monitor_symbols_label') + '</label>';
                html += '      <div class="tag-input-panel-info">' + I18n.t('tag_input_help') + '</div>';
                var formVScope = (p && p.volatility_scope) || (p && p.volatility && p.volatility.scope) || [];
                html += this.renderTagInput('volatility_scope', formVScope);
                html += '    </div>';
                html += '  </div>';
                html += '</div>';
                break;


            case 'nop_limit':
                html += '<div class="rule-form-split">';
                // 左侧：参数设置
                html += '  <div class="rule-sidebar">';
                if (dataSourceHtml) html += dataSourceHtml;
                html += '    <div class="form-group"><label>' + I18n.t('nop_threshold_label') + ' *</label>';
                html += '      <input type="number" name="nop_threshold" class="form-control" value="' + (p ? p.nop_threshold : 5000) + '" required></div>';
                html += '    <div class="rule-tip">' + I18n.t('rule_tip_nop_limit') + '</div>';
                html += '  </div>';

                // 右侧：产品选择
                html += '  <div class="rule-main">';
                html += '    <div class="form-group" style="margin-bottom:0;"><label>' + I18n.t('monitor_symbols_label') + '</label>';
                html += '      <div class="tag-input-panel-info">' + I18n.t('tag_input_help') + '</div>';
                html += this.renderTagInput('symbol_filter', p ? (p.symbol_filter || (p.symbol_name ? [p.symbol_name] : [])) : []);
                html += '    </div>';
                html += '  </div>';
                html += '</div>';
                break;


            case 'watch_list':
                html += '<div class="form-group"><label>' + I18n.t('monitored_accounts_label') + ' (' + I18n.t('comma_separated_ids') + ')*</label>';
                html += '<input type="text" name="watched_accounts" class="form-control" value="' + (p ? p.watched_accounts.join(',') : '') + '" required placeholder="123456,888888"></div>';
                html += '<div class="form-group"><label>' + I18n.t('monitoring_actions_label') + '</label>';
                html += '<label class="checkbox-inline"><input type="checkbox" name="action_open" ' + (p && p.monitoring_actions.indexOf('OPEN_TRADE') >= 0 ? 'checked' : 'checked') + '> ' + I18n.t('open_trade') + '</label>';
                html += '<label class="checkbox-inline"><input type="checkbox" name="action_pending" ' + (p && p.monitoring_actions.indexOf('PENDING_ORDER') >= 0 ? 'checked' : '') + '> ' + I18n.t('pending_order') + '</label></div>';
                html += '<div class="form-group"><label>' + I18n.t('min_lots_limit_label') + '</label>';
                html += '<input type="number" name="lots_min_limit" class="form-control" step="0.01" value="' + (p ? p.lots_min_limit : 0.01) + '"></div>';
                html += '<div class="rule-tip">' + I18n.t('rule_tip_watch_list') + '</div>';
                break;

            case 'reverse_positions':
                html += '<div class="rule-form-split">';
                // 左侧：常规参数
                html += '  <div class="rule-sidebar">';
                if (dataSourceHtml) html += dataSourceHtml;
                html += '    <div class="form-group"><label>' + I18n.t('max_reverse_interval_label') + ' (' + I18n.t('unit_seconds') + ')*</label>';
                html += '      <input type="number" name="max_reverse_interval" class="form-control" value="' + (p ? p.max_reverse_interval : 5) + '" required></div>';
                html += '    <div class="form-group"><label>' + I18n.t('min_reverse_lot_label') + '</label>';
                html += '      <input type="number" name="min_reverse_lot" class="form-control" step="0.1" value="' + (p ? p.min_reverse_lot : 1) + '"></div>';
                html += '    <div class="form-group"><label>' + I18n.t('min_reverse_value_usd_label') + '</label>';
                html += '      <input type="number" name="min_reverse_value_usd" class="form-control" value="' + (p ? p.min_reverse_value_usd : 10000) + '"></div>';
                html += '    <div class="rule-tip">' + I18n.t('rule_tip_reverse_positions') + '</div>';
                html += '  </div>';

                // 右侧：产品选择
                html += '  <div class="rule-main">';
                html += '    <div class="form-group" style="margin-bottom:0;"><label>' + I18n.t('monitor_symbols_label') + '</label>';
                html += '      <div class="tag-input-panel-info">' + I18n.t('tag_input_help') + '</div>';
                html += this.renderTagInput('symbol_filter', p ? p.symbol_filter : []);
                html += '    </div>';
                html += '  </div>';
                html += '</div>';
                break;

            case 'deposit_withdrawal':
                html += '<div class="form-group"><label>' + I18n.t('deposit_threshold_label') + ' (USD)*</label>';
                html += '<input type="number" name="deposit_threshold" class="form-control" value="' + (p ? p.deposit_threshold : 10000) + '" required></div>';
                html += '<div class="form-group"><label>' + I18n.t('withdrawal_threshold_label') + ' (USD)*</label>';
                html += '<input type="number" name="withdrawal_threshold" class="form-control" value="' + (p ? p.withdrawal_threshold : 5000) + '" required></div>';
                html += '<div class="form-group"><label>' + I18n.t('include_keywords_label') + ' (' + I18n.t('comma_separated') + ')</label>';
                html += '<input type="text" name="include_keywords" class="form-control" value="' + (p ? p.include_keywords.join(',') : 'Deposit,Withdraw,External') + '"></div>';
                html += '<div class="rule-tip">' + I18n.t('rule_tip_deposit_withdrawal') + '</div>';
                break;
        }

        return html;
    },

    saveRule() {
        var form = document.getElementById('ruleForm');
        var formData = new FormData(form);
        var ruleType = formData.get('rule_type');
        var ruleId = formData.get('rule_id');
        var sourceId = formData.get('source_id');
        var customName = formData.get('custom_name'); // 新增捕获用户填写的规则名称

        var typeInfo = this.ruleTypes[ruleType];
        var parameters = this.extractParameters(formData, ruleType);

        if (ruleId) {
            // 编辑
            var rule = MockData.rules.find(function (r) { return r.rule_id === ruleId; });
            if (rule) {
                rule.parameters = parameters;
                rule.custom_name = customName; // 更新
                App.showToast('success', I18n.t('rule_updated'));
            }
        } else {
            // 新增
            var newRule = {
                rule_id: 'R' + (this.ruleIdCounter++),
                source_id: sourceId,
                rule_type: ruleType,
                name: I18n.t(ruleType),
                custom_name: customName, // 保存
                description: I18n.t('custom_rule_default_desc'),
                icon: typeInfo.icon,
                enabled: true,
                parameters: parameters,
                trigger_action: 'alert',
                triggered_count: 0
            };
            MockData.rules.push(newRule);
            App.showToast('success', I18n.t('rule_created'));
        }

        App.hideModal();
        Router.refresh();
    },

    extractParameters(formData, ruleType) {
        var p = {};

        switch (ruleType) {
            case 'large_trade_lots':
                p.lot_threshold = parseFloat(formData.get('lot_threshold'));
                p.symbol_filter = formData.get('symbol_filter') ? formData.get('symbol_filter').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                p.ignore_demo = formData.get('ignore_demo') === 'on';
                p.white_list = [];
                break;

            case 'large_trade_usd':
                p.usd_value_threshold = parseFloat(formData.get('usd_value_threshold'));
                p.cent_enabled = formData.get('cent_enabled') === 'on';
                p.cent_account_groups = formData.get('cent_account_groups') ? formData.get('cent_account_groups').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                p.cent_threshold = Math.round(p.usd_value_threshold / 100);
                p.cent_symbol_filter = formData.get('cent_symbol_filter') ? formData.get('cent_symbol_filter').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                p.symbol_filter = formData.get('symbol_filter') ? formData.get('symbol_filter').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                break;

            case 'liquidity_trade':
                p.time_window = parseInt(formData.get('time_window'));
                p.min_order_count = parseInt(formData.get('min_order_count'));
                p.total_lot_threshold = parseFloat(formData.get('total_lot_threshold'));
                p.monitoring_scope = formData.get('monitoring_scope') ? formData.get('monitoring_scope').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                p.aggregation_logic = formData.get('aggregation_logic');
                break;

            case 'scalping':
                p.duration_threshold = parseInt(formData.get('duration_threshold'));
                p.comparison_logic = 'LESS_THAN';
                p.symbol_filter = formData.get('symbol_filter') ? formData.get('symbol_filter').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                p.lot_min = parseFloat(formData.get('lot_min')) || 0.1;
                p.usd_value_min = parseFloat(formData.get('usd_value_min')) || 10000;
                p.profit_usd_min = parseFloat(formData.get('profit_usd_min')) || 200;
                p.include_loss = formData.get('include_loss') === 'on';
                break;

            case 'exposure_alert':
                p.target_currency = formData.get('target_currency');
                p.exposure_threshold = parseFloat(formData.get('exposure_threshold'));
                p.time_interval = parseInt(formData.get('time_interval')) || 600;

                p.calculation_mode = 'ONLY_POSITIONS';
                break;

            case 'pricing':
                p.stop_pricing_duration = formData.get('stop_pricing_duration') ? parseInt(formData.get('stop_pricing_duration')) : null;
                p.pricing_scope = formData.get('pricing_scope') ? formData.get('pricing_scope').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                break;
            case 'volatility':
                p.volatility_mode = formData.get('volatility_mode');
                p.threshold_value = parseFloat(formData.get('threshold_value'));
                p.time_window = formData.get('time_window');
                p.volatility_scope = formData.get('volatility_scope') ? formData.get('volatility_scope').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                break;

            case 'nop_limit':
                p.symbol_filter = formData.get('symbol_filter') ? formData.get('symbol_filter').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                p.nop_threshold = parseFloat(formData.get('nop_threshold'));
                break;


            case 'watch_list':
                p.watched_accounts = formData.get('watched_accounts') ? formData.get('watched_accounts').split(',').map(function (s) { return parseInt(s.trim()); }).filter(function (n) { return !isNaN(n); }) : [];
                p.monitoring_actions = [];
                if (formData.get('action_open') === 'on') p.monitoring_actions.push('OPEN_TRADE');
                if (formData.get('action_pending') === 'on') p.monitoring_actions.push('PENDING_ORDER');
                p.alert_priority = formData.get('alert_priority');
                p.lots_min_limit = parseFloat(formData.get('lots_min_limit')) || 0.01;
                break;

            case 'reverse_positions':
                p.max_reverse_interval = parseInt(formData.get('max_reverse_interval'));
                p.min_reverse_lot = parseFloat(formData.get('min_reverse_lot')) || 1;
                p.min_reverse_value_usd = parseFloat(formData.get('min_reverse_value_usd')) || 10000;
                p.symbol_filter = formData.get('symbol_filter') ? formData.get('symbol_filter').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                p.symbol_match_level = 'EXACT_MATCH';
                break;

            case 'deposit_withdrawal':
                p.deposit_threshold = parseFloat(formData.get('deposit_threshold'));
                p.withdrawal_threshold = parseFloat(formData.get('withdrawal_threshold'));
                p.include_keywords = formData.get('include_keywords') ? formData.get('include_keywords').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                p.monitoring_source = 'REAL_ONLY';
                break;
        }


        return p;
    },

    // ==================== Tag Input 组件 ====================

    renderTagInput(name, values) {
        var strValues = values.join(',');
        var html = '<div class="tag-input-container" id="tagContainer_' + name + '">';
        html += '<input type="hidden" name="' + name + '" value="' + strValues + '">';
        values.forEach(function (v) {
            html += '<div class="tag-item" data-value="' + v + '">' + v + '<span class="tag-remove" onclick="RulesModule.removeTag(this)">×</span></div>';
        });
        html += '<input type="text" class="tag-input-field" placeholder="点击选择或搜索..." onfocus="RulesModule.handleTagFocus(event, \'' + name + '\')" onkeyup="RulesModule.handleTagInput(event, \'' + name + '\')">';
        html += '<div class="tag-suggestions" id="suggestions_' + name + '"></div>';
        html += '</div>';
        return html;
    },

    initTagInputs() {
        // 关闭建议框的点击事件在全局处理
        document.addEventListener('click', function (e) {
            var suggestions = document.querySelectorAll('.tag-suggestions');
            suggestions.forEach(function (s) {
                if (!s.parentElement.contains(e.target)) {
                    s.style.display = 'none';
                }
            });
        });
    },

    handleTagFocus(event, name) {
        // 聚焦时显示所有分组
        var input = event.target;
        if (input.value.trim() === '') {
            this.renderSuggestions(name, '');
        }
    },

    handleTagInput(event, name) {
        var input = event.target;
        var suggestionsBox = document.getElementById('suggestions_' + name);
        var val = input.value.trim();

        if (event.key === 'Enter') {
            event.preventDefault();
            if (val) {
                this.addTag(name, val);
                input.value = '';
                this.renderSuggestions(name, '');
            }
            return;
        }

        this.renderSuggestions(name, val);
    },

    renderSuggestions(name, filterText) {
        var suggestionsBox = document.getElementById('suggestions_' + name);
        var mappings = MockData.productMappings;
        var categories = MockData.productCategories;

        // 1. 获取所有唯一品种并关联分类
        var uniqueProducts = {};
        mappings.forEach(function (m) {
            if (!uniqueProducts[m.unified_product_code]) {
                uniqueProducts[m.unified_product_code] = {
                    code: m.unified_product_code,
                    categoryId: m.product_category
                };
            }
        });

        // 2. 按分类分组
        var grouped = {};
        categories.forEach(function (cat) {
            grouped[cat.id] = {
                meta: cat,
                items: []
            };
        });
        grouped['others'] = {
            meta: { name: 'Uncategorized', icon: '❓' },
            items: []
        };

        Object.values(uniqueProducts).forEach(function (p) {
            // 过滤逻辑
            if (filterText && p.code.toLowerCase().indexOf(filterText.toLowerCase()) < 0) {
                return;
            }
            if (grouped[p.categoryId]) {
                grouped[p.categoryId].items.push(p.code);
            } else {
                grouped['others'].items.push(p.code);
            }
        });

        // 3. 构建 HTML
        var html = '';
        var hasItems = false;

        categories.forEach(function (cat) {
            var g = grouped[cat.id];
            if (g && g.items.length > 0) {
                hasItems = true;
                html += '<div class="suggestion-category clickable" onclick="RulesModule.addCategoryTags(\'' + name + '\', \'' + cat.id + '\')">' + cat.icon + ' ' + cat.name + ' <span class="category-action">全选</span></div>';
                g.items.sort().forEach(function (code) {
                    html += '<div class="suggestion-item child" onclick="RulesModule.addTag(\'' + name + '\', \'' + code + '\')">' + code + '</div>';
                });
            }
        });


        if (grouped['others'].items.length > 0) {
            hasItems = true;
            html += '<div class="suggestion-category clickable" onclick="RulesModule.addCategoryTags(\'' + name + '\', \'others\')">❓ Uncategorized <span class="category-action">全选</span></div>';
            grouped['others'].items.sort().forEach(function (code) {
                html += '<div class="suggestion-item child" onclick="RulesModule.addTag(\'' + name + '\', \'' + code + '\')">' + code + '</div>';
            });
        }


        if (hasItems) {
            suggestionsBox.innerHTML = html;
            suggestionsBox.style.display = 'block';
        } else {
            suggestionsBox.style.display = 'none';
        }
    },

    addCategoryTags(name, categoryId) {
        var self = this;
        var mappings = MockData.productMappings;

        // 获取该分类下的所有产品
        var products = mappings.filter(function (m) {
            return m.product_category === categoryId;
        }).map(function (m) {
            return m.unified_product_code;
        });

        // 去重
        var uniqueProducts = [...new Set(products)];

        // 逐个添加
        uniqueProducts.forEach(function (code) {
            self.addTag(name, code);
        });
    },

    addTag(name, value) {

        var container = document.getElementById('tagContainer_' + name);
        var hiddenInput = container.querySelector('input[type="hidden"]');
        var textInput = container.querySelector('.tag-input-field');
        var suggestionsBox = document.getElementById('suggestions_' + name);

        // 检查是否已存在
        var currentValues = hiddenInput.value ? hiddenInput.value.split(',') : [];
        if (currentValues.indexOf(value) >= 0) {
            textInput.value = '';
            suggestionsBox.style.display = 'none';
            return;
        }

        // 添加视觉标签
        var tag = document.createElement('div');
        tag.className = 'tag-item';
        tag.dataset.value = value;
        tag.innerHTML = value + '<span class="tag-remove" onclick="RulesModule.removeTag(this)">×</span>';
        container.insertBefore(tag, textInput);

        // 更新隐藏域
        currentValues.push(value);
        hiddenInput.value = currentValues.join(',');

        textInput.value = '';
        // 保持建议框打开（可选），或者关闭。这里通过重新渲染空串来重置视图
        this.renderSuggestions(name, '');
        textInput.focus();
    },

    // 切换美分账户区域显示/隐藏
    syncCentThreshold(usdInput) {
        var usdValue = parseFloat(usdInput.value) || 0;
        var centValue = Math.round(usdValue / 100);
        var centInput = document.getElementById('centThresholdInput');
        if (centInput) {
            centInput.value = centValue;
        }
    },

    toggleCentSection(checkbox) {
        var show = checkbox.checked;
        var centSection = document.getElementById('centAccountSection');
        var centSymbolSection = document.getElementById('centSymbolSection');
        if (centSection) centSection.style.display = show ? '' : 'none';
        if (centSymbolSection) centSymbolSection.style.display = show ? '' : 'none';
        // 触发预览更新
        var form = document.getElementById('ruleForm');
        if (form) {
            var ruleType = form.querySelector('[name="rule_type"]');
            if (ruleType) this.updateRulePreview(ruleType.value);
        }
    },

    removeTag(element) {
        var tag = element.parentElement;
        var container = tag.parentElement;
        var hiddenInput = container.querySelector('input[type="hidden"]');
        var valueToRemove = tag.dataset.value;

        // 移除DOM
        container.removeChild(tag);

        // 更新隐藏域
        var currentValues = hiddenInput.value.split(',');
        var index = currentValues.indexOf(valueToRemove);
        if (index > -1) {
            currentValues.splice(index, 1);
            hiddenInput.value = currentValues.join(',');
        }

        // 更新预览（如果在 scalping 弹窗中）
        if (document.getElementById('scalping-preview')) {
            this.updateScalpingPreview();
        }
    },

    // ==================== 规则自然语言实时预览 ====================

    updateRulePreview(ruleType) {
        var previewText = document.getElementById(ruleType + '-preview-text');
        var previewNote = document.getElementById(ruleType + '-preview-note');
        var form = document.getElementById('ruleForm');
        if (!previewText || !form) return;

        var isChinese = I18n.currentLang === 'zh';
        var html = '';
        var note = '';
        var skipTrigger = false;

        // 通用：产品选择处理器
        var getSymbolsText = function (name) {
            var input = form.querySelector('[name="' + name + '"]');
            var val = input ? input.value : '';
            var list = val ? val.split(',').filter(function (s) { return s.trim(); }) : [];
            if (list.length > 0) {
                return '<span class="preview-symbol">' + list.join(', ') + '</span>';
            }
            return '<span class="preview-symbol">' + I18n.t('rule_preview_all_symbols') + '</span>';
        };

        // 通用：值包装器
        var wrapVal = function (val) {
            return '<span class="preview-value">' + val + '</span>';
        };

        switch (ruleType) {
            case 'large_trade_lots':
                var lots = form.querySelector('[name="lot_threshold"]').value || 5.0;
                html = I18n.t('rule_preview_large_lots')
                    .replace('%s', wrapVal(lots))
                    .replace('%s', getSymbolsText('symbol_filter'));
                break;

            case 'large_trade_usd':
                var usd = form.querySelector('[name="usd_value_threshold"]').value || 50000;
                var centCheckbox = form.querySelector('[name="cent_enabled"]');
                var isCentEnabled = centCheckbox && centCheckbox.checked;
                // 标准账户预览
                html = I18n.t('rule_preview_large_usd_standard')
                    .replace('%s', wrapVal(Utils.formatNumber(usd)))
                    .replace('%s', getSymbolsText('symbol_filter'));
                html += I18n.t('rule_preview_trigger');
                // 美分账户预览
                if (isCentEnabled) {
                    var centUsd = form.querySelector('[name="cent_threshold"]');
                    var centVal = centUsd ? centUsd.value : Math.round(usd / 100);
                    html += '<br>' + I18n.t('rule_preview_large_usd_cent')
                        .replace('%s', wrapVal(Utils.formatNumber(centVal)))
                        .replace('%s', getSymbolsText('cent_symbol_filter'));
                    html += I18n.t('rule_preview_trigger');
                }
                skipTrigger = true;
                break;

            case 'liquidity_trade':
                var l_window = form.querySelector('[name="time_window"]').value || 60;
                var l_count = form.querySelector('[name="min_order_count"]').value || 2;
                var l_totalLots = form.querySelector('[name="total_lot_threshold"]').value || 10;
                var l_logic = form.querySelector('[name="aggregation_logic"]').value === 'BY_CATEGORY' ? I18n.t('by_category') : I18n.t('by_symbol');
                html = I18n.t('rule_preview_liquidity')
                    .replace('%s', wrapVal(l_window))
                    .replace('%s', wrapVal(l_count))
                    .replace('%s', wrapVal(l_totalLots))
                    .replace('%s', getSymbolsText('monitoring_scope'))
                    .replace('%s', wrapVal(l_logic));
                break;

            case 'scalping':
                var s_duration = form.querySelector('[name="duration_threshold"]').value || 180;
                var s_lotMin = form.querySelector('[name="lot_min"]').value || 0.1;
                var s_usdMin = form.querySelector('[name="usd_value_min"]').value || 10000;
                var s_profitMin = form.querySelector('[name="profit_usd_min"]').value || 200;
                var triggerAction = isChinese ? '平仓后（含部分平仓），' : 'Upon closing (incl. partial close), ';

                var parts = [];
                parts.push('<span class="preview-keyword">' + I18n.t('rule_preview_duration').replace('%s', wrapVal(s_duration)) + '</span>');
                parts.push('<span class="preview-keyword">' + I18n.t('rule_preview_lots').replace('%s', wrapVal(s_lotMin)) + '</span>');
                parts.push('<span class="preview-keyword">' + I18n.t('rule_preview_usd').replace('%s', wrapVal(Utils.formatNumber(parseFloat(s_usdMin)))) + '</span>');
                parts.push('<span class="preview-keyword">' + I18n.t('rule_preview_profit').replace('%s', wrapVal(Utils.formatNumber(parseFloat(s_profitMin)))) + '</span>');

                html = triggerAction + parts.join(I18n.t('rule_preview_and')) + I18n.t('rule_preview_symbols').replace('%s', getSymbolsText('symbol_filter'));
                note = I18n.t('rule_preview_profit_only');
                break;

            case 'exposure_alert':
                var e_currency = form.querySelector('[name="target_currency"]').value || 'USD';
                var e_threshold = form.querySelector('[name="exposure_threshold"]').value || 10000000;
                var e_interval = form.querySelector('[name="time_interval"]').value || 600;
                html = I18n.t('rule_preview_exposure')
                    .replace('%s', wrapVal(e_currency))
                    .replace('%s', wrapVal(Utils.formatNumber(e_threshold)))
                    .replace('%s', wrapVal(e_interval));
                break;

            case 'pricing':
                var v_stopDur = form.querySelector('[name="stop_pricing_duration"]').value || 10;
                html = I18n.t('rule_preview_pricing')
                    .replace('%s', getSymbolsText('pricing_scope'))
                    .replace('%s', wrapVal(v_stopDur));
                break;

            case 'volatility':
                var v_mode = form.querySelector('[name="volatility_mode"]').value;
                var v_tw = form.querySelector('[name="time_window"]').value || 'M1';
                var v_threshold = form.querySelector('[name="threshold_value"]').value || 500;
                html = I18n.t('rule_preview_volatility')
                    .replace('%s', getSymbolsText('volatility_scope'))
                    .replace('%s', wrapVal(v_threshold))
                    .replace('%s', wrapVal(v_mode === 'PERCENTAGE' ? '%' : 'Points'))
                    .replace('%s', wrapVal(v_tw));
                break;

            case 'nop_limit':
                var n_nopVal = form.querySelector('[name="nop_threshold"]').value || 5000;
                var n_platformSelect = form.querySelector('[name="source_id"]') || form.querySelector('[name="platform_type"]');
                var n_platform = n_platformSelect ? n_platformSelect.options[n_platformSelect.selectedIndex].text : 'MT4';
                html = I18n.t('rule_preview_nop')
                    .replace('%s', getSymbolsText('symbol_filter'))
                    .replace('%s', wrapVal(Utils.formatNumber(n_nopVal)))
                    .replace('%s', wrapVal(n_platform));
                break;

            case 'watch_list':
                var w_accounts = form.querySelector('[name="watched_accounts"]').value || '---';
                var w_acts = [];
                var w_open = form.querySelector('[name="action_open"]');
                var w_pending = form.querySelector('[name="action_pending"]');
                if (w_open && w_open.checked) w_acts.push(I18n.t('open_trade'));
                if (w_pending && w_pending.checked) w_acts.push(I18n.t('pending_order'));
                var w_actionText = w_acts.length > 0 ? w_acts.join('/') : '---';
                var w_watchLot = form.querySelector('[name="lots_min_limit"]').value || 0.01;
                html = I18n.t('rule_preview_watch')
                    .replace('%s', wrapVal(w_accounts))
                    .replace('%s', wrapVal(w_actionText))
                    .replace('%s', wrapVal(w_watchLot));
                break;

            case 'reverse_positions':
                var r_revInt = form.querySelector('[name="max_reverse_interval"]').value || 5;
                var r_revLot = form.querySelector('[name="min_reverse_lot"]').value || 1;
                var r_revUsd = form.querySelector('[name="min_reverse_value_usd"]').value || 10000;
                html = I18n.t('rule_preview_reverse')
                    .replace('%s', wrapVal(r_revInt))
                    .replace('%s', wrapVal(r_revLot))
                    .replace('%s', wrapVal(Utils.formatNumber(r_revUsd)))
                    .replace('%s', getSymbolsText('symbol_filter'));
                break;

            case 'deposit_withdrawal':
                var d_depT = form.querySelector('[name="deposit_threshold"]').value || 10000;
                var d_witT = form.querySelector('[name="withdrawal_threshold"]').value || 5000;
                var d_keys = form.querySelector('[name="include_keywords"]').value || '---';
                html = I18n.t('rule_preview_deposit')
                    .replace('%s', wrapVal(Utils.formatNumber(d_depT)))
                    .replace('%s', wrapVal(Utils.formatNumber(d_witT)))
                    .replace('%s', wrapVal(d_keys));
                break;
        }

        if (!skipTrigger) {
            html += isChinese ? '触发告警。' : ' trigger alert.';
        }
        previewText.innerHTML = html;
        if (previewNote) previewNote.textContent = note || '';
    },

    bindRulePreviewEvents(ruleType) {
        var self = this;
        var form = document.getElementById('ruleForm');
        if (!form) return;

        // 监听所有输入框和下拉框
        var inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(function (input) {
            input.addEventListener('input', function () { RulesModule.updateRulePreview(ruleType); });
            input.addEventListener('change', function () { RulesModule.updateRulePreview(ruleType); });
        });

        // 监控所有 tag-input 隐藏域变化
        var hiddenInputs = form.querySelectorAll('input[type="hidden"]');
        var monitorNames = ['symbol_filter', 'cent_symbol_filter', 'monitoring_scope', 'pricing_scope', 'volatility_scope', 'nop_scope'];
        for (var i = 0; i < hiddenInputs.length; i++) {
            var hiddenInput = hiddenInputs[i];
            if (monitorNames.indexOf(hiddenInput.name) >= 0) {
                (function (hi) {
                    var lastVal = hi.value;
                    setInterval(function () {
                        if (hi.value !== lastVal) {
                            lastVal = hi.value;
                            self.updateRulePreview(ruleType);
                        }
                    }, 300);
                })(hiddenInput);
            }
        }
    },

    // ==================== 规则克隆功能 ====================

    // T2: 命名算法
    generateCloneName(rule, targetSource) {
        var baseName = rule.custom_name || rule.name || I18n.t(rule.rule_type) || rule.rule_type;
        var targetName = targetSource ? targetSource.source_name : '未知服务器';
        var rawName = baseName + ' - ' + targetName;
        // 截断至 50 字符
        if (rawName.length > 50) rawName = rawName.substring(0, 47) + '...';
        // 检查同名规则，追加序号
        var existingNames = MockData.rules
            .filter(function (r) { return r.source_id === targetSource.source_id; })
            .map(function (r) { return r.custom_name || r.name || ''; });
        if (existingNames.indexOf(rawName) < 0) return rawName;
        for (var i = 2; i <= 99; i++) {
            var candidate = rawName + ' (' + i + ')';
            if (candidate.length > 50) candidate = rawName.substring(0, 44) + '... (' + i + ')';
            if (existingNames.indexOf(candidate) < 0) return candidate;
        }
        return rawName;
    },

    // T5: 执行克隆（单条或批量）
    executeClone(clonesData) {
        // clonesData: [{ rule, targetSourceId, newName, enabled }]
        var newRuleIds = [];
        for (var i = 0; i < clonesData.length; i++) {
            var item = clonesData[i];
            var orig = item.rule;
            var newRule = {
                rule_id: 'R' + (this.ruleIdCounter++),
                source_id: item.targetSourceId,
                rule_type: orig.rule_type,
                name: orig.name,
                custom_name: item.newName,
                description: orig.description || '',
                icon: orig.icon || '',
                enabled: item.enabled,
                parameters: JSON.parse(JSON.stringify(orig.parameters || {})),
                trigger_action: orig.trigger_action || 'alert',
                triggered_count: 0
            };
            MockData.rules.push(newRule);
            newRuleIds.push(newRule.rule_id);
        }
        return newRuleIds;
    },

    // T3: 单条克隆弹窗
    showCloneModal(ruleId) {
        var rule = MockData.rules.find(function (r) { return r.rule_id === ruleId; });
        if (!rule) return;

        var user = MockData.currentUser;
        var allSources = MockData.dataSources.filter(function (s) {
            if (user.role === 'super_admin') return true;
            var ids = user.datasource_ids || [];
            return ids.indexOf(s.source_id) >= 0;
        });
        // 排除当前服务器
        var otherSources = allSources.filter(function (s) { return s.source_id !== rule.source_id; });

        if (otherSources.length === 0) {
            App.showToast('warning', '暂无其他服务器可选，请先添加数据源。');
            return;
        }

        var defaultTarget = otherSources[0];
        var defaultName = this.generateCloneName(rule, defaultTarget);

        var html = '<div class="clone-modal-wrap">';
        html += '<h3 style="margin:0 0 16px;">克隆规则</h3>';

        // 目标服务器选择
        html += '<div class="form-group">';
        html += '<label>目标服务器</label>';
        html += '<select class="form-control" id="cloneSingleTarget" onchange="RulesModule.onSingleCloneTargetChange(\'' + ruleId + '\')">';
        otherSources.forEach(function (s) {
            html += '<option value="' + s.source_id + '">' + s.source_name + ' (' + s.platform_type + ')</option>';
        });
        html += '</select></div>';

        // 左右对比
        html += '<div class="clone-compare-panel">';
        // 左侧：原始规则（只读）
        html += '<div class="clone-side clone-side-left">';
        html += '<div class="clone-side-title">📋 原始规则（只读）</div>';
        html += '<div class="clone-field-row"><span class="clone-label">规则名称</span><span class="clone-val">' + (rule.custom_name || I18n.t(rule.rule_type)) + '</span></div>';
        html += '<div class="clone-field-row"><span class="clone-label">规则类型</span><span class="clone-val">' + I18n.t(rule.rule_type) + '</span></div>';
        html += '<div class="clone-field-row"><span class="clone-label">来源服务器</span><span class="clone-val">' + this._getSourceName(rule.source_id) + '</span></div>';
        html += '<div class="clone-field-row"><span class="clone-label">状态</span><span class="clone-val">' + (rule.enabled ? '🟢 启用' : '⚪ 禁用') + '</span></div>';
        html += '</div>';

        // 右侧：克隆预览（可编辑）
        html += '<div class="clone-side clone-side-right">';
        html += '<div class="clone-side-title">✏️ 克隆后（可调整）</div>';
        html += '<div class="form-group"><label>规则名称</label>';
        html += '<input type="text" class="form-control" id="cloneSingleName" value="' + defaultName + '" maxlength="50"></div>';
        html += '<div class="clone-field-row"><span class="clone-label">规则类型</span><span class="clone-val">' + I18n.t(rule.rule_type) + '</span></div>';
        html += '<div class="clone-field-row clone-diff"><span class="clone-label">目标服务器</span><span class="clone-val" id="cloneSingleTargetName">' + defaultTarget.source_name + '</span></div>';
        html += '<div class="form-group"><label>初始状态</label>';
        html += '<select class="form-control" id="cloneSingleEnabled"><option value="false">禁用（推荐，审查后再开启）</option><option value="true">启用</option></select></div>';
        html += '</div>';
        html += '</div>'; // clone-compare-panel

        html += '<div class="modal-actions" style="margin-top:20px;">';
        html += '<button class="btn btn-secondary" onclick="App.hideModal()">取消</button>';
        html += '<button class="btn btn-primary" onclick="RulesModule.confirmSingleClone(\'' + ruleId + '\')">确认克隆</button>';
        html += '</div>';
        html += '</div>';

        App.showModal('克隆规则', html);
        this._injectCloneStyles();
    },

    onSingleCloneTargetChange(ruleId) {
        var rule = MockData.rules.find(function (r) { return r.rule_id === ruleId; });
        if (!rule) return;
        var sel = document.getElementById('cloneSingleTarget');
        var targetSource = MockData.dataSources.find(function (s) { return s.source_id === sel.value; });
        if (!targetSource) return;
        document.getElementById('cloneSingleTargetName').textContent = targetSource.source_name;
        document.getElementById('cloneSingleName').value = RulesModule.generateCloneName(rule, targetSource);
    },

    confirmSingleClone(ruleId) {
        var rule = MockData.rules.find(function (r) { return r.rule_id === ruleId; });
        if (!rule) return;
        var targetSourceId = document.getElementById('cloneSingleTarget').value;
        var newName = document.getElementById('cloneSingleName').value.trim() || this.generateCloneName(rule, MockData.dataSources.find(function (s) { return s.source_id === targetSourceId; }));
        var enabled = document.getElementById('cloneSingleEnabled').value === 'true';
        this.executeClone([{ rule: rule, targetSourceId: targetSourceId, newName: newName, enabled: enabled }]);
        App.hideModal();
        var targetName = this._getSourceName(targetSourceId);
        App.showToast('success', '✅ 成功克隆规则到 ' + targetName);
        Router.refresh();
    },

    // T4: 批量克隆弹窗
    showBatchCloneModal(ruleType) {
        var user = MockData.currentUser;
        var allSources = MockData.dataSources.filter(function (s) {
            if (user.role === 'super_admin') return true;
            var ids = user.datasource_ids || [];
            return ids.indexOf(s.source_id) >= 0;
        });

        // 获取当前页面的数据源（从当前规则推断）
        var rules = this.getRulesByType(ruleType);
        if (rules.length === 0) {
            App.showToast('warning', '当前规则类型下没有可克隆的规则。');
            return;
        }
        var currentSourceId = rules[0].source_id;
        var otherSources = allSources.filter(function (s) { return s.source_id !== currentSourceId; });
        if (otherSources.length === 0) {
            App.showToast('warning', '暂无其他服务器可选，请先添加数据源。');
            return;
        }

        // 批量弹窗 Step 1：选服务器
        this._showBatchStep1(rules, otherSources, currentSourceId, ruleType);
    },

    _showBatchStep1(rules, otherSources, currentSourceId, ruleType) {
        var defaultTarget = otherSources[0];
        var html = '<div class="clone-modal-wrap">';
        html += '<div class="clone-steps"><span class="clone-step-active">① 选择目标</span><span class="clone-step">② 预览规则</span><span class="clone-step">③ 确认克隆</span></div>';
        html += '<div class="form-group" style="margin-top:16px;"><label>目标服务器</label>';
        html += '<select class="form-control" id="batchCloneTarget">';
        otherSources.forEach(function (s) {
            html += '<option value="' + s.source_id + '">' + s.source_name + ' (' + s.platform_type + ')</option>';
        });
        html += '</select></div>';
        html += '<div class="form-group"><label>克隆范围</label>';
        html += '<div class="clone-info-box">将克隆当前数据源下 <strong>' + rules.length + '</strong> 条「' + I18n.t(ruleType) + '」规则</div>';
        html += '</div>';
        html += '<div class="modal-actions">';
        html += '<button class="btn btn-secondary" onclick="App.hideModal()">取消</button>';
        html += '<button class="btn btn-primary" onclick="RulesModule._showBatchStep2(\'' + ruleType + '\')">下一步：预览规则 →</button>';
        html += '</div></div>';

        App.showModal('批量克隆规则', html);
        this._injectCloneStyles();
    },

    _showBatchStep2(ruleType) {
        var targetSourceId = document.getElementById('batchCloneTarget').value;
        var targetSource = MockData.dataSources.find(function (s) { return s.source_id === targetSourceId; });
        var rules = this.getRulesByType(ruleType);

        // 为每条规则生成克隆名称
        var clonesPreview = rules.map(function (r) {
            return {
                rule: r,
                targetSourceId: targetSourceId,
                newName: RulesModule.generateCloneName(r, targetSource),
                enabled: false
            };
        });

        // 存入临时状态
        this._batchClonesPreview = clonesPreview;
        this._batchTargetSource = targetSource;

        var html = '<div class="clone-modal-wrap">';
        html += '<div class="clone-steps"><span class="clone-step-done">✓ 选择目标</span><span class="clone-step-active">② 预览规则</span><span class="clone-step">③ 确认克隆</span></div>';
        html += '<div class="clone-batch-header">';
        html += '<div class="clone-batch-title">共 <strong>' + rules.length + '</strong> 条规则将克隆至 <strong>' + targetSource.source_name + '</strong></div>';
        html += '<div class="clone-batch-controls">';
        html += '<label class="checkbox-inline"><input type="checkbox" id="batchEnableAll" onchange="RulesModule._toggleBatchEnable(this)"> 全部启用</label>';
        html += '<button class="btn btn-sm btn-secondary clone-mode-btn" id="cloneModeToggle" onclick="RulesModule._toggleCloneMode()">展开详情 ▼</button>';
        html += '</div></div>';

        // 快速模式（默认）：折叠列表
        html += '<div id="cloneBatchFastMode">';
        html += '<div class="clone-fast-list">';
        clonesPreview.forEach(function (item, idx) {
            html += '<div class="clone-fast-item">';
            html += '<div class="clone-fast-left">';
            html += '<label class="checkbox-inline"><input type="checkbox" class="batch-enable-cb" data-idx="' + idx + '"> 启用</label>';
            html += '<span class="clone-fast-name">' + (item.rule.custom_name || I18n.t(item.rule.rule_type)) + '</span>';
            html += '<span class="clone-fast-arrow">→</span>';
            html += '<input type="text" class="clone-fast-input batch-name-input" data-idx="' + idx + '" value="' + item.newName + '" maxlength="50">';
            html += '</div></div>';
        });
        html += '</div></div>';

        // 详细模式（隐藏）：左右对比
        html += '<div id="cloneBatchDetailMode" style="display:none;">';
        clonesPreview.forEach(function (item, idx) {
            var r = item.rule;
            html += '<details class="clone-detail-card"><summary>' + (r.custom_name || I18n.t(r.rule_type)) + ' → ' + item.newName + '</summary>';
            html += '<div class="clone-compare-panel">';
            html += '<div class="clone-side clone-side-left"><div class="clone-side-title">原始（只读）</div>';
            html += '<div class="clone-field-row"><span class="clone-label">名称</span><span class="clone-val">' + (r.custom_name || I18n.t(r.rule_type)) + '</span></div>';
            html += '<div class="clone-field-row"><span class="clone-label">状态</span><span class="clone-val">' + (r.enabled ? '🟢 启用' : '⚪ 禁用') + '</span></div>';
            html += '</div>';
            html += '<div class="clone-side clone-side-right"><div class="clone-side-title">克隆后</div>';
            html += '<div class="form-group"><label>名称</label><input type="text" class="form-control batch-name-input" data-idx="' + idx + '" value="' + item.newName + '" maxlength="50"></div>';
            html += '<div class="form-group"><label>初始状态</label><select class="form-control batch-enable-sel" data-idx="' + idx + '"><option value="false" selected>禁用</option><option value="true">启用</option></select></div>';
            html += '</div></div></details>';
        });
        html += '</div>';

        html += '<div class="modal-actions" style="margin-top:16px;">';
        html += '<button class="btn btn-secondary" onclick="RulesModule._showBatchStep1(RulesModule.getRulesByType(\'' + ruleType + '\'), MockData.dataSources.filter(function(s){return s.source_id!==RulesModule.getRulesByType(\'' + ruleType + '\')[0].source_id;}), RulesModule.getRulesByType(\'' + ruleType + '\')[0].source_id, \'' + ruleType + '\')">← 返回</button>';
        html += '<button class="btn btn-primary" onclick="RulesModule._showBatchStep3(\'' + ruleType + '\')">下一步：确认克隆 →</button>';
        html += '</div></div>';

        App.showModal('批量克隆规则', html);
    },

    _toggleCloneMode() {
        var fastMode = document.getElementById('cloneBatchFastMode');
        var detailMode = document.getElementById('cloneBatchDetailMode');
        var btn = document.getElementById('cloneModeToggle');
        if (fastMode.style.display !== 'none') {
            fastMode.style.display = 'none';
            detailMode.style.display = 'block';
            btn.textContent = '收起详情 ▲';
        } else {
            fastMode.style.display = 'block';
            detailMode.style.display = 'none';
            btn.textContent = '展开详情 ▼';
        }
    },

    _toggleBatchEnable(checkbox) {
        var isChecked = checkbox.checked;
        document.querySelectorAll('.batch-enable-cb').forEach(function (cb) { cb.checked = isChecked; });
        document.querySelectorAll('.batch-enable-sel').forEach(function (sel) { sel.value = isChecked ? 'true' : 'false'; });
    },

    _collectBatchFormData() {
        var preview = this._batchClonesPreview;
        // 从 fast mode 的 input 同步到 preview
        document.querySelectorAll('.batch-name-input').forEach(function (input) {
            var idx = parseInt(input.dataset.idx);
            if (!isNaN(idx) && preview[idx]) {
                preview[idx].newName = input.value.trim() || preview[idx].newName;
            }
        });
        document.querySelectorAll('.batch-enable-cb').forEach(function (cb) {
            var idx = parseInt(cb.dataset.idx);
            if (!isNaN(idx) && preview[idx]) preview[idx].enabled = cb.checked;
        });
        document.querySelectorAll('.batch-enable-sel').forEach(function (sel) {
            var idx = parseInt(sel.dataset.idx);
            if (!isNaN(idx) && preview[idx]) preview[idx].enabled = sel.value === 'true';
        });
    },

    _showBatchStep3(ruleType) {
        this._collectBatchFormData();
        var targetSource = this._batchTargetSource;
        var count = this._batchClonesPreview.length;

        var html = '<div class="clone-modal-wrap">';
        html += '<div class="clone-steps"><span class="clone-step-done">✓ 选择目标</span><span class="clone-step-done">✓ 预览规则</span><span class="clone-step-active">③ 确认克隆</span></div>';
        html += '<div class="clone-confirm-box">';
        html += '<div class="clone-confirm-icon">⚠️</div>';
        html += '<div class="clone-confirm-desc">即将克隆 <strong>' + count + '</strong> 条规则到 <strong>"' + targetSource.source_name + '"</strong></div>';
        html += '<div class="clone-confirm-note">请在下方输入目标服务器名称以确认操作：</div>';
        html += '<input type="text" class="form-control" id="batchCloneConfirmInput" placeholder="' + targetSource.source_name + '" autocomplete="off">';
        html += '<div class="clone-confirm-tip">* 输入内容与服务器名称完全一致后，方可点击确认</div>';
        html += '</div>';
        html += '<div class="modal-actions" style="margin-top:20px;">';
        html += '<button class="btn btn-secondary" onclick="RulesModule._showBatchStep2(\'' + ruleType + '\')">← 返回</button>';
        html += '<button class="btn btn-danger" id="batchCloneConfirmBtn" disabled onclick="RulesModule._executeBatchClone(\'' + ruleType + '\')">我确认，开始克隆</button>';
        html += '</div></div>';

        App.showModal('批量克隆规则', html);

        // 监听输入，与服务器名称匹配后解锁按钮
        setTimeout(function () {
            var input = document.getElementById('batchCloneConfirmInput');
            var btn = document.getElementById('batchCloneConfirmBtn');
            if (input && btn) {
                input.addEventListener('input', function () {
                    btn.disabled = input.value.trim() !== targetSource.source_name;
                });
            }
        }, 50);
    },

    _executeBatchClone(ruleType) {
        var data = this._batchClonesPreview;
        var targetName = this._batchTargetSource ? this._batchTargetSource.source_name : '目标服务器';
        this.executeClone(data);
        App.hideModal();
        App.showToast('success', '✅ 成功克隆 ' + data.length + ' 条规则至 ' + targetName);
        this._batchClonesPreview = null;
        this._batchTargetSource = null;
        Router.refresh();
    },

    _getSourceName(sourceId) {
        var s = MockData.dataSources.find(function (s) { return s.source_id === sourceId; });
        return s ? s.source_name : sourceId;
    },

    _injectCloneStyles() {
        if (document.getElementById('clone-modal-styles')) return;
        var style = document.createElement('style');
        style.id = 'clone-modal-styles';
        style.textContent = `
        .clone-modal-wrap { max-height: 75vh; overflow-y: auto; }
        .clone-steps { display:flex; gap:8px; align-items:center; font-size:13px; margin-bottom:4px; flex-wrap:wrap; }
        .clone-step { color:var(--text-muted); padding:4px 10px; border-radius:12px; background:var(--bg-secondary); }
        .clone-step-active { color:var(--primary-color); font-weight:600; padding:4px 10px; border-radius:12px; background:rgba(79,70,229,0.1); }
        .clone-step-done { color:var(--success-color,#10b981); padding:4px 10px; border-radius:12px; background:rgba(16,185,129,0.08); }
        .clone-compare-panel { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:12px 0; }
        .clone-side { background:var(--bg-secondary); border-radius:8px; padding:12px; border:1px solid var(--border-color); }
        .clone-side-left { opacity:0.8; }
        .clone-side-right { border-color:var(--primary-color); }
        .clone-side-title { font-size:12px; font-weight:600; color:var(--text-muted); margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px; }
        .clone-field-row { display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid var(--border-color); font-size:13px; }
        .clone-field-row:last-child { border-bottom:none; }
        .clone-label { color:var(--text-muted); }
        .clone-val { font-weight:500; }
        .clone-diff .clone-val { color:var(--primary-color); font-weight:600; }
        .clone-batch-header { display:flex; justify-content:space-between; align-items:center; margin:12px 0 8px; flex-wrap:wrap; gap:8px; }
        .clone-batch-title { font-size:14px; }
        .clone-batch-controls { display:flex; align-items:center; gap:12px; }
        .clone-mode-btn { font-size:12px; }
        .clone-fast-list { border:1px solid var(--border-color); border-radius:8px; overflow:hidden; }
        .clone-fast-item { padding:8px 12px; border-bottom:1px solid var(--border-color); display:flex; align-items:center; }
        .clone-fast-item:last-child { border-bottom:none; }
        .clone-fast-left { display:flex; align-items:center; gap:8px; width:100%; flex-wrap:wrap; }
        .clone-fast-name { color:var(--text-muted); font-size:13px; min-width:80px; }
        .clone-fast-arrow { color:var(--primary-color); font-size:16px; }
        .clone-fast-input { flex:1; min-width:120px; font-size:13px; padding:4px 8px; border:1px solid var(--border-color); border-radius:4px; background:var(--card-bg); color:var(--text-primary); }
        .clone-detail-card { border:1px solid var(--border-color); border-radius:8px; margin-bottom:8px; overflow:hidden; }
        .clone-detail-card summary { padding:8px 12px; cursor:pointer; font-size:13px; font-weight:500; background:var(--bg-secondary); }
        .clone-detail-card summary:hover { background:var(--hover-color,rgba(0,0,0,0.05)); }
        .clone-info-box { padding:10px 14px; background:rgba(79,70,229,0.06); border:1px solid rgba(79,70,229,0.2); border-radius:6px; font-size:14px; }
        .clone-confirm-box { text-align:center; padding:20px; background:var(--bg-secondary); border-radius:8px; border:1px solid var(--border-color); margin:12px 0; }
        .clone-confirm-icon { font-size:36px; margin-bottom:8px; }
        .clone-confirm-desc { font-size:15px; margin-bottom:12px; }
        .clone-confirm-note { font-size:13px; color:var(--text-muted); margin-bottom:8px; }
        .clone-confirm-tip { font-size:11px; color:var(--text-muted); margin-top:6px; }
        #batchCloneConfirmInput { text-align:center; font-size:14px; }
        `;
        document.head.appendChild(style);
    }
};

