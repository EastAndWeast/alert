const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'js', 'modules', 'alerts.js');
let code = fs.readFileSync(file, 'utf8');

console.log("Original length:", code.length);

// 1. 挂载 init() 方法用于还原 localStorage 列设置
const initLogic = `    init() {
        if (!this.columns) {
            var saved = localStorage.getItem('alert_columns_v1');
            if (saved) {
                try { this.columns = JSON.parse(saved); } catch(e) {}
            }
            if (!this.columns || this.columns.length !== this.defaultColumns.length) {
                this.columns = JSON.parse(JSON.stringify(this.defaultColumns));
            }
        }
    },

    initFilters: function () {`;
code = code.replace('    initFilters: function () {', initLogic);
code = code.replace('    render() {\n        this.initFilters();', '    render() {\n        this.init();\n        this.initFilters();');

// 2. 插入搜索框和设置按钮
const searchHtml = `
        html += '<div class="filter-group"><span class="filter-label">' + (I18n.t('search') || '搜索') + '：</span><input type="text" class="filter-select" id="searchKeywordFilter" placeholder="' + I18n.t('rule_custom_name_label') + '" value="' + this.filters.search_keyword + '" oninput="AlertsModule.applyFilters()"></div>';
        html += '<button class="btn btn-secondary" onclick="AlertsModule.exportData()" style="margin-left: auto;">📥 ' + I18n.t('export') + '</button>';
        html += '<button class="btn btn-secondary" onclick="AlertsModule.openColumnSettings()" style="margin-left: 8px;"><i data-lucide="settings" style="width:14px;height:14px;vertical-align:-2px;"></i> ' + (I18n.t('columns_setting') || '列设置') + '</button>';
        html += '</div>';
`;
code = code.replace(/        html \+= '<button class=\"btn btn-secondary\" onclick=\"AlertsModule\.exportData\(\)\" style=\"margin-left: auto;\">📥 ' \+ I18n\.t\('export'\) \+ '<\/button>';\s*html \+= '<\/div>';/, searchHtml);

// 3. 替换掉写死的 table header 渲染
const thRegex = /<div class=\"table-container\"><table class=\"table\"><thead><tr>[\s\S]*?<\/tr><\/thead><tbody id=\"alertTableBody\">/;
const thReplace = `<div class="table-responsive-wrapper"><table class="table"><thead><tr>';
        html += this.renderTableHeader();
        html += '</tr></thead><tbody id="alertTableBody">`;
code = code.replace(thRegex, thReplace);

// 4. 新增的辅助渲染等方法放到末尾
const extras = `
    renderTableHeader() {
        var html = '';
        var self = this;
        this.columns.filter(function(c) { return c.visible; }).forEach(function(col) {
            var stickyClass = col.fixed === 'left' ? ' sticky-left' : (col.fixed === 'right' ? ' sticky-right' : '');
            var sortClass = col.sortable ? ' th-sortable' : '';
            var sortHtml = '';
            if (col.sortable) {
                var isActive = self.sortBy === col.id;
                var icon = isActive && !self.sortDesc ? 'arrow-up' : 'arrow-down';
                var activeClass = isActive ? ' active' : '';
                var color = isActive ? 'stroke:var(--color-primary);' : 'stroke:var(--text-muted);';
                sortHtml = '<i data-lucide="' + icon + '" class="sort-icon' + activeClass + '" style="' + color + '"></i>';
            }
            var onClick = col.sortable ? ' onclick="AlertsModule.toggleSort(\\'' + col.id + '\\')"' : '';
            html += '<th class="' + stickyClass + sortClass + '"' + onClick + '>' + (I18n.t(col.labelKey) || col.labelKey) + sortHtml + '</th>';
        });
        return html;
    },

    toggleSort(colId) {
        if (this.sortBy === colId) {
            this.sortDesc = !this.sortDesc;
        } else {
            this.sortBy = colId;
            this.sortDesc = true;
        }
        var m = document.getElementById('mainContent');
        if (m) {
            m.innerHTML = this.render();
            if(window.lucide) window.lucide.createIcons();
        }
    },

    openColumnSettings() {
        var html = '<div style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary);">' + (I18n.t('drag_to_reorder', '您可以勾选需要显示的列，或上下拖拽调整顺序。部分关键列无法隐藏。')) + '</div>';
        html += '<div id="columnSettingsList" style="display:flex;flex-direction:column;gap:8px;max-height:400px;overflow-y:auto;padding-right:8px;">';
        this.columns.forEach(function(c, index) {
            var disabled = c.fixed ? 'disabled' : '';
            html += '<div class="column-setting-item" data-id="' + c.id + '" draggable="' + (!c.fixed ? 'true' : 'false') + '" style="display:flex;align-items:center;padding:10px 12px;background:var(--bg-tertiary);border:1px solid var(--border-color);border-radius:4px;' + (c.fixed ? 'opacity:0.7;' : 'cursor:move;') + '">';
            html += '<i data-lucide="grip-vertical" style="margin-right:8px;width:14px;color:var(--text-muted);' + (c.fixed ? 'visibility:hidden;' : '') + '"></i>';
            html += '<input type="checkbox" id="col_chk_' + c.id + '" ' + (c.visible ? 'checked' : '') + ' ' + disabled + ' style="margin-right:12px;accent-color:var(--color-primary);width:16px;height:16px;">';
            html += '<label for="col_chk_' + c.id + '" style="flex:1;cursor:' + (disabled ? 'default' : 'pointer') + ';margin:0;">' + (I18n.t(c.labelKey) || c.labelKey) + '</label>';
            if (c.fixed) html += '<span style="font-size:11px;color:var(--text-muted);background:rgba(0,0,0,0.2);padding:2px 6px;border-radius:10px;">固定</span>';
            html += '</div>';
        });
        html += '</div>';

        Utils.showModal('⚙️ ' + (I18n.t('columns_setting', '列设置')), html, function() {
            AlertsModule.saveColumnSettings();
        });
        
        if(window.lucide) window.lucide.createIcons();

        var list = document.getElementById('columnSettingsList');
        var draggedItem = null;
        list.querySelectorAll('.column-setting-item[draggable="true"]').forEach(function(item) {
            item.addEventListener('dragstart', function(e) {
                draggedItem = item;
                setTimeout(function(){ item.style.opacity = '0.4'; }, 0);
            });
            item.addEventListener('dragend', function() {
                setTimeout(function(){ draggedItem.style.opacity = '1'; draggedItem = null; }, 0);
            });
            item.addEventListener('dragover', function(e) { e.preventDefault(); });
            item.addEventListener('dragenter', function(e) {
                e.preventDefault();
                if (item !== draggedItem && !item.querySelector('input').disabled) {
                    item.style.borderTop = '2px solid var(--color-primary)';
                }
            });
            item.addEventListener('dragleave', function() { item.style.borderTop = ''; });
            item.addEventListener('drop', function(e) {
                item.style.borderTop = '';
                if (item !== draggedItem && !item.querySelector('input').disabled) {
                    list.insertBefore(draggedItem, item);
                }
            });
        });
    },

    saveColumnSettings() {
        var list = document.getElementById('columnSettingsList');
        if (!list) return;
        var newColumns = [];
        var items = list.querySelectorAll('.column-setting-item');
        var self = this;
        items.forEach(function(item) {
            var colId = item.getAttribute('data-id');
            var isVisible = item.querySelector('input').checked;
            var originalCol = self.columns.find(function(c){ return c.id === colId; });
            if (originalCol) {
                originalCol.visible = isVisible;
                newColumns.push(originalCol);
            }
        });
        
        this.columns = newColumns;
        localStorage.setItem('alert_columns_v1', JSON.stringify(this.columns));
        
        var m = document.getElementById('mainContent');
        if (m) {
            m.innerHTML = this.render();
            if(window.lucide) window.lucide.createIcons();
        }
    }
};

window.AlertsModule = AlertsModule;
`;
code = code.replace(/};\s*$/, extras);

// 5. 替换 getFilteredAlerts (添加了排序与搜索支持)
const newGetFiltered = `    getFilteredAlerts() {
        var self = this;
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        return MockData.filterBySource(MockData.alerts, sourceIds).filter(function (a) {
            if (self.filters.company !== 'all') {
                var source = MockData.dataSources.find(function (ds) { return ds.source_id === a.source_id; });
                if (!source || source.company_id !== self.filters.company) return false;
            }
            if (self.filters.datasource !== 'all' && a.source_id !== self.filters.datasource) return false;
            if (self.filters.rule_type !== 'all' && a.rule_type !== self.filters.rule_type) return false;
            if (self.filters.status !== 'all' && a.status !== self.filters.status) return false;
            if (self.filters.platform !== 'all' && a.platform !== self.filters.platform) return false;

            var triggerDate = a.trigger_time.split(' ')[0];
            if (self.filters.date_start && triggerDate < self.filters.date_start) return false;
            if (self.filters.date_end && triggerDate > self.filters.date_end) return false;

            if (self.filters.search_keyword) {
                var kw = self.filters.search_keyword.toLowerCase();
                var rn = (a.custom_name || '').toLowerCase();
                var rt = (a.rule_type || '').toLowerCase();
                var aid = (a.alert_id || '').toLowerCase();
                if (rn.indexOf(kw) === -1 && rt.indexOf(kw) === -1 && aid.indexOf(kw) === -1) {
                    return false;
                }
            }
            return true;
        }).sort(function(a, b) {
            if (!self.sortBy) return 0;
            var valA = a[self.sortBy];
            var valB = b[self.sortBy];
            if (self.sortBy === 'company') {
                var sA = MockData.dataSources.find(function(d){return d.source_id===a.source_id;});
                valA = sA ? Utils.getCompanyName(sA.company_id) : '';
                var sB = MockData.dataSources.find(function(d){return d.source_id===b.source_id;});
                valB = sB ? Utils.getCompanyName(sB.company_id) : '';
            } else if (self.sortBy === 'datasource') {
                var sA = MockData.dataSources.find(function(d){return d.source_id===a.source_id;});
                valA = sA ? sA.source_name : '';
                var sB = MockData.dataSources.find(function(d){return d.source_id===b.source_id;});
                valB = sB ? sB.source_name : '';
            } else if (self.sortBy === 'rule_name') {
                valA = a.custom_name || a.rule_type;
                valB = b.custom_name || b.rule_type;
            } else {
                valA = valA || '';
                valB = valB || '';
            }
            if (valA < valB) return self.sortDesc ? 1 : -1;
            if (valA > valB) return self.sortDesc ? -1 : 1;
            return 0;
        });
    },`;
code = code.replace(/getFilteredAlerts\(\) \{[\s\S]*?(?=renderTableRows)/, newGetFiltered + '\n\n    ');

// 6. 替换 renderTableRows
const newRenderRows = `    renderTableRows() {
        var self = this;
        var filtered = this.getFilteredAlerts();
        var start = (this.currentPage - 1) * this.pageSize;
        var paged = filtered.slice(start, start + this.pageSize);

        if (paged.length === 0) {
            var visibleCount = this.columns ? this.columns.filter(function(c){return c.visible;}).length : 12;
            return '<tr><td colspan="' + visibleCount + '" style="text-align:center;padding:40px;color:var(--text-muted);">' + (I18n.t('no_data') || '暂无数据') + '</td></tr>';
        }

        return paged.map(function (alert) {
            var typeInfo = self.ruleTypes[alert.rule_type] || { name: alert.rule_type, icon: '<i data-lucide="help-circle"></i>', color: 'secondary' };
            var statusClass = alert.status === 'new' ? 'danger' : alert.status === 'reviewed' ? 'active' : 'warning';
            var source = MockData.dataSources.find(function (ds) { return ds.source_id === alert.source_id; });
            var companyName = source ? Utils.getCompanyName(source.company_id) : '-';
            var sourceName = source ? source.source_name : '-';

            var row = '<tr>';
            self.columns.filter(function(col){ return col.visible; }).forEach(function(col) {
                var stickyClass = col.fixed === 'left' ? ' class="sticky-left"' : (col.fixed === 'right' ? ' class="sticky-right"' : '');
                row += '<td' + stickyClass + '>';
                
                switch(col.id) {
                    case 'alert_id':
                        row += '<code>' + alert.alert_id + '</code>'; break;
                    case 'company':
                        row += '<span class="badge badge-secondary">' + companyName + '</span>'; break;
                    case 'datasource':
                        row += '<span class="badge badge-info">' + sourceName + '</span>'; break;
                    case 'rule_name':
                        var dispName = alert.custom_name ? alert.custom_name : typeInfo.name;
                        row += '<span style="font-weight:600;">' + dispName + '</span>';
                        if (alert.custom_name) {
                            row += '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + typeInfo.name + '</div>';
                        }
                        break;
                    case 'rule_type':
                        row += '<span class="badge badge-' + typeInfo.color + '">' + typeInfo.icon + ' ' + typeInfo.name + '</span>'; break;
                    case 'platform':
                        row += '<span class="badge badge-' + (alert.platform === 'MT4' ? 'primary' : 'success') + '">' + alert.platform + '</span>'; break;
                    case 'account':
                        row += alert.account_id; break;
                    case 'symbol':
                        row += alert.product; break;
                    case 'trigger_value':
                        row += '<strong>' + self.formatTriggerValue(alert) + '</strong>'; break;
                    case 'details':
                        row += self.formatDetails(alert); break;
                    case 'trigger_time':
                        row += alert.trigger_time; break;
                    case 'status':
                        row += '<span class="status-dot ' + statusClass + '"></span>' + self.getStatusText(alert.status); break;
                    case 'actions':
                        row += '<div style="display: flex; gap: 4px; white-space: nowrap;">';
                        if (alert.status === 'new') {
                            row += '<button class="btn btn-sm btn-success" onclick="AlertsModule.updateStatus(\\'' + alert.alert_id + '\\', \\'reviewed\\')">✓</button>';
                            row += '<button class="btn btn-sm btn-secondary" onclick="AlertsModule.updateStatus(\\'' + alert.alert_id + '\\', \\'ignored\\')">✕</button>';
                        }
                        row += '<button class="btn btn-sm btn-secondary" onclick="AlertsModule.viewDetail(\\'' + alert.alert_id + '\\')">' + (I18n.t('details') || '详情') + '</button>';
                        row += '</div>';
                        break;
                    default: row += '-';
                }
                row += '</td>';
            });
            row += '</tr>';
            return row;
        }).join('');
    },`;
code = code.replace(/renderTableRows\(\) \{[\s\S]*?(?=renderPagination)/, newRenderRows + '\n\n    ');

fs.writeFileSync(file, code, 'utf8');
console.log("New length:", code.length);
console.log("Patch applied successfully.");
