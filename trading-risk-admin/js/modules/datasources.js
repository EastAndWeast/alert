// 数据源管理模块

var DatasourcesModule = {
    render: function () {
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var dataSources = MockData.dataSources.filter(function (ds) {
            return sourceIds.indexOf(ds.source_id) >= 0;
        });

        var canManage = Permissions.can(user, 'manage_datasources');

        return '\
            <div class="grid grid-4" style="margin-bottom: var(--spacing-lg);">\
                <div class="stat-card">\
                    <div class="stat-icon">🔌</div>\
                    <div class="stat-value">' + dataSources.length + '</div>\
                    <div class="stat-label">' + I18n.t('total_datasources') + '</div>\
                </div>\
                <div class="stat-card success">\
                    <div class="stat-icon">✅</div>\
                    <div class="stat-value">' + dataSources.filter(function (ds) { return ds.status === 'active'; }).length + '</div>\
                    <div class="stat-label">' + I18n.t('active_datasources') + '</div>\
                </div>\
                <div class="stat-card info">\
                    <div class="stat-icon">📊</div>\
                    <div class="stat-value">' + dataSources.filter(function (ds) { return ds.platform_type === 'MT4'; }).length + '</div>\
                    <div class="stat-label">' + I18n.t('mt4_datasources') + '</div>\
                </div>\
                <div class="stat-card warning">\
                    <div class="stat-icon">📈</div>\
                    <div class="stat-value">' + dataSources.filter(function (ds) { return ds.platform_type === 'MT5'; }).length + '</div>\
                    <div class="stat-label">' + I18n.t('mt5_datasources') + '</div>\
                </div>\
            </div>\
            <div class="card">\
                <div class="card-header">\
                    <h3 class="card-title">🔌 ' + I18n.t('datasource_list') + '</h3>\
                    ' + (canManage ? '<button class="btn btn-primary" onclick="DatasourcesModule.addDatasource()">+ ' + I18n.t('add_datasource') + '</button>' : '') + '\
                </div>\
                <div class="card-body" style="padding: 0;">\
                    <div class="table-container">\
                        <table class="table">\
                            <thead>\
                                <tr>\
                                    <th>' + I18n.t('datasource_id_header') + '</th>\
                                    <th>' + I18n.t('name_header') + '</th>\
                                    <th>' + I18n.t('platform_type_header') + '</th>\
                                    <th>' + I18n.t('ip_header') + '</th>\
                                    ' + (Permissions.isSuperAdmin(user) ? '<th>' + I18n.t('company_header') + '</th>' : '') + '\
                                    <th>' + I18n.t('rule_count_header') + '</th>\
                                    <th>' + I18n.t('alert_count_header') + '</th>\
                                    <th>' + I18n.t('status_header') + '</th>\
                                    <th>' + I18n.t('created_time_header') + '</th>\
                                    ' + (canManage ? '<th>' + I18n.t('actions_header') + '</th>' : '') + '\
                                </tr>\
                            </thead>\
                            <tbody>' + this.renderTableRows(dataSources, user, canManage) + '</tbody>\
                        </table>\
                    </div>\
                </div>\
            </div>';
    },

    renderTableRows: function (dataSources, user, canManage) {
        return dataSources.map(function (ds) {
            var ruleCount = MockData.rules.filter(function (r) { return r.source_id === ds.source_id; }).length;
            var alertCount = MockData.alerts.filter(function (a) { return a.source_id === ds.source_id; }).length;
            var companyName = Utils.getCompanyName(ds.company_id);

            return '\
                <tr>\
                    <td><code>' + ds.source_id + '</code></td>\
                    <td><strong>' + ds.source_name + '</strong></td>\
                    <td><span class="badge badge-' + (ds.platform_type === 'MT4' ? 'primary' : 'success') + '">' + ds.platform_type + '</span></td>\
                    <td><code>' + (ds.ip || '-') + '</code></td>\
                    ' + (Permissions.isSuperAdmin(user) ? '<td>' + companyName + '</td>' : '') + '\
                    <td><span class="badge badge-info">' + ruleCount + '</span></td>\
                    <td><span class="badge badge-' + (alertCount > 0 ? 'danger' : 'secondary') + '">' + alertCount + '</span></td>\
                    <td><span class="status-dot ' + (ds.status === 'active' ? 'active' : 'inactive') + '"></span>' + (ds.status === 'active' ? I18n.t('running') : I18n.t('stopped')) + '</td>\
                    <td>' + ds.created_at + '</td>\
                    ' + (canManage ? '<td><button class="btn btn-sm btn-secondary" onclick="DatasourcesModule.editDatasource(\'' + ds.source_id + '\')">' + I18n.t('configure') + '</button></td>' : '') + '\
                </tr>';
        }).join('');
    },

    addDatasource: function () {
        var user = MockData.currentUser;
        var companyOptions = Permissions.isSuperAdmin(user)
            ? MockData.companies.map(function (c) { return '<option value="' + c.company_id + '">' + c.company_name + '</option>'; }).join('')
            : '<option value="' + user.company_id + '">' + Utils.getCompanyName(user.company_id) + '</option>';

        App.showModal(I18n.t('add_datasource'), '\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('datasource_name_label') + '</label>\
                <input type="text" class="form-input" placeholder="' + I18n.t('placeholder_datasource_name') + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('platform_type_label') + '</label>\
                <select class="form-select">\
                    <option value="MT4">MT4</option>\
                    <option value="MT5">MT5</option>\
                </select>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('company_label') + '</label>\
                <select class="form-select">' + companyOptions + '</select>\
            </div>\
            <hr style="margin: var(--spacing-md) 0; border-color: var(--border-color);">\
            <h4 style="margin-bottom: var(--spacing-md); color: var(--text-secondary);">🔗 ' + I18n.t('connection_config') + '</h4>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('ip_address_label') + '</label>\
                <input type="text" class="form-input" placeholder="' + I18n.t('placeholder_ip') + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('account_label') + '</label>\
                <input type="text" class="form-input" placeholder="' + I18n.t('placeholder_account') + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('password_label') + '</label>\
                <input type="password" class="form-input" placeholder="' + I18n.t('placeholder_password_input') + '">\
            </div>\
        ');
    },

    editDatasource: function (sourceId) {
        var ds = MockData.dataSources.find(function (d) { return d.source_id === sourceId; });
        if (ds) {
            App.showModal(I18n.t('configure_datasource') + ' - ' + ds.source_name, '\
                <div class="form-group">\
                    <label class="form-label">' + I18n.t('datasource_name_label') + '</label>\
                    <input type="text" class="form-input" value="' + ds.source_name + '">\
                </div>\
                <div class="form-group">\
                    <label class="form-label">平台类型</label>\
                    <select class="form-select">\
                        <option ' + (ds.platform_type === 'MT4' ? 'selected' : '') + '>MT4</option>\
                        <option ' + (ds.platform_type === 'MT5' ? 'selected' : '') + '>MT5</option>\
                    </select>\
                </div>\
                <div class="form-group">\
                    <label class="form-label">' + I18n.t('status_label') + '</label>\
                    <select class="form-select">\
                        <option value="active" ' + (ds.status === 'active' ? 'selected' : '') + '>' + I18n.t('running') + '</option>\
                        <option value="inactive" ' + (ds.status === 'inactive' ? 'selected' : '') + '>' + I18n.t('stopped') + '</option>\
                    </select>\
                </div>\
                <hr style="margin: var(--spacing-md) 0; border-color: var(--border-color);">\
                <h4 style="margin-bottom: var(--spacing-md); color: var(--text-secondary);">🔗 连接配置</h4>\
                <div class="form-group">\
                    <label class="form-label">IP 地址</label>\
                    <input type="text" class="form-input" value="' + (ds.ip || '') + '" placeholder="例如: 192.168.1.100">\
                </div>\
                <div class="form-group">\
                    <label class="form-label">账号</label>\
                    <input type="text" class="form-input" value="' + (ds.username || '') + '" placeholder="例如: mt5_admin">\
                </div>\
                <div class="form-group">\
                    <label class="form-label">密码</label>\
                    <input type="password" class="form-input" value="' + (ds.password || '') + '" placeholder="请输入连接密码">\
                </div>\
            ');
        }
    }
};
