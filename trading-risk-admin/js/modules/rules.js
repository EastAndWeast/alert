// 规则管理模块 - 10种新告警类型实现（含CRUD功能）

const RulesModule = {
    // 规则类型映射
    ruleTypes: {
        'large_trade_lots': { name: 'Large Trade (手数)', icon: '💰', color: 'primary' },
        'large_trade_usd': { name: 'Large Trader (USD)', icon: '💵', color: 'success' },
        'liquidity_trade': { name: 'Liquidity Trade', icon: '🌊', color: 'info' },
        'scalping': { name: 'Scalping', icon: '⚡', color: 'warning' },
        'exposure_alert': { name: 'Exposure Alert', icon: '📊', color: 'danger' },
        'pricing_volatility': { name: 'Pricing & Volatility', icon: '📈', color: 'secondary' },
        'nop_limit': { name: 'NOP Limit', icon: '📐', color: 'dark' },
        'watch_list': { name: 'Watch List', icon: '👁️', color: 'primary' },
        'reverse_positions': { name: 'Reverse Positions', icon: '🔀', color: 'warning' },
        'deposit_withdrawal': { name: 'Deposit & Withdrawal', icon: '💳', color: 'success' }
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
        html += '<span class="rule-icon-large">' + typeInfo.icon + '</span>';
        html += '<div><h2>' + I18n.t(ruleType) + '</h2><p class="text-muted">' + I18n.t(ruleType + '_desc') + '</p></div>';
        html += '</div>';
        if (!isReadOnly) {
            html += '<button class="btn btn-primary" onclick="RulesModule.showAddRuleModal(\'' + ruleType + '\')"><span>➕</span> ' + I18n.t('add_rule') + '</button>';
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
        html += '<div class="rule-title">';
        html += '<span class="rule-icon">' + typeInfo.icon + '</span>';
        html += '<span>' + I18n.t(rule.rule_type) + '</span>';
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
        html += '<span class="stat-item">📊 ' + I18n.t('triggered') + ': ' + rule.triggered_count + ' ' + I18n.t('times') + '</span>';
        html += '</div>';
        if (!isReadOnly) {
            html += '<div class="rule-actions">';
            html += '<button class="btn btn-sm btn-' + (rule.enabled ? 'warning' : 'success') + '" onclick="RulesModule.toggleRule(\'' + rule.rule_id + '\')">' + (rule.enabled ? I18n.t('disable') : I18n.t('enable')) + '</button>';
            html += '<button class="btn btn-sm btn-secondary" onclick="RulesModule.showEditRuleModal(\'' + rule.rule_id + '\')">' + I18n.t('edit') + '</button>';
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
                html += '<div class="param-item"><strong>' + I18n.t('usd_threshold_label') + '：</strong>$' + Utils.formatNumber(p.usd_value_threshold) + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('monitor_symbols_label') + '：</strong>' + (p.symbol_filter && p.symbol_filter.length ? p.symbol_filter.join(', ') : I18n.t('all')) + '</div>';
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
                break;
            case 'pricing_volatility':
                html += '<div class="param-item"><strong>' + I18n.t('stop_pricing_duration_label') + '：</strong>' + p.pricing.stop_pricing_duration + ' ' + I18n.t('unit_seconds') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('volatility_mode_label') + '：</strong>' + p.volatility.mode + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('monitor_symbols_label') + '：</strong>' + (p.pricing.scope && p.pricing.scope.length ? p.pricing.scope.join(', ') : I18n.t('all')) + '</div>';
                break;
            case 'nop_limit':
                html += '<div class="param-item"><strong>' + I18n.t('symbol_name_label') + '：</strong>' + p.symbol_name + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('nop_threshold_label') + '：</strong>' + Utils.formatNumber(p.nop_threshold) + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('monitor_symbols_label') + '：</strong>' + (p.symbol_filter && p.symbol_filter.length ? p.symbol_filter.join(', ') : I18n.t('all')) + '</div>';
                break;
            case 'watch_list':
                html += '<div class="param-item"><strong>' + I18n.t('monitored_accounts_label') + '：</strong>' + p.watched_accounts.length + ' ' + I18n.t('unit_items') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('priority_label') + '：</strong>' + p.alert_priority + '</div>';
                break;
            case 'reverse_positions':
                html += '<div class="param-item"><strong>' + I18n.t('max_reverse_interval_label') + '：</strong>' + p.max_reverse_interval + ' ' + I18n.t('unit_seconds') + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('min_reverse_lot_label') + '：</strong>' + p.min_reverse_lot + ' ' + I18n.t('unit_lots') + '</div>';
                break;
            case 'deposit_withdrawal':
                html += '<div class="param-item"><strong>' + I18n.t('deposit_threshold_label') + '：</strong>$' + Utils.formatNumber(p.deposit_threshold) + '</div>';
                html += '<div class="param-item"><strong>' + I18n.t('withdrawal_threshold_label') + '：</strong>$' + Utils.formatNumber(p.withdrawal_threshold) + '</div>';
                break;
        }
        html += '</div>';
        return html;
    },

    // 渲染无规则提示
    renderNoRules(ruleName) {
        return '<div class="empty-state"><div class="empty-icon">📭</div><h3>' + I18n.t('no_rules_prefix') + ' ' + ruleName + ' ' + I18n.t('no_rules_suffix') + '</h3><p>' + I18n.t('click_to_add_rule') + '</p></div>';
    },

    // 渲染告警历史
    renderAlertHistory(ruleType) {
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var alerts = MockData.filterBySource(MockData.alerts, sourceIds).filter(function (a) {
            return a.rule_type === ruleType;
        }).slice(0, 5);

        var html = '<div class="section-card mt-4">';
        html += '<div class="section-header"><h3>📋 ' + I18n.t('recent_alerts') + '</h3></div>';
        html += '<div class="section-body">';

        if (alerts.length === 0) {
            html += '<p class="text-muted text-center">' + I18n.t('no_alerts') + '</p>';
        } else {
            html += '<table class="data-table"><thead><tr>';
            html += '<th>' + I18n.t('time_header') + '</th><th>' + I18n.t('account_header') + '</th><th>' + I18n.t('symbol_header') + '</th><th>' + I18n.t('triggered_value_header') + '</th><th>' + I18n.t('status_header') + '</th>';
            html += '</tr></thead><tbody>';
            for (var i = 0; i < alerts.length; i++) {
                var a = alerts[i];
                var statusClass = Utils.getStatusClass(a.status);
                html += '<tr>';
                html += '<td>' + a.trigger_time + '</td>';
                html += '<td>' + a.account_id + '</td>';
                html += '<td>' + a.product + '</td>';
                html += '<td>' + this.formatTriggerValue(ruleType, a.trigger_value) + '</td>';
                html += '<td><span class="status-badge ' + statusClass + '">' + a.status + '</span></td>';
                html += '</tr>';
            }
            html += '</tbody></table>';
        }
        html += '</div></div>';
        return html;
    },

    formatTriggerValue(ruleType, value) {
        if (ruleType.indexOf('usd') >= 0 || ruleType === 'deposit_withdrawal' || ruleType === 'exposure') {
            return '$' + Utils.formatNumber(value);
        }
        if (ruleType === 'scalping' || ruleType.indexOf('pricing') >= 0) {
            return value + 's';
        }
        return value;
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

    // 6. Pricing & Volatility
    renderPricing() {
        return this.renderRulePage('pricing_volatility');
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
    },

    renderRuleForm(ruleType, rule, dataSourceHtml) {
        var p = rule ? rule.parameters : null;
        var html = '';

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
                html += '<div class="rule-form-split">';
                // 左侧：常规参数
                html += '  <div class="rule-sidebar">';
                if (dataSourceHtml) html += dataSourceHtml;
                html += '    <div class="form-group"><label>' + I18n.t('usd_threshold_label') + ' *</label>';
                html += '      <input type="number" name="usd_value_threshold" class="form-control" step="1000" value="' + (p ? p.usd_value_threshold : 50000) + '" required></div>';
                html += '    <div class="form-group"><label>' + I18n.t('cent_account_groups_label') + '</label>';
                html += '      <input type="text" name="cent_account_groups" class="form-control" value="' + (p ? p.cent_account_groups.join(',') : '*CENT*,*MICRO*') + '"></div>';
                html += '    <div class="rule-tip">' + I18n.t('rule_tip_large_trade_usd') + '</div>';
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
                html += '    <div class="form-group"><label><input type="checkbox" name="include_loss" ' + (p && p.include_loss ? 'checked' : '') + '> ' + I18n.t('include_loss_label') + '</label></div>';
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
                html += '<div class="form-group"><label>' + I18n.t('max_remind_count_label') + '</label>';
                html += '<input type="number" name="max_remind_count" class="form-control" value="' + (p ? p.max_remind_count : 1) + '"></div>';
                html += '<div class="rule-tip">' + I18n.t('rule_tip_exposure_alert') + '</div>';
                break;

            case 'pricing_volatility':
                html += '<div class="rule-form-split">';
                // 左侧：参数设置
                html += '  <div class="rule-sidebar">';
                if (dataSourceHtml) html += dataSourceHtml;
                html += '    <div class="form-group"><label>' + I18n.t('stop_pricing_duration_label') + ' (' + I18n.t('unit_seconds') + ')*</label>';
                html += '      <input type="number" name="stop_pricing_duration" class="form-control" value="' + (p ? p.pricing.stop_pricing_duration : 30) + '" required></div>';
                html += '    <div class="form-group"><label>' + I18n.t('volatility_mode_label') + '</label><select name="volatility_mode" class="form-control">';
                html += '      <option value="POINTS"' + (p && p.volatility.mode === 'POINTS' ? ' selected' : '') + '>' + I18n.t('points') + ' (Points)</option>';
                html += '      <option value="PERCENTAGE"' + (p && p.volatility.mode === 'PERCENTAGE' ? ' selected' : '') + '>' + I18n.t('percentage') + ' (%)</option>';
                html += '    </select></div>';
                html += '    <div class="form-group"><label>' + I18n.t('volatility_threshold_label') + '</label>';
                html += '      <input type="number" name="volatility_threshold" class="form-control" step="0.1" value="' + (p ? p.volatility.threshold_value : 100) + '"></div>';
                html += '    <div class="rule-tip">' + I18n.t('rule_tip_pricing_volatility') + '</div>';
                html += '  </div>';

                // 右侧：产品选择
                html += '  <div class="rule-main">';
                html += '    <div class="form-group" style="margin-bottom:0;"><label>' + I18n.t('monitor_symbols_label') + '</label>';
                html += '      <div class="tag-input-panel-info">' + I18n.t('tag_input_help') + '</div>';
                html += this.renderTagInput('pricing_scope', p ? (p.pricing.scope || []) : []);
                html += '    </div>';
                html += '  </div>';
                html += '</div>';
                break;


            case 'nop_limit':
                html += '<div class="rule-form-split">';
                // 左侧：参数设置
                html += '  <div class="rule-sidebar">';
                if (dataSourceHtml) html += dataSourceHtml;
                html += '    <div class="form-group"><label>' + I18n.t('platform_type_label') + '</label><select name="platform_type" class="form-control">';
                html += '      <option value="MT4"' + (p && p.platform_type === 'MT4' ? ' selected' : '') + '>MT4 (' + I18n.t('coefficient') + ': 100)</option>';
                html += '      <option value="MT5"' + (p && p.platform_type === 'MT5' ? ' selected' : '') + '>MT5 (' + I18n.t('coefficient') + ': 10000)</option>';
                html += '    </select></div>';
                html += '    <div class="form-group"><label>' + I18n.t('nop_threshold_label') + ' *</label>';
                html += '      <input type="number" name="nop_threshold" class="form-control" value="' + (p ? p.nop_threshold : 5000) + '" required></div>';
                html += '    <div class="form-group"><label>' + I18n.t('calculation_frequency_label') + ' (' + I18n.t('unit_seconds') + ')</label>';
                html += '      <input type="number" name="calculation_frequency" class="form-control" value="' + (p ? p.calculation_frequency : 5) + '"></div>';
                html += '    <div class="form-group"><label>' + I18n.t('alert_cooldown_label') + ' (' + I18n.t('unit_seconds') + ')</label>';
                html += '      <input type="number" name="alert_cooldown" class="form-control" value="' + (p ? p.alert_cooldown : 300) + '"></div>';
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
                html += '<div class="form-group"><label>' + I18n.t('alert_priority_label') + '</label><select name="alert_priority" class="form-control">';
                html += '<option value="HIGH"' + (p && p.alert_priority === 'HIGH' ? ' selected' : '') + '>' + I18n.t('high') + ' (' + I18n.t('red') + ')</option>';
                html += '<option value="INFO"' + (p && p.alert_priority === 'INFO' ? ' selected' : '') + '>' + I18n.t('normal') + ' (' + I18n.t('blue') + ')</option>';
                html += '</select></div>';
                html += '<div class="form-group"><label>' + I18n.t('min_lots_limit_label') + '</label>';
                html += '<input type="number" name="lots_min_limit" class="form-control" step="0.01" value="' + (p ? p.lots_min_limit : 0.01) + '"></div>';
                html += '<div class="rule-tip">' + I18n.t('rule_tip_watch_list') + '</div>';
                break;

            case 'reverse_positions':
                html += '<div class="form-group"><label>' + I18n.t('max_reverse_interval_label') + ' (' + I18n.t('unit_seconds') + ')*</label>';
                html += '<input type="number" name="max_reverse_interval" class="form-control" value="' + (p ? p.max_reverse_interval : 5) + '" required></div>';
                html += '<div class="form-group"><label>' + I18n.t('min_reverse_lot_label') + '</label>';
                html += '<input type="number" name="min_reverse_lot" class="form-control" step="0.1" value="' + (p ? p.min_reverse_lot : 1) + '"></div>';
                html += '<div class="form-group"><label>' + I18n.t('min_reverse_value_usd_label') + '</label>';
                html += '<input type="number" name="min_reverse_value_usd" class="form-control" value="' + (p ? p.min_reverse_value_usd : 10000) + '"></div>';
                html += '<div class="form-group"><label>' + I18n.t('cooldown_period_label') + ' (' + I18n.t('unit_seconds') + ')</label>';
                html += '<input type="number" name="cooldown_period" class="form-control" value="' + (p ? p.cooldown_period : 60) + '"></div>';
                html += '<div class="rule-tip">' + I18n.t('rule_tip_reverse_positions') + '</div>';
                break;

            case 'deposit_withdrawal':
                html += '<div class="form-group"><label>' + I18n.t('deposit_threshold_label') + ' (USD)*</label>';
                html += '<input type="number" name="deposit_threshold" class="form-control" value="' + (p ? p.deposit_threshold : 10000) + '" required></div>';
                html += '<div class="form-group"><label>' + I18n.t('withdrawal_threshold_label') + ' (USD)*</label>';
                html += '<input type="number" name="withdrawal_threshold" class="form-control" value="' + (p ? p.withdrawal_threshold : 5000) + '" required></div>';
                html += '<div class="form-group"><label>' + I18n.t('include_keywords_label') + ' (' + I18n.t('comma_separated') + ')</label>';
                html += '<input type="text" name="include_keywords" class="form-control" value="' + (p ? p.include_keywords.join(',') : 'Deposit,Withdraw,External') + '"></div>';
                html += '<div class="form-group"><label>' + I18n.t('exclude_keywords_label') + ' (' + I18n.t('comma_separated') + ')</label>';
                html += '<input type="text" name="exclude_keywords" class="form-control" value="' + (p ? p.exclude_keywords.join(',') : 'Transfer,Adjustment') + '"></div>';
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

        var typeInfo = this.ruleTypes[ruleType];
        var parameters = this.extractParameters(formData, ruleType);

        if (ruleId) {
            // 编辑
            var rule = MockData.rules.find(function (r) { return r.rule_id === ruleId; });
            if (rule) {
                rule.parameters = parameters;
                App.showToast('success', I18n.t('rule_updated'));
            }
        } else {
            // 新增
            var newRule = {
                rule_id: 'R' + (this.ruleIdCounter++),
                source_id: sourceId,
                rule_type: ruleType,
                name: I18n.t(ruleType),
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
                p.cent_account_groups = formData.get('cent_account_groups') ? formData.get('cent_account_groups').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
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
                p.max_remind_count = parseInt(formData.get('max_remind_count')) || 1;
                p.calculation_mode = 'ONLY_POSITIONS';
                break;

            case 'pricing_volatility':
                p.pricing = {
                    stop_pricing_duration: parseInt(formData.get('stop_pricing_duration')),
                    scope: formData.get('pricing_scope') ? formData.get('pricing_scope').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : []
                };
                p.volatility = {
                    mode: formData.get('volatility_mode'),
                    threshold_value: parseFloat(formData.get('volatility_threshold')) || 100,
                    time_window: 'M1',
                    digits_auto_detect: true
                };
                break;

            case 'nop_limit':
                p.symbol_filter = formData.get('symbol_filter') ? formData.get('symbol_filter').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                p.platform_type = formData.get('platform_type');
                p.nop_threshold = parseFloat(formData.get('nop_threshold'));
                p.calculation_frequency = parseInt(formData.get('calculation_frequency')) || 5;
                p.alert_cooldown = parseInt(formData.get('alert_cooldown')) || 300;
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
                p.symbol_match_level = 'EXACT_MATCH';
                p.cooldown_period = parseInt(formData.get('cooldown_period')) || 60;
                break;

            case 'deposit_withdrawal':
                p.deposit_threshold = parseFloat(formData.get('deposit_threshold'));
                p.withdrawal_threshold = parseFloat(formData.get('withdrawal_threshold'));
                p.include_keywords = formData.get('include_keywords') ? formData.get('include_keywords').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
                p.exclude_keywords = formData.get('exclude_keywords') ? formData.get('exclude_keywords').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; }) : [];
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
    }
};
