const fs = require('fs');
let code = fs.readFileSync('js/modules/alerts.js', 'utf8');

// 1. 注入属性
let insertProps = `    defaultColumns: [
        { id: 'alert_id', label: '告警ID', visible: true, fixed: true, order: 1 },
        { id: 'custom_name', label: '规则名称', visible: true, order: 2, sortable: true },
        { id: 'company_name', label: I18n.t('company_label'), visible: true, order: 3 },
        { id: 'rule_type', label: I18n.t('rule_type'), visible: true, order: 4 },
        { id: 'platform', label: I18n.t('platform_label'), visible: true, order: 5 },
        { id: 'account_id', label: I18n.t('account_id_label'), visible: true, order: 6 },
        { id: 'product', label: I18n.t('product_label'), visible: true, order: 7 },
        { id: 'trigger_value', label: I18n.t('triggered_value_label'), visible: true, order: 8 },
        { id: 'trigger_time', label: I18n.t('trigger_time_label'), visible: true, order: 9, sortable: true },
        { id: 'status', label: I18n.t('status_label'), visible: true, order: 10, sortable: true },
        { id: 'actions', label: I18n.t('action_label'), visible: true, fixed: true, order: 11 }
    ],
    columns: null,
    search_keyword: '',
    currentSortBy: '',
    sortDesc: true,

    init() {
        if (!this.columns) {
            var stored = localStorage.getItem('alertsColumns');
            if (stored) {
                try { this.columns = JSON.parse(stored); } catch(e){}
            }
            if (!this.columns || this.columns.length !== this.defaultColumns.length) {
                this.columns = JSON.parse(JSON.stringify(this.defaultColumns));
            }
        }
    },
`;
code = code.replace(/const AlertsModule = \{/, 'const AlertsModule = {\\n' + insertProps);

// 2. 注入 render() 第一步调用 this.init();
if(code.indexOf('render() {\\r\n        this.initFilters();') > -1 || code.indexOf('render() {\n        this.initFilters();') > -1) {
    code = code.replace(/    render\(\) \{\r?\n        this\.initFilters\(\);/, '    render() {\n        this.init();\n        this.initFilters();');
} else {
    // 强制正则
    code = code.replace(/    render\(\) \{[\s\n\r]*this\.initFilters\(\);/, '    render() {\n        this.init();\n        this.initFilters();');
}


// 3. 搜索与列设置按钮注入
let searchHtml = `
        html += '<div class="filter-group"><span class="filter-label">名称搜索：</span>';
        html += '<input type="text" class="form-control" id="ruleNameSearch" placeholder="搜索规则名称..." value="' + (this.search_keyword||'') + '" onkeyup="AlertsModule.updateSearch(this.value)" style="width: 140px; display: inline-block;"></div>';
        html += '<button class="btn btn-secondary" onclick="AlertsModule.exportData()" style="margin-left: auto;">📥 ' + I18n.t('export') + '</button>';
        html += '<button class="btn btn-secondary" onclick="AlertsModule.openColumnSettings()" style="margin-left: 8px;">⚙️ 列设置</button>';
        html += '</div>';
`;
code = code.replace(/        html \+= '<button class="btn btn-secondary" onclick="AlertsModule\.exportData\(\)" style="margin-left: auto;">📥 ' \+ I18n\.t\('export'\) \+ '<\/button>';\s*html \+= '<\/div>';/, searchHtml);


// 4. 重建 getFilteredAlerts
let newGetFiltered = `    updateSearch(val) { this.search_keyword = val.trim(); this.applyFilters(); },
    toggleSort(colId) {
        if (this.currentSortBy === colId) { this.sortDesc = !this.sortDesc; }
        else { this.currentSortBy = colId; this.sortDesc = true; }
        this.refresh();
    },
    getFilteredAlerts() {
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var res = MockData.filterBySource(MockData.alerts, sourceIds);
        
        // 增补 Rule Custom Name
        res.forEach(function(a) {
            var r = MockData.rules.find(function(rx){ return rx.rule_id === a.rule_id; });
            a._rule_custom_name = r ? (r.custom_name || r.name) : '-';
            var s = MockData.dataSources.find(function(ds){ return ds.source_id === a.source_id; });
            a._company_name = s ? Utils.getCompanyName(s.company_id) : '-';
        });

        if (this.filters.company !== 'all') {
            var s2 = MockData.dataSources.find(function(s){return s.company_id === this.filters.company;}.bind(this));
            if(s2) res = res.filter(function(a){return a.source_id === s2.source_id;});
            else res = [];
        }
        if (this.filters.datasource !== 'all') res = res.filter(function(a){return a.source_id === this.filters.datasource;}.bind(this));
        if (this.filters.rule_type !== 'all') res = res.filter(function(a){return a.rule_type === this.filters.rule_type;}.bind(this));
        if (this.filters.status !== 'all') res = res.filter(function(a){return a.status === this.filters.status;}.bind(this));
        if (this.filters.platform !== 'all') res = res.filter(function(a){return a.platform === this.filters.platform;}.bind(this));
        if (this.filters.date_start) res = res.filter(function(a){return a.trigger_time >= this.filters.date_start + " 00:00:00";}.bind(this));
        if (this.filters.date_end) res = res.filter(function(a){return a.trigger_time <= this.filters.date_end + " 23:59:59";}.bind(this));

        var kw = this.search_keyword.toLowerCase();
        if (kw) {
            res = res.filter(function(a) {
                return (a._rule_custom_name && a._rule_custom_name.toLowerCase().indexOf(kw) > -1) ||
                       (a.alert_id && a.alert_id.toLowerCase().indexOf(kw) > -1);
            });
        }

        if (this.currentSortBy) {
            var colId = this.currentSortBy;
            var desc = this.sortDesc ? 1 : -1;
            res.sort(function(a, b) {
                var va = a[colId] || a['_' + colId] || '';
                var vb = b[colId] || b['_' + colId] || '';
                if(va < vb) return 1 * desc;
                if(va > vb) return -1 * desc;
                return 0;
            });
        } else {
            res.sort(function(a, b) { return a.trigger_time < b.trigger_time ? 1 : -1; });
        }
        return res;
    },`;
code = code.replace(/    getFilteredAlerts\(\) \{[\s\S]*?return res;\s*\},/, newGetFiltered);

// 5. 重建 renderTableRows
let newRenderRows = `    renderTableRows() {
        var alerts = this.getFilteredAlerts();
        var start = (this.currentPage - 1) * this.pageSize;
        var end = start + this.pageSize;
        var pageAlerts = alerts.slice(start, end);
        var self = this;

        if (pageAlerts.length === 0) {
            return '<tr><td colspan="11" class="empty-state">' + I18n.t('no_alerts_found') + '</td></tr>';
        }

        var sortedCols = JSON.parse(JSON.stringify(this.columns)).sort(function(a,b){return a.order - b.order;});
        var activeCols = sortedCols.filter(function(c){return c.visible;});

        return pageAlerts.map(function (a) {
            var isNew = a.status === 'new';
            var trClass = a.status;
            if (isNew) trClass += ' pulse-row';
            
            var s = '<tr class="' + trClass + '" style="cursor:pointer;" onclick="AlertsModule.viewDetail(\\'' + a.alert_id + '\\')">';
            
            activeCols.forEach(function(col) {
                var cell = '';
                if (col.id === 'alert_id') {
                    cell = '<code style="font-size:11px;">' + a.alert_id + (isNew ? ' <span class="badge badge-danger">NEW</span>' : '') + '</code>';
                } else if (col.id === 'custom_name') {
                    cell = '<strong>' + (a._rule_custom_name || '-') + '</strong>';
                } else if (col.id === 'company_name') {
                    cell = a._company_name || '-';
                } else if (col.id === 'rule_type') {
                    var rt = self.ruleTypes[a.rule_type] || { name: a.rule_type, icon: '', color: 'secondary' };
                    cell = '<span class="badge badge-' + rt.color + '" style="display:inline-flex;align-items:center;gap:4px;">' + rt.icon + ' ' + rt.name + '</span>';
                } else if (col.id === 'platform') {
                    cell = '<span class="badge badge-' + (a.platform === 'MT4' ? 'primary' : 'success') + '">' + a.platform + '</span>';
                } else if (col.id === 'account_id') {
                    cell = '<code style="color:var(--text-color);background:var(--bg-color);">' + a.account_id + '</code>';
                } else if (col.id === 'product') {
                    cell = '<strong>' + a.product + '</strong>';
                } else if (col.id === 'trigger_value') {
                    cell = self.formatTriggerValue(a) + '<div style="font-size:11px;color:var(--text-muted);">' + self.formatDetails(a) + '</div>';
                } else if (col.id === 'trigger_time') {
                    cell = '<span style="font-family:monospace;font-size:12px;">' + (a.trigger_time ? a.trigger_time.split(' ')[1] : '') + '</span><div style="font-size:10px;color:var(--text-muted);">' + (a.trigger_time ? a.trigger_time.split(' ')[0] : '') + '</div>';
                } else if (col.id === 'status') {
                    var statColor = a.status === 'new' ? 'danger' : (a.status === 'processing' ? 'warning' : 'success');
                    cell = '<span class="badge badge-' + statColor + '">' + self.getStatusText(a.status) + '</span>';
                } else if (col.id === 'actions') {
                    cell = '<div class="action-buttons" onclick="event.stopPropagation()">';
                    if (a.status === 'new') {
                        cell += '<button class="btn btn-sm btn-icon" onclick="AlertsModule.updateStatus(\\'' + a.alert_id + '\\', \\'processing\\')" title="' + I18n.t('mark_processing') + '"><i data-lucide="play" style="width:14px;height:14px;"></i></button>';
                    }
                    if (a.status !== 'resolved') {
                        cell += '<button class="btn btn-sm btn-icon" onclick="AlertsModule.updateStatus(\\'' + a.alert_id + '\\', \\'resolved\\')" title="' + I18n.t('mark_resolved') + '"><i data-lucide="check" style="width:14px;height:14px;"></i></button>';
                    }
                    cell += '</div>';
                }
                
                var style = col.fixed ? 'position:sticky;background:var(--card-bg);' + (col.id==='alert_id'?'left:0;z-index:1;':'right:0;z-index:1;') : '';
                s += '<td style="' + style + '">' + cell + '</td>';
            });
            s += '</tr>';
            return s;
        }).join('');
    },`;
code = code.replace(/    renderTableRows\(\) \{[\s\S]*?\}\)\.join\(''\);\s*\},/, newRenderRows);

// 替换表头容器
let newTableContainer = `        html += '<div class="table-responsive-wrapper" style="width: 100%; overflow-x: auto; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border-color);">';
        html += '<div class="table-container" style="min-width: 1200px; border: none;"><table class="table" style="width: 100%;">';
        
        var sortedCols = JSON.parse(JSON.stringify(this.columns)).sort(function(a,b){return a.order - b.order;});
        var activeCols = sortedCols.filter(function(c){return c.visible;});
        
        html += '<thead><tr>';
        activeCols.forEach(function(col) {
            var style = col.fixed ? 'position:sticky;background:var(--bg-color-alt);' + (col.id==='alert_id'?'left:0;z-index:2;':'right:0;z-index:2;') : 'background:var(--bg-color-alt);';
            var sortHtml = col.sortable ? ' <i style="font-size:10px; cursor:pointer;" onclick="AlertsModule.toggleSort(\\''+col.id+'\\')">' + (self.currentSortBy===col.id ? (self.sortDesc?'↓':'↑') : '↕') + '</i>' : '';
            html += '<th style="' + style + '">' + col.label + sortHtml + '</th>';
        });
        html += '</tr></thead><tbody id="alertTableBody">';`;
code = code.replace(/        html \+= '<div class="table-container(?:[\s\S]*?)<tbody id="alertTableBody">';/, newTableContainer);


// 6. Modal 与 export 
let modalMethods = `    openColumnSettings() {
        var modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'columnSettingsModal';
        var mc = '<div class="modal-content" style="width:400px;">';
        mc += '<div class="modal-header"><h3>⚙️ 列设置</h3><button class="btn btn-icon" onclick="this.closest(\\'#columnSettingsModal\\').remove()"><i data-lucide="x"></i></button></div>';
        mc += '<div class="modal-body"><p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">勾选想要显示的列，或点击上下箭头调整其显示顺序。</p>';
        mc += '<div style="display:flex;flex-direction:column;gap:8px;max-height:400px;overflow-y:auto;" id="columnSettingsList">';
        
        var sortedCols = JSON.parse(JSON.stringify(this.columns)).sort(function(a,b){return a.order - b.order;});
        sortedCols.forEach(function(c, idx) {
            var dis = c.fixed ? 'disabled' : '';
            var chk = c.visible ? 'checked' : '';
            mc += '<div style="display:flex;align-items:center;background:var(--bg-color);padding:8px 12px;border-radius:6px;border:1px solid var(--border-color);">';
            mc += '<input type="checkbox" '+dis+' '+chk+' onchange="AlertsModule.toggleColumn(\\''+c.id+'\\', this.checked)" style="margin-right:12px;">';
            mc += '<span style="flex:1;font-size:14px;'+(c.fixed?'opacity:0.6;':'')+'">' + c.label + '</span>';
            if(!c.fixed) {
                mc += '<button class="btn btn-icon btn-sm" '+(idx===0||sortedCols[idx-1].fixed?'disabled':'')+' onclick="AlertsModule.moveColumn(\\''+c.id+'\\', -1)" style="margin-right:4px;">↑</button>';
                mc += '<button class="btn btn-icon btn-sm" '+(idx===sortedCols.length-1||sortedCols[idx+1].fixed?'disabled':'')+' onclick="AlertsModule.moveColumn(\\''+c.id+'\\', 1)">↓</button>';
            }
            mc += '</div>';
        });
        
        mc += '</div></div>';
        mc += '<div class="modal-footer"><button class="btn btn-secondary" onclick="this.closest(\\'#columnSettingsModal\\').remove()">取消</button>';
        mc += '<button class="btn btn-primary" onclick="AlertsModule.saveColumnSettings()">保存应用</button></div>';
        mc += '</div>';
        modal.innerHTML = mc;
        document.body.appendChild(modal);
        lucide.createIcons();
    },
    toggleColumn(id, vis) {
        var c = this.columns.find(function(x){return x.id===id;});
        if(c) { c.visible = vis; }
    },
    moveColumn(id, dir) {
        var sorted = this.columns.sort(function(a,b){return a.order-b.order;});
        var idx = sorted.findIndex(function(x){return x.id===id;});
        if(idx < 0) return;
        var swapIdx = idx + dir;
        if(swapIdx >= 0 && swapIdx < sorted.length && !sorted[swapIdx].fixed) {
            var tmp = sorted[idx].order;
            sorted[idx].order = sorted[swapIdx].order;
            sorted[swapIdx].order = tmp;
            document.getElementById('columnSettingsModal').remove();
            this.openColumnSettings();
        }
    },
    saveColumnSettings() {
        localStorage.setItem('alertsColumns', JSON.stringify(this.columns));
        document.getElementById('columnSettingsModal').remove();
        this.refresh();
        Router.refresh();
    },

    exportData() {`;
code = code.replace(/    exportData\(\) \{/, modalMethods);

// H4 补丁注入
code = code.replace(/o \+= '<span>' \+ typeInfo\.icon \+ ' ' \+ rule\.name \+ '<\/span>';/, "o += '<span>' + typeInfo.icon + ' ' + (rule.custom_name || rule.name) + '</span>';");

fs.writeFileSync('js/modules/alerts.js', code, 'utf8');
console.log('Final patch3 running successfully!');
