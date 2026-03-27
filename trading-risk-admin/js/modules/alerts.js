// 告警记录模块 - 支持10种新告警类型

const AlertsModule = {
    currentPage: 1,
    pageSize: 10,
    filters: {
        rule_type: 'all',
        status: 'all',
        platform: 'all',
        company: 'all',
        datasource: 'all',
        date_start: '',
        date_end: ''
    },

    // 列配置
    defaultColumns: [
        { id: 'alert_id', label: '告警ID', visible: true, fixed: 'left', sortable: false, order: 1 },
        { id: 'custom_name', label: '规则名称', visible: true, fixed: false, sortable: true, order: 2 },
        { id: 'company_name', label: '公司', visible: true, fixed: false, sortable: false, order: 3 },
        { id: 'datasource', label: '数据源', visible: false, fixed: false, sortable: false, order: 4 },
        { id: 'rule_type', label: '告警类型', visible: true, fixed: false, sortable: false, order: 5 },
        { id: 'platform', label: '平台', visible: true, fixed: false, sortable: false, order: 6 },
        { id: 'account_id', label: '账户ID', visible: true, fixed: false, sortable: false, order: 7 },
        { id: 'product', label: '品种', visible: true, fixed: false, sortable: false, order: 8 },
        { id: 'trigger_value', label: '触发值', visible: true, fixed: false, sortable: false, order: 9 },
        { id: 'details', label: '详情', visible: false, fixed: false, sortable: false, order: 10 },
        { id: 'trigger_time', label: '触发时间', visible: true, fixed: false, sortable: true, order: 11 },
        { id: 'status', label: '状态', visible: true, fixed: false, sortable: true, order: 12 },
        { id: 'actions', label: '操作', visible: true, fixed: 'right', sortable: false, order: 13 }
    ],
    columns: null,
    searchKeyword: '',
    sortBy: 'trigger_time',
    sortDesc: true,

    init() {
        if (!this.columns) {
            var stored = localStorage.getItem('alertColumns_v3');
            if (stored) {
                try {
                    var parsed = JSON.parse(stored);
                    if (parsed && parsed.length === this.defaultColumns.length) {
                        // 强制重置: 清除旧版缓存中可能损坏的 fixed 属性
                        this.columns = this.defaultColumns.map(function(def) {
                            var saved = parsed.find(function(p){ return p.id === def.id; });
                            return saved ? Object.assign({}, def, { visible: saved.visible, order: saved.order }) : Object.assign({}, def);
                        });
                    }
                } catch (e) {}
            }
            if (!this.columns) {
                this.columns = JSON.parse(JSON.stringify(this.defaultColumns));
            }
        }
    },

    initFilters: function () {
        // 1. 根据用户要求，默认时间为空，不再自动初始化为最近一个月
        /*
        if (!this.filters.date_end) {
            var now = new Date();
            var lastMonth = new Date();
            lastMonth.setMonth(now.getMonth() - 1);

            this.filters.date_end = now.toISOString().split('T')[0];
            this.filters.date_start = lastMonth.toISOString().split('T')[0];
        }
        */
    },

    // 告警类型映射
    ruleTypes: {
        'large_trade_lots': { name: 'Large Trade (手数)', icon: '<i data-lucide="coins" style="width:14px;height:14px;vertical-align:-2px;stroke:#818cf8"></i>', color: 'primary' },
        'large_trade_usd': { name: 'Large Trade (USD)', icon: '<i data-lucide="dollar-sign" style="width:14px;height:14px;vertical-align:-2px;stroke:#34d399"></i>', color: 'success' },
        'liquidity_trade': { name: 'Liquidity Trade', icon: '<i data-lucide="waves" style="width:14px;height:14px;vertical-align:-2px;stroke:#60a5fa"></i>', color: 'info' },
        'scalping': { name: 'Scalping', icon: '<i data-lucide="zap" style="width:14px;height:14px;vertical-align:-2px;stroke:#fbbf24"></i>', color: 'warning' },
        'exposure_alert': { name: 'Exposure Alert', icon: '<i data-lucide="activity" style="width:14px;height:14px;vertical-align:-2px;stroke:#f87171"></i>', color: 'danger' },
        'pricing': { name: 'Pricing', icon: '<i data-lucide="timer" style="width:14px;height:14px;vertical-align:-2px;stroke:#94a3b8"></i>', color: 'secondary' },
        'volatility': { name: 'Volatility', icon: '<i data-lucide="trending-up" style="width:14px;height:14px;vertical-align:-2px;stroke:#fbbf24"></i>', color: 'warning' },
        'nop_limit': { name: 'NOP Limit', icon: '<i data-lucide="ruler" style="width:14px;height:14px;vertical-align:-2px;stroke:#64748b"></i>', color: 'dark' },
        'watch_list': { name: 'Watch List', icon: '<i data-lucide="eye" style="width:14px;height:14px;vertical-align:-2px;stroke:#818cf8"></i>', color: 'primary' },
        'reverse_positions': { name: 'Reverse Positions', icon: '<i data-lucide="arrow-left-right" style="width:14px;height:14px;vertical-align:-2px;stroke:#fbbf24"></i>', color: 'warning' },
        'deposit_withdrawal': { name: 'Deposit & Withdrawal', icon: '<i data-lucide="credit-card" style="width:14px;height:14px;vertical-align:-2px;stroke:#34d399"></i>', color: 'success' }
    },

    render() {
        // 每次渲染重置列配置，确保从 defaultColumns 最新定义重新合并（防止 SPA 内存残留）
        this.columns = null;
        this.init();
        this.initFilters();
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var alerts = MockData.filterBySource(MockData.alerts, sourceIds);
        var newAlerts = alerts.filter(function (a) { return a.status === 'new'; }).length;
        var self = this;

        // 获取可用公司列表
        var companies = MockData.getUserCompanies(user);

        var html = '<div class="filter-bar">';
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('company_label') + '：</span>';
        html += '<select class="filter-select" id="companyFilter" onchange="AlertsModule.applyFilters()">';
        html += '<option value="all">' + I18n.t('all_companies') + '</option>';
        companies.forEach(function (c) {
            html += '<option value="' + c.company_id + '">' + c.company_name + '</option>';
        });
        html += '</select></div>';
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('datasource_label') + '：</span>';
        html += '<select class="filter-select" id="datasourceFilter" onchange="AlertsModule.applyFilters()">';
        html += '<option value="all">' + I18n.t('all_datasources') + '</option>';
        var dataSources = MockData.filterBySource(MockData.dataSources, sourceIds);
        dataSources.forEach(function (ds) {
            html += '<option value="' + ds.source_id + '">' + ds.source_name + '</option>';
        });
        html += '</select></div>';
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('rule_type_label') + '：</span>';
        html += '<select class="filter-select" id="ruleTypeFilter" onchange="AlertsModule.applyFilters()">';
        html += '<option value="all">' + I18n.t('all_types') + '</option>';
        Object.keys(this.ruleTypes).forEach(function (key) {
            html += '<option value="' + key + '">' + I18n.t(key) + '</option>';
        });
        html += '</select></div>';
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('status_label') + '：</span>';
        html += '<select class="filter-select" id="statusFilter" onchange="AlertsModule.applyFilters()">';
        html += '<option value="all">' + I18n.t('all_status') + '</option>';
        html += '<option value="new">' + I18n.t('status_new') + '</option>';
        html += '<option value="reviewed">' + I18n.t('status_reviewed') + '</option>';
        html += '<option value="ignored">' + I18n.t('status_ignored') + '</option>';
        html += '</select></div>';
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('platform_label') + '：</span>';
        html += '<select class="filter-select" id="platformFilter" onchange="AlertsModule.applyFilters()">';
        html += '<option value="all">' + I18n.t('all_platforms') + '</option>';
        html += '<option value="MT4">MT4</option>';
        html += '<option value="MT5">MT5</option>';
        html += '</select></div>';
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('time_range_label') + '：</span>';
        html += '<input type="date" class="filter-select" id="dateStartFilter" value="' + this.filters.date_start + '" onchange="AlertsModule.applyFilters()">';
        html += '<span style="color:var(--text-muted);"> ' + I18n.t('to') + ' </span>';
        html += '<input type="date" class="filter-select" id="dateEndFilter" value="' + this.filters.date_end + '" onchange="AlertsModule.applyFilters()">';
        html += '</div>';
        html += '<div class="filter-group" style="margin-left: auto; display: flex; align-items: center; gap: 8px;">';
        html += '<span class="filter-label">名称搜索：</span>';
        html += '<input type="text" class="filter-select" id="alertSearchInput" placeholder="搜索规则名称..." value="' + (this.searchKeyword || '') + '" oninput="AlertsModule.onSearch(this.value)" style="width:140px;">';
        html += '</div>';
        html += '<button class="btn btn-secondary" onclick="AlertsModule.exportData()">📥 ' + I18n.t('export') + '</button>';
        html += '<button class="btn btn-secondary" onclick="AlertsModule.openColumnSettings()" title="列设置">⚙️ 列设置</button>';
        html += '</div>';

        html += '<div class="card">';
        html += '<div class="card-header">';
        html += '<h3 class="card-title">🔔 ' + I18n.t('alert_records') + '</h3>';
        html += '<div style="display: flex; align-items: center; gap: var(--spacing-md);">';
        html += '<span class="badge badge-danger">' + newAlerts + ' ' + I18n.t('status_new') + '</span>';
        html += '<span class="badge badge-info">' + alerts.length + ' ' + I18n.t('total') + '</span>';
        html += '</div></div>';
        html += '<div class="card-body" style="padding: 0;">';
        var self2 = this;
        var activeCols = this.columns.slice().sort(function(a,b){return a.order-b.order;}).filter(function(c){return c.visible;});
        html += '<div style="width:100%;overflow-x:auto;">';
        html += '<table class="table" style="min-width:900px;width:100%;">';
        html += '<thead><tr>';
        activeCols.forEach(function(col) {
            var thStyle = 'background:var(--bg-color-alt);white-space:nowrap;';
            if (col.fixed === 'left') thStyle += 'position:sticky;left:0;z-index:3;box-shadow:2px 0 4px rgba(0,0,0,0.12);';
            if (col.fixed === 'right') thStyle += 'position:sticky;right:0;z-index:3;box-shadow:-2px 0 4px rgba(0,0,0,0.12);';
            var sortIcon = '';
            if (col.sortable) {
                if (self2.sortBy === col.id) {
                    sortIcon = self2.sortDesc ? ' <span style="cursor:pointer;" onclick="AlertsModule.toggleSort(\'' + col.id + '\')" title="切换排序">↓</span>' : ' <span style="cursor:pointer;" onclick="AlertsModule.toggleSort(\'' + col.id + '\')" title="切换排序">↑</span>';
                } else {
                    sortIcon = ' <span style="cursor:pointer;opacity:0.4;" onclick="AlertsModule.toggleSort(\'' + col.id + '\')" title="点击排序">↕</span>';
                }
            }
            html += '<th style="' + thStyle + '">' + col.label + sortIcon + '</th>';
        });
        html += '</tr></thead><tbody id="alertTableBody">';
        html += this.renderTableRows();
        html += '</tbody></table></div></div></div>';
        html += this.renderPagination();
        return html;
    },

    onSearch(val) {
        this.searchKeyword = (val || '').trim();
        this.currentPage = 1;
        this.refresh();
    },

    toggleSort(colId) {
        if (this.sortBy === colId) {
            this.sortDesc = !this.sortDesc;
        } else {
            this.sortBy = colId;
            this.sortDesc = true;
        }
        this.refresh();
    },

    getFilteredAlerts() {
        var self = this;
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var results = MockData.filterBySource(MockData.alerts, sourceIds);

        // 预计算额外字段
        results.forEach(function(a) {
            var src = MockData.dataSources.find(function(ds){ return ds.source_id === a.source_id; });
            a._companyName = src ? Utils.getCompanyName(src.company_id) : '-';
            a._sourceName = src ? src.source_name : '-';
            var rule = MockData.rules ? MockData.rules.find(function(r){ return r.rule_id === a.rule_id; }) : null;
            a._customName = rule ? (rule.custom_name || rule.name || a.rule_type) : a.rule_type;
        });

        results = results.filter(function(a) {
            if (self.filters.company !== 'all') {
                var src = MockData.dataSources.find(function(ds){ return ds.source_id === a.source_id; });
                if (!src || src.company_id !== self.filters.company) return false;
            }
            if (self.filters.datasource !== 'all' && a.source_id !== self.filters.datasource) return false;
            if (self.filters.rule_type !== 'all' && a.rule_type !== self.filters.rule_type) return false;
            if (self.filters.status !== 'all' && a.status !== self.filters.status) return false;
            if (self.filters.platform !== 'all' && a.platform !== self.filters.platform) return false;
            var triggerDate = a.trigger_time.split(' ')[0];
            if (self.filters.date_start && triggerDate < self.filters.date_start) return false;
            if (self.filters.date_end && triggerDate > self.filters.date_end) return false;

            // 关键词搜索（规则名称 + 告警ID）
            if (self.searchKeyword) {
                var kw = self.searchKeyword.toLowerCase();
                var matchName = a._customName && a._customName.toLowerCase().indexOf(kw) > -1;
                var matchId = a.alert_id && a.alert_id.toLowerCase().indexOf(kw) > -1;
                if (!matchName && !matchId) return false;
            }
            return true;
        });

        // 排序
        var sortKey = this.sortBy;
        var desc = this.sortDesc;
        results.sort(function(a, b) {
            var va, vb;
            if (sortKey === 'custom_name') { va = a._customName || ''; vb = b._customName || ''; }
            else { va = a[sortKey] || ''; vb = b[sortKey] || ''; }
            if (va < vb) return desc ? 1 : -1;
            if (va > vb) return desc ? -1 : 1;
            return 0;
        });

        return results;
    },

    renderTableRows() {
        var self = this;
        var filtered = this.getFilteredAlerts();
        var start = (this.currentPage - 1) * this.pageSize;
        var paged = filtered.slice(start, start + this.pageSize);

        var activeCols = this.columns.slice().sort(function(a,b){return a.order-b.order;}).filter(function(c){return c.visible;});

        if (paged.length === 0) {
            return '<tr><td colspan="' + activeCols.length + '" style="text-align:center;padding:32px;color:var(--text-muted);">暂无告警记录</td></tr>';
        }

        return paged.map(function(alert) {
            var typeInfo = self.ruleTypes[alert.rule_type] || { name: alert.rule_type, icon: '', color: 'secondary' };
            var statusClass = alert.status === 'new' ? 'danger' : alert.status === 'reviewed' ? 'active' : 'warning';
            var source = MockData.dataSources.find(function(ds){ return ds.source_id === alert.source_id; });
            var companyName = alert._companyName || (source ? Utils.getCompanyName(source.company_id) : '-');
            var sourceName = alert._sourceName || (source ? source.source_name : '-');
            var customName = alert._customName || alert.rule_type;

            var row = '<tr>';
            activeCols.forEach(function(col) {
                var tdStyle = 'white-space:nowrap;';
                if (col.fixed === 'left') tdStyle += 'position:sticky;left:0;z-index:2;background:var(--card-bg);box-shadow:2px 0 4px rgba(0,0,0,0.12);';
                if (col.fixed === 'right') tdStyle += 'position:sticky;right:0;z-index:2;background:var(--card-bg);box-shadow:-2px 0 4px rgba(0,0,0,0.12);';
                var cell = '';
                switch(col.id) {
                    case 'alert_id':
                        cell = '<code style="font-size:11px;">' + alert.alert_id + '</code>' + (alert.status === 'new' ? ' <span class="badge badge-danger" style="font-size:10px;">NEW</span>' : '');
                        break;
                    case 'custom_name':
                        cell = '<strong>' + customName + '</strong>';
                        break;
                    case 'company_name':
                        cell = '<span class="badge badge-secondary">' + companyName + '</span>';
                        break;
                    case 'datasource':
                        cell = '<span class="badge badge-info">' + sourceName + '</span>';
                        break;
                    case 'rule_type':
                        cell = '<span class="badge badge-' + typeInfo.color + '">' + typeInfo.icon + ' ' + typeInfo.name + '</span>';
                        break;
                    case 'platform':
                        cell = '<span class="badge badge-' + (alert.platform === 'MT4' ? 'primary' : 'success') + '">' + alert.platform + '</span>';
                        break;
                    case 'account_id':
                        cell = '<code>' + alert.account_id + '</code>';
                        break;
                    case 'product':
                        cell = '<strong>' + alert.product + '</strong>';
                        break;
                    case 'trigger_value':
                        cell = '<strong>' + self.formatTriggerValue(alert) + '</strong>';
                        break;
                    case 'details':
                        cell = self.formatDetails(alert);
                        break;
                    case 'trigger_time':
                        cell = '<span style="font-size:12px;font-family:monospace;">' + alert.trigger_time + '</span>';
                        break;
                    case 'status':
                        cell = '<span class="status-dot ' + statusClass + '"></span>' + self.getStatusText(alert.status);
                        break;
                    case 'actions':
                        cell = '<div style="display:flex;gap:4px;">';
                        if (alert.status === 'new') {
                            cell += '<button class="btn btn-sm btn-success" onclick="AlertsModule.updateStatus(\'' + alert.alert_id + '\', \'reviewed\')">✓</button>';
                            cell += '<button class="btn btn-sm btn-secondary" onclick="AlertsModule.updateStatus(\'' + alert.alert_id + '\', \'ignored\')">✕</button>';
                        }
                        cell += '<button class="btn btn-sm btn-secondary" onclick="AlertsModule.viewDetail(\'' + alert.alert_id + '\')">详情</button>';
                        cell += '</div>';
                        break;
                    default:
                        cell = '-';
                }
                row += '<td style="' + tdStyle + '">' + cell + '</td>';
            });
            row += '</tr>';
            return row;
        }).join('');
    },

    openColumnSettings() {
        var self = this;
        // 删除已存在弹窗
        var existing = document.getElementById('colSettingsModal');
        if (existing) existing.remove();

        var modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'colSettingsModal';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';

        var sorted = this.columns.slice().sort(function(a,b){return a.order-b.order;});
        var rows = sorted.map(function(col, idx) {
            var disabled = col.fixed ? 'disabled' : '';
            var checked = col.visible ? 'checked' : '';
            return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border-color);">' +
                '<input type="checkbox" id="col_' + col.id + '" ' + checked + ' ' + disabled + ' onchange="AlertsModule._colToggle(\'' + col.id + '\', this.checked)">' +
                '<label for="col_' + col.id + '" style="flex:1;cursor:' + (disabled ? 'default' : 'pointer') + ';' + (col.fixed ? 'opacity:0.6;' : '') + '">' + col.label + (col.fixed ? ' (固定)' : '') + '</label>' +
                (!col.fixed ? '<button onclick="AlertsModule._colMove(\'' + col.id + '\',-1)" style="padding:2px 8px;cursor:pointer;" title="上移">↑</button>' +
                '<button onclick="AlertsModule._colMove(\'' + col.id + '\',1)" style="padding:2px 8px;cursor:pointer;" title="下移">↓</button>' : '') +
                '</div>';
        }).join('');

        modal.innerHTML = '<div style="background:var(--card-bg);border-radius:12px;padding:24px;width:380px;max-height:80vh;overflow-y:auto;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
            '<h3 style="margin:0;">⚙️ 列设置</h3>' +
            '<button onclick="document.getElementById(\'colSettingsModal\').remove()" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--text-muted);">✕</button>' +
            '</div>' +
            '<p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">勾选显示的列，点击↑↓调整顺序</p>' +
            rows +
            '<div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end;">' +
            '<button class="btn btn-secondary" onclick="document.getElementById(\'colSettingsModal\').remove()">取消</button>' +
            '<button class="btn btn-primary" onclick="AlertsModule._colSave()">保存</button>' +
            '</div></div>';
        document.body.appendChild(modal);
    },

    _colToggle(colId, visible) {
        var col = this.columns.find(function(c){ return c.id === colId; });
        if (col) col.visible = visible;
    },

    _colMove(colId, dir) {
        var sorted = this.columns.slice().sort(function(a,b){return a.order-b.order;});
        var nonFixed = sorted.filter(function(c){ return !c.fixed; });
        var idx = nonFixed.findIndex(function(c){ return c.id === colId; });
        var swapIdx = idx + dir;
        if (swapIdx < 0 || swapIdx >= nonFixed.length) return;
        var tmp = nonFixed[idx].order;
        nonFixed[idx].order = nonFixed[swapIdx].order;
        nonFixed[swapIdx].order = tmp;
        // 刷新弹窗
        document.getElementById('colSettingsModal').remove();
        this.openColumnSettings();
    },

    _colSave() {
        localStorage.setItem('alertColumns_v3', JSON.stringify(this.columns));
        document.getElementById('colSettingsModal').remove();
        this.refresh();
    },



    renderPagination() {
        var total = this.getFilteredAlerts().length;
        var pages = Math.ceil(total / this.pageSize);
        if (pages <= 1) return '';

        var html = '<div class="pagination">';
        html += '<button class="pagination-btn" onclick="AlertsModule.goToPage(' + (this.currentPage - 1) + ')"' + (this.currentPage === 1 ? ' disabled' : '') + '>‹</button>';
        for (var i = 1; i <= pages; i++) {
            html += '<button class="pagination-btn' + (this.currentPage === i ? ' active' : '') + '" onclick="AlertsModule.goToPage(' + i + ')">' + i + '</button>';
        }
        html += '<button class="pagination-btn" onclick="AlertsModule.goToPage(' + (this.currentPage + 1) + ')"' + (this.currentPage === pages ? ' disabled' : '') + '>›</button>';
        html += '</div>';
        return html;
    },

    getStatusText(status) {
        var map = {
            new: I18n.t('status_new'),
            reviewed: I18n.t('status_reviewed'),
            ignored: I18n.t('status_ignored')
        };
        return map[status] || status;
    },

    formatTriggerValue(alert) {
        var t = alert.rule_type;
        var v = alert.trigger_value;
        var d = alert.details || {};

        // 1. Large Trade (Lots) - 手数 | 方向
        if (t === 'large_trade_lots') {
            var parts = [v + ' ' + I18n.t('lot_unit')];
            if (d.direction) parts.push(d.direction);
            return parts.join(' | ');
        }

        // 2. Large Trade (USD) - USD | 手数 | 账户类型
        if (t === 'large_trade_usd') {
            var parts = ['$' + Utils.formatNumber(Math.abs(v))];
            if (d.lots) parts.push(d.lots + I18n.t('lot_unit'));
            if (d.account_type) {
                var typeLabel = d.account_type === 'cent' ? I18n.t('cent_account') : I18n.t('standard_account');
                parts.push(typeLabel);
            }
            return parts.join(' | ');
        }

        // 3. Liquidity Trade - 手数 | 订单数 | 方向
        if (t === 'liquidity_trade') {
            var parts = [v + I18n.t('lot_unit')];
            if (d.order_count) parts.push(d.order_count + I18n.t('unit_orders'));
            if (d.direction) parts.push(d.direction);
            return parts.join(' | ');
        }

        // 4. Scalping - 时间 | 手数 | 盈利
        if (t === 'scalping') {
            var parts = [v + 's'];
            if (d.lots) parts.push(d.lots + I18n.t('lot_unit'));
            if (d.profit_usd !== undefined) {
                var profit = (d.profit_usd >= 0 ? '+$' : '-$') + Utils.formatNumber(Math.abs(d.profit_usd));
                parts.push(profit);
            }
            return parts.join(' | ');
        }

        // 5. Exposure Alert - USD | 方向 货币
        if (t === 'exposure_alert') {
            var parts = ['$' + Utils.formatNumber(Math.abs(v))];
            if (d.direction && d.currency) {
                parts.push(d.direction + ' ' + d.currency);
            }
            return parts.join(' | ');
        }

        // 6. Pricing - 停价显示
        if (t === 'pricing') {
            return v + 's | ' + I18n.t('pricing_stop');
        }

        // 7. Volatility - 分类显示
        if (t === 'volatility') {
            var val = d.change_points || d.change_percentage || v;
            var unit = d.change_points ? ' pts' : (d.change_percentage ? '%' : (String(v).indexOf('%') > 0 ? '' : ' pts'));
            return val + unit + ' | ' + (d.time_window || 'M1');
        }

        // 7. NOP Limit - 手数 | 方向 | USD
        if (t === 'nop_limit') {
            var parts = [];
            if (d.net_position) parts.push(d.net_position + I18n.t('lot_unit'));
            if (d.direction) parts.push(d.direction);
            parts.push('$' + Utils.formatNumber(v));
            return parts.join(' | ');
        }

        // 8. Watch List - 手数 | 方向 | 动作
        if (t === 'watch_list') {
            var parts = [v + ' ' + I18n.t('lot_unit')];
            if (d.direction) parts.push(d.direction);
            if (d.action) {
                var actionText = d.action === 'OPEN_TRADE' ? I18n.t('open_trade') : I18n.t('pending_order');
                parts.push(actionText);
            }
            return parts.join(' | ');
        }

        // 9. Reverse Positions - 时间 | 方向转换 | 手数变化
        if (t === 'reverse_positions') {
            var parts = [v + 's'];
            if (d.close_direction && d.open_direction) {
                parts.push(d.close_direction + '→' + d.open_direction);
            }
            if (d.close_lots && d.open_lots) {
                parts.push(d.close_lots + '→' + d.open_lots + I18n.t('lot_unit'));
            }
            return parts.join(' | ');
        }

        // 10. Deposit & Withdrawal - USD | 类型
        if (t === 'deposit_withdrawal') {
            var parts = ['$' + Utils.formatNumber(Math.abs(v))];
            if (d.type) {
                var typeText = d.type === 'DEPOSIT' ? I18n.t('deposit') : I18n.t('withdrawal');
                parts.push(typeText);
            }
            return parts.join(' | ');
        }

        return v;
    },

    formatDetails(alert) {
        var d = alert.details;
        if (!d) return '-';

        var t = alert.rule_type;
        if (t === 'large_trade_lots') return d.direction;
        if (t === 'large_trade_usd') {
            var info = d.lots + ' ' + I18n.t('unit_lots') + ' ' + d.account_currency;
            if (d.account_type) {
                info += ' [' + (d.account_type === 'cent' ? I18n.t('cent_account') : I18n.t('standard_account')) + ']';
            }
            return info;
        }
        if (t === 'liquidity_trade') return d.order_count + ' ' + I18n.t('unit_orders') + ' ' + d.direction;
        if (t === 'scalping') return I18n.t('profit_usd_min_label') + ' $' + d.profit_usd;
        if (t === 'exposure_alert') return d.currency + ' ' + d.direction;
        if (t === 'pricing') return I18n.t('pricing_stop');
        if (t === 'volatility') return d.time_window || 'M1';
        if (t === 'nop_limit') return d.direction + ' ' + d.net_position + ' ' + I18n.t('unit_lots');
        if (t === 'watch_list') return d.action + ' ' + d.direction;
        if (t === 'reverse_positions') return d.close_direction + '→' + d.open_direction;
        if (t === 'deposit_withdrawal') return d.type;
        return '-';
    },

    applyFilters() {
        this.filters.company = document.getElementById('companyFilter').value;
        this.filters.datasource = document.getElementById('datasourceFilter').value;
        this.filters.rule_type = document.getElementById('ruleTypeFilter').value;
        this.filters.status = document.getElementById('statusFilter').value;
        this.filters.platform = document.getElementById('platformFilter').value;
        if (document.getElementById('dateStartFilter')) {
            this.filters.date_start = document.getElementById('dateStartFilter').value;
        }
        if (document.getElementById('dateEndFilter')) {
            this.filters.date_end = document.getElementById('dateEndFilter').value;
        }
        this.currentPage = 1;
        this.refresh();
    },

    refresh() {
        document.getElementById('alertTableBody').innerHTML = this.renderTableRows();
    },

    goToPage(page) {
        var total = this.getFilteredAlerts().length;
        var pages = Math.ceil(total / this.pageSize);
        if (page < 1 || page > pages) return;
        this.currentPage = page;
        Router.refresh();
    },

    updateStatus(alertId, status) {
        var alert = MockData.alerts.find(function (a) { return a.alert_id === alertId; });
        if (alert) {
            alert.status = status;
            App.showToast('success', I18n.t('alert') + ' ' + alertId + ' ' + I18n.t('marked_as') + ' ' + this.getStatusText(status));
            this.refresh();
        }
    },

    viewDetail(alertId) {
        var alert = MockData.alerts.find(function (a) { return a.alert_id === alertId; });
        if (!alert) return;

        var typeInfo = this.ruleTypes[alert.rule_type] || { name: alert.rule_type, icon: '' };
        var d = alert.details || {};
        var source = MockData.dataSources.find(function (ds) { return ds.source_id === alert.source_id; });
        var companyName = source ? Utils.getCompanyName(source.company_id) : '-';
        var sourceName = source ? source.source_name : '-';
        var rule = MockData.rules.find(function (r) { return r.rule_id === alert.rule_id; });

        var TRADE_TYPES = ['large_trade_lots','large_trade_usd','liquidity_trade','scalping','reverse_positions','watch_list'];
        var hasTrades = TRADE_TYPES.indexOf(alert.rule_type) > -1;
        var trades = [];
        if (hasTrades && alert.account_id !== 'SYSTEM') {
            trades = MockData.trades.filter(function(t) {
                if (!( t.account_id === alert.account_id)) return false;
                if (alert.rule_type === 'scalping') return t.product_code === alert.product && t.trade_type === 'CLOSE';
                if (['liquidity_trade','large_trade_lots','large_trade_usd'].indexOf(alert.rule_type) > -1) {
                    var p = alert.product.split('.')[0];
                    return t.product_code === alert.product || t.product_code.startsWith(p);
                }
                return true;
            }).slice(0, 5);
        }

        var o = '';
        o += '<div style=\'display:grid;gap:var(--spacing-lg);max-height:70vh;overflow-y:auto;padding-right:8px;\'>';
        o += '<div class=\'trigger-value-highlight\'>';
        o += '<div class=\'trigger-label\'>' + I18n.t('triggered_value_label') + '</div>';
        o += '<div class=\'trigger-data\'>' + this.formatTriggerValue(alert) + '</div>';
        o += '<div style=\'font-size:13px;color:var(--text-muted);margin-top:4px;\'>' + this.formatDetails(alert) + '</div>';
        o += '</div>';

        o += '<section>';
        o += '<h4 style=\'margin:0 0 8px;border-left:4px solid var(--primary-color);padding-left:8px;\'><i data-lucide=\'user\' style=\'width:14px;height:14px;vertical-align:-2px;stroke:var(--color-info);\'></i> ' + I18n.t('customer_info') + '</h4>';
        o += '<div style=\'display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;\'>';
        o += '<div class=\'param-item\'><div class=\'param-label\'>' + I18n.t('account_id_label') + '</div><div class=\'param-value\'><code>' + alert.account_id + '</code></div></div>';
        o += '<div class=\'param-item\'><div class=\'param-label\'>' + I18n.t('company_label') + '</div><div class=\'param-value\'>' + companyName + '</div></div>';
        o += '<div class=\'param-item\'><div class=\'param-label\'>' + I18n.t('platform_label') + '</div><div class=\'param-value\'><span class=\'badge badge-' + (alert.platform === 'MT4' ? 'primary' : 'success') + '\'>' + alert.platform + '</span></div></div>';
        o += '<div class=\'param-item\'><div class=\'param-label\'>' + I18n.t('product_label') + '</div><div class=\'param-value\'><strong>' + alert.product + '</strong></div></div>';
        o += '<div class=\'param-item\'><div class=\'param-label\'>' + I18n.t('datasource_label') + '</div><div class=\'param-value\'>' + sourceName + '</div></div>';
        var gt = trades.find(function(t){ return t.group_name; });
        if (gt) o += '<div class=\'param-item\'><div class=\'param-label\'>Group</div><div class=\'param-value\' style=\'font-size:11px;font-family:monospace;\'>' + gt.group_name + '</div></div>';
        o += '<div class=\'param-item\'><div class=\'param-label\'>' + I18n.t('trigger_time_label') + '</div><div class=\'param-value\'>' + alert.trigger_time + '</div></div>';
        o += '<div class=\'param-item\'><div class=\'param-label\'>ID</div><div class=\'param-value\'><code style=\'font-size:11px;\'>' + alert.alert_id + '</code></div></div>';
        o += '</div></section>';

        if (rule) {
            o += '<section>';
            o += '<h4 style=\'margin:0 0 8px;border-left:4px solid var(--color-warning);padding-left:8px;\'><i data-lucide=\'settings\' style=\'width:14px;height:14px;vertical-align:-2px;stroke:var(--color-warning);\'></i> ' + I18n.t('triggered_rule_details') + '</h4>';
            o += '<div style=\'background:var(--card-bg);border:1px solid var(--border-color);padding:var(--spacing-md);border-radius:6px;\'>';
            o += '<div style=\'font-weight:600;margin-bottom:2px;\'>' + typeInfo.icon + ' ' + rule.name + '</div>';
            o += '<div style=\'font-size:12px;color:var(--text-muted);margin-bottom:10px;\'>' + rule.description + '</div>';
            o += '<div style=\'display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;\'>';
            if (typeof RulesModule !== 'undefined') {
                o += RulesModule.renderRuleParams(rule, alert.rule_type);
            } else {
                for (var k in rule.parameters) {
                    var v = rule.parameters[k];
                    if (Array.isArray(v)) v = v.join(', ') || I18n.t('all');
                    o += '<div class=\'param-item\'><div class=\'param-label\'>' + k + '</div><div class=\'param-value\'>' + v + '</div></div>';
                }
            }
            o += '</div></div></section>';
        }

        if (hasTrades) {
            o += '<section>';
            o += '<h4 style=\'margin:0 0 8px;border-left:4px solid var(--success-color);padding-left:8px;\'><i data-lucide=\'list\' style=\'width:14px;height:14px;vertical-align:-2px;stroke:var(--success-color);\'></i> ' + I18n.t('related_trades') + '</h4>';
            if (trades.length === 0) {
                o += '<div style=\'padding:16px;text-align:center;color:var(--text-muted);font-size:13px;border:1px dashed var(--border-color);border-radius:6px;\'>' + I18n.t('no_related_trades') + '</div>';
            } else {
                o += '<div class=\'table-container\' style=\'border:1px solid var(--border-color);border-radius:6px;\'>';
                o += '<table class=\'table\' style=\'font-size:12px;\'><thead><tr>';
                o += '<th>' + I18n.t('trade_id_header') + '</th><th>' + I18n.t('trade_type_header') + '</th><th>' + I18n.t('direction_header') + '</th><th>' + I18n.t('lots_header') + '</th><th>' + I18n.t('open_price_header') + '</th><th>' + I18n.t('close_price_header') + '</th><th>' + I18n.t('holding_time_header') + '</th><th>' + I18n.t('profit_usd_header') + '</th>';
                o += '</tr></thead><tbody>';
                trades.forEach(function(t) {
                    var dc = t.direction==='BUY'?'#22c55e':'#ef4444';
                    var db = t.direction==='BUY'?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)';
                    var tc = t.trade_type==='OPEN'?'#818cf8':'#94a3b8';
                    var tb = t.trade_type==='OPEN'?'rgba(129,140,248,0.12)':'rgba(148,163,184,0.12)';
                    var hs = t.holding_seconds;
                    var hstr = hs==null?'-':(hs<60?hs+'s':hs<3600?Math.floor(hs/60)+'m'+(hs%60)+'s':Math.floor(hs/3600)+'h'+Math.floor((hs%3600)/60)+'m');
                    var pnl = t.deal_usd!=null?((t.deal_usd>=0?'+$':'-$')+Utils.formatNumber(Math.abs(t.deal_usd))):'-';
                    var pc = t.deal_usd!=null?(t.deal_usd>=0?'#22c55e':'#ef4444'):'';
                    o += '<tr>';
                    o += '<td><code style=\'font-size:11px;\'>' + t.trade_id + '</code></td>';
                    o += '<td><span style=\'padding:1px 6px;border-radius:4px;background:'+tb+';color:'+tc+';font-weight:600;font-size:11px;\'>' + (t.trade_type||'-') + '</span></td>';
                    o += '<td><span style=\'padding:2px 8px;border-radius:4px;background:'+db+';color:'+dc+';font-weight:700;font-size:12px;\'>' + (t.direction||'-') + '</span></td>';
                    o += '<td><strong>' + t.volume_lot + '</strong></td>';
                    o += '<td>' + (t.open_price!=null?t.open_price:'-') + '</td>';
                    o += '<td>' + (t.close_price!=null?t.close_price:'<span style=\'color:var(--text-muted)\'>持仓中</span>') + '</td>';
                    o += '<td>' + hstr + '</td>';
                    o += '<td style=\'color:'+pc+';font-weight:600;\'>' + pnl + '</td>';
                    o += '</tr>';
                });
                o += '</tbody></table></div>';
            }
            o += '</section>';
        }

        o += '</div>';
        App.showModal(I18n.t('alert_detail_title') + ' - ' + alert.alert_id, o);
    },
    exportData() {
        var alerts = this.getFilteredAlerts();
        var csv = 'alert_id,company,rule_type,platform,account_id,product,trigger_value,trigger_time,status\n';
        csv += alerts.map(function (a) {
            var source = MockData.dataSources.find(function (ds) { return ds.source_id === a.source_id; });
            var companyName = source ? Utils.getCompanyName(source.company_id) : '';
            return [a.alert_id, companyName, a.rule_type, a.platform, a.account_id, a.product, a.trigger_value, a.trigger_time, a.status].join(',');
        }).join('\n');

        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = 'alerts_export.csv';
        link.click();
        App.showToast('success', I18n.t('exported_prefix') + ' ' + alerts.length + ' ' + I18n.t('exported_suffix'));
    }
};
