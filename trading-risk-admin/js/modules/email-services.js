// 发件服务管理模块 (仅 super_admin 可见)

const EmailServicesModule = {

    // 服务商预设模板
    PROVIDER_PRESETS: {
        sendgrid: { label: 'SendGrid', fields: ['api_key'], icon: '📧' },
        mailgun:  { label: 'Mailgun',  fields: ['api_key'], icon: '📬' },
        ses:      { label: 'AWS SES',  fields: ['api_key'], icon: '☁️' },
        postmark: { label: 'Postmark', fields: ['api_key'], icon: '📮' },
        smtp:     { label: 'Custom SMTP', fields: ['smtp_host','smtp_port','smtp_user','smtp_pass','smtp_tls'], icon: '🔧' }
    },

    render() {
        const services = MockData.email_services;
        const providerPresets = this.PROVIDER_PRESETS;

        const rows = services.length === 0
            ? `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px;">${I18n.t('no_data')}</td></tr>`
            : services.map(function(svc) {
                const preset = providerPresets[svc.provider] || { label: svc.provider, icon: '🔧' };
                const statusClass = svc.status === 'active' ? 'success' : (svc.status === 'error' ? 'danger' : 'secondary');
                // 检查有多少公司在使用
                const usedBy = MockData.companies.filter(function(c) { return c.email_service_id === svc.service_id; });
                return `
                <tr>
                    <td>
                        <div style="font-weight:600;">${svc.name}</div>
                        <small style="color:var(--text-muted);">${I18n.t('created_at')}: ${svc.created_at}</small>
                    </td>
                    <td><span class="badge badge-info">${preset.icon} ${preset.label}</span></td>
                    <td><span class="badge badge-${statusClass}">${I18n.t('status_' + svc.status)}</span></td>
                    <td>
                        ${usedBy.length > 0
                            ? usedBy.map(function(c){ return `<span class="badge badge-secondary" style="margin-right:4px;">${c.company_name}</span>`; }).join('')
                            : `<span style="color:var(--text-muted);font-size:12px;">${I18n.t('email_service_unassigned')}</span>`
                        }
                    </td>
                    <td>
                        <div style="display:flex;gap:8px;">
                            <button class="btn btn-sm btn-secondary" onclick="EmailServicesModule.testService('${svc.service_id}', this)">
                                <i data-lucide="zap" style="width:14px;height:14px;vertical-align:-2px;"></i> ${I18n.t('test_webhook')}
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="EmailServicesModule.openEditModal('${svc.service_id}')">
                                <i data-lucide="pencil" style="width:14px;height:14px;vertical-align:-2px;"></i> ${I18n.t('edit')}
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="EmailServicesModule.deleteService('${svc.service_id}')">
                                <i data-lucide="trash-2" style="width:14px;height:14px;vertical-align:-2px;"></i> ${I18n.t('delete')}
                            </button>
                        </div>
                    </td>
                </tr>`;
            }).join('');

        return `
        <div class="section-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <div>
                <h2 style="margin:0;font-size:18px;"><i data-lucide="mail" style="width:20px;height:20px;vertical-align:-3px;"></i> ${I18n.t('email_services_title')}</h2>
                <p style="margin:4px 0 0;color:var(--text-muted);font-size:13px;">${I18n.t('email_services_desc')}</p>
            </div>
            <button class="btn btn-primary" onclick="EmailServicesModule.openAddModal()">
                <i data-lucide="plus" style="width:16px;height:16px;vertical-align:-2px;"></i> ${I18n.t('email_service_add')}
            </button>
        </div>

        <div class="card">
            <div class="card-body" style="padding:0;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>${I18n.t('email_service_name')}</th>
                            <th>${I18n.t('email_service_provider')}</th>
                            <th>${I18n.t('status')}</th>
                            <th>${I18n.t('email_service_used_by')}</th>
                            <th>${I18n.t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
    },

    openAddModal() {
        const body = this._buildForm(null);
        App.showModal(I18n.t('email_service_add'), body);
        var confirmBtn = document.getElementById('modalConfirm');
        confirmBtn.onclick = function() { EmailServicesModule._saveForm(null); };
        this._bindProviderSwitch();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    openEditModal(serviceId) {
        const svc = MockData.getEmailServiceById(serviceId);
        if (!svc) return;
        const body = this._buildForm(svc);
        App.showModal(I18n.t('email_service_edit'), body);
        var confirmBtn = document.getElementById('modalConfirm');
        confirmBtn.onclick = function() { EmailServicesModule._saveForm(serviceId); };
        this._bindProviderSwitch(svc.provider);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    _buildForm(svc) {
        const p = svc || {};
        const providerOptions = Object.entries(this.PROVIDER_PRESETS).map(function([key, val]) {
            return `<option value="${key}" ${p.provider === key ? 'selected' : ''}>${val.icon} ${val.label}</option>`;
        }).join('');

        return `
        <div class="form-group">
            <label class="form-label">${I18n.t('email_service_name')} *</label>
            <input type="text" class="form-input" id="es_name" value="${p.name || ''}" placeholder="${I18n.t('email_service_name_placeholder')}">
        </div>
        <div class="form-group">
            <label class="form-label">${I18n.t('email_service_provider')} *</label>
            <select class="form-select" id="es_provider" onchange="EmailServicesModule._bindProviderSwitch()">
                ${providerOptions}
            </select>
        </div>
        <div id="es_api_fields">
            <div class="form-group">
                <label class="form-label">API Key *</label>
                <input type="password" class="form-input" id="es_api_key" value="${p.api_key || ''}" placeholder="${I18n.t('email_service_api_key_placeholder')}">
            </div>
        </div>
        <div id="es_smtp_fields" style="display:none;">
            <div class="form-group">
                <label class="form-label">SMTP Host *</label>
                <input type="text" class="form-input" id="es_smtp_host" value="${p.smtp_host || ''}" placeholder="smtp.example.com">
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group">
                    <label class="form-label">SMTP Port</label>
                    <input type="number" class="form-input" id="es_smtp_port" value="${p.smtp_port || 587}">
                </div>
                <div class="form-group">
                    <label class="form-label" style="display:flex;align-items:center;gap:8px;">
                        TLS
                        <label class="switch" style="margin:0;">
                            <input type="checkbox" id="es_smtp_tls" ${p.smtp_tls !== false ? 'checked' : ''}>
                            <span class="switch-slider"></span>
                        </label>
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">SMTP Username</label>
                <input type="text" class="form-input" id="es_smtp_user" value="${p.smtp_user || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">SMTP Password</label>
                <input type="password" class="form-input" id="es_smtp_pass" value="${p.smtp_pass || ''}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${I18n.t('status')} *</label>
            <select class="form-select" id="es_status">
                <option value="active" ${p.status === 'active' || !p.status ? 'selected' : ''}>${I18n.t('status_active')}</option>
                <option value="inactive" ${p.status === 'inactive' ? 'selected' : ''}>${I18n.t('status_inactive')}</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">${I18n.t('email_service_verified_emails')} *</label>
            <input type="text" class="form-input" id="es_verified_emails" value="${p.verified_emails || ''}" placeholder="${I18n.t('email_service_verified_emails_help')}">
        </div>`;
    },

    _bindProviderSwitch(forceProvider) {
        const select = document.getElementById('es_provider');
        if (!select) return;
        const provider = forceProvider || select.value;
        const isSmtp = provider === 'smtp';
        const apiFields = document.getElementById('es_api_fields');
        const smtpFields = document.getElementById('es_smtp_fields');
        if (apiFields) apiFields.style.display = isSmtp ? 'none' : 'block';
        if (smtpFields) smtpFields.style.display = isSmtp ? 'block' : 'none';
    },

    _saveForm(editingId) {
        const name = (document.getElementById('es_name').value || '').trim();
        const provider = document.getElementById('es_provider').value;
        if (!name) { App.showToast('error', I18n.t('email_service_name_required')); return false; }

        const isSmtp = provider === 'smtp';
        const apiKey = isSmtp ? '' : (document.getElementById('es_api_key').value || '').trim();
        const smtpHost = isSmtp ? (document.getElementById('es_smtp_host').value || '').trim() : '';
        const verifiedEmails = (document.getElementById('es_verified_emails').value || '').trim();

        if (!isSmtp && !apiKey) { App.showToast('error', I18n.t('email_service_api_key_required')); return false; }
        if (isSmtp && !smtpHost) { App.showToast('error', I18n.t('email_service_smtp_host_required')); return false; }
        // TODO: We could add translation for verified emails required, but basic fallback is enough.
        if (!verifiedEmails) { App.showToast('error', I18n.t('email_service_verified_emails')); return false; }

        const data = {
            name, provider, api_key: apiKey,
            smtp_host: smtpHost,
            smtp_port: isSmtp ? parseInt(document.getElementById('es_smtp_port').value) || 587 : 587,
            smtp_user: isSmtp ? document.getElementById('es_smtp_user').value : '',
            smtp_pass: isSmtp ? document.getElementById('es_smtp_pass').value : '',
            smtp_tls: isSmtp ? document.getElementById('es_smtp_tls').checked : true,
            verified_emails: verifiedEmails,
            status: document.getElementById('es_status').value
        };

        if (editingId) {
            MockData.updateEmailService(editingId, data);
            MockData.addAuditLog('UPDATE_EMAIL_SERVICE', `Updated email service: ${name}`);
            App.showToast('success', I18n.t('email_service_updated'));
        } else {
            MockData.addEmailService(data);
            MockData.addAuditLog('ADD_EMAIL_SERVICE', `Added email service: ${name}`);
            App.showToast('success', I18n.t('email_service_created'));
        }
        Router.refresh();
        return true;
    },

    deleteService(serviceId) {
        const svc = MockData.getEmailServiceById(serviceId);
        if (!svc) return;
        const result = MockData.deleteEmailService(serviceId);
        if (!result.ok) {
            if (result.reason === 'in_use') {
                App.showToast('error', I18n.t('email_service_in_use').replace('{company}', result.company));
            } else {
                App.showToast('error', I18n.t('error_generic'));
            }
            return;
        }
        MockData.addAuditLog('DELETE_EMAIL_SERVICE', `Deleted email service: ${svc.name}`);
        App.showToast('success', I18n.t('email_service_deleted'));
        Router.refresh();
    },

    testService(serviceId, btn) {
        const svc = MockData.getEmailServiceById(serviceId);
        if (!svc) return;
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span>⏳ ${I18n.t('testing_webhook')}</span>`;
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            // 模拟测试：检查凭证是否填写
            const hasCredentials = svc.provider === 'smtp' ? svc.smtp_host : svc.api_key;
            if (hasCredentials) {
                App.showToast('success', I18n.t('test_email_success').replace('{name}', svc.name));
            } else {
                App.showToast('error', I18n.t('test_email_failed'));
            }
        }, 1500);
    }
};
