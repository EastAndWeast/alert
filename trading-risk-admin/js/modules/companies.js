// 公司管理模块

var CompaniesModule = {
    render: function () {
        var user = MockData.currentUser;
        if (!Permissions.isSuperAdmin(user)) {
            return '<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-title">' + I18n.t('no_access') + '</div><div class="empty-state-desc">' + I18n.t('superadmin_only_access') + '</div></div>';
        }

        return '\
            <div class="grid grid-3" style="margin-bottom: var(--spacing-lg);">\
                <div class="stat-card">\
                    <div class="stat-icon">🏢</div>\
                    <div class="stat-value">' + MockData.companies.length + '</div>\
                    <div class="stat-label">' + I18n.t('total_companies') + '</div>\
                </div>\
                <div class="stat-card success">\
                    <div class="stat-icon">✅</div>\
                    <div class="stat-value">' + MockData.companies.filter(function (c) { return c.status === 'active'; }).length + '</div>\
                    <div class="stat-label">' + I18n.t('active_companies') + '</div>\
                </div>\
                <div class="stat-card info">\
                    <div class="stat-icon">🔌</div>\
                    <div class="stat-value">' + MockData.dataSources.length + '</div>\
                    <div class="stat-label">' + I18n.t('total_datasources') + '</div>\
                </div>\
            </div>\
            <div class="card">\
                <div class="card-header">\
                    <h3 class="card-title">🏢 ' + I18n.t('company_list') + '</h3>\
                    <button class="btn btn-primary" onclick="CompaniesModule.addCompany()">+ ' + I18n.t('add_company') + '</button>\
                </div>\
                <div class="card-body" style="padding: 0;">\
                    <div class="table-container">\
                        <table class="table">\
                            <thead>\
                                <tr>\
                                    <th>' + I18n.t('company_id_header') + '</th>\
                                    <th>' + I18n.t('company_name_header') + '</th>\
                                    <th>' + I18n.t('contact_email_header') + '</th>\
                                    <th>' + I18n.t('datasources_header') + '</th>\
                                    <th>' + I18n.t('user_count_header') + '</th>\
                                    <th>' + I18n.t('status_header') + '</th>\
                                    <th>' + I18n.t('created_time_header') + '</th>\
                                    <th>' + I18n.t('actions_header') + '</th>\
                                </tr>\
                            </thead>\
                            <tbody>' + this.renderTableRows() + '</tbody>\
                        </table>\
                    </div>\
                </div>\
            </div>';
    },

    renderTableRows: function () {
        var self = this;
        return MockData.companies.map(function (c) {
            var dsCount = MockData.dataSources.filter(function (ds) { return ds.company_id === c.company_id; }).length;
            var userCount = MockData.users.filter(function (u) { return u.company_id === c.company_id; }).length;
            return '\
                <tr>\
                    <td><code>' + c.company_id + '</code></td>\
                    <td><strong>' + c.company_name + '</strong></td>\
                    <td>' + c.contact_email + '</td>\
                    <td><span class="badge badge-info">' + dsCount + ' ' + I18n.t('unit_datasource') + '</span></td>\
                    <td><span class="badge badge-primary">' + userCount + ' ' + I18n.t('unit_person') + '</span></td>\
                    <td><span class="status-dot ' + (c.status === 'active' ? 'active' : 'inactive') + '"></span>' + (c.status === 'active' ? I18n.t('enabled') : I18n.t('disabled')) + '</td>\
                    <td>' + c.created_at + '</td>\
                    <td>\
                        <button class="btn btn-sm btn-secondary" onclick="CompaniesModule.editCompany(\'' + c.company_id + '\')">' + I18n.t('edit') + '</button>\
                    </td>\
                </tr>';
        }).join('');
    },

    addCompany: function () {
        App.showModal(I18n.t('add_company'), '\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('company_name_label') + '</label>\
                <input type="text" class="form-input" id="companyName" placeholder="' + I18n.t('placeholder_company_name') + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('contact_email_label') + '</label>\
                <input type="email" class="form-input" id="companyEmail" placeholder="admin@company.com">\
            </div>\
        ');
    },

    editCompany: function (companyId) {
        var company = MockData.companies.find(function (c) { return c.company_id === companyId; });
        if (company) {
            App.showModal(I18n.t('edit_company') + ' - ' + company.company_name, '\
                <div class="form-group">\
                    <label class="form-label">' + I18n.t('company_name_label') + '</label>\
                    <input type="text" class="form-input" value="' + company.company_name + '">\
                </div>\
                <div class="form-group">\
                    <label class="form-label">' + I18n.t('contact_email_label') + '</label>\
                    <input type="email" class="form-input" value="' + company.contact_email + '">\
                </div>\
                <div class="form-group">\
                    <label class="form-label">' + I18n.t('status_label') + '</label>\
                    <select class="form-select">\
                        <option value="active" ' + (company.status === 'active' ? 'selected' : '') + '>' + I18n.t('enabled') + '</option>\
                        <option value="inactive" ' + (company.status === 'inactive' ? 'selected' : '') + '>' + I18n.t('disabled') + '</option>\
                    </select>\
                </div>\
            ');
        }
    }
};
