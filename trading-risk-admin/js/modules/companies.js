// 公司管理模块

var CompaniesModule = {
    render: function () {
        var user = MockData.currentUser;
        if (!Permissions.isSuperAdmin(user)) {
            return '<div class="empty-state"><div class="empty-state-icon"><i data-lucide="lock" style="width:48px;height:48px;"></i></div><div class="empty-state-title">' + I18n.t('no_access') + '</div><div class="empty-state-desc">' + I18n.t('superadmin_only_access') + '</div></div>';
        }

        return '\
            <div class="grid grid-3" style="margin-bottom: var(--spacing-lg);">\
                <div class="stat-card">\
                    <div class="stat-icon"><i data-lucide="building-2"></i></div>\
                    <div class="stat-value">' + MockData.companies.length + '</div>\
                    <div class="stat-label">' + I18n.t('total_companies') + '</div>\
                </div>\
                <div class="stat-card success">\
                    <div class="stat-icon"><i data-lucide="check-circle"></i></div>\
                    <div class="stat-value">' + MockData.companies.filter(function (c) { return c.status === 'active'; }).length + '</div>\
                    <div class="stat-label">' + I18n.t('active_companies') + '</div>\
                </div>\
                <div class="stat-card info">\
                    <div class="stat-icon"><i data-lucide="plug"></i></div>\
                    <div class="stat-value">' + MockData.dataSources.length + '</div>\
                    <div class="stat-label">' + I18n.t('total_datasources') + '</div>\
                </div>\
            </div>\
            <div class="card">\
                <div class="card-header">\
                    <h3 class="card-title"><i data-lucide="building-2"></i> ' + I18n.t('company_list') + '</h3>\
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
                                    <th>' + I18n.t('email_notification_header') + '</th>\
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
                    <td><span class="badge badge-' + (c.email_enabled ? 'success' : 'secondary') + '">' + (c.email_enabled ? I18n.t('enabled') : I18n.t('disabled')) + '</span></td>\
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
        if (!company) return;

        // 构建发件服务下拉选项
        var serviceOptions = '<option value="">' + I18n.t('email_service_none') + '</option>';
        MockData.email_services.forEach(function(svc) {
            var selected = company.email_service_id === svc.service_id ? 'selected' : '';
            serviceOptions += '<option value="' + svc.service_id + '" ' + selected + '>' + svc.name + '</option>';
        });

        App.showModal(I18n.t('edit_company') + ' - ' + company.company_name,
            '<div class="form-group">\
                <label class="form-label">' + I18n.t('company_name_label') + '</label>\
                <input type="text" class="form-input" id="editCompanyName" value="' + company.company_name + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('contact_email_label') + '</label>\
                <input type="email" class="form-input" id="editCompanyEmail" value="' + company.contact_email + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('status_label') + '</label>\
                <select class="form-select" id="editCompanyStatus">\
                    <option value="active" ' + (company.status === 'active' ? 'selected' : '') + '>' + I18n.t('enabled') + '</option>\
                    <option value="inactive" ' + (company.status === 'inactive' ? 'selected' : '') + '>' + I18n.t('disabled') + '</option>\
                </select>\
            </div>\
            <hr style="margin: 16px 0; border-color: var(--border-color);">\
            <div style="font-weight:600; margin-bottom:12px;">\
                <i data-lucide="mail" style="width:16px;height:16px;vertical-align:-2px;"></i> ' + I18n.t('email_config_section') + '\
            </div>\
            <div class="form-group" style="display:flex;align-items:center;justify-content:space-between;">\
                <div>\
                    <div style="font-weight:500;">' + I18n.t('company_email_enabled') + '</div>\
                    <small style="color:var(--text-muted);">' + I18n.t('company_email_enabled_desc') + '</small>\
                </div>\
                <label class="switch">\
                    <input type="checkbox" id="editEmailEnabled" ' + (company.email_enabled ? 'checked' : '') + '>\
                    <span class="switch-slider"></span>\
                </label>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('email_service_assign') + '</label>\
                <select class="form-select" id="editEmailServiceId">' + serviceOptions + '</select>\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('email_from_name') + '</label>\
                <input type="text" class="form-input" id="editFromName" value="' + (company.from_name || '') + '" placeholder="' + I18n.t('email_from_name_placeholder') + '">\
            </div>\
            <div class="form-group">\
                <label class="form-label">' + I18n.t('email_from_email') + '</label>\
                <select class="form-select" id="editFromEmail"></select>\
            </div>',
            function() {
                // 保存公司邮件配置
                company.company_name = document.getElementById('editCompanyName').value || company.company_name;
                company.contact_email = document.getElementById('editCompanyEmail').value || company.contact_email;
                company.status = document.getElementById('editCompanyStatus').value;
                company.email_enabled = document.getElementById('editEmailEnabled').checked;
                company.email_service_id = document.getElementById('editEmailServiceId').value || null;
                company.from_name = document.getElementById('editFromName').value;
                company.from_email = document.getElementById('editFromEmail').value;
                MockData.addAuditLog('UPDATE_COMPANY', 'Updated company: ' + company.company_name);
                App.showToast('success', I18n.t('company_updated'));
                Router.refresh();
                return true;
            }
        );

        // --- 发件邮箱级联联动逻辑 ---
        var svcSelect = document.getElementById('editEmailServiceId');
        var emailSelect = document.getElementById('editFromEmail');

        function updateEmailOptions() {
            var selectedSvcId = svcSelect.value;
            emailSelect.innerHTML = '';
            if (!selectedSvcId) {
                emailSelect.disabled = true;
                emailSelect.innerHTML = '<option value="">' + I18n.t('choose_verified_email') + '</option>';
                return;
            }
            
            var svc = MockData.email_services.find(function(s) { return s.service_id === selectedSvcId; });
            if (svc && svc.verified_emails) {
                var emails = svc.verified_emails.split(',').map(function(e){ return e.trim(); }).filter(function(e){ return e; });
                if (emails.length > 0) {
                    emailSelect.disabled = false;
                    emails.forEach(function(em) {
                        emailSelect.innerHTML += '<option value="' + em + '">' + em + '</option>';
                    });
                    return;
                }
            }
            // 若发件服务未设置或白名单为空
            emailSelect.disabled = true;
            emailSelect.innerHTML = '<option value="">' + I18n.t('no_data') + '</option>';
        }

        if (svcSelect && emailSelect) {
            svcSelect.addEventListener('change', updateEmailOptions);
            updateEmailOptions(); // 初始化
            
            // 回填已保存的配置
            if (company.from_email && !emailSelect.disabled) {
                emailSelect.value = company.from_email;
                if (emailSelect.selectedIndex === -1) {
                    emailSelect.selectedIndex = 0; // 若原本的邮箱不在现在的白名单内，默认切到第一个
                }
            }
        }

        if (typeof lucide !== 'undefined') setTimeout(function(){ lucide.createIcons(); }, 50);
    }
};
